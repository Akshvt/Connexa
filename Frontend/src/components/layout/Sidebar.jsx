import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard',  to: '/',          icon: '⊞' },
  { label: 'Analytics',  to: '/analytics', icon: '↗' },
  { label: 'Pipeline',   to: '/pipeline',  icon: '⚡' },
];

export default function Sidebar() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  // Decode email from JWT payload (middle segment)
  let email = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    email = payload.email || '';
  } catch (_) {}

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={styles.sidebar}>
      {/* ── Logo ── */}
      <div style={styles.logoWrap}>
        <span style={styles.logoLine1}>Namhya</span>
        <span style={styles.logoLine2}>LeadFlow</span>
      </div>

      <div style={styles.divider} />

      {/* ── Nav ── */}
      <nav style={styles.nav}>
        {NAV_ITEMS.map(({ label, to, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
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
    width: '240px',
    height: '100%',
    background: '#0D1117',
    borderRight: '1px solid #262D40',
    display: 'flex',
    flexDirection: 'column',
  },
  logoWrap: {
    padding: '24px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.15,
  },
  logoLine1: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--color-jade)',
  },
  logoLine2: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: '18px',
    color: 'var(--color-jade)',
  },
  divider: {
    height: '1px',
    background: 'var(--color-border)',
    margin: '0 0 8px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '4px 8px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'background 0.12s, color 0.12s',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    borderLeft: '3px solid var(--color-jade)',
    color: 'var(--color-jade)',
    background: 'var(--color-jade-dim)',
  },
  navItemInactive: {
    color: 'var(--color-text-muted)',
    background: 'transparent',
  },
  navIcon: {
    fontSize: '14px',
    width: '16px',
    textAlign: 'center',
    flexShrink: 0,
  },
  footer: {
    padding: '16px 20px',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userEmail: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    transition: 'border-color 0.12s, color 0.12s',
    textAlign: 'left',
    width: 'fit-content',
  },
  logoutBtnHover: {
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    transition: 'border-color 0.12s, color 0.12s',
    textAlign: 'left',
    width: 'fit-content',
  },
};
