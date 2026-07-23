import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import ShaderBackground from '../components/effects/ShaderBackground';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const isEmailActive = emailFocused || email.length > 0;
  const isPassActive  = passFocused || password.length > 0;

  return (
    <div style={{
      backgroundColor: 'var(--color-bg)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Full-screen Shader Background */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      }}>
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }}>
          <ShaderBackground />
        </div>
      </div>

      {/* Minimal Navbar — just the logo */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', height: '72px', zIndex: 50,
        background: 'var(--landing-glass-bg)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--landing-glass-border)',
        display: 'flex', alignItems: 'center', padding: '0 32px',
      }}>
        <Link to="/" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '-0.5px' }}>
          Connexa
        </Link>
      </nav>

      {/* Main Content */}
      <main style={{
        flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 10, padding: '96px 16px',
      }}>
        {/* Login Card */}
        <div style={{
          width: '100%', maxWidth: '448px',
          background: 'var(--landing-glass-bg)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--landing-glass-border)',
          borderRadius: '24px', padding: '32px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Internal glow blob */}
          <div style={{
            position: 'absolute', top: '-96px', right: '-96px',
            width: '192px', height: '192px',
            background: 'var(--color-primary)', opacity: 0.1,
            borderRadius: '50%', filter: 'blur(48px)', pointerEvents: 'none',
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '40px', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: '8px' }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: '16px' }}>Access your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ position: 'relative', zIndex: 10 }}>
            {/* Email Input Group */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoComplete="email"
                required
                style={{
                  width: '100%', padding: '24px 16px 8px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${emailFocused ? 'var(--color-primary)' : 'var(--landing-glass-border)'}`,
                  borderRadius: '12px', color: 'var(--color-text-primary)',
                  fontSize: '16px', outline: 'none',
                  transition: 'border-color 0.3s ease, background-color 0.3s ease',
                  ...(emailFocused ? { backgroundColor: 'rgba(107,127,79,0.05)' } : {}),
                }}
              />
              <label htmlFor="login-email" style={{
                position: 'absolute', left: '16px',
                top: isEmailActive ? '8px' : '50%',
                transform: isEmailActive ? 'translateY(0)' : 'translateY(-50%)',
                fontSize: isEmailActive ? '12px' : '16px',
                color: emailFocused ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                transition: 'all 0.2s ease-out', pointerEvents: 'none',
              }}>Email Address</label>
            </div>

            {/* Password Input Group */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <input
                type="password"
                id="login-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                autoComplete="current-password"
                required
                style={{
                  width: '100%', padding: '24px 16px 8px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${passFocused ? 'var(--color-primary)' : 'var(--landing-glass-border)'}`,
                  borderRadius: '12px', color: 'var(--color-text-primary)',
                  fontSize: '16px', outline: 'none',
                  transition: 'border-color 0.3s ease, background-color 0.3s ease',
                  ...(passFocused ? { backgroundColor: 'rgba(107,127,79,0.05)' } : {}),
                }}
              />
              <label htmlFor="login-password" style={{
                position: 'absolute', left: '16px',
                top: isPassActive ? '8px' : '50%',
                transform: isPassActive ? 'translateY(0)' : 'translateY(-50%)',
                fontSize: isPassActive ? '12px' : '16px',
                color: passFocused ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                transition: 'all 0.2s ease-out', pointerEvents: 'none',
              }}>Password</label>
            </div>

            {/* Remember me / Forgot password row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '32px' }}>
              <a href="#" style={{
                fontSize: '14px', fontWeight: 600, letterSpacing: '0.05em',
                color: 'var(--color-primary)', transition: 'color 0.3s ease',
              }}>Forgot password?</a>
            </div>

            {error && (
              <p style={{ color: '#F87171', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>
            )}

            {/* Submit Button — full width pill with arrow */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase',
                padding: '16px', borderRadius: '999px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 14px rgba(184, 206, 151, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(184, 206, 151, 0.3)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(184, 206, 151, 0.2)'; }}
            >
              {loading ? 'Signing in…' : 'Login to Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          {/* Request Access — below separator */}
          <div style={{
            marginTop: '24px', paddingTop: '24px', textAlign: 'center',
            borderTop: '1px solid var(--landing-glass-border)',
            position: 'relative', zIndex: 10,
          }}>
            <p style={{ fontSize: '16px' }}>
              New here?{' '}
              <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 600, transition: 'color 0.3s ease' }}>
                Request Access
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
