import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";
import logoNERE from "../../assets/nere.png";

const FLOATING_TEXTS = [
  "RCCM: BF-OUA-2024-A142","IFU: 000-24856-X","CA: 2,4 Mrd FCFA",
  "Secteur: BTP","Région: Centre","Employés: 142",
  "RCCM: BF-BDO-2021-B088","IFU: 000-18723-A","CA: 480 M FCFA",
  "Secteur: Commerce","Région: Hauts-Bassins","Employés: 38",
  "NERE v2.0","CCI-BF","Registre National",
];

const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",     path:"/chat",         key:"messages"     },
];

export default function Recherche() {
  const navigate              = useNavigate();
  const [user, setUser]       = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const bg = document.querySelector(".animated-bg");
    if (!bg) return;
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = Math.random() * 50 + 8;
      p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${Math.random()*14+8}s;animation-delay:${Math.random()*12}s;`;
      bg.appendChild(p);
    }
    const linesContainer = document.querySelector(".connection-lines");
    for (let i = 0; i < 6; i++) {
      const line = document.createElement("div");
      line.className = "conn-line";
      line.style.cssText = `width:${Math.random()*40+30}%;top:${Math.random()*100}%;left:0;animation-duration:${Math.random()*8+6}s;animation-delay:${Math.random()*8}s;opacity:${Math.random()*0.4+0.2};`;
      linesContainer?.appendChild(line);
    }
    const interval = setInterval(() => {
      const text = FLOATING_TEXTS[Math.floor(Math.random()*FLOATING_TEXTS.length)];
      const el = document.createElement("div");
      el.className = `floating-data ${Math.random()>0.6?"gold":""}`;
      el.textContent = text;
      el.style.cssText = `left:${Math.random()*90}%;bottom:-20px;animation-duration:${Math.random()*10+12}s;animation-delay:0s;font-size:${Math.random()>0.5?"9px":"11px"};`;
      bg.appendChild(el);
      setTimeout(()=>el.remove(), 22000);
    }, 1800);
    return () => {
      clearInterval(interval);
      document.querySelectorAll(".particle,.conn-line,.conn-line-v").forEach(e=>e.remove());
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
  };

  const initiales = user ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase() : "";

  const cardBase = {
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
    gap:"20px", width:"320px", padding:"44px 36px", borderRadius:"20px",
    border:"1.5px solid rgba(255,255,255,0.18)",
    background:"rgba(255,255,255,0.06)", backdropFilter:"blur(10px)",
    cursor: user ? "pointer" : "not-allowed",
    transition:"all 0.35s ease", textDecoration:"none", position:"relative",
  };

  const cardHovered = {
    ...cardBase,
    background: user ? "#00904C" : "rgba(255,255,255,0.06)",
    border: `1.5px solid ${user?"#00904C":"rgba(255,255,255,0.18)"}`,
    transform: user ? "translateY(-6px) scale(1.03)" : "none",
    boxShadow: user ? "0 20px 50px rgba(0,0,0,0.35)" : "none",
  };

  return (
    <>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }

        /* ══ NAVBAR — identique Home.jsx ══ */
        .nere-navbar-r {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 120px;
          background: #00904C;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }
        /* Pilule liens — margin-left:auto pousse à droite */
        .nere-navbar-r .nav-pill {
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 20px;
        }
        .nere-navbar-r .nav-pill .nav-btn {
          padding: 7px 15px; border-radius: 100px;
          font-size: 20px; font-weight: 600;
          color: rgba(255,255,255,0.78); cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
          border: none; background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }
        .nere-navbar-r .nav-pill .nav-btn:hover {
          color: #fff; background: rgba(255,255,255,0.12);
        }
        .nere-navbar-r .nav-pill .nav-btn.active {
          color: #0A3D1F; background: #4DC97A;
          font-weight: 700; box-shadow: 0 2px 8px rgba(77,201,122,0.4);
        }
        /* User chip */
        .nere-navbar-r .u-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 12px 5px 5px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; cursor: pointer;
          color: #fff; font-size: 13px; font-weight: 600;
          transition: all 0.2s; flex-shrink: 0;
        }
        .nere-navbar-r .u-chip:hover { background: rgba(255,255,255,0.18); }
        .nere-navbar-r .u-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #4DC97A; color: #0A3D1F;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 12px; flex-shrink: 0;
        }
        /* Dropdown blanc */
        .nere-dropdown-r {
          position: absolute; z-index: 9999;
          top: calc(100% + 10px); right: 0;
          background: #fff; border-radius: 16px;
          border: 1px solid #E2EDE6; min-width: 220px;
          overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.14);
          animation: dropInR 0.18s ease;
        }
        @keyframes dropInR {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .nere-dropdown-r .dd-head {
          padding: 14px 18px 10px; border-bottom: 1px solid #F0F4F1;
          background: linear-gradient(135deg,#F5FAF7,#fff);
        }
        .nere-dropdown-r .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
        .nere-dropdown-r .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
        .nere-dropdown-r .dd-role  {
          display:inline-flex; align-items:center; gap:5px; margin-top:6px;
          background:#E8F5EE; color:#00904C; border-radius:100px; padding:3px 10px;
          font-size:10px; font-weight:700; text-transform:uppercase;
        }
        .nere-dropdown-r .dd-item {
          padding: 10px 18px; font-size:13px; color:#0A3D1F;
          cursor:pointer; transition:background 0.15s;
        }
        .nere-dropdown-r .dd-item:hover { background:#F5FAF7; }
        .nere-dropdown-r .dd-danger { color:#CC3333; }
        .nere-dropdown-r .dd-danger:hover { background:#FFF0F0 !important; }
        .nere-dropdown-r .dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }

        /* Hero */
        .recherche-hero {
          min-height: calc(100vh - 72px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 24px; position: relative; z-index: 10; gap: 48px;
        }
        .recherche-main-title {
          font-size: clamp(28px,4vw,48px); font-weight:900;
          color:#070707; line-height:1.2; margin:0 0 16px;
        }
        .recherche-main-title em { color:#ED1C24; font-style:normal; }
        .recherche-subtitle { font-size:16px; color:rgba(4,4,4,0.72); line-height:1.7; margin:0; }
        .cards-row { display:flex; gap:32px; flex-wrap:wrap; justify-content:center; }
        .choice-label { font-size:19px; font-weight:800; color:#fff; text-align:center; }
        .choice-desc  { font-size:13px; color:rgba(5,5,5,0.65); text-align:center; line-height:1.6; max-width:240px; }
        .choice-arrow { display:inline-flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:#080808; margin-top:4px; }
        @media(max-width:720px){ .cards-row{flex-direction:column;align-items:center;} }
      `}</style>

      <div className="animated-bg">
        <div className="blob1"/><div className="blob2"/><div className="blob3"/>
        <div className="grid"/><div className="connection-lines"/>
        <svg className="skyline" viewBox="0 0 1400 260"
          preserveAspectRatio="xMidYMax meet" fill="rgba(46,111,204,0.5)"
          xmlns="http://www.w3.org/2000/svg">
          <rect x="40"  y="60" width="80"  height="200"/>
          <rect x="240" y="20" width="100" height="240"/>
          <rect x="470" y="50" width="120" height="210"/>
          <rect x="790" y="40" width="90"  height="220"/>
          <rect x="1010"y="30" width="110" height="230"/>
          <rect x="1240"y="50" width="85"  height="210"/>
          <rect x="0"   y="255"width="1400"height="5" fill="rgba(46,111,204,0.6)"/>
        </svg>
      </div>

      <div className="site-wrapper">

        {/* ══ NAVBAR — même design que Home.jsx ══ */}
        <nav className="nere-navbar-r">

          {/* Logo */}
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

          {/* Pilule liens — poussée à droite par margin-left:auto */}
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key}
                className={`nav-btn ${link.key==="recherche"?"active":""}`}
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions */}
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
                    <div className="nere-dropdown-r" onClick={e => e.stopPropagation()}>
                      <div className="dd-head">
                        <div className="dd-name">{user.prenom} {user.nom}</div>
                        <div className="dd-email">{user.email||"—"}</div>
                        <div className="dd-role">
                          {user.role==="admin"   ? "⚙️ Admin" :
                           user.role==="manager" ? "🛠️ Gestionnaire" : "👤 Abonné"}
                        </div>
                      </div>
                      <div style={{ padding:"6px 0" }}>
                        {[
                          { label:"👤 Mon Profil",     path:"/profil"   },
                          { label:"💳 Mon Abonnement", path:"/paiement" },
                          { label:"📋 Historique",     path:"/profil"   },
                        ].map(item => (
                          <div key={item.label} className="dd-item"
                            onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                            {item.label}
                          </div>
                        ))}
                        {user.role==="admin" && (
                          <div className="dd-item"
                            onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                            ⚙️ Tableau de bord
                          </div>
                        )}
                        {user.role==="manager" && (
                          <div className="dd-item"
                            onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>
                            🛠️ Tableau de bord
                          </div>
                        )}
                        <div className="dd-sep"/>
                        <div className="dd-item dd-danger" onClick={handleLogout}>
                          🚪 Déconnexion
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
        <div className="recherche-hero">
          <div style={{ textAlign:"center", maxWidth:"680px" }}>
            <h1 className="recherche-main-title">
              Trouvez une entreprise<br/>au <em>Burkina Faso</em>
            </h1>
            <p className="recherche-subtitle">
              Interrogez le registre national des entreprises selon vos besoins.
              {!user && (
                <strong style={{ color:"#ED1C24", display:"block", marginTop:"8px" }}>
                  Accès réservé aux abonnés — Connectez-vous pour continuer.
                </strong>
              )}
            </p>
          </div>

          {!user ? (
            <div style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(16px)",
              border:"2px solid rgba(237,28,36,0.4)", borderRadius:"20px",
              padding:"48px 40px", maxWidth:"440px", width:"100%", textAlign:"center" }}>
              <div style={{ fontSize:"56px", marginBottom:"16px" }}></div>
              <div style={{ fontSize:"22px", fontWeight:800, color:"#0A2410", marginBottom:"10px" }}>
                Accès réservé aux abonnés
              </div>
              <div style={{ fontSize:"14px", color:"rgba(10,36,16,0.6)", lineHeight:1.7, marginBottom:"28px" }}>
                Pour accéder à la recherche multicritère et aux données du registre NERE,
                vous devez être connecté et disposer d'un abonnement actif.
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                <button onClick={() => navigate("/connexion")}
                  style={{ padding:"14px 28px", borderRadius:"12px", background:"#00904C",
                    border:"none", color:"#fff", fontWeight:800, fontSize:"15px",
                    cursor:"pointer", boxShadow:"0 4px 16px rgba(0,144,76,0.3)" }}>
                  Se connecter
                </button>
                <button onClick={() => navigate("/inscription")}
                  style={{ padding:"14px 28px", borderRadius:"12px", background:"transparent",
                    border:"2px solid rgba(10,36,16,0.2)", color:"#0A2410",
                    fontWeight:700, fontSize:"14px", cursor:"pointer" }}>
                  Créer un compte
                </button>
                <button onClick={() => navigate("/formules")}
                  style={{ padding:"10px", background:"transparent", border:"none",
                    color:"rgba(10,36,16,0.5)", fontSize:"13px",
                    cursor:"pointer", textDecoration:"underline" }}>
                  Voir les formules d'abonnement 
                </button>
              </div>
            </div>
          ) : (
            <div className="cards-row">
              <div style={hovered==="multi" ? cardHovered : cardBase}
                onMouseEnter={() => setHovered("multi")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/demande-document")}>
                <div className="choice-label">Recherche<br/>multicritère</div>
                <div className="choice-desc">
                  Combinez plusieurs filtres : secteur, région, chiffre d'affaires,
                  effectif, statut juridique et plus encore.
                </div>
                <div className="choice-arrow">
                  Accéder
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="#090909"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div style={hovered==="single" ? cardHovered : cardBase}
                onMouseEnter={() => setHovered("single")}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate("/recherche-entreprise")}>
                <div className="choice-label">Recherche par<br/>un critère</div>
                <div className="choice-desc">
                  Recherche rapide et ciblée : nom d'entreprise, numéro RCCM,
                  IFU ou tout autre identifiant unique.
                </div>
                <div className="choice-arrow">
                  Accéder
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="#0d0d0d"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="site-footer">
          <div>
            <div className="footer-logo-text">NERE <span>CCI-BF</span></div>
            <div className="footer-copy">Chambre de Commerce et d'Industrie du Burkina Faso</div>
          </div>
          <div className="footer-links">
            <span className="footer-link">Confidentialité</span>
            <span className="footer-link" style={{ cursor:"pointer" }}
              onClick={() => navigate("/contact")}>Contact</span>
            <span className="footer-link">Support</span>
          </div>
        </footer>
      </div>
    </>
  );
}