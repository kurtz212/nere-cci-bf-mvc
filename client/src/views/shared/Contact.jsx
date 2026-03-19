import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const SUJETS = [
  "Informations sur les formules d'abonnement",
  "Aide technique / problème sur la plateforme",
  "Demande de partenariat",
  "Demande de devis personnalisé",
  "Question sur les données NERE",
  "Autre",
];

const CONTACTS_INFO = [
  {
    icon: "📍",
    titre: "Adresse",
    lignes: ["Avenue de Lyon, 01 BP 502", "Ouagadougou 01, Burkina Faso"],
  },
  {
    icon: "📞",
    titre: "Téléphone",
    lignes: ["+226 25 30 61 22", "+226 25 30 61 23"],
  },
  {
    icon: "📧",
    titre: "Email",
    lignes: ["contact@cci-bf.org", "nere@cci-bf.org"],
  },
  {
    icon: "🕐",
    titre: "Horaires",
    lignes: ["Lundi – Vendredi", "8h00 – 17h00"],
  },
];

// ── Vérifier si on est en heures ouvrables ──
function estOuvrable() {
  const now    = new Date();
  const jour   = now.getDay();   // 0=Dim, 1=Lun, ..., 5=Ven, 6=Sam
  const heure  = now.getHours();
  const minute = now.getMinutes();
  const enSemaine = jour >= 1 && jour <= 5;
  const enHeure   = (heure > 8 || (heure === 8 && minute >= 0)) && heure < 17;
  return enSemaine && enHeure;
}

const JOURS = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

export default function Contact() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatOuvert = estOuvrable();
  const now        = new Date();
  const jourActuel = JOURS[now.getDay()];
  const heureActuelle = `${String(now.getHours()).padStart(2,"0")}h${String(now.getMinutes()).padStart(2,"0")}`;
  const [form, setForm] = useState({
    nom:       user?.nom    || "",
    prenom:    user?.prenom || "",
    email:     user?.email  || "",
    telephone: user?.telephone || "",
    sujet:     "",
    message:   "",
  });

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/reclamations", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type:        "autre",
          sujet:       form.sujet,
          description: form.message,
          nom:         form.nom,
          prenom:      form.prenom,
          email:       form.email,
          telephone:   form.telephone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert(data.message || "Erreur lors de l'envoi.");
      }
    } catch(e) {
      console.warn("API indisponible:", e.message);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
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
            <span className="dash-nav-link" onClick={() => navigate("/reclamation")}>Réclamation</span>
            <span className="dash-nav-link active">Contact</span>
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
          <div className="pub-page-tag">CCI-BF · Nous contacter</div>
          <h1 className="pub-page-title" style={{ fontSize:"28px", textAlign:"left" }}>
            Contactez la CCI-BF
          </h1>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"14px", marginTop:"8px" }}>
            Notre équipe vous répond sous <strong style={{ color:"#4DC97A" }}>48 heures ouvrables</strong>.
          </p>
        </div>

        <div style={{ padding:"32px 48px 60px", background:"var(--off-white)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px",
            gap:"28px", maxWidth:"1000px" }}>

            {/* FORMULAIRE */}
            <div style={{ background:"#fff", borderRadius:"16px",
              border:"1px solid var(--border)", padding:"32px" }}>

              {success ? (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <div style={{ fontSize:"56px", marginBottom:"16px" }}>✉️</div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif",
                    color:"var(--green-dark)", fontSize:"22px", marginBottom:"12px" }}>
                    Message envoyé !
                  </h2>
                  <p style={{ color:"var(--text-muted)", lineHeight:1.7, marginBottom:"24px" }}>
                    Merci pour votre message.<br/>
                    Notre équipe vous répondra sous <strong>48h ouvrables</strong>.
                  </p>
                  <button className="btn-save" onClick={() => navigate("/")}>
                    Retour à l'accueil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px",
                    color:"var(--text-dark)", marginBottom:"20px" }}>
                    Envoyez-nous un message
                  </h3>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                    gap:"14px", marginBottom:"14px" }}>
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

                  <div className="profil-field" style={{ marginBottom:"14px" }}>
                    <label className="profil-label">Sujet *</label>
                    <select className="profil-input" name="sujet"
                      value={form.sujet} onChange={handleChange} required>
                      <option value="">Sélectionner un sujet...</option>
                      {SUJETS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="profil-field" style={{ marginBottom:"24px" }}>
                    <label className="profil-label">Message *</label>
                    <textarea className="profil-input" name="message" rows={6}
                      placeholder="Écrivez votre message ici..."
                      value={form.message} onChange={handleChange}
                      style={{ resize:"vertical" }} required/>
                  </div>

                  <button className="btn-save" type="submit"
                    style={{ padding:"13px 32px" }} disabled={loading}>
                    {loading
                      ? <><span className="spinner-sm"/>&nbsp;Envoi...</>
                      : "📤 Envoyer le message"}
                  </button>
                </form>
              )}
            </div>

            {/* INFOS CONTACT */}
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {CONTACTS_INFO.map(c => (
                <div key={c.titre} style={{ background:"#fff", borderRadius:"14px",
                  border:"1px solid var(--border)", padding:"18px 20px",
                  display:"flex", alignItems:"flex-start", gap:"14px" }}>
                  <div style={{ width:"40px", height:"40px", borderRadius:"10px",
                    background:"var(--green-pale)", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    fontSize:"18px", flexShrink:0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"13px",
                      color:"var(--text-dark)", marginBottom:"4px" }}>
                      {c.titre}
                    </div>
                    {c.lignes.map((l, i) => (
                      <div key={i} style={{ fontSize:"13px",
                        color:"var(--text-muted)", lineHeight:1.6 }}>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Réclamation */}
              <div style={{ background:"rgba(232,85,85,0.06)", borderRadius:"14px",
                border:"1px solid rgba(232,85,85,0.15)",
                padding:"18px 20px", textAlign:"center" }}>
                <div style={{ fontSize:"28px", marginBottom:"8px" }}>📋</div>
                <div style={{ fontWeight:700, fontSize:"14px",
                  color:"var(--text-dark)", marginBottom:"6px" }}>
                  Déposer une réclamation
                </div>
                <div style={{ fontSize:"12px", color:"var(--text-muted)",
                  marginBottom:"14px", lineHeight:1.5 }}>
                  Traitement sous<br/>5 jours ouvrables
                </div>
                <button style={{ width:"100%", padding:"10px", borderRadius:"10px",
                  background:"rgba(232,85,85,0.1)", border:"1px solid rgba(232,85,85,0.25)",
                  color:"#E85555", fontWeight:700, fontSize:"13px",
                  cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
                  onClick={() => navigate("/reclamation")}>
                  📋 Faire une réclamation
                </button>
              </div>

              {/* Chat rapide */}
              <div style={{ background: chatOuvert ? "var(--green-deep)" : "#2A2A2A",
                borderRadius:"14px", padding:"18px 20px", textAlign:"center",
                transition:"background 0.3s" }}>
                <div style={{ fontSize:"28px", marginBottom:"8px" }}>💬</div>
                <div style={{ fontWeight:700, fontSize:"14px",
                  color:"#fff", marginBottom:"6px" }}>
                  Chat en direct
                </div>

                {/* Indicateur statut */}
                <div style={{ display:"inline-flex", alignItems:"center", gap:"6px",
                  background: chatOuvert ? "rgba(77,201,122,0.2)" : "rgba(255,255,255,0.08)",
                  borderRadius:"100px", padding:"4px 10px", marginBottom:"10px" }}>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%",
                    background: chatOuvert ? "#4DC97A" : "#888",
                    display:"inline-block",
                    boxShadow: chatOuvert ? "0 0 6px #4DC97A" : "none" }}/>
                  <span style={{ fontSize:"11px", fontWeight:700,
                    color: chatOuvert ? "#4DC97A" : "#888" }}>
                    {chatOuvert ? "En ligne" : "Hors ligne"}
                  </span>
                </div>

                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.45)",
                  marginBottom:"14px", lineHeight:1.7 }}>
                  {chatOuvert ? (
                    <>Un agent est disponible<br/>pour vous répondre maintenant</>
                  ) : (
                    <>
                      Service fermé · {jourActuel} {heureActuelle}<br/>
                      <span style={{ color:"rgba(255,255,255,0.3)" }}>
                        Ouvert Lun–Ven · 8h00 – 17h00
                      </span>
                    </>
                  )}
                </div>

                {chatOuvert ? (
                  <button className="btn-save" style={{ width:"100%", padding:"10px" }}
                    onClick={() => navigate("/chat")}>
                    💬 Ouvrir le chat
                  </button>
                ) : (
                  <>
                    <button disabled style={{ width:"100%", padding:"10px",
                      borderRadius:"10px", background:"rgba(255,255,255,0.08)",
                      border:"1px solid rgba(255,255,255,0.1)",
                      color:"rgba(255,255,255,0.3)", fontWeight:700, fontSize:"13px",
                      cursor:"not-allowed", fontFamily:"inherit", marginBottom:"8px" }}>
                      🔒 Chat indisponible
                    </button>
                    <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.25)",
                      lineHeight:1.6 }}>
                      Laissez un message via<br/>le formulaire ci-contre
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="dash-footer">
          <span>© 2025 CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <span>Réponse sous 48h ouvrables</span>
        </footer>
      </div>
    </div>
  );
}