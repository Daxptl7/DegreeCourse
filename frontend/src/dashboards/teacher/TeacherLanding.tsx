import React from 'react';
import { Link } from 'react-router-dom';
import './TeacherHome.css'; // Reusing existing CSS

const TeacherLanding = () => {
    return (
        <div className="teacher-home-container">
            {/* Hero Section */}
            <div className="teacher-hero">
                <div className="teacher-hero-content">
                    <h1>Come Teach<br />with us</h1>
                    <ul>
                        <li>Become a part of a greater teaching community</li>
                    </ul>
                    <Link to="/teacher-signup" className="get-started-btn">Get Started</Link>
                </div>
                <div className="teacher-hero-image">
                    <div className="placeholder-photo">
                        Photo
                    </div>
                </div>
            </div>

            {/* Reasons to start Section */}
            <div className="reasons-section">
                <h3>Reasons to start</h3>
                <div className="reasons-grid">
                    <div className="reason-card"></div>
                    <div className="reason-card"></div>
                    <div className="reason-card"></div>
                    <div className="reason-card"></div>
                </div>
            </div>
        </div>
    );
};

export default TeacherLanding;
