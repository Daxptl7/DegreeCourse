import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        role: '',
        email: '',
        phone: '',
        password: '',
        name: '',
        school: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await registerAPI(formData);

            if (response.success) {
                // Update auth context
                login(response.data);
                // Navigate to home
                navigate('/');
            } else {
                setError(response.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.message || 'Failed to connect to server. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-split-card">
                {/* Left Side - Image */}
                <div className="register-image-section">
                    <div className="register-image-overlay">
                        <div className="register-overlay-content">
                            <h2>Pandit Deendayal Energy University</h2>
                            <p>Join our community of future leaders and innovators.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="register-form-section">
                    <div className="register-content">
                        {/* Header */}
                        <div className="register-header">
                            <h1 className="register-title">Create Account</h1>
                            <p className="register-subtitle">Join UniLearn Today</p>
                        </div>

                        {/* Form Section */}
                        <div className="register-form-wrapper">
                            {error && <div className="register-error-msg">{error}</div>}

                            <form onSubmit={handleSubmit} className="register-form">
                                <div className="register-input-group">
                                    {/* Role Selection */}
                                    <div className="register-form-field">
                                        <label htmlFor="role">Choose your role</label>
                                        <select
                                            id="role"
                                            name="role"
                                            className="register-form-input"
                                            value={formData.role}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select Role...</option>
                                            <option value="student">Student</option>
                                            <option value="teacher">Teacher</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>

                                    {/* Name & Email in a row on desktop? Actually let's keep it clean as single column for simplicity and consistency with Login */}
                                    <div className="register-form-field">
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            className="register-form-input"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="register-form-field">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            className="register-form-input"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="register-form-field">
                                        <label htmlFor="phone">Phone Number</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            className="register-form-input"
                                            placeholder="Enter your phone number"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Conditional School Field */}
                                    {formData.role === 'student' && (
                                        <div className="register-form-field">
                                            <label htmlFor="school">Select your School</label>
                                            <select
                                                id="school"
                                                name="school"
                                                className="register-form-input"
                                                value={formData.school}
                                                onChange={handleChange}
                                                required
                                                disabled={loading}
                                            >
                                                <option value="">Choose School...</option>
                                                <option value="SOT">SOT (School of Technology)</option>
                                                <option value="SOET">SOET (School of Engineering & Technology)</option>
                                                <option value="SLS">SLS (School of Liberal Studies)</option>
                                                <option value="SOL">SOL (School of Law)</option>
                                                <option value="SPM">SPM (School of Petroleum Management)</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="register-form-field">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            className="register-form-input"
                                            placeholder="Create a strong password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="register-submit-btn" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Sign Up'}
                                </button>
                            </form>

                            <div className="register-login-text">
                                <p>
                                    Already have an account?{' '}
                                    <Link to="/login" className="register-login-link">
                                        Log in
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
