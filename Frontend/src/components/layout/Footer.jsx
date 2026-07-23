import React from 'react';

const Footer = () => {
  const footerStyle = {
    padding: 'var(--spacing-section) var(--spacing-xxl)',
    borderTop: '1px solid var(--color-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text-secondary)',
  };

  return (
    <footer style={footerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: 'var(--color-primary)', opacity: 0.5 }}></div>
        Connexa by Namhya
      </div>
      <div>
        <p style={{ fontSize: '14px' }}>&copy; {new Date().getFullYear()} Namhya Foods. All rights reserved.</p>
      </div>
      <div style={{ display: 'flex', gap: '24px' }}>
        <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Privacy</a>
        <a href="#" style={{ color: 'var(--color-text-secondary)' }}>Terms</a>
      </div>
    </footer>
  );
};

export default Footer;
