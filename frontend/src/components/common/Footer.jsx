import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Linkedin, Facebook, Youtube } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footerContainer">
            {/* Main Content Area */}
            <div className="footerContent">

                {/* 1. About Column */}
                <div className="column">
                    <h3>About Us</h3>
                    <p className="footer-description">
                        PDEU Degree Course is a platform by Pandit Deendayal Energy University designed to bridge the gap between students and knowledge. Join us to explore, learn, and grow.
                    </p>
                </div>

                {/* 2. Quick Links */}
                <div className="column">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/courses">Courses</Link></li>
                        <li><Link to="/school/sls">School of Liberal Studies</Link></li>
                        <li><Link to="/academics/programs">Programs & Courses</Link></li>
                        <li><Link to="/school/sls/placements">SLS Placements</Link></li>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/signup">Sign Up</Link></li>
                    </ul>
                </div>

                {/* 3. Contact Info */}
                <div className="column">
                    <h3>Contact Us</h3>
                    <div className="contactItem">
                        <MapPin size={18} className="contactIcon" />
                        <span>Pandit Deendayal Energy University, Raisan, Gandhinagar, Gujarat</span>
                    </div>
                </div>
            </div>

            {/* Bottom Red Bar */}
            <div className="bottomBar">
                <div className="bottomContainer">
                    <div className="leftSection">
                        <h2>PDEU Degree Course</h2>
                        <span style={{ fontSize: '14px', opacity: 0.8 }}>Empowering Learners, Transforming Futures</span>
                    </div>

                    <div className="rightSection">
                        <div className="socialWrapper">
                            <a href="https://www.instagram.com/pdeuofficial/" target="_blank" rel="noopener noreferrer" className="socialBox"><Instagram size={20} /></a>
                            <a href="https://www.linkedin.com/school/pdeuofficial/" target="_blank" rel="noopener noreferrer" className="socialBox"><Linkedin size={20} /></a>
                            <a href="https://www.facebook.com/pdeuofficial/" target="_blank" rel="noopener noreferrer" className="socialBox"><Facebook size={20} /></a>
                            <a href="https://www.youtube.com/c/PanditDeendayalPetroleumUniversityPDPU" target="_blank" rel="noopener noreferrer" className="socialBox"><Youtube size={20} /></a>
                        </div>
                        <p className="copyright">© {new Date().getFullYear()} PDEU Degree Course. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
