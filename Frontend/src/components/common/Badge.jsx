import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const baseStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  const variants = {
    primary: {
      backgroundColor: 'rgba(107, 127, 79, 0.2)',
      color: 'var(--color-primary)',
      border: '1px solid rgba(107, 127, 79, 0.3)',
    },
    success: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      color: '#4ade80',
      border: '1px solid rgba(34, 197, 94, 0.2)',
    },
    warning: {
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      color: '#facc15',
      border: '1px solid rgba(234, 179, 8, 0.2)',
    },
    gold: {
      backgroundColor: 'rgba(212, 175, 106, 0.15)',
      color: 'var(--color-accent-gold)',
      border: '1px solid rgba(212, 175, 106, 0.3)',
    },
  };

  return (
    <span style={{ ...baseStyle, ...(variants[variant] || variants.primary) }} className={className}>
      {children}
    </span>
  );
};

export default Badge;
