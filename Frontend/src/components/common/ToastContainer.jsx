import { useState, useEffect } from 'react';
import { subscribeToasts } from './toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToasts(newToast => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 3000);
    });
  }, []);

  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function Toast({ toast }) {
  let borderColor = 'var(--color-jade)';
  if (toast.type === 'warning') borderColor = 'var(--color-saffron)';
  if (toast.type === 'error') borderColor = '#F87171'; // red

  return (
    <div style={{ ...styles.toast, borderLeft: `3px solid ${borderColor}` }}>
      {toast.message}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 9999,
  },
  toast: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '12px 16px',
    color: 'var(--color-text-primary)',
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    boxShadow: 'var(--shadow-modal)',
    animation: 'slideIn 0.2s ease-out forwards',
  }
};
