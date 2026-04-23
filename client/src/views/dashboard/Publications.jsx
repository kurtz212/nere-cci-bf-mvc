import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.png";

const API = "/api";

const CATEGORIES = ["Toutes","Rapport","Étude","Classement","Note technique","Communiqué"];

const ACCESS_LABELS = {
  0: { label:"Public",  color:"#22A052", bg:"rgba(34,160,82,0.1)"  },
  1: { label:"Basic+",  color:"#1A7A40", bg:"rgba(26,122,64,0.1)"  },
  2: { label:"Pro+",    color:"#D4A830", bg:"rgba(212,168,48,0.1)" },
  3: { label:"Premium", color:"#E85555", bg:"rgba(232,85,85,0.1)"  },
};

function masquerTout(texte) {
  return texte ? texte.replace(/[^\s]/g, "X") : "";
}
function masquerPartiel(texte) {
  if (!texte) return "";
  const mots = texte.split(" ");
  return mots.map((mot, i) => i < 2 ? mot : mot.replace(/[^\s]/g, "X")).join(" ");
}

/* ── NAV LINKS ── */
const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",         path:"/chat",         key:"chat"         },
];

export default function Publications() {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [filtre, setFiltre]       = useState("Toutes");
  const [recherche, setRecherche] = useState("");
  const [selected, setSelected]   = useState(null);
  const [pubs, setPubs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erreur, setErreur]       = useState("");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const charger = async () => {
      setLoading(true); setErreur("");
      try {
        const token     = localStorage.getItem("token");
        const userLocal = JSON.parse(localStorage.getItem("user") || "null");
        const isPriv    = userLocal?.role === "admin" || userLocal?.role === "manager";
        const headers   = token ? { Authorization:`Bearer ${token}` } : {};
        const url       = `${API}/publications?limit=100${isPriv ? "&all=true" : ""}`;

        const res  = await fetch(url, { headers });
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setPubs(data.data.map(p => ({
            id:          p._id,
            titre:       p.titre     || "Sans titre",
            extrait:     p.extrait   || (p.contenu ? p.contenu.substring(0, 180) + "..." : "Aucun extrait disponible."),
            contenu:     p.contenu   || "",
            categorie:   p.categorie || "Rapport",
            statut:      p.statut    || "publie",
            date:        new Date(p.createdAt).toLocaleDateString("fr-FR",
              { day:"2-digit", month:"long", year:"numeric" }),
            tags:        p.tags      || [p.categorie || "Rapport"],
            accessLevel: p.accesPack ? p.accesPack - 1 : 0,
            vues:        p.vues      || 0,
          })));
        } else {
          setPubs([]);
        }
      } catch {
        setErreur("Impossible de charger les publications.");
        setPubs([]);
      } finally {
        setLoading(false);
      }
    };
    charger();
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

  const isVisiteur = !user;
  const packLevel  = user ? 1 : 0;

  const pubsFiltrees = pubs.filter(p => {
    const matchCat    = filtre === "Toutes" || p.categorie === filtre;
    const matchSearch = p.titre.toLowerCase().includes(recherche.toLowerCase()) ||
      (p.tags||[]).some(t => t.toLowerCase().includes(recherche.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }

        /* ══ NAVBAR ══ */
        .pub-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 120px;
          background: #00904C;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }

        /* Liens nav — alignés à droite via margin-left:auto */
        .pub-navbar .nav-pill {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px;
          padding: 5px 8px;
          margin-left: auto;
          margin-right: 20px;
        }

        .pub-navbar .nav-pill .nav-btn {
          padding: 7px 15px;
          border-radius: 100px;
          font-size: 20px;
          font-weight: 600;
          color: rgba(255,255,255,0.78);
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
          border: none;
          background: transparent;
          font-family: Arial, Helvetica, sans-serif;
          letter-spacing: 0.02em;
        }
        .pub-navbar .nav-pill .nav-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.12);
        }
        .pub-navbar .nav-pill .nav-btn.active {
          color: #0A3D1F;
          background: #4DC97A;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(77,201,122,0.4);
        }

        /* User chip */
        .pub-navbar .u-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px 5px 5px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          cursor: pointer;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .pub-navbar .u-chip:hover { background: rgba(255,255,255,0.18); }
        .pub-navbar .u-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #4DC97A; color: #0A3D1F;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 12px; flex-shrink: 0;
        }

        /* Dropdown */
        .pub-dropdown {
          position: absolute;
          z-index: 9999;
          top: calc(100% + 10px);
          right: 0;
          background: #fff;
          border-radius: 16px;
          border: 1px solid #E2EDE6;
          min-width: 220px;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(0,0,0,0.14);
          animation: dropIn 0.18s ease;
        }
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .pub-dropdown .dd-head {
          padding: 14px 18px 10px;
          border-bottom: 1px solid #F0F4F1;
          background: linear-gradient(135deg,#F5FAF7,#fff);
        }
        .pub-dropdown .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
        .pub-dropdown .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
        .pub-dropdown .dd-role  {
          display:inline-flex; align-items:center; gap:5px;
          margin-top:6px; background:#E8F5EE; color:#00904C;
          border-radius:100px; padding:3px 10px;
          font-size:10px; font-weight:700; text-transform:uppercase;
        }
        .pub-dropdown .dd-item {
          padding: 10px 18px; font-size:13px; color:#0A3D1F;
          cursor:pointer; transition:background 0.15s;
        }
        .pub-dropdown .dd-item:hover { background:#F5FAF7; }
        .pub-dropdown .dd-danger { color:#CC3333; }
        .pub-dropdown .dd-danger:hover { background:#FFF0F0 !important; }
        .pub-dropdown .dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }

        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR ══ */}
        <nav className="pub-navbar">

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <img src={logoNERE} alt="NERE"
              style={{ height:"80px", width:"auto", borderRadius:"6px",
                flexShrink:0, backgroundColor:"#fff", padding:"4px" }}/>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
              <span style={{ fontSize:"18px", fontWeight:800, color:"#fff",
                letterSpacing:"0.08em", textTransform:"uppercase" }}>Fichier NERE</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.7)" }}>
                Registre national des entreprises
              </span>
            </div>
          </div>

          {/* ── Liens dans une pilule — margin-left:auto les pousse à droite ── */}
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key}
                className={`nav-btn ${link.key === "publications" ? "active" : ""}`}
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions utilisateur */}
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
                    <div className="pub-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="dd-head">
                        <div className="dd-name">{user.prenom} {user.nom}</div>
                        <div className="dd-email">{user.email||"—"}</div>
                        <div className="dd-role">
                          {user.role === "admin"   ? " Admin" :
                           user.role === "manager" ? " Gestionnaire" : " Abonné"}
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
                        {user.role === "admin" && (
                          <div className="dd-item"
                            onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                             Tableau de bord
                          </div>
                        )}
                        {user.role === "manager" && (
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

        {/* ══ BANNIÈRE VISITEUR ══ */}
        {isVisiteur && (
          <div style={{ background:"#ED1C24", padding:"14px 0",
            borderBottom:"3px solid var(--green-light)",
            overflow:"hidden", whiteSpace:"nowrap" }}>
            <div style={{ display:"inline-block", animation:"marquee 18s linear infinite" }}>
              {[1,2,3].map(i => (
                <span key={i}>
                  <span style={{ fontSize:"16px", marginRight:"12px" }}></span>
                  <span style={{ color:"#fff", fontSize:"14px", fontWeight:600, marginRight:"80px" }}>
                    Contenu masqué — inscrivez-vous pour accéder aux informations complètes
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ══ HERO ══ */}
        <div className="pub-page-hero">
          <div className="pub-page-tag">Publications CCI-BF</div>
          <h1 className="pub-page-title">Actualités et Études économiques</h1>
          <p className="pub-page-desc">Rapports, classements et analyses sur l'économie du Burkina Faso</p>
          <div className="pub-search-bar">
            <span className="pub-search-icon"></span>
            <input className="pub-search-input"
              placeholder="Rechercher par titre, catégorie, mot-clé..."
              value={recherche} onChange={e => setRecherche(e.target.value)}/>
            {recherche && (
              <span className="pub-search-clear" onClick={() => setRecherche("")}>✕</span>
            )}
          </div>
        </div>

        {/* ══ FILTRES ══ */}
        <div className="pub-filtres">
          {CATEGORIES.map(cat => (
            <button key={cat}
              className={`pub-filtre-btn ${filtre===cat?"active":""}`}
              onClick={() => setFiltre(cat)}>
              {cat}
            </button>
          ))}
          {!loading && (
            <span className="pub-count">
              {pubsFiltrees.length} publication{pubsFiltrees.length>1?"s":""}
            </span>
          )}
        </div>

        {/* ══ ÉTATS ══ */}
        {loading && (
          <div style={{ textAlign:"center", padding:"80px 48px", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"40px", marginBottom:"16px" }}>⏳</div>
            <p style={{ fontSize:"15px" }}>Chargement des publications...</p>
          </div>
        )}

        {!loading && erreur && (
          <div style={{ textAlign:"center", padding:"60px 48px" }}>
            <div style={{ fontSize:"40px", marginBottom:"12px" }}>⚠️</div>
            <p style={{ color:"#CC3333", fontSize:"14px" }}>{erreur}</p>
            <button onClick={() => window.location.reload()}
              style={{ marginTop:"16px", padding:"10px 24px", background:"#00904C",
                color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer",
                fontWeight:700, fontSize:"13px" }}>
              Réessayer
            </button>
          </div>
        )}

        {!loading && !erreur && pubs.length === 0 && (
          <div style={{ textAlign:"center", padding:"80px 48px", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"48px", marginBottom:"16px" }}></div>
            <p style={{ fontSize:"15px", fontWeight:600, color:"var(--text-dark)", marginBottom:"8px" }}>
              Aucune publication disponible
            </p>
            <p style={{ fontSize:"13px" }}>
              Les publications de la CCI-BF apparaîtront ici dès leur mise en ligne.
            </p>
          </div>
        )}

        {!loading && !erreur && pubs.length > 0 && pubsFiltrees.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 48px", color:"var(--text-muted)" }}>
            <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
            <p style={{ fontSize:"14px" }}>Aucune publication ne correspond à votre recherche.</p>
            <button onClick={() => { setRecherche(""); setFiltre("Toutes"); }}
              style={{ marginTop:"12px", padding:"9px 20px", background:"#00904C",
                color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer",
                fontWeight:600, fontSize:"13px" }}>
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* ══ GRILLE ══ */}
        {!loading && !erreur && pubsFiltrees.length > 0 && (
          <div className="pub-page-grid">
            {pubsFiltrees.map(pub => {
              const locked = pub.accessLevel > packLevel;
              const access = ACCESS_LABELS[pub.accessLevel] || ACCESS_LABELS[0];

              return (
                <div key={pub.id}
                  className={`pub-page-card ${locked||isVisiteur?"locked":""}`}
                  onClick={() => !locked && !isVisiteur && setSelected(pub)}>

                  {/* Badge brouillon admin/manager */}
                  {(user?.role==="admin"||user?.role==="manager") &&
                    pub.statut && !/^publi/i.test(pub.statut) && (
                    <div style={{ position:"absolute", top:"10px", right:"10px",
                      background:"rgba(212,168,48,0.15)", border:"1px solid #D4A830",
                      borderRadius:"6px", padding:"2px 8px",
                      fontSize:"10px", fontWeight:700, color:"#B8860B" }}>
                      Brouillon
                    </div>
                  )}

                  <div className="pub-access-badge"
                    style={{ background:access.bg, color:access.color,
                      border:`1px solid ${access.color}44` }}>
                    {locked||isVisiteur ? " " : "✓ "}{access.label}
                  </div>

                  <div className="pub-card-cat">{pub.categorie}</div>

                  <div className="pub-card-date" style={isVisiteur?{fontFamily:"monospace"}:{}}>
                    {isVisiteur ? masquerTout(pub.date) : pub.date}
                  </div>

                  <div className="pub-card-title"
                    style={isVisiteur?{fontFamily:"monospace",letterSpacing:"0.03em"}:{}}>
                    {isVisiteur ? masquerPartiel(pub.titre) : pub.titre}
                  </div>

                  {isVisiteur ? (
                    <>
                      <div className="pub-card-extrait"
                        style={{ fontFamily:"monospace", letterSpacing:"0.04em",
                          color:"var(--text-muted)", userSelect:"none", lineHeight:"1.8" }}>
                        {masquerTout(pub.extrait)}
                      </div>
                      <button className="btn-upgrade"
                        style={{ marginTop:"14px", width:"100%", padding:"10px" }}
                        onClick={e => { e.stopPropagation(); navigate("/inscription"); }}>
                        S'inscrire pour lire
                      </button>
                    </>

                  ) : locked ? (
                    <div className="pub-card-locked-msg">
                      <div className="lock-icon"></div>
                      <div>Réservé aux abonnés <strong>{access.label}</strong></div>
                      <button className="btn-upgrade"
                        onClick={e => { e.stopPropagation(); navigate("/formules"); }}>
                        Voir les formules
                      </button>
                    </div>

                  ) : (
                    <>
                      <div className="pub-card-extrait">{pub.extrait}</div>
                      <div className="pub-card-footer">
                        <div className="pub-card-tags">
                          {(pub.tags||[]).map(t => (
                            <span key={t} className="pub-tag">{t}</span>
                          ))}
                        </div>
                        <span className="pub-card-read">Ouvrir</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ MODAL LECTURE ══ */}
        {selected && !isVisiteur && (
          <div className="modal-overlay" onClick={() => setSelected(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
              <div className="modal-cat">{selected.categorie} · {selected.date}</div>
              <h2 className="modal-title">{selected.titre}</h2>
              <div className="modal-tags">
                {(selected.tags||[]).map(t => (
                  <span key={t} className="pub-tag">{t}</span>
                ))}
              </div>
              <div className="modal-body">
                <p>{selected.extrait}</p>
                {selected.contenu && selected.contenu !== selected.extrait && (
                  <div style={{ marginTop:"16px", fontSize:"14px", lineHeight:1.8, color:"#333" }}>
                    {selected.contenu}
                  </div>
                )}
                {selected.vues > 0 && (
                  <p style={{ marginTop:"20px", fontSize:"12px", color:"#aaa" }}>
                    👁️ {selected.vues} vue{selected.vues>1?"s":""}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══ FOOTER ══ */}
        <footer className="dash-footer">
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{ display:"flex", gap:"20px" }}>
            <span>CGU</span><span>Contact</span><span>Support</span>
          </div>
        </footer>

      </div>
    </div>
  );
}