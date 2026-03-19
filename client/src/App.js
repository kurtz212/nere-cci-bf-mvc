import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home                from './views/shared/Home';
import Inscription         from './views/auth/Inscription';
import Connexion           from './views/auth/Connexion';
import Publications        from './views/dashboard/Publications';
import Profil              from './views/dashboard/Profil';
import Formules            from './views/shared/Formules';
import Dashboard           from './views/dashboard/Dashboard';
import NotFound            from './views/shared/NotFound';
import Paiement            from './views/dashboard/Paiement';
import Recherche           from './views/dashboard/Recherche';
import DemandeDocument     from './views/dashboard/DemandeDocument';
import Chat                from './views/dashboard/Chat';
import Admin               from './views/admin/Admin';
import AdminRoute          from './components/AdminRoute';
import Reclamation         from './views/shared/Reclamation';
import RechercheEntreprise from './views/shared/Rechercheentreprise';
import Contact             from './views/shared/Contact';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"                     element={<Home />} />
          <Route path="/inscription"          element={<Inscription />} />
          <Route path="/connexion"            element={<Connexion />} />
          <Route path="/formules"             element={<Formules />} />
          <Route path="/publications"         element={<Publications />} />
          <Route path="/profil"               element={<Profil />} />
          <Route path="/recherche"            element={<Recherche />} />
          <Route path="/demande-document"     element={<DemandeDocument />} />
          <Route path="/chat"                 element={<Chat />} />
          <Route path="/paiement"             element={<Paiement />} />
          <Route path="/dashboard"            element={<Dashboard />} />
          <Route path="/admin" element={
            <AdminRoute><Admin /></AdminRoute>
          } />
          <Route path="/reclamation"          element={<Reclamation />} />
          <Route path="/recherche-entreprise" element={<RechercheEntreprise />} />
          <Route path="/contact"              element={<Contact />} />
          <Route path="*"                     element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}