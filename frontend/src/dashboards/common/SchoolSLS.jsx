import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import JourneyCTA from '../../components/common/JourneyCTA';
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
                        <Link to="/academics/programs" className="sls-quicklink">
                            <span>A to Z Program List</span>
                            <span className="sls-quicklink-arrow">→</span>
                        </Link>
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

                {/* ===== B.COM CURRICULUM ===== */}
                <section className="sls-section" id="bcom-curriculum-details">
                    <h3 className="sls-category-title">B.Com Curriculum (Batch 2026)</h3>
                    <p className="sls-category-desc">
                        The Bachelor of Commerce program at SLS offers a comprehensive curriculum designed to provide a strong foundation in business, accounting, and management principles.
                    </p>
                    
                    <div className="sls-semester-grid">
                        {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <div key={sem} className="sls-semester-card">
                                <div className="sls-semester-header">
                                    <h4>Semester - {sem}</h4>
                                    <span className="sls-semester-credits">Credits: 22</span>
                                </div>
                                <table className="sls-curriculum-table">
                                    <thead>
                                        <tr>
                                            <th>Sr. No</th>
                                            <th>Course Title</th>
                                            <th>Category</th>
                                            <th>Credits</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>Core Subject 1</td>
                                            <td><span className="sls-pill sls-pill-major">Major</span></td>
                                            <td>4</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>Core Subject 2</td>
                                            <td><span className="sls-pill sls-pill-major">Major</span></td>
                                            <td>4</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>Elective Course</td>
                                            <td><span className="sls-pill sls-pill-minor">Minor</span></td>
                                            <td>3</td>
                                        </tr>
                                        <tr>
                                            <td>4</td>
                                            <td>Skill Enhancement</td>
                                            <td><span className="sls-pill sls-pill-sec">SEC</span></td>
                                            <td>2</td>
                                        </tr>
                                        <tr>
                                            <td>5</td>
                                            <td>Value Added Course</td>
                                            <td><span className="sls-pill sls-pill-vac">VAC</span></td>
                                            <td>2</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    <div className="sls-credit-summary" style={{marginTop: '40px'}}>
                        <h4>Credit Requirements</h4>
                        <table className="sls-summary-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Total Credits</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Major (Core)</td>
                                    <td>60</td>
                                    <td>45%</td>
                                </tr>
                                <tr>
                                    <td>Minor / Electives</td>
                                    <td>24</td>
                                    <td>18%</td>
                                </tr>
                                <tr>
                                    <td>Multidisciplinary (MDC)</td>
                                    <td>9</td>
                                    <td>7%</td>
                                </tr>
                                <tr>
                                    <td>Skill Enhancement (SEC)</td>
                                    <td>9</td>
                                    <td>7%</td>
                                </tr>
                                <tr>
                                    <td>Value Added (VAC) / AEC</td>
                                    <td>30</td>
                                    <td>23%</td>
                                </tr>
                                <tr className="sls-summary-total">
                                    <td>Total</td>
                                    <td>132</td>
                                    <td>100%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
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

            <JourneyCTA />
        </div>
    );
};

export default SchoolSLS;
