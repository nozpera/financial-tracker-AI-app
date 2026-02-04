import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => location.pathname === path;

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

        {/* Auth Buttons */}
        <div className="navbar-auth">
          <Link to="/login" className="btn btn-ghost">Masuk</Link>
          <Link to="/login" className="btn btn-primary">Daftar Gratis</Link>
        </div>

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
            <Link to="/login" className="btn btn-ghost" onClick={() => setIsMenuOpen(false)}>
              Masuk
            </Link>
            <Link to="/login" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
              Daftar Gratis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
