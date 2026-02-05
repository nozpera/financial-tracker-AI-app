/**
 * Login Page
 * 
 * Login/Signup page with Email/Password and Google OAuth options.
 * Redirects authenticated users to home or register based on status.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import './Login.css';

function Login() {
    const navigate = useNavigate();
    const {
        user,
        profile,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        hasCompletedRegistration,
        clearError
    } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (user && profile) {
            if (hasCompletedRegistration()) {
                navigate('/', { replace: true });
            } else {
                navigate('/register', { replace: true });
            }
        }
    }, [user, profile, navigate, hasCompletedRegistration]);

    // Clear errors when switching tabs
    useEffect(() => {
        setAuthError(null);
        setSuccessMessage(null);
        clearError?.();
    }, [activeTab]);

    // Handle form input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setAuthError(null);
    };

    // Validate form
    const validateForm = () => {
        if (!formData.email) {
            setAuthError('Email wajib diisi');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setAuthError('Format email tidak valid');
            return false;
        }

        if (!formData.password) {
            setAuthError('Password wajib diisi');
            return false;
        }

        if (formData.password.length < 6) {
            setAuthError('Password minimal 6 karakter');
            return false;
        }

        if (activeTab === 'signup') {
            if (formData.password !== formData.confirmPassword) {
                setAuthError('Password tidak cocok');
                return false;
            }
        }

        return true;
    };

    // Handle Email/Password Login
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setAuthError(null);

        const { error } = await signInWithEmail(formData.email, formData.password);

        if (error) {
            // Translate common errors to Indonesian
            let errorMessage = error.message;
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = 'Email belum dikonfirmasi. Silakan cek inbox Anda.';
            }
            setAuthError(errorMessage);
        }

        setIsSubmitting(false);
    };

    // Handle Email/Password Signup
    const handleEmailSignup = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setAuthError(null);

        const { error, message } = await signUpWithEmail(
            formData.email,
            formData.password,
            formData.fullName
        );

        if (error) {
            let errorMessage = error.message;
            if (error.message.includes('already registered')) {
                errorMessage = 'Email sudah terdaftar. Silakan login.';
            }
            setAuthError(errorMessage);
        } else if (message) {
            setSuccessMessage(message);
        }

        setIsSubmitting(false);
    };

    // Handle Google Sign In
    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        setAuthError(null);

        const { error } = await signInWithGoogle();

        if (error) {
            setAuthError(error.message);
            setIsSubmitting(false);
        }
    };

    // Show loading if checking auth state
    if (loading) {
        return <LoadingSpinner fullScreen message="Memuat..." />;
    }

    return (
        <main className="login-page">
            {/* Left Side - Branding */}
            <div className="login-branding">
                <div className="branding-content">
                    <Link to="/" className="branding-logo">
                        <div className="logo-icon">
                            <span>₿</span>
                        </div>
                        <span className="logo-text">
                            Finance<span className="logo-accent">AI</span>
                        </span>
                    </Link>
                    <h1 className="branding-title">
                        Kelola keuangan Anda dengan kecerdasan buatan
                    </h1>
                    <p className="branding-description">
                        Catat pengeluaran, analisis keuangan, dan dapatkan insight personal dari AI assistant Anda.
                    </p>
                    <div className="branding-features">
                        <div className="branding-feature">
                            <span className="feature-check">✓</span>
                            <span>Input via Telegram</span>
                        </div>
                        <div className="branding-feature">
                            <span className="feature-check">✓</span>
                            <span>Dashboard real-time</span>
                        </div>
                        <div className="branding-feature">
                            <span className="feature-check">✓</span>
                            <span>AI-powered insights</span>
                        </div>
                    </div>
                </div>
                <div className="branding-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                    <div className="decoration-circle circle-3"></div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-section">
                <div className="login-form-container">
                    {/* Tabs */}
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Masuk
                        </button>
                        <button
                            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                            onClick={() => setActiveTab('signup')}
                        >
                            Daftar
                        </button>
                    </div>

                    <div className="form-header">
                        <h2 className="form-title">
                            {activeTab === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
                        </h2>
                        <p className="form-subtitle">
                            {activeTab === 'login'
                                ? 'Masuk ke akun Anda untuk melanjutkan'
                                : 'Daftar untuk mulai mengelola keuangan Anda'}
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMessage && (
                        <div className="auth-success">
                            <span className="success-icon">✅</span>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {(authError || error) && (
                        <div className="auth-error">
                            <span className="error-icon">⚠️</span>
                            <span>{authError || error}</span>
                        </div>
                    )}

                    {/* Email/Password Form */}
                    <form onSubmit={activeTab === 'login' ? handleEmailLogin : handleEmailSignup} className="login-form">
                        {/* Full Name (Signup only) */}
                        {activeTab === 'signup' && (
                            <div className="form-group">
                                <label htmlFor="fullName" className="form-label">Nama Lengkap</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nama lengkap Anda"
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nama@email.com"
                                    className="form-input"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={activeTab === 'signup' ? 'Minimal 6 karakter' : 'Masukkan password'}
                                    className="form-input"
                                    autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password (Signup only) */}
                        {activeTab === 'signup' && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Masukkan ulang password"
                                        className="form-input"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="btn-loading">
                                    <div className="btn-spinner"></div>
                                    <span>Memproses...</span>
                                </div>
                            ) : (
                                activeTab === 'login' ? 'Masuk' : 'Daftar Sekarang'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="form-divider">
                        <span>atau</span>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        className="google-signin-btn"
                        onClick={handleGoogleSignIn}
                        disabled={isSubmitting}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Lanjutkan dengan Google</span>
                    </button>

                    {/* Terms */}
                    <div className="login-info">
                        <p>
                            Dengan {activeTab === 'login' ? 'masuk' : 'mendaftar'}, Anda menyetujui{' '}
                            <a href="#">Syarat & Ketentuan</a> dan{' '}
                            <a href="#">Kebijakan Privasi</a> kami.
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="security-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        <span>Data Anda terenkripsi dan aman</span>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Login;
