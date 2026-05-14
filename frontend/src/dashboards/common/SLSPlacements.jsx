import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './SLSPlacements.css';

const careerRows = [
    ['Think Tanks', 'Digital Rehab Coach', 'Memory Surgeon', 'Personal Brand Advisor'],
    ['Exotic / Regional Food Business', 'Event Management', 'Sports Management', 'Organizational Disruptor Coach'],
    ['Financial Advisor', 'Healthy Parenting Coach', 'Trash Management', 'Digital Media'],
    ['Digital Education', 'Digital Gaming Industry', 'Door-to-Door Service', 'Relationship Coach'],
    ['Senior Citizen Care Taker', 'Political Expert for Outer Space', 'Diplomats / Trade Expert', 'Domains of Neeti Aayog'],
    ['Shorthand Language', 'Alternate Health Therapy Expert', 'Human Machine Team Manager', 'Cluster Expert in SME / MSME'],
    ['E-Commerce Manager', 'Stock Market Analyzer', 'Insurance Expert', 'Civil Services'],
    ['Ethical Hackers', 'Application Developers', 'Image Consultants', 'Medical Travel Facilitators'],
    ['Digital Music Expert', 'Block Chain Developer', 'Entertainment Industry', 'Organic Food Industry'],
    ['Urban-Rural Bridge', 'Smart City Urban Planner', 'Environment Policy Maker', 'Quality & Quantity Consultants'],
];

const SLSPlacements = () => {
    return (
        <div className="placements-page">
            <main className="placements-main">
                <nav className="placements-breadcrumb" aria-label="Breadcrumb">
                    <Link to="/" aria-label="Home">
                        <Home size={20} strokeWidth={2.5} />
                    </Link>
                    <ChevronRight size={18} aria-hidden="true" />
                    <Link to="/school/sls">School Of Liberal Studies</Link>
                    <ChevronRight size={18} aria-hidden="true" />
                    <span>Placements</span>
                </nav>

                <header className="placements-title-row">
                    <span>SLS</span>
                    <h1>Placements</h1>
                </header>

                <div className="placements-rule"></div>

                <section className="placements-layout">
                    <aside className="placements-sidebar" aria-label="Placement navigation">
                        <Link to="/school/sls/placements" className="active">Careers</Link>
                        <span>Placements 2022</span>
                    </aside>

                    <section className="placements-content">
                        <p className="placements-section-kicker">Career After Graduation</p>
                        <p className="placements-intro">
                            SLS graduates will have multiple career options. While it is expected that
                            some students may opt for post-graduate courses after graduating from SLS,
                            some will take up entrepreneurial ventures and the rest can expect a
                            professional career in any of the fields mentioned below:
                        </p>

                        <div className="placements-career-table" role="table" aria-label="SLS career options">
                            {careerRows.map((row, rowIndex) => (
                                <div className="placements-career-row" role="row" key={`row-${rowIndex}`}>
                                    {row.map((career) => (
                                        <div className="placements-career-cell" role="cell" key={career}>
                                            {career}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
};

export default SLSPlacements;
