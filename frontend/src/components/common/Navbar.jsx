import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Video, MonitorPlay } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ user, toggleLogin, viewMode, toggleViewMode }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [createDropdownOpen, setCreateDropdownOpen] = useState(false);

    // Ref for closing dropdown on click outside
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 50;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCreateDropdownOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [scrolled]);

    const handleLogout = () => {
        toggleLogin();
        navigate('/');
    };

    const isHome = location.pathname === '/';
    const isSchoolPage = location.pathname.startsWith('/school/');
    // Transparent on Home Page (student mode) only
    const isTransparent = (isHome && viewMode !== 'teacher') && !scrolled;
    const navClass = isTransparent ? 'transparent' : 'scrolled';

    return (
        <header className={`headerContainer ${navClass}`}>
            <div className="nav-container">
                {/* Logo Section */}
                <Link to="/" className="logoGroup">
                    <img src="/logo.png" alt="PDEU Logo" style={{ height: '80px', width: 'auto' }} />
                </Link>

                {/* Hamburger for Mobile */}
                <button className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>

                {/* Menu */}
                <ul className={`menu ${mobileMenuOpen ? 'show' : ''}`}>
                    <li>
                        <Link
                            to="/"
                            className="menuLink"
                            onClick={() => {
                                if (viewMode === 'teacher') toggleViewMode();
                            }}
                        >
                            Home
                        </Link>
                    </li>
                    <li><Link to="/courses" className="menuLink">Courses</Link></li>

                    {user ? (
                        <>
                            {user.role === 'teacher' && (
                                <>


                                    <li>
                                        <span
                                            onClick={() => {
                                                toggleViewMode();
                                                if (viewMode !== 'teacher') {
                                                    navigate('/teacher/dashboard');
                                                } else {
                                                    navigate('/');
                                                }
                                            }}
                                            className="menuLink"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {viewMode === 'teacher' ? 'Switch to Student' : 'Switch to Teacher'}
                                        </span>
                                    </li>
                                </>
                            )}
                            <li><Link to="/profile" className="menuLink">Profile</Link></li>
                            {user.role === 'teacher' && viewMode === 'teacher' ? (
                                <li><Link to="/teacher/dashboard" className="menuLink">Dashboard</Link></li>
                            ) : (
                                <>
                                    <li><Link to="/my-courses" className="menuLink">My Courses</Link></li>
                                    <li><Link to="/cart" className="menuLink">My Cart</Link></li>
                                </>
                            )}
                            <li>
                                <button onClick={handleLogout} className="auth-btn">Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className="menuLink">Login</Link></li>
                            <li><Link to="/signup" className="auth-btn">Sign Up</Link></li>
                        </>
                    )}
                </ul>
            </div>
        </header>
    );
};

export default Navbar;
