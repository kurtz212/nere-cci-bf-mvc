import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";
import logoNERE from "../../assets/nere.jpg";

const FLOATING_TEXTS = [
  "RCCM: BF-OUA-2024-A142","IFU: 000-24856-X","CA: 2,4 Mrd FCFA",
  "Secteur: BTP","Région: Centre","Employés: 142",
  "RCCM: BF-BDO-2021-B088","IFU: 000-18723-A","CA: 480 M FCFA",
  "Secteur: Commerce","Région: Hauts-Bassins","Employés: 38",
  "NERE v2.0","CCI-BF","Registre National",
];

export default function Recherche() {
  const navigate = useNavigate();
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
      setTimeout(()=>el.remove(),22000);
    },1800);
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
    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
    gap:"20px",width:"320px",padding:"44px 36px",borderRadius:"20px",
    border:"1.5px solid rgba(255,255,255,0.18)",
    background:"rgba(255,255,255,0.06)",backdropFilter:"blur(10px)",
    cursor: user ? "pointer" : "not-allowed",
    transition:"all 0.35s ease",textDecoration:"none",position:"relative",
  };

  const cardHovered = {
    ...cardBase,
    background: user ? "#00904C" : "rgba(255,255,255,0.06)",
    border:`1.5px solid ${user?"#00904C":"rgba(255,255,255,0.18)"}`,
    transform: user ? "translateY(-6px) scale(1.03)" : "none",
    boxShadow: user ? "0 20px 50px rgba(0,0,0,0.35)" : "none",
  };

  const handleCardClick = (path) => {
    if (!user) return;
    navigate(path);
  };

  return (
    <>
      <style>{`
        .recherche-hero {
          min-height: calc(100vh - 100px);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 60px 24px; position: relative; z-index: 10; gap: 48px;
        }
        .recherche-main-title {
          font-size: clamp(28px, 4vw, 48px); font-weight: 900;
          color: #070707; line-height: 1.2; margin: 0 0 16px;
        }
        .recherche-main-title em { color: #ED1C24; font-style: normal; }
        .recherche-subtitle { font-size: 16px; color: rgba(4,4,4,0.72); line-height: 1.7; margin: 0; }
        .cards-row { display: flex; gap: 32px; flex-wrap: wrap; justify-content: center; }
        .choice-label { font-size: 19px; font-weight: 800; color: #fff; text-align: center; }
        .choice-desc  { font-size: 13px; color: rgba(5,5,5,0.65); text-align: center; line-height: 1.6; max-width: 240px; }
        .choice-arrow { display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#080808;margin-top:4px; }
        @media(max-width:720px){ .cards-row{flex-direction:column;align-items:center;} }

        /* Notification badge */
        @keyframes notifPop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
        .notif-badge { animation: notifPop 0.4s ease both; }

        /* Alerte toast */
        @keyframes toastIn  { from{transform:translateY(80px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes toastOut { from{opacity:1} to{opacity:0} }
        .toast-in  { animation: toastIn  0.4s ease both; }
        .toast-out { animation: toastOut 0.3s ease both; }
      `}</style>

      <div className="animated-bg">
        <div className="blob1"/><div className="blob2"/><div className="blob3"/>
        <div className="grid"/><div className="connection-lines"/>
        <svg className="skyline" viewBox="0 0 1400 260" preserveAspectRatio="xMidYMax meet" fill="rgba(46,111,204,0.5)" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="60" width="80" height="200"/><rect x="240" y="20" width="100" height="240"/>
          <rect x="470" y="50" width="120" height="210"/><rect x="790" y="40" width="90" height="220"/>
          <rect x="1010" y="30" width="110" height="230"/><rect x="1240" y="50" width="85" height="210"/>
          <rect x="0" y="255" width="1400" height="5" fill="rgba(46,111,204,0.6)"/>
        </svg>
      </div>

      <div className="site-wrapper">

        {/* NAVBAR */}
        <nav className="navbar" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div className="logo-zone" style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"0px",height:"44px",background:"rgba(255,255,255,0.15)",margin:"0 4px"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
              <img src={logoNERE} alt="Logo NERE" style={{height:"90px",width:"auto",borderRadius:"6px"}}/>
              <div style={{display:"flex",flexDirection:"column"}}>
                <span style={{fontSize:"11px",fontWeight:800,color:"#fff",letterSpacing:"0.06em",textTransform:"uppercase"}}>Fichier NERE</span>
                <span style={{fontSize:"10px",color:"#fff",lineHeight:1.4}}>Registre national des entreprises<br/>Du Burkina Faso</span>
              </div>
            </div>
          </div>
          <div className="nav-links" style={{display:"flex",alignItems:"center",gap:"25px",marginLeft:"40px"}}>
            <span className="nav-link" onClick={()=>navigate("/")}>Accueil</span>
            <span className="nav-link" onClick={()=>navigate("/publications")}>Publications</span>
            <span className="nav-link active">Recherche</span>
            <span className="nav-link" onClick={()=>navigate("/contact")}>Contact</span>
            <span className="nav-link" onClick={()=>navigate("/chat")}>Chat</span>
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
                    <div className="user-dropdown" style={{position:"absolute",zIndex:9999,top:"calc(100% + 8px)",right:0}} onClick={e=>e.stopPropagation()}>
                      <div className="dropdown-header">
                        <div className="dropdown-name">{user.prenom} {user.nom}</div>
                        <div className="dropdown-email">{user.email||"—"}</div>
                        <div className="dropdown-pack">{user.role==="admin"?" Administrateur":"Pack · Actif"}</div>
                      </div>
                      <div className="dropdown-divider"/>
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}> Mon Profil</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/paiement");setMenuOpen(false);}}> Mon Abonnement</div>
                      {user.role==="admin"&&<div className="dropdown-item" onClick={()=>{navigate("/admin");setMenuOpen(false);}}> Tableau de bord</div>}
                      {user.role==="manager"&&<div className="dropdown-item" onClick={()=>{navigate("/gestionnaire");setMenuOpen(false);}}> Tableau de bord</div>}
                      <div className="dropdown-divider"/>
                      <div className="dropdown-item danger" onClick={handleLogout}> Déconnexion</div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button className="btn btn-outline" onClick={()=>navigate("/connexion")}>Connexion</button>
                <button className="btn btn-primary" onClick={()=>navigate("/inscription")}>S'inscrire</button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="recherche-hero">
          <div style={{textAlign:"center",maxWidth:"680px"}}>
            <h1 className="recherche-main-title">
              Trouvez une entreprise<br/>au <em>Burkina Faso</em>
            </h1>
            <p className="recherche-subtitle">
              Interrogez le registre national des entreprises selon vos besoins.
              {!user && <strong style={{color:"#ED1C24",display:"block",marginTop:"8px"}}> Accès réservé aux abonnés — Connectez-vous pour continuer.</strong>}
            </p>
          </div>

          {/* ── BLOQUER SI NON CONNECTÉ ── */}
          {!user ? (
            <div style={{
              background:"rgba(255,255,255,0.08)",backdropFilter:"blur(16px)",
              border:"2px solid rgba(237,28,36,0.4)",borderRadius:"20px",
              padding:"48px 40px",maxWidth:"440px",width:"100%",textAlign:"center"
            }}>
              <div style={{fontSize:"56px",marginBottom:"16px"}}></div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:800,color:"#0A2410",marginBottom:"10px"}}>
                Accès réservé aux abonnés
              </div>
              <div style={{fontSize:"14px",color:"rgba(10,36,16,0.6)",lineHeight:1.7,marginBottom:"28px"}}>
                Pour accéder à la recherche multicritère et aux données du registre NERE, vous devez être connecté et disposer d'un abonnement actif.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                <button onClick={()=>navigate("/connexion")}
                  style={{padding:"14px 28px",borderRadius:"12px",background:"#00904C",border:"none",color:"#fff",fontWeight:800,fontSize:"15px",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(0,144,76,0.3)"}}>
                   Se connecter
                </button>
                <button onClick={()=>navigate("/inscription")}
                  style={{padding:"14px 28px",borderRadius:"12px",background:"transparent",border:"2px solid rgba(10,36,16,0.2)",color:"#0A2410",fontWeight:700,fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>
                   Créer un compte
                </button>
                <button onClick={()=>navigate("/formules")}
                  style={{padding:"10px",background:"transparent",border:"none",color:"rgba(10,36,16,0.5)",fontSize:"13px",cursor:"pointer",fontFamily:"inherit",textDecoration:"underline"}}>
                  Voir les formules d'abonnement 
                </button>
              </div>
            </div>
          ) : (
            /* ── CARTES si connecté ── */
            <div className="cards-row">
              {/* Multicritère */}
              <div
                style={hovered==="multi" ? cardHovered : cardBase}
                onMouseEnter={()=>setHovered("multi")}
                onMouseLeave={()=>setHovered(null)}
                onClick={()=>handleCardClick("/demande-document")}>
                <div style={{width:"72px",height:"72px",borderRadius:"18px",background:"rgba(0,144,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px"}}></div>
                <div className="choice-label">Recherche<br/>multicritère</div>
                <div className="choice-desc">Combinez plusieurs filtres : secteur, région, chiffre d'affaires, effectif, statut juridique et plus encore.</div>
                <div className="choice-arrow">
                  Accéder
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="#090909" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Critère unique */}
              <div
                style={hovered==="single" ? cardHovered : cardBase}
                onMouseEnter={()=>setHovered("single")}
                onMouseLeave={()=>setHovered(null)}
                onClick={()=>handleCardClick("/recherche-entreprise")}>
                <div style={{width:"72px",height:"72px",borderRadius:"18px",background:"rgba(0,144,76,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px"}}></div>
                <div className="choice-label">Recherche par<br/>un critère</div>
                <div className="choice-desc">Recherche rapide et ciblée : nom d'entreprise, numéro RCCM, IFU ou tout autre identifiant unique.</div>
                <div className="choice-arrow">
                  Accéder
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="#0d0d0d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
            <span className="footer-link" style={{cursor:"pointer"}} onClick={()=>navigate("/contact")}>Contact</span>
            <span className="footer-link">Support</span>
          </div>
        </footer>
      </div>
    </>
  );
}