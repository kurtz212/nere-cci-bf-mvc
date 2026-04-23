import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.png";

const CONTACTS_INFO = [
  { titre:"Adresse",     lignes:["Avenue de Lyon, 01 BP 502","Ouagadougou 01, Burkina Faso"] },
  { titre:"Téléphone",   lignes:["+226 25 30 61 22","+226 25 30 61 23"] },
  { titre:"Email",       lignes:["https://www.cci.bf/","https://www.fichiernere.bf/"] },
  { titre:"Horaires",    lignes:["Lundi – Vendredi","8h00 – 17h00"] },
  { titre:"Localisation",lignes:["Ouagadougou, Burkina Faso","Voir sur la carte "] },
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
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({
    nom:"", prenom:"", email:"", telephone:"", sujet:"", message:"",
  });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    if (user) setForm(f => ({
      ...f, nom:user.nom||"", prenom:user.prenom||"", email:user.email||"",
    }));
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
  };

  const initiales = user
    ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase()
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/demandes", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          ...(token ? { Authorization:`Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type:"contact", sujet:form.sujet, description:form.message,
          nom:form.nom, prenom:form.prenom, email:form.email, telephone:form.telephone,
        }),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else alert(data.message || "Erreur lors de l'envoi.");
    } catch { setSuccess(true); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif", background:"#F5FAF7" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

        /* ══ NAVBAR — identique Home.jsx ══ */
        .nere-navbar-c {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 120px;
          background: #00904C;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }
        .nere-navbar-c .nav-pill {
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 20px;
        }
        .nere-navbar-c .nav-pill .nav-btn {
          padding: 7px 15px; border-radius: 100px;
          font-size: 20px; font-weight: 600;
          color: rgba(255,255,255,0.78); cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
          border: none; background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }
        .nere-navbar-c .nav-pill .nav-btn:hover {
          color: #fff; background: rgba(255,255,255,0.12);
        }
        .nere-navbar-c .nav-pill .nav-btn.active {
          color: #0A3D1F; background: #4DC97A;
          font-weight: 700; box-shadow: 0 2px 8px rgba(77,201,122,0.4);
        }
        .nere-navbar-c .u-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 12px 5px 5px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; cursor: pointer;
          color: #fff; font-size: 13px; font-weight: 600;
          transition: all 0.2s; flex-shrink: 0;
        }
        .nere-navbar-c .u-chip:hover { background: rgba(255,255,255,0.18); }
        .nere-navbar-c .u-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #4DC97A; color: #0A3D1F;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 12px; flex-shrink: 0;
        }
        .nere-dropdown-c {
          position: absolute; z-index: 9999;
          top: calc(100% + 10px); right: 0;
          background: #fff; border-radius: 16px;
          border: 1px solid #E2EDE6; min-width: 220px;
          overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.14);
          animation: dropInC 0.18s ease;
        }
        @keyframes dropInC {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .nere-dropdown-c .dd-head {
          padding: 14px 18px 10px; border-bottom: 1px solid #F0F4F1;
          background: linear-gradient(135deg,#F5FAF7,#fff);
        }
        .nere-dropdown-c .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
        .nere-dropdown-c .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
        .nere-dropdown-c .dd-role  {
          display:inline-flex; align-items:center; gap:5px; margin-top:6px;
          background:#E8F5EE; color:#00904C; border-radius:100px; padding:3px 10px;
          font-size:10px; font-weight:700; text-transform:uppercase;
        }
        .nere-dropdown-c .dd-item {
          padding: 10px 18px; font-size:13px; color:#0A3D1F;
          cursor:pointer; transition:background 0.15s;
        }
        .nere-dropdown-c .dd-item:hover { background:#F5FAF7; }
        .nere-dropdown-c .dd-danger { color:#CC3333; }
        .nere-dropdown-c .dd-danger:hover { background:#FFF0F0 !important; }
        .nere-dropdown-c .dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }
      `}</style>

      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR — même design que Home.jsx ══ */}
        <nav className="nere-navbar-c">

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

          {/* Pilule liens */}
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key}
                className={`nav-btn ${link.key==="contact"?"active":""}`}
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
        <div className="pub-page-hero" style={{ padding:"40px 48px 36px", textAlign:"center" }}>
          <div className="pub-page-tag">CCI-BF · Nous contacter</div>
          <h1 className="pub-page-title">Contactez la CCI-BF</h1>
        </div>

        {/* ══ CARTE COORDONNÉES ══ */}
        <div style={{ display:"flex", justifyContent:"center", alignItems:"flex-start",
          gap:"28px", padding:"48px 24px 80px", flexWrap:"wrap" }}>

          <div style={{ background:"#fff", borderRadius:"20px",
            border:"1.5px solid rgba(0,144,76,0.15)", padding:"36px 32px",
            width:"380px", boxShadow:"0 4px 24px rgba(0,144,76,0.08)" }}>

            <div style={{ display:"flex", alignItems:"center", gap:"12px",
              marginBottom:"28px", paddingBottom:"20px",
              borderBottom:"1px solid rgba(0,144,76,0.1)" }}>
              
              <div>
                <div style={{ fontWeight:800, fontSize:"16px", color:"#0A2410" }}>
                  Nos coordonnées
                </div>
                <div style={{ fontSize:"12px", color:"#6B9A7A", marginTop:"2px" }}>
                  CCI-BF — Ouagadougou
                </div>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
              {CONTACTS_INFO.map((c, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:"14px" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"12px", color:"#6B9A7A",
                      textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"4px" }}>
                      {c.titre}
                    </div>
                    {c.lignes.map((l, j) => (
                      <div key={j} style={{ fontSize:"13px", color:"#0A2410", lineHeight:1.6 }}>
                        {c.titre==="Email" ? (
                          <a href={`mailto:${l}`} style={{ color:"#00904C", textDecoration:"none" }}
                            onMouseEnter={e => e.target.style.textDecoration="underline"}
                            onMouseLeave={e => e.target.style.textDecoration="none"}>{l}</a>
                        ) : c.titre==="Localisation" && j===1 ? (
                          <a href="https://maps.google.com/?q=Ouagadougou+CCI-BF"
                            target="_blank" rel="noopener noreferrer"
                            style={{ color:"#00904C", textDecoration:"none" }}
                            onMouseEnter={e => e.target.style.textDecoration="underline"}
                            onMouseLeave={e => e.target.style.textDecoration="none"}>{l}</a>
                        ) : l}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop:"28px", height:"4px", borderRadius:"2px",
              background:"linear-gradient(90deg, #00904C, #4DC97A)" }}/>
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="dash-footer">
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <span>Réponse sous 48h ouvrables · +226 25 30 61 22</span>
        </footer>
      </div>
    </div>
  );
}