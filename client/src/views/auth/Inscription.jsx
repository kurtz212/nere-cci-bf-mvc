import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";
import logoNERE from "../../assets/nere.png";

const NAV_LINKS = [
  { label:"Accueil",  path:"/",          key:"accueil"  },
  { label:"Contact",  path:"/contact",   key:"contact"  },
  { label:"Formules", path:"/formules",  key:"formules" },
];

const TYPES_COMPTE = [
  { value:"etudiant",       label:"Étudiant",       icon:"🎓" },
  { value:"entreprise",     label:"Entreprise",     icon:"🏢" },
  { value:"administration", label:"Administration", icon:"🏛️" },
  { value:"autre",          label:"Autre",          icon:"👤" },
];

export default function Inscription() {
  const navigate = useNavigate();

  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    typeCompte:"", nom:"", prenom:"", fonction:"",
    telephone:"", email:"", siteWeb:"",
    password:"", confirm:"", cgu:false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type==="checkbox" ? checked : value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.typeCompte)          return setError("Veuillez sélectionner un type de compte.");
    if (!form.cgu)                 return setError("Veuillez accepter les CGU.");
    if (form.password !== form.confirm) return setError("Les mots de passe ne correspondent pas.");
    if (form.password.length < 8)  return setError("Le mot de passe doit contenir au moins 8 caractères.");

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/inscription", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          typeCompte:form.typeCompte, nom:form.nom, prenom:form.prenom,
          fonction:form.fonction, telephone:form.telephone,
          email:form.email, siteWeb:form.siteWeb, password:form.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.sansEmail) navigate("/connexion?registered=1");
        else setStep(2);
      } else {
        setError(data.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const forceMdp = !form.password ? null
    : form.password.length < 6  ? "faible"
    : form.password.length < 10 ? "moyen"
    : "fort";

  return (
    <>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }

        /* ══ NAVBAR — identique Home.jsx ══ */
        .nere-navbar-ins {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 120px;
          background: #00904C;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
           position: relative;
        }
        .nere-navbar-ins .nav-pill {
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 20px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        .nere-navbar-ins .nav-pill .nav-btn {
          padding: 7px 15px; border-radius: 100px;
          font-size: 18px; font-weight: 600;
          color: rgba(255,255,255,0.78); cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
          border: none; background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }
        .nere-navbar-ins .nav-pill .nav-btn:hover {
          color: #fff; background: rgba(255,255,255,0.12);
        }
        .nere-navbar-ins .nav-pill .nav-btn.active {
          color: #0A3D1F; background: #4DC97A;
          font-weight: 700; box-shadow: 0 2px 8px rgba(77,201,122,0.4);
        }
      `}</style>

      {/* ══ FOND ══ */}
      <div className="auth-bg">
        <div className="auth-blob1"/><div className="auth-blob2"/>
        <div className="auth-grid"/>
        <svg className="auth-skyline" viewBox="0 0 1400 200"
          preserveAspectRatio="xMidYMax meet" fill="rgba(46,111,204,0.4)">
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
        <nav className="nere-navbar-ins">

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

          {/* Pilule liens */}
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key}
                className="nav-btn"
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          {/* Bouton Se connecter */}
          <button onClick={() => navigate("/connexion")}
            style={{ padding:"7px 20px", borderRadius:"100px",
              border:"1.5px solid rgba(255,255,255,0.35)", background:"transparent",
              color:"#fff", fontSize:"13px", fontWeight:600,
              cursor:"pointer", flexShrink:0 }}>
            Se connecter
          </button>
        </nav>

        <div className="auth-container">

          {/* ── ÉTAPE 1 : FORMULAIRE ── */}
          {step === 1 && (
            <div className="auth-card wide-card">

              {/* Barre d'étapes */}
              <div className="steps-row">
                {["Informations","Vérification","Formule","Paiement"].map((s, i) => (
                  <div key={i} className={`step-item ${i===0?"current":""}`}>
                    <div className="step-circle">{i+1}</div>
                    <span>{s}</span>
                    {i < 3 && <div className="step-line"/>}
                  </div>
                ))}
              </div>

              <div className="auth-card-header">
                <h1 className="auth-title">Créer votre compte</h1>
                <p className="auth-subtitle">Accédez aux données économiques du Burkina Faso</p>
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">

                {/* TYPE DE COMPTE */}
                <div className="form-field full">
                  <label className="form-label">Type de compte *</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                    gap:"10px", marginTop:"8px" }}>
                    {TYPES_COMPTE.map(t => (
                      <button key={t.value} type="button"
                        onClick={() => { setForm(f => ({...f, typeCompte:t.value})); setError(""); }}
                        style={{
                          padding:"14px 8px", borderRadius:"10px",
                          border: form.typeCompte===t.value
                            ? "2px solid #4DC97A"
                            : "1.5px solid rgba(255,255,255,0.1)",
                          background: form.typeCompte===t.value
                            ? "rgba(77,201,122,0.12)"
                            : "rgba(255,255,255,0.03)",
                          color: form.typeCompte===t.value
                            ? "#4DC97A" : "rgba(255,255,255,0.5)",
                          fontWeight: form.typeCompte===t.value ? 700 : 500,
                          fontSize:"12px", cursor:"pointer",
                          fontFamily:"inherit", transition:"all 0.18s",
                          display:"flex", flexDirection:"column",
                          alignItems:"center", gap:"7px",
                        }}>
                        <span style={{ fontSize:"22px" }}>{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHAMPS */}
                <div className="form-grid-2">

                  <div className="form-field">
                    <label className="form-label">Nom *</label>
                    <input className="form-input" name="nom" placeholder="Traoré"
                      value={form.nom} onChange={handleChange} required/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Prénom *</label>
                    <input className="form-input" name="prenom" placeholder="Ibrahim"
                      value={form.prenom} onChange={handleChange} required/>
                  </div>

                  <div className="form-field full">
                    <label className="form-label">Fonction *</label>
                    <input className="form-input" name="fonction"
                      placeholder="ex: Directeur commercial, Étudiant en master..."
                      value={form.fonction} onChange={handleChange} required/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Téléphone *</label>
                    <input className="form-input" name="telephone"
                      placeholder="+226 07 XX XX XX"
                      value={form.telephone} onChange={handleChange} required/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Email{" "}
                      <span style={{ fontSize:"11px", opacity:0.45, fontWeight:400 }}>
                        (facultatif)
                      </span>
                    </label>
                    <input className="form-input" name="email" type="email"
                      placeholder="i.traore@exemple.bf"
                      value={form.email} onChange={handleChange}/>
                  </div>

                  <div className="form-field full">
                    <label className="form-label">
                      Site web{" "}
                      <span style={{ fontSize:"11px", opacity:0.45, fontWeight:400 }}>
                        (facultatif)
                      </span>
                    </label>
                    <input className="form-input" name="siteWeb"
                      placeholder="https://www.votre-site.bf"
                      value={form.siteWeb} onChange={handleChange}/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Mot de passe *</label>
                    <div style={{ position:"relative" }}>
                      <input className="form-input" name="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="Min. 8 caractères"
                        value={form.password} onChange={handleChange} required
                        style={{ paddingRight:"44px" }}/>
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        style={{ position:"absolute", right:"12px", top:"50%",
                          transform:"translateY(-50%)", background:"none",
                          border:"none", cursor:"pointer", fontSize:"16px",
                          opacity:0.5, color:"#fff", padding:0, lineHeight:1 }}>
                        {showPwd ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Confirmer *</label>
                    <div style={{ position:"relative" }}>
                      <input className="form-input" name="confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Répéter le mot de passe"
                        value={form.confirm} onChange={handleChange} required
                        style={{ paddingRight:"44px" }}/>
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        style={{ position:"absolute", right:"12px", top:"50%",
                          transform:"translateY(-50%)", background:"none",
                          border:"none", cursor:"pointer", fontSize:"16px",
                          opacity:0.5, color:"#fff", padding:0, lineHeight:1 }}>
                        {showConfirm ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Force mot de passe */}
                {forceMdp && (
                  <div className="pwd-strength">
                    <div className="pwd-bar">
                      <div className={`pwd-fill strength-${forceMdp}`}/>
                    </div>
                    <span className="pwd-label" style={{
                      color: forceMdp==="faible" ? "#E85555"
                           : forceMdp==="moyen"  ? "#D4A830" : "#4DC97A"
                    }}>
                      {forceMdp==="faible" ? "Faible"
                       : forceMdp==="moyen" ? "Moyen" : "Fort"}
                    </span>
                  </div>
                )}

                {/* CGU */}
                <label className="cgu-row">
                  <input type="checkbox" name="cgu"
                    checked={form.cgu} onChange={handleChange}/>
                  <span>
                    J'accepte les{" "}
                    <span className="auth-link">Conditions Générales d'Utilisation</span>{" "}
                    et la{" "}
                    <span className="auth-link">Politique de confidentialité</span>{" "}
                    de la CCI-BF
                  </span>
                </label>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : "Créer mon compte "}
                </button>
              </form>

              <div style={{ textAlign:"center", marginTop:"16px",
                fontSize:"13px", color:"rgba(255,255,255,0.45)" }}>
                Déjà un compte ?{" "}
                <span style={{ color:"#4DC97A", cursor:"pointer", fontWeight:600 }}
                  onClick={() => navigate("/connexion")}>
                  Se connecter
                </span>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : CONFIRMATION EMAIL ── */}
          {step === 2 && (
            <div className="auth-card verify-card">
              <div className="verify-icon"></div>
              <h2 className="auth-title">Vérifiez votre email</h2>
              <p className="verify-desc">
                Un lien de confirmation a été envoyé à{" "}
                <strong>{form.email}</strong>.<br/>
                Cliquez sur le lien pour activer votre compte.
              </p>
              <div className="info-chip">⏱ Le lien expire dans 24h</div>
              <p className="verify-resend">
                Pas reçu ?{" "}
                <span className="auth-link">Renvoyer le mail</span>
              </p>
              <button className="btn-auth-outline" onClick={() => navigate("/connexion")}>
                Aller à la connexion
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}