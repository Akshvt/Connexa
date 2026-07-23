import { useState, useEffect } from 'react';
import { Copy, MoreHorizontal, Search } from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../common/StatusBadge';
import Pagination from '../common/Pagination';

const COUNTRY_MAP = {
  'United States': { flag: '🇺🇸', abbr: 'US' },
  'United Kingdom': { flag: '🇬🇧', abbr: 'UK' },
  'Canada': { flag: '🇨🇦', abbr: 'CA' },
  'Australia': { flag: '🇦🇺', abbr: 'AU' },
  'India': { flag: '🇮🇳', abbr: 'IN' },
};

export default function LeadsTable({ filters, setFilters, onLeadClick, refreshKey = 0 }) {
  const [data, setData] = useState({ leads: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page);
        if (filters.search) params.append('search', filters.search);
        if (filters.country) params.append('country', filters.country);
        if (filters.status) params.append('status', filters.status);
        if (filters.channel) params.append('channel', filters.channel);
        
        const res = await api.get(`/api/leads?${params.toString()}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load leads', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, [filters, refreshKey]);

  const handleCopy = (e, email, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (e, id, newStatus) => {
    e.stopPropagation();
    try {
      await api.put(`/api/leads/${id}`, { status: newStatus });
      // update local state
      setData(prev => ({
        ...prev,
        leads: prev.leads.map(lead => lead._id === id ? { ...lead, status: newStatus } : lead)
      }));
      setActiveMenuId(null);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleMenuToggle = (e, id) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  if (!loading && data.leads.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyCard}>
          <Search size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
          <h3 style={styles.emptyTitle}>No leads match these filters</h3>
          <p style={styles.emptySub}>Try adjusting your search or run the pipeline to fetch more leads.</p>
          <button style={styles.runPipelineBtn} onClick={() => alert('Run pipeline from top bar')}>
            Run Pipeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Company</th>
              <th style={styles.th}>Country</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Channel</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Added</th>
              <th style={{ ...styles.th, width: '40px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {data.leads.map(lead => {
              const countryInfo = COUNTRY_MAP[lead.country] || { flag: '🌐', abbr: lead.country || 'Unknown' };
              const addedDate = new Date(lead.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <tr 
                  key={lead._id} 
                  style={styles.tr} 
                  onClick={() => onLeadClick && onLeadClick(lead)}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.background = 'var(--color-glass-bg)'; 
                    const nameDiv = e.currentTarget.querySelector('.contact-name');
                    if (nameDiv) nameDiv.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.background = 'transparent'; 
                    const nameDiv = e.currentTarget.querySelector('.contact-name');
                    if (nameDiv) nameDiv.style.transform = 'translateX(0)';
                  }}
                >
                  <td style={styles.td}>
                    <div className="contact-name" style={styles.contactName}>{lead.fullName || 'Unknown'}</div>
                    <div style={styles.contactDesig}>{lead.company || '-'}</div>
                  </td>
                  <td style={styles.td}>{lead.company || '-'}</td>
                  <td style={styles.td}>
                    {countryInfo.abbr}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.emailWrapper}>
                      <span style={styles.emailText}>{lead.email || '-'}</span>
                      {lead.email && (
                        <button style={styles.copyBtn} onClick={(e) => handleCopy(e, lead.email, lead._id)}>
                          {copiedId === lead._id ? <span style={styles.copiedText}>Copied!</span> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>{lead.outreachChannel || '-'}</td>
                  <td style={styles.td}><StatusBadge status={lead.status} /></td>
                  <td style={{ ...styles.td, color: 'var(--color-text-muted)' }}>{addedDate}</td>
                  <td style={{ ...styles.td, position: 'relative' }}>
                    <button style={styles.actionBtn} onClick={(e) => handleMenuToggle(e, lead._id)}>
                      <MoreHorizontal size={16} />
                    </button>
                    {activeMenuId === lead._id && (
                      <div style={styles.actionMenu}>
                        {['new', 'contacted', 'responded', 'converted', 'not_relevant'].map(st => (
                          <div 
                            key={st} 
                            style={styles.menuItem} 
                            onClick={(e) => handleStatusChange(e, lead._id, st)}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-glass-border)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            Mark as {st.replace('_', ' ')}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination 
        page={data.page} 
        pages={data.pages} 
        onPageChange={(p) => setFilters(prev => ({ ...prev, page: p }))} 
      />
    </div>
  );
}

const styles = {
  container: {
    background: 'transparent',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    fontFamily: "var(--font-primary)",
    fontWeight: 600,
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--color-glass-border)',
  },
  tr: {
    borderBottom: '1px solid var(--color-glass-border)',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px 16px',
    fontFamily: "var(--font-primary)",
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    verticalAlign: 'middle',
  },
  contactName: {
    fontFamily: "var(--font-primary)",
    fontWeight: 500,
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    transition: 'transform 0.2s',
  },
  contactDesig: {
    fontFamily: "var(--font-primary)",
    fontWeight: 400,
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  flag: {
    marginRight: '6px',
    fontSize: '14px',
  },
  emailWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    position: 'relative',
    '&:hover button': {
      opacity: 1,
    }
  },
  emailText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '13px',
  },
  copyBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    transition: 'opacity 0.15s, color 0.15s',
  },
  copiedText: {
    fontSize: '11px',
    color: 'var(--color-jade)',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  actionMenu: {
    position: 'absolute',
    right: '30px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'var(--color-glass-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--color-glass-border)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-card)',
    zIndex: 10,
    minWidth: '150px',
    padding: '8px',
  },
  menuItem: {
    padding: '8px 12px',
    borderRadius: '8px',
    fontFamily: "var(--font-primary)",
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    textTransform: 'capitalize',
    transition: 'background 0.2s',
  },
  emptyContainer: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderTop: 'none',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px',
    padding: '80px 20px',
    display: 'flex',
    justifyContent: 'center',
  },
  emptyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '300px',
  },
  emptyTitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '15px',
    color: 'var(--color-text-primary)',
    margin: '0 0 8px 0',
  },
  emptySub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    margin: '0 0 24px 0',
    lineHeight: 1.5,
  },
  runPipelineBtn: {
    background: 'var(--color-jade)',
    color: '#0D1117',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  }
};
