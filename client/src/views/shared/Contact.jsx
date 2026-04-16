import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.jpg";

const CONTACTS_INFO = [
  {  titre: "Adresse",   lignes: ["Avenue de Lyon, 01 BP 502", "Ouagadougou 01, Burkina Faso"] },
  {  titre: "Téléphone", lignes: ["+226 25 30 61 22", "+226 25 30 61 23"] },
  {  titre: "Email",     lignes: ["https://www.cci.bf/", "https://www.fichiernere.bf/"] },
  {  titre: "Horaires",  lignes: ["Lundi – Vendredi", "8h00 – 17h00"] },
  {  titre: "Localisation", lignes: ["Ouagadougou, Burkina Faso", "Voir sur la carte "] },
];

function estOuvrable() {
  const now   = new Date();
  const jour  = now.getDay();
  const heure = now.getHours();
  return jour >= 1 && jour <= 5 && heure >= 8 && heure < 17;
}

const JOURS = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

export default function Contact() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const chatOuvert    = estOuvrable();
  const now           = new Date();
  const jourActuel    = JOURS[now.getDay()];
  const heureActuelle = `${String(now.getHours()).padStart(2,"0")}h${String(now.getMinutes()).padStart(2,"0")}`;

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
  };

  const initiales = user
    ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase()
    : "";

  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", telephone: "", sujet: "", message: "",
  });

  useEffect(() => {
    if (user) setForm(f => ({
      ...f, nom: user.nom || "", prenom: user.prenom || "", email: user.email || "",
    }));
  }, [user]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/demandes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: "contact", sujet: form.sujet, description: form.message,
          nom: form.nom, prenom: form.prenom, email: form.email, telephone: form.telephone,
        }),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else alert(data.message || "Erreur lors de l'envoi.");
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif",
      background:"#ffffff" }}>
      <style>{`* { font-family: Arial, Helvetica, sans-serif !important; }`}</style>

      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR ══ */}
        <nav className="dash-navbar">
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

          <div className="dash-nav-links" style={{ gap:"18px", color:"#ffffff" }}>
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link" onClick={() => navigate("/publications")}>Publications</span>
            <span className="dash-nav-link" onClick={() => navigate("/rechercheacc")}>Recherche</span>
            <span className="dash-nav-link active">Contact</span>
            <span className="dash-nav-link" onClick={() => navigate("/chat")}>Chat</span>
          </div>

          <div className="dash-nav-actions">
            {user ? (
              <div style={{ position:"relative" }}>
                <div className="user-chip" onClick={() => setMenuOpen(o => !o)}>
                  <div className="user-avatar">{initiales}</div>
                  <span>{user.prenom} {user.nom}</span>
                  <span style={{ fontSize:"10px", opacity:0.5, marginLeft:"2px" }}>▾</span>
                </div>
                {menuOpen && (
                  <>
                    <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={() => setMenuOpen(false)}/>
                    <div style={{
                      position:"absolute", zIndex:9999, background:"#00904C",
                      top:"calc(100% + 8px)", right:0, borderRadius:"12px",
                      border:"1px solid rgba(255,255,255,0.15)", minWidth:"200px",
                      overflow:"hidden", boxShadow:"0 10px 30px rgba(0,0,0,0.25)"
                    }} onClick={e => e.stopPropagation()}>
                      <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontWeight:700, color:"#ffffff", fontSize:"14px" }}>{user.prenom} {user.nom}</div>
                        <div style={{ fontSize:"12px", color:"#ffffff" }}>{user.email || "—"}</div>
                      </div>
                      {[
                        { label:"Mon Profil",     path:"/profil" },
                        { label:"Mon Abonnement", path:"/paiement" },
                      ].map(item => (
                        <div key={item.label}
                          style={{ padding:"11px 16px", color:"rgba(255,255,255,0.85)", fontSize:"13px", cursor:"pointer" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                          {item.label}
                        </div>
                      ))}
                      <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ padding:"11px 16px", color:"#FF6B6B", fontSize:"13px", cursor:"pointer", fontWeight:600 }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,107,0.1)"}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          onClick={handleLogout}>
                          Déconnexion
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button className="btn-nav-outline" onClick={() => navigate("/connexion")}>Connexion</button>
                <button className="btn-nav-primary" onClick={() => navigate("/inscription")}>S'inscrire</button>
              </>
            )}
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <div className="pub-page-hero" style={{ padding:"40px 48px 36px", textAlign:"center" }}>
          <div className="pub-page-tag">CCI-BF · Nous contacter</div>
          <h1 className="pub-page-title">Contactez la CCI-BF</h1>
          <p style={{ color:"#6B9A7A", fontSize:"15px", marginTop:"8px" }}>
            Notre équipe vous répond sous{" "}
            <strong style={{ color:"#00904C" }}>48 heures ouvrables</strong>.
          </p>
        </div>

        {/* ══ DEUX CARTES CENTRÉES ══ */}
        <div style={{
          display:"flex",
          justifyContent:"center",
          alignItems:"flex-start",
          gap:"28px",
          padding:"48px 24px 80px",
          flexWrap:"wrap",
        }}>

          {/* ── CARTE 1 : Toutes les infos ── */}
          <div style={{
            background:"#ffffff",
            borderRadius:"20px",
            border:"1.5px solid rgba(0,144,76,0.15)",
            padding:"36px 32px",
            width:"380px",
            boxShadow:"0 4px 24px rgba(0,144,76,0.08)",
          }}>
            {/* En-tête carte */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px",
              paddingBottom:"20px", borderBottom:"1px solid rgba(0,144,76,0.1)" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"12px",
                background:"rgba(0,144,76,0.1)", display:"flex",
                alignItems:"center", justifyContent:"center", fontSize:"20px" }}>
                
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:"16px", color:"#0A2410" }}>
                  Nos coordonnées
                </div>
                <div style={{ fontSize:"12px", color:"#6B9A7A", marginTop:"2px" }}>
                  CCI-BF — Ouagadougou
                </div>
              </div>
            </div>

            {/* Lignes infos */}
            <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
              {CONTACTS_INFO.map((c, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
                 
                  {/* Texte */}
                  <div>
                    <div style={{ fontWeight:700, fontSize:"12px", color:"#6B9A7A",
                      textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"4px" }}>
                      {c.titre}
                    </div>
                    {c.lignes.map((l, j) => (
                      <div key={j} style={{ fontSize:"13px", color:"#0A2410", lineHeight:1.6 }}>
                        {c.titre === "Email" ? (
                          <a href={`mailto:${l}`}
                            style={{ color:"#00904C", textDecoration:"none" }}
                            onMouseEnter={e => e.target.style.textDecoration = "underline"}
                            onMouseLeave={e => e.target.style.textDecoration = "none"}>
                            {l}
                          </a>
                        ) : c.titre === "Localisation" && j === 1 ? (
                          <a href="https://maps.google.com/?q=Ouagadougou+CCI-BF"
                            target="_blank" rel="noopener noreferrer"
                            style={{ color:"#00904C", textDecoration:"none" }}
                            onMouseEnter={e => e.target.style.textDecoration = "underline"}
                            onMouseLeave={e => e.target.style.textDecoration = "none"}>
                            {l}
                          </a>
                        ) : l}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Ligne verte décorative bas */}
            <div style={{ marginTop:"28px", height:"4px", borderRadius:"2px",
              background:"linear-gradient(90deg, #00904C, #4DC97A)" }}/>
          </div>

          {/* ── CARTE 2 : Chat en direct ── */}
          <div style={{
            background: chatOuvert ? "#00904C" : "#1e1e1e",
            borderRadius:"20px",
            border: chatOuvert
              ? "1.5px solid rgba(77,201,122,0.4)"
              : "1.5px solid rgba(255,255,255,0.08)",
            padding:"36px 32px",
            width:"380px",
            boxShadow: chatOuvert
              ? "0 4px 24px rgba(0,144,76,0.25)"
              : "0 4px 24px rgba(0,0,0,0.2)",
            display:"flex",
            flexDirection:"column",
            alignItems:"center",
            textAlign:"center",
            gap:"16px",
          }}>

           
            

            {/* Titre */}
            <div style={{ fontWeight:800, fontSize:"20px", color:"#fff" }}>
              Chat en direct
            </div>

            {/* Badge statut */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:"7px",
              background: chatOuvert ? "rgba(77,201,122,0.2)" : "rgba(255,255,255,0.08)",
              border: chatOuvert
                ? "1px solid rgba(77,201,122,0.4)"
                : "1px solid rgba(255,255,255,0.1)",
              borderRadius:"100px", padding:"6px 16px" }}>
              <span style={{ width:"8px", height:"8px", borderRadius:"50%",
                background: chatOuvert ? "#4DC97A" : "#888",
                display:"inline-block",
                boxShadow: chatOuvert ? "0 0 8px #4DC97A" : "none",
                animation: chatOuvert ? "pulse 2s infinite" : "none" }}/>
              <span style={{ fontSize:"12px", fontWeight:700,
                color: chatOuvert ? "#4DC97A" : "#888" }}>
                {chatOuvert ? "Agent en ligne" : "Hors ligne"}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.65)",
              lineHeight:1.8, margin:0, maxWidth:"280px" }}>
              {chatOuvert ? (
                <>
                  Un agent CCI-BF est disponible maintenant.<br/>
                  Obtenez une réponse en quelques minutes.
                </>
              ) : (
                <>
                  Le chat est fermé actuellement.<br/>
                  <span style={{ color:"rgba(255,255,255,0.4)" }}>
                    {jourActuel} · {heureActuelle}
                  </span><br/>
                  <span style={{ color:"rgba(255,255,255,0.35)", fontSize:"12px" }}>
                    Disponible Lun–Ven · 8h00 – 17h00
                  </span>
                </>
              )}
            </p>

            {/* Séparateur */}
            <div style={{ width:"100%", height:"1px",
              background:"rgba(255,255,255,0.1)" }}/>

            {/* Bouton */}
            {chatOuvert ? (
              <button onClick={() => navigate("/chatadmin")} style={{
                width:"100%", padding:"14px", borderRadius:"12px",
                background:"#ffffff", border:"none",
                color:"#00904C", fontWeight:800, fontSize:"15px",
                cursor:"pointer", transition:"all 0.2s",
                boxShadow:"0 4px 14px rgba(0,0,0,0.15)",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff"}
                onMouseLeave={e => e.currentTarget.style.background = "#ffffff"}>
                Ouvrir le chat 
              </button>
            ) : (
              <>
                <button disabled style={{
                  width:"100%", padding:"14px", borderRadius:"12px",
                  background:"rgba(255,255,255,0.06)",
                  border:"1px solid rgba(255,255,255,0.1)",
                  color:"rgba(255,255,255,0.3)", fontWeight:700, fontSize:"14px",
                  cursor:"not-allowed" }}>
                  Chat indisponible
                </button>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.3)", lineHeight:1.6 }}>
                  Vous pouvez envoyer un email à<br/>
                  <span style={{ color:"rgba(255,255,255,0.5)" }}>info@cci.bf</span>
                </div>
              </>
            )}

            {/* Infos complémentaires */}
            <div style={{ width:"100%", background:"rgba(255,255,255,0.06)",
              borderRadius:"10px", padding:"12px 16px",
              fontSize:"12px", color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>
               +226 25 30 61 22<br/>
               Lun–Ven · 8h00 – 17h00
            </div>
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="dash-footer">
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <span>Réponse sous 48h ouvrables · +226 25 30 61 22</span>
        </footer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}