import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";
import logoCCI              from "../../assets/ccibf.png";
import logoNERE             from "../../assets/nere.jpg";
import logoCEFORE           from "../../assets/cefore.png";
import logoDouanes          from "../../assets/douanes.png";
import logoCNSS             from "../../assets/cnss.png";
import logoJustice          from "../../assets/justice.png";
import logoCommerce         from "../../assets/tribunal.jpg";
import logoDGI              from "../../assets/impots.jpg";
import logoINSD             from "../../assets/INSD.png";
import logoSONABEL          from "../../assets/SONABEL.jpg";
import logoLA_POSTE         from "../../assets/LaPoste.jpg";
import logoMAISON_ENTREPRISE from "../../assets/MDE.png";

const FLOATING_TEXTS = [
  "RCCM: BF-OUA-2024-A142","IFU: 000-24856-X","CA: 2,4 Mrd FCFA",
  "Secteur: BTP","Région: Centre","Employés: 142",
  "RCCM: BF-BDO-2021-B088","IFU: 000-18723-A","CA: 480 M FCFA",
  "Secteur: Commerce","Région: Hauts-Bassins","Employés: 38",
  "NERE v2.0","CCI-BF","Registre National",
  "RCCM: BF-KDG-2019-C055","IFU: 000-30011-B","CA: 1,1 Mrd FCFA",
  "Secteur: Agriculture","Région: Nord","Employés: 210",
];

const PARTENAIRES = [
  { logo:logoCCI,    nom:"CCI-BF",                 type:"Institution consulaire",  contribution:"Gestion et mise à jour du fichier NERE.",      badge:"Partenaire principal",    lien:"https://www.cci.bf/" },
  { logo:logoCEFORE, nom:"CEFORE",                 type:"Centre de formalités",    contribution:"Facilite la création d'entreprises.",           badge:"Création entreprise",     lien:"https://creerentreprise.me.bf/" },
  { logo:logoDouanes,nom:"Douanes",                type:"Administration douanière",contribution:"Données import/export.",                        badge:"Commerce certifié",       lien:"https://www.douanes.gov.bf/" },
  { logo:logoCNSS,   nom:"CNSS",                   type:"Sécurité sociale",        contribution:"Données sociales des employés.",                badge:"Emploi vérifié",          lien:"https://www.cnss.bf/" },
  { logo:logoJustice,nom:"Ministère de la Justice",type:"Institution judiciaire",  contribution:"Validation juridique des entreprises.",         badge:"Conformité légale",       lien:"https://www.justice.gov.bf/" },
  { logo:logoCommerce,nom:"Tribunal de Commerce",  type:"Institution judiciaire",  contribution:"Enregistrement légal des entreprises.",         badge:"RCCM validé",             lien:"#" },
  { logo:logoDGI,    nom:"DGI",                    type:"Administration fiscale",  contribution:"Validation des numéros IFU.",                   badge:"IFU vérifié",             lien:"https://www.impots.gov.bf/" },
  { logo:logoINSD,   nom:"INSD",                   type:"Statistique nationale",   contribution:"Fournit les indicateurs économiques.",          badge:"Statistiques officielles",lien:"https://www.insd.bf/" },
  { logo:logoSONABEL,nom:"SONABEL",                type:"Entreprise publique",     contribution:"Fourniture d'électricité.",                     badge:"Service énergétique",     lien:"https://www.sonabel.bf/" },
  { logo:logoLA_POSTE,nom:"La Poste BF",           type:"Service postal",          contribution:"Services postaux et financiers.",               badge:"Service postal",          lien:"https://laposte.bf/" },
  { logo:logoMAISON_ENTREPRISE,nom:"Maison de l'Entreprise",type:"Accompagnement", contribution:"Appui aux entreprises.",                        badge:"Support PME",             lien:"#" },
];

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [adminPanel, setAdminPanel] = useState(false);
  const [adminTab, setAdminTab]   = useState("stats");

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

  return (
    <>
      <style>{`
        @keyframes carousel { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes adminBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
      `}</style>

      {/* ══ FOND ANIMÉ ══ */}
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

        {/* ══ NAVBAR ══ */}
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

          <div className="nav-links" style={{display:"flex",alignItems:"center",gap:"25px",marginLeft:"100px"}}>
            <span className="nav-link active" onClick={()=>navigate("/")}>Accueil</span>
            <span className="nav-link" onClick={()=>navigate("/publications")}>Publications</span>
            <span className="nav-link" onClick={()=>navigate("/rechercheacc")}>Recherche</span>
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
                    
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}> Historique</div>
                      <div className="dropdown-item" onClick={()=>{navigate("/profil");setMenuOpen(false);}}> Sécurité</div>
                      {user.role==="admin" && (
                        <div className="dropdown-item" onClick={()=>{navigate("/admin");setMenuOpen(false);}}> Tableau de bord</div>
                      )}
                      {user.role==="manager" && (
                        <div className="dropdown-item" onClick={()=>{navigate("/gestionnaire");setMenuOpen(false);}}>Tableau de bord</div>
                      )}
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

        {/* ══ HERO ══ */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge"><span className="badge-dot"/>Bienvenu sur la plateforme officielle du NERE</div>
            <h1 className="hero-title">Accédez aux données<br/>économiques du <em>Burkina Faso</em></h1>
            <p className="hero-desc">Consultez les informations officielles des entreprises enregistrées au NERE — secteur d'activité, chiffre d'affaires, localisation et bien plus, selon votre formule d'abonnement.</p>
            <div className="hero-btns">
              <button className="btn btn-outline btn-lg" onClick={()=>navigate("/formules")}>Voir les formules</button>
            </div>
            <div className="stats-row">
              {[
                {num:"45 000+",label:"Entreprises indexées"},
                {num:"13",     label:"Régions couvertes"},
                {num:"120+",   label:"Secteurs d'activité"},
                {num:"3",      label:"Formules d'abonnement"},
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
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",marginBottom:"36px",gap:"14px"}}>
            <img src={logoCCI} alt="Logo CCI-BF" style={{height:"90px",width:"auto",objectFit:"contain"}}/>
            <div className="section-title" style={{margin:0,color:"#ED1C24"}}>NOS PARTENAIRES OFFICIELS</div>
            <div className="section-title" style={{margin:0,fontSize:"16px"}}>Accédez en un clic aux sites de nos partenaires qui assurent la fiabilité et l'authenticité des informations</div>
          </div>

          <div style={{position:"relative",overflow:"hidden",borderRadius:"16px",background:"linear-gradient(135deg,#00904C,#006B38)",padding:"32px 0"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:"100px",background:"linear-gradient(90deg,rgba(0,144,76,0.8),transparent)",zIndex:2,pointerEvents:"none"}}/>
            <div style={{position:"absolute",right:0,top:0,bottom:0,width:"100px",background:"linear-gradient(-90deg,rgba(0,144,76,0.8),transparent)",zIndex:2,pointerEvents:"none"}}/>
            <div style={{display:"flex",gap:"16px",animation:"carousel 40s linear infinite",width:"max-content"}}>
              {[...PARTENAIRES,...PARTENAIRES].map((p,idx)=>(
                <a key={`${p.nom}-${idx}`} href={p.lien||"#"} target="_blank" rel="noopener noreferrer"
                  style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(77,201,122,0.15)",borderRadius:"14px",padding:"20px 22px",width:"260px",flexShrink:0,display:"flex",flexDirection:"column",gap:"12px",textDecoration:"none",cursor:"pointer",transition:"all 0.3s ease"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.boxShadow="0 10px 25px rgba(0,0,0,0.4)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                    <div style={{width:"52px",height:"52px",borderRadius:"10px",background:"rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
                      {p.logo ? <img src={p.logo} alt={p.nom} style={{width:"100%",height:"100%",objectFit:"contain",padding:"4px"}}/> : p.icone}
                    </div>
                    <div>
                      <div style={{fontWeight:800,fontSize:"13px",color:"#fff",lineHeight:1.3}}>{p.nom}</div>
                      <div style={{fontSize:"10px",color:"#E1F5E8",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:"2px"}}>{p.type}</div>
                    </div>
                  </div>
                  <div style={{fontSize:"12px",color:"rgba(255,255,255,0.85)",lineHeight:1.6}}>{p.contribution}</div>
                  <div style={{display:"inline-flex",alignItems:"center",gap:"5px",background:"#fff",borderRadius:"100px",padding:"3px 10px",width:"fit-content"}}>
                    <span style={{fontSize:"11px",fontWeight:600,color:"#ED1C24"}}>{p.badge}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
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
              {nom:"Pack 1",prix:"5 000",  description:"Créditez votre compte avec 5 000 FCFA. Déduction directe à chaque requête.",  btn:"btn-outline-pack"},
              {nom:"Pack 2",prix:"15 000", description:"Créditez votre compte avec 15 000 FCFA. Déduction directe à chaque requête.", btn:"btn-primary-pack"},
              {nom:"Pack 3",prix:"15 000+",description:"Montant personnalisé (min. 15 000 FCFA). Déduction directe à chaque requête.",btn:"btn-outline-pack"},
            ].map((pack,i)=>(
              <div key={i} className="pack-card-home">
                <div className="pack-card-name">{pack.nom}</div>
                <div className="pack-card-price">{pack.prix} <span>FCFA</span></div>
                <div style={{fontSize:"13px",color:"rgba(10,36,16,0.55)",lineHeight:1.6,marginBottom:"16px"}}>{pack.description}</div>
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

      {/* ══ BOUTON FLOTTANT ADMIN ══ */}
      {user?.role === "admin" && (
        <button onClick={()=>setAdminPanel(o=>!o)} title="Panneau Admin"
          style={{position:"fixed",bottom:"28px",right:"28px",zIndex:1000,
            width:"56px",height:"56px",borderRadius:"50%",
            background:adminPanel?"#CC3333":"#00904C",
            border:"3px solid #fff",
            boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
            cursor:"pointer",fontSize:"22px",
            display:"flex",alignItems:"center",justifyContent:"center",
            transition:"all 0.3s",
            animation:!adminPanel?"adminBounce 2s ease-in-out infinite":"none"}}>
          {adminPanel ? "✕" : "⚙️"}
        </button>
      )}

      {/* ══ PANNEAU ADMIN SLIDE-IN ══ */}
      {user?.role === "admin" && (
        <>
          {adminPanel && (
            <div onClick={()=>setAdminPanel(false)}
              style={{position:"fixed",inset:0,zIndex:998,background:"rgba(0,0,0,0.35)",backdropFilter:"blur(3px)"}}/>
          )}
          <div style={{
            position:"fixed",top:0,right:0,bottom:0,zIndex:999,
            width:"440px",
            background:"#fff",
            boxShadow:"-8px 0 48px rgba(0,0,0,0.2)",
            transform:adminPanel?"translateX(0)":"translateX(100%)",
            transition:"transform 0.35s cubic-bezier(0.34,1.1,0.64,1)",
            display:"flex",flexDirection:"column",
            fontFamily:"'Plus Jakarta Sans',sans-serif",
          }}>
            {/* Header */}
            <div style={{background:"#00904C",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:900,color:"#fff"}}>
                  NERE <span style={{color:"#4DC97A"}}>Admin</span>
                </div>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,0.5)",marginTop:"2px"}}>Panneau d'administration rapide</div>
              </div>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <button onClick={()=>{setAdminPanel(false);navigate("/admin");}}
                  style={{padding:"7px 14px",borderRadius:"8px",background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                  Dashboard complet →
                </button>
                <button onClick={()=>setAdminPanel(false)}
                  style={{width:"32px",height:"32px",borderRadius:"8px",background:"rgba(255,255,255,0.1)",border:"none",color:"#fff",cursor:"pointer",fontSize:"16px"}}>
                  ✕
                </button>
              </div>
            </div>

            {/* Onglets */}
            <div style={{display:"flex",borderBottom:"2px solid #E2EDE6",background:"#F5FAF7",flexShrink:0}}>
              {[
                {key:"stats",label:" Stats"},
                {key:"pubs", label:" Publications"},
                {key:"users",label:" Utilisateurs"},
                {key:"chat", label:" Chat"},
              ].map(t=>(
                <button key={t.key} onClick={()=>setAdminTab(t.key)}
                  style={{flex:1,padding:"12px 6px",background:"transparent",border:"none",
                    borderBottom:adminTab===t.key?"3px solid #00904C":"3px solid transparent",
                    color:adminTab===t.key?"#00904C":"#6B9A7A",
                    fontWeight:adminTab===t.key?700:500,
                    fontSize:"11px",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",marginBottom:"-2px"}}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Contenu */}
            <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
              {adminTab==="stats"  && <AdminPanelStats navigate={navigate}/>}
              {adminTab==="pubs"   && <AdminPanelPubs  navigate={navigate}/>}
              {adminTab==="users"  && <AdminPanelUsers navigate={navigate}/>}
              {adminTab==="chat"   && <AdminPanelChat  navigate={navigate}/>}
            </div>

            {/* Footer */}
            <div style={{padding:"14px 20px",borderTop:"1px solid #E2EDE6",display:"flex",gap:"8px",flexShrink:0}}>
              <button onClick={()=>{setAdminPanel(false);navigate("/admin");}}
                style={{flex:1,padding:"11px",borderRadius:"10px",background:"#00904C",border:"none",color:"#fff",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
                 Dashboard complet
              </button>
              <button onClick={()=>{setAdminPanel(false);navigate("/Chatadmin");}}
                style={{flex:1,padding:"11px",borderRadius:"10px",background:"#E6F4EC",border:"none",color:"#00904C",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
                 Chat Admin
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ─── Sous-composants panneau admin ─── */

function AdminPanelStats({ navigate }) {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const token = getToken();
    Promise.all([
      fetch(`${API}/users`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()),
      fetch(`${API}/publications?all=true&limit=100`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()),
    ]).then(([u,p])=>{
      setStats({
        users:    u.success?u.data.length:0,
        abonnes:  u.success?u.data.filter(x=>x.role==="subscriber").length:0,
        pubs:     p.success?p.data.length:0,
        publiees: p.success?p.data.filter(x=>/^publi/i.test(x.statut)).length:0,
      });
    }).catch(()=>{});
  },[]);

  const kpis = stats?[
    {label:"Utilisateurs",  val:stats.users,   color:"#4DC97A"},
    {label:"Abonnés actifs",val:stats.abonnes, color:"#D4A830"},
    {label:"Publications",  val:stats.pubs,    color:"#4A9EFF"},
    {label:"Publiées",       val:stats.publiees,color:"#00904C"},
  ]:[];

  return (
    <div>
      <div style={{fontWeight:700,fontSize:"14px",color:"#0A2410",marginBottom:"16px"}}>Vue d'ensemble</div>
      {!stats ? (
        <div style={{textAlign:"center",padding:"24px",color:"#6B9A7A"}}> Chargement...</div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"20px"}}>
          {kpis.map(k=>(
            <div key={k.label} style={{background:"#F5FAF7",borderRadius:"12px",padding:"16px",border:"1px solid #E2EDE6"}}>
              <div style={{fontSize:"22px",marginBottom:"6px"}}>{k.icon}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:900,color:k.color}}>{k.val}</div>
              <div style={{fontSize:"11px",color:"#6B9A7A",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{k.label}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {[
          {label:" Gérer les publications",path:"/admin"},
          {label:" Gérer les utilisateurs",path:"/admin"},
          {label:" Répondre aux messages", path:"/Chatadmin"},
        ].map(a=>(
          <button key={a.label} onClick={()=>navigate(a.path)}
            style={{padding:"10px 14px",borderRadius:"10px",background:"#fff",border:"1px solid #E2EDE6",color:"#0A2410",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
            {a.label} 
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminPanelPubs({ navigate }) {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    fetch(`${API}/publications?all=true&limit=6`,{headers:{Authorization:`Bearer ${getToken()}`}})
      .then(r=>r.json()).then(d=>{if(d.success)setPubs(d.data);setLoading(false);}).catch(()=>setLoading(false));
  },[]);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div style={{fontWeight:700,fontSize:"14px",color:"#0A2410"}}>Publications récentes</div>
        <button onClick={()=>navigate("/admin")} style={{fontSize:"12px",color:"#00904C",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Gérer →</button>
      </div>
      {loading ? <div style={{textAlign:"center",padding:"20px",color:"#6B9A7A"}}>⏳</div> :
      pubs.length===0 ? <div style={{textAlign:"center",padding:"20px",color:"#6B9A7A",fontSize:"13px"}}>Aucune publication</div> :
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {pubs.map(p=>(
          <div key={p._id} style={{padding:"10px 12px",background:"#F5FAF7",borderRadius:"10px",border:"1px solid #E2EDE6"}}>
            <div style={{fontWeight:600,fontSize:"13px",color:"#0A2410",marginBottom:"3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.titre}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"11px",color:"#6B9A7A"}}>{p.categorie}</span>
              <span style={{fontSize:"10px",fontWeight:700,padding:"2px 8px",borderRadius:"100px",background:/^publi/i.test(p.statut)?"#E8F5EE":"#FFF5E0",color:/^publi/i.test(p.statut)?"#00904C":"#CC6600"}}>{p.statut}</span>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function AdminPanelUsers({ navigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    fetch(`${API}/users`,{headers:{Authorization:`Bearer ${getToken()}`}})
      .then(r=>r.json()).then(d=>{if(d.success)setUsers(d.data.slice(0,6));setLoading(false);}).catch(()=>setLoading(false));
  },[]);
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
        <div style={{fontWeight:700,fontSize:"14px",color:"#0A2410"}}>Derniers inscrits</div>
        <button onClick={()=>navigate("/admin")} style={{fontSize:"12px",color:"#00904C",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Gérer →</button>
      </div>
      {loading ? <div style={{textAlign:"center",padding:"20px",color:"#6B9A7A"}}>⏳</div> :
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
        {users.map(u=>(
          <div key={u._id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",background:"#F5FAF7",borderRadius:"10px",border:"1px solid #E2EDE6"}}>
            <div style={{width:"32px",height:"32px",borderRadius:"8px",background:"#E6F4EC",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"12px",color:"#00904C",flexShrink:0}}>
              {u.prenom?.[0]}{u.nom?.[0]}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:"13px",color:"#0A2410",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.prenom} {u.nom}</div>
              <div style={{fontSize:"11px",color:"#6B9A7A"}}>{u.role}</div>
            </div>
            <span style={{fontSize:"10px",fontWeight:700,padding:"2px 8px",borderRadius:"100px",background:u.isActive?"#E8F5EE":"#FFF0F0",color:u.isActive?"#00904C":"#CC3333"}}>{u.isActive?"actif":"inactif"}</span>
          </div>
        ))}
      </div>}
    </div>
  );
}

function AdminPanelChat({ navigate }) {
  return (
    <div>
      <div style={{fontWeight:700,fontSize:"14px",color:"#0A2410",marginBottom:"16px"}}>Messagerie</div>
      <div style={{textAlign:"center",padding:"32px 20px",background:"#F5FAF7",borderRadius:"12px",border:"1px dashed #C0D8C8"}}>
        <div style={{fontSize:"40px",marginBottom:"12px"}}></div>
        <div style={{fontSize:"13px",color:"#6B9A7A",marginBottom:"16px"}}>Gérez toutes les conversations utilisateurs depuis l'interface dédiée</div>
        <button onClick={()=>navigate("/Chatadmin")}
          style={{padding:"10px 20px",borderRadius:"10px",background:"#00904C",border:"none",color:"#fff",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
          Ouvrir le Chat Admin 
        </button>
      </div>
    </div>
  );
}