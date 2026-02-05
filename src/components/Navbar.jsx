/**
 * Navbar Component
 * 
 * Navigation bar with responsive mobile menu and user authentication display.
 * Shows login/signup buttons for guests and user menu for authenticated users.
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const userMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => location.pathname === path;

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  // Get user display info
  const getUserName = () => {
    return profile?.full_name || profile?.display_name || user?.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    return profile?.avatar_url || user?.user_metadata?.avatar_url;
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon">
            <span>₿</span>
          </div>
          <span className="logo-text">
            Finance<span className="logo-accent">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Beranda
          </Link>
          <a href="#features" className="nav-link">Fitur</a>
          <a href="#about" className="nav-link">Tentang</a>
        </div>

        {/* Auth Section */}
        {!loading && (
          <div className="navbar-auth">
            {user ? (
              /* User Menu (Authenticated) */
              <div className="user-menu" ref={userMenuRef}>
                <button
                  className="user-menu-trigger"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User menu"
                >
                  {getUserAvatar() ? (
                    <img
                      src={getUserAvatar()}
                      alt={getUserName()}
                      className="user-avatar"
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {getUserInitial()}
                    </div>
                  )}
                  <span className="user-name">{getUserName()}</span>
                  <svg
                    className={`chevron ${isUserMenuOpen ? 'open' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-info">
                        {getUserAvatar() ? (
                          <img
                            src={getUserAvatar()}
                            alt={getUserName()}
                            className="dropdown-avatar"
                          />
                        ) : (
                          <div className="dropdown-avatar-placeholder">
                            {getUserInitial()}
                          </div>
                        )}
                        <div className="dropdown-user-details">
                          <span className="dropdown-name">{getUserName()}</span>
                          <span className="dropdown-email">{user?.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleSignOut} className="dropdown-item signout">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Guest Buttons */
              <>
                <Link to="/login" className="btn btn-ghost">Masuk</Link>
                <Link to="/login" className="btn btn-primary">Daftar Gratis</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu */}
        <div className={`navbar-mobile ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            Beranda
          </Link>
          <a href="#features" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            Fitur
          </a>
          <a href="#about" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
            Tentang
          </a>
          <div className="mobile-auth">
            {user ? (
              <>
                <div className="mobile-user-info">
                  {getUserAvatar() ? (
                    <img src={getUserAvatar()} alt={getUserName()} className="mobile-avatar" />
                  ) : (
                    <div className="mobile-avatar-placeholder">{getUserInitial()}</div>
                  )}
                  <div className="mobile-user-details">
                    <span className="mobile-name">{getUserName()}</span>
                    <span className="mobile-email">{user?.email}</span>
                  </div>
                </div>
                <button onClick={handleSignOut} className="btn btn-ghost mobile-signout">
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost" onClick={() => setIsMenuOpen(false)}>
                  Masuk
                </Link>
                <Link to="/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
