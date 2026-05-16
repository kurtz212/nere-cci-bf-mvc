import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoNERE from "../../assets/nere.png";

const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",     path:"/chat",         key:"messages"     },
];

const INFOS = [
  {
    titre:"Adresse",
    lignes:["Avenue de Lyon, 01 BP 502","Ouagadougou 01, Burkina Faso"],
  },
  {
    titre:"Telephone",
    lignes:["+226 25 30 61 22", "+226 25 30 61 23"],
    lien:"tel:+22625306122",
  },
  {
    titre:"Web",
    lignes:["www.cci.bf", "www.fichiernere.bf"],
    liens:["https://www.cci.bf","https://www.fichiernere.bf"],
  },
  {
    titre:"Horaires",
    lignes:["Lundi – Vendredi", "7h30 – 17h00"],
    badge:true,
  },
];

const CANAUX = [
  {
    titre:"Telephone direct",
    texte:"+226 25 30 61 22",
    action:"Appeler",
    lien:"tel:+22625306122",
    couleur:"#ED1C24",
    bg:"#FFF5F5",
  },
  {
    titre:"Messagerie en ligne",
    texte:"Disponible sur la plateforme",
    action:"Ouvrir le chat",
    lien:"/chat",
    interne:true,
    couleur:"#00904C",
    bg:"#F0FAF4",
  },
  {
    titre:"Siege CCI-BF",
    texte:"Avenue de Lyon, Ouagadougou",
    action:"Voir sur la carte",
    lien:"https://maps.google.com/?q=CCI-BF+Ouagadougou",
    couleur:"#1a1a1a",
    bg:"#F5F5F5",
  },
];

export default function Contact() {
  const navigate = useNavigate();
  const [user, setUser]             = useState(null);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [activeInfo, setActiveInfo] = useState(null);

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
    <div style={{ minHeight:"100vh", background:"#fff",
      color:"#1a1a1a", fontFamily:"'DM Sans',Arial,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        /* ── NAVBAR ── */
        .c-navbar {
          position:sticky; top:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 40px; height:90px;
          background:#00904C;
          box-shadow:0 2px 16px rgba(0,0,0,0.12);
        }
        .c-nav-pill {
          display:flex; align-items:center; gap:3px;
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.15);
          border-radius:100px; padding:5px 8px;
          margin-left:auto; margin-right:20px;
        }
        .c-nav-btn {
          padding:7px 15px; border-radius:100px;
          font-size:21px; font-weight:600;
          color:rgba(255,255,255,0.75); cursor:pointer;
          border:none; background:transparent;
          font-family:'DM Sans',Arial,sans-serif;
          white-space:nowrap; transition:all 0.18s;
        }
        .c-nav-btn:hover { color:#fff; background:rgba(255,255,255,0.1); }
        .c-nav-btn.active {
          color:#0A3D1F; background:#4DC97A;
          font-weight:700;
        }
        .c-u-chip {
          display:flex; align-items:center; gap:8px;
          padding:5px 12px 5px 5px;
          background:rgba(255,255,255,0.1);
          border:1px solid rgba(255,255,255,0.2);
          border-radius:100px; cursor:pointer;
          color:#fff; font-size:13px; font-weight:600;
          flex-shrink:0; transition:all 0.2s;
        }
        .c-u-chip:hover { background:rgba(255,255,255,0.18); }
        .c-u-avatar {
          width:30px; height:30px; border-radius:50%;
          background:#4DC97A; color:#0A3D1F;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:12px;
        }
        .c-dropdown {
          position:absolute; z-index:9999;
          top:calc(100% + 10px); right:0;
          background:#fff; border-radius:16px;
          border:1px solid #E2EDE6; min-width:220px;
          overflow:hidden; box-shadow:0 16px 48px rgba(0,0,0,0.14);
          animation:dropC 0.18s ease;
        }
        @keyframes dropC { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .c-dd-item {
          padding:10px 18px; font-size:13px; color:#0A3D1F;
          cursor:pointer; transition:background 0.15s;
        }
        .c-dd-item:hover { background:#F5FAF7; }
        .c-dd-danger { color:#CC3333; }
        .c-dd-danger:hover { background:#FFF0F0 !important; }
        .c-dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }

        /* ── HERO ── */
        .c-hero {
          background:#fff;
          border-bottom:1px solid #EBEBEB;
          padding:96px 60px 88px;
          position:relative; overflow:hidden;
        }
        .c-hero::before {
          content:'';
          position:absolute; top:0; right:0;
          width:40%; height:100%;
          background:linear-gradient(135deg, #FFF5F508 0%, #ED1C2406 100%);
          pointer-events:none;
        }

        /* ── RÈGLE DÉCORATIVE ── */
        .c-rule { display:flex; height:4px; }
        .c-rule-r { flex:1; background:#ED1C24; }
        .c-rule-g { width:80px; background:#00904C; }

        /* ── GRILLE COORDONNÉES ── */
        .c-info-grid {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:1px;
          background:#EBEBEB;
        }
        .c-info-cell {
          background:#fff;
          padding:44px 48px;
          border-left:4px solid transparent;
          transition:all 0.22s;
          cursor:pointer;
        }
        .c-info-cell:hover { background:#FAFAFA; border-left-color:#ED1C24; }
        .c-info-cell.active { background:#FAFAFA; border-left-color:#ED1C24; }

        /* ── CARTE MAP ── */
        .c-map-container {
          position:relative; height:380px;
          overflow:hidden; border-top:1px solid #EBEBEB;
        }
        .c-map-container::before {
          content:'';
          position:absolute; top:0; left:0; right:0;
          height:4px;
          background:linear-gradient(90deg, #ED1C24 60%, #00904C 100%);
          z-index:2;
        }

        /* ── CANAUX ── */
        .c-canal-card {
          background:#fff;
          border:1px solid #EBEBEB;
          border-top:4px solid transparent;
          padding:40px 36px;
          transition:all 0.22s;
          cursor:pointer;
        }
        .c-canal-card:hover {
          box-shadow:0 8px 32px rgba(0,0,0,0.08);
          transform:translateY(-4px);
        }

        /* ── FOOTER ── */
        .c-footer {
          background:#fff;
          border-top:4px solid #ED1C24;
          padding:28px 60px;
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:12px;
        }

        @media(max-width:860px){
          .c-info-grid { grid-template-columns:1fr; }
          .c-hero { padding:64px 28px; }
          .c-footer { padding:24px 28px; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="c-navbar">
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <img src={logoNERE} alt="NERE"
            style={{ height:"90px", width:"auto", borderRadius:"6px",
              backgroundColor:"#fff", padding:"3px", flexShrink:0 }}/>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
            <span style={{ fontSize:"17px", fontWeight:800, color:"#fff",
              letterSpacing:"0.08em", textTransform:"uppercase" }}>
              Fichier NERE
            </span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>
              Registre national des entreprises
            </span>
          </div>
        </div>

        <div className="c-nav-pill">
          {NAV_LINKS.map(link => (
            <button key={link.key}
              className={`c-nav-btn ${link.key==="contact"?"active":""}`}
              onClick={() => navigate(link.path)}>
              {link.label}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
          {user ? (
            <div style={{ position:"relative" }}>
              <div className="c-u-chip" onClick={() => setMenuOpen(o => !o)}>
                <div className="c-u-avatar">{initiales}</div>
                <span style={{ maxWidth:"100px", overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {user.prenom} {user.nom}
                </span>
                <span style={{ fontSize:"9px", opacity:0.4 }}>&#9660;</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:50 }}
                    onClick={() => setMenuOpen(false)}/>
                  <div className="c-dropdown" onClick={e => e.stopPropagation()}>
                    <div style={{ padding:"14px 18px 10px",
                      borderBottom:"1px solid #F0F4F1",
                      background:"linear-gradient(135deg,#F5FAF7,#fff)" }}>
                      <div style={{ fontWeight:800, color:"#0A3D1F", fontSize:"14px" }}>
                        {user.prenom} {user.nom}
                      </div>
                      <div style={{ fontSize:"12px", color:"#6B9A7A", marginTop:"2px" }}>
                        {user.email||"—"}
                      </div>
                      <div style={{ display:"inline-flex", marginTop:"6px",
                        background:"#E8F5EE", color:"#00904C", borderRadius:"100px",
                        padding:"3px 10px", fontSize:"10px", fontWeight:700,
                        textTransform:"uppercase" }}>
                        {user.role==="admin" ? "Admin" :
                         user.role==="manager" ? "Gestionnaire" : "Abonne"}
                      </div>
                    </div>
                    <div style={{ padding:"6px 0" }}>
                      {[
                        { label:"Mon Profil",     path:"/profil"   },
                        { label:"Mon Abonnement", path:"/paiement" },
                      ].map(item => (
                        <div key={item.label} className="c-dd-item"
                          onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                          {item.label}
                        </div>
                      ))}
                      {user.role==="admin" && (
                        <div className="c-dd-item"
                          onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                          Tableau de bord
                        </div>
                      )}
                      {user.role==="manager" && (
                        <div className="c-dd-item"
                          onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>
                          Tableau de bord
                        </div>
                      )}
                      <div className="c-dd-sep"/>
                      <div className="c-dd-item c-dd-danger" onClick={handleLogout}>
                        Deconnexion
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
                  border:"1.5px solid rgba(255,255,255,0.35)",
                  background:"transparent", color:"#fff",
                  fontSize:"13px", fontWeight:600, cursor:"pointer",
                  fontFamily:"'DM Sans',Arial,sans-serif" }}>
                Connexion
              </button>
              <button onClick={() => navigate("/inscription")}
                style={{ padding:"7px 18px", borderRadius:"100px",
                  border:"none", background:"#4DC97A",
                  color:"#0A3D1F", fontSize:"13px", fontWeight:700,
                  cursor:"pointer", fontFamily:"'DM Sans',Arial,sans-serif" }}>
                S'inscrire
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="c-hero">
        <div style={{ maxWidth:"1200px", margin:"0 auto",
          display:"grid", gridTemplateColumns:"1fr 1fr",
          gap:"64px", alignItems:"center" }}>

          {/* Gauche */}
          <div>
            <div style={{ display:"inline-flex", alignItems:"center",
              gap:"10px", marginBottom:"28px" }}>
              <div style={{ width:"32px", height:"3px", background:"#ED1C24" }}/>
              <span style={{ fontSize:"11px", fontWeight:700, color:"#ED1C24",
                textTransform:"uppercase", letterSpacing:"0.14em" }}>
                CCI-BF — Burkina Faso
              </span>
            </div>

            <h1 style={{ fontFamily:"'Playfair Display',serif",
              fontSize:"clamp(48px,5vw,76px)", fontWeight:900,
              lineHeight:1.05, margin:"0 0 24px", color:"#1a1a1a" }}>
              Contactez<br/>
              <span style={{ color:"#ED1C24" }}>la CCI-BF</span>
            </h1>

            <p style={{ fontSize:"16px", color:"#666",
              lineHeight:1.8, maxWidth:"400px",
              margin:"0 0 40px", fontWeight:400 }}>
              Notre equipe est disponible du lundi au vendredi pour repondre
              a toutes vos questions sur le registre national des entreprises.
            </p>

            <div style={{ display:"flex", gap:"14px", flexWrap:"wrap" }}>
              <button onClick={() => navigate("/chat")}
                style={{ padding:"14px 32px", borderRadius:"4px",
                  background:"#ED1C24", border:"none", color:"#fff",
                  fontSize:"14px", fontWeight:700, cursor:"pointer",
                  fontFamily:"'DM Sans',Arial,sans-serif",
                  letterSpacing:"0.04em", transition:"all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background="#C8161F"}
                onMouseLeave={e => e.currentTarget.style.background="#ED1C24"}>
                Messagerie directe
              </button>
              <button onClick={() => window.open("tel:+22625306122")}
                style={{ padding:"14px 32px", borderRadius:"4px",
                  background:"transparent",
                  border:"1.5px solid #1a1a1a",
                  color:"#1a1a1a",
                  fontSize:"14px", fontWeight:600, cursor:"pointer",
                  fontFamily:"'DM Sans',Arial,sans-serif",
                  transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background="#1a1a1a"; e.currentTarget.style.color="#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#1a1a1a"; }}>
                Appeler
              </button>
            </div>
          </div>

          {/* Droite — chiffres */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:"1px", background:"#EBEBEB",
            border:"1px solid #EBEBEB", borderRadius:"2px",
            overflow:"hidden" }}>
            {[
              { num:"233 000+", label:"Entreprises",       couleur:"#ED1C24" },
              { num:"17",       label:"Regions",            couleur:"#00904C" },
              { num:"120+",     label:"Secteurs",           couleur:"#1a1a1a" },
              { num:"100%",     label:"Donnees certifiees", couleur:"#ED1C24" },
            ].map((s, i) => (
              <div key={i} style={{ background:"#fff",
                padding:"36px 32px" }}>
                <div style={{ fontFamily:"'Playfair Display',serif",
                  fontSize:"38px", fontWeight:900, color:s.couleur,
                  lineHeight:1, marginBottom:"8px" }}>
                  {s.num}
                </div>
                <div style={{ fontSize:"11px", fontWeight:600,
                  textTransform:"uppercase", letterSpacing:"0.1em",
                  color:"#999" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RÈGLE ── */}
      <div className="c-rule">
        <div className="c-rule-r"/>
        <div className="c-rule-g"/>
      </div>

      {/* ── COORDONNÉES ── */}
      <div style={{ background:"#FAFAFA", padding:"0" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>

          <div style={{ padding:"60px 48px 40px" }}>
            <div style={{ display:"inline-flex", alignItems:"center",
              gap:"10px", marginBottom:"12px" }}>
              <div style={{ width:"24px", height:"3px", background:"#00904C" }}/>
              <span style={{ fontSize:"11px", fontWeight:700, color:"#00904C",
                textTransform:"uppercase", letterSpacing:"0.14em" }}>
                Nos coordonnees
              </span>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",
              fontSize:"36px", fontWeight:900, color:"#1a1a1a",
              marginBottom:"6px", lineHeight:1.15 }}>
              Retrouvez-nous
            </h2>
            <p style={{ fontSize:"13px", color:"#999", fontWeight:400 }}>
              Chambre de Commerce et d'Industrie du Burkina Faso
            </p>
          </div>

          <div className="c-info-grid">
            {INFOS.map((info, i) => (
              <div key={i}
                className={`c-info-cell ${activeInfo===i?"active":""}`}
                onClick={() => setActiveInfo(activeInfo===i?null:i)}>

                {/* Numéro */}
                <div style={{ fontSize:"11px", fontWeight:800, color:"#ED1C24",
                  letterSpacing:"0.12em", marginBottom:"16px" }}>
                  0{i+1}
                </div>

                {/* Titre */}
                <div style={{ fontSize:"12px", fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.1em",
                  color:"#aaa", marginBottom:"12px" }}>
                  {info.titre}
                </div>

                {/* Lignes */}
                {info.lignes.map((l, j) => (
                  <div key={j} style={{ fontSize:"18px", fontWeight:600,
                    color: activeInfo===i ? "#1a1a1a" : "#444",
                    lineHeight:1.65, transition:"color 0.2s",
                    fontFamily:"'DM Sans',Arial,sans-serif" }}>
                    {info.liens ? (
                      <a href={info.liens[j]} target="_blank" rel="noopener noreferrer"
                        style={{ color:"#00904C", textDecoration:"none",
                          transition:"color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color="#006635"}
                        onMouseLeave={e => e.currentTarget.style.color="#00904C"}>
                        {l}
                      </a>
                    ) : l}
                  </div>
                ))}

                {/* Badge horaires */}
                {info.badge && (
                  <div style={{ display:"inline-flex", alignItems:"center",
                    gap:"8px", marginTop:"14px",
                    background:"rgba(0,144,76,0.08)",
                    border:"1px solid rgba(0,144,76,0.2)",
                    borderRadius:"2px", padding:"5px 14px" }}>
                    <span style={{ width:"7px", height:"7px", borderRadius:"50%",
                      background:"#00904C", display:"inline-block" }}/>
                    <span style={{ fontSize:"11px", fontWeight:700,
                      color:"#00904C", textTransform:"uppercase",
                      letterSpacing:"0.1em" }}>
                      Ouvert maintenant
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GOOGLE MAPS ── */}
      <div style={{ maxWidth:"1200px", margin:"0 auto" }}>
        <div className="c-map-container">
          <iframe
            title="CCI-BF Ouagadougou"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3898.5!2d-1.5225!3d12.3714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2ebe3a5d2eca1b%3A0x1234!2sCCI-BF%20Ouagadougou!5e0!3m2!1sfr!2sbf!4v1"
            width="100%" height="100%"
            style={{ border:0, display:"block" }}
            allowFullScreen="" loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"/>
        </div>
      </div>

      {/* ── RÈGLE INVERSE ── */}
      <div className="c-rule">
        <div className="c-rule-g" style={{ width:"80px" }}/>
        <div className="c-rule-r"/>
      </div>

      {/* ── CANAUX DE CONTACT ── */}
      <div style={{ background:"#fff", padding:"72px 60px" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto" }}>

          <div style={{ marginBottom:"48px" }}>
            <div style={{ display:"inline-flex", alignItems:"center",
              gap:"10px", marginBottom:"12px" }}>
              <div style={{ width:"24px", height:"3px", background:"#ED1C24" }}/>
              <span style={{ fontSize:"11px", fontWeight:700, color:"#ED1C24",
                textTransform:"uppercase", letterSpacing:"0.14em" }}>
                Nous joindre
              </span>
            </div>
            <h2 style={{ fontFamily:"'Playfair Display',serif",
              fontSize:"36px", fontWeight:900, color:"#1a1a1a",
              lineHeight:1.15 }}>
              Choisissez votre canal
            </h2>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gap:"20px" }}>
            {CANAUX.map((c, i) => (
              <div key={i} className="c-canal-card"
                style={{ borderTopColor:c.couleur, background:c.bg }}
                onClick={() => c.interne ? navigate(c.lien) : window.open(c.lien,"_blank")}>

                <div style={{ fontSize:"11px", fontWeight:800,
                  color:c.couleur, letterSpacing:"0.12em",
                  marginBottom:"24px" }}>
                  0{i+1}
                </div>

                <div style={{ fontSize:"12px", fontWeight:700,
                  textTransform:"uppercase", letterSpacing:"0.1em",
                  color:"#aaa", marginBottom:"10px" }}>
                  {c.titre}
                </div>

                <div style={{ fontSize:"20px", fontWeight:700, color:"#1a1a1a",
                  fontFamily:"'Playfair Display',serif",
                  marginBottom:"28px", lineHeight:1.3 }}>
                  {c.texte}
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontSize:"12px", fontWeight:700,
                    color:c.couleur, textTransform:"uppercase",
                    letterSpacing:"0.08em" }}>
                    {c.action}
                  </span>
                  <div style={{ height:"1px", flex:1,
                    background:c.couleur+"40" }}/>
                  <span style={{ fontSize:"16px", color:c.couleur }}>
                    &#8594;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="c-footer">
        <div>
          <div style={{ fontSize:"15px", fontWeight:800, color:"#1a1a1a",
            letterSpacing:"0.04em" }}>
            NERE <span style={{ color:"#00904C" }}>CCI-BF</span>
          </div>
          <div style={{ fontSize:"12px", color:"#aaa", marginTop:"3px" }}>
            Chambre de Commerce et d'Industrie du Burkina Faso
          </div>
        </div>
       
      </footer>
    </div>
  );
}