import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { LayoutDashboard, FileText, Database } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',  to: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Pipeline',   to: '/pipeline',  icon: <Database size={18} /> },
  { label: 'Analytics',  to: '/analytics', icon: <FileText size={18} /> },
];

export default function Sidebar() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  let email = '';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      email = payload.email || '';
    }
  } catch (_) {}

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={styles.sidebar}>
      {/* ── Logo ── */}
      <div style={styles.logoWrap}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--color-bg-elevated)', fontWeight: 'bold' }}>N</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={styles.logoLine1}>Namhya</span>
          <span style={styles.logoLine2}>LeadFlow</span>
        </div>
      </div>

      <div style={styles.divider} />

      {/* ── Nav ── */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : styles.navItemInactive),
            })}
          >
            <span style={styles.navIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div style={styles.footer}>
        <span style={styles.userEmail}>{email}</span>
        <button
          id="sidebar-logout"
          onClick={handleLogout}
          style={styles.logoutBtn}
          onMouseEnter={(e) => Object.assign(e.target.style, styles.logoutBtnHover)}
          onMouseLeave={(e) => Object.assign(e.target.style, styles.logoutBtn)}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'transparent', // Handled by AppShell glassmorphism
  },
  logoWrap: {
    padding: '32px 24px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    lineHeight: 1.15,
  },
  logoLine1: {
    fontFamily: "var(--font-primary)",
    fontWeight: 700,
    fontSize: '16px',
    color: 'var(--color-text-primary)',
  },
  logoLine2: {
    fontFamily: "var(--font-primary)",
    fontWeight: 600,
    fontSize: '12px',
    color: 'var(--color-primary)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  divider: {
    height: '1px',
    background: 'var(--color-border)',
    margin: '0 24px 16px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0 16px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    borderLeft: '3px solid var(--color-primary)',
    color: 'var(--color-primary)',
    background: 'rgba(107, 127, 79, 0.1)', // Primary color very low opacity
  },
  navItemInactive: {
    color: 'var(--color-text-secondary)',
    background: 'transparent',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  footer: {
    padding: '24px',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  userEmail: {
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 12px',
    fontSize: '13px',
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: 'fit-content',
  },
  logoutBtnHover: {
    background: 'var(--color-glass-bg)',
    border: '1px solid var(--color-primary)',
    color: 'var(--color-primary)',
  },
};
