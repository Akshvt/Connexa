import React from 'react';

const Card = ({ children, className = '', hover = true, ...props }) => {
  const baseStyle = {
    backgroundColor: 'var(--color-glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--color-glass-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-xl)',
    boxShadow: 'var(--shadow-card)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
  };

  const hoverStyle = `
    .glass-card-hover:hover {
      transform: translateY(-4px);
      border-color: var(--color-primary);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }
  `;

  return (
    <>
      {hover && <style>{hoverStyle}</style>}
      <div 
        className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`} 
        style={baseStyle} 
        {...props}
      >
        {children}
      </div>
    </>
  );
};

export default Card;
