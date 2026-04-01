import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { createCourse } from '../api/teacher.api';
import { ChevronDown } from 'lucide-react';
import './TeacherPortal.css';

const TeacherCreateCourse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', subtitle: '', description: '', price: '',
        category: 'SOT', duration: '', thumbnail: '', whatYouLearn: '', slug: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const whatYouLearnArray = formData.whatYouLearn.split(',').map(s => s.trim()).filter(s => s);
            const payload = { ...formData, slug, whatYouLearn: whatYouLearnArray, price: Number(formData.price) };
            const response = await createCourse(payload);
            if (response.success) {
                navigate(`/teacher/courses/${response.data.slug}`);
            }
        } catch (error) {
            console.error("Failed to create course", error);
            alert("Failed to create course. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tp-container">
            <TeacherSidebar />
            <main className="tp-main">
                <div className="tp-body">
                    <div className="tp-page-header">
                        <div className="tp-page-title">
                            <h1>Create New Course</h1>
                            <p>Fill in the details to publish a new course</p>
                        </div>
                    </div>

                    <div className="tp-form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="tp-form-group">
                                <label className="tp-form-label">Course Name *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                    className="tp-form-input" placeholder="e.g. Introduction to Machine Learning" />
                            </div>

                            <div className="tp-form-group">
                                <label className="tp-form-label">Subtitle</label>
                                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange}
                                    className="tp-form-input" placeholder="A short tagline for your course" />
                            </div>

                            <div className="tp-form-group">
                                <label className="tp-form-label">Detailed Description *</label>
                                <textarea name="description" required rows="4" value={formData.description} onChange={handleChange}
                                    className="tp-form-textarea" placeholder="Describe what this course covers..." />
                            </div>

                            <div className="tp-form-row">
                                <div className="tp-form-group">
                                    <label className="tp-form-label">Price (₹) *</label>
                                    <input type="number" name="price" required min="0" value={formData.price} onChange={handleChange}
                                        className="tp-form-input" placeholder="0 for free" />
                                </div>
                                <div className="tp-form-group">
                                    <label className="tp-form-label">Category</label>
                                    <div className="tp-course-selector" style={{ minWidth: '100%' }}>
                                        <select name="category" value={formData.category} onChange={handleChange}
                                            className="tp-form-select" style={{ appearance: 'none' }}>
                                            <option value="SOT">SOT (School of Technology)</option>
                                            <option value="SOET">SOET (School of Engineering & Technology)</option>
                                            <option value="SLS">SLS (School of Liberal Studies)</option>
                                            <option value="SOL">SOL (School of Law)</option>
                                            <option value="SPM">SPM (School of Petroleum Management)</option>
                                        </select>
                                        <ChevronDown size={16} className="tp-select-arrow" />
                                    </div>
                                </div>
                            </div>

                            <div className="tp-form-group">
                                <label className="tp-form-label">Duration</label>
                                <input type="text" name="duration" value={formData.duration} onChange={handleChange}
                                    className="tp-form-input" placeholder='e.g. "10 hours" or "6 weeks"' />
                            </div>

                            <div className="tp-form-group">
                                <label className="tp-form-label">Thumbnail URL</label>
                                <input type="text" name="thumbnail" value={formData.thumbnail} onChange={handleChange}
                                    className="tp-form-input" placeholder="https://example.com/image.jpg" />
                            </div>

                            <div className="tp-form-group">
                                <label className="tp-form-label">What Students Will Learn</label>
                                <textarea name="whatYouLearn" value={formData.whatYouLearn} onChange={handleChange}
                                    className="tp-form-textarea" placeholder="React, Node.js, MongoDB (comma separated)" />
                            </div>

                            <button type="submit" className="tp-btn-primary" disabled={loading}
                                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                                {loading ? 'Creating...' : '🚀 Create Course'}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherCreateCourse;
