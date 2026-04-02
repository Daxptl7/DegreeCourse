import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTeacherCourses } from '../api/teacher.api';
import { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement } from '../api/announcement.api';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { ChevronDown, Send, CheckCircle, AlertCircle, Edit2, Trash2, X } from 'lucide-react';
import './TeacherPortal.css';

const TeacherAnnouncements = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    // New state for existing announcements
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);

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

    // Fetch announcements when course changes
    useEffect(() => {
        if (!selectedCourse) return;
        
        const loadAnnouncements = async () => {
            setAnnouncementsLoading(true);
            try {
                const response = await getAnnouncements(selectedCourse);
                if (response.success) {
                    setAnnouncements(response.data);
                }
            } catch (err) {
                console.error("Failed to fetch existing announcements", err);
            } finally {
                setAnnouncementsLoading(false);
            }
        };

        loadAnnouncements();
        // Reset editing state when switching courses
        cancelEdit();
    }, [selectedCourse]);

    const handleAnnounce = async (e) => {
        e.preventDefault();
        setMessage(null);
        if (!selectedCourse) { setMessage({ type: 'error', text: 'Please select a course.' }); return; }
        if (!title.trim() || !content.trim()) { setMessage({ type: 'error', text: 'Please fill in all fields.' }); return; }
        
        try {
            setLoading(true);
            
            if (editingId) {
                const response = await updateAnnouncement(editingId, title, content);
                if (response.success) {
                    setMessage({ type: 'success', text: 'Announcement updated successfully!' });
                    // Update list in place
                    setAnnouncements(prev => prev.map(a => a._id === editingId ? response.data : a));
                    cancelEdit();
                }
            } else {
                const response = await createAnnouncement(selectedCourse, title, content);
                if (response.success) {
                    setMessage({ type: 'success', text: 'Announcement posted successfully!' });
                    // Add new at the top
                    setAnnouncements([response.data, ...announcements]);
                    setTitle('');
                    setContent('');
                }
            }
        } catch (error) {
            console.error("Announcement failed", error);
            setMessage({ type: 'error', text: error.message || 'Failed to post announcement.' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ann) => {
        setEditingId(ann._id);
        setTitle(ann.title);
        setContent(ann.content);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle('');
        setContent('');
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement? This cannot be undone.")) return;
        
        try {
            const response = await deleteAnnouncement(id);
            if (response.success) {
                setAnnouncements(prev => prev.filter(a => a._id !== id));
                if (editingId === id) cancelEdit();
                setMessage({ type: 'success', text: 'Announcement deleted.' });
            }
        } catch (error) {
            console.error("Delete failed", error);
            setMessage({ type: 'error', text: error.message || 'Failed to delete.' });
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
                            <p>Post updates, edit existing notices, and manage communication</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tp-tabs">
                        <Link to="/teacher/communication" className="tp-tab">Q & A</Link>
                        <Link to="/teacher/assignments" className="tp-tab">Assignments</Link>
                        <Link to="/teacher/announcements" className="tp-tab active">Announcements</Link>
                    </div>

                    <div className="tp-split-layout">
                        {/* LEFT FORM */}
                        <div className="tp-form-container" style={{ flex: 1, height: 'fit-content' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 className="tp-form-title" style={{ margin: 0 }}>
                                    {editingId ? '✏️ Edit Announcement' : '📢 Make an Announcement'}
                                </h2>
                                {editingId && (
                                    <button onClick={cancelEdit} className="btn-cancel-edit tp-btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                        <X size={14} style={{ marginRight: '4px' }}/> Cancel Edit
                                    </button>
                                )}
                            </div>

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
                                            style={{ appearance: 'none' }}
                                            disabled={editingId !== null} // Lock course switching while editing
                                        >
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
                                        value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>

                                <div className="tp-form-group">
                                    <label className="tp-form-label">Message</label>
                                    <textarea className="tp-form-textarea" placeholder="Write your announcement here..."
                                        rows="6" value={content} onChange={(e) => setContent(e.target.value)} required />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="tp-btn-primary" disabled={loading}
                                        style={{ opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Processing...' : (
                                            <>
                                                {editingId ? <CheckCircle size={18} /> : <Send size={18} />} 
                                                {editingId ? 'Update Announcement' : 'Post Announcement'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* RIGHT LIST */}
                        <div className="tp-recent-announcements" style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
                                Recent Announcements
                            </h2>

                            {!selectedCourse ? (
                                <div className="tp-empty-state-list">Please select a course to view announcements.</div>
                            ) : announcementsLoading ? (
                                <div className="tp-empty-state-list">Loading...</div>
                            ) : announcements.length === 0 ? (
                                <div className="tp-empty-state-list">No announcements posted for this course yet.</div>
                            ) : (
                                <div className="tp-announcements-list">
                                    {announcements.map(ann => (
                                        <div key={ann._id} className={`tp-announcement-card ${editingId === ann._id ? 'editing' : ''}`} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '1rem', transition: 'all 0.2s ease', position: 'relative', boxShadow: editingId === ann._id ? '0 0 0 2px #A6192E' : '0 4px 6px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: '#111827' }}>{ann.title}</h3>
                                                <div className="tp-announcement-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => handleEdit(ann)} className="tp-icon-btn edit-btn" title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(ann._id)} className="tp-icon-btn delete-btn" title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p style={{ margin: '0 0 1rem 0', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{ann.content}</p>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                Posted on {new Date(ann.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherAnnouncements;
