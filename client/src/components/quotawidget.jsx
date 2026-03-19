// Composant réutilisable — à insérer dans Profil.jsx (onglet Abonnement)
// et Dashboard.jsx
//
// Usage :
//   import QuotaWidget from '../../components/QuotaWidget';
//   <QuotaWidget pack={packActuel} usage={usageActuel} dateFin={dateFin} />

export default function QuotaWidget({ pack, usage, dateFin }) {
  // Valeurs mock — à remplacer par données API
  const packMock = pack || {
    nom: "pro",
    icon: "🚀",
    couleur: "#22A052",
    quotaListes: 2000,
    quotaFiches: 50,
    quotaStats:  0,
    prixAnnuel:  150000,
  };

  const usageMock = usage || {
    listes: 340,
    fiches: 12,
    stats:  0,
  };

  const dateFinMock = dateFin || "31 Déc. 2025";

  const quotas = [
    {
      label:   "Adresses (Listes)",
      icon:    "📋",
      consomme: usageMock.listes,
      max:      packMock.quotaListes,
      couleur:  "#4DC97A",
    },
    {
      label:   "Fiches",
      icon:    "📄",
      consomme: usageMock.fiches,
      max:      packMock.quotaFiches,
      couleur:  "#22A052",
    },
    {
      label:   "Statistiques",
      icon:    "📊",
      consomme: usageMock.stats,
      max:      packMock.quotaStats,
      couleur:  "#D4A830",
    },
  ].filter(q => q.max !== 0); // N'afficher que les quotas disponibles dans le pack

  function pct(c, m) {
    if (m === -1) return 0;
    return Math.min(100, Math.round((c / m) * 100));
  }

  function couleurBarre(p) {
    if (p >= 90) return "#E85555";
    if (p >= 70) return "#D4A830";
    return "#4DC97A";
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>

      {/* En-tête pack actif */}
      <div style={{ background:"var(--green-deep)", borderRadius:"14px 14px 0 0",
        padding:"18px 20px", display:"flex", alignItems:"center",
        justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"22px" }}>{packMock.icon}</span>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px",
              fontWeight:800, color:"#fff", textTransform:"capitalize" }}>
              Pack {packMock.nom}
            </div>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", marginTop:"1px" }}>
              Actif jusqu'au {dateFinMock}
            </div>
          </div>
        </div>
        <span style={{ background:"rgba(77,201,122,0.2)",
          color:"#4DC97A", border:"1px solid rgba(77,201,122,0.3)",
          borderRadius:"100px", padding:"4px 12px",
          fontSize:"11px", fontWeight:700 }}>
          ● Actif
        </span>
      </div>

      {/* Quotas */}
      <div style={{ background:"#fff", borderRadius:"0 0 14px 14px",
        border:"1px solid var(--border)", borderTop:"none",
        padding:"18px 20px", display:"flex", flexDirection:"column", gap:"16px" }}>

        {quotas.length === 0 && (
          <div style={{ textAlign:"center", padding:"8px",
            fontSize:"13px", color:"var(--text-muted)" }}>
            💎 Accès illimité — aucun quota
          </div>
        )}

        {quotas.map(q => {
          const p = pct(q.consomme, q.max);
          const cb = couleurBarre(p);
          const illimite = q.max === -1;

          return (
            <div key={q.label}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"6px" }}>
                <span style={{ fontSize:"12px", fontWeight:600, color:"var(--text-mid)" }}>
                  {q.icon} {q.label}
                </span>
                <div style={{ textAlign:"right" }}>
                  {illimite ? (
                    <span style={{ fontSize:"12px", fontWeight:800,
                      color:"var(--green-bright)" }}>Illimité</span>
                  ) : (
                    <>
                      <span style={{ fontSize:"13px", fontWeight:800, color:"var(--text-dark)" }}>
                        {q.consomme.toLocaleString()}
                      </span>
                      <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>
                        /{q.max.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {!illimite && (
                <>
                  {/* Barre de progression */}
                  <div style={{ height:"7px", borderRadius:"100px",
                    background:"rgba(10,61,31,0.08)", overflow:"hidden" }}>
                    <div style={{
                      height:"100%",
                      width:`${p}%`,
                      borderRadius:"100px",
                      background: p >= 90
                        ? `linear-gradient(90deg, ${cb}, #c0392b)`
                        : p >= 70
                          ? `linear-gradient(90deg, ${cb}, #b8860b)`
                          : `linear-gradient(90deg, #4DC97A, ${cb})`,
                      transition:"width 0.5s ease",
                    }}/>
                  </div>

                  {/* Alerte quota */}
                  {p >= 90 && (
                    <div style={{ marginTop:"6px", padding:"6px 10px",
                      background:"rgba(232,85,85,0.08)",
                      border:"1px solid rgba(232,85,85,0.2)",
                      borderRadius:"8px", fontSize:"11px", color:"#E85555",
                      fontWeight:600, display:"flex", alignItems:"center", gap:"6px" }}>
                      ⚠️ Quota presque épuisé — {q.max - q.consomme} restant(s)
                    </div>
                  )}
                  {p >= 100 && (
                    <div style={{ marginTop:"6px", padding:"6px 10px",
                      background:"rgba(232,85,85,0.12)",
                      border:"1px solid rgba(232,85,85,0.3)",
                      borderRadius:"8px", fontSize:"11px", color:"#E85555",
                      fontWeight:700, display:"flex", alignItems:"center", gap:"6px" }}>
                      🔒 Quota épuisé — bloqué jusqu'au renouvellement ({dateFinMock})
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Bouton upgrade */}
        {packMock.nom !== "premium" && (
          <div style={{ paddingTop:"4px", borderTop:"1px solid var(--border)" }}>
            <button style={{ width:"100%", padding:"10px", borderRadius:"10px",
              background:"var(--green-pale)", border:"1px solid rgba(34,160,82,0.2)",
              color:"var(--green-dark)", fontWeight:700, fontSize:"13px",
              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s" }}
              onClick={() => window.location.href = "/formules"}>
              ⬆️ Passer au pack {packMock.nom === "basic" ? "Pro" : "Premium"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}