import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './dashboards/common/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import CourseDetail from './dashboards/student/CourseDetail';
import Cart from './dashboards/common/Cart';
import Profile from './dashboards/common/Profile';
import Courses from './dashboards/common/Courses';

import TeacherLanding from './dashboards/teacher/TeacherLanding';
import TeacherSignup from './dashboards/teacher/TeacherSignup';
import TeacherDashboard from './dashboards/teacher/TeacherDashboard';
import TeacherStats from './dashboards/teacher/TeacherStats';
import TeacherCommunication from './dashboards/teacher/TeacherCommunication';
import TeacherAssignments from './dashboards/teacher/TeacherAssignments';
import TeacherAnnouncements from './dashboards/teacher/TeacherAnnouncements';
import TeacherCourses from './dashboards/teacher/TeacherCourses';
import TeacherCreateCourse from './dashboards/teacher/TeacherCreateCourse';
import ManageCourse from './dashboards/teacher/ManageCourse';
import LiveClass from './pages/LiveClass';
import StudentCourses from './dashboards/student/StudentCourses';
import SchoolSLS from './dashboards/common/SchoolSLS';
import AdminPortal from './dashboards/admin/AdminPortal';
import AdminRoute from './dashboards/admin/AdminRoute';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';


const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};


// Layout Component
const PageLayout = ({ children, navbarProps, viewMode }) => {
    const location = useLocation();

    const isStudentHome =
        (location.pathname === '/' && viewMode !== 'teacher') ||
        location.pathname.startsWith('/school/');

    const isLiveClass = location.pathname.startsWith('/live/');
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isTeacherRoute =
        location.pathname.startsWith('/teacher') || location.pathname === '/teach';

    if (isLiveClass || isAdminRoute || isTeacherRoute) {
        return <div className="app">{children}</div>;
    }

    return (
        <div className="app">
            <Navbar {...navbarProps} />
            <div style={{ paddingTop: isStudentHome ? '0' : '100px', minHeight: '100vh' }}>
                {children}
            </div>
            <Footer />
        </div>
    );
};


function App() {
    const { user, logout } = useAuth();
    const [viewMode, setViewMode] = useState('student');

    const toggleViewMode = () => {
        setViewMode(prev => (prev === 'student' ? 'teacher' : 'student'));
    };

    const navbarProps = {
        user,
        toggleLogin: logout,
        viewMode,
        toggleViewMode,
    };

    return (
        <ThemeProvider>
            <ToastProvider>
            <ErrorBoundary>
                <Router>

                    {/* ✅ ADD THIS LINE */}
                    <ScrollToTop />

                    <PageLayout navbarProps={navbarProps} viewMode={viewMode}>
                        <Routes>
                            <Route path="/" element={<Home user={user} viewMode={viewMode} toggleViewMode={toggleViewMode} />} />
                            <Route path="/signup" element={<Register />} />
                            <Route path="/login" element={<Login />} />

                            {/* Teacher Routes */}
                            <Route path="/teach" element={<TeacherLanding />} />
                            <Route path="/teacher-signup" element={<TeacherSignup />} />
                            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                            <Route path="/teacher/stats" element={<TeacherStats />} />
                            <Route path="/teacher/communication" element={<TeacherCommunication />} />
                            <Route path="/teacher/assignments" element={<TeacherAssignments />} />
                            <Route path="/teacher/announcements" element={<TeacherAnnouncements />} />
                            <Route path="/teacher/courses" element={<TeacherCourses />} />
                            <Route path="/teacher/create-course" element={<TeacherCreateCourse />} />
                            <Route path="/teacher/courses/:slug" element={<ManageCourse />} />

                            <Route path="/admin/*" element={<AdminRoute><AdminPortal /></AdminRoute>} />

                            <Route path="/cart" element={<Cart />} />
                            <Route path="/course/:slug" element={<CourseDetail />} />
                            <Route path="/courses" element={<Courses />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/my-courses" element={<StudentCourses />} />
                            <Route path="/school/sls" element={<SchoolSLS />} />

                            <Route path="/live/:roomId" element={<LiveClass />} />
                        </Routes>
                    </PageLayout>
                </Router>
            </ErrorBoundary>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;