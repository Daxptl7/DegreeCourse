import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    ChevronDown,
    Plus,
    FileText,
    Calendar,
    Upload,
    X,
    Download,
    User
} from 'lucide-react';
import TeacherSidebar from '../../components/teacher/TeacherSidebar';
import { fetchTeacherCourses } from '../../api/teacher.api';
import { createAssignment, getAssignments, getSubmissions } from '../../api/assignment.api';
import { config } from '../../config';
import './TeacherPortal.css';

const BASE_URL = config.API_URL.replace('/api', '');

const TeacherAssignments = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [currentAssignmentTitle, setCurrentAssignmentTitle] = useState('');
    const [formData, setFormData] = useState({
        title: '', description: '', dueDate: '', assignmentFile: null
    });
    const [searchQuery, setSearchQuery] = useState('');

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
            const loadAssignments = async () => {
                setLoading(true);
                try {
                    const response = await getAssignments(selectedCourseId);
                    if (response.success) setAssignments(response.data);
                } catch (error) {
                    console.error("Failed to load assignments", error);
                } finally {
                    setLoading(false);
                }
            };
            loadAssignments();
        }
    }, [selectedCourseId]);

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCourseId) { alert("Please select a course first"); return; }
        try {
            setCreateLoading(true);
            const data = new FormData();
            data.append('courseId', selectedCourseId);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('dueDate', formData.dueDate);
            if (formData.assignmentFile) data.append('assignmentFile', formData.assignmentFile);
            const response = await createAssignment(data);
            if (response.success) {
                alert("Assignment created successfully");
                setIsModalOpen(false);
                setFormData({ title: '', description: '', dueDate: '', assignmentFile: null });
                const refreshed = await getAssignments(selectedCourseId);
                if (refreshed.success) setAssignments(refreshed.data);
            }
        } catch (error) {
            console.error("Failed to create assignment", error);
            alert("Failed to create assignment");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleViewSubmissions = async (assignmentId, title) => {
        setCurrentAssignmentTitle(title);
        setIsSubmissionModalOpen(true);
        setSubmissionsLoading(true);
        try {
            const response = await getSubmissions(assignmentId);
            if (response.success) setSubmissions(response.data);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
            alert("Failed to load submissions");
        } finally {
            setSubmissionsLoading(false);
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
                            <h1>Assignments</h1>
                            <p>Create, manage, and review student assignments</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div className="tp-course-selector">
                                <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}>
                                    <option value="" disabled>Select Course</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="tp-select-arrow" />
                            </div>
                            <button className="tp-btn-primary" onClick={() => setIsModalOpen(true)}>
                                <Plus size={18} /> Create Assignment
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="tp-tabs">
                        <Link to="/teacher/communication" className="tp-tab">Q & A</Link>
                        <Link to="/teacher/assignments" className="tp-tab active">Assignments</Link>
                        <Link to="/teacher/announcements" className="tp-tab">Announcements</Link>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="tp-loading">Loading assignments...</div>
                    ) : assignments.length === 0 ? (
                        <div className="tp-empty">
                            <FileText size={48} strokeWidth={1} />
                            <h3>No assignments yet</h3>
                            <p>Create your first assignment for this course.</p>
                            <button className="tp-btn-primary" onClick={() => setIsModalOpen(true)}>
                                <Plus size={16} /> Create Assignment
                            </button>
                        </div>
                    ) : (
                        <div className="tp-list">
                            {assignments.map((assign, i) => (
                                <div key={assign._id} className="tp-list-card tp-card-padded" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 className="tp-assignment-title">{assign.title}</h3>
                                        <span className="tp-assignment-date">
                                            <Calendar size={14} /> Due: {new Date(assign.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="tp-assignment-desc">{assign.description}</p>

                                    <div className="tp-assignment-footer">
                                        <div>
                                            {assign.fileUrl && (
                                                <a href={assign.fileUrl.startsWith('http') ? assign.fileUrl : `${BASE_URL}${assign.fileUrl}`}
                                                    target="_blank" rel="noopener noreferrer" className="tp-download-link">
                                                    <Download size={14} /> Attached File
                                                </a>
                                            )}
                                        </div>
                                        <button className="tp-btn-secondary" onClick={() => handleViewSubmissions(assign._id, assign.title)}>
                                            View Submissions
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Create Assignment Modal */}
            {isModalOpen && (
                <div className="tp-modal-overlay">
                    <div className="tp-modal">
                        <div className="tp-modal-header">
                            <h2>Create Assignment</h2>
                            <button className="tp-modal-close" onClick={() => setIsModalOpen(false)}><X size={22} /></button>
                        </div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="tp-form-group">
                                <label className="tp-form-label">Title</label>
                                <input type="text" className="tp-form-input" placeholder="Assignment Title" required
                                    value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="tp-form-group">
                                <label className="tp-form-label">Description</label>
                                <textarea className="tp-form-textarea" placeholder="Instructions for students..." required
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="tp-form-group">
                                <label className="tp-form-label">Due Date</label>
                                <input type="datetime-local" className="tp-form-input" required
                                    value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                            </div>
                            <div className="tp-form-group">
                                <label className="tp-form-label">Attachment (Optional)</label>
                                <div className="tp-file-upload">
                                    <input type="file" id="assignment-file-upload"
                                        onChange={(e) => setFormData({ ...formData, assignmentFile: e.target.files[0] })} />
                                    <label htmlFor="assignment-file-upload">
                                        <Upload size={24} color="#9ca3af" />
                                        <span className="tp-file-name">
                                            {formData.assignmentFile ? formData.assignmentFile.name : 'Click to upload file'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="tp-btn-primary" disabled={createLoading}
                                style={{ width: '100%', justifyContent: 'center', opacity: createLoading ? 0.7 : 1 }}>
                                {createLoading ? 'Creating...' : 'Create Assignment'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Submissions Modal */}
            {isSubmissionModalOpen && (
                <div className="tp-modal-overlay">
                    <div className="tp-modal extra-wide">
                        <div className="tp-modal-header">
                            <div>
                                <h2>Submissions ({submissions.length})</h2>
                                <p>{currentAssignmentTitle}</p>
                            </div>
                            <button className="tp-modal-close" onClick={() => { setIsSubmissionModalOpen(false); setSearchQuery(''); }}><X size={22} /></button>
                        </div>
                        
                        {submissions.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search by student name or email..."
                                    className="tp-form-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ background: '#f9fafb', border: '1px solid #e5e7eb', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}
                                />
                            </div>
                        )}

                        {submissionsLoading ? (
                            <div className="tp-loading">Loading submissions...</div>
                        ) : submissions.length === 0 ? (
                            <div className="tp-empty" style={{ padding: '3rem 0' }}>
                                <FileText size={48} strokeWidth={1} />
                                <h3>No submissions yet</h3>
                                <p>Students haven't submitted yet.</p>
                            </div>
                        ) : (
                            <div className="tp-submissions-grid">
                                {submissions
                                    .filter(sub => 
                                        sub.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        sub.student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((sub, idx) => (
                                    <div key={sub._id || idx} className="tp-submission-card" style={{ animationDelay: `${idx * 0.02}s` }}>
                                        <div className="tp-sub-card-header">
                                            <div className="tp-submission-avatar">
                                                {sub.student?.name?.charAt(0) || <User size={18} />}
                                            </div>
                                            <div className="tp-sub-student-info">
                                                <h4 className="tp-submission-name">{sub.student?.name || 'Unknown Student'}</h4>
                                                <p className="tp-submission-email">{sub.student?.email}</p>
                                            </div>
                                            <div className="tp-sub-badge status-submitted">On Time</div>
                                        </div>
                                        <div className="tp-sub-card-body">
                                            <div className="tp-sub-meta-row">
                                                <div className="tp-sub-date-block">
                                                    <span className="tp-sub-label">Turned In</span>
                                                    <span className="tp-sub-value">
                                                        {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="tp-sub-card-footer">
                                            <a href={sub.fileUrl && sub.fileUrl.startsWith('http') ? sub.fileUrl : `${BASE_URL}${sub.fileUrl}`}
                                                target="_blank" rel="noopener noreferrer" className="tp-btn-download-glass" title="Download Submission">
                                                <Download size={16} /> Access File
                                            </a>
                                            <button className="tp-btn-grade-outline">
                                                Evaluate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAssignments;
