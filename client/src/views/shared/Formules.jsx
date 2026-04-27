import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoNERE from "../../assets/nere.png";
import "../../styles/dashboard.css";

const PACKS = [
  {
    id: "pack1", nom: "Pack Essentiel", niveau: 1,
    prix: 5000,
    description: "Créditez votre compte avec exactement 5 000 FCFA. Déduction directe à chaque requête.",
    flexible: false,
    couleur: "#22A052",
    bgNiveau: "#e8f8ef",
    avantages: [
      { label: "Recherche multicritère",                      ok: true  },
      { label: "Demandes de données (listes, fiches, stats)", ok: true  },
      { label: "Converser avec un agent CCI-BF",              ok: true  },
      { label: "Publications — Communiqués",                  ok: true  },
      { label: "Publications — Notes techniques",             ok: false },
      { label: "Publications — Classements",                  ok: false },
      { label: "Publications — Rapports / Études",            ok: false },
      { label: "Téléchargement PDF",                         ok: false },
    ],
  },
  {
    id: "pack2", nom: "Pack Professionnel", niveau: 2, populaire: true,
    prixMin: 5001, prixMax: 14999,
    prix: 10000,
    description: "Créditez votre compte entre 5 001 et 14 999 FCFA. Accès étendu aux publications.",
    flexible: true, flexibleMin: 5001, flexibleMax: 14999,
    couleur: "#00904C",
    bgNiveau: "#d0f0e0",
    avantages: [
      { label: "Recherche multicritère",                      ok: true  },
      { label: "Demandes de données (listes, fiches, stats)", ok: true  },
      { label: "Converser avec un agent CCI-BF",              ok: true  },
      { label: "Publications — Communiqués",                  ok: true  },
      { label: "Publications — Notes techniques",             ok: true  },
      { label: "Publications — Classements",                  ok: true  },
      { label: "Publications — Rapports / Études",            ok: false },
      { label: "Téléchargement PDF",                         ok: true  },
    ],
  },
  {
    id: "pack3", nom: "Pack Entreprise", niveau: 3,
    prixMin: 15000,
    prix: 15000,
    description: "Créditez votre compte avec 15 000 FCFA ou plus. Accès illimité à toute la plateforme.",
    flexible: true, flexibleMin: 15000,
    couleur: "#b8860b",
    bgNiveau: "#fff3cd",
    avantages: [
      { label: "Recherche multicritère",                      ok: true  },
      { label: "Demandes de données (listes, fiches, stats)", ok: true  },
      { label: "Converser avec un agent CCI-BF",              ok: true  },
      { label: "Publications — Communiqués",                  ok: true  },
      { label: "Publications — Notes techniques",             ok: true  },
      { label: "Publications — Classements",                  ok: true  },
      { label: "Publications — Rapports / Études",            ok: true  },
      { label: "Téléchargement PDF",                         ok: true  },
    ],
  },
];

const FAQS = [
  { q: "Comment fonctionne le système de crédit ?",
    r: "Vous créditez votre compte d'un montant selon le pack choisi. Chaque recherche ou demande de données déduit automatiquement le coût correspondant de votre solde." },
  { q: "Que se passe-t-il quand mon crédit est épuisé ?",
    r: "Votre accès aux données est suspendu jusqu'à ce que vous rechargiez votre compte. Vous pouvez toujours consulter l'historique de vos demandes." },
  { q: "Puis-je changer de pack ?",
    r: "Oui, vous pouvez recharger votre compte avec un montant supérieur à tout moment. Le niveau d'accès est mis à jour immédiatement selon le solde disponible." },
  { q: "Comment payer ?",
    r: "Le paiement s'effectue en agence CCI-BF ou par mobile money. Après validation, votre compte est crédité sous 24h ouvrables." },
  { q: "La messagerie est-elle accessible à tous ?",
    r: "Oui, la messagerie avec les agents CCI-BF est accessible à tous les abonnés, quel que soit le pack choisi." },
  { q: "Les prix sont-ils TTC ?",
    r: "Oui, tous les montants affichés sont en FCFA TTC, toutes taxes comprises." },
];

const NAV_LINKS = [
  { label:"Accueil",      path:"/",                key:"accueil"      },
  { label:"Publications", path:"/publications",     key:"publications" },
  { label:"Contact",      path:"/contact",          key:"contact"      },
  { label:"Messages",     path:"/chat",             key:"messages"     },
];

export default function Formules() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [hover, setHover]               = useState(null);
  const [showModal, setShowModal]       = useState(null);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [erreurModal, setErreurModal]   = useState("");
  const [soldeActuel, setSoldeActuel]   = useState(null);
  const [menuOpen, setMenuOpen]         = useState(false);

  const initiales = user ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase() : "";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/abonnements/mon-solde", { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setSoldeActuel(d.data); })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    window.location.href = "/";
  };

  const getSoldeColor = (s) => s < 2000 ? "#ED1C24" : s < 5000 ? "#b8860b" : "#00904C";

  const handleChoisir = (pack) => {
    if (!user) { navigate("/inscription"); return; }
    if (pack.flexible) {
      setMontantSaisi(String(pack.prix));
      setErreurModal("");
      setShowModal(pack.id);
    } else {
      navigate("/paiement", { state:{ pack, montant: pack.prix } });
    }
  };

  const confirmerModal = () => {
    const pack    = PACKS.find(p => p.id === showModal);
    const montant = Number(montantSaisi);
    if (!pack) return;
    if (Number.isNaN(montant) || montant < pack.flexibleMin) {
      setErreurModal(`Montant minimum : ${pack.flexibleMin.toLocaleString("fr-FR")} FCFA`);
      return;
    }
    if (pack.flexibleMax && montant > pack.flexibleMax) {
      setErreurModal(`Montant maximum pour ce pack : ${pack.flexibleMax.toLocaleString("fr-FR")} FCFA`);
      return;
    }
    setErreurModal("");
    setShowModal(null);
    navigate("/paiement", { state:{ pack, montant } });
  };

  const packOuvert = PACKS.find(p => p.id === showModal);

  return (
    <div style={{ fontFamily:"Arial, Helvetica, sans-serif", background:"#fff",
      color:"#111", minHeight:"100vh" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }

        /* ── NAVBAR identique à Home.jsx ── */
        .formules-navbar {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 120px;
          background: #00904C;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
        }
        .formules-navbar .logo-zone {
          display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        }
        .formules-navbar .nav-center {
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 16px;
        }
        .formules-navbar .nav-item {
          padding: 7px 16px; border-radius: 100px;
          font-size: 20px; font-weight: 600;
          color: rgba(255,255,255,0.75); cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
          border: none; background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }
        .formules-navbar .nav-item:hover { color:#fff; background:rgba(255,255,255,0.1); }
        .formules-navbar .nav-item.active {
          color:#0A3D1F; background:#4DC97A; font-weight:700;
          box-shadow:0 2px 10px rgba(77,201,122,0.35);
        }
        .formules-navbar .nav-actions {
          display:flex; align-items:center; gap:4px; flex-shrink:0;
        }
        .formules-navbar .user-chip {
          display:flex; align-items:center; gap:8px;
          padding:5px 12px 5px 5px;
          background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2);
          border-radius:100px; cursor:pointer; transition:all 0.2s;
          color:#fff; font-size:13px; font-weight:600;
        }
        .formules-navbar .user-chip:hover { background:rgba(255,255,255,0.18); }
        .formules-navbar .user-avatar {
          width:30px; height:30px; border-radius:50%;
          background:#4DC97A; color:#0A3D1F;
          display:flex; align-items:center; justify-content:center;
          font-weight:800; font-size:12px; flex-shrink:0;
        }
        .formules-navbar .btn-connexion {
          padding:7px 18px; border-radius:100px;
          border:1.5px solid rgba(255,255,255,0.35);
          background:transparent; color:#fff;
          font-size:13px; font-weight:600; cursor:pointer;
          transition:all 0.2s; font-family:Arial,Helvetica,sans-serif;
        }
        .formules-navbar .btn-connexion:hover { background:rgba(255,255,255,0.12); }
        .formules-navbar .btn-inscription {
          padding:7px 18px; border-radius:100px; border:none;
          background:#4DC97A; color:#0A3D1F;
          font-size:13px; font-weight:700; cursor:pointer;
          transition:all 0.2s; font-family:Arial,Helvetica,sans-serif;
        }
        .formules-navbar .btn-inscription:hover {
          background:#5DD98A; transform:translateY(-1px);
          box-shadow:0 4px 14px rgba(77,201,122,0.35);
        }
        .formules-dropdown {
          position:absolute; z-index:9999;
          top:calc(100% + 10px); right:0;
          background:#fff; border-radius:16px;
          border:1px solid #E2EDE6; min-width:220px;
          overflow:hidden; box-shadow:0 16px 48px rgba(0,0,0,0.14);
          animation:dropInF 0.18s ease;
        }
        @keyframes dropInF {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .formules-dropdown .dd-head {
          padding:16px 18px 12px; border-bottom:1px solid #F0F4F1;
          background:linear-gradient(135deg,#F5FAF7,#fff);
        }
        .formules-dropdown .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
        .formules-dropdown .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
        .formules-dropdown .dd-role  {
          display:inline-flex; align-items:center; gap:5px; margin-top:6px;
          background:#E8F5EE; color:#00904C; border-radius:100px; padding:3px 10px;
          font-size:10px; font-weight:700; text-transform:uppercase;
        }
        .formules-dropdown .dd-item {
          padding:11px 18px; font-size:13px; color:#0A3D1F;
          cursor:pointer; transition:background 0.15s;
        }
        .formules-dropdown .dd-item:hover { background:#F5FAF7; }
        .formules-dropdown .dd-danger { color:#CC3333; }
        .formules-dropdown .dd-danger:hover { background:#FFF0F0 !important; }
        .formules-dropdown .dd-sep { height:1px; background:#F0F4F1; margin:6px 0; }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav className="formules-navbar">

        {/* Logo */}
        <div className="logo-zone">
          <img src={logoNERE} alt="NERE"
            style={{ height:"80px", width:"auto", borderRadius:"8px",
              backgroundColor:"#fff", padding:"4px", flexShrink:0 }}/>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
            <span style={{ fontSize:"18px", fontWeight:800, color:"#fff",
              letterSpacing:"0.08em", textTransform:"uppercase" }}>
              Fichier NERE
            </span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>
              Registre national des entreprises
            </span>
          </div>
        </div>

        {/* Liens */}
        <div className="nav-center">
          {NAV_LINKS.map(link => (
            <button key={link.key}
              className={`nav-item ${link.key === "formules" ? "active" : ""}`}
              onClick={() => navigate(link.path)}>
              {link.label}
            </button>
          ))}
          <button className="nav-item active">Formules</button>
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {user ? (
            <div style={{ position:"relative" }}>
              <div className="user-chip" onClick={() => setMenuOpen(o => !o)}>
                <div className="user-avatar">{initiales}</div>
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
                  <div className="formules-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="dd-head">
                      <div className="dd-name">{user.prenom} {user.nom}</div>
                      <div className="dd-email">{user.email || "—"}</div>
                      <div className="dd-role">
                        {user.role === "admin"   ? "🛡 Administrateur" :
                         user.role === "manager" ? "⚙️ Gestionnaire"   : "👤 Abonné"}
                      </div>
                    </div>
                    <div style={{ padding:"6px 0" }}>
                      {[
                        { label:"👤 Mon Profil",     path:"/profil"   },
                        { label:"💳 Mon Abonnement", path:"/paiement" },
                      ].map(item => (
                        <div key={item.label} className="dd-item"
                          onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                          {item.label}
                        </div>
                      ))}
                      {user.role === "admin" && (
                        <div className="dd-item"
                          onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                          🛡 Tableau de bord
                        </div>
                      )}
                      {user.role === "manager" && (
                        <div className="dd-item"
                          onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>
                          ⚙️ Tableau de bord
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
              <button className="btn-connexion"
                onClick={() => navigate("/connexion")}>Connexion</button>
              <button className="btn-inscription"
                onClick={() => navigate("/inscription")}>S'inscrire</button>
            </>
          )}
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <div style={{ textAlign:"center", padding:"56px 48px 36px",
        borderBottom:"1px solid #f0f0f0" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"6px",
          background:"#e8f8ef", border:"1px solid #c0e8d0",
          borderRadius:"100px", padding:"5px 16px", fontSize:"11px",
          fontWeight:700, color:"#00904C", marginBottom:"20px",
          textTransform:"uppercase", letterSpacing:"0.08em" }}>
          <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#00904C" }}/>
          Base de données CCI-BF
        </div>
        <h1 style={{ fontSize:"clamp(28px,5vw,42px)", fontWeight:900,
          color:"#0a0a0a", marginBottom:"14px", lineHeight:1.2 }}>
          Choisissez votre <span style={{ color:"#00904C" }}>formule</span>
        </h1>
        <p style={{ color:"#777", fontSize:"15px", maxWidth:"520px",
          margin:"0 auto 12px", lineHeight:1.8 }}>
          Accédez à la base de données NERE selon vos besoins.<br/>
          Packs prépayés — déduction directe à chaque requête.
        </p>
        <p style={{ color:"#00904C", fontSize:"13px", fontWeight:700 }}>
          ✓ Converser avec agents CCI-BF inclus dans tous les packs
        </p>
      </div>

      {/* ══ SOLDE ACTUEL ══ */}
      {user && soldeActuel && (
        <div style={{ padding:"24px 48px 0", maxWidth:"1080px", margin:"0 auto" }}>
          <div style={{ background:"rgba(0,144,76,0.05)", border:"1px solid rgba(0,144,76,0.15)",
            borderRadius:"14px", padding:"16px 24px",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"13px", color:"#888" }}>Votre solde actuel</span>
            <span style={{ fontSize:"22px", fontWeight:900,
              color: getSoldeColor(soldeActuel.solde) }}>
              {soldeActuel.solde?.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>
      )}

      {/* ══ GRILLE PACKS ══ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))",
        gap:"24px", padding:"40px 48px 0", maxWidth:"1080px", margin:"0 auto" }}>
        {PACKS.map(pack => {
          const isHover = hover === pack.id;
          return (
            <div key={pack.id}
              onMouseEnter={() => setHover(pack.id)}
              onMouseLeave={() => setHover(null)}
              style={{ borderRadius:"18px", position:"relative",
                border: pack.populaire ? `2px solid ${pack.couleur}` : "1.5px solid #e8e8e8",
                background:"#fff", padding:"28px 24px",
                transition:"transform 0.2s, box-shadow 0.2s",
                transform: isHover ? "translateY(-6px)" : "translateY(0)",
                boxShadow: isHover ? "0 16px 40px rgba(0,0,0,0.09)" :
                  pack.populaire ? `0 4px 20px rgba(0,144,76,0.1)` : "none" }}>

              {/* Badge populaire */}
              {pack.populaire && (
                <div style={{ position:"absolute", top:"-12px", left:"50%",
                  transform:"translateX(-50%)",
                  background:"#00904C", color:"#fff",
                  fontSize:"10px", fontWeight:800, padding:"4px 14px",
                  borderRadius:"100px", letterSpacing:"0.06em",
                  textTransform:"uppercase", whiteSpace:"nowrap" }}>
                  ⭐ Le plus populaire
                </div>
              )}

              <div style={{ marginBottom:"20px" }}>
                <div style={{ display:"inline-flex", alignItems:"center",
                  justifyContent:"center", width:"36px", height:"36px",
                  borderRadius:"10px", fontWeight:900, fontSize:"15px",
                  marginBottom:"12px", background:pack.bgNiveau, color:pack.couleur }}>
                  {pack.niveau}
                </div>
                <div style={{ fontSize:"20px", fontWeight:900, color:"#111", marginBottom:"6px" }}>
                  {pack.nom}
                </div>
                <p style={{ fontSize:"12px", color:"#888", lineHeight:1.6, margin:0 }}>
                  {pack.description}
                </p>
              </div>

              <div style={{ padding:"16px 0", borderTop:"1px solid #f0f0f0",
                borderBottom:"1px solid #f0f0f0", marginBottom:"20px" }}>
                <div style={{ display:"flex", alignItems:"flex-end", gap:"6px" }}>
                  <span style={{ fontSize:"38px", fontWeight:900,
                    color:pack.couleur, lineHeight:1 }}>
                    {pack.prix.toLocaleString("fr-FR")}{pack.flexible ? "+" : ""}
                  </span>
                  <div style={{ paddingBottom:"6px" }}>
                    <div style={{ fontSize:"13px", fontWeight:700, color:"#aaa" }}>FCFA</div>
                    {pack.flexible && (
                      <div style={{ fontSize:"11px", color:"#bbb" }}>
                        {pack.flexibleMax
                          ? `jusqu'à ${pack.flexibleMax.toLocaleString("fr-FR")} FCFA`
                          : "et plus"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column",
                gap:"9px", marginBottom:"24px" }}>
                {pack.avantages.map((av, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start",
                    gap:"8px", fontSize:"12px", color:av.ok ? "#0A2410" : "#bbb" }}>
                    <span style={{ flexShrink:0, fontSize:"13px",
                      color:av.ok ? pack.couleur : "#ddd" }}>
                      {av.ok ? "✓" : "✕"}
                    </span>
                    {av.label}
                  </div>
                ))}
              </div>

              <button onClick={() => handleChoisir(pack)}
                style={{ width:"100%", padding:"13px", borderRadius:"10px",
                  border:"none", cursor:"pointer", fontWeight:700,
                  fontSize:"14px", transition:"all 0.2s",
                  background: pack.niveau === 3
                    ? "linear-gradient(135deg,#f5c842,#d4a827)"
                    : pack.populaire ? pack.couleur : "#f5f5f5",
                  color: pack.niveau === 3 ? "#5a3d00" :
                    pack.populaire ? "#fff" : "#333" }}>
                {pack.flexible ? "Choisir le montant →" : `Souscrire au ${pack.nom}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* ══ NOTE CHAT ══ */}
      <div style={{ maxWidth:"1080px", margin:"24px auto 0", padding:"0 48px" }}>
        <div style={{ background:"rgba(0,144,76,0.05)",
          border:"1px solid rgba(0,144,76,0.2)", borderRadius:"12px",
          padding:"14px 20px", display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"20px" }}>💬</span>
          <div>
            <div style={{ fontWeight:700, fontSize:"13px", color:"#00904C" }}>
              Converser avec les agents CCI-BF — inclus dans tous les packs
            </div>
            <div style={{ fontSize:"12px", color:"#6B9A7A", marginTop:"2px" }}>
              Posez vos questions directement à un agent, quelle que soit votre formule.
            </div>
          </div>
        </div>
      </div>

      {/* ══ TAGS ══ */}
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap",
        maxWidth:"1080px", margin:"20px auto 0", padding:"0 48px" }}>
        {[
          { label:"Renouvellement par recharge",    vert:true  },
          { label:"Upgrade possible à tout moment", vert:true  },
          { label:"Paiement en agence CCI-BF",      vert:false },
          { label:"Activation sous 24h",            vert:true  },
          { label:"Mobile Money accepté",           vert:true  },
        ].map(t => (
          <span key={t.label} style={{ padding:"6px 14px", borderRadius:"100px",
            fontSize:"12px", fontWeight:600,
            background:t.vert ? "#e8f8ef" : "#fff0f0",
            color:t.vert ? "#00904C" : "#ED1C24" }}>
            {t.label}
          </span>
        ))}
      </div>

      {/* ══ TABLEAU COMPARATIF ══ */}
      <div style={{ maxWidth:"1080px", margin:"48px auto 0", padding:"0 48px" }}>
        <h2 style={{ fontSize:"24px", fontWeight:900, color:"#111",
          textAlign:"center", marginBottom:"28px" }}>
          Comparatif des <span style={{ color:"#00904C" }}>fonctionnalités</span>
        </h2>
        <div style={{ background:"#fff", borderRadius:"16px",
          border:"1.5px solid #e8e8e8", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ background:"#00904C" }}>
                <th style={{ padding:"14px 20px", textAlign:"left",
                  color:"#fff", fontWeight:700, fontSize:"12px" }}>Fonctionnalité</th>
                {PACKS.map(p => (
                  <th key={p.id} style={{ padding:"14px 16px", textAlign:"center",
                    color:"#fff", fontWeight:700, fontSize:"12px" }}>{p.nom}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PACKS[0].avantages.map((av, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f0f0f0",
                  background:i%2===0 ? "#fff" : "#FAFCFB" }}>
                  <td style={{ padding:"12px 20px", color:"#333", fontWeight:500 }}>
                    {av.label}
                  </td>
                  {PACKS.map(p => (
                    <td key={p.id} style={{ padding:"12px 16px", textAlign:"center" }}>
                      <span style={{ fontSize:"16px",
                        color:p.avantages[i].ok ? p.couleur : "#ddd" }}>
                        {p.avantages[i].ok ? "✓" : "✕"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ background:"#f8fff8" }}>
                <td style={{ padding:"12px 20px", fontWeight:700, color:"#333" }}>Crédit</td>
                <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:"#22A052" }}>5 000 FCFA</td>
                <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:"#00904C" }}>5 001 – 14 999 FCFA</td>
                <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:"#b8860b" }}>≥ 15 000 FCFA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ FAQ ══ */}
      <div style={{ maxWidth:"680px", margin:"48px auto 0", padding:"0 48px" }}>
        <h2 style={{ fontSize:"24px", fontWeight:900, color:"#111",
          textAlign:"center", marginBottom:"28px" }}>
          Questions <span style={{ color:"#00904C" }}>fréquentes</span>
        </h2>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom:"1px solid #f0f0f0", padding:"18px 0" }}>
            <div style={{ fontWeight:700, fontSize:"14px", color:"#111",
              marginBottom:"7px", display:"flex", alignItems:"flex-start", gap:"10px" }}>
              <div style={{ width:"6px", height:"6px", borderRadius:"50%",
                background:"#00904C", marginTop:"5px", flexShrink:0 }}/>
              {faq.q}
            </div>
            <p style={{ fontSize:"13px", color:"#777", lineHeight:1.7,
              paddingLeft:"16px", margin:0 }}>{faq.r}</p>
          </div>
        ))}
      </div>

      {/* ══ CTA ══ */}
      <div style={{ textAlign:"center", padding:"56px 48px",
        marginTop:"48px", background:"#00904C" }}>
        <h2 style={{ fontSize:"28px", fontWeight:900, color:"#fff", marginBottom:"10px" }}>
          Besoin d'un devis personnalisé ?
        </h2>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"14px", marginBottom:"24px" }}>
          Pour les grandes structures ou les besoins spécifiques, contactez-nous directement.
        </p>
        <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
          <button onClick={() => navigate("/chat")}
            style={{ padding:"13px 28px", borderRadius:"10px", background:"#fff",
              color:"#00904C", fontWeight:700, fontSize:"14px", border:"none", cursor:"pointer" }}>
            Contacter un agent
          </button>
          <button onClick={() => navigate("/")}
            style={{ padding:"13px 28px", borderRadius:"10px",
              background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.85)",
              fontWeight:600, fontSize:"14px",
              border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer" }}>
            Retour à l'accueil
          </button>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ background:"#0A2410", padding:"24px 48px",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:"16px", fontWeight:800, color:"#fff" }}>
            NERE <span style={{ color:"#4DC97A" }}>CCI-BF</span>
          </div>
          <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginTop:"4px" }}>
            Chambre de Commerce et d'Industrie du Burkina Faso
          </div>
        </div>
        <div style={{ display:"flex", gap:"20px" }}>
          {["Confidentialité","Contact","Support"].map(l => (
            <span key={l} style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)",
              cursor:"pointer" }}
              onClick={() => l === "Contact" && navigate("/contact")}>
              {l}
            </span>
          ))}
        </div>
      </footer>

      {/* ══ MODAL MONTANT FLEXIBLE ══ */}
      {showModal && packOuvert && (
        <div style={{ position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.45)", display:"flex",
          alignItems:"center", justifyContent:"center", padding:"20px" }}
          onClick={() => setShowModal(null)}>
          <div style={{ background:"#fff", borderRadius:"20px", padding:"40px",
            maxWidth:"420px", width:"100%", textAlign:"center",
            boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:"56px", height:"56px", borderRadius:"16px",
              background:packOuvert.bgNiveau, display:"flex",
              alignItems:"center", justifyContent:"center",
              fontSize:"24px", margin:"0 auto 16px",
              color:packOuvert.couleur, fontWeight:900 }}>
              {packOuvert.niveau}
            </div>
            <h3 style={{ fontSize:"20px", fontWeight:900, color:"#111", marginBottom:"6px" }}>
              {packOuvert.nom}
            </h3>
            <p style={{ color:"#888", fontSize:"13px", lineHeight:1.7, marginBottom:"24px" }}>
              {packOuvert.flexibleMax
                ? `Saisissez un montant entre ${packOuvert.flexibleMin.toLocaleString("fr-FR")} et ${packOuvert.flexibleMax.toLocaleString("fr-FR")} FCFA`
                : `Saisissez un montant de ${packOuvert.flexibleMin.toLocaleString("fr-FR")} FCFA minimum`}
            </p>
            <div style={{ background:"#fafafa", border:"1px solid #f0f0f0",
              borderRadius:"12px", padding:"20px", marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#888", textTransform:"uppercase",
                letterSpacing:"0.08em", marginBottom:"10px" }}>
                Montant à créditer (FCFA)
              </label>
              <input type="number"
                min={packOuvert.flexibleMin}
                max={packOuvert.flexibleMax || undefined}
                step="1000"
                value={montantSaisi}
                onChange={e => { setMontantSaisi(e.target.value); setErreurModal(""); }}
                style={{ width:"100%", padding:"14px", borderRadius:"10px",
                  border:"1.5px solid #e0e0e0", background:"#fff",
                  color:"#111", fontSize:"22px", fontWeight:800,
                  textAlign:"center", outline:"none", boxSizing:"border-box" }}/>
              <p style={{ fontSize:"12px", color:"#bbb", marginTop:"8px", marginBottom:0 }}>
                Minimum : {packOuvert.flexibleMin.toLocaleString("fr-FR")} FCFA
                {packOuvert.flexibleMax && ` — Maximum : ${packOuvert.flexibleMax.toLocaleString("fr-FR")} FCFA`}
              </p>
              {erreurModal && (
                <p style={{ color:"#ED1C24", fontSize:"12px",
                  marginTop:"10px", fontWeight:700, marginBottom:0 }}>
                  {erreurModal}
                </p>
              )}
            </div>
            <div style={{ display:"flex", gap:"8px", justifyContent:"center",
              marginBottom:"20px", flexWrap:"wrap" }}>
              {(packOuvert.id === "pack2"
                ? [6000, 8000, 10000, 12000]
                : [15000, 20000, 30000, 50000]
              ).map(m => (
                <button key={m} onClick={() => setMontantSaisi(String(m))}
                  style={{ padding:"6px 14px", borderRadius:"8px",
                    border:`1.5px solid ${Number(montantSaisi)===m ? packOuvert.couleur : "#e8e8e8"}`,
                    background:Number(montantSaisi)===m ? packOuvert.bgNiveau : "#fff",
                    color:Number(montantSaisi)===m ? packOuvert.couleur : "#888",
                    fontWeight:700, fontSize:"12px", cursor:"pointer" }}>
                  {m.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>
            <button onClick={confirmerModal}
              style={{ width:"100%", padding:"14px", borderRadius:"12px",
                background:packOuvert.niveau === 3
                  ? "linear-gradient(135deg,#f5c842,#d4a827)"
                  : packOuvert.couleur,
                border:"none",
                color:packOuvert.niveau === 3 ? "#5a3d00" : "#fff",
                fontWeight:800, fontSize:"15px", cursor:"pointer", marginBottom:"10px" }}>
              Continuer avec {(Number(montantSaisi) || packOuvert.flexibleMin).toLocaleString("fr-FR")} FCFA →
            </button>
            <button onClick={() => setShowModal(null)}
              style={{ color:"#aaa", background:"none", border:"none",
                cursor:"pointer", fontSize:"13px" }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}