import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function StatsBar() {
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
  }, []);

  const total = stats?.total ?? '-';
  const week = stats?.addedThisWeek ?? '-';
  const countries = stats?.countriesCovered ?? '-';
  const contacted = stats?.contacted ?? '-';

  return (
    <div style={styles.container}>
      <StatCard label="Total Leads" value={total} />
      <StatCard label="This Week" value={`+${week}`} />
      <StatCard label="Countries Covered" value={countries} />
      <StatCard label="Contacted" value={contacted} />
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.card}>
      <div style={styles.value}>{value}</div>
      <div style={styles.label}>{label}</div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    flex: 1,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '20px',
    borderLeft: '3px solid var(--color-jade)',
  },
  value: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: '32px',
    color: 'var(--color-text-primary)',
    lineHeight: 1.2,
    marginBottom: '4px',
  },
  label: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }
};
