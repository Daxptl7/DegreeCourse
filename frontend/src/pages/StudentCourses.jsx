import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyCourses } from '../api/student.api';
import { getUnreadCounts } from '../api/announcement.api';
import { Video, ChevronRight, Hash, Bell, BookOpen, Clock, Users } from 'lucide-react';
import { io } from 'socket.io-client';
import { config } from '../config';
import './StudentPortal.css';

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();
    const socketRef = useRef();

    useEffect(() => {
        // Fetch enrolled courses
        const fetchCourses = async () => {
            try {
                const response = await fetchMyCourses();
                if (response.success) {
                    setCourses(response.data);

                    // Fetch unread counts
                    const courseIds = response.data.map(c => c._id);
                    if (courseIds.length > 0) {
                        const countRes = await getUnreadCounts(courseIds);
                        if (countRes.success) {
                            setUnreadCounts(countRes.data);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();

        // Socket connection for live status
        socketRef.current = io(config.SOCKET_URL);

        return () => socketRef.current.disconnect();
    }, []);

    const handleJoinLive = (e) => {
        e.preventDefault();
        if (!joinCode.trim()) return;

        socketRef.current.emit('check-live-status', joinCode, (response) => {
            if (response.isLive) {
                navigate(`/live/${joinCode}`);
            } else {
                alert("No live session found with this code, or session has ended.");
            }
        });
    };

    if (loading) {
        return (
            <div className="sp-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading your courses...</div>
            </div>
        );
    }

    return (
        <div className="sp-container">
            <div className="sp-body">
                <div className="sp-page-header">
                    <div className="sp-page-title">
                        <h1>My Learning</h1>
                        <p>Manage your courses and join live sessions</p>
                    </div>

                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="sp-btn-primary live-btn"
                    >
                        <Video size={20} />
                        Join Live Class
                    </button>
                </div>

                {courses.length === 0 ? (
                    <div className="sp-empty">
                        <BookOpen size={64} strokeWidth={1} style={{ opacity: 0.5 }} />
                        <h3>No courses enrolled yet</h3>
                        <p>Explore our catalog to start learning today</p>
                        <button onClick={() => navigate('/courses')} className="sp-btn-primary">
                            Browse Courses
                        </button>
                    </div>
                ) : (
                    <div className="sp-course-grid">
                        {courses.map(course => (
                            <div key={course._id} className="sp-course-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/course/${course.slug}`)}>
                                <div className="sp-course-thumb">
                                    <img src={course.thumbnail || '/placeholder-course.jpg'} alt={course.name} />
                                    <span className="sp-course-category">
                                        {course.category || 'Development'}
                                    </span>
                                </div>

                                <div className="sp-course-info">
                                    <h3 className="sp-course-name">{course.name}</h3>
                                    <p className="sp-course-desc">{course.description || "No description available for this course."}</p>

                                    {unreadCounts[course._id] > 0 && (
                                        <div className="sp-unread-badge">
                                            <Bell size={14} strokeWidth={3} />
                                            {unreadCounts[course._id]} New Announcement{unreadCounts[course._id] > 1 ? 's' : ''}
                                        </div>
                                    )}

                                    <div className="sp-course-footer">
                                        <div className="sp-course-instructor">
                                            <div className="sp-instructor-avatar">
                                                {course.instructor?.name?.[0] || 'I'}
                                            </div>
                                            <span>{course.instructor?.name || 'Instructor'}</span>
                                        </div>
                                        <div className="sp-course-link">
                                            Continue <ChevronRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Join Modal */}
            {showJoinModal && (
                <div className="sp-modal-overlay">
                    <div className="sp-modal">
                        <button onClick={() => setShowJoinModal(false)} className="sp-modal-close">
                            ✕
                        </button>

                        <div className="sp-modal-icon">
                            <Video size={36} />
                        </div>
                        <h2>Join Live Session</h2>
                        <p>Enter the 8-character code shared by your instructor</p>

                        <form onSubmit={handleJoinLive}>
                            <div className="sp-form-input-group">
                                <label>Meeting Code</label>
                                <Hash size={18} className="sp-input-icon" />
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="e.g. 8a2f-b4c9"
                                    className="sp-input"
                                    required
                                />
                            </div>

                            <button type="submit" className="sp-btn-primary sp-btn-block live-btn">
                                Join Now
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentCourses;
