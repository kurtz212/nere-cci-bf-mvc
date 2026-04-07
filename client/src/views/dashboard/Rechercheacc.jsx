import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";
import logoCCI      from "../../assets/ccibf.png";
import logoNERE     from "../../assets/nere.jpg";

const FLOATING_TEXTS = [
  "RCCM: BF-OUA-2024-A142", "IFU: 000-24856-X", "CA: 2,4 Mrd FCFA",
  "Secteur: BTP", "Région: Centre", "Employés: 142",
  "RCCM: BF-BDO-2021-B088", "IFU: 000-18723-A", "CA: 480 M FCFA",
  "Secteur: Commerce", "Région: Hauts-Bassins", "Employés: 38",
  "NERE v2.0", "CCI-BF", "Registre National",
  "RCCM: BF-KDG-2019-C055", "IFU: 000-30011-B", "CA: 1,1 Mrd FCFA",
  "Secteur: Agriculture", "Région: Nord", "Employés: 210",
];

export default function Recherche() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered]   = useState(null); // "multi" | "single" | null

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /* ── fond animé ── */
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
    for (let i = 0; i < 4; i++) {
      const line = document.createElement("div");
      line.className = "conn-line-v";
      line.style.cssText = `height:${Math.random()*30+20}%;left:${Math.random()*100}%;top:0;animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*10}s;opacity:${Math.random()*0.3+0.1};`;
      linesContainer?.appendChild(line);
    }
    const interval = setInterval(() => {
      const text = FLOATING_TEXTS[Math.floor(Math.random() * FLOATING_TEXTS.length)];
      const el = document.createElement("div");
      el.className = `floating-data ${Math.random() > 0.6 ? "gold" : ""}`;
      el.textContent = text;
      el.style.cssText = `left:${Math.random()*90}%;bottom:-20px;animation-duration:${Math.random()*10+12}s;animation-delay:0s;font-size:${Math.random()>0.5?"9px":"11px"};`;
      bg.appendChild(el);
      setTimeout(() => el.remove(), 22000);
    }, 1800);
    return () => {
      clearInterval(interval);
      document.querySelectorAll(".particle,.conn-line,.conn-line-v").forEach(e => e.remove());
    };
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

  /* ── styles inline ── */
  const cardBase = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "20px",
    width: "320px",
    padding: "44px 36px",
    borderRadius: "20px",
    border: "1.5px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
    transition: "all 0.35s ease",
    textDecoration: "none",
  };

  const cardHovered = {
    ...cardBase,
    background: "rgba(255,255,255,0.14)",
    border: "1.5px solid rgba(201,168,76,0.7)",
    transform: "translateY(-6px) scale(1.03)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
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
          animation: pulse 2s infinite;
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
          transition: gap 0.2s;
        }

        .choice-card:hover .choice-arrow {
          gap: 10px;
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 720px) {
          .cards-row { flex-direction: column; align-items: center; }
        }
      `}</style>

      {/* ══ FOND ANIMÉ ══ */}
      <div className="animated-bg">
        <div className="blob1"/><div className="blob2"/><div className="blob3"/>
        <div className="grid"/><div className="connection-lines"/>
        <svg className="skyline" viewBox="0 0 1400 260" preserveAspectRatio="xMidYMax meet" fill="rgba(46,111,204,0.5)" xmlns="http://www.w3.org/2000/svg">
          <rect x="40" y="60" width="80" height="200"/><rect x="50" y="40" width="60" height="20"/><rect x="70" y="20" width="20" height="20"/>
          {[0,1,2,3,4,5].map(r=>[0,1,2].map(c=>(<rect key={`w1-${r}-${c}`} x={52+c*22} y={70+r*28} width="14" height="18" fill="rgba(201,168,76,0.4)"/>)))}
          <rect x="150" y="100" width="60" height="160"/>
          {[0,1,2,3].map(r=>[0,1].map(c=>(<rect key={`w2-${r}-${c}`} x={158+c*26} y={110+r*36} width="16" height="22" fill="rgba(201,168,76,0.35)"/>)))}
          <rect x="240" y="20" width="100" height="240"/><rect x="260" y="8" width="60" height="14"/><rect x="285" y="0" width="10" height="10"/>
          {[0,1,2,3,4,5,6].map(r=>[0,1,2].map(c=>(<rect key={`w3-${r}-${c}`} x={252+c*28} y={30+r*30} width="18" height="20" fill="rgba(201,168,76,0.4)"/>)))}
          <rect x="370" y="80" width="70" height="180"/>
          {[0,1,2,3].map(r=>[0,1].map(c=>(<rect key={`w4-${r}-${c}`} x={380+c*30} y={92+r*40} width="18" height="26" fill="rgba(201,168,76,0.3)"/>)))}
          <rect x="470" y="50" width="120" height="210"/><rect x="490" y="30" width="80" height="22"/>
          {[0,1,2,3,4,5].map(r=>[0,1,2,3].map(c=>(<rect key={`w5-${r}-${c}`} x={480+c*26} y={60+r*30} width="16" height="20" fill="rgba(201,168,76,0.38)"/>)))}
          <rect x="700" y="90" width="60" height="170"/><rect x="790" y="40" width="90" height="220"/><rect x="800" y="20" width="70" height="22"/>
          <rect x="910" y="70" width="75" height="190"/><rect x="1010" y="30" width="110" height="230"/><rect x="1020" y="10" width="90" height="22"/>
          <rect x="1150" y="80" width="65" height="180"/><rect x="1240" y="50" width="85" height="210"/><rect x="1350" y="90" width="50" height="170"/>
          {[700,910,1150].map((bx,bi)=>[0,1,2,3].map(r=>[0,1].map(c=>(<rect key={`wr-${bi}-${r}-${c}`} x={bx+8+c*24} y={100+r*36} width="14" height="20" fill="rgba(201,168,76,0.3)"/>))))}
          {[790,1010,1240].map((bx,bi)=>[0,1,2,3,4].map(r=>[0,1,2].map(c=>(<rect key={`wl-${bi}-${r}-${c}`} x={bx+8+c*26} y={50+r*36} width="16" height="22" fill="rgba(201,168,76,0.35)"/>))))}
          <rect x="0" y="255" width="1400" height="5" fill="rgba(46,111,204,0.6)"/>
        </svg>
      </div>

      <div className="site-wrapper">

        {/* ══ NAVBAR (identique Home) ══ */}
        <nav className="navbar" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div className="logo-zone" style={{display:"flex", alignItems:"center", gap:"10px"}}>
            <div style={{width:"0px", height:"44px", background:"rgba(255,255,255,0.15)", margin:"0 4px"}}/>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <img src={logoNERE} alt="Logo NERE" style={{height:"90px", width:"auto", borderRadius:"6px"}}/>
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
            <span className="nav-link" onClick={()=>navigate("/Chat")}>Chat</span>
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
                <button className="btn btn-outline" onClick={()=>navigate("/connexion")}>Connexion</button>
                <button className="btn btn-primary" onClick={()=>navigate("/inscription")}>S'inscrire</button>
              </>
            )}
          </div>
        </nav>

        {/* ══ HERO RECHERCHE ══ */}
        <div className="recherche-hero">

          {/* Titre + description */}
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

          {/* ── DEUX CARTES DE CHOIX ── */}
          <div className="cards-row">

            {/* CARTE 1 — Recherche multicritère */}
            <div
              className="choice-card"
              style={{
                position: "relative",
                ...(hovered === "multi" ? cardHovered : cardBase)
              }}
              onMouseEnter={() => setHovered("multi")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate("/recherche-multicritere")}
            >
              <div className="choice-tag">Recommandé</div>

              {/* Icône */}
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
              style={{
                position: "relative",
                ...(hovered === "single" ? cardHovered : cardBase)
              }}
              onMouseEnter={() => setHovered("single")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => navigate("/RechercheEntreprise") /* à définir */}
            >
              {/* Icône */}
              <div style={iconBox("rgba(201,168,76,0.2)")}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="10" stroke="#C9A84C" strokeWidth="2.2"/>
                  <line x1="23.5" y1="23.5" x2="32" y2="32" stroke="#C9A84C" strokeWidth="2.2" strokeLinecap="round"/>
                  <line x1="16" y1="11" x2="16" y2="21" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"/>
                  <line x1="11" y1="16" x2="21" y2="16" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round"/>
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

          {/* lien retour discret */}
          <div
            style={{fontSize:"13px", color:"rgba(255,255,255,0.45)", cursor:"pointer", marginTop:"-16px"}}
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