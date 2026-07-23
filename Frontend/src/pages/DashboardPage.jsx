import { useState, useEffect, useCallback, useRef } from 'react';
import { Download, Plus } from 'lucide-react';
import StatsBar from '../components/dashboard/StatsBar';
import FilterBar from '../components/dashboard/FilterBar';
import LeadsTable from '../components/dashboard/LeadsTable';
import LeadModal from '../components/dashboard/LeadModal';
import api from '../api/axios';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const POLL_INTERVAL = 30000; // 30 seconds

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
  const [refreshKey, setRefreshKey] = useState(0);
  const pollRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/api/analytics/summary');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchStats();

    // Poll for real-time updates
    pollRef.current = setInterval(() => {
      fetchStats();
      setRefreshKey(k => k + 1); // triggers LeadsTable re-fetch
    }, POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [fetchStats]);

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
    <div className="animate-fade-in-up" style={{ width: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleExport}>
            <Download size={14} style={{ marginRight: '8px' }} />
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => alert('Add Lead Modal coming soon!')}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Add Lead
          </Button>
        </div>
      </header>

      <div style={{ marginBottom: '32px' }}>
        <StatsBar refreshKey={refreshKey} />
      </div>
      
      <Card hover={false} style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <FilterBar filters={filters} setFilters={setFilters} />
        </div>
        <LeadsTable 
          filters={filters} 
          setFilters={setFilters} 
          onLeadClick={setSelectedLead}
          refreshKey={refreshKey}
        />
      </Card>

      <LeadModal 
        lead={selectedLead} 
        onClose={() => setSelectedLead(null)}
        onUpdate={(updatedLead) => {
          setSelectedLead(updatedLead);
        }}
      />
    </div>
  );
}
