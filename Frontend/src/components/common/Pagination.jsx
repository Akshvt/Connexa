import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div style={styles.container}>
      <button
        style={page > 1 ? styles.btn : { ...styles.btn, ...styles.btnDisabled }}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </button>

      <span style={styles.text}>
        Page {page} of {pages}
      </span>

      <button
        style={page < pages ? styles.btn : { ...styles.btn, ...styles.btnDisabled }}
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '16px 0',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    background: 'transparent',
  },
  text: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
  }
};
