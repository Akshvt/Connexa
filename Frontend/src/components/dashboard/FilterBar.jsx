import { useState, useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';
import api from '../../api/axios';

const COUNTRIES = [
  { value: 'United States', label: 'US' },
  { value: 'United Kingdom', label: 'UK' },
  { value: 'Canada', label: 'Canada' },
  { value: 'UAE', label: 'UAE' },
  { value: 'Australia', label: 'Australia' }
];

const STATUS_OPTIONS = ['new', 'contacted', 'responded', 'converted', 'not_relevant'];
const CHANNEL_OPTIONS = ['Email', 'LinkedIn DM', 'WhatsApp', 'Website Contact Form'];

export default function FilterBar({ filters, setFilters }) {
  const handleChange = (name, value) => {
    // toggle country off if clicked again
    const newValue = (name === 'country' && filters.country === value) ? '' : value;
    setFilters(prev => ({ ...prev, [name]: newValue, page: 1 }));
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
      {/* Pill buttons for Country */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {COUNTRIES.map(country => {
          const isActive = filters.country === country.value;
          return (
            <button
              key={country.value}
              onClick={() => handleChange('country', country.value)}
              style={{
                padding: '6px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: "var(--font-primary)",
                transition: 'all 0.2s',
                cursor: 'pointer',
                ...(isActive 
                  ? { backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary-alt)', border: '1px solid var(--color-jade-dim)' }
                  : { backgroundColor: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-glass-border)' }
                )
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-glass-bg)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {country.label}
            </button>
          );
        })}
      </div>

      {/* Selects styled cleanly for the right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)' }}>
          <Filter size={18} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>More Filters:</span>
        </div>
        
        <select
          name="status"
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
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
          onChange={(e) => handleChange('channel', e.target.value)}
          style={styles.select}
        >
          <option value="">All Channels</option>
          {CHANNEL_OPTIONS.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const styles = {
  select: {
    background: 'transparent',
    border: 'none',
    color: 'var(--color-text-primary)',
    fontFamily: "var(--font-primary)",
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
};
