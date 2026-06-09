import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoNERE from "../../assets/nere.png";

export default function Recherche() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hover, setHover]       = useState(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/";
  };

  const initiales = user
    ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase()
    : "";

  const NAV_LINKS = [
    { label: "Accueil",      path: "/"             },
    { label: "Publications", path: "/publications"  },
    { label: "Recherche",    path: "/rechercheacc"  },
    { label: "Contact",      path: "/contact"       },
    { label: "Messages",     path: "/chat"          },
  ];

  const CARDS = [
    {
      key:   "multicritere",
      path:  "/demande-document",
      tag:   "Recommandé",
      tagColor: "#ED1C24",
      titre: "Recherche multicritère",
      desc:  "Combinez plusieurs filtres : secteur, région, chiffre d'affaires, effectif, statut juridique, période et bien plus encore.",
      icon:  (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="4" y="7"  width="32" height="4" rx="2" fill="#00904C"/>
          <rect x="4" y="15" width="22" height="4" rx="2" fill="#00904C"/>
          <rect x="4" y="23" width="27" height="4" rx="2" fill="#00904C"/>
          <rect x="4" y="31" width="16" height="4" rx="2" fill="#ED1C24"/>
          <circle cx="32" cy="32" r="5" stroke="#00904C" strokeWidth="2.2"/>
          <line x1="35.5" y1="35.5" x2="39" y2="39" stroke="#00904C" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      ),
      accent: "#00904C",
    },
    {
      key:   "simple",
      path:  "/recherche-entreprise",
      tag:   null,
      titre: "Recherche par critère",
      desc:  "Recherche rapide et ciblée : nom d'entreprise, numéro RCCM, IFU ou tout autre identifiant unique.",
      icon:  (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="18" cy="18" r="11" stroke="#ED1C24" strokeWidth="2.2"/>
          <line x1="26" y1="26" x2="36" y2="36" stroke="#ED1C24" strokeWidth="2.2" strokeLinecap="round"/>
          <line x1="18" y1="12" x2="18" y2="24" stroke="#ED1C24" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="18" x2="24" y2="18" stroke="#ED1C24" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      accent: "#ED1C24",
    },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#fff", fontFamily:"Arial, Helvetica, sans-serif", color:"#111" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; box-sizing: border-box; }

        /* ── NAVBAR ── */
        .rech-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 120px;
          background: #00904C;
          box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        }
        .rech-nav .logo-zone {
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .rech-nav .nav-pill {
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 20px;
        }
        .rech-nav .nav-btn {
          padding: 7px 16px; border-radius: 100px;
          font-size: 20px; font-weight: 600;
          color: rgba(255,255,255,0.78); cursor: pointer;
          border: none; background: transparent; white-space: nowrap;
          transition: all 0.2s;
        }
        .rech-nav .nav-btn:hover { color:#fff; background:rgba(255,255,255,0.12); }
        .rech-nav .nav-btn.active { color:#0A3D1F; background:#4DC97A; font-weight:700; }
        .rech-nav .u-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 12px 5px 5px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; cursor: pointer; color: #fff;
          font-size: 13px; font-weight: 600; flex-shrink: 0;
        }
        .rech-nav .u-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #4DC97A; color: #0A3D1F;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 12px;
        }
        .rech-nav .btn-out {
          padding: 7px 18px; border-radius: 100px;
          border: 1.5px solid rgba(255,255,255,0.4);
          background: transparent; color: #fff;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .rech-nav .btn-in {
          padding: 7px 18px; border-radius: 100px;
          border: none; background: #4DC97A; color: #0A3D1F;
          font-size: 13px; font-weight: 700; cursor: pointer;
        }

        /* ── DROPDOWN ── */
        .rech-dd {
          position: absolute; z-index: 9999;
          top: calc(100% + 10px); right: 0;
          background: #fff; border-radius: 16px;
          border: 1px solid #E2EDE6; min-width: 220px;
          overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.14);
        }
        .rech-dd .dd-head { padding: 14px 18px 10px; border-bottom: 1px solid #f0f0f0; }
        .rech-dd .dd-name { font-weight: 800; color: #0A3D1F; font-size: 14px; }
        .rech-dd .dd-email { font-size: 12px; color: #6B9A7A; margin-top: 2px; }
        .rech-dd .dd-role {
          display: inline-flex; align-items: center; gap: 5px; margin-top: 6px;
          background: #E8F5EE; color: #00904C; border-radius: 100px;
          padding: 3px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase;
        }
        .rech-dd .dd-item { padding: 10px 18px; font-size: 13px; color: #0A3D1F; cursor: pointer; }
        .rech-dd .dd-item:hover { background: #F5FAF7; }
        .rech-dd .dd-danger { color: #CC3333; }
        .rech-dd .dd-danger:hover { background: #FFF0F0 !important; }
        .rech-dd .dd-sep { height: 1px; background: #f0f0f0; margin: 4px 0; }

        /* ── HERO ── */
        .rech-hero {
          text-align: center;
          padding: 72px 24px 48px;
          border-bottom: 1px solid #f0f0f0;
        }
        .rech-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: #E8F5EE; border: 1px solid #C0E8D0;
          border-radius: 100px; padding: 5px 16px;
          font-size: 11px; font-weight: 700; color: #00904C;
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-bottom: 20px;
        }
        .rech-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: #00904C; }
        .rech-title {
          font-size: clamp(28px,4vw,46px); font-weight: 900;
          color: #0a0a0a; line-height: 1.2; margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .rech-title .red { color: #ED1C24; }
        .rech-title .green { color: #00904C; }
        .rech-sub {
          font-size: 15px; color: #777; line-height: 1.8;
          max-width: 520px; margin: 0 auto;
        }

        /* ── CARTES ── */
        .rech-cards {
          display: flex; gap: 32px; flex-wrap: wrap;
          justify-content: center;
          padding: 56px 24px 72px;
          max-width: 900px; margin: 0 auto;
        }
        .rech-card {
          position: relative; background: #fff;
          border-radius: 24px; border: 2px solid #e8e8e8;
          padding: 40px 32px; flex: 1; min-width: 280px; max-width: 380px;
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 16px;
          cursor: pointer; transition: all 0.25s;
        }
        .rech-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.09);
        }
        .rech-card .card-tag {
          position: absolute; top: -13px; left: 50%;
          transform: translateX(-50%);
          padding: 4px 16px; border-radius: 100px;
          font-size: 11px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.05em;
          white-space: nowrap; color: #fff;
        }
        .rech-card .icon-box {
          width: 80px; height: 80px; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
        }
        .rech-card .card-title {
          font-size: 20px; font-weight: 900; color: #111; line-height: 1.3;
        }
        .rech-card .card-desc {
          font-size: 13px; color: #777; line-height: 1.7; max-width: 280px;
        }
        .rech-card .card-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 24px; border-radius: 10px; border: none;
          font-size: 14px; font-weight: 700; cursor: pointer;
          margin-top: 8px; transition: all 0.2s; color: #fff;
        }
        .rech-card .card-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

        /* ── STATS BAND ── */
        .stats-band {
          background: #F5FAF7; border-top: 1px solid #e8e8e8;
          border-bottom: 1px solid #e8e8e8;
          display: flex; justify-content: center;
          gap: 0; flex-wrap: wrap;
        }
        .stat-item {
          padding: 28px 48px; text-align: center;
          border-right: 1px solid #e8e8e8;
          flex: 1; min-width: 160px;
        }
        .stat-item:last-child { border-right: none; }
        .stat-num { font-size: 28px; font-weight: 900; color: #00904C; }
        .stat-label { font-size: 12px; color: #888; margin-top: 4px; font-weight: 600; }

        /* ── FOOTER ── */
        .rech-footer {
          background: #0A2410; padding: 24px 48px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 12px;
        }
        .rech-footer .f-logo { font-size: 16px; font-weight: 800; color: #fff; }
        .rech-footer .f-logo span { color: #4DC97A; }
        .rech-footer .f-copy { font-size: 12px; color: rgba(255,255,255,0.45); margin-top: 4px; }
        .rech-footer .f-links { display: flex; gap: 20px; }
        .rech-footer .f-link { font-size: 12px; color: rgba(255,255,255,0.45); cursor: pointer; }
        .rech-footer .f-link:hover { color: #4DC97A; }

        @media (max-width: 640px) {
          .rech-nav { padding: 0 16px; height: 80px; }
          .rech-cards { padding: 36px 16px 48px; gap: 20px; }
          .stat-item { padding: 20px 24px; }
        }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav className="rech-nav">
        {/* Logo */}
        <div className="logo-zone">
          <img src={logoNERE} alt="NERE"
            style={{ height:"80px", borderRadius:"6px", backgroundColor:"#fff", padding:"4px", flexShrink:0 }}/>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
            <span style={{ fontSize:"18px", fontWeight:800, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase" }}>Fichier NERE</span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>Registre national des entreprises</span>
          </div>
        </div>

        {/* Liens */}
        <div className="nav-pill">
          {NAV_LINKS.map(l => (
            <button key={l.path} className={`nav-btn ${l.path==="/rechercheacc"?"active":""}`}
              onClick={() => navigate(l.path)}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ position:"relative", flexShrink:0 }}>
          {user ? (
            <>
              <div className="u-chip" onClick={() => setMenuOpen(o => !o)}>
                <div className="u-avatar">{initiales}</div>
                <span style={{ maxWidth:"100px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {user.prenom} {user.nom}
                </span>
                <span style={{ fontSize:"9px", opacity:0.5 }}>▾</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={() => setMenuOpen(false)}/>
                  <div className="rech-dd" onClick={e => e.stopPropagation()}>
                    <div className="dd-head">
                      <div className="dd-name">{user.prenom} {user.nom}</div>
                      <div className="dd-email">{user.email || "—"}</div>
                      <div className="dd-role">
                        {user.role==="admin"?" Administrateur":user.role==="manager"?" Gestionnaire":" Abonné"}
                      </div>
                    </div>
                    <div style={{ padding:"6px 0" }}>
                      {[
                        { label:" Mon Profil",     path:"/profil"   },
                        { label:" Mon Abonnement", path:"/formules" },
                      ].map(item => (
                        <div key={item.label} className="dd-item"
                          onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                          {item.label}
                        </div>
                      ))}
                      {user.role==="admin" && (
                        <div className="dd-item" onClick={() => { navigate("/admin"); setMenuOpen(false); }}>🛡 Tableau de bord</div>
                      )}
                      {user.role==="manager" && (
                        <div className="dd-item" onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}> Tableau de bord</div>
                      )}
                      <div className="dd-sep"/>
                      <div className="dd-item dd-danger" onClick={handleLogout}> Déconnexion</div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ display:"flex", gap:"8px" }}>
              <button className="btn-out" onClick={() => navigate("/connexion")}>Connexion</button>
              <button className="btn-in"  onClick={() => navigate("/inscription")}>S'inscrire</button>
            </div>
          )}
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <div className="rech-hero">
        <div className="rech-badge">
          <div className="dot"/>
          Moteur de recherche NERE
        </div>
        <h1 className="rech-title">
          Trouvez une entreprise<br/>
          au <span className="red">Burkina</span> <span className="green">Faso</span>
        </h1>
        <p className="rech-sub">
          Interrogez le registre national des entreprises selon vos besoins.<br/>
          Choisissez votre mode de recherche ci-dessous.
        </p>
      </div>

      {/* ══ STATS ══ */}
      <div className="stats-band">
        {[
          { num:"233 000+", label:"Entreprises enregistrées" },
          { num:"17",       label:"Régions couvertes"        },
          { num:"24h/24",   label:"Accès en ligne"           },
          { num:"100%",     label:"Données officielles CCI-BF"},
        ].map(s => (
          <div key={s.label} className="stat-item">
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ══ CARTES ══ */}
      <div className="rech-cards">
        {CARDS.map(card => (
          <div key={card.key} className="rech-card"
            style={{ borderColor: hover===card.key ? card.accent : "#e8e8e8" }}
            onMouseEnter={() => setHover(card.key)}
            onMouseLeave={() => setHover(null)}
            onClick={() => navigate(card.path)}>

            

           

            {/* Titre */}
            <div className="card-title">{card.titre}</div>

            {/* Description */}
            <div className="card-desc">{card.desc}</div>

            {/* Fonctionnalités */}
            <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:"8px", margin:"4px 0" }}>
              {(card.key === "multicritere" ? [
                "Filtres par région, secteur, forme juridique",
                "Statistiques entreprises et associations",
                "Export PDF des résultats",
                "Historique des demandes",
              ] : [
                "Recherche par RCCM, IFU ou dénomination",
                "Résultats instantanés",
                "Informations complètes de l'entreprise",
                "Déduction uniquement si résultats trouvés",
              ]).map((f, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px",
                  fontSize:"12px", color:"#444", textAlign:"left" }}>
                  <span style={{ color:card.accent, fontWeight:700, flexShrink:0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>

            {/* Bouton */}
            <button className="card-btn" style={{ background: card.accent }}>
              Accéder
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

          </div>
        ))}
      </div>

      {/* ══ NOTE TARIFICATION ══ */}
      <div style={{ maxWidth:"760px", margin:"0 auto 56px", padding:"0 24px" }}>
        <div style={{ background:"#F5FAF7", border:"1px solid #C0E8D0", borderRadius:"16px",
          padding:"24px 28px", display:"flex", alignItems:"flex-start", gap:"16px" }}>
          <span style={{ fontSize:"28px", flexShrink:0 }}></span>
          <div>
            <div style={{ fontWeight:700, fontSize:"14px", color:"#0A2410", marginBottom:"8px" }}>
              Tarification par requête
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
              {[
                { label:"Liste d'entreprises / associations", prix:"250 FCFA",    color:"#00904C" },
                { label:"Fiche entreprise",    prix:"1 000 FCFA",  color:"#1E60CC" },
                { label:"Statistiques",        prix:"5 000 FCFA",  color:"#D4A830" },
                { label:"Repertoire thématique",  prix:"5 000 FCFA",  color:"#ED1C24" },
              ].map(t => (
                <div key={t.label} style={{ display:"flex", alignItems:"center", gap:"8px",
                  background:"#fff", border:`1px solid ${t.color}33`,
                  borderRadius:"8px", padding:"7px 14px" }}>
                  <span style={{ fontSize:"12px", color:"#555", fontWeight:600 }}>{t.label}</span>
                  <span style={{ fontSize:"12px", fontWeight:800, color:t.color }}>{t.prix}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:"12px", color:"#6B9A7A", marginTop:"10px" }}>
               Aucune déduction si la recherche ne retourne aucun résultat.
            </div>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer className="rech-footer">
        <div>
          <div className="f-logo">NERE <span>CCI-BF</span></div>
          <div className="f-copy">Chambre de Commerce et d'Industrie du Burkina Faso</div>
        </div>
        <div className="f-links">
          <span className="f-link">Confidentialité</span>
          <span className="f-link" onClick={() => navigate("/contact")}>Contact</span>
          <span className="f-link">Support</span>
        </div>
      </footer>

    </div>
  );
}