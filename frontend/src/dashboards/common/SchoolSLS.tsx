import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Home } from 'lucide-react';
import JourneyCTA from '../../components/common/JourneyCTA';
import './SchoolSLS.css';

const primaryLinks = [
    { label: 'A to Z Program List', to: '/academics/programs' },
    { label: 'Career Pathways', href: '#career-pathways' },
    { label: 'Current Course Options', to: '/courses' },
    { label: 'More Ways to Learn', href: '#online-learning' },
];

const secondaryLinks = [
    { label: 'University & Academic Partnerships', href: '#partnerships' },
    { label: 'Placements', to: '/school/sls/placements' },
    { label: 'B.Com Curriculum', to: '/academics/programs/bcom' },
    { label: 'BBA Curriculum', to: '/academics/programs/bba' },
];

const offerings = [
    {
        label: 'Bachelor of Commerce (B.Com) Course Curriculum',
        to: '/academics/programs/bcom',
    },
    {
        label: 'Bachelor of Business Administration (BBA) Course Curriculum',
        to: '/academics/programs/bba',
    },
    {
        label: 'Digital Communication & Media Studies',
        to: '/courses',
    },
    {
        label: 'Public Policy and Governance',
        to: '/courses',
    },
    {
        label: 'Skill Enhancement and Value Added Courses',
        href: '#online-learning',
    },
];

const LinkRow = ({ item, className = 'sls-link-row' }) => {
    const content = (
        <>
            <span>{item.label}</span>
            <ArrowRight size={25} strokeWidth={1.8} aria-hidden="true" />
        </>
    );

    if (item.to) {
        return (
            <Link to={item.to} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <a href={item.href} className={className}>
            {content}
        </a>
    );
};

const SchoolSLS = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const { fetchPublicCourses } = await import('../../api/course.api');
                const response = await fetchPublicCourses({ limit: 50 });

                if (response.success) {
                    const allCourses = Array.isArray(response.data) ? response.data : [];
                    const slsCourses = allCourses.filter((course) =>
                        course.category === 'SLS' || course.category === 'School of Liberal Studies'
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
            <main>
                <section className="sls-top-hero" aria-labelledby="sls-hero-title">
                    <nav className="sls-hero-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/" aria-label="Home">
                            <Home size={18} strokeWidth={2.6} />
                        </Link>
                        <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
                        <span>School of Liberal Studies</span>
                    </nav>

                    <div className="sls-hero-panel">
                        <div className="sls-hero-copy">
                            <div className="sls-hero-pattern sls-hero-pattern-dots" aria-hidden="true"></div>
                            <div className="sls-hero-pattern sls-hero-pattern-wave-one" aria-hidden="true"></div>
                            <div className="sls-hero-pattern sls-hero-pattern-wave-two" aria-hidden="true"></div>
                            <div className="sls-hero-pattern sls-hero-pattern-angle" aria-hidden="true"></div>
                            <div className="sls-hero-text">
                                <h1 id="sls-hero-title">School of Liberal Studies</h1>
                                <p>
                                    Explore degrees, skill programs, and interdisciplinary learning
                                    options designed to support your academic goals.
                                </p>
                                <Link to="/signup" className="sls-hero-cta">
                                    Apply Now
                                </Link>
                            </div>
                        </div>
                        <div className="sls-hero-image">
                            <img src="/SLS_campus.jpeg" alt="School of Liberal Studies campus" />
                        </div>
                    </div>
                </section>

                <section className="sls-intro-section" id="programs">
                    <div className="sls-content-wrap">
                        <p className="sls-kicker">School of Liberal Studies</p>
                        <h1>Explore Programs and Learning Options</h1>
                        <p className="sls-intro-copy">
                            Discover academic programs, interdisciplinary learning opportunities, and
                            online pathways offered by the School of Liberal Studies at PDEU. Browse
                            program listings, review current course options, and find resources to help
                            you plan your academic path.
                        </p>

                        <div className="sls-link-grid" aria-label="SLS academic links">
                            <div>
                                {primaryLinks.map((item) => (
                                    <LinkRow key={item.label} item={item} />
                                ))}
                            </div>
                            <div>
                                {secondaryLinks.map((item) => (
                                    <LinkRow key={item.label} item={item} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="sls-blue-band" id="bcom-curriculum-details">
                    <div className="sls-blue-pattern sls-blue-pattern-dots" aria-hidden="true"></div>
                    <div className="sls-blue-pattern sls-blue-pattern-wave-one" aria-hidden="true"></div>
                    <div className="sls-blue-pattern sls-blue-pattern-wave-two" aria-hidden="true"></div>
                    <div className="sls-blue-pattern sls-blue-pattern-angle" aria-hidden="true"></div>

                    <div className="sls-content-wrap sls-blue-content">
                        <h2>SLS Offerings</h2>
                        <p>
                            SLS programs combine business, communication, humanities, policy, and skill
                            learning for students who want a flexible liberal studies foundation with
                            strong career relevance.
                        </p>

                        <div className="sls-offering-grid">
                            {offerings.map((item) => (
                                <LinkRow key={item.label} item={item} className="sls-offering-row" />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="sls-detail-section" id="online-learning">
                    <div className="sls-content-wrap sls-detail-grid">
                        <article id="career-pathways">
                            <h2>Career Pathways</h2>
                            <p>
                                Build a foundation for careers in commerce, public service, media,
                                communication, research, entrepreneurship, and interdisciplinary roles
                                that reward broad thinking.
                            </p>
                        </article>
                        <article id="partnerships">
                            <h2>Academic Partnerships</h2>
                            <p>
                                PDEU learning pathways connect classroom study with applied projects,
                                online learning, and opportunities to explore allied disciplines across
                                the university.
                            </p>
                        </article>
                        <article id="program-info">
                            <h2>Program Information</h2>
                            <p>
                                Review available courses, understand program options, and use the SLS
                                course catalog to choose the academic direction that fits your goals.
                            </p>
                        </article>
                    </div>
                </section>

                {!loading && courses.length > 0 && (
                    <section className="sls-courses-section" id="available-courses">
                        <div className="sls-content-wrap">
                            <h2>Available SLS Courses</h2>
                            <p className="sls-courses-copy">
                                Browse currently available courses offered by the School of Liberal Studies.
                            </p>

                            <div className="sls-courses-grid">
                                {courses.map((course) => (
                                    <Link
                                        key={course._id}
                                        to={`/course/${course.slug}`}
                                        className="sls-course-card"
                                    >
                                        <div
                                            className="sls-course-thumb"
                                            style={{
                                                backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : undefined,
                                            }}
                                        />
                                        <div className="sls-course-info">
                                            <span className="sls-course-name">{course.name}</span>
                                            <span className="sls-course-instructor">
                                                By {course.instructor?.name || 'Instructor'}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <JourneyCTA />
        </div>
    );
};

export default SchoolSLS;
