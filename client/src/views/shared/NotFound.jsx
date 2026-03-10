import { useNavigate } from 'react-router-dom';
export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#0A3D1F', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <div style={{ fontSize: '64px' }}>🌿</div>
      <h1 style={{ color: '#4DC97A', fontFamily: 'Playfair Display', fontSize: '48px' }}>404</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)' }}>Page introuvable</p>
      <button onClick={() => navigate('/')}
        style={{ background: '#4DC97A', color: '#0A3D1F', border: 'none',
          borderRadius: '10px', padding: '12px 28px', fontWeight: 700, cursor: 'pointer' }}>
        Retour à l'accueil
      </button>
    </div>
  );
}
