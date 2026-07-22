import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data.token);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Heading above card */}
      <div style={styles.heading}>
        <span style={styles.brand}>Namhya LeadFlow</span>
        <span style={styles.subtitle}>Founder's Command Centre</span>
      </div>

      {/* Login card */}
      <form style={styles.card} onSubmit={handleSubmit} noValidate>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e)  => Object.assign(e.target.style, styles.input)}
            placeholder="you@namhyafoods.com"
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
            onBlur={(e)  => Object.assign(e.target.style, styles.input)}
            placeholder="••••••••"
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, #161B27 0%, #0D1117 70%)',
    gap: '28px',
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  brand: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: '28px',
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '14px',
    color: 'var(--color-text-muted)',
  },
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '40px',
    width: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxShadow: 'var(--shadow-card)',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  },
  input: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--color-text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    width: '100%',
  },
  inputFocus: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-jade)',
    borderRadius: '4px',
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    color: 'var(--color-text-primary)',
    outline: 'none',
    boxShadow: '0 0 0 3px var(--color-jade-dim)',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    width: '100%',
  },
  button: {
    width: '100%',
    padding: '11px',
    background: 'var(--color-jade)',
    color: '#0D1117',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.01em',
    transition: 'opacity 0.15s',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  error: {
    margin: 0,
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    color: '#F87171',
  },
};
