import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ChevronDown,
    ChevronUp,
    MessageCircle,
    CheckCircle,
    XCircle,
    Send
} from 'lucide-react';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { fetchTeacherCourses } from '../api/teacher.api';
import { getQuestions, addAnswer, toggleStatus } from '../api/question.api';
import { config } from '../config';
import './TeacherPortal.css';

const BASE_URL = config.API_URL.replace('/api', '');

const TeacherCommunication = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState({});
    const [replyContent, setReplyContent] = useState({});
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchTeacherCourses();
                if (response.success && response.data.length > 0) {
                    setCourses(response.data);
                    setSelectedCourseId(response.data[0]._id);
                }
            } catch (error) {
                console.error("Failed to load courses", error);
            }
        };
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourseId) {
            const loadQuestions = async () => {
                setLoading(true);
                try {
                    const response = await getQuestions(selectedCourseId);
                    if (response.success) {
                        setQuestions(response.data);
                    }
                } catch (error) {
                    console.error("Failed to load questions", error);
                } finally {
                    setLoading(false);
                }
            };
            loadQuestions();
        }
    }, [selectedCourseId]);

    const toggleQuestion = (qId) => {
        setExpandedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const handleReplyChange = (qId, value) => {
        setReplyContent(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmitReply = async (qId) => {
        const content = replyContent[qId];
        if (!content || !content.trim()) return;
        try {
            const response = await addAnswer(qId, content);
            if (response.success) {
                setQuestions(prev => prev.map(q => q._id === qId ? response.data : q));
                setReplyContent(prev => ({ ...prev, [qId]: '' }));
            }
        } catch (error) {
            console.error("Failed to submit reply", error);
            alert("Failed to submit reply");
        }
    };

    const handleToggleStatus = async (qId, currentStatus) => {
        const newStatus = currentStatus === 'open' ? 'completed' : 'open';
        try {
            const response = await toggleStatus(qId, newStatus);
            if (response.success) {
                setQuestions(prev => prev.map(q => q._id === qId ? { ...q, status: newStatus } : q));
            }
        } catch (error) {
            console.error("Failed to toggle status", error);
            alert("Failed to update status");
        }
    };

    const filteredQuestions = questions.filter(q => {
        if (activeFilter === 'all') return true;
        return q.status === activeFilter;
    });

    return (
        <div className="tp-container">
            <TeacherSidebar />
            <main className="tp-main">
                <div className="tp-body">
                    {/* Page Header */}
                    <div className="tp-page-header">
                        <div className="tp-page-title">
                            <h1>Communication</h1>
                            <p>Answer student questions and manage discussions</p>
                        </div>
                        <div className="tp-course-selector">
                            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                                <option value="" disabled>Select Course</option>
                                {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="tp-select-arrow" />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tp-tabs">
                        <Link to="/teacher/communication" className="tp-tab active">Q & A</Link>
                        <Link to="/teacher/assignments" className="tp-tab">Assignments</Link>
                        <Link to="/teacher/announcements" className="tp-tab">Announcements</Link>
                    </div>

                    {/* Filter Pills */}
                    <div className="tp-filters">
                        {['all', 'open', 'completed'].map(f => (
                            <button key={f} className={`tp-filter-pill ${activeFilter === f ? 'active' : ''}`}
                                onClick={() => setActiveFilter(f)}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="tp-loading">Loading questions...</div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="tp-empty">
                            <MessageCircle size={48} strokeWidth={1} />
                            <h3>No questions found</h3>
                            <p>Questions from students will appear here.</p>
                        </div>
                    ) : (
                        <div className="tp-list">
                            {filteredQuestions.map((q, i) => {
                                const isOpen = expandedQuestions[q._id];
                                return (
                                    <div key={q._id} className="tp-list-card" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="tp-list-card-header" onClick={() => toggleQuestion(q._id)}>
                                            <div>
                                                <div className="tp-list-card-title">
                                                    <span className={`tp-status-badge ${q.status}`}>{q.status}</span>
                                                    <h3>{q.title}</h3>
                                                </div>
                                                <div className="tp-list-card-meta">
                                                    By {q.student?.name} ({q.student?.email}) • {new Date(q.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="tp-list-card-actions">
                                                <span className="tp-reply-count">
                                                    <MessageCircle size={16} /> {q.answers.length}
                                                </span>
                                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <div className="tp-expanded">
                                                <p className="tp-description">{q.description}</p>
                                                {q.imageUrl && (
                                                    <img
                                                        src={q.imageUrl.startsWith('http') ? q.imageUrl : `${BASE_URL}${q.imageUrl}`}
                                                        alt="Attachment"
                                                        className="tp-attachment-img"
                                                    />
                                                )}

                                                <div className="tp-action-bar">
                                                    <button className="tp-btn-secondary" onClick={() => handleToggleStatus(q._id, q.status)}>
                                                        {q.status === 'open' ? <CheckCircle size={16} color="#059669" /> : <XCircle size={16} color="#ef4444" />}
                                                        {q.status === 'open' ? 'Mark Completed' : 'Re-open'}
                                                    </button>
                                                </div>

                                                <div className="tp-discussion">
                                                    <h4>Discussion</h4>
                                                    {q.answers.map(ans => (
                                                        <div key={ans._id} className="tp-reply-item">
                                                            <div className={`tp-reply-avatar ${ans.user?.role === 'teacher' ? 'teacher' : 'student'}`}>
                                                                {ans.user?.image ? (
                                                                    <img
                                                                        src={ans.user.image.startsWith('http') ? ans.user.image : `${BASE_URL}${ans.user.image}`}
                                                                        alt={ans.user.name}
                                                                    />
                                                                ) : (
                                                                    ans.user?.name?.charAt(0) || 'U'
                                                                )}
                                                            </div>
                                                            <div className="tp-reply-bubble">
                                                                <div className="tp-reply-name">
                                                                    {ans.user?.name}
                                                                    {ans.user?.role === 'teacher' && <span className="tp-instructor-tag">Instructor</span>}
                                                                </div>
                                                                <p className="tp-reply-text">{ans.content}</p>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="tp-reply-input">
                                                        <input
                                                            type="text"
                                                            value={replyContent[q._id] || ''}
                                                            onChange={(e) => handleReplyChange(q._id, e.target.value)}
                                                            placeholder="Type your answer..."
                                                        />
                                                        <button className="tp-reply-btn" onClick={() => handleSubmitReply(q._id)}>
                                                            <Send size={16} /> Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherCommunication;
