import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const navStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '72px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--spacing-xxl)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    backgroundColor: scrolled ? 'var(--color-glass-bg)' : 'transparent',
    backdropFilter: scrolled ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
    borderBottom: scrolled ? '1px solid var(--color-glass-border)' : '1px solid transparent',
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const linkStyle = {
    color: 'var(--color-text-primary)',
    fontWeight: '600',
    fontSize: '14px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    margin: '0 var(--spacing-lg)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const mobileLinkStyle = {
    color: 'var(--color-text-primary)',
    fontWeight: '600',
    fontSize: '14px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '8px 0',
  };

  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/analytics') || location.pathname.includes('/pipeline');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className="navbar-root" style={navStyle}>
        <Link to="/" style={logoStyle}>
          <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'var(--color-primary)' }}></div>
          Connexa
        </Link>

        {/* Center nav links — hidden on mobile/tablet via CSS */}
        <div className="navbar-center">
          {!isDashboard && (
            <>
              <Link to="/docs" style={linkStyle}>How It Works</Link>
            </>
          )}
          
          {isDashboard && (
             <>
               <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
               <Link to="/pipeline" style={linkStyle}>Pipeline</Link>
               <Link to="/analytics" style={linkStyle}>Analytics</Link>
             </>
          )}
        </div>

        <div className="navbar-right">
          <button onClick={toggleTheme} style={{ background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '50%', width: '40px', height: '40px', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <span className="hide-mobile">
            {user ? (
              <>
                <Link to="/dashboard" style={{ marginRight: '8px' }}><Button variant="primary">Dashboard</Button></Link>
                <Button variant="secondary" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="secondary">Login</Button></Link>
                <Link to="/login" style={{ marginLeft: '8px' }}><Button variant="primary">Get Started</Button></Link>
              </>
            )}
          </span>

          {/* Hamburger button — visible on mobile/tablet via CSS */}
          <button
            className="navbar-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <div className={`navbar-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {!isDashboard && (
          <Link to="/docs" style={mobileLinkStyle}>How It Works</Link>
        )}
        
        {isDashboard && (
          <>
            <Link to="/dashboard" style={mobileLinkStyle}>Dashboard</Link>
            <Link to="/pipeline" style={mobileLinkStyle}>Pipeline</Link>
            <Link to="/analytics" style={mobileLinkStyle}>Analytics</Link>
          </>
        )}

        <div style={{ borderTop: '1px solid var(--color-glass-border)', paddingTop: '12px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {user ? (
            <>
              <Link to="/dashboard"><Button variant="primary" style={{ width: '100%' }}>Dashboard</Button></Link>
              <Button variant="secondary" onClick={handleLogout} style={{ width: '100%' }}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="secondary" style={{ width: '100%' }}>Login</Button></Link>
              <Link to="/login"><Button variant="primary" style={{ width: '100%' }}>Get Started</Button></Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
