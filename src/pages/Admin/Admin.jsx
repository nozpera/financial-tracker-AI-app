/**
 * Admin Panel Page
 * 
 * Main admin dashboard for superadmin users.
 * Provides overview and quick access to preview pages.
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Admin.css';

function Admin() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        await signOut();
        navigate('/login');
    };

    // Quick links for page previews
    const previewLinks = [
        {
            title: 'Home Page',
            description: 'Landing page publik yang dilihat pengunjung',
            path: '/',
            icon: '🏠',
            color: 'var(--color-primary)'
        },
        {
            title: 'Login Page',
            description: 'Halaman masuk untuk user',
            path: '/login',
            icon: '🔐',
            color: 'var(--color-secondary)'
        },
        {
            title: 'Register Page',
            description: 'Form registrasi multi-step',
            path: '/register',
            icon: '📝',
            color: 'var(--color-accent)'
        }
    ];

    // Stats cards (placeholder for future)
    const stats = [
        { label: 'Total Users', value: '-', icon: '👥' },
        { label: 'New Today', value: '-', icon: '📈' },
        { label: 'Active Sessions', value: '-', icon: '🟢' },
        { label: 'Pending Reviews', value: '-', icon: '⏳' }
    ];

    return (
        <div className="admin-page">
            {/* Admin Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="admin-logo">
                        <span className="logo-icon">₿</span>
                        <span className="logo-text">Finance<span className="accent">AI</span></span>
                    </div>
                    <span className="admin-badge">Admin</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <span className="nav-section-title">Menu</span>
                        <a href="#overview" className="nav-item active">
                            <span className="nav-icon">📊</span>
                            Overview
                        </a>
                        <a href="#users" className="nav-item">
                            <span className="nav-icon">👥</span>
                            Users
                            <span className="nav-badge coming-soon">Soon</span>
                        </a>
                        <a href="#analytics" className="nav-item">
                            <span className="nav-icon">📈</span>
                            Analytics
                            <span className="nav-badge coming-soon">Soon</span>
                        </a>
                        <a href="#settings" className="nav-item">
                            <span className="nav-icon">⚙️</span>
                            Settings
                            <span className="nav-badge coming-soon">Soon</span>
                        </a>
                    </div>

                    <div className="nav-section">
                        <span className="nav-section-title">Preview Pages</span>
                        {previewLinks.map((link, index) => (
                            <Link key={index} to={link.path} className="nav-item" target="_blank">
                                <span className="nav-icon">{link.icon}</span>
                                {link.title}
                                <span className="nav-arrow">↗</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <div className="user-avatar">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" />
                            ) : (
                                <span>{profile?.full_name?.[0] || 'A'}</span>
                            )}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{profile?.full_name || 'Admin'}</span>
                            <span className="user-role">Superadmin</span>
                        </div>
                    </div>
                    <button
                        className="logout-btn"
                        onClick={handleSignOut}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? '...' : '🚪'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Dashboard Overview</h1>
                        <p>Selamat datang kembali, {profile?.full_name || 'Admin'}!</p>
                    </div>
                    <div className="header-right">
                        <span className="current-date">
                            {new Date().toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon">{stat.icon}</div>
                            <div className="stat-content">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Preview Links Section */}
                <section className="preview-section">
                    <h2>Preview Pages</h2>
                    <p className="section-description">
                        Akses cepat untuk melihat halaman-halaman utama aplikasi
                    </p>

                    <div className="preview-grid">
                        {previewLinks.map((link, index) => (
                            <Link
                                key={index}
                                to={link.path}
                                className="preview-card"
                                target="_blank"
                            >
                                <div className="preview-icon" style={{ background: link.color }}>
                                    {link.icon}
                                </div>
                                <div className="preview-content">
                                    <h3>{link.title}</h3>
                                    <p>{link.description}</p>
                                </div>
                                <span className="preview-arrow">→</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="actions-section">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <button className="action-btn" disabled>
                            <span className="action-icon">👤</span>
                            <span>Add User</span>
                            <span className="action-badge">Coming Soon</span>
                        </button>
                        <button className="action-btn" disabled>
                            <span className="action-icon">📧</span>
                            <span>Send Broadcast</span>
                            <span className="action-badge">Coming Soon</span>
                        </button>
                        <button className="action-btn" disabled>
                            <span className="action-icon">📊</span>
                            <span>Export Data</span>
                            <span className="action-badge">Coming Soon</span>
                        </button>
                        <button className="action-btn" disabled>
                            <span className="action-icon">🔧</span>
                            <span>System Config</span>
                            <span className="action-badge">Coming Soon</span>
                        </button>
                    </div>
                </section>

                {/* System Info */}
                <section className="system-info">
                    <h2>System Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">User ID</span>
                            <span className="info-value">{user?.id?.slice(0, 8)}...</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Email</span>
                            <span className="info-value">{profile?.email || user?.email}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Role</span>
                            <span className="info-value role-badge">SUPERADMIN</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Environment</span>
                            <span className="info-value">Development</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Admin;
