import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/auth.css";
import logoNERE from "../../assets/nere.jpg";
export default function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login"); // login | forgot | forgot-sent
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirection selon rôle ou paramètre redirect
        const params   = new URLSearchParams(location.search);
        const redirect = params.get("redirect");

        if (redirect) {
          navigate("/" + redirect);
        } else if (data.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Email ou mot de passe incorrect.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/mot-de-passe-oublie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) setMode("forgot-sent");
      else setError(data.message || "Erreur.");
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FOND */}
      <div className="auth-bg">
        <div className="auth-blob1" />
        <div className="auth-blob2" />
        <div className="auth-grid" />
        <svg className="auth-skyline" viewBox="0 0 1400 200" preserveAspectRatio="xMidYMax meet"
          fill="rgba(46,111,204,0.4)" xmlns="http://www.w3.org/2000/svg">
          <rect x="40"  y="60"  width="80"  height="140" /><rect x="150" y="80"  width="60"  height="120" />
          <rect x="240" y="20"  width="100" height="180" /><rect x="370" y="70"  width="70"  height="130" />
          <rect x="470" y="40"  width="120" height="160" /><rect x="700" y="75"  width="60"  height="125" />
          <rect x="790" y="30"  width="90"  height="170" /><rect x="910" y="60"  width="75"  height="140" />
          <rect x="1010" y="20" width="110" height="180" /><rect x="1150" y="70" width="65"  height="130" />
          <rect x="1240" y="40" width="85"  height="160" /><rect x="1350" y="80" width="50"  height="120" />
          <rect x="0" y="198" width="1400" height="2" fill="rgba(46,111,204,0.5)" />
        </svg>
      </div>

      <div className="auth-wrapper">
      <nav className="dash-navbar" style={{
  display:"flex",
  alignItems:"center",
  justifyContent:"space-between",
  padding:"0 20px"
}}>
  
  {/* LOGO À GAUCHE */}
  <div className="nav-left" style={{ width:"250px" }}>
    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
      <img src={logoNERE} alt="NERE"
        style={{ height:"80px", width:"auto", borderRadius:"6px", flexShrink:0 }}/>
      <div style={{ display:"flex", flexDirection:"column", lineHeight:1.4 }}>
        <span style={{ fontSize:"11px", fontWeight:800, color:"#fff",
          letterSpacing:"0.06em", textTransform:"uppercase" }}>Fichier NERE</span>
        <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.85)" }}>
          Registre national des entreprises<br/>Du Burkina Faso
        </span>
      </div>
    </div>
  </div>

  {/* 🔥 MENU CENTRÉ */}
  <div className="dash-nav-links" style={{
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    flex:1,
    gap:"18px",
    color:"#ffffff"
  }}>
    <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
    <span className="dash-nav-link" onClick={() => navigate("/publications")}>Publications</span>
    <span className="dash-nav-link" onClick={() => navigate("/rechercheacc")}>Recherche</span>
    <span className="dash-nav-link active">Contact</span>
    <span className="dash-nav-link" onClick={() => navigate("/chat")}>Chat</span>
  </div>

  {/* ESPACE VIDE POUR ÉQUILIBRER */}
  <div className="nav-right" style={{ width:"250px" }}></div>

</nav>


        <div className="auth-container">

          {/* ── MODE : CONNEXION ── */}
          {mode === "login" && (
            <div className="auth-card login-card">
              <div className="auth-card-icon"></div>
              <div className="auth-card-header">
                <h1 className="auth-title">Connexion</h1>
                <p className="auth-subtitle">Accédez à votre espace NERE CCI-BF</p>
              </div>

              {error && <div className="auth-error"> {error}</div>}

              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" name="email" type="email"
                    placeholder="votre@email.bf"
                    value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Mot de passe</label>
                  <input className="form-input" name="password" type="password"
                    placeholder="••••••••"
                    value={form.password} onChange={handleChange} required />
                  <div className="field-hint" onClick={() => { setMode("forgot"); setError(""); }}>
                    Mot de passe oublié ?
                  </div>
                </div>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner" /> : "Se connecter →"}
                </button>
              </form>

              <div className="auth-divider">
                <span>ou</span>
              </div>

              <button className="btn-auth-outline" onClick={() => navigate("/inscription")}>
                Créer un compte 
              </button>

              {/* Info packs */}
              <div className="login-packs-hint">
                <div className="packs-hint-title">Formules à crediter votre compte</div>
                <div className="packs-hint-row">
                  <div className="pack-hint-item">
                    <div className="pack-hint-name">Pack 1</div>
                    <div className="pack-hint-price">5 000 FCFA</div>
                  </div>
                  <div className="pack-hint-item featured">
                    <div className="pack-hint-name">Pack 2</div>
                    <div className="pack-hint-price">10.000 FCFA</div>
                  </div>
                  <div className="pack-hint-item">
                    <div className="pack-hint-name">Pack 3</div>
                    <div className="pack-hint-price">15.000 FCFA ou plus</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── MODE : MOT DE PASSE OUBLIÉ ── */}
          {mode === "forgot" && (
            <div className="auth-card login-card">
              <div className="auth-card-icon"></div>
              <div className="auth-card-header">
                <h1 className="auth-title">Mot de passe oublié</h1>
                <p className="auth-subtitle">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              {error && <div className="auth-error"> {error}</div>}

              <form onSubmit={handleForgot} className="auth-form">
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email"
                    placeholder="votre@email.bf"
                    value={forgotEmail}
                    onChange={(e) => { setForgotEmail(e.target.value); setError(""); }}
                    required />
                </div>
                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner" /> : "Envoyer le lien →"}
                </button>
              </form>

              <button className="btn-auth-outline" onClick={() => { setMode("login"); setError(""); }}>
                ← Retour à la connexion
              </button>
            </div>
          )}

          {/* ── MODE : LIEN ENVOYÉ ── */}
          {mode === "forgot-sent" && (
            <div className="auth-card verify-card">
              <div className="verify-icon"></div>
              <h2 className="auth-title">Email envoyé !</h2>
              <p className="verify-desc">
                Un lien de réinitialisation a été envoyé à{" "}
                <strong>{forgotEmail}</strong>.
              </p>
              <div className="info-chip">⏱ Le lien expire dans 1h</div>
              <button className="btn-auth-outline" onClick={() => { setMode("login"); setError(""); }}>
                ← Retour à la connexion
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}