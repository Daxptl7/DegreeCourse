import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginAPI } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
            const response = await loginAPI(formData);

            if (response.success) {
                // Update auth context
                login(response.data);
                const adminRoles = ['super_admin', 'admin', 'moderator'];
                navigate(adminRoles.includes(response.data.role) ? '/admin' : '/');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to connect to server. Please make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneLogin = () => {
        setError('Phone login is not yet implemented');
    };

    return (
        <div className="login-container">
            <div className="login-split-card">
                {/* Left Side - Image */}
                <div className="login-image-section">
                    <div className="image-overlay">
                        <div className="overlay-content">
                            <h2>Pandit Deendayal Energy University</h2>
                            <p>Empowering the future through digital education and research.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="login-form-section">
                    <div className="login-content">
                        {/* Header */}
                        <div className="login-header">
                            <h1 className="login-title"> Welcome to PDEU</h1>
                            <p className="login-subtitle"> Online Course and Degree Program </p>
                        </div>

                        {/* Form Section */}
                        <div className="login-form-wrapper">
                            {error && <div className="error-msg">{error}</div>}

                            <form onSubmit={handleSubmit} className="login-form">
                                <div className="input-group">
                                    <div className="form-field">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            className="form-input"
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                        <div className="forgot-password">
                                            <Link to="/forgot-password">Forgot password?</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="divider">
                                    <span>or</span>
                                </div>
                                <button type="button" className="google-login-btn">
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" height="18" />
                                    Login with Google
                                </button>
                                <button type="submit" className="login-submit-btn" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Login'}
                                </button>
                            </form>

                            <div className="signup-text">
                                <p>
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="signup-link">
                                        Sign up
                                    </Link>
                                </p>
                            </div>

                            {/* Social Icons */}
                            <div className="social-icons">
                                <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
                                <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                                <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
                                <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
