import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    MessageCircle,
    BarChart2,
    Settings,
} from 'lucide-react';
import '../../pages/TeacherCommunication.css';

const TeacherSidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="comm-sidebar">
            <div className="td-logo">
                <h2>U</h2>
            </div>

            <nav className="comm-nav">
                <Link to="/teacher/dashboard" className={`comm-nav-item ${isActive('/teacher/dashboard') ? 'active' : ''}`}>
                    <div className="comm-nav-icon"><LayoutDashboard size={24} /></div>
                    <span className="nav-tooltip">Dashboard</span>
                </Link>
                <Link to="/teacher/courses" className={`comm-nav-item ${isActive('/teacher/courses') ? 'active' : ''}`}>
                    <div className="comm-nav-icon"><BookOpen size={24} /></div>
                    <span className="nav-tooltip">Courses</span>
                </Link>
                <Link to="/teacher/communication" className={`comm-nav-item ${isActive('/teacher/communication') || isActive('/teacher/assignments') || isActive('/teacher/announcements') ? 'active' : ''}`}>
                    <div className="comm-nav-icon"><MessageCircle size={24} /></div>
                    <span className="nav-tooltip">Communication</span>
                </Link>
                <Link to="/teacher/stats" className={`comm-nav-item ${isActive('/teacher/stats') ? 'active' : ''}`}>
                    <div className="comm-nav-icon"><BarChart2 size={24} /></div>
                    <span className="nav-tooltip">Statistics</span>
                </Link>
                <Link to="/teacher/settings" className={`comm-nav-item ${isActive('/teacher/settings') ? 'active' : ''}`}>
                    <div className="comm-nav-icon"><Settings size={24} /></div>
                    <span className="nav-tooltip">Settings</span>
                </Link>
            </nav>
        </aside>
    );
};

export default TeacherSidebar;

