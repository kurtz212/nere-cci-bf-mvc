import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const user  = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  // Pas connecté → page connexion
  if (!token || !user) {
    return <Navigate to="/connexion?redirect=admin" replace />;
  }

  // Connecté mais pas admin → page accueil
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}