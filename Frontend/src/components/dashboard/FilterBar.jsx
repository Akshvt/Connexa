import { useState, useEffect, useRef } from 'react';
import { Search, Download } from 'lucide-react';
import api from '../../api/axios';

const STATUS_OPTIONS = ['new', 'contacted', 'responded', 'converted', 'not_relevant'];
const CHANNEL_OPTIONS = ['Email', 'LinkedIn DM', 'WhatsApp', 'Website Contact Form'];

export default function FilterBar({ filters, setFilters }) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const searchTimeoutRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: localSearch }));
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [localSearch, setFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 })); // reset page on filter
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.country) params.append('country', filters.country);
      if (filters.status) params.append('status', filters.status);
      if (filters.channel) params.append('channel', filters.channel);

      const response = await api.get(`/api/leads/export?${params.toString()}`, {
        responseType: 'blob', // Important for file download
      });

      // Create a link element, use it to download the blob, then remove it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'namhya-leads.csv';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) fileName = fileNameMatch[1];
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  return (
    <div style={styles.bar}>
      <div style={styles.searchWrapper}>
        <Search size={16} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search name, company, email..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filtersGroup}>
        <select
          name="country"
          value={filters.country}
          onChange={handleChange}
          style={styles.select}
        >
          <option value="">All Countries</option>
          {/* We'd ideally fetch distinct countries, but hardcoding a few or relying on user input */}
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="India">India</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          style={styles.select}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        <select
          name="channel"
          value={filters.channel}
          onChange={handleChange}
          style={styles.select}
        >
          <option value="">All Channels</option>
          {CHANNEL_OPTIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <button onClick={handleExport} style={styles.exportBtn}>
          <Download size={14} />
          Export CSV
        </button>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderBottom: 'none',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 300px',
    maxWidth: '400px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
  },
  searchInput: {
    width: '100%',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '8px 12px 8px 36px',
    color: 'var(--color-text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    outline: 'none',
  },
  filtersGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  select: {
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '8px 32px 8px 12px',
    color: 'var(--color-text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A0A8BC%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px top 50%',
    backgroundSize: '10px auto',
    cursor: 'pointer',
  },
  exportBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '8px 14px',
    color: 'var(--color-text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s',
  }
};
