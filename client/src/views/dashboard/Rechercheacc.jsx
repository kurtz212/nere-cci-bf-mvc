import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";
import logoCCI      from "../../assets/ccibf.png";
import logoNERE     from "../../assets/nere.png";

export default function Recherche() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  /* ── style de carte : vert permanent ── */
  const cardBase = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    width: "100%",
    maxWidth: "320px",
    padding: "44px 36px",
    borderRadius: "20px",
    border: "1.5px solid rgba(77,201,122,0.8)",
    background: "rgba(77,201,122,0.24)",
    color: "#FFFFFF",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
    textDecoration: "none",
  };

  const iconBox = (color) => ({
    width: "72px",
    height: "72px",
    borderRadius: "18px",
    background: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }

        .recherche-hero {
          min-height: calc(100vh - 90px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          position: relative;
          z-index: 10;
          gap: 48px;
        }

        .recherche-title-block {
          text-align: center;
          max-width: 680px;
        }

        .recherche-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 6px 18px;
          font-size: 12px;
          color: #fff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .recherche-badge .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C9A84C;
        }

        .recherche-main-title {
          font-size: clamp(28px, 4vw, 48px);
          font-weight: 900;
          color: #ffffff;
          line-height: 1.2;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }

        .recherche-main-title em {
          color: #C9A84C;
          font-style: normal;
        }

        .recherche-subtitle {
          font-size: 16px;
          color: rgba(255,255,255,0.72);
          line-height: 1.7;
          margin: 0;
        }

        .cards-row {
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .choice-label {
          font-size: 19px;
          font-weight: 800;
          color: #ffffff;
          text-align: center;
          line-height: 1.3;
        }

        .choice-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          text-align: center;
          line-height: 1.6;
          max-width: 240px;
        }

        .choice-arrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #C9A84C;
          letter-spacing: 0.04em;
          margin-top: 4px;
        }

        .choice-tag {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #C9A84C;
          color: #1a1a1a;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 14px;
          border-radius: 100px;
          white-space: nowrap;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        @media (max-width: 720px) {
          .cards-row { flex-direction: column; align-items: center; }
        }
      `}</style>

      <div className="site-wrapper">

        {/* ══ NAVBAR ══ */}
        <nav className="navbar" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div className="logo-zone" style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{width:"0px", height:"44px", background:"rgba(255,255,255,0.15)", margin:"0 4px"}}/>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <img
                src={logoNERE}
                alt="NERE"
                style={{
                  height: "90px",
                  width: "auto",
                  borderRadius: "6px",
                  flexShrink: 0,
                  backgroundColor: "#ffffff",
                  padding: "4px",
                }}
              />
              <div style={{display:"flex", flexDirection:"column"}}>
                <span style={{fontSize:"11px", fontWeight:800, color:"#ffffff", letterSpacing:"0.06em", textTransform:"uppercase"}}>Fichier NERE</span>
                <span style={{fontSize:"10px", color:"#ffffff", lineHeight:1.4}}>Registre national des entreprises<br/>Du Burkina Faso</span>
              </div>
            </div>
          </div>

          <div className="nav-links" style={{display:"flex", alignItems:"center", gap:"25px", marginLeft:"40px"}}>
            <span className="nav-link" onClick={()=>navigate("/")}>Accueil</span>
            <span className="nav-link" onClick={()=>navigate("/publications")}>Publications</span>
            <span className="nav-link active" onClick={()=>navigate("/demande-document")}>Recherche</span>
            <span className="nav-link" onClick={()=>navigate("/Contact")}>Contact</span>
            <span className="nav-link" onClick={()=>navigate("/Chat")}>Message</span>
          </div>

          <div className="nav-actions">
            {user ? (
              <div style={{position:"relative"}}>
                <div className="user-nav-chip" onClick={()=>setMenuOpen(o=>!o)}>
                  <div className="user-nav-avatar">{initiales}</div>
                  <span>{user.prenom} {user.nom}</span>
                  <span style={{fontSize:"10px",opacity:0.5,marginLeft:"2px"}}>▾</span>
                </div>
                {menuOpen && (
                  <>
                    <div style={{position:"fixed",inset:0,zIndex:50}} onClick={()=>setMenuOpen(false)}/>
                    <div className="user-dropdown" style={{position:"absolute",zIndex:9999,background:"#00904C",top:"calc(100% + 8px)",right:0}} onClick={e=>e.stopPropagation()}>
                      <div className="dropdown-header">
                        <div className="dropdown-name">{user.prenom} {user.nom}</div>
                        <div className="dropdown-email">{user.email || "—"}</div>
                        <div className="dropdown-pack">{user.role==="admin" ? "Administrateur" : "Pack · Actif"}</div>
                      </div>
                      <div className="dropdown-divider"/>
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}>Mon Profil</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/paiement");setMenuOpen(false);}}>Mon Abonnement</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}>Historique</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}>Sécurité</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}>Notifications</div>
                      {user.role==="admin" && (
                        <div className="dropdown-item" onClick={()=>{navigate("/admin");setMenuOpen(false);}}>Tableau de bord</div>
                      )}
                      {user.role==="manager" && (
                        <div className="dropdown-item" onClick={()=>{navigate("/Gestionnaire");setMenuOpen(false);}}>Tableau de bord</div>
                      )}
                      <div className="dropdown-divider"/>
                      <div className="dropdown-item danger" onClick={handleLogout}>Déconnexion</div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button className="btn btn-outline" style={{ background: "#00904C", borderColor: "#00904C", color: "#FFFFFF" }} onClick={()=>navigate("/connexion")}>Connexion</button>
                <button className="btn btn-primary" style={{ background: "#4DC97A", borderColor: "#4DC97A", color: "#FFFFFF" }} onClick={()=>navigate("/inscription")}>S'inscrire</button>
              </>
            )}
          </div>
        </nav>

        {/* ══ HERO RECHERCHE ══ */}
        <div className="recherche-hero">

          <div className="recherche-title-block">
            <div className="recherche-badge">
              <span className="badge-dot"/>
              Moteur de recherche NERE
            </div>
            <h1 className="recherche-main-title">
              Trouvez une entreprise<br/>au <em>Burkina Faso</em>
            </h1>
            <p className="recherche-subtitle">
              Interrogez le registre national des entreprises selon vos besoins.
              Choisissez votre mode de recherche ci-dessous.
            </p>
          </div>

          {/* ── DEUX CARTES ── */}
          <div className="cards-row">

            {/* CARTE 1 — Recherche multicritère */}
            <div
              className="choice-card"
              style={{ position: "relative", ...cardBase }}
              onClick={() => navigate("/recherche-multicritere")}
            >
              <div className="choice-tag">Recommandé</div>

              <div style={iconBox("rgba(0,144,76,0.25)")}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="6" width="28" height="3" rx="1.5" fill="#4DCA7A"/>
                  <rect x="4" y="13" width="20" height="3" rx="1.5" fill="#4DCA7A"/>
                  <rect x="4" y="20" width="24" height="3" rx="1.5" fill="#4DCA7A"/>
                  <rect x="4" y="27" width="16" height="3" rx="1.5" fill="#C9A84C"/>
                  <circle cx="29" cy="28.5" r="4.5" stroke="#4DCA7A" strokeWidth="2"/>
                  <line x1="32.5" y1="32" x2="35" y2="34.5" stroke="#4DCA7A" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="choice-label">Recherche<br/>multicritère</div>

              <div className="choice-desc">
                Combinez plusieurs filtres : secteur, région, chiffre d'affaires, effectif, statut juridique et plus encore.
              </div>

              <div className="choice-arrow">
                Accéder
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* CARTE 2 — Recherche par un critère */}
            <div
              className="choice-card"
              style={{ position: "relative", ...cardBase }}
              onClick={() => navigate("/rechercheentreprise")}
            >
              <div style={iconBox("rgba(0,144,76,0.25)")}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="10" stroke="#4DCA7A" strokeWidth="2.2"/>
                  <line x1="23.5" y1="23.5" x2="32" y2="32" stroke="#4DCA7A" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="16" y1="11" x2="16" y2="21" stroke="#4DCA7A" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="11" y1="16" x2="21" y2="16" stroke="#4DCA7A" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>

              <div className="choice-label">Recherche par<br/>un critère</div>

              <div className="choice-desc">
                Recherche rapide et ciblée : nom d'entreprise, numéro RCCM, IFU ou tout autre identifiant unique.
              </div>

              <div className="choice-arrow">
                Accéder
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

          </div>{/* fin cards-row */}

          <div
            style={{fontSize:"13px", color:"#00904C", cursor:"pointer", marginTop:"-16px"}}
            onClick={()=>navigate("/")}
          >
            ← Retour à l'accueil
          </div>

        </div>{/* fin recherche-hero */}

        {/* ══ FOOTER ══ */}
        <footer className="site-footer">
          <div>
            <div className="footer-logo-text">NERE <span>CCI-BF</span></div>
            <div className="footer-copy">Chambre de Commerce et d'Industrie du Burkina Faso</div>
          </div>
          <div className="footer-links">
            <span className="footer-link">Confidentialité</span>
            <span className="footer-link" style={{cursor:"pointer"}} onClick={()=>navigate("/contact")}>Contact</span>
            <span className="footer-link">Support</span>
          </div>
        </footer>

      </div>
    </>
  );
}