import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios.js';

// ── Inject keyframes once ────────────────────────────────────────────────────
const STYLE_ID = 'pipeline-pulse-keyframes';
if (!document.getElementById(STYLE_ID)) {
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
    @keyframes breathe {
      0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 200, 150, 0.5); }
      50%       { opacity: 0.8; transform: scale(1.25); box-shadow: 0 0 0 5px rgba(0, 200, 150, 0); }
    }
  `;
  document.head.appendChild(el);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins   = Math.floor(diffMs / 60_000);
  const hrs    = Math.floor(diffMs / 3_600_000);
  const days   = Math.floor(diffMs / 86_400_000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hrs  < 24)  return `${hrs}h ago`;
  return `${days}d ago`;
}

function getDotStyle(run) {
  if (!run) {
    return { color: 'var(--color-text-muted)', animation: 'none', label: 'muted' };
  }
  const isRecent = Date.now() - new Date(run.startedAt).getTime() < 86_400_000;
  if (run.status === 'failed') {
    return { color: 'var(--color-saffron)', animation: 'none', label: 'saffron' };
  }
  if (isRecent) {
    return { color: 'var(--color-jade)', animation: 'breathe 2.4s ease-in-out infinite', label: 'jade' };
  }
  return { color: 'var(--color-text-muted)', animation: 'none', label: 'muted' };
}

function getPulseText(run) {
  if (!run) return 'No pipeline runs yet';
  const ago = timeAgo(run.startedAt);
  const leads = run.leadsAdded || 0;
  if (run.status === 'running') return `Pipeline running · Started ${ago}`;
  if (run.status === 'failed')  return `Pipeline failed · Last run ${ago}`;
  return `Pipeline active · Last run ${ago} · +${leads} lead${leads !== 1 ? 's' : ''} added`;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function PipelinePulse() {
  const [run, setRun]         = useState(null);
  const [firing, setFiring]   = useState(false);
  const intervalRef           = useRef(null);

  async function fetchLatest() {
    try {
      const { data } = await api.get('/api/pipeline-runs/latest');
      setRun(data);
    } catch (_) {
      // silently ignore — bar still renders in degraded state
    }
  }

  useEffect(() => {
    fetchLatest();
    intervalRef.current = setInterval(fetchLatest, 30_000);
    return () => clearInterval(intervalRef.current);
  }, []);

  async function handleRunNow() {
    const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
    if (!webhookUrl) return;
    setFiring(true);
    try {
      await fetch(webhookUrl, { method: 'POST' });
    } catch (_) {
      // webhook fired — response errors are fine
    } finally {
      setTimeout(() => setFiring(false), 2000);
    }
  }

  const dot  = getDotStyle(run);
  const text = getPulseText(run);

  return (
    <div style={styles.bar}>
      {/* Left cluster: dot + text */}
      <div style={styles.left}>
        <span
          style={{
            ...styles.dot,
            background: dot.color,
            animation: dot.animation,
          }}
        />
        <span style={styles.text}>{text}</span>
      </div>

      {/* Right: Run Now */}
      <button
        id="pipeline-run-now"
        onClick={handleRunNow}
        disabled={firing}
        style={firing ? { ...styles.runBtn, ...styles.runBtnFiring } : styles.runBtn}
        onMouseEnter={(e) => { if (!firing) Object.assign(e.target.style, styles.runBtnHover); }}
        onMouseLeave={(e) => { if (!firing) Object.assign(e.target.style, styles.runBtn); }}
      >
        {firing ? 'Triggered ✓' : 'Run Now'}
      </button>
    </div>
  );
}

const styles = {
  bar: {
    height: '48px',
    width: '100%',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-glass-border)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px 0 24px',
    boxShadow: 'var(--shadow-card)',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  dot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  text: {
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.01em',
  },
  runBtn: {
    background: 'transparent',
    border: '1px solid var(--color-glass-border)',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    transition: 'background 0.15s',
    letterSpacing: '0.01em',
  },
  runBtnHover: {
    background: 'var(--color-glass-bg)',
    border: '1px solid var(--color-jade)',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    color: 'var(--color-jade)',
    cursor: 'pointer',
    transition: 'background 0.15s',
    letterSpacing: '0.01em',
  },
  runBtnFiring: {
    background: 'var(--color-glass-bg)',
    border: '1px solid var(--color-glass-border)',
    borderRadius: '6px',
    padding: '6px 14px',
    fontSize: '12px',
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    cursor: 'not-allowed',
    opacity: 0.7,
    letterSpacing: '0.01em',
  },
};
