// Navbar réutilisable — injectée dans chaque View
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ theme = 'green' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  // ... (implémentation complète dans Home.jsx / dashboard.css)
  return null; // Placeholder — voir views/shared/Home.jsx
}
