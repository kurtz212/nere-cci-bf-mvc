import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/auth.css";
import logoNERE from "../../assets/nere.png";

const NAV_LINKS = [
  { label:"Accueil",  path:"/",          key:"accueil"  },
  { label:"Contact",  path:"/contact",   key:"contact"  },
  { label:"Formules", path:"/formules",  key:"formules" },
];

export default function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode]               = useState("login");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [form, setForm]               = useState({ email:"", password:"" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [showPwd, setShowPwd]         = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/connexion", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user",  JSON.stringify(data.user));
        const params   = new URLSearchParams(location.search);
        const redirect = params.get("redirect");
        if (redirect)                         navigate("/" + redirect);
        else if (data.user?.role === "admin")   navigate("/admin");
        else if (data.user?.role === "manager") navigate("/gestionnaire");
        else                                    navigate("/");
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
      const res  = await fetch("/api/auth/mot-de-passe-oublie", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
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
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }

        /* ══ NAVBAR — identique Home.jsx ══ */
        .nere-navbar-auth {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 120px;
          background: #00904C;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
           position: relative;
        }
        /* Pilule liens — margin-left:auto pousse à droite */
        .nere-navbar-auth .nav-pill {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 20px;
        }
        .nere-navbar-auth .nav-pill .nav-btn {
          padding: 7px 15px; border-radius: 100px;
          font-size: 20px; font-weight: 600;
          color: rgba(255,255,255,0.78); cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
          border: none; background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }
        .nere-navbar-auth .nav-pill .nav-btn:hover {
          color: #fff; background: rgba(255,255,255,0.12);
        }
        .nere-navbar-auth .nav-pill .nav-btn.active {
          color: #0A3D1F; background: #4DC97A;
          font-weight: 700; box-shadow: 0 2px 8px rgba(77,201,122,0.4);
        }
      `}</style>

      {/* ══ FOND ══ */}
      <div className="auth-bg">
        <div className="auth-blob1"/>
        <div className="auth-blob2"/>
        <div className="auth-grid"/>
        <svg className="auth-skyline" viewBox="0 0 1400 200"
          preserveAspectRatio="xMidYMax meet"
          fill="rgba(46,111,204,0.4)" xmlns="http://www.w3.org/2000/svg">
          <rect x="40"   y="60"  width="80"  height="140"/>
          <rect x="150"  y="80"  width="60"  height="120"/>
          <rect x="240"  y="20"  width="100" height="180"/>
          <rect x="370"  y="70"  width="70"  height="130"/>
          <rect x="470"  y="40"  width="120" height="160"/>
          <rect x="700"  y="75"  width="60"  height="125"/>
          <rect x="790"  y="30"  width="90"  height="170"/>
          <rect x="910"  y="60"  width="75"  height="140"/>
          <rect x="1010" y="20"  width="110" height="180"/>
          <rect x="1150" y="70"  width="65"  height="130"/>
          <rect x="1240" y="40"  width="85"  height="160"/>
          <rect x="1350" y="80"  width="50"  height="120"/>
          <rect x="0"    y="198" width="1400" height="2" fill="rgba(46,111,204,0.5)"/>
        </svg>
      </div>

      <div className="auth-wrapper">

        {/* ══ NAVBAR — même design que Home.jsx ══ */}
        <nav className="nere-navbar-auth">

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <img src={logoNERE} alt="NERE"
              style={{ height:"80px", width:"auto", borderRadius:"6px",
                flexShrink:0, backgroundColor:"#fff", padding:"4px" }}/>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
              <span style={{ fontSize:"18px", fontWeight:800, color:"#fff",
                letterSpacing:"0.08em", textTransform:"uppercase" }}>
                Fichier NERE
              </span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>
                Registre national des entreprises
              </span>
            </div>
          </div>

          {/* Pilule liens — poussée à droite */}
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key}
                className="nav-btn"
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          {/* Bouton S'inscrire */}
          <button onClick={() => navigate("/inscription")}
            style={{ padding:"7px 20px", borderRadius:"100px",
              border:"none", background:"#4DC97A",
              color:"#0A3D1F", fontSize:"13px", fontWeight:700,
              cursor:"pointer", flexShrink:0 }}>
            S'inscrire
          </button>
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

              {error && <div className="auth-error">❌ {error}</div>}

              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" name="email" type="email"
                    placeholder="votre@email.bf"
                    value={form.email} onChange={handleChange} required/>
                </div>
                <div className="form-field">
                  <label className="form-label">Mot de passe</label>
                  <div style={{ position:"relative" }}>
                    <input className="form-input" name="password"
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password} onChange={handleChange}
                      required style={{ paddingRight:"44px" }}/>
                    <button type="button" onClick={() => setShowPwd(o => !o)}
                      style={{ position:"absolute", right:"12px", top:"50%",
                        transform:"translateY(-50%)", background:"none",
                        border:"none", cursor:"pointer", fontSize:"16px",
                        color:"rgba(255,255,255,0.5)" }}>
                      {showPwd ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <div className="field-hint"
                    onClick={() => { setMode("forgot"); setError(""); }}>
                    Mot de passe oublié ?
                  </div>
                </div>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : "Se connecter "}
                </button>
              </form>

              <div className="auth-divider"><span>ou</span></div>

              <button className="btn-auth-outline" onClick={() => navigate("/inscription")}>
                Créer un compte
              </button>

              {/* Info packs */}
              <div className="login-packs-hint">
                <div className="packs-hint-title">Formules disponibles</div>
                <div className="packs-hint-row">
                  <div className="pack-hint-item">
                    <div className="pack-hint-name">Pack Essentiel</div>
                    <div className="pack-hint-price">5 000 FCFA</div>
                  </div>
                  <div className="pack-hint-item featured">
                    <div className="pack-hint-name">Pack Professionnel</div>
                    <div className="pack-hint-price">5 001 – 14 999 FCFA</div>
                  </div>
                  <div className="pack-hint-item">
                    <div className="pack-hint-name">Pack Entreprise</div>
                    <div className="pack-hint-price">15 000 FCFA ou +</div>
                  </div>
                </div>
                <div style={{ textAlign:"center", marginTop:"12px" }}>
                  <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)",
                    cursor:"pointer", textDecoration:"underline" }}
                    onClick={() => navigate("/formules")}>
                    Voir le détail des formules →
                  </span>
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

              {error && <div className="auth-error">❌ {error}</div>}

              <form onSubmit={handleForgot} className="auth-form">
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email"
                    placeholder="votre@email.bf"
                    value={forgotEmail}
                    onChange={e => { setForgotEmail(e.target.value); setError(""); }}
                    required/>
                </div>
                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : "Envoyer le lien →"}
                </button>
              </form>

              <button className="btn-auth-outline"
                onClick={() => { setMode("login"); setError(""); }}>
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
              <button className="btn-auth-outline"
                onClick={() => { setMode("login"); setError(""); }}>
                Retour à la connexion
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}