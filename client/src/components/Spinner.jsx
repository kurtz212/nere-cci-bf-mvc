export default function Spinner({ size = 28, color = '#4DC97A' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `3px solid rgba(77,201,122,0.2)`,
      borderTopColor: color,
      animation: 'spin 0.7s linear infinite',
      margin: '0 auto',
    }} />
  );
}
