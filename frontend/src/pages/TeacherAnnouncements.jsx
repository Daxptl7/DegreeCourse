import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTeacherCourses } from '../api/teacher.api';
import { createAnnouncement } from '../api/announcement.api';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { ChevronDown, Send, CheckCircle, AlertCircle } from 'lucide-react';
import './TeacherPortal.css';

const TeacherAnnouncements = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchTeacherCourses();
                if (response.success) {
                    setCourses(response.data);
                    if (response.data.length > 0) {
                        setSelectedCourse(response.data[0]._id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch courses", error);
            }
        };
        loadCourses();
    }, []);

    const handleAnnounce = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!selectedCourse) { setMessage({ type: 'error', text: 'Please select a course.' }); return; }
        if (!title.trim() || !content.trim()) { setMessage({ type: 'error', text: 'Please fill in all fields.' }); return; }
        try {
            setLoading(true);
            const response = await createAnnouncement(selectedCourse, title, content);
            if (response.success) {
                setMessage({ type: 'success', text: 'Announcement posted successfully!' });
                setTitle('');
                setContent('');
            }
        } catch (error) {
            console.error("Announcement failed", error);
            setMessage({ type: 'error', text: error.message || 'Failed to post announcement.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tp-container">
            <TeacherSidebar />
            <main className="tp-main">
                <div className="tp-body">
                    {/* Header */}
                    <div className="tp-page-header">
                        <div className="tp-page-title">
                            <h1>Announcements</h1>
                            <p>Post updates and important notices to your students</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tp-tabs">
                        <Link to="/teacher/communication" className="tp-tab">Q & A</Link>
                        <Link to="/teacher/assignments" className="tp-tab">Assignments</Link>
                        <Link to="/teacher/announcements" className="tp-tab active">Announcements</Link>
                    </div>

                    {/* Form */}
                    <div className="tp-form-container">
                        <h2 className="tp-form-title">📢 Make an Announcement</h2>

                        {message && (
                            <div className={`tp-alert ${message.type}`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleAnnounce}>
                            <div className="tp-form-group">
                                <label className="tp-form-label">Select Course</label>
                                <div className="tp-course-selector" style={{ minWidth: '100%' }}>
                                    <select className="tp-form-select" value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        style={{ appearance: 'none' }}>
                                        <option value="" disabled>Select a course...</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>{course.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={18} className="tp-select-arrow" />
                                </div>
                            </div>

                            <div className="tp-form-group">
                                <label className="tp-form-label">Title</label>
                                <input type="text" className="tp-form-input" placeholder="e.g. Exam Schedule Update"
                                    value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>

                            <div className="tp-form-group">
                                <label className="tp-form-label">Message</label>
                                <textarea className="tp-form-textarea" placeholder="Write your announcement here..."
                                    rows="6" value={content} onChange={(e) => setContent(e.target.value)} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" className="tp-btn-primary" disabled={loading}
                                    style={{ opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Posting...' : (<><Send size={18} /> Post Announcement</>)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherAnnouncements;
