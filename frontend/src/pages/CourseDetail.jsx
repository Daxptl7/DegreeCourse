import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, ChevronDown, ChevronUp, Play, Lock, CheckCircle, Circle, ThumbsUp, PlusSquare, MoreHorizontal, MessageSquare, Bell, FileText, HelpCircle, Download, Upload, Clock, AlertCircle, MessageCircle, X, Image as ImageIcon, Send } from 'lucide-react';
import { getSimilarCourses } from '../data/courses';
import { fetchCourseBySlug } from '../api/course.api';
import { enrollInCourse, addToCart, fetchCart, fetchMyCourses, fetchCourseProgress, updateLectureProgress } from '../api/student.api';
import { getAnnouncements, markAsRead } from '../api/announcement.api';
import { getAssignments, submitAssignment } from '../api/assignment.api';
import { createQuestion, getQuestions } from '../api/question.api';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import './CourseDetail.css';

const BASE_URL = config.API_URL.replace('/api', '');

const CourseDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedParts, setExpandedParts] = useState({});

    // User state relative to course
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);

    // Progress State
    const [progressMap, setProgressMap] = useState({}); // lectureId -> boolean
    const [courseProgress, setCourseProgress] = useState(0); // percentage

    // Video Player State
    const [currentLecture, setCurrentLecture] = useState(null);

    // Sidebar Tab State
    const [activeTab, setActiveTab] = useState('videos'); // 'videos' | 'announcements' | 'assignments' | 'qna'

    // Announcements State
    const [announcements, setAnnouncements] = useState([]);
    const [announcementsLoading, setAnnouncementsLoading] = useState(false);

    // Assignments State
    const [assignments, setAssignments] = useState([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [submissionFiles, setSubmissionFiles] = useState({}); // assignmentId -> File
    const [submittingId, setSubmittingId] = useState(null);

    // QnA State
    const [questions, setQuestions] = useState([]);
    const [questionsLoading, setQuestionsLoading] = useState(false);
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);
    const [askForm, setAskForm] = useState({ title: '', description: '', image: null });
    const [askingLoading, setAskingLoading] = useState(false);
    const [expandedQuestions, setExpandedQuestions] = useState({}); // questionId -> boolean

    // Fetch Announcements
    useEffect(() => {
        if (activeTab === 'announcements' && course && isEnrolled) {
            const fetchAnnouncementsData = async () => {
                try {
                    setAnnouncementsLoading(true);
                    const response = await getAnnouncements(course._id);
                    if (response.success) {
                        setAnnouncements(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch announcements", error);
                } finally {
                    setAnnouncementsLoading(false);
                }
            };
            fetchAnnouncementsData();
        }
    }, [activeTab, course, isEnrolled]);

    // Fetch Assignments
    useEffect(() => {
        if (activeTab === 'assignments' && course && isEnrolled) {
            const fetchAssignmentsData = async () => {
                try {
                    setAssignmentsLoading(true);
                    const response = await getAssignments(course._id);
                    if (response.success) {
                        setAssignments(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch assignments", error);
                } finally {
                    setAssignmentsLoading(false);
                }
            };
            fetchAssignmentsData();
        }
    }, [activeTab, course, isEnrolled]);

    // Fetch Questions
    useEffect(() => {
        if (activeTab === 'qna' && course && isEnrolled) {
            const fetchQuestionsData = async () => {
                try {
                    setQuestionsLoading(true);
                    const response = await getQuestions(course._id);
                    if (response.success) {
                        setQuestions(response.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch questions", error);
                } finally {
                    setQuestionsLoading(false);
                }
            };
            fetchQuestionsData();
        }
    }, [activeTab, course, isEnrolled]);


    const handleMarkRead = async (announcementId) => {
        try {
            await markAsRead(announcementId);
            setAnnouncements(prev => prev.map(a => {
                if (a._id === announcementId) {
                    if (a.readBy.includes(user._id)) return a;
                    return { ...a, readBy: [...a.readBy, user._id] };
                }
                return a;
            }));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleFileChange = (e, assignmentId) => {
        const file = e.target.files[0];
        if (file) {
            setSubmissionFiles(prev => ({
                ...prev,
                [assignmentId]: file
            }));
        }
    };

    const handleSubmitAssignment = async (assignmentId) => {
        const file = submissionFiles[assignmentId];
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        try {
            setSubmittingId(assignmentId);
            const formData = new FormData();
            formData.append('submissionFile', file);

            const response = await submitAssignment(assignmentId, formData);
            if (response.success) {
                alert("Assignment submitted successfully!");
                // Refresh assignments to show submitted status
                const refreshed = await getAssignments(course._id);
                if (refreshed.success) setAssignments(refreshed.data);

                // Clear file input
                setSubmissionFiles(prev => {
                    const next = { ...prev };
                    delete next[assignmentId];
                    return next;
                });
            }
        } catch (error) {
            console.error("Submission failed", error);
            alert(error.response?.data?.message || "Failed to submit assignment");
        } finally {
            setSubmittingId(null);
        }
    };

    const handleAskSubmit = async (e) => {
        e.preventDefault();
        try {
            setAskingLoading(true);
            const formData = new FormData();
            formData.append('courseId', course._id);
            formData.append('title', askForm.title);
            formData.append('description', askForm.description);
            if (askForm.image) {
                formData.append('questionImage', askForm.image);
            }

            const response = await createQuestion(formData);
            if (response.success) {
                alert("Question posted!");
                setIsAskModalOpen(false);
                setAskForm({ title: '', description: '', image: null });
                // Refresh
                const refreshed = await getQuestions(course._id);
                if (refreshed.success) setQuestions(refreshed.data);
            }
        } catch (error) {
            console.error("Failed to post question", error);
            alert("Failed to post question");
        } finally {
            setAskingLoading(false);
        }
    };

    const toggleQuestion = (qId) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [qId]: !prev[qId]
        }));
    };

    useEffect(() => {
        const loadCourseData = async () => {
            try {
                setLoading(true);
                // 1. Fetch Course Details
                const courseResponse = await fetchCourseBySlug(slug);
                if (!courseResponse.success) {
                    setError('Course not found');
                    return;
                }
                const courseData = courseResponse.data;
                setCourse(courseData);

                // 2. Check Enrollment and Cart status if user is logged in
                if (user) {
                    // Check if enrolled
                    const myCourses = await fetchMyCourses();
                    const enrolled = myCourses.success && myCourses.data.some(c => c._id === courseData._id);
                    setIsEnrolled(enrolled);

                    if (enrolled) {
                        // Fetch progress
                        try {
                            const progressRes = await fetchCourseProgress(courseData._id);
                            if (progressRes.success) {
                                setProgressMap(progressRes.data.progress || {});
                            }
                        } catch (e) {
                            console.error("Failed to fetch progress", e);
                        }
                    } else {
                        // Check if in cart
                        const myCart = await fetchCart();
                        const inCart = myCart.success && myCart.data.some(c => c._id === courseData._id);
                        setIsInCart(inCart);
                    }
                }

                // Expand the first part by default
                if (courseData.parts && courseData.parts.length > 0) {
                    setExpandedParts({ [courseData.parts[0]._id || courseData.parts[0].order]: true });
                }
            } catch (err) {
                console.error('Error loading course data:', err);
                setError('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadCourseData();
        }
    }, [slug, user]);

    // Calculate progress percentage whenever progressMap or course changes
    useEffect(() => {
        if (course && isEnrolled) {
            let totalLectures = 0;
            let completedLectures = 0;

            if (course.parts && Array.isArray(course.parts)) {
                course.parts.forEach(part => {
                    if (part.lectures && Array.isArray(part.lectures)) {
                        part.lectures.forEach(lecture => {
                            totalLectures++;
                            if (progressMap[lecture._id]) {
                                completedLectures++;
                            }
                        });
                    }
                });
            }

            const percent = totalLectures === 0 ? 0 : Math.round((completedLectures / totalLectures) * 100);
            setCourseProgress(percent);
        }
    }, [progressMap, course, isEnrolled]);


    const togglePart = (partId) => {
        setExpandedParts(prev => ({
            ...prev,
            [partId]: !prev[partId]
        }));
    };

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setEnrollLoading(true);
            const response = await enrollInCourse(course._id);
            if (response.success) {
                setIsEnrolled(true);
                setIsInCart(false);
                alert('Successfully enrolled! You can now watch the videos.');
                // Initialize progress
                setProgressMap({});
            }
        } catch (err) {
            console.error('Enrollment failed:', err);
            alert('Failed to enroll. Please try again.');
        } finally {
            setEnrollLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            setCartLoading(true);
            const response = await addToCart(course._id);
            if (response.success) {
                setIsInCart(true);
                alert('Added to cart!');
            }
        } catch (err) {
            console.error('Add to cart failed:', err);
            alert(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setCartLoading(false);
        }
    };

    const playVideo = (lecture) => {
        if (!isEnrolled) {
            if (lecture.status === 'unlocked') {
                // Allow preview if unlocked
            } else {
                alert('Please enroll in the course to watch this video.');
                return;
            }
        }
        setCurrentLecture(lecture);
        // Scroll to top for mobile mostly, or just ensuring visibility
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const toggleLectureCompletion = async (e, lectureId) => {
        e.stopPropagation(); // Prevent opening video when clicking checkbox
        if (!isEnrolled) return;

        try {
            // Optimistic update
            const currentStatus = !!progressMap[lectureId];
            setProgressMap(prev => ({
                ...prev,
                [lectureId]: !currentStatus
            }));

            await updateLectureProgress(course._id, lectureId);
        } catch (err) {
            console.error('Failed to update progress', err);
            // Revert on error
            setProgressMap(prev => ({
                ...prev,
                [lectureId]: !prev[lectureId]
            }));
        }
    };

    if (loading) return <div className="course-loading">Loading...</div>;

    if (error || !course) {
        return (
            <div className="course-not-found">
                <h2>{error || 'Course not found'}</h2>
                <Link to="/">Return to Home</Link>
            </div>
        );
    }

    const similarCourses = getSimilarCourses(course.id || course._id);
    const videoSource = currentLecture ? currentLecture.videoUrl : course.videoPreview;
    const activeTitle = currentLecture ? currentLecture.title : course.name + " (Preview)";

    return (
        <div className="course-detail-container">
            <div className="course-wrapper">

                {/* NEW LEFT SIDEBAR */}
                <div className="left-side-nav">
                    <div className="left-nav-item" style={{ marginBottom: '1rem', cursor: 'default', paddingLeft: '0' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Course Navigation</h3>
                    </div>

                    <div
                        className={`left-nav-item ${activeTab === 'videos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('videos')}
                    >
                        <div className="left-nav-icon"><Play size={20} /></div>
                        <span>Videos</span>
                    </div>

                    <div
                        className={`left-nav-item ${activeTab === 'announcements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('announcements')}
                    >
                        <div className="left-nav-icon"><Bell size={20} /></div>
                        <span>Announcements</span>
                    </div>

                    <div
                        className={`left-nav-item ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        <div className="left-nav-icon"><FileText size={20} /></div>
                        <span>Assignments</span>
                    </div>

                    <div
                        className={`left-nav-item ${activeTab === 'qna' ? 'active' : ''}`}
                        onClick={() => setActiveTab('qna')}
                    >
                        <div className="left-nav-icon"><HelpCircle size={20} /></div>
                        <span>Q n A</span>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="course-content-area">

                    {/* 1. VIDEOS VIEW */}
                    {activeTab === 'videos' && (
                        <div className="course-layout">
                            {/* LEFT (in inner grid): Video Player & Details */}
                            <div className="course-main">
                                {/* 1. Video Player */}
                                <div className="main-video-player">
                                    {videoSource ? (
                                        videoSource.startsWith('/uploads') ? (
                                            <video
                                                src={`${BASE_URL}${videoSource}`}
                                                controls
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                autoPlay
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        ) : (
                                            <iframe
                                                src={(function (url) {
                                                    if (!url || typeof url !== 'string') return '';
                                                    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                                    const match = url.match(regExp);
                                                    return (match && match[2].length === 11)
                                                        ? 'https://www.youtube.com/embed/' + match[2]
                                                        : url;
                                                })(videoSource)}
                                                title={activeTitle}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                referrerPolicy="strict-origin-when-cross-origin"
                                                allowFullScreen
                                            ></iframe>
                                        )
                                    ) : (
                                        <div className="video-placeholder">
                                            {course.thumbnail && <img src={course.thumbnail} alt={course.name} />}
                                            <span>No video selected</span>
                                        </div>
                                    )}
                                </div>

                                {/* 2. Video Info & Actions */}
                                <div className="video-info-section">
                                    <h1 className="video-title">{activeTitle}</h1>
                                    <div className="video-meta-row">
                                        <div className="video-stats">
                                            <span>{course.stats?.rating || 0} ⭐ ratings</span> • <span>{course.stats?.parts || 0} parts</span>
                                        </div>

                                        <div className="action-buttons">
                                            <button className="btn-action">
                                                <ThumbsUp size={18} /> Like
                                            </button>
                                            <button className="btn-action">
                                                <Share2 size={18} /> Share
                                            </button>
                                            <button className="btn-action">
                                                <PlusSquare size={18} /> Save
                                            </button>
                                            <button className="btn-action" style={{ borderRadius: '50%', padding: '0.5rem' }}>
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Channel / Instructor Row */}
                                <div className="channel-row">
                                    <div className="channel-avatar">
                                        {course.instructor?.name?.charAt(0) || 'I'}
                                    </div>
                                    <div className="channel-info">
                                        <Link to="#" className="channel-name">{course.instructor?.name || 'Instructor'}</Link>
                                        <div className="channel-sub">{course.instructor?.role || 'Educator'}</div>
                                    </div>

                                    {!isEnrolled && (
                                        <div className="enrollment-actions">
                                            {isInCart ? (
                                                <Link to="/cart" className="btn-enroll-primary">Go to Cart</Link>
                                            ) : (
                                                <button onClick={handleEnroll} className="btn-enroll-primary" disabled={enrollLoading}>
                                                    {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {isEnrolled && (
                                        <button className="btn-action" style={{ background: '#e5e5e5', color: '#111' }}>
                                            Subscribed
                                        </button>
                                    )}
                                </div>

                                {/* 4. Description Box */}
                                <div className="description-box">
                                    <h3>About this course</h3>
                                    <p>{course.description}</p>
                                    <div style={{ marginTop: '1rem' }}>
                                        <strong>Category:</strong> {course.category} <br />
                                        <strong>Level:</strong> {course.stats?.difficulty} <br />
                                        <strong>Duration:</strong> {course.stats?.totalHours}h
                                    </div>
                                    {course.whatYouLearn && Array.isArray(course.whatYouLearn) && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <strong>What you'll learn:</strong>
                                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                                {course.whatYouLearn.map((item, idx) => (
                                                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT (in inner grid): Playlist Sidebar */}
                            <div className="course-sidebar">
                                <div className="sidebar-header" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)' }}>
                                    <div className="sidebar-title">Course Content</div>
                                    {isEnrolled && (
                                        <div className="course-progress-mini">
                                            {courseProgress}% Completed
                                        </div>
                                    )}
                                </div>

                                <div className="parts-list">
                                    {course.parts && Array.isArray(course.parts) && course.parts.map((part) => (
                                        <div key={part._id || part.order} className="part-section">
                                            <div className="part-header" onClick={() => togglePart(part._id || part.order)}>
                                                <span>{part.title}</span>
                                                {expandedParts[part._id || part.order] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>

                                            {expandedParts[part._id || part.order] && (
                                                <div className="lectures-container">
                                                    {part.lectures.map((lecture, idx) => {
                                                        const isActive = currentLecture && currentLecture._id === lecture._id;
                                                        const isCompleted = progressMap[lecture._id];
                                                        const isLocked = !isEnrolled && lecture.status !== 'unlocked';

                                                        return (
                                                            <div
                                                                key={lecture._id}
                                                                className={`lecture-item ${isActive ? 'active' : ''}`}
                                                                onClick={() => !isLocked && playVideo(lecture)}
                                                            >
                                                                <div className="lecture-status-icon">
                                                                    {isActive ? <Play size={14} fill="currentColor" /> : <span style={{ fontSize: '0.8rem' }}>{idx + 1}</span>}
                                                                </div>
                                                                <div className="lecture-info">
                                                                    <div className="lecture-title">{lecture.title}</div>
                                                                    <div className="lecture-meta">
                                                                        <span>{lecture.duration}</span>
                                                                        {isLocked && <Lock size={12} />}
                                                                    </div>
                                                                </div>
                                                                {isEnrolled && (
                                                                    <button
                                                                        className={`lecture-check ${isCompleted ? 'completed' : ''}`}
                                                                        onClick={(e) => toggleLectureCompletion(e, lecture._id)}
                                                                    >
                                                                        {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="similar-courses-section">
                                    <div style={{ padding: '0 1.5rem 0.5rem', fontWeight: '700' }}>Relate Courses</div>
                                    {similarCourses.map((similar) => (
                                        <Link key={similar.id} to={`/course/${similar.slug}`} className="similar-item" style={{ padding: '0 1.5rem' }}>
                                            <div className="similar-thumb"></div>
                                            <div className="similar-info">
                                                <div className="similar-title">{similar.name}</div>
                                                <div className="similar-author">By {similar.instructor}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. ANNOUNCEMENTS VIEW */}
                    {activeTab === 'announcements' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '400px', padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Announcements</h2>

                            {!isEnrolled ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>Enroll to view announcements</h3>
                                    <p>You need to be enrolled in this course to see updates from the instructor.</p>
                                </div>
                            ) : announcementsLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>Loading announcements...</div>
                            ) : announcements.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>No announcements yet</h3>
                                    <p>The instructor hasn't posted any updates.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {announcements.map(ann => {
                                        const isRead = ann.readBy.includes(user._id);
                                        return (
                                            <div
                                                key={ann._id}
                                                onClick={() => !isRead && handleMarkRead(ann._id)}
                                                style={{
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    padding: '1.5rem',
                                                    backgroundColor: isRead ? 'transparent' : 'var(--bg-hover)',
                                                    cursor: isRead ? 'default' : 'pointer',
                                                    borderLeft: isRead ? '1px solid var(--border-color)' : '4px solid var(--accent-color)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                    <h4 style={{ fontWeight: '600', fontSize: '1.1rem', margin: 0 }}>{ann.title}</h4>
                                                    {!isRead && (
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-color)', backgroundColor: 'rgba(79, 70, 229, 0.1)', padding: '2px 8px', borderRadius: '4px', height: 'fit-content' }}>NEW</span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{ann.content}</p>
                                                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span>Posted on {new Date(ann.createdAt).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>By {course.instructor?.name || 'Instructor'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. ASSIGNMENTS VIEW */}
                    {activeTab === 'assignments' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '400px', padding: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Assignments</h2>

                            {!isEnrolled ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>Enroll to view assignments</h3>
                                    <p>You need to be enrolled in this course to see and submit assignments.</p>
                                </div>
                            ) : assignmentsLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>Loading assignments...</div>
                            ) : assignments.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>No assignments yet</h3>
                                    <p>The instructor hasn't posted any assignments.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {assignments.map(assign => {
                                        const isExpired = new Date() > new Date(assign.dueDate);
                                        const dueDateStr = new Date(assign.dueDate).toLocaleDateString() + ' ' + new Date(assign.dueDate).toLocaleTimeString();

                                        return (
                                            <div
                                                key={assign._id}
                                                style={{
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    padding: '1.5rem',
                                                    backgroundColor: 'var(--bg-card)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                    <div>
                                                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>{assign.title}</h3>
                                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{assign.description}</p>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '0.85rem',
                                                            color: isExpired ? '#ef4444' : 'var(--text-secondary)',
                                                            fontWeight: isExpired ? '600' : 'normal',
                                                            backgroundColor: isExpired ? '#fee2e2' : '#f3f4f6',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            <Clock size={14} /> Due: {dueDateStr}
                                                        </div>
                                                        {assign.isSubmitted && (
                                                            <div style={{ marginTop: '0.5rem', color: '#10b981', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                                                <CheckCircle size={16} /> Submitted
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                                    {/* Teacher Attachment */}
                                                    {assign.fileUrl && (
                                                        <a
                                                            href={assign.fileUrl.startsWith('http') ? assign.fileUrl : `${BASE_URL}${assign.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn-action"
                                                            style={{ textDecoration: 'none', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                                                        >
                                                            <Download size={16} /> Download Attachment
                                                        </a>
                                                    )}

                                                    {/* Student Submission */}
                                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                                                        {assign.isSubmitted ? (
                                                            <div style={{ textAlign: 'right' }}>
                                                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                                    Submitted on {new Date(assign.submittedAt).toLocaleDateString()}
                                                                </span>
                                                                {assign.grade != null && (
                                                                    <div style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
                                                                        Grade: {assign.grade}/100
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            isExpired ? (
                                                                <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <AlertCircle size={16} /> Deadline passed
                                                                </span>
                                                            ) : (
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <input
                                                                        type="file"
                                                                        id={`file-${assign._id}`}
                                                                        style={{ display: 'none' }}
                                                                        onChange={(e) => handleFileChange(e, assign._id)}
                                                                        disabled={submittingId === assign._id}
                                                                        accept=".pdf,.doc,.docx"
                                                                    />
                                                                    <label
                                                                        htmlFor={`file-${assign._id}`}
                                                                        className="btn-action"
                                                                        style={{ cursor: 'pointer', border: '1px solid var(--border-color)' }}
                                                                    >
                                                                        <FileText size={16} />
                                                                        {submissionFiles[assign._id] ? submissionFiles[assign._id].name : "Select File"}
                                                                    </label>
                                                                    <button
                                                                        className="btn-enroll-primary"
                                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                                                        onClick={() => handleSubmitAssignment(assign._id)}
                                                                        disabled={submittingId === assign._id || !submissionFiles[assign._id]}
                                                                    >
                                                                        {submittingId === assign._id ? 'Uploading...' : 'Submit'}
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. QnA VIEW */}
                    {activeTab === 'qna' && (
                        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '400px', padding: '1.5rem', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Q & A</h2>
                                <button
                                    onClick={() => setIsAskModalOpen(true)}
                                    disabled={!isEnrolled}
                                    style={{
                                        background: isEnrolled ? 'var(--accent-color)' : '#ccc',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '8px',
                                        cursor: isEnrolled ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '600'
                                    }}
                                >
                                    <MessageCircle size={18} /> Ask Question
                                </button>
                            </div>

                            {!isEnrolled ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>Enroll to view discussions</h3>
                                    <p>You need to be enrolled in this course to view and ask questions.</p>
                                </div>
                            ) : questionsLoading ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>Loading questions...</div>
                            ) : questions.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    <HelpCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>No questions yet</h3>
                                    <p>Be the first to ask a question!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {questions.map(q => {
                                        const isOpen = expandedQuestions[q._id];
                                        return (
                                            <div
                                                key={q._id}
                                                style={{
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '8px',
                                                    padding: '1.25rem',
                                                    backgroundColor: 'var(--bg-card)'
                                                }}
                                            >
                                                <div
                                                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
                                                    onClick={() => toggleQuestion(q._id)}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: 'bold',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                backgroundColor: q.status === 'completed' ? '#dcfce7' : '#e0e7ff',
                                                                color: q.status === 'completed' ? '#166534' : '#4338ca',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {q.status}
                                                            </span>
                                                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{q.title}</h3>
                                                        </div>
                                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                            By {q.student?.name} • {new Date(q.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.9rem' }}>
                                                            <MessageSquare size={16} /> {q.answers.length}
                                                        </div>
                                                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                </div>

                                                {isOpen && (
                                                    <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                                        <p style={{ whiteSpace: 'pre-wrap', color: '#333', marginBottom: '1rem' }}>{q.description}</p>

                                                        {q.imageUrl && (
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <img
                                                                    src={q.imageUrl.startsWith('http') ? q.imageUrl : `${BASE_URL}${q.imageUrl}`}
                                                                    alt="Question attachment"
                                                                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #eee' }}
                                                                />
                                                            </div>
                                                        )}

                                                        <div style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '1rem' }}>
                                                            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: '#666' }}>Answers ({q.answers.length})</h4>
                                                            {q.answers.length === 0 ? (
                                                                <p style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>No answers yet.</p>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                    {q.answers.map(ans => (
                                                                        <div key={ans._id} style={{ display: 'flex', gap: '10px' }}>
                                                                            <div style={{
                                                                                width: '32px', height: '32px', borderRadius: '50%',
                                                                                backgroundColor: ans.user?.role === 'teacher' ? 'var(--accent-color)' : '#ccc',
                                                                                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', overflow: 'hidden'
                                                                            }}>
                                                                                {ans.user?.image ? (
                                                                                    <img
                                                                                        src={ans.user.image.startsWith('http') ? ans.user.image : `${BASE_URL}${ans.user.image}`}
                                                                                        alt={ans.user.name}
                                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                                    />
                                                                                ) : (
                                                                                    ans.user?.name?.charAt(0) || 'U'
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <div style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    {ans.user?.name}
                                                                                    {ans.user?.role === 'teacher' && <CheckCircle size={14} fill="var(--accent-color)" color="#fff" />}
                                                                                </div>
                                                                                <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#444' }}>{ans.content}</p>
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
                                    })}
                                </div>
                            )}

                            {/* Ask Question Modal */}
                            {isAskModalOpen && (
                                <div style={{
                                    position: 'fixed', inset: 0,
                                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                                }}>
                                    <div style={{
                                        background: '#fff', borderRadius: '12px', width: '500px', maxWidth: '90%', padding: '2rem',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Ask a Question</h2>
                                            <button onClick={() => setIsAskModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                                        </div>

                                        <form onSubmit={handleAskSubmit}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title / Subject</label>
                                                <input
                                                    type="text"
                                                    value={askForm.title}
                                                    onChange={(e) => setAskForm({ ...askForm, title: e.target.value })}
                                                    required
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc' }}
                                                    placeholder="e.g., Error in Lecture 4"
                                                />
                                            </div>

                                            <div style={{ marginBottom: '1rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                                                <textarea
                                                    value={askForm.description}
                                                    onChange={(e) => setAskForm({ ...askForm, description: e.target.value })}
                                                    required
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '100px' }}
                                                    placeholder="Describe your doubt..."
                                                />
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Screenshot (Optional)</label>
                                                <div style={{ border: '1px dashed #ccc', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                                    <input
                                                        type="file"
                                                        id="qna-image-upload"
                                                        onChange={(e) => setAskForm({ ...askForm, image: e.target.files[0] })}
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label htmlFor="qna-image-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                        <ImageIcon size={24} style={{ color: '#666' }} />
                                                        <span style={{ color: 'var(--accent-color)', fontWeight: '500' }}>
                                                            {askForm.image ? askForm.image.name : 'Upload Screenshot / Image'}
                                                        </span>
                                                    </label>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={askingLoading}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.8rem',
                                                    background: 'var(--accent-color)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    cursor: askingLoading ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                {askingLoading ? 'Posting...' : 'Post Question'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
