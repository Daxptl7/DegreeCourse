import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronRight, Clock, Home, Sparkles } from 'lucide-react';
import { schoolMap } from '../../data/schools';
import './SchoolComingSoon.css';

const SchoolComingSoon = () => {
    const { schoolId } = useParams();
    const school = schoolMap[schoolId];

    if (!school || school.status === 'live') {
        return <Navigate to="/school/sls" replace />;
    }

    return (
        <div className="school-soon-page">
            <main>
                <section className="school-soon-hero" aria-labelledby="school-soon-title">
                    <nav className="school-soon-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/" aria-label="Home">
                            <Home size={18} strokeWidth={2.6} />
                        </Link>
                        <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
                        <span>{school.name}</span>
                    </nav>

                    <div className="school-soon-panel">
                        <div className="school-soon-copy">
                            <div className="school-soon-pattern school-soon-pattern-dots" aria-hidden="true"></div>
                            <div className="school-soon-pattern school-soon-pattern-wave-one" aria-hidden="true"></div>
                            <div className="school-soon-pattern school-soon-pattern-wave-two" aria-hidden="true"></div>
                            <div className="school-soon-pattern school-soon-pattern-angle" aria-hidden="true"></div>

                            <div className="school-soon-text">
                                <span className="school-soon-pill">
                                    <Clock size={18} />
                                    Coming Soon
                                </span>
                                <h1 id="school-soon-title">{school.name}</h1>
                                <p>
                                    We are preparing this school page with program details, course
                                    information, and learning pathways. Please check back soon.
                                </p>
                                <div className="school-soon-actions">
                                    <Link to="/academics/programs" className="school-soon-primary">
                                        Explore Current Programs
                                        <ArrowRight size={20} />
                                    </Link>
                                    <Link to="/school/sls" className="school-soon-secondary">
                                        View SLS Page
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="school-soon-logo-panel">
                            <div className="school-soon-logo-card">
                                <Sparkles size={26} />
                                <img src={school.logo} alt={`${school.name} logo`} />
                                <strong>{school.shortName}</strong>
                                <span>Page Launching Soon</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SchoolComingSoon;
