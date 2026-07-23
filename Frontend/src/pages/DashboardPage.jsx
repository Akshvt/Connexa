import { useState, useEffect } from 'react';
import { Download, Plus } from 'lucide-react';
import StatsBar from '../components/dashboard/StatsBar';
import FilterBar from '../components/dashboard/FilterBar';
import LeadsTable from '../components/dashboard/LeadsTable';
import LeadModal from '../components/dashboard/LeadModal';
import api from '../api/axios';

export default function DashboardPage() {
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    country: '',
    status: '',
    channel: ''
  });

  const [stats, setStats] = useState({ total: 0, countriesCovered: 0 });
  const [selectedLead, setSelectedLead] = useState(null);

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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.country) params.append('country', filters.country);
      if (filters.status) params.append('status', filters.status);
      if (filters.channel) params.append('channel', filters.channel);

      const response = await api.get(`/api/leads/export?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'namhya-leads.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Leads</h1>
          <p style={styles.subtitle}>
            {stats.total} total contacts across {stats.countriesCovered} markets
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.exportBtn} onClick={handleExport}>
            <Download size={14} />
            Export CSV
          </button>
          <button style={styles.addBtn} onClick={() => alert('Add Lead Modal coming soon!')}>
            <Plus size={16} />
            Add Lead
          </button>
        </div>
      </header>

      <StatsBar />
      
      <div style={styles.tableSection}>
        <FilterBar filters={filters} setFilters={setFilters} />
        <LeadsTable 
          filters={filters} 
          setFilters={setFilters} 
          onLeadClick={setSelectedLead} 
        />
      </div>

      <LeadModal 
        lead={selectedLead} 
        onClose={() => setSelectedLead(null)}
        onUpdate={(updatedLead) => {
          setSelectedLead(updatedLead);
          // Optional: refresh table or rely on LeadsTable internal state
        }}
      />
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '8px 16px',
    color: 'var(--color-text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'var(--color-jade)',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    color: '#0D1117', // Dark text on jade for contrast
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  tableSection: {
    // optional wrapper styles
  }
};
