import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SchoolSLS.css';
import './Home.css';

const SchoolSLS = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [opacity, setOpacity] = useState(0.15);

    // Scroll Opacity Effect for hero (optimized with rAF)
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollFactor = Math.min(window.scrollY / 2000, 0.2);
                    setOpacity(0.15 + scrollFactor);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const { fetchPublicCourses } = await import('../../api/course.api');
                const response = await fetchPublicCourses({ limit: 50 });
                if (response.success) {
                    const allCourses = Array.isArray(response.data) ? response.data : [];
                    // Filter SLS courses
                    const slsCourses = allCourses.filter(c =>
                        c.category === 'SLS' || c.category === 'School of Liberal Studies'
                    );
                    setCourses(slsCourses);
                }
            } catch (error) {
                console.error('Failed to load SLS courses:', error);
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, []);

    return (
        <div className="sls-page">
            {/* HERO SECTION */}
            <section
                className="heroContainer sls-hero-section"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, ${opacity}), rgba(0, 0, 0, ${opacity})), url('/SLS_campus.jpeg')`
                }}
            >
                {/* BREADCRUMB */}
                <nav className="sls-breadcrumb">
                    <Link to="/">🏠</Link>
                    <span className="sls-breadcrumb-sep">›</span>
                    <span>School of Liberal Studies</span>
                </nav>
                <div className="heroContent sls-hero-content">
                    <h1 className="heroTitle sls-hero-title">SCHOOL OF<br />LIBERAL STUDIES</h1>
                    <p className="sls-hero-subtitle">Online Degree & Skill Programs</p>
                </div>
            </section>


            {/* MAIN CONTENT — full width */}
            <div className="sls-main">
                {/* Intro */}
                <section className="sls-section" id="programs">
                    <h2 className="sls-section-title">Explore Programs and Learning Options</h2>
                    <p className="sls-section-desc">
                        Explore academic programs, partnerships, and learning opportunities offered by 
                        the School of Liberal Studies at PDEU. You can browse program listings, review 
                        current course options, and find additional resources to help you plan your academic path.
                    </p>

                    {/* Quick Links Grid */}
                    <div className="sls-quicklinks">
                        <a href="#degree" className="sls-quicklink">
                            <span>Online Degree Programs</span>
                            <span className="sls-quicklink-arrow">→</span>
                        </a>
                        <a href="#certificate" className="sls-quicklink">
                            <span>Skill Programs</span>
                            <span className="sls-quicklink-arrow">→</span>
                        </a>
                        <a href="#online" className="sls-quicklink">
                            <span>Online Learning Platform</span>
                            <span className="sls-quicklink-arrow">→</span>
                        </a>
                        <a href="#available-courses" className="sls-quicklink">
                            <span>Available SLS Courses</span>
                            <span className="sls-quicklink-arrow">→</span>
                        </a>
                        <a href="/courses" className="sls-quicklink">
                            <span>Browse All Courses</span>
                            <span className="sls-quicklink-arrow">→</span>
                        </a>
                        <a href="/" className="sls-quicklink">
                            <span>Back to Home</span>
                            <span className="sls-quicklink-arrow">→</span>
                        </a>
                    </div>
                </section>

                {/* ===== ONLINE DEGREE PROGRAMS ===== */}
                <section className="sls-section" id="degree">
                    <h3 className="sls-category-title">Online Degree Programs</h3>
                    <p className="sls-category-desc">
                        The School of Liberal Studies offers UGC-recognized online degree programs that combine 
                        academic excellence with the flexibility of digital learning. Designed for working professionals 
                        and students seeking quality education from anywhere, these programs are delivered through 
                        live lectures, interactive sessions, and comprehensive study material.
                    </p>
                    <ul className="sls-program-list">
                        <li><a href="#" className="sls-program-link">B.A. in Liberal Studies (Online)</a></li>
                        <li><a href="#" className="sls-program-link">B.A. in Economics (Online)</a></li>
                        <li><a href="#" className="sls-program-link">B.A. in Political Science (Online)</a></li>
                        <li><a href="#" className="sls-program-link">B.A. in English Literature (Online)</a></li>
                        <li><a href="#" className="sls-program-link">B.A. in Psychology (Online)</a></li>
                        <li><a href="#" className="sls-program-link">M.A. in Public Policy (Online)</a></li>
                        <li><a href="#" className="sls-program-link">M.A. in International Relations (Online)</a></li>
                        <li><a href="#" className="sls-program-link">MBA in Liberal Management (Online)</a></li>
                    </ul>
                </section>

                {/* ===== SKILL PROGRAMS ===== */}
                <section className="sls-section" id="certificate">
                    <h3 className="sls-category-title">Skill Programs</h3>
                    <p className="sls-category-desc">
                        Industry-aligned skill development programs designed to enhance employability and 
                        build real-world competencies. These short-term and certificate programs are ideal 
                        for upskilling, career transitions, and gaining expertise in specialized domains.
                    </p>
                    <ul className="sls-program-list">
                        <li><a href="#" className="sls-program-link">Certificate in Communication & Soft Skills</a></li>
                        <li><a href="#" className="sls-program-link">Certificate in Creative Writing & Content Strategy</a></li>
                        <li><a href="#" className="sls-program-link">Certificate in Public Policy & Governance</a></li>
                        <li><a href="#" className="sls-program-link">Certificate in Media, Journalism & Digital Marketing</a></li>
                        <li><a href="#" className="sls-program-link">Diploma in Social Sciences & Research Methods</a></li>
                        <li><a href="#" className="sls-program-link">Diploma in Humanities & Liberal Arts</a></li>
                        <li><a href="#" className="sls-program-link">Skill Course — Data Literacy for Humanities</a></li>
                        <li><a href="#" className="sls-program-link">Skill Course — Critical Thinking & Logic</a></li>
                    </ul>
                </section>

                {/* ===== ONLINE LEARNING ===== */}
                <section className="sls-section" id="online">
                    <h3 className="sls-category-title">Online Learning Platform</h3>
                    <p className="sls-category-desc">
                        Access all SLS programs through our state-of-the-art digital learning platform. 
                        Live lectures, recorded sessions, assignments, and assessments — everything you 
                        need to complete your degree or skill program from the comfort of your home.
                    </p>
                    <Link to="/courses" className="sls-explore-btn">
                        Explore Online Courses
                    </Link>
                    </section>

                    {/* LIVE COURSES FROM DATABASE */}
                    {!loading && courses.length > 0 && (
                        <section className="sls-section" id="available-courses">
                            <h3 className="sls-category-title">Available SLS Courses</h3>
                            <p className="sls-category-desc">
                                Browse currently available courses offered by the School of Liberal Studies.
                            </p>
                            <div className="sls-courses-grid">
                                {courses.map(course => (
                                    <Link
                                        key={course._id}
                                        to={`/course/${course.slug}`}
                                        className="sls-course-card"
                                    >
                                        <div
                                            className="sls-course-thumb"
                                            style={{
                                                backgroundImage: `url(${course.thumbnail})`,
                                            }}
                                        ></div>
                                        <div className="sls-course-info">
                                            <span className="sls-course-name">{course.name}</span>
                                            <span className="sls-course-instructor">
                                                By {course.instructor?.name || 'Instructor'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
            </div>

            {/* CTA FOOTER */}
            <section className="sls-cta">
                <Link to="/courses" className="sls-cta-btn">Explore Programs</Link>
                <Link to="/signup" className="sls-cta-btn sls-cta-btn--primary">Apply Today</Link>
                <Link to="/" className="sls-cta-btn">Back to Home</Link>
            </section>
        </div>
    );
};

export default SchoolSLS;
