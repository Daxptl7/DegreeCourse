import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './JourneyCTA.css';

const JourneyCTA = () => {
    return (
        <section className="sls-journey-section">
            <div className="sls-journey-content">
                <h2 className="sls-journey-title">
                    Start Your Journey<br/>
                    <em>Today.</em>
                </h2>
                <div className="sls-journey-links">
                    <Link to="/academics/programs" className="sls-journey-link">
                        <span>Explore Programs</span>
                        <ArrowRight size={28} strokeWidth={1.5} className="sls-journey-arrow" />
                    </Link>
                    <Link to="/signup" className="sls-journey-link">
                        <span>Apply Today</span>
                        <ArrowRight size={28} strokeWidth={1.5} className="sls-journey-arrow" />
                    </Link>
                    <Link to="/" className="sls-journey-link">
                        <span>Plan Your Visit</span>
                        <ArrowRight size={28} strokeWidth={1.5} className="sls-journey-arrow" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default JourneyCTA;
