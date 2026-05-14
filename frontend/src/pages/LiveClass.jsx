import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    Video, Mic, MicOff, VideoOff, PhoneOff, Send,
    MessageSquare, Users, Settings, Share, MoreVertical,
    Maximize2, Copy, Check, UserCheck, Circle, Square
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';

const peerConfigConnections = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

const isInstructorRole = (role) =>
    role === 'teacher' || role === 'admin' || role === 'super_admin' || role === 'moderator';

const mapChatRow = (row, mySocketId) => ({
    id: row.id,
    user: row.senderName || 'User',
    text: row.text,
    time: new Date(row.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSelf: row.senderSocketId === mySocketId
});

const LiveClass = () => {
    const { roomId } = useParams();
    const { user } = useAuth() || {};
    const navigate = useNavigate();

    const [stream, setStream] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showChat, setShowChat] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [peerData, setPeerData] = useState({});
    const [copied, setCopied] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [sessionEnded, setSessionEnded] = useState(false);
    const [waitingForAdmit, setWaitingForAdmit] = useState(false);
    const [pendingJoins, setPendingJoins] = useState([]);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    const socketRef = useRef(null);
    const connections = useRef({});
    const [videos, setVideos] = useState([]);
    const seenChatIds = useRef(new Set());
    const isHostRef = useRef(false);
    const skipNextSessionEndedEvent = useRef(false);

    useEffect(() => {
        isHostRef.current = isHost;
    }, [isHost]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const leaveRoom = useCallback(
        (to) => {
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            Object.values(connections.current).forEach((c) => c.close());
            connections.current = {};
            if (window.localStream) {
                window.localStream.getTracks().forEach((t) => t.stop());
                window.localStream = null;
            }
            setStream(null);
            setVideos([]);
            setMessages([]);
            seenChatIds.current = new Set();
            setWaitingForAdmit(false);
            setPendingJoins([]);
            if (typeof to === 'number') navigate(to);
            else navigate(to);
        },
        [navigate]
    );

    useEffect(() => {
        if (!user?._id) return undefined;
        if (!roomId) return undefined;

        let cancelled = false;
        seenChatIds.current = new Set();

        const socket = io(config.SOCKET_URL, {
            auth: { token: localStorage.getItem('token') || '' },
            transports: ['websocket', 'polling'],
            reconnection: false
        });
        socketRef.current = socket;

        const ingestChatRow = (row) => {
            if (!row?.id || seenChatIds.current.has(row.id)) return;
            seenChatIds.current.add(row.id);
            setMessages((prev) => [
                ...prev,
                mapChatRow(row, socket.id)
            ]);
        };

        const handleChatHistory = (rows) => {
            if (!Array.isArray(rows)) return;
            const mapped = [];
            rows.forEach((row) => {
                if (row?.id && !seenChatIds.current.has(row.id)) {
                    seenChatIds.current.add(row.id);
                    mapped.push(mapChatRow(row, socket.id));
                }
            });
            setMessages(mapped);
        };

        const handleChatMessage = (row) => {
            if (typeof row === 'object' && row !== null && row.id) {
                ingestChatRow(row);
            }
        };

        const handleUserLeft = (id) => {
            setVideos((v) => v.filter((video) => video.socketId !== id));
            if (connections.current[id]) {
                connections.current[id].close();
                delete connections.current[id];
            }
            setPeerData((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        };

        const handleUserJoined = (joinerId, clientList) => {
            if (!Array.isArray(clientList)) return;

            setPeerData((prev) => {
                const merged = { ...prev };
                clientList.forEach((c) => {
                    merged[c.socketId] = {
                        name: c.name ?? merged[c.socketId]?.name ?? 'User',
                        role: c.role ?? merged[c.socketId]?.role ?? 'student',
                        userId: c.userId ?? merged[c.socketId]?.userId
                    };
                });
                return merged;
            });

            clientList.forEach((client) => {
                const peerId = client.socketId;
                if (peerId === socket.id) return;
                if (connections.current[peerId]) return;

                const pc = new RTCPeerConnection(peerConfigConnections);
                connections.current[peerId] = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate != null) {
                        socket.emit('signal', peerId, JSON.stringify({ ice: event.candidate }));
                    }
                };

                pc.ontrack = (event) => {
                    const remoteStream = event.streams[0];
                    setVideos((prev) => {
                        if (prev.find((v) => v.socketId === peerId)) return prev;
                        return [...prev, { socketId: peerId, stream: remoteStream }];
                    });
                };

                if (window.localStream) {
                    window.localStream.getTracks().forEach((track) => {
                        pc.addTrack(track, window.localStream);
                    });
                }

                if (joinerId === socket.id) {
                    pc.createOffer()
                        .then((d) => pc.setLocalDescription(d))
                        .then(() => {
                            socket.emit('signal', peerId, JSON.stringify({ sdp: pc.localDescription }));
                        })
                        .catch(() => {});
                }
            });
        };

        const handleSignal = (fromId, message) => {
            let signal;
            try {
                signal = JSON.parse(message);
            } catch {
                return;
            }

            if (!connections.current[fromId]) {
                const pc = new RTCPeerConnection(peerConfigConnections);
                connections.current[fromId] = pc;

                pc.onicecandidate = (event) => {
                    if (event.candidate != null) {
                        socket.emit('signal', fromId, JSON.stringify({ ice: event.candidate }));
                    }
                };

                pc.ontrack = (event) => {
                    const remoteStream = event.streams[0];
                    setVideos((prev) => {
                        if (prev.find((v) => v.socketId === fromId)) return prev;
                        return [...prev, { socketId: fromId, stream: remoteStream }];
                    });
                };

                if (window.localStream) {
                    window.localStream.getTracks().forEach((track) => {
                        pc.addTrack(track, window.localStream);
                    });
                }
            }

            const pc = connections.current[fromId];
            if (!pc) return;

            if (signal.sdp) {
                pc.setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === 'offer') {
                            return pc.createAnswer().then((d) => pc.setLocalDescription(d));
                        }
                        return undefined;
                    })
                    .then(() => {
                        if (signal.sdp.type === 'offer') {
                            socket.emit('signal', fromId, JSON.stringify({ sdp: pc.localDescription }));
                        }
                    })
                    .catch(() => {});
            }

            if (signal.ice) {
                pc.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(() => {});
            }
        };

        const handleSessionEnded = ({ reason } = {}) => {
            if (cancelled) return;
            if (skipNextSessionEndedEvent.current) {
                skipNextSessionEndedEvent.current = false;
                return;
            }
            setSessionEnded(true);
            const msg =
                reason === 'host_left'
                    ? 'The host has left. This live class has ended.'
                    : reason === 'signed_in_elsewhere'
                      ? 'You opened this class in another tab or device.'
                      : 'This live class has ended.';
            window.alert(msg);
            leaveRoom('/my-courses');
        };

        const handleError = (err) => {
            const text = typeof err === 'string' ? err : 'Unable to join this live class.';
            window.alert(text);
            leaveRoom('/my-courses');
        };

        const handleRoomJoined = (payload) => {
            if (payload?.isHost) setIsHost(true);
            else setIsHost(false);
        };

        const handleJoinQueued = () => {
            setWaitingForAdmit(true);
        };

        const handleJoinAdmitted = () => {
            setWaitingForAdmit(false);
        };

        const handlePendingJoinUpdated = ({ pending }) => {
            setPendingJoins(Array.isArray(pending) ? pending : []);
        };

        socket.on('chat-history', handleChatHistory);
        socket.on('chat-message', handleChatMessage);
        socket.on('user-left', handleUserLeft);
        socket.on('user-joined', handleUserJoined);
        socket.on('signal', handleSignal);
        socket.on('live-session-ended', handleSessionEnded);
        socket.on('error', handleError);
        socket.on('room-joined', handleRoomJoined);
        socket.on('join-queued', handleJoinQueued);
        socket.on('join-admitted', handleJoinAdmitted);
        socket.on('pending-join-updated', handlePendingJoinUpdated);

        const run = async () => {
            try {
                const currentStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                if (cancelled) {
                    currentStream.getTracks().forEach((t) => t.stop());
                    return;
                }
                window.localStream = currentStream;
                setStream(currentStream);

                const runJoin = () => {
                    if (cancelled) return;
                    socket.emit('join-call', roomId, null, (ack) => {
                        if (cancelled) return;
                        if (ack?.mode === 'waiting') setWaitingForAdmit(true);
                        else setWaitingForAdmit(false);
                    });
                };
                if (socket.connected) runJoin();
                else socket.once('connect', runJoin);
            } catch (err) {
                console.error('Error accessing media devices:', err);
                window.alert('Could not access camera or microphone.');
                leaveRoom('/my-courses');
            }
        };

        run();

        return () => {
            cancelled = true;
            if (isHostRef.current) {
                socket.emit('end-live-session', { roomId });
            }
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            Object.values(connections.current).forEach((c) => c.close());
            connections.current = {};
            if (window.localStream) {
                window.localStream.getTracks().forEach((t) => t.stop());
                window.localStream = null;
            }
        };
    }, [roomId, user?._id, leaveRoom]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current?.connected || waitingForAdmit) return;
        socketRef.current.emit('chat-message', { text: newMessage });
        setNewMessage('');
    };

    const toggleMute = () => {
        if (stream?.getAudioTracks()[0]) {
            const enabled = stream.getAudioTracks()[0].enabled;
            stream.getAudioTracks()[0].enabled = !enabled;
            setIsMuted(!enabled);
        }
    };

    const toggleVideo = () => {
        if (stream?.getVideoTracks()[0]) {
            const enabled = stream.getVideoTracks()[0].enabled;
            stream.getVideoTracks()[0].enabled = !enabled;
            setIsVideoOff(!enabled);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEndCall = () => {
        if (socketRef.current?.connected && isHost) {
            skipNextSessionEndedEvent.current = true;
            socketRef.current.emit('end-live-session', { roomId });
        }
        leaveRoom(-1);
    };

    const handleAdmit = (targetSocketId) => {
        if (!socketRef.current?.connected || !roomId || !targetSocketId) return;
        socketRef.current.emit('live-admit', { roomId, targetSocketId });
    };

    const toggleRecording = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
            setIsRecording(false);
            return;
        }

        try {
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: true
            });

            // --- AUDIO MIXING MAGIC ---
            // MediaRecorder only records ONE audio track by default. 
            // We must use the Web Audio API to combine the Screen Audio (students) + Local Mic (instructor).
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const destination = audioCtx.createMediaStreamDestination();

            // 1. Add Screen Audio (if the user checked "Share Tab Audio")
            if (displayStream.getAudioTracks().length > 0) {
                const screenSource = audioCtx.createMediaStreamSource(new MediaStream([displayStream.getAudioTracks()[0]]));
                screenSource.connect(destination);
            }

            // 2. Add Local Microphone Audio
            if (window.localStream && window.localStream.getAudioTracks().length > 0) {
                const micSource = audioCtx.createMediaStreamSource(new MediaStream([window.localStream.getAudioTracks()[0]]));
                micSource.connect(destination);
            }

            // Combine the video track from screen share with our new mixed audio track
            const mixedStream = new MediaStream([
                displayStream.getVideoTracks()[0],
                destination.stream.getAudioTracks()[0]
            ]);
            // --------------------------

            // Determine supported mimeType (Chrome vs Safari)
            const mimeType = MediaRecorder.isTypeSupported('video/webm') 
                ? 'video/webm' 
                : 'video/mp4';

            const mediaRecorder = new MediaRecorder(mixedStream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Live-Class-${roomId}-${new Date().getTime()}.${mimeType === 'video/mp4' ? 'mp4' : 'webm'}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                setIsRecording(false);
            };

            // Handle user clicking "Stop sharing" on the native browser bar
            displayStream.getVideoTracks()[0].onended = () => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting screen record:", err);
            setIsRecording(false);
        }
    };

    if (!user?._id) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 p-8">
                <div className="max-w-md text-center space-y-4">
                    <p className="text-gray-700">Sign in to join a live class.</p>
                    <Link to="/login" className="text-indigo-600 font-semibold underline">
                        Go to login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex h-full w-full bg-gray-50 text-gray-900 overflow-hidden font-sans transition-colors duration-300">

            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
            </div>

            {waitingForAdmit && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-6">
                    <div className="max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-gray-100 text-center">
                        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                            <Users size={28} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Waiting for the host</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            You are in the meeting lobby. The instructor will admit you shortly. Keep this page open.
                        </p>
                    </div>
                </div>
            )}

            <div className={`flex-1 flex flex-col relative z-10 transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${showChat ? 'mr-[380px]' : 'mr-0'}`}>

                <div className="h-24 px-8 flex items-center justify-between z-20">
                    <div className="glass-panel-light px-6 py-3 rounded-2xl flex items-center gap-5 shadow-lg shadow-gray-200/50 border border-white/60 bg-white/70 backdrop-blur-md group hover:border-gray-200 transition-all duration-300">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Video size={22} className="text-white" />
                            </div>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                            </span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Live class</h1>
                            <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                <span className="px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 tracking-wider">LIVE</span>
                                <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                {sessionEnded && <span className="text-amber-600">Ending…</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass-panel-light px-5 py-2.5 rounded-xl flex items-center gap-4 text-gray-600 bg-white/70 backdrop-blur-md border border-white/60 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-indigo-500" />
                                <span className="text-sm font-bold text-gray-800">
                                    {waitingForAdmit ? '—' : videos.length + 1}
                                </span>
                                {isHost && pendingJoins.length > 0 && (
                                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                        {pendingJoins.length} waiting
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleCopyCode}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors border border-transparent"
                                title="Copy Meeting Code"
                            >
                                {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                <span className="text-xs font-mono">{roomId}</span>
                            </button>

                            <span className="w-px h-4 bg-gray-300" />
                            <span className="text-sm font-mono tracking-wider text-gray-500">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {!showChat && (
                            <button
                                type="button"
                                onClick={() => setShowChat(true)}
                                className="p-3.5 bg-white hover:bg-gray-50 text-indigo-600 rounded-xl shadow-lg shadow-gray-200/50 transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-100"
                            >
                                <MessageSquare size={20} className="fill-current" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 px-8 pb-8 overflow-y-auto custom-scrollbar-light">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full content-center max-w-[1600px] mx-auto">

                        <div className="relative group rounded-[2rem] overflow-hidden aspect-video shadow-xl bg-white border border-white ring-1 ring-gray-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-indigo-500/10 hover:border-indigo-100">
                            {stream ? (
                                <VideoPlayer stream={stream} isMuted={true} />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                    <div className="relative w-16 h-16 mb-4">
                                        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <span className="text-sm font-medium tracking-wide">INITIALIZING FEED</span>
                                </div>
                            )}

                            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 shadow-sm border border-white/50">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <span className="text-xs font-bold text-gray-800 tracking-wide">
                                        {isInstructorRole(user?.role) ? 'INSTRUCTOR (YOU)' : 'STUDENT (YOU)'}
                                    </span>
                                </div>
                                {isMuted && (
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center shadow-sm animate-pulse">
                                        <MicOff size={14} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {videos.map((video) => {
                            const role = peerData[video.socketId]?.role;
                            const name = peerData[video.socketId]?.name || 'User';
                            const remoteInstructor = isInstructorRole(role);

                            return (
                                <div key={video.socketId} className="relative group rounded-[2rem] overflow-hidden aspect-video shadow-xl bg-white border border-white ring-1 ring-gray-100 transition-all duration-500 hover:scale-[1.02] hover:shadow-purple-500/10 hover:border-purple-100">
                                    <VideoPlayer stream={video.stream} />
                                    <div className="absolute bottom-5 left-5">
                                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-white/50">
                                            <span className={`text-xs font-bold tracking-wide ${remoteInstructor ? 'text-indigo-600' : 'text-gray-800'}`}>
                                                {remoteInstructor ? 'INSTRUCTOR' : 'STUDENT'} — {name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                    <div className="bg-white/80 backdrop-blur-xl p-2 rounded-3xl shadow-2xl shadow-gray-200/50 flex items-center gap-2 border border-white/50 scale-100 hover:scale-[1.01] transition-transform duration-300">
                        <ControlBtn
                            onClick={toggleMute}
                            active={!isMuted}
                            onIcon={<Mic size={20} />}
                            offIcon={<MicOff size={20} />}
                            activeClass="bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-sm"
                            offClass="bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                        />
                        <ControlBtn
                            onClick={toggleVideo}
                            active={!isVideoOff}
                            onIcon={<Video size={20} />}
                            offIcon={<VideoOff size={20} />}
                            activeClass="bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-sm"
                            offClass="bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 ring-2 ring-red-500/20"
                        />

                        <div className="w-px h-10 bg-gray-200 mx-2" />

                        {isInstructorRole(user?.role) && (
                            <ControlBtn
                                onClick={toggleRecording}
                                active={isRecording}
                                onIcon={<Square size={20} className="fill-current" />}
                                offIcon={<Circle size={20} className="fill-current" />}
                                activeClass="bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                                offClass="bg-gray-100 hover:bg-gray-200 text-red-500 shadow-sm"
                                tooltip={isRecording ? "Stop Recording" : "Record Session"}
                            />
                        )}
                        <ControlBtn onClick={() => {}} icon={<Share size={20} />} tooltip="Share Screen" />
                        <ControlBtn onClick={() => {}} icon={<Settings size={20} />} tooltip="Settings" />
                        <ControlBtn onClick={() => {}} icon={<Maximize2 size={20} />} tooltip="Fullscreen" />

                        <div className="w-px h-10 bg-gray-200 mx-2" />

                        <button
                            type="button"
                            onClick={handleEndCall}
                            className="h-14 px-8 rounded-2xl bg-white border-2 border-red-500 hover:bg-red-50 text-red-600 flex items-center gap-2.5 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 group"
                        >
                            <PhoneOff size={20} className="group-hover:animate-pulse" />
                            <span className="font-bold text-sm tracking-wide">{isHost ? 'END MEETING' : 'LEAVE'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`fixed right-0 top-0 h-full w-[380px] bg-white/95 backdrop-blur-2xl border-l border-gray-100 shadow-[-20px_0_100px_rgba(0,0,0,0.05)] transform transition-transform duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-40 flex flex-col ${showChat ? 'translate-x-0' : 'translate-x-full'}`}>

                <div className="h-24 flex items-center justify-between px-8 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-transparent">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Live Chat</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <span className="text-xs font-medium text-gray-400">In-room messages</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowChat(false)}
                        className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all duration-200"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>

                {isHost && (
                    <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/80">
                        <p className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">Join requests</p>
                        {pendingJoins.length === 0 ? (
                            <p className="text-xs text-amber-800/80">No students are waiting in the lobby.</p>
                        ) : (
                            <ul className="space-y-2">
                                {pendingJoins.map((p) => (
                                    <li
                                        key={p.socketId}
                                        className="flex items-center justify-between gap-2 rounded-xl bg-white border border-amber-100 px-3 py-2"
                                    >
                                        <span className="text-sm font-medium text-gray-800 truncate">{p.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleAdmit(p.socketId)}
                                            className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-indigo-700"
                                        >
                                            <UserCheck size={14} />
                                            Admit
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar-light">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-80">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                                <MessageSquare size={32} className="stroke-[1.5]" />
                            </div>
                            <p className="text-sm font-medium">No messages yet</p>
                            <p className="text-xs opacity-75 mt-1">Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`group flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                <div className="flex items-end gap-3 max-w-[85%]">
                                    {!msg.isSelf && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-100 to-fuchsia-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-violet-600 shadow-sm ring-2 ring-white">
                                            {(msg.user || '?')[0]}
                                        </div>
                                    )}
                                    <div>
                                        {!msg.isSelf && <p className="text-[10px] text-gray-400 mb-1 ml-1">{msg.user}</p>}
                                        <div
                                            className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                msg.isSelf
                                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm shadow-indigo-200'
                                                    : 'bg-white text-gray-600 rounded-bl-sm border border-gray-100 shadow-gray-200/50'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] text-gray-400 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {msg.time}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                    <form onSubmit={sendMessage} className="relative group">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={waitingForAdmit ? 'Admitted students can chat here…' : 'Type a message...'}
                            disabled={waitingForAdmit}
                            className="w-full bg-white text-gray-800 text-sm rounded-2xl py-4 pl-5 pr-14 border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-gray-400 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl opacity-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-200"
                        >
                            <Send size={18} className="fill-current" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ControlBtn = ({ onClick, active = true, onIcon, offIcon, icon, activeClass, offClass, tooltip }) => {
    const baseClass =
        'h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 group relative';
    const defaultClass =
        'bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`${baseClass} ${onIcon ? (active ? activeClass : offClass) : defaultClass}`}
            title={tooltip}
        >
            {onIcon ? (active ? onIcon : offIcon) : icon}
        </button>
    );
};

export default LiveClass;
