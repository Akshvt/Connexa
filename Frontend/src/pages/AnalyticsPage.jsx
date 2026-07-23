import { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import api from '../api/axios';

const PIE_COLORS = ['#00C896', '#F4A836', '#5C6478', '#A78BFA', '#F87171'];

export default function AnalyticsPage() {
  const [data, setData] = useState({
    byCountry: [],
    byStatus: [],
    byChannel: [],
    byDay: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.get('/api/analytics/summary');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--color-text-muted)' }}>Loading analytics...</div>;
  }

  // Sort byStatus by count descending
  const sortedStatus = [...(data.byStatus || [])].sort((a, b) => b.count - a.count);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <p style={styles.subtitle}>Performance across markets</p>
      </header>

      <div style={styles.grid}>
        
        {/* 1. Horizontal BarChart (Leads by Country) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Leads by Country</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byCountry} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
                <XAxis type="number" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="country" type="category" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  formatter={(value) => [value, 'Leads']} 
                />
                <Bar dataKey="count" fill="var(--color-jade)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. PieChart (Donut) (Outreach Channel) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Channel Breakdown</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.byChannel}
                  dataKey="count"
                  nameKey="channel"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  stroke="none"
                >
                  {data.byChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, 'Leads']} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-muted)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. BarChart (Status Funnel) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Status Funnel</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedStatus} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: 'var(--color-text-muted)', fontSize: 12, textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(value) => [value, 'Leads']}
                />
                <Bar dataKey="count" fill="var(--color-jade)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. LineChart (Leads Added per Day) */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Leads Added (Last 14 Days)</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.byDay} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(tick) => {
                    // Just show month/day e.g. "Jul 22"
                    if (!tick) return '';
                    const d = new Date(tick);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={tooltipStyle} 
                  labelStyle={{ color: 'var(--color-text-primary)' }}
                  formatter={(value) => [value, 'Leads']}
                />
                <Line type="monotone" dataKey="count" stroke="var(--color-jade)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-jade)', stroke: 'var(--color-surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

const tooltipStyle = {
  background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  color: 'white',
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px'
};

const styles = {
  page: {
    width: '100%',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: '28px',
    color: 'var(--color-text-primary)',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  card: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '340px',
  },
  cardTitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    margin: '0 0 20px 0',
  },
  chartWrapper: {
    flex: 1,
    width: '100%',
    minHeight: 0, // important for flexbox shrinking with recharts
  }
};
