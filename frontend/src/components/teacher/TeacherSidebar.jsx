import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    MessageCircle,
    BarChart2,
    Settings,
    LogOut,
    Home,
} from 'lucide-react';
import './TeacherSidebar.css';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard',     path: '/teacher/dashboard' },
    { icon: BookOpen,        label: 'Courses',       path: '/teacher/courses' },
    { icon: MessageCircle,   label: 'Communication', path: '/teacher/communication' },
    { icon: BarChart2,       label: 'Statistics',    path: '/teacher/stats' },
    { icon: Settings,        label: 'Settings',      path: '/teacher/settings' },
];

const TeacherSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <aside className="ts-sidebar">
            {/* Logo / Brand */}
            <div className="ts-brand">
                <Link to="/" className="ts-logo">
                    <img src="/logo.png" alt="PDEU" className="ts-logo-img" />
                </Link>
                <span className="ts-brand-label">Teacher Portal</span>
            </div>

            {/* Navigation Links */}
            <nav className="ts-nav">
                {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
                    <Link
                        key={path}
                        to={path}
                        className={`ts-nav-item ${isActive(path) ? 'ts-active' : ''}`}
                    >
                        <Icon size={20} className="ts-nav-icon" />
                        <span className="ts-nav-label">{label}</span>
                    </Link>
                ))}
            </nav>

            {/* Bottom: Back to Home */}
            <div className="ts-bottom">
                <Link to="/" className="ts-back-home">
                    <Home size={18} />
                    <span>Back to Home</span>
                </Link>
            </div>
        </aside>
    );
};

export default TeacherSidebar;
