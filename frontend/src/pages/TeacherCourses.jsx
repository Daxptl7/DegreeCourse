import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { fetchTeacherCourses } from '../api/teacher.api';
import { Plus, BookOpen, Clock, Users, ArrowRight } from 'lucide-react';
import './TeacherPortal.css';

const TeacherCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetchTeacherCourses();
                if (response.success) {
                    setCourses(response.data);
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, []);

    return (
        <div className="tp-container">
            <TeacherSidebar />
            <main className="tp-main">
                <div className="tp-body">
                    <div className="tp-page-header">
                        <div className="tp-page-title">
                            <h1>My Courses</h1>
                            <p>Manage your courses and track student progress</p>
                        </div>
                        <Link to="/teacher/create-course" className="tp-btn-primary">
                            <Plus size={18} />
                            Create Course
                        </Link>
                    </div>

                    {loading ? (
                        <div className="tp-course-grid">
                            {[1, 2, 3].map(i => (
                                <div className="tp-card" key={i}>
                                    <div className="tp-skeleton" style={{ height: 180 }}></div>
                                    <div style={{ padding: '1.25rem' }}>
                                        <div className="tp-skeleton" style={{ height: 18, width: '80%', marginBottom: 10, borderRadius: 6 }}></div>
                                        <div className="tp-skeleton" style={{ height: 14, width: '50%', borderRadius: 6 }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="tp-empty">
                            <BookOpen size={56} strokeWidth={1} />
                            <h3>No courses yet</h3>
                            <p>Create your first course to get started.</p>
                            <Link to="/teacher/create-course" className="tp-btn-primary">
                                <Plus size={16} /> Create New Course
                            </Link>
                        </div>
                    ) : (
                        <div className="tp-course-grid">
                            {courses.map((course, i) => {
                                if (!course) return null;
                                return (
                                    <Link to={`/teacher/courses/${course.slug || ''}`}
                                        key={course._id || Math.random()}
                                        className="tp-course-card"
                                        style={{ animationDelay: `${i * 0.08}s` }}>
                                        <div className="tp-course-thumb"
                                            style={{ backgroundImage: `url(${course.thumbnail || '/placeholder-course.jpg'})` }}>
                                            <span className="tp-course-status">{course.status || 'Active'}</span>
                                        </div>
                                        <div className="tp-course-info">
                                            <h3 className="tp-course-name">{course.name || 'Untitled Course'}</h3>
                                            <div className="tp-course-meta">
                                                <span><Users size={14} /> {course.stats?.students || 0} Students</span>
                                                <span><Clock size={14} /> {course.duration || 'Flexible'}</span>
                                            </div>
                                            <div className="tp-course-footer">
                                                <span className="tp-course-price">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                                                <span className="tp-course-link">Manage Course <ArrowRight size={14} /></span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TeacherCourses;
