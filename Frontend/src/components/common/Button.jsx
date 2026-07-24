import React from 'react';

const Button = ({ children, variant = 'primary', className = '', style = {}, ...props }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    borderRadius: 'var(--radius-pill)',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    outline: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-bg-elevated)',
    },
    secondary: {
      backgroundColor: 'transparent',
      border: '1px solid var(--color-glass-border)',
      color: 'var(--color-text-primary)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-text-primary)',
    },
    gold: {
      backgroundColor: 'var(--color-accent-gold)',
      color: 'var(--color-bg)',
    }
  };

  const hoverStyles = `
    .btn-custom:hover {
      transform: translateY(-2px);
    }
    .btn-primary:hover {
      background-color: var(--color-primary-hover);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-secondary:hover {
      background-color: var(--color-glass-bg);
    }
  `;

  return (
    <>
      <style>{hoverStyles}</style>
      <button 
        className={`btn-custom btn-${variant} ${className}`} 
        style={{ ...baseStyle, ...variants[variant], ...style }} 
        {...props}
      >
        {children}
      </button>
    </>
  );
};

export default Button;
