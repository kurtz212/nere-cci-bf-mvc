import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoNERE from "../../assets/nere.png";
import "../../styles/dashboard.css";

/* ══════════════════════════════════════════
   DÉFINITION DES PACKS
   - Pack Essentiel  : crédit = 5 000 FCFA exactement
   - Pack Pro        : crédit entre 5 001 et 14 999 FCFA
   - Pack Entreprise : crédit ≥ 15 000 FCFA (montant flexible)
══════════════════════════════════════════ */
const PACKS = [
  {
    id: "pack1", nom: "Pack Essentiel", niveau: 1,
    prix: 5000,
    description: "Créditez votre compte avec exactement 5 000 FCFA. Déduction directe à chaque requête.",
    flexible: false,
    couleur: "#22A052",
    bgNiveau: "#e8f8ef",
    avantages: [
      { label: "Recherche multicritère",            ok: true  },
      { label: "Demandes de données (listes, fiches, stats)", ok: true  },
      { label: "Chat avec un agent CCI-BF",         ok: true  },
      { label: "Publications — Communiqués",         ok: true  },
      { label: "Publications — Notes techniques",    ok: false },
      { label: "Publications — Classements",         ok: false },
      { label: "Publications — Rapports / Études",   ok: false },
      { label: "Téléchargement PDF",                 ok: false },
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
      { label: "Recherche multicritère",            ok: true  },
      { label: "Demandes de données (listes, fiches, stats)", ok: true  },
      { label: "Chat avec un agent CCI-BF",         ok: true  },
      { label: "Publications — Communiqués",         ok: true  },
      { label: "Publications — Notes techniques",    ok: true  },
      { label: "Publications — Classements",         ok: true  },
      { label: "Publications — Rapports / Études",   ok: false },
      { label: "Téléchargement PDF",                 ok: true  },
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
      { label: "Recherche multicritère",            ok: true  },
      { label: "Demandes de données (listes, fiches, stats)", ok: true  },
      { label: "Chat avec un agent CCI-BF",         ok: true  },
      { label: "Publications — Communiqués",         ok: true  },
      { label: "Publications — Notes techniques",    ok: true  },
      { label: "Publications — Classements",         ok: true  },
      { label: "Publications — Rapports / Études",   ok: true  },
      { label: "Téléchargement PDF",                 ok: true  },
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
  { q: "Le chat est-il accessible à tous ?",
    r: "Oui, le chat avec les agents CCI-BF est accessible à tous les abonnés, quel que soit le pack choisi." },
  { q: "Les prix sont-ils TTC ?",
    r: "Oui, tous les montants affichés sont en FCFA TTC, toutes taxes comprises." },
];

export default function Formules() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [hover, setHover]               = useState(null);
  const [showModal, setShowModal]       = useState(null); // id du pack flexible ouvert
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
    const pack   = PACKS.find(p => p.id === showModal);
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
      <style>{`* { font-family: Arial, Helvetica, sans-serif !important; }`}</style>

      {/* ══ NAVBAR ══ */}
      <nav className="dash-navbar">
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <img src={logoNERE} alt="NERE"
            style={{ height:"90px", width:"auto", borderRadius:"6px",
              flexShrink:0, backgroundColor:"#fff", padding:"4px" }}/>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.4 }}>
            <span style={{ fontSize:"11px", fontWeight:800, color:"#fff",
              letterSpacing:"0.06em", textTransform:"uppercase" }}>Fichier NERE</span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.85)" }}>
              Registre national des entreprises<br/>Du Burkina Faso
            </span>
          </div>
        </div>

        <div className="dash-nav-links">
          {[
            { label:"Accueil",      path:"/" },
            { label:"Publications", path:"/publications" },
            { label:"Recherche",    path:"/rechercheacc" },
            { label:"Contact",      path:"/contact" },
            { label:"Chat",         path:"/chat" },
          ].map(l => (
            <span key={l.label} className="dash-nav-link"
              onClick={() => navigate(l.path)}>{l.label}</span>
          ))}
          <span className="dash-nav-link active">Formules</span>
        </div>

        <div className="dash-nav-actions">
          {user ? (
            <div style={{ position:"relative" }}>
              <div className="user-chip" onClick={() => setMenuOpen(o => !o)}>
                <div className="user-avatar">{initiales}</div>
                <span>{user.prenom} {user.nom}</span>
                <span style={{ fontSize:"10px", opacity:0.5, marginLeft:"2px" }}>▾</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={() => setMenuOpen(false)}/>
                  <div style={{ position:"absolute", zIndex:9999, background:"#00904C",
                    top:"calc(100% + 8px)", right:0, borderRadius:"12px",
                    border:"1px solid rgba(255,255,255,0.15)", minWidth:"200px",
                    overflow:"hidden", boxShadow:"0 10px 30px rgba(0,0,0,0.25)" }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontWeight:700, color:"#fff", fontSize:"14px" }}>{user.prenom} {user.nom}</div>
                      <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>{user.email}</div>
                    </div>
                    {[
                      { label:"Mon Profil",     path:"/profil" },
                      { label:"Mon Abonnement", path:"/paiement" },
                    ].map(i => (
                      <div key={i.label}
                        style={{ padding:"11px 16px", color:"rgba(255,255,255,0.85)", fontSize:"13px", cursor:"pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        onClick={() => { navigate(i.path); setMenuOpen(false); }}>
                        {i.label}
                      </div>
                    ))}
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ padding:"11px 16px", color:"#FF8080", fontSize:"13px",
                        cursor:"pointer", fontWeight:600 }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,107,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        onClick={handleLogout}>
                        Déconnexion
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button className="btn-nav-outline" onClick={() => navigate("/connexion")}>Connexion</button>
              <button className="btn-nav-primary" onClick={() => navigate("/inscription")}>S'inscrire</button>
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
          ✓ Chat avec agents CCI-BF inclus dans tous les packs
        </p>
      </div>

      {/* ══ SOLDE ACTUEL ══ */}
      {user && soldeActuel && (
        <div style={{ padding:"24px 48px 0", maxWidth:"1080px", margin:"0 auto" }}>
          <div style={{ background:"rgba(0,144,76,0.05)", border:"1px solid rgba(0,144,76,0.15)",
            borderRadius:"14px", padding:"16px 24px",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"13px", color:"#888" }}>
              Votre solde actuel
            </span>
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

             

              {/* En-tête */}
              <div style={{ marginBottom:"20px" }}>
                <div style={{ display:"inline-flex", alignItems:"center",
                  justifyContent:"center", width:"36px", height:"36px",
                  borderRadius:"10px", fontWeight:900, fontSize:"15px",
                  marginBottom:"12px",
                  background: pack.bgNiveau, color: pack.couleur }}>
                  {pack.niveau}
                </div>
                <div style={{ fontSize:"20px", fontWeight:900, color:"#111", marginBottom:"6px" }}>
                  {pack.nom}
                </div>
                <p style={{ fontSize:"12px", color:"#888", lineHeight:1.6, margin:0 }}>
                  {pack.description}
                </p>
              </div>

              {/* Prix */}
              <div style={{ padding:"16px 0", borderTop:"1px solid #f0f0f0",
                borderBottom:"1px solid #f0f0f0", marginBottom:"20px" }}>
                <div style={{ display:"flex", alignItems:"flex-end", gap:"6px" }}>
                  <span style={{ fontSize:"38px", fontWeight:900,
                    color: pack.couleur, lineHeight:1 }}>
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

              {/* Avantages */}
              <div style={{ display:"flex", flexDirection:"column",
                gap:"9px", marginBottom:"24px" }}>
                {pack.avantages.map((av, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start",
                    gap:"8px", fontSize:"12px",
                    color: av.ok ? "#0A2410" : "#bbb" }}>
                    <span style={{ flexShrink:0, fontSize:"13px",
                      color: av.ok ? pack.couleur : "#ddd" }}>
                      {av.ok ? "✓" : "✕"}
                    </span>
                    {av.label}
                  </div>
                ))}
              </div>

              {/* Bouton */}
              <button onClick={() => handleChoisir(pack)}
                style={{ width:"100%", padding:"13px", borderRadius:"10px",
                  border:"none", cursor:"pointer", fontWeight:700,
                  fontSize:"14px", transition:"all 0.2s",
                  background: pack.niveau === 3
                    ? "linear-gradient(135deg,#f5c842,#d4a827)"
                    : pack.populaire ? pack.couleur : "#f5f5f5",
                  color: pack.niveau === 3 ? "#5a3d00" :
                    pack.populaire ? "#fff" : "#333" }}
                onMouseEnter={e => {
                  if (pack.populaire) e.currentTarget.style.background = "#007A3F";
                }}
                onMouseLeave={e => {
                  if (pack.populaire) e.currentTarget.style.background = pack.couleur;
                }}>
                {pack.flexible ? `Choisir le montant →` : `Souscrire au ${pack.nom}`}
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
          <span style={{ fontSize:"20px" }}></span>
          <div>
            <div style={{ fontWeight:700, fontSize:"13px", color:"#00904C" }}>
              Chat avec les agents CCI-BF — inclus dans tous les packs
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
          { label:"Renouvellement par recharge",  vert:true  },
          { label:"Upgrade possible à tout moment", vert:true  },
          { label:"Paiement en agence CCI-BF",    vert:false },
          { label:"Activation sous 24h",           vert:true  },
          { label:"Mobile Money accepté",          vert:true  },
        ].map(t => (
          <span key={t.label} style={{ padding:"6px 14px", borderRadius:"100px",
            fontSize:"12px", fontWeight:600,
            background: t.vert ? "#e8f8ef" : "#fff0f0",
            color:      t.vert ? "#00904C" : "#ED1C24" }}>
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
                    color:"#fff", fontWeight:700, fontSize:"12px" }}>
                    {p.nom}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PACKS[0].avantages.map((av, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f0f0f0",
                  background: i % 2 === 0 ? "#fff" : "#FAFCFB" }}>
                  <td style={{ padding:"12px 20px", color:"#333", fontWeight:500 }}>
                    {av.label}
                  </td>
                  {PACKS.map(p => (
                    <td key={p.id} style={{ padding:"12px 16px", textAlign:"center" }}>
                      <span style={{ fontSize:"16px",
                        color: p.avantages[i].ok ? p.couleur : "#ddd" }}>
                        {p.avantages[i].ok ? "✓" : "✕"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ background:"#f8fff8" }}>
                <td style={{ padding:"12px 20px", fontWeight:700, color:"#333" }}>
                  Crédit
                </td>
                <td style={{ padding:"12px 16px", textAlign:"center",
                  fontWeight:700, color:"#22A052" }}>5 000 FCFA</td>
                <td style={{ padding:"12px 16px", textAlign:"center",
                  fontWeight:700, color:"#00904C" }}>5 001 – 14 999 FCFA</td>
                <td style={{ padding:"12px 16px", textAlign:"center",
                  fontWeight:700, color:"#b8860b" }}>≥ 15 000 FCFA</td>
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
              background: packOuvert.bgNiveau, display:"flex",
              alignItems:"center", justifyContent:"center",
              fontSize:"24px", margin:"0 auto 16px",
              color: packOuvert.couleur, fontWeight:900 }}>
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

            {/* Montants rapides */}
            <div style={{ display:"flex", gap:"8px", justifyContent:"center",
              marginBottom:"20px", flexWrap:"wrap" }}>
              {(packOuvert.id === "pack2"
                ? [6000, 8000, 10000, 12000]
                : [15000, 20000, 30000, 50000]
              ).map(m => (
                <button key={m} onClick={() => setMontantSaisi(String(m))}
                  style={{ padding:"6px 14px", borderRadius:"8px",
                    border:`1.5px solid ${Number(montantSaisi)===m ? packOuvert.couleur : "#e8e8e8"}`,
                    background: Number(montantSaisi)===m ? packOuvert.bgNiveau : "#fff",
                    color: Number(montantSaisi)===m ? packOuvert.couleur : "#888",
                    fontWeight:700, fontSize:"12px", cursor:"pointer" }}>
                  {m.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>

            <button onClick={confirmerModal}
              style={{ width:"100%", padding:"14px", borderRadius:"12px",
                background: packOuvert.niveau === 3
                  ? "linear-gradient(135deg,#f5c842,#d4a827)"
                  : packOuvert.couleur,
                border:"none",
                color: packOuvert.niveau === 3 ? "#5a3d00" : "#fff",
                fontWeight:800, fontSize:"15px", cursor:"pointer",
                marginBottom:"10px" }}>
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