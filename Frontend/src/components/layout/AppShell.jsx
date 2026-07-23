import PipelinePulse from './PipelinePulse.jsx';
import Sidebar from './Sidebar.jsx';

export default function AppShell({ children }) {
  return (
    <div style={styles.root}>
      {/* ── Top bar ── */}
      <div style={styles.topBar}>
        <PipelinePulse />
      </div>

      {/* ── Below top bar ── */}
      <div style={styles.body}>
        {/* ── Left sidebar ── */}
        <div style={styles.sidebar}>
          <Sidebar />
        </div>

        {/* ── Scrollable content ── */}
        <main style={styles.main}>
          <div style={styles.inner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
  },
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '48px',
    zIndex: 100,
  },
  body: {
    display: 'flex',
    flex: 1,
    marginTop: '48px',
    height: 'calc(100vh - 48px)',
    overflow: 'hidden',
  },
  sidebar: {
    position: 'fixed',
    top: '48px',
    left: 0,
    width: '240px',
    height: 'calc(100vh - 48px)',
    zIndex: 90,
    overflowY: 'auto',
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    height: '100%',
    overflowY: 'scroll',
  },
  inner: {
    padding: '32px 40px',
    maxWidth: '1440px',
  },
};
