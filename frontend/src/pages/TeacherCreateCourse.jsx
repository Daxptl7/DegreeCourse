import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import { createCourse } from '../api/teacher.api';
import { ChevronDown, Upload, X, ImageIcon } from 'lucide-react';
import './TeacherPortal.css';

const TeacherCreateCourse = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '', subtitle: '', description: '', price: '',
        category: 'SOT', duration: '', whatYouLearn: '', slug: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Thumbnail file handling ---
    const handleThumbnailSelect = (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a JPG or PNG image only.');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            return;
        }

        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setThumbnailPreview(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e) => {
        handleThumbnailSelect(e.target.files[0]);
    };

    const handleRemoveThumbnail = () => {
        setThumbnailFile(null);
        setThumbnailPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Drag & Drop handlers ---
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleThumbnailSelect(file);
    };

    // --- Form submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const slug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const whatYouLearnArray = formData.whatYouLearn.split(',').map(s => s.trim()).filter(s => s);

            // Build FormData for multipart upload
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('subtitle', formData.subtitle);
            payload.append('description', formData.description);
            payload.append('price', Number(formData.price));
            payload.append('category', formData.category);
            payload.append('duration', formData.duration);
            payload.append('slug', slug);
            payload.append('whatYouLearn', JSON.stringify(whatYouLearnArray));

            if (thumbnailFile) {
                payload.append('thumbnail', thumbnailFile);
            }

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

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

                            {/* ========= THUMBNAIL DRAG & DROP UPLOAD ========= */}
                            <div className="tp-form-group">
                                <label className="tp-form-label">Course Thumbnail</label>

                                {!thumbnailPreview ? (
                                    <div
                                        id="thumbnail-dropzone"
                                        className={`tp-thumbnail-dropzone ${isDragging ? 'tp-thumbnail-dragging' : ''}`}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={handleFileInputChange}
                                            style={{ display: 'none' }}
                                        />
                                        <div className="tp-thumbnail-dropzone-icon">
                                            <Upload size={28} />
                                        </div>
                                        <p className="tp-thumbnail-dropzone-title">
                                            {isDragging ? 'Drop image here' : 'Drag & drop your thumbnail'}
                                        </p>
                                        <p className="tp-thumbnail-dropzone-hint">
                                            or <span className="tp-thumbnail-browse-link">browse from your computer</span>
                                        </p>
                                        <p className="tp-thumbnail-dropzone-formats">
                                            JPG or PNG • Max 5MB
                                        </p>
                                    </div>
                                ) : (
                                    <div className="tp-thumbnail-preview-container">
                                        <div className="tp-thumbnail-preview-image-wrapper">
                                            <img
                                                src={thumbnailPreview}
                                                alt="Thumbnail preview"
                                                className="tp-thumbnail-preview-image"
                                            />
                                            <button
                                                type="button"
                                                className="tp-thumbnail-remove-btn"
                                                onClick={handleRemoveThumbnail}
                                                title="Remove thumbnail"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <div className="tp-thumbnail-preview-info">
                                            <div className="tp-thumbnail-preview-file-icon">
                                                <ImageIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="tp-thumbnail-file-name">{thumbnailFile?.name}</p>
                                                <p className="tp-thumbnail-file-size">{thumbnailFile && formatFileSize(thumbnailFile.size)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
