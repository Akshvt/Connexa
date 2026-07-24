import { useState, useEffect } from 'react';
import { X, Copy, ExternalLink } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { showToast } from '../common/toast';
import api from '../../api/axios';

const STATUS_OPTIONS = ['new', 'contacted', 'responded', 'converted', 'not_relevant'];

export default function LeadModal({ lead, onClose, onUpdate }) {
  const [notes, setNotes] = useState(lead?.notes || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNotes(lead?.notes || '');
  }, [lead]);

  if (!lead) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(lead.email);
    setCopied(true);
    showToast('Copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/api/leads/${lead._id}`, { status: newStatus });
      onUpdate({ ...lead, status: newStatus });
      setIsDropdownOpen(false);
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (notes === lead.notes) return; // no change
    try {
      await api.put(`/api/leads/${lead._id}`, { notes });
      onUpdate({ ...lead, notes });
      showToast('Notes saved', 'success');
    } catch (err) {
      showToast('Failed to save notes', 'error');
    }
  };

  const addedDate = new Date(lead.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <>
      <div className="lead-modal-backdrop" style={styles.backdrop} onClick={onClose} />
      <div className="lead-modal-drawer" style={styles.drawer}>
        
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.iconBtn} onClick={onClose}><X size={20} /></button>
          
          <div style={{ position: 'relative' }}>
            <div style={{ cursor: 'pointer' }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <StatusBadge status={lead.status} />
            </div>
            {isDropdownOpen && (
              <div style={styles.dropdown}>
                {STATUS_OPTIONS.map(st => (
                  <div key={st} style={styles.dropdownItem} onClick={() => handleStatusUpdate(st)}>
                    {st.replace('_', ' ')}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={styles.divider} />

        {/* Content Body */}
        <div style={styles.body}>
          <h2 style={styles.title}>{lead.fullName || 'Unknown'}</h2>
          <p style={styles.subtitle}>
            {lead.designation || '-'} &middot; {lead.company || '-'}
          </p>

          {/* CONTACT */}
          <SectionLabel>CONTACT</SectionLabel>
          <div style={styles.divider} />
          <div style={styles.grid}>
            <div style={styles.gridLabel}>Email</div>
            <div style={styles.gridValue}>
              <span style={styles.mono}>{lead.email || '-'}</span>
              {lead.email && (
                <button style={styles.inlineBtn} onClick={handleCopy}>
                  <Copy size={12} /> {copied ? 'Copied!' : ''}
                </button>
              )}
            </div>

            <div style={styles.gridLabel}>LinkedIn</div>
            <div style={styles.gridValue}>
              {lead.linkedIn ? (
                <a href={lead.linkedIn} target="_blank" rel="noreferrer" style={styles.link}>
                  Open <ExternalLink size={12} />
                </a>
              ) : <span style={styles.mutedText}>Not found</span>}
            </div>

            <div style={styles.gridLabel}>Website</div>
            <div style={styles.gridValue}>
              {lead.website ? (
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" style={styles.link}>
                  Open <ExternalLink size={12} />
                </a>
              ) : <span style={styles.mutedText}>Not found</span>}
            </div>

            <div style={styles.gridLabel}>Channel</div>
            <div style={styles.gridValue}>{lead.outreachChannel || '-'}</div>
          </div>

          {/* WHY THIS LEAD */}
          <SectionLabel style={{ marginTop: '32px' }}>WHY THIS LEAD</SectionLabel>
          <div style={styles.divider} />
          <div style={styles.textBlock}>
            {lead.relevanceNote || <span style={styles.mutedText}>No relevance notes available.</span>}
          </div>

          {/* NOTES */}
          <SectionLabel style={{ marginTop: '32px' }}>NOTES</SectionLabel>
          <div style={styles.divider} />
          <div style={{ position: 'relative' }}>
            <textarea
              style={styles.textarea}
              placeholder="Add outreach notes, follow-ups, context"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button style={styles.saveBtn} onClick={handleSaveNotes}>Save Notes</button>
            </div>
          </div>

          {/* SOURCE & META */}
          <SectionLabel style={{ marginTop: '32px' }}>SOURCE & META</SectionLabel>
          <div style={styles.divider} />
          <div style={styles.grid}>
            <div style={styles.gridLabel}>Source</div>
            <div style={styles.gridValue}>Tavily / Google Search</div>
            
            <div style={styles.gridLabel}>Added</div>
            <div style={styles.gridValue}>{addedDate}</div>
            
            <div style={styles.gridLabel}>Country</div>
            <div style={styles.gridValue}>{lead.country || '-'}</div>
          </div>
          
          {/* Bottom spacing */}
          <div style={{ height: '40px' }} />
        </div>
      </div>
    </>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{ ...styles.sectionLabel, ...style }}>
      {children}
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: '48px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  drawer: {
    position: 'fixed',
    top: '48px',
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: '440px',
    background: 'var(--color-bg)',
    borderLeft: '1px solid var(--color-border)',
    zIndex: 1001,
    transform: 'translateX(0)', // In a real app we'd use CSS classes for slide transition
    transition: 'transform 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-modal)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
  },
  divider: {
    height: '1px',
    background: 'var(--color-border)',
    width: '100%',
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  title: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: '22px',
    color: 'var(--color-text-primary)',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    fontSize: '14px',
    color: 'var(--color-text-muted)',
    margin: '0 0 32px 0',
  },
  sectionLabel: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '11px',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr',
    rowGap: '12px',
    marginTop: '12px',
    alignItems: 'center',
  },
  gridLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--color-text-muted)',
  },
  gridValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  mono: {
    fontFamily: "'JetBrains Mono', monospace",
  },
  inlineBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
  },
  link: {
    color: 'var(--color-jade)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  mutedText: {
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  },
  textBlock: {
    marginTop: '12px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    lineHeight: 1.7,
    color: 'var(--color-text-primary)',
  },
  textarea: {
    width: '100%',
    minHeight: '80px',
    background: 'var(--color-surface-2)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    padding: '12px',
    color: 'var(--color-text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px',
    lineHeight: 1.5,
    resize: 'vertical',
    marginTop: '12px',
  },
  saveBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-muted)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  dropdown: {
    position: 'absolute',
    top: '30px',
    right: 0,
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    boxShadow: 'var(--shadow-card)',
    zIndex: 10,
    minWidth: '150px',
  },
  dropdownItem: {
    padding: '8px 16px',
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    textTransform: 'capitalize',
  }
};
