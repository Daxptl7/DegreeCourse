import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import Home from './pages/Home';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import CourseDetail from './pages/CourseDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Courses from './pages/Courses';

import TeacherLanding from './pages/TeacherLanding';
import TeacherSignup from './pages/TeacherSignup';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherStats from './pages/TeacherStats';
import TeacherCommunication from './pages/TeacherCommunication';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherAnnouncements from './pages/TeacherAnnouncements';
import TeacherCourses from './pages/TeacherCourses';
import TeacherCreateCourse from './pages/TeacherCreateCourse';
import ManageCourse from './pages/ManageCourse';
import LiveClass from './pages/LiveClass';
import StudentCourses from './pages/StudentCourses';
import SchoolSLS from './pages/SchoolSLS';
import AdminPortal from './pages/admin/AdminPortal';
import AdminRoute from './pages/admin/AdminRoute';

// Layout Component to handle conditional padding
const PageLayout = ({ children, navbarProps, viewMode }) => {
    const location = useLocation();
    // Only apply 0 padding if on Home Page AND in Student Mode, or on school pages
    const isStudentHome = (location.pathname === '/' && viewMode !== 'teacher') || location.pathname.startsWith('/school/');
    const isLiveClass = location.pathname.startsWith('/live/');
    const isAdminRoute = location.pathname.startsWith('/admin');

    if (isLiveClass || isAdminRoute) {
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

import { ThemeProvider } from './context/ThemeContext';

function App() {
    const { user, logout } = useAuth();
    const [viewMode, setViewMode] = useState('student'); // 'student' or 'teacher'

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'student' ? 'teacher' : 'student');
    };

    const navbarProps = {
        user,
        toggleLogin: logout,
        viewMode,
        toggleViewMode
    };

    return (
        <ThemeProvider>
            <ErrorBoundary>
                <Router>
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
                            {/* Add other routes as we build them */}
                        </Routes>
                    </PageLayout>
                </Router>
            </ErrorBoundary>
        </ThemeProvider>
    );
}

export default App;
