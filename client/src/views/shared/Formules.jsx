import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

// ── Définition des 3 packs NERE CCI-BF ──
const PACKS = [
  {
    id: "basic",
    nom: "Basic",
    icon: "🌱",
    couleur: "#4DC97A",
    fondCarte: "rgba(77,201,122,0.06)",
    bordure: "rgba(77,201,122,0.25)",
    prix: { mensuel: 5000, annuel: 50000 },
    reductionAnnuelle: 17,
    accroche: "Pour démarrer",
    description: "Idéal pour les petites structures souhaitant accéder aux listes d'entreprises.",
    accessLevel: 1,
    fonctionnalites: [
      { label: "Listes d'entreprises",          ok: true  },
      { label: "Listes d'associations pro.",     ok: true  },
      { label: "Fiches entreprises",             ok: false },
      { label: "Détails entreprises",            ok: false },
      { label: "Statistiques",                   ok: false },
      { label: "Recherche multicritères",        ok: true, note: "Basique" },
      { label: "Chat avec l'administration",     ok: false },
      { label: "Demandes de données",            ok: true, note: "Listes uniquement" },
      { label: "Export des résultats",           ok: false },
    ],
    quotas: {
      listes: 500,
      fiches: 0,
      stats: 0,
    },
  },
  {
    id: "pro",
    nom: "Pro",
    icon: "🚀",
    couleur: "#22A052",
    fondCarte: "rgba(34,160,82,0.08)",
    bordure: "rgba(34,160,82,0.35)",
    prix: { mensuel: 15000, annuel: 150000 },
    reductionAnnuelle: 17,
    accroche: "Le plus populaire",
    description: "Pour les professionnels ayant besoin de données détaillées sur les entreprises.",
    accessLevel: 2,
    populaire: true,
    fonctionnalites: [
      { label: "Listes d'entreprises",          ok: true  },
      { label: "Listes d'associations pro.",     ok: true  },
      { label: "Fiches entreprises",             ok: true  },
      { label: "Détails entreprises",            ok: true  },
      { label: "Statistiques",                   ok: false },
      { label: "Recherche multicritères",        ok: true, note: "Complète" },
      { label: "Chat avec l'administration",     ok: true  },
      { label: "Demandes de données",            ok: true, note: "Listes + Fiches + Détails" },
      { label: "Export des résultats",           ok: true, note: "CSV" },
    ],
    quotas: {
      listes: 2000,
      fiches: 50,
      stats: 0,
    },
  },
  {
    id: "premium",
    nom: "Premium",
    icon: "💎",
    couleur: "#D4A830",
    fondCarte: "rgba(212,168,48,0.06)",
    bordure: "rgba(212,168,48,0.3)",
    prix: { mensuel: 35000, annuel: 350000 },
    reductionAnnuelle: 17,
    accroche: "Accès illimité",
    description: "Accès complet à toute la base NERE, statistiques et données d'import/export.",
    accessLevel: 3,
    fonctionnalites: [
      { label: "Listes d'entreprises",          ok: true  },
      { label: "Listes d'associations pro.",     ok: true  },
      { label: "Fiches entreprises",             ok: true  },
      { label: "Détails entreprises",            ok: true  },
      { label: "Statistiques complètes",         ok: true  },
      { label: "Recherche multicritères",        ok: true, note: "Complète + export" },
      { label: "Chat prioritaire admin",         ok: true  },
      { label: "Toutes les demandes de données", ok: true  },
      { label: "Export PDF & CSV",               ok: true  },
    ],
    quotas: {
      listes: -1,   // -1 = illimité
      fiches: -1,
      stats: -1,
    },
  },
];

function formaterPrix(prix) {
  return prix.toLocaleString("fr-FR");
}

export default function Formules() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const [periode, setPeriode]   = useState("annuel"); // "mensuel" | "annuel"
  const [hover, setHover]       = useState(null);
  const [packsAPI, setPacksAPI] = useState([]);

  // Charger les packs depuis l'API
  useEffect(() => {
    fetch("http://localhost:5000/api/packs")
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setPacksAPI(data.data);
        }
      })
      .catch(() => {}); // Garder les PACKS locaux si API indisponible
  }, []);

  // Fusionner les prix API avec les données visuelles locales
  const packsAffiches = PACKS.map(p => {
    const apiPack = packsAPI.find(a =>
      a.nom?.toLowerCase() === p.nom?.toLowerCase() ||
      a.niveau === p.accessLevel
    );
    if (apiPack) {
      return {
        ...p,
        prix: {
          mensuel: apiPack.prix?.mensuel || p.prix.mensuel,
          annuel:  apiPack.prix?.annuel  || p.prix.annuel,
        },
      };
    }
    return p;
  });

  const handleChoisir = (pack) => {
    if (!user) { navigate("/inscription"); return; }
    navigate("/paiement", { state: { pack, periode } });
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif",
      background:"#0A3D1F", overflow:"hidden", position:"relative" }}>

      {/* Fond animé */}
      <div className="home-bg">
        <div className="blob blob1"/>
        <div className="blob blob2"/>
        <div className="blob blob3"/>
        <div className="grid-overlay"/>
      </div>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAVBAR */}
        <nav className="home-navbar">
          <div className="home-logo" onClick={() => navigate("/")}>
            <span className="logo-text">NERE</span>
            <span className="logo-sub">CCI-BF</span>
          </div>
          <div className="home-nav-links">
            <span className="home-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="home-nav-link" onClick={() => navigate("/publications")}>Publications</span>
            <span className="home-nav-link active">Formules</span>
          </div>
          <div className="home-nav-actions">
            {user ? (
              <div className="user-chip-home" onClick={() => navigate("/profil")}>
                <div className="user-avatar-home">{user.prenom?.[0]}{user.nom?.[0]}</div>
                <span>{user.prenom}</span>
              </div>
            ) : (<>
              <button className="btn-nav-outline" onClick={() => navigate("/connexion")}>
                Connexion
              </button>
              <button className="btn-nav-solid" onClick={() => navigate("/inscription")}>
                S'inscrire
              </button>
            </>)}
          </div>
        </nav>

        {/* HERO */}
        <div style={{ textAlign:"center", padding:"64px 48px 48px" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px",
            background:"rgba(77,201,122,0.12)", border:"1px solid rgba(77,201,122,0.25)",
            borderRadius:"100px", padding:"6px 18px", marginBottom:"20px" }}>
            <span style={{ width:"7px", height:"7px", borderRadius:"50%",
              background:"#4DC97A", display:"inline-block",
              boxShadow:"0 0 8px #4DC97A" }}/>
            <span style={{ fontSize:"12px", fontWeight:700, color:"#4DC97A",
              letterSpacing:"0.1em", textTransform:"uppercase" }}>
              Tarification officielle CCI-BF
            </span>
          </div>

          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"48px",
            fontWeight:800, color:"#fff", margin:"0 0 16px",
            lineHeight:1.15 }}>
            Choisissez votre formule
          </h1>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:"17px",
            maxWidth:"520px", margin:"0 auto 40px", lineHeight:1.7 }}>
            Accédez à la base de données NERE selon vos besoins.
            Bloquez jusqu'au renouvellement si le quota est atteint.
          </p>

          {/* Toggle mensuel / annuel */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0",
            background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:"100px", padding:"4px", marginBottom:"60px" }}>
            {["mensuel","annuel"].map(p => (
              <button key={p} onClick={() => setPeriode(p)} style={{
                padding:"10px 24px", borderRadius:"100px", border:"none",
                background: periode===p ? "#4DC97A" : "transparent",
                color: periode===p ? "#0A3D1F" : "rgba(255,255,255,0.5)",
                fontWeight: periode===p ? 800 : 500,
                fontSize:"14px", cursor:"pointer", fontFamily:"inherit",
                transition:"all 0.25s", position:"relative",
              }}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
                {p === "annuel" && (
                  <span style={{
                    position:"absolute", top:"-10px", right:"-4px",
                    background:"#D4A830", color:"#0A3D1F",
                    fontSize:"10px", fontWeight:800, padding:"2px 7px",
                    borderRadius:"100px", letterSpacing:"0.04em",
                  }}>
                    -17%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CARTES PACKS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          gap:"24px", padding:"0 48px 80px", maxWidth:"1100px", margin:"0 auto" }}>
          {PACKS.map(pack => {
            const prix = pack.prix[periode];
            const isHover = hover === pack.id;
            return (
              <div key={pack.id}
                onMouseEnter={() => setHover(pack.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  position:"relative", borderRadius:"20px",
                  background: pack.populaire
                    ? `linear-gradient(145deg, rgba(34,160,82,0.15), rgba(15,92,46,0.1))`
                    : `rgba(255,255,255,0.03)`,
                  border: pack.populaire
                    ? `2px solid rgba(77,201,122,0.4)`
                    : `1px solid rgba(255,255,255,0.1)`,
                  padding:"32px 28px",
                  transform: isHover ? "translateY(-6px)" : "translateY(0)",
                  transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                  boxShadow: isHover
                    ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${pack.couleur}40`
                    : pack.populaire
                      ? "0 8px 32px rgba(0,0,0,0.2)"
                      : "none",
                }}>

                {/* Badge "populaire" */}
                {pack.populaire && (
                  <div style={{ position:"absolute", top:"-14px", left:"50%",
                    transform:"translateX(-50%)",
                    background:"linear-gradient(135deg, #4DC97A, #22A052)",
                    color:"#0A3D1F", padding:"5px 18px", borderRadius:"100px",
                    fontSize:"11px", fontWeight:800, letterSpacing:"0.08em",
                    textTransform:"uppercase", whiteSpace:"nowrap",
                    boxShadow:"0 4px 12px rgba(77,201,122,0.4)" }}>
                    ⭐ Le plus populaire
                  </div>
                )}

                {/* En-tête pack */}
                <div style={{ marginBottom:"24px" }}>
                  <div style={{ display:"flex", alignItems:"center",
                    gap:"10px", marginBottom:"12px" }}>
                    <div style={{ fontSize:"28px" }}>{pack.icon}</div>
                    <div>
                      <div style={{ fontSize:"20px", fontWeight:800, color:"#fff",
                        fontFamily:"'Playfair Display',serif" }}>
                        {pack.nom}
                      </div>
                      <div style={{ fontSize:"11px", fontWeight:700, color:pack.couleur,
                        textTransform:"uppercase", letterSpacing:"0.1em" }}>
                        {pack.accroche}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)",
                    lineHeight:1.6, margin:0 }}>
                    {pack.description}
                  </p>
                </div>

                {/* Prix */}
                <div style={{ marginBottom:"28px", padding:"20px 0",
                  borderTop:"1px solid rgba(255,255,255,0.08)",
                  borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ display:"flex", alignItems:"flex-end", gap:"6px" }}>
                    <span style={{ fontFamily:"'Playfair Display',serif",
                      fontSize:"40px", fontWeight:900, color:"#fff", lineHeight:1 }}>
                      {formaterPrix(prix)}
                    </span>
                    <div style={{ paddingBottom:"6px" }}>
                      <div style={{ fontSize:"13px", fontWeight:700, color:"rgba(255,255,255,0.4)" }}>
                        FCFA
                      </div>
                      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>
                        /{periode === "mensuel" ? "mois" : "an"}
                      </div>
                    </div>
                  </div>
                  {periode === "mensuel" && (
                    <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)",
                      marginTop:"6px" }}>
                      Soit {formaterPrix(pack.prix.annuel)} FCFA/an
                      <span style={{ color:pack.couleur, fontWeight:700, marginLeft:"6px" }}>
                        (économisez {formaterPrix(pack.prix.mensuel * 12 - pack.prix.annuel)} FCFA)
                      </span>
                    </div>
                  )}
                  {periode === "annuel" && (
                    <div style={{ fontSize:"12px", color:pack.couleur,
                      fontWeight:600, marginTop:"6px" }}>
                      ✓ Économie de {pack.reductionAnnuelle}% vs mensuel
                    </div>
                  )}
                </div>

                {/* Quotas */}
                <div style={{ marginBottom:"24px", display:"flex", flexDirection:"column", gap:"8px" }}>
                  {[
                    { label:"Adresses (listes)",  val: pack.quotas.listes, icon:"📋" },
                    { label:"Fiches",             val: pack.quotas.fiches, icon:"📄" },
                    { label:"Statistiques",       val: pack.quotas.stats,  icon:"📊" },
                  ].map(q => (
                    <div key={q.label} style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"8px 12px", borderRadius:"8px",
                      background: q.val === 0
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(255,255,255,0.05)",
                    }}>
                      <span style={{ fontSize:"12px",
                        color: q.val === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)" }}>
                        {q.icon} {q.label}
                      </span>
                      <span style={{
                        fontSize:"12px", fontWeight:800,
                        color: q.val === -1 ? pack.couleur
                          : q.val === 0 ? "rgba(255,255,255,0.15)"
                          : "#fff",
                      }}>
                        {q.val === -1 ? "Illimité" : q.val === 0 ? "—" : `${q.val.toLocaleString()}/an`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fonctionnalités */}
                <div style={{ display:"flex", flexDirection:"column",
                  gap:"8px", marginBottom:"28px" }}>
                  {pack.fonctionnalites.map((f, i) => (
                    <div key={i} style={{
                      display:"flex", alignItems:"flex-start", gap:"10px",
                      opacity: f.ok ? 1 : 0.35,
                    }}>
                      <div style={{
                        width:"16px", height:"16px", borderRadius:"50%", flexShrink:0,
                        marginTop:"1px",
                        background: f.ok ? pack.couleur : "rgba(255,255,255,0.1)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:"9px", color: f.ok ? "#0A3D1F" : "rgba(255,255,255,0.3)",
                        fontWeight:900,
                      }}>
                        {f.ok ? "✓" : "✕"}
                      </div>
                      <span style={{ fontSize:"13px",
                        color: f.ok ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
                        lineHeight:1.4 }}>
                        {f.label}
                        {f.note && (
                          <span style={{ fontSize:"11px", color:pack.couleur,
                            fontWeight:700, marginLeft:"6px" }}>
                            ({f.note})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bouton */}
                <button onClick={() => handleChoisir(pack)} style={{
                  width:"100%", padding:"14px",
                  borderRadius:"12px", border:"none",
                  background: pack.populaire
                    ? `linear-gradient(135deg, ${pack.couleur}, #1A7A40)`
                    : `rgba(255,255,255,0.08)`,
                  color: pack.populaire ? "#0A3D1F" : "#fff",
                  fontWeight:800, fontSize:"15px", cursor:"pointer",
                  fontFamily:"inherit", transition:"all 0.2s",
                  boxShadow: pack.populaire
                    ? `0 4px 16px ${pack.couleur}50` : "none",
                  transform: isHover ? "scale(1.02)" : "scale(1)",
                }}>
                  {user ? `Souscrire ${pack.nom}` : `Commencer avec ${pack.nom}`}
                </button>

                {/* Mention paiement */}
                <p style={{ textAlign:"center", fontSize:"11px",
                  color:"rgba(255,255,255,0.2)", marginTop:"10px", marginBottom:0 }}>
                  CinetPay · Agence CCI-BF
                </p>
              </div>
            );
          })}
        </div>

        {/* SECTION COMPARAISON BLOCAGE */}
        <div style={{ background:"rgba(0,0,0,0.2)", borderTop:"1px solid rgba(255,255,255,0.06)",
          padding:"48px", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"10px",
            background:"rgba(232,85,85,0.08)", border:"1px solid rgba(232,85,85,0.2)",
            borderRadius:"12px", padding:"14px 24px", marginBottom:"32px" }}>
            <span style={{ fontSize:"20px" }}>🔒</span>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontWeight:700, fontSize:"14px", color:"#fff" }}>
                Quota atteint = accès bloqué jusqu'au renouvellement
              </div>
              <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginTop:"2px" }}>
                Aucun dépassement possible — renouvelez ou changez de pack avant l'échéance.
              </div>
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gap:"20px", maxWidth:"900px", margin:"0 auto" }}>
            {[
              { icon:"📅", titre:"Renouvellement automatique",
                desc:"Votre pack se renouvelle automatiquement à l'échéance." },
              { icon:"⬆️", titre:"Upgrade possible à tout moment",
                desc:"Passez à un pack supérieur en cours de période. La différence est proratisée." },
              { icon:"🏢", titre:"Paiement en agence",
                desc:"Réglez directement à la CCI-BF. Activation sous 24h après confirmation." },
            ].map(item => (
              <div key={item.titre} style={{ background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"20px" }}>
                <div style={{ fontSize:"28px", marginBottom:"10px" }}>{item.icon}</div>
                <div style={{ fontWeight:700, fontSize:"14px", color:"#fff",
                  marginBottom:"8px" }}>{item.titre}</div>
                <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)",
                  lineHeight:1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ padding:"48px", maxWidth:"700px", margin:"0 auto" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px",
            color:"#fff", textAlign:"center", marginBottom:"32px" }}>
            Questions fréquentes
          </h2>
          {[
            { q:"Puis-je changer de pack en cours d'abonnement ?",
              r:"Oui, vous pouvez upgrader à tout moment. La différence est calculée au prorata de la période restante." },
            { q:"Que se passe-t-il quand mon quota est épuisé ?",
              r:"Votre accès aux données concernées est bloqué jusqu'au renouvellement de votre pack. Vous pouvez toutefois consulter vos demandes en cours." },
            { q:"Comment payer en agence CCI-BF ?",
              r:"Soumettez votre demande en ligne, puis rendez-vous à la CCI-BF avec le numéro de référence. Votre accès est activé sous 24h après paiement." },
            { q:"Les prix sont-ils HT ou TTC ?",
              r:"Les prix affichés sont en FCFA TTC, toutes taxes comprises." },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom:"1px solid rgba(255,255,255,0.08)",
              padding:"20px 0" }}>
              <div style={{ fontWeight:700, fontSize:"15px", color:"#fff",
                marginBottom:"8px" }}>
                {faq.q}
              </div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.45)",
                lineHeight:1.7 }}>
                {faq.r}
              </div>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div style={{ textAlign:"center", padding:"48px 48px 80px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px",
            color:"#fff", marginBottom:"16px" }}>
            Besoin d'un devis personnalisé ?
          </h2>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"15px", marginBottom:"28px" }}>
            Pour les grandes structures ou les besoins spécifiques, contactez-nous directement.
          </p>
          <div style={{ display:"flex", gap:"14px", justifyContent:"center" }}>
            <button onClick={() => navigate("/chat")} style={{
              padding:"14px 32px", borderRadius:"12px",
              background:"linear-gradient(135deg, #4DC97A, #1A7A40)",
              color:"#0A3D1F", fontWeight:800, fontSize:"15px",
              border:"none", cursor:"pointer", fontFamily:"inherit" }}>
              💬 Contacter un agent
            </button>
            <button onClick={() => navigate("/")} style={{
              padding:"14px 32px", borderRadius:"12px",
              background:"rgba(255,255,255,0.06)",
              border:"1px solid rgba(255,255,255,0.12)",
              color:"rgba(255,255,255,0.7)", fontWeight:600, fontSize:"15px",
              cursor:"pointer", fontFamily:"inherit" }}>
              Retour à l'accueil
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}