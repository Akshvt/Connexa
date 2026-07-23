import React, { useState } from 'react';

const Input = ({ label, type = 'text', value, onChange, className = '', required = false, ...props }) => {
  const [focused, setFocused] = useState(false);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: 'var(--spacing-md)',
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 16px 8px 16px',
    backgroundColor: 'var(--color-glass-bg)',
    border: `1px solid ${focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    boxShadow: focused ? '0 0 0 2px rgba(107, 127, 79, 0.4)' : 'none',
  };

  const labelStyle = {
    position: 'absolute',
    left: '16px',
    top: focused || value ? '6px' : '50%',
    transform: focused || value ? 'none' : 'translateY(-50%)',
    fontSize: focused || value ? '12px' : '16px',
    color: focused ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    transition: 'all 0.2s ease',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle} className={className}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={inputStyle}
        required={required}
        {...props}
      />
    </div>
  );
};

export default Input;
