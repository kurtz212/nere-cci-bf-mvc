import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Views
import Home          from './views/shared/Home';
import Inscription   from './views/auth/Inscription';
import Connexion     from './views/auth/Connexion';
import Publications  from './views/dashboard/Publications';
import Profil        from './views/dashboard/Profil';
import Recherche     from './views/dashboard/Recherche';
import Formules      from './views/shared/Formules';
import Paiement      from './views/dashboard/Paiement';
import Dashboard     from './views/dashboard/Dashboard';
import Admin         from './views/admin/Admin';
import NotFound      from './views/shared/NotFound';

// Composants
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── PUBLIC ── */}
          <Route path="/"            element={<Home />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion"   element={<Connexion />} />
          <Route path="/formules"    element={<Formules />} />
          <Route path="/publications" element={<Publications />} />

          {/* ── PROTÉGÉ (JWT requis) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profil"    element={<Profil />} />
            <Route path="/recherche" element={<Recherche />} />
            <Route path="/paiement"  element={<Paiement />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* ── ADMIN uniquement ── */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/*"   element={<Admin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
