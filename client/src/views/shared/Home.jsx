import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";
import logoCCI     from "../../assets/ccibf.jpg";
import logoNERE    from "../../assets/nere.jpg";

import logoCEFORE  from "../../assets/cefore.png";
import logoDouanes from "../../assets/douanes.png";
import logoCNSS    from "../../assets/cnss.png";
import logoJustice from "../../assets/justice.png";
import logoCommerce from "../../assets/tribunal.jpg";
import logoDGI     from "../../assets/impots.jpg";
import logoINSD    from "../../assets/INSD.png";
import logoSONABEL from "../../assets/SONABEL.jpg";
import logoLA_POSTE from "../../assets/LaPoste.jpg";
import logoMAISON_ENTREPRISE from "../../assets/MDE.png";


const FLOATING_TEXTS = [
  "RCCM: BF-OUA-2024-A142", "IFU: 000-24856-X", "CA: 2,4 Mrd FCFA",
  "Secteur: BTP", "Région: Centre", "Employés: 142",
  "RCCM: BF-BDO-2021-B088", "IFU: 000-18723-A", "CA: 480 M FCFA",
  "Secteur: Commerce", "Région: Hauts-Bassins", "Employés: 38",
  "NERE v2.0", "CCI-BF", "Registre National",
  "RCCM: BF-KDG-2019-C055", "IFU: 000-30011-B", "CA: 1,1 Mrd FCFA",
  "Secteur: Agriculture", "Région: Nord", "Employés: 210",
];

// ── PARTENAIRES ──
const PARTENAIRES = [
  {
    logo: logoCCI,
    nom: "CCI-BF",
    type: "Institution consulaire",
    contribution: "Gestion et mise à jour du fichier NERE.",
    badge: "Partenaire principal",
    lien: "https://www.cci.bf/"
  },
  {
    logo: logoCEFORE,
    nom: "CEFORE",
    type: "Centre de formalités",
    contribution: "Facilite la création d'entreprises.",
    badge: "Création entreprise",
    lien: "https://creerentreprise.me.bf/"
  },
  {
    logo: logoDouanes,
    nom: "Douanes",
    type: "Administration douanière",
    contribution: "Données import/export.",
    badge: "Commerce certifié",
    lien: "https://www.douanes.gov.bf/"
  },
  {
    logo: logoCNSS,
    nom: "CNSS",
    type: "Sécurité sociale",
    contribution: "Données sociales des employés.",
    badge: "Emploi vérifié",
    lien: "https://www.cnss.bf/"
  },
  {
    logo: logoJustice,
    nom: "Ministère de la Justice",
    type: "Institution judiciaire",
    contribution: "Validation juridique des entreprises.",
    badge: "Conformité légale",
    lien: "https://www.justice.gov.bf/"
  },
  {
    logo: logoCommerce,
    nom: "Tribunal de Commerce",
    type: "Institution judiciaire",
    contribution: "Enregistrement légal des entreprises.",
    badge: "RCCM validé",
    lien: "https://servicepublic.gov.bf/contact/tribunal-de-commerce"
  },
  {
    logo: logoDGI,
    nom: "DGI",
    type: "Administration fiscale",
    contribution: "Validation des numéros IFU.",
    badge: "IFU vérifié",
    lien: "https://www.impots.gov.bf/"
  },
  {
    logo: logoINSD,
    nom: "INSD",
    type: "Statistique nationale",
    contribution: "Fournit les indicateurs économiques.",
    badge: "Statistiques officielles",
    lien: "https://www.insd.bf/"
  },
  {
    logo: logoSONABEL,
    nom: "SONABEL",
    type: "Entreprise publique",
    contribution: "Fourniture d'électricité.",
    badge: "Service énergétique",
    lien: "https://www.sonabel.bf/"
  },
  {
    logo: logoLA_POSTE,
    nom: "La Poste BF",
    type: "Service postal",
    contribution: "Services postaux et financiers.",
    badge: "Service postal",
    lien: "https://laposte.bf/"
  },
  {
    logo: logoMAISON_ENTREPRISE,
    nom: "Maison de l’Entreprise",
    type: "Accompagnement",
    contribution: "Appui aux entreprises.",
    badge: "Support PME",
    lien: "https://www.cci.bf/?q=fr/content/la-maison-de-lentreprise"
  }
];



export default function Home() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState(null);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [showPubModal, setShowPubModal] = useState(false);
  const [partenairesAPI, setPartenairesAPI] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  // Charger les partenaires depuis l'API
  useEffect(() => {
    fetch("http://localhost:5000/api/partenaires")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setPartenairesAPI(data.data);
        }
      })
      .catch(() => {}); // Garder les partenaires locaux si API indisponible
  }, []);

  // Utiliser les partenaires API ou les locaux comme fallback
  const partenairesAffiches = partenairesAPI.length > 0 ? partenairesAPI : PARTENAIRES;

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

  return (
    <>
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

        {/* ══ NAVBAR ══ */}
        <nav className="navbar" style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div className="logo-zone" style={{display:"flex", alignItems:"center", gap:"12px"}}>
            <div className="logo-img-box">
              <img src={logoCCI} alt="Logo CCI-BF" style={{height:"80px", width:"auto"}}/>
            </div>
            <div className="logo-texts">
              <div className="logo-main">CCI-BF</div>
              <div className="logo-sub">Chambre de Commerce et d'Industrie<br/>Du Burkina Faso</div>
            </div>
            <div style={{width:"1px", height:"44px", background:"rgba(255,255,255,0.15)", margin:"0 4px"}}/>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <img src={logoNERE} alt="Logo NERE" style={{height:"60px", width:"auto", borderRadius:"6px"}}/>
              <div style={{display:"flex", flexDirection:"column"}}>
                <span style={{fontSize:"11px", fontWeight:800, color:"#ffffff", letterSpacing:"0.06em", textTransform:"uppercase"}}>Fichier NERE</span>
                <span style={{fontSize:"10px", color:"rgba(255,255,255,0.45)", lineHeight:1.4}}>Registre national des entreprises<br/>Du Burkina Faso</span>
              </div>
            </div>
          </div>

          <div className="nav-links" style={{display:"flex", alignItems:"center", gap:"8px", marginLeft:"40px"}}>
            <span className="nav-link active" onClick={()=>navigate("/")}>Accueil</span>
            <span className="nav-link" onClick={()=>navigate("/publications")}>Publications</span>
            <span className="nav-link" onClick={()=>navigate("/demande-document")}>Recherche</span>
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
                        <div className="dropdown-email">{user.email || "—"}</div>
                        <div className="dropdown-pack">{user.role==="admin" ? "👑 Administrateur" : "Pack · Actif"}</div>
                      </div>
                      <div className="dropdown-divider"/>
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}> Mon Profil</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/paiement");setMenuOpen(false);}}>Mon Abonnement</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/publications");setMenuOpen(false);}}> Publications</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/recherche");setMenuOpen(false);}}> Recherche</div>
                      {user.role==="admin" && (
                        <div className="dropdown-item" onClick={()=>{navigate("/admin");setMenuOpen(false);}}> Administration</div>
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

        {/* ══ HERO ══ */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge"><span className="badge-dot"/>Plateforme officielle · CCI-BF</div>
            <h1 className="hero-title">Accédez aux données<br/>économiques du <em>Burkina Faso</em></h1>
            <p className="hero-desc">Consultez les informations officielles des entreprises enregistrées au NERE — secteur d'activité, chiffre d'affaires, localisation et bien plus, selon votre formule d'abonnement.</p>
            <div className="hero-btns">
              <button className="btn btn-white btn-lg" onClick={()=>navigate("/recherche-entreprise")}>Rechercher une entreprise</button>
              <button className="btn btn-outline btn-lg" onClick={()=>navigate("/Formules")}>Voir les formules →</button>
            </div>
            <div className="stats-row">
              {[
                {num:"45 000+", label:"Entreprises indexées"},
                {num:"13",      label:"Régions couvertes"},
                {num:"120+",    label:"Secteurs d'activité"},
                {num:"3",       label:"Formules d'abonnement"},
              ].map((s,i)=>(
                <div key={i} className="stat-item">
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

       {/* ══ PARTENAIRES ══ */}
<section className="publications-section">
  <div className="section-header">
    <div>
      <div className="section-title">NOS PARTENAIRES OFFICIELS</div>
      <div className="section-tag">
        qui assurent la fiabilité des informations que nous fournissons
      </div>
    </div>
  </div>

  {/* CAROUSEL */}
  <div style={{position:"relative", overflow:"hidden", borderRadius:"16px", background:"#0A3D1F", padding:"32px 0"}}>

    {/* Gradient gauche */}
    <div style={{
      position:"absolute", left:0, top:0, bottom:0, width:"100px",
      background:"linear-gradient(90deg,#0A3D1F,transparent)",
      zIndex:2, pointerEvents:"none"
    }}/>

    {/* Gradient droite */}
    <div style={{
      position:"absolute", right:0, top:0, bottom:0, width:"100px",
      background:"linear-gradient(-90deg,#0A3D1F,transparent)",
      zIndex:2, pointerEvents:"none"
    }}/>

    {/* Piste animée */}
    <div style={{
      display:"flex",
      gap:"16px",
      animation:"carousel 40s linear infinite",
      width:"max-content"
    }}>
      {[...partenairesAffiches, ...partenairesAffiches].map((p) => (

        /* 🔥 CARTE CLIQUABLE PRO */
        <a
          key={p.nom}
          href={p.lien || "#"}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e)=>{
            if(!p.lien){
              e.preventDefault();
              alert("Lien indisponible");
            }
          }}
          style={{
            background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(77,201,122,0.15)",
            borderRadius:"14px",
            padding:"20px 22px",
            width:"260px",
            flexShrink:0,
            display:"flex",
            flexDirection:"column",
            gap:"12px",
            textDecoration:"none",
            cursor:"pointer",
            transition:"all 0.3s ease"
          }}
          onMouseEnter={(e)=>{
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e)=>{
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >

          {/* HEADER */}
          <div style={{display:"flex", alignItems:"center", gap:"12px"}}>

            <div style={{
              width:"52px",
              height:"52px",
              borderRadius:"10px",
              background:"rgba(255,255,255,0.1)",
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              fontSize:"26px",
              flexShrink:0,
              overflow:"hidden"
            }}>
              {p.logo
                ? <img src={p.logo} alt={p.nom}
                    style={{width:"100%", height:"100%", objectFit:"contain", padding:"4px"}}/>
                : p.icone
              }
            </div>

            <div>
              <div style={{
                fontWeight:800,
                fontSize:"13px",
                color:"#fff",
                lineHeight:1.3
              }}>
                {p.nom}
              </div>

              <div style={{
                fontSize:"10px",
                color:"#4DC97A",
                fontWeight:600,
                textTransform:"uppercase",
                letterSpacing:"0.06em",
                marginTop:"2px"
              }}>
                {p.type}
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div style={{
            fontSize:"12px",
            color:"rgba(255,255,255,0.45)",
            lineHeight:1.6
          }}>
            {p.contribution}
          </div>

          {/* BADGE */}
          <div style={{
            display:"inline-flex",
            alignItems:"center",
            gap:"5px",
            background:"rgba(77,201,122,0.1)",
            borderRadius:"100px",
            padding:"3px 10px",
            width:"fit-content"
          }}>
            <span style={{fontSize:"10px"}}>✅</span>
            <span style={{
              fontSize:"11px",
              fontWeight:600,
              color:"#4DC97A"
            }}>
              {p.badge}
            </span>
          </div>

        </a>
      ))}
    </div>
  </div>

  {/* Animation */}
  <style>{`
    @keyframes carousel {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `}</style>
</section>


        {/* ══ FORMULES ══ */}
        <section className="packs-section">
          <div className="section-header" style={{marginBottom:"36px"}}>
            <div>
              <div className="section-tag" style={{color:"var(--gold)"}}>Crédit Prépayé</div>
              <div className="packs-title">Choisissez votre formule</div>
            </div>
          </div>
          <div className="packs-grid">
            {[
              {
                nom:"Pack 1",
                prix:"5 000",
                tag:null,
                description:"Créditez votre compte avec 5 000 FCFA. Déduction directe à chaque requête.",
                btn:"btn-outline-pack"
              },
              {
                nom:"Pack 2",
                prix:"10 000",
                tag:null,
                description:"Créditez votre compte avec 10 000 FCFA. Déduction directe à chaque requête.",
                btn:"btn-primary-pack"
              },
              {
                nom:"Pack 3",
                prix:"15 000+",
                tag:null,
                description:"Créditez votre compte avec un montant personnalisé. Déduction directe à chaque requête.",
                btn:"btn-outline-pack"
              },
            ].map((pack,i)=>(
              <div key={i} className={`pack-card-home ${pack.tag?"featured":""}`}>
                {pack.tag && <div className="pack-card-tag">{pack.tag}</div>}
                <div className="pack-card-name">{pack.nom}</div>
                <div className="pack-card-price">{pack.prix} <span>FCFA</span></div>
                <div className="pack-card-description">{pack.description}</div>
                <button className={pack.btn} onClick={()=>navigate("/formules")}>Choisir {pack.nom}</button>
              </div>
            ))}
          </div>
        </section>
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