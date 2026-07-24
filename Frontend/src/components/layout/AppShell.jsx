import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  LogOut,
  Search,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import PipelinePulse from './PipelinePulse.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard',  to: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Automation', to: '/pipeline',  icon: <Zap size={20} /> },
  { label: 'Analytics',  to: '/analytics', icon: <BarChart3 size={20} /> },
];

export default function AppShell({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Determine title based on route
  let pageTitle = 'Connexa';
  if (location.pathname.includes('/dashboard')) pageTitle = 'Dashboard';
  if (location.pathname.includes('/pipeline')) pageTitle = 'Pipeline Automation';
  if (location.pathname.includes('/analytics')) pageTitle = 'Analytics';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      
      {/* ══════════ SIDEBAR OVERLAY (mobile/tablet) ══════════ */}
      <div 
        className={`app-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)} 
      />

      {/* ══════════ SIDEBAR ══════════ */}
      <nav className={`app-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
        display: 'flex', flexDirection: 'column', width: '256px', position: 'fixed', left: 0, top: 0, bottom: 0,
        backgroundColor: 'var(--color-sidebar-bg)', 
        borderRight: '1px solid var(--color-glass-border)',
        padding: '32px 16px', zIndex: 40,
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Brand */}
        <div style={{ marginBottom: '32px', paddingLeft: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-primary-alt)' }}>Namhya Admin</div>
          {/* Close button — visible only on mobile/tablet via CSS */}
          <button 
            className="hamburger-btn"
            onClick={() => setSidebarOpen(false)}
            style={{ width: '32px', height: '32px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {NAV_ITEMS.map(({ label, to, icon }) => (
            <li key={label}>
              <NavLink to={to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', borderRadius: '12px',
                textDecoration: 'none', transition: 'all 0.2s ease',
                ...(isActive
                  ? { backgroundColor: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', fontWeight: 500 }
                  : { color: 'var(--color-text-muted)', fontWeight: 400 })
              })}
              onMouseEnter={e => { if (e.currentTarget.style.backgroundColor !== 'var(--color-primary-container)') e.currentTarget.style.backgroundColor = 'var(--color-glass-bg)'; }}
              onMouseLeave={e => { if (e.currentTarget.style.backgroundColor !== 'var(--color-primary-container)') e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {icon}
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom Nav Links */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>
            <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'background-color 0.2s', fontSize: '16px', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-glass-bg)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <LogOut size={20} />
              Sign Out
            </button>
          </li>
        </ul>
      </nav>

      {/* ══════════ MAIN AREA ══════════ */}
      <main className="app-main" style={{ flex: 1, marginLeft: '256px', padding: '32px 40px', display: 'flex', flexDirection: 'column', maxWidth: '1600px' }}>
        
        {/* Top Header */}
        <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Hamburger — visible only on mobile/tablet via CSS */}
            <button 
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 style={{ fontSize: '40px', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--color-text-primary)', margin: 0 }}>
              {pageTitle}
            </h1>
          </div>
          
          <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="app-header-search" style={{ 
              display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-bg)', 
              border: '1px solid var(--color-glass-border)', borderRadius: '12px',
              padding: '0 12px', width: '256px', height: '40px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <Search size={18} style={{ color: 'var(--color-text-muted)', marginRight: '8px', flexShrink: 0 }} />
              <input type="text" placeholder="Search..." style={{ 
                background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text-primary)', 
                width: '100%', fontSize: '14px', minWidth: 0
              }} />
            </div>
            
            <button onClick={toggleTheme} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px',
              backgroundColor: 'var(--color-glass-bg)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--color-glass-border)', borderRadius: '999px',
              color: 'var(--color-text-primary)', cursor: 'pointer', transition: 'background-color 0.2s',
              flexShrink: 0
            }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-glass-border)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-glass-bg)'}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Pipeline Pulse Notification */}
        <div style={{ marginBottom: '24px' }}>
          <PipelinePulse />
        </div>

        {/* Content Inserted Here */}
        {children}
      </main>

    </div>
  );
}
