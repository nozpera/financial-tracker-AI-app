/**
 * Onboarding Success Page
 * 
 * Shown after user completes financial profile registration.
 */

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import './OnboardingSuccess.css';

function OnboardingSuccess() {
    const navigate = useNavigate();
    const { user, profile, loading, hasCompletedRegistration } = useAuth();

    // Redirect if not authenticated or not completed registration
    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate('/login', { replace: true });
            } else if (!hasCompletedRegistration()) {
                navigate('/register', { replace: true });
            }
        }
    }, [user, loading, hasCompletedRegistration, navigate]);

    if (loading) {
        return <LoadingSpinner fullScreen message="Memuat..." />;
    }

    return (
        <main className="success-page">
            <div className="success-container">
                {/* Success Animation */}
                <div className="success-animation">
                    <div className="success-circle">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div className="confetti">
                        {[...Array(12)].map((_, i) => (
                            <span key={i} className="confetti-piece" />
                        ))}
                    </div>
                </div>

                {/* Success Message */}
                <div className="success-content">
                    <h1 className="success-title">Selamat Datang, {profile?.full_name || 'User'}! 🎉</h1>
                    <p className="success-subtitle">
                        Profil keuangan Anda telah berhasil dibuat.
                    </p>
                </div>

                {/* Features Preview */}
                <div className="features-preview">
                    <h3>Apa yang bisa Anda lakukan selanjutnya:</h3>
                    <div className="feature-items">
                        <div className="feature-item">
                            <span className="feature-icon">📊</span>
                            <div className="feature-text">
                                <strong>Lihat Dashboard</strong>
                                <span>Pantau kondisi keuangan Anda secara real-time</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">💬</span>
                            <div className="feature-text">
                                <strong>Catat via Telegram</strong>
                                <span>Kirim pesan untuk mencatat pengeluaran dengan mudah</span>
                            </div>
                        </div>
                        <div className="feature-item">
                            <span className="feature-icon">🤖</span>
                            <div className="feature-text">
                                <strong>Tanya AI Assistant</strong>
                                <span>Dapatkan insight dan saran keuangan personal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="success-actions">
                    <Link to="/" className="btn btn-primary btn-lg">
                        <span>Mulai Menggunakan Aplikasi</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Tip */}
                <div className="success-tip">
                    <span className="tip-icon">💡</span>
                    <span>Tip: Hubungkan bot Telegram untuk pencatatan yang lebih mudah!</span>
                </div>
            </div>
        </main>
    );
}

export default OnboardingSuccess;
