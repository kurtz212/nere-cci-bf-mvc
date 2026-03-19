import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const TYPES_RECLAMATION = [
  { value: "donnees_incorrectes", label: "Données incorrectes",     icon: "📋" },
  { value: "acces_refuse",        label: "Accès refusé",            icon: "🔒" },
  { value: "paiement",            label: "Problème de paiement",    icon: "💳" },
  { value: "compte",              label: "Problème de compte",      icon: "👤" },
  { value: "delai",               label: "Délai de traitement",     icon: "⏱️" },
  { value: "autre",               label: "Autre",                   icon: "✉️" },
];

export default function Reclamation() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm] = useState({
    type:        "",
    sujet:       "",
    description: "",
    nom:         user?.nom    || "",
    prenom:      user?.prenom || "",
    email:       user?.email  || "",
    telephone:   user?.telephone || "",
  });

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAVBAR */}
        <nav className="dash-navbar">
          <div className="dash-logo" onClick={() => navigate("/")}>NERE <span>CCI-BF</span></div>
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link" onClick={() => navigate("/publications")}>Publications</span>
            <span className="dash-nav-link" onClick={() => navigate("/recherche")}>Recherche</span>
            <span className="dash-nav-link active">Réclamation</span>
            <span className="dash-nav-link" onClick={() => navigate("/contact")}>Contact</span>
            {user && <span className="dash-nav-link" onClick={() => navigate("/profil")}>Mon Profil</span>}
          </div>
          <div className="dash-nav-actions">
            {user ? (
              <div className="user-chip" onClick={() => navigate("/profil")}>
                <div className="user-avatar">{user.prenom?.[0]}{user.nom?.[0]}</div>
                <span>{user.prenom}</span>
              </div>
            ) : (
              <button className="btn-save" style={{ padding:"8px 18px", fontSize:"13px" }}
                onClick={() => navigate("/connexion")}>
                Connexion
              </button>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div className="pub-page-hero" style={{ padding:"36px 48px 28px" }}>
          <div className="pub-page-tag">CCI-BF · Service clientèle</div>
          <h1 className="pub-page-title" style={{ fontSize:"28px", textAlign:"left" }}>
            Déposer une réclamation
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"14px", marginTop:"8px" }}>
            Votre réclamation sera traitée sous <strong style={{ color:"#4DC97A" }}>5 jours ouvrables</strong>.
          </p>
        </div>

        <div style={{ padding:"32px 48px 60px", background:"var(--off-white)" }}>
          <div style={{ maxWidth:"680px" }}>

            {success ? (
              <div style={{ background:"#fff", borderRadius:"16px",
                border:"1px solid var(--border)", padding:"48px", textAlign:"center" }}>
                <div style={{ fontSize:"56px", marginBottom:"16px" }}>✅</div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", color:"var(--green-dark)",
                  fontSize:"22px", marginBottom:"12px" }}>
                  Réclamation enregistrée !
                </h2>
                <p style={{ color:"var(--text-muted)", lineHeight:1.7, marginBottom:"24px" }}>
                  Votre réclamation a été transmise au service clientèle de la CCI-BF.<br/>
                  Un agent vous recontactera sous <strong>5 jours ouvrables</strong>.
                </p>
                <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                  <button className="btn-save" onClick={() => navigate("/")}>Retour à l'accueil</button>
                  <button className="btn-cancel" onClick={() => { setSuccess(false); setForm(f => ({...f, type:"", sujet:"", description:""})); }}>
                    Nouvelle réclamation
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background:"#fff", borderRadius:"16px",
                border:"1px solid var(--border)", padding:"32px" }}>

                <form onSubmit={handleSubmit}>

                  {/* Type de réclamation */}
                  <div style={{ marginBottom:"24px" }}>
                    <label className="profil-label" style={{ display:"block", marginBottom:"10px" }}>
                      Type de réclamation *
                    </label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px" }}>
                      {TYPES_RECLAMATION.map(t => (
                        <button key={t.value} type="button"
                          onClick={() => setForm(f => ({ ...f, type: t.value }))}
                          style={{
                            padding:"12px 10px", borderRadius:"10px",
                            border: form.type === t.value
                              ? "2px solid var(--green-light)"
                              : "1.5px solid var(--border)",
                            background: form.type === t.value ? "var(--green-pale)" : "#fff",
                            color: form.type === t.value ? "var(--green-dark)" : "var(--text-mid)",
                            fontWeight: form.type === t.value ? 700 : 500,
                            fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
                            transition:"all 0.18s", textAlign:"center",
                            display:"flex", flexDirection:"column",
                            alignItems:"center", gap:"6px",
                          }}>
                          <span style={{ fontSize:"20px" }}>{t.icon}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sujet */}
                  <div className="profil-field" style={{ marginBottom:"16px" }}>
                    <label className="profil-label">Sujet *</label>
                    <input className="profil-input" name="sujet"
                      placeholder="Résumez votre réclamation en une ligne"
                      value={form.sujet} onChange={handleChange} required/>
                  </div>

                  {/* Description */}
                  <div className="profil-field" style={{ marginBottom:"24px" }}>
                    <label className="profil-label">Description détaillée *</label>
                    <textarea className="profil-input" name="description" rows={5}
                      placeholder="Décrivez votre problème en détail : date, circonstances, ce que vous attendez comme résolution..."
                      value={form.description} onChange={handleChange}
                      style={{ resize:"vertical" }} required/>
                  </div>

                  {/* Séparateur */}
                  <div style={{ borderTop:"1px solid var(--border)",
                    paddingTop:"20px", marginBottom:"20px" }}>
                    <div style={{ fontSize:"12px", fontWeight:700, color:"var(--text-muted)",
                      textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"14px" }}>
                      Vos coordonnées
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                      <div className="profil-field">
                        <label className="profil-label">Nom *</label>
                        <input className="profil-input" name="nom"
                          value={form.nom} onChange={handleChange} required/>
                      </div>
                      <div className="profil-field">
                        <label className="profil-label">Prénom *</label>
                        <input className="profil-input" name="prenom"
                          value={form.prenom} onChange={handleChange} required/>
                      </div>
                      <div className="profil-field">
                        <label className="profil-label">Email</label>
                        <input className="profil-input" name="email" type="email"
                          value={form.email} onChange={handleChange}/>
                      </div>
                      <div className="profil-field">
                        <label className="profil-label">Téléphone</label>
                        <input className="profil-input" name="telephone"
                          placeholder="+226 XX XX XX XX"
                          value={form.telephone} onChange={handleChange}/>
                      </div>
                    </div>
                  </div>

                  <button className="btn-save" type="submit"
                    style={{ padding:"13px 32px" }} disabled={loading || !form.type}>
                    {loading
                      ? <><span className="spinner-sm"/>&nbsp;Envoi...</>
                      : "📤 Soumettre la réclamation"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <footer className="dash-footer">
          <span>© 2025 CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <span>Traitement sous 5 jours ouvrables</span>
        </footer>
      </div>
    </div>
  );
}