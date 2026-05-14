import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, ChevronDown, ChevronUp, Play, Lock, CheckCircle, Circle, ThumbsUp, PlusSquare, MoreHorizontal, MessageSquare, Bell, FileText, HelpCircle, Download, Upload, Clock, AlertCircle, MessageCircle, X, Image as ImageIcon, Send } from 'lucide-react';
import { getSimilarCourses } from '../../data/courses';
import { fetchCourseBySlug } from '../../api/course.api';
import { enrollInCourse, addToCart, fetchCart, fetchMyCourses, fetchCourseProgress, updateLectureProgress } from '../../api/student.api';
import { getAnnouncements, markAsRead } from '../../api/announcement.api';
import { getAssignments, submitAssignment } from '../../api/assignment.api';
import { createQuestion, getQuestions } from '../../api/question.api';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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

    const handleSubmitAssignment = async (assignmentId, isDraft) => {
        const file = submissionFiles[assignmentId];
        
        // If it's a new submission or updating file
        if (!file && !isDraft) {
            // Check if they already have a draft file uploaded they just want to turn in
            const existingAssignment = assignments.find(a => a._id === assignmentId);
            if (!existingAssignment?.submission?.fileUrl) {
                alert("Please select a file to upload.");
                return;
            }
        }

        try {
            setSubmittingId(assignmentId);
            const formData = new FormData();
            if (file) {
                formData.append('submissionFile', file);
            }
            formData.append('isDraft', isDraft);

            const response = await submitAssignment(assignmentId, formData);
            if (response.success) {
                if (!isDraft) {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#00e5ff', '#3b82f6', '#8b5cf6']
                    });
                } else {
                    alert("Draft saved successfully!");
                }
                
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
                        <div className="sp-content-view">
                            <div className="sp-section-header">
                                <h2>Announcements</h2>
                            </div>

                            {!isEnrolled ? (
                                <div className="sp-empty-state">
                                    <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>Enroll to view announcements</h3>
                                    <p>You need to be enrolled in this course to see updates from the instructor.</p>
                                </div>
                            ) : announcementsLoading ? (
                                <div className="sp-empty-state">Loading announcements...</div>
                            ) : announcements.length === 0 ? (
                                <div className="sp-empty-state">
                                    <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>No announcements yet</h3>
                                    <p>The instructor hasn't posted any updates.</p>
                                </div>
                            ) : (
                                <div className="sp-announcement-list">
                                    <AnimatePresence>
                                        {announcements.map((ann, index) => {
                                            const isRead = ann.readBy.includes(user._id);
                                            return (
                                                <motion.div
                                                    key={ann._id}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    onClick={() => !isRead && handleMarkRead(ann._id)}
                                                    className={`glass-card announcement-modern-card ${isRead ? 'read' : 'unread'}`}
                                                >
                                                    <div className="announcement-modern-icon">
                                                        <Bell size={24} className={isRead ? 'icon-read' : 'icon-unread'} />
                                                    </div>
                                                    <div className="announcement-modern-content">
                                                        <div className="announcement-modern-header">
                                                            <h4 className="announcement-modern-title">{ann.title}</h4>
                                                            {!isRead && <span className="status-pill due" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>NEW</span>}
                                                        </div>
                                                        <p className="announcement-modern-text">{ann.content}</p>
                                                        <div className="announcement-modern-meta">
                                                            <div className="meta-item">
                                                                <Clock size={14} /> 
                                                                {new Date(ann.createdAt).toLocaleDateString()}
                                                            </div>
                                                            <span className="meta-dot">•</span>
                                                            <div className="meta-item">
                                                                By {course.instructor?.name || 'Instructor'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 3. ASSIGNMENTS VIEW */}
                    {activeTab === 'assignments' && (
                        <div className="sp-content-view">
                            <div className="sp-section-header">
                                <h2>Assignments</h2>
                            </div>

                            {!isEnrolled ? (
                                <div className="sp-empty-state">
                                    <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>Enroll to view assignments</h3>
                                    <p>You need to be enrolled in this course to see and submit assignments.</p>
                                </div>
                            ) : assignmentsLoading ? (
                                <div className="sp-empty-state">Loading assignments...</div>
                            ) : assignments.length === 0 ? (
                                <div className="sp-empty-state">
                                    <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>No assignments yet</h3>
                                    <p>The instructor hasn't posted any assignments.</p>
                                </div>
                            ) : (
                                <div className="interactive-timeline-container">
                                    <div className="timeline-line"></div>
                                    <AnimatePresence>
                                        {assignments.map((assign, index) => {
                                            const isExpired = new Date() > new Date(assign.dueDate);
                                            const dueDateStr = new Date(assign.dueDate).toLocaleDateString() + ' ' + new Date(assign.dueDate).toLocaleTimeString();
                                            const subStatus = assign.status || 'unsubmitted';
                                            
                                            // Node coloring based on status
                                            let nodeClass = 'node-unsubmitted';
                                            if (subStatus === 'submitted') nodeClass = 'node-submitted';
                                            else if (subStatus === 'graded') nodeClass = 'node-graded';
                                            else if (subStatus === 'draft') nodeClass = 'node-draft';
                                            else if (isExpired) nodeClass = 'node-expired';

                                            return (
                                                <motion.div 
                                                    key={assign._id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="timeline-item"
                                                >
                                                    <div className={`timeline-node ${nodeClass}`}>
                                                        {subStatus === 'submitted' && <CheckCircle size={16} />}
                                                        {subStatus === 'graded' && <CheckCircle size={16} />}
                                                        {subStatus === 'draft' && <FileText size={16} />}
                                                        {isExpired && subStatus === 'unsubmitted' && <AlertCircle size={16} />}
                                                        {!isExpired && subStatus === 'unsubmitted' && <Circle size={16} />}
                                                    </div>
                                                    
                                                    <div className="glass-card assignment-card-modern">
                                                        <div className="assignment-modern-header">
                                                            <div>
                                                                <h3 className="assignment-modern-title">{assign.title}</h3>
                                                                <p className="assignment-modern-desc">{assign.description}</p>
                                                            </div>
                                                            <div className="assignment-badges">
                                                                <div className={`status-pill ${isExpired && subStatus === 'unsubmitted' ? 'expired' : 'due'}`}>
                                                                    <Clock size={14} /> Due: {dueDateStr}
                                                                </div>
                                                                {subStatus === 'submitted' && (
                                                                    <div className="status-pill submitted">
                                                                        <CheckCircle size={14} /> Turned In
                                                                    </div>
                                                                )}
                                                                {subStatus === 'draft' && (
                                                                    <div className="status-pill draft">
                                                                        <FileText size={14} /> Draft Saved
                                                                    </div>
                                                                )}
                                                                {subStatus === 'graded' && (
                                                                    <div className="status-pill graded">
                                                                        <CheckCircle size={14} /> Graded
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Instructor Feedback Block */}
                                                        {subStatus === 'graded' && (
                                                            <motion.div 
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                className="grading-feedback-block"
                                                            >
                                                                <div className="grade-score">
                                                                    <span className="grade-label">Score</span>
                                                                    <span className="grade-value">{assign.grade}/100</span>
                                                                </div>
                                                                {assign.submission?.feedback && (
                                                                    <div className="feedback-text">
                                                                        <strong>Instructor Feedback:</strong>
                                                                        <p>{assign.submission.feedback}</p>
                                                                    </div>
                                                                )}
                                                            </motion.div>
                                                        )}

                                                        <div className="assignment-modern-footer">
                                                            <div className="footer-left">
                                                                {assign.fileUrl && (
                                                                    <a
                                                                        href={assign.fileUrl.startsWith('http') ? assign.fileUrl : `${BASE_URL}${assign.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn-glass-download"
                                                                    >
                                                                        <Download size={14} /> Assignment Resource
                                                                    </a>
                                                                )}
                                                                {assign.submission?.fileUrl && (
                                                                    <a
                                                                        href={assign.submission.fileUrl.startsWith('http') ? assign.submission.fileUrl : `${BASE_URL}${assign.submission.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn-glass-download submission-link"
                                                                    >
                                                                        <Download size={14} /> Your Submission
                                                                    </a>
                                                                )}
                                                            </div>

                                                            <div className="footer-right">
                                                                {subStatus !== 'graded' && subStatus !== 'submitted' ? (
                                                                    <div className="upload-controls">
                                                                        <input
                                                                            type="file"
                                                                            id={`file-${assign._id}`}
                                                                            style={{ display: 'none' }}
                                                                            onChange={(e) => handleFileChange(e, assign._id)}
                                                                            disabled={submittingId === assign._id}
                                                                            accept=".pdf,.doc,.docx"
                                                                        />
                                                                        <label htmlFor={`file-${assign._id}`} className={`btn-upload-label ${submissionFiles[assign._id] ? 'has-file' : ''}`}>
                                                                            <Upload size={14} />
                                                                            <span>
                                                                                {submissionFiles[assign._id] ? submissionFiles[assign._id].name : "Choose File"}
                                                                            </span>
                                                                        </label>
                                                                        
                                                                        <div className="submit-action-group">
                                                                            <button
                                                                                className="btn-glass-secondary"
                                                                                onClick={() => handleSubmitAssignment(assign._id, true)}
                                                                                disabled={submittingId === assign._id || (!submissionFiles[assign._id] && !assign.submission?.fileUrl)}
                                                                            >
                                                                                {submittingId === assign._id ? 'Saving...' : 'Save Draft'}
                                                                            </button>
                                                                            <button
                                                                                className="btn-glow-primary"
                                                                                onClick={() => handleSubmitAssignment(assign._id, false)}
                                                                                disabled={submittingId === assign._id || (!submissionFiles[assign._id] && !assign.submission?.fileUrl)}
                                                                            >
                                                                                Turn In
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. QnA VIEW */}
                    {activeTab === 'qna' && (
                        <div className="sp-content-view">
                            <div className="sp-section-header">
                                <h2>Q & A</h2>
                                <button
                                    onClick={() => setIsAskModalOpen(true)}
                                    disabled={!isEnrolled}
                                    className="btn-enroll-primary"
                                    style={{ padding: '0.6rem 1.25rem' }}
                                >
                                    <MessageCircle size={18} /> Ask Question
                                </button>
                            </div>

                            {!isEnrolled ? (
                                <div className="sp-empty-state">
                                    <Lock size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>Enroll to view discussions</h3>
                                    <p>You need to be enrolled in this course to view and ask questions.</p>
                                </div>
                            ) : questionsLoading ? (
                                <div className="sp-empty-state">Loading questions...</div>
                            ) : questions.length === 0 ? (
                                <div className="sp-empty-state">
                                    <HelpCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                    <h3>No questions yet</h3>
                                    <p>Be the first to ask a question!</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {questions.map(q => {
                                        const isOpen = expandedQuestions[q._id];
                                        return (
                                            <div key={q._id} className="sp-assignment-card" style={{ padding: '1.25rem' }}>
                                                <div
                                                    style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }}
                                                    onClick={() => toggleQuestion(q._id)}
                                                >
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: '800',
                                                                padding: '2px 8px',
                                                                borderRadius: '4px',
                                                                backgroundColor: q.status === 'completed' ? '#ecfdf5' : '#fff1f2',
                                                                color: q.status === 'completed' ? '#059669' : '#e11d48',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {q.status}
                                                            </span>
                                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{q.title}</h3>
                                                        </div>
                                                        <div style={{ fontSize: '0.82rem', color: '#6b7280', fontWeight: '500' }}>
                                                            By {q.student?.name} • {new Date(q.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '0.85rem' }}>
                                                            <MessageSquare size={16} /> {q.answers.length}
                                                        </div>
                                                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                    </div>
                                                </div>

                                                {isOpen && (
                                                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                                                        <p style={{ whiteSpace: 'pre-wrap', color: '#334155', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: '1.6' }}>{q.description}</p>

                                                        {q.imageUrl && (
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                <img
                                                                    src={q.imageUrl.startsWith('http') ? q.imageUrl : `${BASE_URL}${q.imageUrl}`}
                                                                    alt="Question attachment"
                                                                    style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                                />
                                                            </div>
                                                        )}

                                                        <div className="sp-answers-box">
                                                            <h4 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', color: '#64748b', fontWeight: '700' }}>Answers ({q.answers.length})</h4>
                                                            {q.answers.length === 0 ? (
                                                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>No answers yet.</p>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    {q.answers.map(ans => (
                                                                        <div key={ans._id} className="sp-answer-item">
                                                                            <div className="sp-answer-avatar" style={{ backgroundColor: ans.user?.role === 'teacher' ? '#1D70B8' : '#94a3b8' }}>
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
                                                                            <div className="sp-answer-content">
                                                                                <h5>
                                                                                    {ans.user?.name}
                                                                                    {ans.user?.role === 'teacher' && <CheckCircle size={14} fill="#1D70B8" color="#fff" />}
                                                                                </h5>
                                                                                <p className="sp-answer-text">{ans.content}</p>
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
                                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                                    backdropFilter: 'blur(4px)'
                                }}>
                                    <div style={{
                                        background: '#fff', borderRadius: '20px', width: '550px', maxWidth: '95%', padding: '2.5rem',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', animation: 'tpSlideUp 0.3s ease-out'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                                            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>Ask a Question</h2>
                                            <button onClick={() => setIsAskModalOpen(false)} style={{ background: '#f3f4f6', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', color: '#6b7280' }}><X size={20} /></button>
                                        </div>

                                        <form onSubmit={handleAskSubmit} className="sp-modal-form-content">
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Title / Subject</label>
                                                <input
                                                    type="text"
                                                    value={askForm.title}
                                                    onChange={(e) => setAskForm({ ...askForm, title: e.target.value })}
                                                    required
                                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
                                                    placeholder="Short summary of your question"
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Description</label>
                                                <textarea
                                                    value={askForm.description}
                                                    onChange={(e) => setAskForm({ ...askForm, description: e.target.value })}
                                                    required
                                                    style={{ width: '100%', padding: '0.85rem', borderRadius: '10px', border: '1px solid #d1d5db', minHeight: '120px', fontSize: '0.95rem', resize: 'vertical' }}
                                                    placeholder="Provide details about your doubt..."
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.9rem', color: '#374151' }}>Screenshot (Optional)</label>
                                                <div style={{ border: '2px dashed #e5e7eb', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', background: '#f9fafb' }}>
                                                    <input
                                                        type="file"
                                                        id="qna-image-upload"
                                                        onChange={(e) => setAskForm({ ...askForm, image: e.target.files[0] })}
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label htmlFor="qna-image-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                                        <ImageIcon size={28} style={{ color: '#9ca3af' }} />
                                                        <span style={{ color: '#1D70B8', fontWeight: '700', fontSize: '0.9rem' }}>
                                                            {askForm.image ? askForm.image.name : 'Click to upload image'}
                                                        </span>
                                                        <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>PNG, JPG up to 10MB</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={askingLoading}
                                                className="btn-enroll-primary"
                                                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
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
