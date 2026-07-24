import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StatsBar({ refreshKey = 0 }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/api/analytics/summary');
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }
    fetchStats();
  }, [refreshKey]);

  const total = stats?.total ?? '-';
  const week = stats?.addedThisWeek ?? '-';
  const countries = stats?.countriesCovered ?? '-';
  const contacted = stats?.contacted ?? '-';

  return (
    <div className="stats-grid" style={styles.container}>
      <StatCard icon="group" label="Total Leads" value={total} color="var(--color-primary-alt)" />
      <StatCard icon="trending_up" label="Leads This Week" value={`+${week}`} color="var(--color-primary-alt)" />
      <StatCard icon="public" label="Active Markets" value={countries} color="var(--color-primary-alt)" />
      <StatCard icon="forward_to_inbox" label="Ready for Outreach" value={contacted} color="var(--color-secondary)" />
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ ...styles.card, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={styles.label}>{label}</div>
      </div>
      <div className="stat-value" style={{ ...styles.value, color: color === 'var(--color-secondary)' ? 'var(--color-secondary)' : 'var(--color-text-primary)' }}>{value}</div>
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    background: 'var(--color-glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--color-glass-border)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-card)',
  },
  value: {
    fontFamily: "var(--font-primary)",
    fontWeight: 700,
    fontSize: '40px',
    lineHeight: 1.2,
    marginTop: '4px',
  },
  label: {
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
  }
};
