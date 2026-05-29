import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateDetails } from '../../api/auth';
import './Profile.css';
import { User, Mail, Phone, MapPin, Calendar, ExternalLink, Linkedin, Github, Instagram, Link as LinkIcon, Save, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { config } from '../../config';

const BASE_URL = config.API_URL.replace('/api', '');

// Force rebuild timestamp: 1
const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [socialLinks, setSocialLinks] = useState({
        linkedin: '',
        github: '',
        instagram: ''
    });

    useEffect(() => {
        if (user && user.socialLinks) {
            setSocialLinks({
                linkedin: user.socialLinks.linkedin || '',
                github: user.socialLinks.github || '',
                instagram: user.socialLinks.instagram || ''
            });
        }
    }, [user]);

    if (!user) {
        return <div className="profile-dashboard-container">Loading...</div>;
    }

    const handleSaveSocials = async () => {
        setSaving(true);
        try {
            const response = await updateDetails({
                socialLinks
            });
            if (response.success && response.data) {
                // Update context immediately
                updateUser(response.data);
                alert("Social links updated successfully!");
            }
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const isStudent = user.role === 'student';

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            alert("File size too large. Max 5MB.");
            return;
        }

        try {
            setUploadingImage(true);
            const formData = new FormData();
            formData.append('profileImage', file);

            // Append other required fields if backend validators are strict (usually partial update is fine)
            // But let's verify updateDetails logic. It filters undefined.

            const response = await updateDetails(formData);
            if (response.success && response.data) {
                updateUser(response.data);
                // alert("Profile picture updated!");
            }
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
        }
    };

    // Trigger file input
    const triggerFileInput = () => {
        document.getElementById('profile-image-input').click();
    };

    // ... render return ...

    return (
        <div className="profile-dashboard-container">
            {/* ... */}
            <div className="profile-grid">
                {/* Left Column */}
                <div className="profile-info-card">
                    <div className="profile-avatar-container" style={{ position: 'relative', display: 'inline-block' }}>
                        <div className="profile-avatar-large">
                            {uploadingImage ? (
                                <div className="loading-spinner" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>
                            ) : (
                                user.image ?
                                    <img
                                        src={user.image.startsWith('http') ? user.image : `${BASE_URL}${user.image}`}
                                        alt={user.name}
                                        style={{ objectFit: 'cover' }}
                                    /> :
                                    user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <button
                            onClick={triggerFileInput}
                            className="edit-avatar-btn"
                            style={{
                                position: 'absolute', bottom: '5px', right: '5px',
                                background: 'var(--accent-color)', color: '#fff',
                                border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Change Profile Picture"
                        >
                            <Camera size={16} />
                        </button>
                        <input
                            type="file"
                            id="profile-image-input"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                            accept="image/png, image/jpeg, image/jpg"
                        />
                    </div>
                    <h2 className="profile-name-large">{user.name}</h2>
                    <div className="profile-email-large">{user.email}</div>

                    {/* Social Icons Display */}
                    <div className="profile-social-icons" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                        {user.socialLinks?.linkedin && (
                            <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#0077b5' }}>
                                <Linkedin size={24} />
                            </a>
                        )}
                        {user.socialLinks?.github && (
                            <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ color: '#333' }}>
                                <Github size={24} />
                            </a>
                        )}
                        {user.socialLinks?.instagram && (
                            <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#E4405F' }}>
                                <Instagram size={24} />
                            </a>
                        )}
                    </div>

                    <div className="connection-stats">
                        <span className="stat-value">{user.enrolledCourses?.length || 0}</span>
                        <span className="stat-label">Courses</span>
                    </div>

                    <div className="public-profile-section">
                        <div className="public-profile-label">Public Role</div>
                        <div className="public-profile-link" style={{ textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* Registration Details */}
                    <div className="details-section">
                        <div className="section-header">
                            <Calendar size={20} />
                            <span>Account Details</span>
                        </div>

                        <div className="details-grid">
                            <div className="detail-row">
                                <div className="detail-field-label">Selected Role</div>
                                <div className="detail-field-value">
                                    <span className="bullet">•</span>
                                    {user.role === 'student' ? 'Student / Learner' : 'Instructor / Teacher'}
                                </div>
                            </div>

                            {isStudent && (
                                <div className="detail-row">
                                    <div className="detail-field-label">University / School</div>
                                    <div className="detail-field-value">
                                        <span className="bullet">•</span>
                                        {user.school || 'Not Assigned'}
                                    </div>
                                </div>
                            )}

                            <div className="detail-row">
                                <div className="detail-field-label">User ID</div>
                                <div className="detail-field-value">
                                    <span className="bullet">•</span>
                                    {user.personId || user._id}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Social Links */}
                    <div className="social-links-section">
                        <div className="section-header">
                            <LinkIcon size={20} />
                            <span>Edit Social Links</span>
                        </div>

                        <div className="social-inputs-grid">
                            <div className="input-group">
                                <label><Linkedin size={14} style={{ marginRight: '5px' }} /> LinkedIn</label>
                                <input
                                    type="text"
                                    placeholder="https://www.linkedin.com/in/..."
                                    value={socialLinks.linkedin}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label><Github size={14} style={{ marginRight: '5px' }} /> GitHub</label>
                                <input
                                    type="text"
                                    placeholder="GitHub URL"
                                    value={socialLinks.github}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label><Instagram size={14} style={{ marginRight: '5px' }} /> Instagram</label>
                                <input
                                    type="text"
                                    placeholder="Instagram URL"
                                    value={socialLinks.instagram}
                                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="save-btn-container">
                            <button className="save-btn" onClick={handleSaveSocials} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Profile;
