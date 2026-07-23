export default function StatusBadge({ status }) {
  const norm = status?.toLowerCase() || 'new';

  let colors = { bg: 'rgba(255,255,255,0.1)', text: '#A0A8BC' }; // default muted

  if (norm === 'new') {
    colors = { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA' }; // blue
  } else if (norm === 'contacted' || norm === 'running') {
    colors = { bg: 'rgba(244,168,54,0.15)', text: '#F4A836' }; // saffron
  } else if (norm === 'responded') {
    colors = { bg: 'rgba(167,139,250,0.15)', text: '#A78BFA' }; // purple
  } else if (norm === 'converted' || norm === 'completed') {
    colors = { bg: 'rgba(0,200,150,0.15)', text: '#00C896' }; // jade
  } else if (norm === 'not_relevant' || norm === 'failed') {
    colors = { bg: 'rgba(248,113,113,0.15)', text: '#F87171' }; // red
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '100px',
      fontSize: '12px',
      fontFamily: "'Inter', sans-serif",
      fontWeight: 500,
      background: colors.bg,
      color: colors.text,
      textTransform: 'capitalize'
    }}>
      {status || 'New'}
    </span>
  );
}
