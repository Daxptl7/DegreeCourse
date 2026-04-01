import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { fetchTeacherStats, fetchTeacherCourses } from '../api/teacher.api';
import {
    BookOpen,
    Users,
    Star,
    MessageSquare,
    Plus,
    FolderOpen,
    Megaphone,
    ClipboardList,
    TrendingUp,
    Clock,
    ArrowRight,
    LayoutDashboard
} from 'lucide-react';
import './TeacherPortal.css';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalStudents: 0,
        totalReviews: 0,
        averageRating: 0
    });
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [statsRes, coursesRes] = await Promise.all([
                    fetchTeacherStats(),
                    fetchTeacherCourses()
                ]);
                if (statsRes.success) setStats(statsRes.data);
                if (coursesRes.success) setCourses(coursesRes.data.slice(0, 3));
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const quickActions = [
        { icon: <Plus size={22} />, title: 'Create Course', description: 'Build a new learning experience', link: '/teacher/create-course', color: '#A6192E' },
        { icon: <FolderOpen size={22} />, title: 'My Courses', description: 'View & edit your courses', link: '/teacher/courses', color: '#4f46e5' },
        { icon: <MessageSquare size={22} />, title: 'Communication', description: 'Engage with your students', link: '/teacher/communication', color: '#059669' },
        { icon: <ClipboardList size={22} />, title: 'Assignments', description: 'Create & review assignments', link: '/teacher/assignments', color: '#d97706' },
        { icon: <Megaphone size={22} />, title: 'Announcements', description: 'Post updates to students', link: '/teacher/announcements', color: '#7c3aed' }
    ];

    const statCards = [
        { icon: <BookOpen size={24} />, label: 'Total Courses', value: stats.totalCourses, color: '#A6192E', bg: 'rgba(166, 25, 46, 0.08)' },
        { icon: <Users size={24} />, label: 'Total Students', value: stats.totalStudents, color: '#4f46e5', bg: 'rgba(79, 70, 229, 0.08)' },
        { icon: <MessageSquare size={24} />, label: 'Total Reviews', value: stats.totalReviews, color: '#059669', bg: 'rgba(5, 150, 105, 0.08)' },
        { icon: <Star size={24} />, label: 'Avg. Rating', value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—', color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' }
    ];

    return (
        <div className="tp-container">
            <TeacherSidebar />
            <main className="tp-main">
                <div className="tp-body">
                    {/* Welcome Banner */}
                    <section className="td-welcome-banner">
                        <div className="td-welcome-text">
                            <span className="td-welcome-badge">
                                <LayoutDashboard size={14} />
                                Dashboard
                            </span>
                            <h1>{getGreeting()}, {user?.name?.split(' ')[0] || 'Teacher'} 👋</h1>
                            <p>Here's what's happening with your courses today.</p>
                        </div>
                        <div className="td-welcome-art">
                            <div className="td-art-circle td-art-circle-1"></div>
                            <div className="td-art-circle td-art-circle-2"></div>
                            <div className="td-art-circle td-art-circle-3"></div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section className="td-stats-section">
                        {statCards.map((card, i) => (
                            <div className="td-stat-card" key={card.label}
                                style={{ '--stat-color': card.color, '--stat-bg': card.bg, animationDelay: `${i * 0.1}s` }}>
                                <div className="td-stat-icon">{card.icon}</div>
                                <div className="td-stat-info">
                                    <span className="td-stat-value">{loading ? '...' : card.value}</span>
                                    <span className="td-stat-label">{card.label}</span>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* Quick Actions */}
                    <section style={{ marginBottom: '2.5rem' }}>
                        <div className="tp-page-header" style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={20} /> Quick Actions
                            </h2>
                        </div>
                        <div className="td-actions-grid">
                            {quickActions.map((action, i) => (
                                <Link to={action.link} className="td-action-card" key={action.title}
                                    style={{ '--action-color': action.color, animationDelay: `${0.4 + i * 0.08}s` }}>
                                    <div className="td-action-icon">{action.icon}</div>
                                    <div className="td-action-info">
                                        <h3>{action.title}</h3>
                                        <p>{action.description}</p>
                                    </div>
                                    <ArrowRight size={16} className="td-action-arrow" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Recent Courses */}
                    <section>
                        <div className="tp-page-header" style={{ marginBottom: '1rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BookOpen size={20} /> Recent Courses
                            </h2>
                            <Link to="/teacher/courses" className="tp-btn-secondary">
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="tp-course-grid">
                                {[1, 2, 3].map(i => (
                                    <div className="tp-card" key={i}>
                                        <div className="tp-skeleton" style={{ height: 170 }}></div>
                                        <div style={{ padding: '1.25rem' }}>
                                            <div className="tp-skeleton" style={{ height: 18, width: '80%', marginBottom: 10 }}></div>
                                            <div className="tp-skeleton" style={{ height: 14, width: '50%' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="tp-empty">
                                <BookOpen size={48} strokeWidth={1} />
                                <h3>No courses yet</h3>
                                <p>Create your first course to start teaching</p>
                                <Link to="/teacher/create-course" className="tp-btn-primary">
                                    <Plus size={16} /> Create Course
                                </Link>
                            </div>
                        ) : (
                            <div className="tp-course-grid">
                                {courses.map((course, i) => (
                                    <Link to={`/teacher/courses/${course.slug || ''}`} className="tp-course-card" key={course._id}
                                        style={{ animationDelay: `${0.6 + i * 0.1}s` }}>
                                        <div className="tp-course-thumb"
                                            style={{ backgroundImage: `url(${course.thumbnail || '/placeholder-course.jpg'})` }}>
                                            <span className="tp-course-status">{course.status || 'Active'}</span>
                                        </div>
                                        <div className="tp-course-info">
                                            <h3 className="tp-course-name">{course.name || 'Untitled Course'}</h3>
                                            <div className="tp-course-meta">
                                                <span><Users size={13} /> {course.stats?.students || 0} Students</span>
                                                <span><Clock size={13} /> {course.duration || 'Flexible'}</span>
                                            </div>
                                            <div className="tp-course-footer">
                                                <span className="tp-course-price">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                                                <span className="tp-course-link">Manage <ArrowRight size={14} /></span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
