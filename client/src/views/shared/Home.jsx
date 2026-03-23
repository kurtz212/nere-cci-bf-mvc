import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";
import logoCCI     from "../../assets/ccibf.jpg";
import logoNERE    from "../../assets/nere.jpg";
import logoDouanes from "../../assets/douanes.png";
import logoCNSS    from "../../assets/cnss.png";
import logoJustice from "../../assets/justice.png";

const FLOATING_TEXTS = [
  "RCCM: BF-OUA-2024-A142", "IFU: 000-24856-X", "CA: 2,4 Mrd FCFA",
  "Secteur: BTP", "Région: Centre", "Employés: 142",
  "RCCM: BF-BDO-2021-B088", "IFU: 000-18723-A", "CA: 480 M FCFA",
  "Secteur: Commerce", "Région: Hauts-Bassins", "Employés: 38",
  "NERE v2.0", "CCI-BF", "Registre National",
  "RCCM: BF-KDG-2019-C055", "IFU: 000-30011-B", "CA: 1,1 Mrd FCFA",
  "Secteur: Agriculture", "Région: Nord", "Employés: 210",
];

// ── Partenaires NERE CCI-BF ──
const PARTENAIRES = [
  {
    icone: "🏛️",
    nom: "Ministère du Commerce",
    type: "Institution d'État",
    contribution: "Fournit les données officielles d'immatriculation et de registre du commerce du Burkina Faso.",
    badge: "Données certifiées",
  },
  {
    icone: "🏦",
    nom: "DGI — Direction Générale des Impôts",
    type: "Administration fiscale",
    contribution: "Certifie les numéros IFU et la régularité fiscale des entreprises enregistrées.",
    badge: "IFU vérifié",
  },
  {
    icone: "📊",
    nom: "INSD — Institut National de la Statistique",
    type: "Organisme statistique",
    contribution: "Fournit les données statistiques sectorielles et les indicateurs économiques nationaux.",
    badge: "Statistiques officielles",
  },
  {
    icone: "🌍",
    nom: "UEMOA",
    type: "Organisation régionale",
    contribution: "Harmonise les normes comptables et les données financières des entreprises de l'espace UEMOA.",
    badge: "Normes UEMOA",
  },
  {
    icone: "🏢",
    nom: "ANPE Burkina Faso",
    type: "Agence nationale",
    contribution: "Certifie les données d'effectifs et d'emploi des entreprises inscrites au registre.",
    badge: "Emploi certifié",
  },
  {
    icone: "💼",
    nom: "CCIB — Chambre de Commerce",
    type: "Institution consulaire",
    contribution: "Partenaire principal assurant la collecte et la mise à jour des données du fichier NERE.",
    badge: "Partenaire principal",
  },
  {
    logo: logoDouanes,
    nom: "Direction Générale des Douanes",
    type: "Administration douanière",
    contribution: "Fournit les données d'import/export et certifie les activités commerciales transfrontalières des entreprises.",
    badge: "Commerce certifié",
  },
  {
    logo: logoCNSS,
    nom: "CNSS — Caisse Nationale de Sécurité Sociale",
    type: "Sécurité sociale",
    contribution: "Certifie les données d'effectifs et la couverture sociale des employés des entreprises enregistrées.",
    badge: "Emploi vérifié",
  },
  {
    logo: logoJustice,
    nom: "Ministère de la Justice",
    type: "Institution judiciaire",
    contribution: "Valide les statuts juridiques, les actes notariaux et la conformité légale des entreprises du registre.",
    badge: "Conformité légale",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser]                 = useState(null);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [showPubModal, setShowPubModal] = useState(false);

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
              <img src={logoCCI} alt="Logo CCI-BF" style={{height:"58px", width:"auto"}}/>
            </div>
            <div className="logo-texts">
              <div className="logo-main">CCI-BF</div>
              <div className="logo-sub">Chambre de Commerce et d'Industrie<br/>Du Burkina Faso</div>
            </div>
            <div style={{width:"1px", height:"44px", background:"rgba(255,255,255,0.15)", margin:"0 4px"}}/>
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <img src={logoNERE} alt="Logo NERE" style={{height:"42px", width:"auto", borderRadius:"6px"}}/>
              <div style={{display:"flex", flexDirection:"column"}}>
                <span style={{fontSize:"11px", fontWeight:800, color:"#fff", letterSpacing:"0.06em", textTransform:"uppercase"}}>Fichier NERE</span>
                <span style={{fontSize:"10px", color:"rgba(255,255,255,0.45)", lineHeight:1.4}}>Registre national des entreprises<br/>Du Burkina Faso</span>
              </div>
            </div>
          </div>

          <div className="nav-links" style={{display:"flex", alignItems:"center", gap:"8px", marginLeft:"40px"}}>
            <span className="nav-link active" onClick={()=>navigate("/")}>Accueil</span>
            <span className="nav-link" onClick={()=>navigate("/publications")}>Publications</span>
            <span className="nav-link" onClick={()=>navigate("/recherche")}>Recherche</span>
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
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}>👤 Mon Profil</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/paiement");setMenuOpen(false);}}>💳 Mon Abonnement</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/publications");setMenuOpen(false);}}>📰 Publications</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/recherche");setMenuOpen(false);}}>🔍 Recherche</div>
                      {user.role==="admin" && (
                        <div className="dropdown-item" onClick={()=>{navigate("/admin");setMenuOpen(false);}}>⚙️ Administration</div>
                      )}
                      <div className="dropdown-divider"/>
                      <div className="dropdown-item danger" onClick={handleLogout}>🚪 Déconnexion</div>
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
              <button className="btn btn-white btn-lg" onClick={()=>navigate("/recherche-entreprise")}>🔍 Rechercher une entreprise</button>
              <button className="btn btn-outline btn-lg" onClick={()=>navigate("/publications")}>Voir les publications →</button>
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
              <div className="section-tag">qui assurent la fiabilité des informations que nous fournissons</div>
            </div>
          </div>

          {/* CAROUSEL */}
          <div style={{position:"relative", overflow:"hidden", borderRadius:"16px", background:"#0A3D1F", padding:"32px 0"}}>
            {/* Gradient gauche */}
            <div style={{position:"absolute", left:0, top:0, bottom:0, width:"100px", background:"linear-gradient(90deg,#0A3D1F,transparent)", zIndex:2, pointerEvents:"none"}}/>
            {/* Gradient droite */}
            <div style={{position:"absolute", right:0, top:0, bottom:0, width:"100px", background:"linear-gradient(-90deg,#0A3D1F,transparent)", zIndex:2, pointerEvents:"none"}}/>

            {/* Piste animée */}
            <div style={{display:"flex", gap:"16px", animation:"carousel 40s linear infinite", width:"max-content"}}>
              {[...PARTENAIRES, ...PARTENAIRES].map((p, i) => (
                <div key={i} style={{
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(77,201,122,0.15)",
                  borderRadius:"14px", padding:"20px 22px",
                  width:"260px", flexShrink:0,
                  display:"flex", flexDirection:"column", gap:"12px",
                }}>
                  <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
                    {/* Logo ou icône */}
                    <div style={{
                      width:"52px", height:"52px", borderRadius:"10px",
                      background:"rgba(255,255,255,0.1)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"26px", flexShrink:0, overflow:"hidden",
                    }}>
                      {p.logo
                        ? <img src={p.logo} alt={p.nom} style={{width:"100%", height:"100%", objectFit:"contain", padding:"4px"}}/>
                        : p.icone
                      }
                    </div>
                    <div>
                      <div style={{fontWeight:800, fontSize:"13px", color:"#fff", lineHeight:1.3}}>{p.nom}</div>
                      <div style={{fontSize:"10px", color:"#4DC97A", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:"2px"}}>{p.type}</div>
                    </div>
                  </div>
                  <div style={{fontSize:"12px", color:"rgba(255,255,255,0.45)", lineHeight:1.6}}>{p.contribution}</div>
                  <div style={{display:"inline-flex", alignItems:"center", gap:"5px", background:"rgba(77,201,122,0.1)", borderRadius:"100px", padding:"3px 10px", width:"fit-content"}}>
                    <span style={{fontSize:"10px"}}>✅</span>
                    <span style={{fontSize:"11px", fontWeight:600, color:"#4DC97A"}}>{p.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @keyframes carousel {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>

          {showPubModal && (
            <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}} onClick={()=>setShowPubModal(false)}>
              <div style={{background:"#0F3D20",border:"1px solid rgba(77,201,122,0.3)",borderRadius:"20px",padding:"40px 36px",maxWidth:"420px",width:"100%",textAlign:"center",position:"relative",boxShadow:"0 24px 60px rgba(0,0,0,0.4)"}} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setShowPubModal(false)} style={{position:"absolute",top:"14px",right:"14px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(77,201,122,0.2)",borderRadius:"8px",width:"30px",height:"30px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
                <div style={{fontSize:"40px",marginBottom:"16px"}}>📰</div>
                <div style={{fontSize:"11px",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--green-light)",marginBottom:"10px"}}>Accès réservé</div>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:800,color:"#fff",marginBottom:"12px",lineHeight:1.3}}>Inscrivez-vous pour voir toutes les publications</h3>
                <p style={{fontSize:"14px",color:"rgba(255,255,255,0.5)",marginBottom:"28px",lineHeight:1.7}}>Accédez à l'intégralité de nos rapports, études et classements économiques sur le Burkina Faso.</p>
                <button onClick={()=>{setShowPubModal(false);navigate("/inscription");}} style={{width:"100%",padding:"13px",borderRadius:"10px",background:"var(--green-light)",border:"none",color:"var(--green-deep)",fontSize:"15px",fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:"12px"}}>Créer un compte</button>
                <button onClick={()=>{setShowPubModal(false);navigate("/connexion");}} style={{width:"100%",padding:"11px",borderRadius:"10px",background:"transparent",border:"1.5px solid rgba(255,255,255,0.18)",color:"rgba(255,255,255,0.65)",fontSize:"14px",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>J'ai déjà un compte — Se connecter</button>
              </div>
            </div>
          )}

          {!user && (
            <div className="pub-cta-banner">
              <div className="pub-cta-text">
                <strong>Accédez à toutes nos publications</strong>
                <span>Inscrivez-vous pour consulter l'intégralité de nos études et rapports économiques.</span>
              </div>
              <div className="pub-cta-actions">
                <button className="btn btn-primary" onClick={()=>navigate("/inscription")}>Créer un compte</button>
                <button className="btn btn-outline see-all-btn" onClick={()=>navigate("/connexion")}>Se connecter</button>
              </div>
            </div>
          )}
        </section>

        {/* ══ FORMULES ══ */}
        <section className="packs-section">
          <div className="section-header" style={{marginBottom:"36px"}}>
            <div>
              <div className="section-tag" style={{color:"var(--gold)"}}>Abonnements</div>
              <div className="packs-title">Choisissez votre formule</div>
            </div>
          </div>
          <div className="packs-grid">
            {[
              {nom:"BASIC",   prix:"15 000", tag:null,           features:["Recherche simple (nom, ville)","20 recherches/mois","Publications publiques","Résultats basiques"],                                                features2:["Recherche avancée","Export PDF/Excel","Données financières"],       btn:"btn-outline-pack"},
              {nom:"PRO",     prix:"35 000", tag:"⭐ RECOMMANDÉ", features:["Tout le pack Basic","Recherche avancée multi-critères","100 recherches/mois","Export PDF et Excel","Données financières partielles"],              features2:["Recherches illimitées","Données complètes"],                        btn:"btn-primary-pack"},
              {nom:"PREMIUM", prix:"75 000", tag:null,           features:["Tout le pack Pro","Recherches illimitées","Données financières complètes","Toutes les publications","Support prioritaire"],                         features2:[],                                                                   btn:"btn-outline-pack"},
            ].map((pack,i)=>(
              <div key={i} className={`pack-card-home ${pack.tag?"featured":""}`}>
                {pack.tag && <div className="pack-card-tag">{pack.tag}</div>}
                <div className="pack-card-name">{pack.nom}</div>
                <div className="pack-card-price">{pack.prix} <span>FCFA / an</span></div>
                <div className="pack-divider"/>
                <ul className="pack-features-list">
                  {pack.features.map((f,j)=>(<li key={j} className="feature-ok">✓ {f}</li>))}
                  {pack.features2.map((f,j)=>(<li key={j} className="feature-no">✕ {f}</li>))}
                </ul>
                <button className={pack.btn} onClick={()=>navigate("/inscription")}>Choisir {pack.nom}</button>
              </div>
            ))}
          </div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="site-footer">
          <div>
            <div className="footer-logo-text">NERE <span>CCI-BF</span></div>
            <div className="footer-copy">© 2026 Chambre de Commerce et d'Industrie du Burkina Faso</div>
          </div>
          <div className="footer-links">
            <span className="footer-link">CGU</span>
            <span className="footer-link">Confidentialité</span>
            <span className="footer-link" style={{cursor:"pointer"}} onClick={()=>navigate("/contact")}>Contact</span>
            <span className="footer-link">Support</span>
          </div>
        </footer>

      </div>
    </>
  );
}