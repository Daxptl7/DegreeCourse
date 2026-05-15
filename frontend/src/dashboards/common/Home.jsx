import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TeacherDashboard from '../teacher/TeacherDashboard';
import JourneyCTA from '../../components/common/JourneyCTA';
import { schools as SCHOOLS } from '../../data/schools';
import './Home.css';

const Home = ({ user, viewMode, toggleViewMode }) => {
    // State declarations
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);
    const [opacity, setOpacity] = useState(0.3);

    // Teacher View Handler
    if (user?.role === 'teacher' && viewMode === 'teacher') {
        return <TeacherDashboard toggleViewMode={toggleViewMode} />;
    }
     //Load 
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const { fetchPublicCourses } = await import('../../api/course.api');
                const response = await fetchPublicCourses({
                    sort: 'ratingHighToLow',
                    limit: 24
                });
                if (response.success) {
                    const allCourses = Array.isArray(response.data) ? response.data : [];
                    console.log("Fetched courses:", allCourses);

                    // Filter by Student School if applicable
                    if (user && user.role === 'student' && user.school) {
                        console.log("Filtering for school:", user.school);
                        const schoolCourses = allCourses.filter(c => c.category === user.school);
                        setRecommended(schoolCourses);
                    } else {
                        setRecommended(allCourses);
                    }
                }
            } catch (error) {
                console.error('Failed to load courses:', error);
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, []);

    // Scroll Opacity Effect
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollFactor = Math.min(window.scrollY / 2000, 0.2);
                    setOpacity(0.3 + scrollFactor);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="home-wrapper">
            {/* HERO SECTION */}
            <section
                className="heroContainer sls-hero-section"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity})), url('/campus.jpg')`
                }}
            >
                <div className="heroContent sls-hero-content">
                    <h1 className="heroTitle sls-hero-title">DEGREE &amp; SKILL<br />PROGRAMS | PDEU</h1>
                    <p className="sls-hero-subtitle">Empowering the Future Through Digital Education</p>
                </div>

                {/* SCHOOL ICONS ON HERO — visible immediately on landing */}
                <div className="hero-schools-bar">
                    <span className="hero-schools-label">{SCHOOLS.length} Constituent Schools</span>
                    <div className="hero-schools-icons">
                        {SCHOOLS.map(school => (
                            <Link key={school.id} to={school.link} className="hero-school-chip" title={school.name}>
                                <img src={school.logo} alt={school.name} className="hero-school-icon" />
                                <span className="hero-school-name">{school.shortName}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* SCHOOLS SECTION — Static Grid */}
            <section className="schools-section">
                <div className="schools-divider"></div>
                <h2 className="schools-heading">Constituent Schools</h2>
                <p className="schools-click-hint">Click on a school to explore</p>
                <div className="schools-grid">
                    {SCHOOLS.map(school => (
                        <div key={school.id} className="school-item">
                            <Link to={school.link} className="school-link">
                                <img
                                    src={school.logo}
                                    alt={school.name}
                                    className="school-logo"
                                />
                            </Link>
                            <Link to={school.link} className="school-know-more">
                                Know More →
                            </Link>
                        </div>
                    ))}
                </div>
                <p className="schools-description">
                    Study at the most vibrant and diverse campus in Gujarat with opportunity for experience based learning.
                    The overall University's physical infrastructure is designed to focus on the power of 'interdisciplinary research'.
                </p>
                <div className="schools-divider"></div>
            </section>

            {/* RECOMMENDED COURSES */}
            <div className="section-container">
                <h3>
                    {user && user.role === 'student' && user.school
                        ? `Recommended for you (${user.school})`
                        : "Recommended for you / Trending"}
                </h3>

                {loading ? (
                    <p>Loading courses...</p>
                ) : (
                    <div className="scroll-container">
                        <div className="scroll-content">
                            {/* Duplicate list for seamless loop (A + A) */}
                            {[...recommended, ...recommended].map((course, index) => (
                                <Link key={`${course._id}-${index}`} to={`/course/${course.slug}`} className="course-card" style={{
                                    minWidth: '280px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', background: 'white', display: 'block', color: 'inherit', flexShrink: 0
                                }}>
                                    <div className="course-card-thumb" style={{
                                        height: '160px',
                                        backgroundImage: `url(${course.thumbnail})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundColor: '#eee'
                                    }}></div>
                                    <div style={{ padding: '15px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '16px', display: 'block', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.name}</span>
                                        <span style={{ fontSize: '14px', color: '#666' }}>By {course.instructor?.name || 'Instructor'}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* STATS SECTION (Placeholder for IdeaLab2 Stats) */}
            <div className="section-container" style={{ background: '#f9f9f9', textAlign: 'center' }}>
                <h3 style={{ borderLeft: 'none' }}>Our Impact</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginTop: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '48px', color: '#8b1425', fontWeight: '800' }}>50+</h2>
                        <p>Lab Equipment</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '48px', color: '#8b1425', fontWeight: '800' }}>200+</h2>
                        <p>Projects Completed</p>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '48px', color: '#8b1425', fontWeight: '800' }}>1000+</h2>
                        <p>Students Trained</p>
                    </div>
                </div>
            </div>

            {/* JOURNEY CTA */}
            <JourneyCTA />
        </div>
    );
};

export default Home;
