import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.png";

const CONTACTS_INFO = [
  { titre:"Adresse",      lignes:["Avenue de Lyon, 01 BP 502","Ouagadougou 01, Burkina Faso"] },
  { titre:"Téléphone",    lignes:["+226 25 30 61 22","+226 25 30 61 23"] },
  { titre:"Email",        lignes:["https://www.cci.bf/","https://www.fichiernere.bf/"] },
  { titre:"Horaires",     lignes:["Lundi – Vendredi","7h30 – 17h00"] },
  { titre:"Localisation", lignes:["Ouagadougou, Burkina Faso","Voir sur la carte"] },
];

const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",     path:"/chat",         key:"messages"     },
];

export default function Contact() {
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
    ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase()
    : "";

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif", background:"#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        * { font-family: 'DM Sans', Arial, sans-serif !important; box-sizing: border-box; }

        /* ══ NAVBAR ══ */
        .nere-navbar-c {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 120px;
          background: #00904C;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }
        .nere-navbar-c .nav-pill {
          display: flex; align-items: center; gap: 3px;
          background: rgba(198,28,28,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 20px;
        }
        .nere-navbar-c .nav-pill .nav-btn {
          padding: 7px 15px; border-radius: 100px;
          font-size: 20px; font-weight: 600;
          color: rgba(255,255,255,0.78); cursor: pointer;
          white-space: nowrap;
          border: none; background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }
        .nere-navbar-c .nav-pill .nav-btn:hover { color:#fff; background:rgba(255,255,255,0.12); }
        .nere-navbar-c .nav-pill .nav-btn.active {
          color:#0A3D1F; background:#4DC97A;
          font-weight:700; box-shadow:0 2px 8px rgba(77,201,122,0.4);
        }
        .nere-navbar-c .u-chip {
          display:flex; align-items:center; gap:8px;
          padding:5px 12px 5px 5px;
          background:rgba(255,255,255,0.1);
          border:1px solid rgba(255,255,255,0.2);
          border-radius:100px; cursor:pointer;
          color:#fff; font-size:13px; font-weight:600;
          flex-shrink:0;
        }
        .nere-navbar-c .u-chip:hover { background:rgba(255,255,255,0.18); }
        .nere-navbar-c .u-avatar {
          width:30px; height:30px; border-radius:50%;
          background:#4DC97A; color:#0A3D1F;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:12px; flex-shrink:0;
        }
        .nere-dropdown-c {
          position:absolute; z-index:9999;
          top:calc(100% + 10px); right:0;
          background:#fff; border-radius:16px;
          border:1px solid #E2EDE6; min-width:220px;
          overflow:hidden; box-shadow:0 16px 48px rgba(0,0,0,0.14);
        }
        .nere-dropdown-c .dd-head {
          padding:14px 18px 10px; border-bottom:1px solid #F0F4F1;
          background:linear-gradient(135deg,#F5FAF7,#fff);
        }
        .nere-dropdown-c .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
        .nere-dropdown-c .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
        .nere-dropdown-c .dd-role  {
          display:inline-flex; align-items:center; gap:5px; margin-top:6px;
          background:#E8F5EE; color:#00904C; border-radius:100px; padding:3px 10px;
          font-size:10px; font-weight:700; text-transform:uppercase;
        }
        .nere-dropdown-c .dd-item {
          padding:10px 18px; font-size:13px; color:#0A3D1F; cursor:pointer;
        }
        .nere-dropdown-c .dd-item:hover { background:#F5FAF7; }
        .nere-dropdown-c .dd-danger { color:#CC3333; }
        .nere-dropdown-c .dd-danger:hover { background:#FFF0F0 !important; }
        .nere-dropdown-c .dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }

        /* ══ HERO : layout deux colonnes ══ */
        .contact-hero {
          display: flex;
          min-height: 540px;
          border-bottom: 3px solid #ED1C24;
        }

        /* Colonne gauche — blanche */
        .hero-left {
          flex: 1;
          padding: 72px 56px 72px 48px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Colonne droite — entièrement verte */
        .hero-right {
          width: 440px;
          flex-shrink: 0;
          background: #00904C;
          padding: 52px 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-label {
          display: inline-flex; align-items: center;
          background: #ED1C24; color: #fff;
          font-size: 18px; font-weight: 700;
          padding: 5px 14px; border-radius: 4px;
          letter-spacing: 0.1em; text-transform: uppercase;
          margin-bottom: 18px; width: fit-content;
        }
        .hero-title {
          font-family: 'Playfair Display', serif !important;
          font-size: 70px;
          font-weight: 900; color: #0A0A0A;
          line-height: 1.1; margin: 0;
        }
        .hero-title span { color: #00904C; }
        .hero-sub {
          font-size: 24px; color: #555;
          margin-top: 16px; line-height: 1.7; max-width: 420px;
        }

        /* Titre carte coordonnées */
        .coord-title {
          font-family: 'Playfair Display', serif !important;
          font-size: 40px; font-weight: 900;
          color: #ffffff; margin: 0 0 4px;
        }
        .coord-sub {
          font-size: 18px; color: rgba(255,255,255,0.65);
          margin-bottom: 28px; padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .coord-sub strong { color: #ED1C24; }

        /* Lignes infos */
        .info-row {
          padding: 11px 0;
          border-bottom: 1px solid rgba(255,255,255,0.12);
        }
        .info-row:last-child { border-bottom: none; }
        .info-label {
          font-size: 18px; font-weight: 800; color: #090909;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 3px;
        }
        .info-line {
          font-size: 16px; color: rgba(255,255,255,0.9); line-height: 1.65;
        }
        .info-link { color: #ffffff; text-decoration: underline; opacity: 0.8; }
        .info-link:hover { opacity: 1; }

        .open-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
          color: #ffffff; border-radius: 100px;
          font-size: 11px; font-weight: 700; padding: 3px 12px;
          margin-top: 5px;
        }
        .open-dot { width:6px; height:6px; border-radius:50%; background:#ffffff; }

        /* ══ FOOTER ══ */
        .contact-footer {
          background: #ffffff;
          border-top: 3px solid #ED1C24;
          padding: 28px 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .contact-footer span { font-size: 13px; color: #ED1C24); }
        .contact-footer strong { color: #4DC97A; }

        @media(max-width:860px){
          .contact-hero { flex-direction: column; }
          .hero-right { width: 100%; }
        }
      `}</style>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR ══ */}
        <nav className="nere-navbar-c">
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <img src={logoNERE} alt="NERE"
              style={{ height:"80px", width:"auto", borderRadius:"6px",
                flexShrink:0, backgroundColor:"#fff", padding:"4px" }}/>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
              <span style={{ fontSize:"18px", fontWeight:800, color:"#fff",
                letterSpacing:"0.08em", textTransform:"uppercase" }}>Fichier NERE</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>
                Registre national des entreprises
              </span>
            </div>
          </div>

          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key}
                className={`nav-btn ${link.key==="contact"?"active":""}`}
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
            {user ? (
              <div style={{ position:"relative" }}>
                <div className="u-chip" onClick={() => setMenuOpen(o => !o)}>
                  <div className="u-avatar">{initiales}</div>
                  <span style={{ maxWidth:"100px", overflow:"hidden",
                    textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {user.prenom} {user.nom}
                  </span>
                  <span style={{ fontSize:"9px", opacity:0.5 }}>▾</span>
                </div>
                {menuOpen && (
                  <>
                    <div style={{ position:"fixed", inset:0, zIndex:50 }}
                      onClick={() => setMenuOpen(false)}/>
                    <div className="nere-dropdown-c" onClick={e => e.stopPropagation()}>
                      <div className="dd-head">
                        <div className="dd-name">{user.prenom} {user.nom}</div>
                        <div className="dd-email">{user.email||"—"}</div>
                        <div className="dd-role">
                          {user.role==="admin"   ? " Admin" :
                           user.role==="manager" ? " Gestionnaire" : " Abonné"}
                        </div>
                      </div>
                      <div style={{ padding:"6px 0" }}>
                        {[
                          { label:" Mon Profil",     path:"/profil"   },
                          { label:" Mon Abonnement", path:"/paiement" },
                          { label:" Historique",     path:"/profil"   },
                        ].map(item => (
                          <div key={item.label} className="dd-item"
                            onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                            {item.label}
                          </div>
                        ))}
                        {user.role==="admin" && (
                          <div className="dd-item"
                            onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                             Tableau de bord
                          </div>
                        )}
                        {user.role==="manager" && (
                          <div className="dd-item"
                            onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>
                             Tableau de bord
                          </div>
                        )}
                        <div className="dd-sep"/>
                        <div className="dd-item dd-danger" onClick={handleLogout}>
                           Déconnexion
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button onClick={() => navigate("/connexion")}
                  style={{ padding:"7px 18px", borderRadius:"100px",
                    border:"1.5px solid rgba(255,255,255,0.35)", background:"transparent",
                    color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
                  Connexion
                </button>
                <button onClick={() => navigate("/inscription")}
                  style={{ padding:"7px 18px", borderRadius:"100px",
                    border:"none", background:"#4DC97A",
                    color:"#0A3D1F", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <div className="contact-hero">

          {/* GAUCHE — textes sur fond blanc */}
          <div className="hero-left">
            <div className="hero-label">CCI-BF · Nous contacter</div>
            <h1 className="hero-title">
              Contactez<br/><span>la CCI-BF</span>
            </h1>
            <p className="hero-sub">
              Notre équipe est disponible pour répondre à toutes vos questions
              concernant le registre national des entreprises du Burkina Faso.
            </p>
          </div>

          {/* DROITE — coordonnées sur fond vert */}
          <div className="hero-right">
            <div className="coord-title">Nos coordonnées</div>
            <div className="coord-sub">
              <strong>CCI-BF</strong> — Ouagadougou, Burkina Faso
            </div>

            {CONTACTS_INFO.map((c, i) => (
              <div key={i} className="info-row">
                <div className="info-label">{c.titre}</div>
                {c.lignes.map((l, j) => (
                  <div key={j} className="info-line">
                    {c.titre==="Email" ? (
                      <a href={l} target="_blank" rel="noopener noreferrer" className="info-link">{l}</a>
                    ) : c.titre==="Localisation" && j===1 ? (
                      <a href="https://maps.google.com/?q=Ouagadougou+CCI-BF"
                        target="_blank" rel="noopener noreferrer" className="info-link">{l}</a>
                    ) : l}
                  </div>
                ))}
                {c.titre==="Horaires" && (
                  <div className="open-badge">
                    <span className="open-dot"/>
                    Ouvert maintenant
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* ══ FOOTER ══ */}
        <footer className="contact-footer">
          <span>CCI-BF — <strong>Chambre de Commerce et d'Industrie du Burkina Faso</strong></span>
   
        </footer>
      </div>
    </div>
  );
}