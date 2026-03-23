import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/dashboard.css";

const MODES_PAIEMENT = [
  {
    id: "cinetpay",
    label: "CinetPay — Mobile Money",
    icon: "📱",
    description: "Orange Money, Moov Money, Coris Money. Activation immédiate.",
    badge: "Instantané",
    badgeColor: "#4DC97A",
  },
  {
    id: "agence",
    label: "Paiement en agence CCI-BF",
    icon: "🏢",
    description: "Rendez-vous à l'agence CCI-BF avec votre référence. Activation sous 24h.",
    badge: "24h",
    badgeColor: "#D4A830",
  },
];

export default function Paiement() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem("user") || "null");

  // Pack et période passés depuis Formules.jsx
  const packChoisi = location.state?.pack;
  const periodeChoisie = location.state?.periode || "annuel";

  const [etape, setEtape]         = useState(1);
  const [modePaiement, setMode]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [reference, setReference] = useState("");
  const [success, setSuccess]     = useState(false);

  if (!user) {
    navigate("/connexion"); return null;
  }

  if (!packChoisi) {
    return (
      <div style={{ minHeight:"100vh", background:"#F5FAF7", display:"flex",
        alignItems:"center", justifyContent:"center",
        fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:"48px", marginBottom:"16px" }}>⚠️</div>
          <h2 style={{ color:"#0A3D1F" }}>Aucun pack sélectionné</h2>
          <button className="btn-save" style={{ marginTop:"16px" }}
            onClick={() => navigate("/formules")}>
            Voir les formules
          </button>
        </div>
      </div>
    );
  }

  const prix = packChoisi.prix[periodeChoisie];
  const periodeLabel = periodeChoisie === "mensuel" ? "mois" : "an";

  const handlePayer = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      if (modePaiement === "cinetpay") {
        // ── CINETPAY — appel API pour initier le paiement ──
        const res  = await fetch("http://localhost:5000/api/paiements/initier", {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            packId:       packChoisi?.id,
            packNom:      packChoisi?.nom,
            montant:      montant,
            periode:      periode,
            modePaiement: "cinetpay",
          }),
        });
        const data = await res.json();

        if (data.success) {
          // Rediriger vers CinetPay si URL fournie
          if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
            return;
          }
          // Sinon afficher la référence
          setReference(data.reference || `NERE-${Date.now().toString(36).toUpperCase()}`);
          setSuccess(true);
        } else {
          // Fallback — générer une référence locale
          const ref = `NERE-${Date.now().toString(36).toUpperCase()}`;
          setReference(ref);
          setSuccess(true);
        }
      } else {
        // ── AGENCE CCI-BF — générer une référence ──
        const res  = await fetch("http://localhost:5000/api/paiements/initier", {
          method:  "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            packId:       packChoisi?.id,
            packNom:      packChoisi?.nom,
            montant:      montant,
            periode:      periode,
            modePaiement: "agence",
          }),
        });
        const data = await res.json();
        const ref  = data.reference || `NERE-${Date.now().toString(36).toUpperCase()}`;
        setReference(ref);
        setSuccess(true);
      }
    } catch(e) {
      console.warn("API paiement indisponible:", e.message);
      // Fallback local
      const ref = `NERE-${Date.now().toString(36).toUpperCase()}`;
      setReference(ref);
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAVBAR */}
        <nav className="dash-navbar">
          <div className="dash-logo" onClick={() => navigate("/")}>NERE <span>CCI-BF</span></div>
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/formules")}>
              ← Retour aux formules
            </span>
          </div>
          <div className="dash-nav-actions">
            <div className="user-chip" onClick={() => navigate("/profil")}>
              <div className="user-avatar">{user.prenom?.[0]}{user.nom?.[0]}</div>
              <span>{user.prenom} {user.nom}</span>
            </div>
          </div>
        </nav>

        <div style={{ padding:"40px 48px 80px", display:"flex",
          gap:"32px", alignItems:"flex-start",
          maxWidth:"1000px", margin:"0 auto" }}>

          {/* COLONNE GAUCHE — Récapitulatif */}
          <div style={{ width:"320px", flexShrink:0 }}>

            {/* Card récap pack */}
            <div style={{ background:"var(--green-deep)", borderRadius:"16px",
              padding:"24px", marginBottom:"16px",
              boxShadow:"0 8px 32px rgba(10,61,31,0.2)" }}>
              <div style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.4)",
                textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"14px" }}>
                Votre sélection
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
                <span style={{ fontSize:"32px" }}>{packChoisi.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
                    fontWeight:800, color:"#fff" }}>
                    Pack {packChoisi.nom}
                  </div>
                  <div style={{ fontSize:"12px", color:packChoisi.couleur, fontWeight:600 }}>
                    {packChoisi.accroche}
                  </div>
                </div>
              </div>

              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:"10px",
                padding:"14px 16px", marginBottom:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", marginBottom:"6px" }}>
                  <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)" }}>
                    Période
                  </span>
                  <span style={{ fontSize:"13px", fontWeight:700, color:"#fff",
                    textTransform:"capitalize" }}>
                    {periodeChoisie === "mensuel" ? "Mensuel" : "Annuel"}
                  </span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center" }}>
                  <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)" }}>
                    Renouvellement
                  </span>
                  <span style={{ fontSize:"13px", fontWeight:700, color:"#fff" }}>
                    Automatique
                  </span>
                </div>
              </div>

              {/* Quotas inclus */}
              <div style={{ marginBottom:"20px" }}>
                <div style={{ fontSize:"11px", fontWeight:700, color:"rgba(255,255,255,0.35)",
                  textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>
                  Quotas inclus
                </div>
                {[
                  { label:"Adresses (listes)", val:packChoisi.quotas.listes, icon:"📋" },
                  { label:"Fiches",            val:packChoisi.quotas.fiches, icon:"📄" },
                  { label:"Statistiques",      val:packChoisi.quotas.stats,  icon:"📊" },
                ].map(q => (
                  <div key={q.label} style={{
                    display:"flex", justifyContent:"space-between",
                    padding:"7px 0",
                    borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize:"12px",
                      color: q.val===0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)" }}>
                      {q.icon} {q.label}
                    </span>
                    <span style={{ fontSize:"12px", fontWeight:800,
                      color: q.val===-1 ? packChoisi.couleur
                        : q.val===0 ? "rgba(255,255,255,0.15)" : "#fff" }}>
                      {q.val===-1 ? "Illimité" : q.val===0 ? "—" : q.val.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Montant */}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center" }}>
                  <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)" }}>
                    Total à payer
                  </span>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Playfair Display',serif",
                      fontSize:"26px", fontWeight:900, color:"#fff" }}>
                      {prix.toLocaleString("fr-FR")}
                    </div>
                    <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>
                      FCFA / {periodeLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sécurité */}
            <div style={{ background:"rgba(77,201,122,0.06)",
              border:"1px solid rgba(77,201,122,0.15)", borderRadius:"12px",
              padding:"14px 16px" }}>
              {["🔒 Paiement sécurisé",
                "✅ Activation immédiate (CinetPay)",
                "📞 Support CCI-BF : +226 25 30 61 22"].map(item => (
                <div key={item} style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)",
                  padding:"5px 0", display:"flex", alignItems:"center", gap:"8px",
                  borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* COLONNE DROITE — Formulaire paiement */}
          <div style={{ flex:1 }}>

            {/* Succès */}
            {success ? (
              <div style={{ background:"#fff", borderRadius:"16px",
                border:"1px solid var(--border)", padding:"48px",
                textAlign:"center" }}>
                <div style={{ fontSize:"56px", marginBottom:"16px" }}>
                  {modePaiement === "cinetpay" ? "🎉" : "📋"}
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif",
                  color:"var(--green-dark)", fontSize:"24px", marginBottom:"12px" }}>
                  {modePaiement === "cinetpay"
                    ? "Paiement en cours de traitement !"
                    : "Demande enregistrée !"}
                </h2>

                <div style={{ background:"var(--green-pale)",
                  border:"1px solid rgba(34,160,82,0.2)", borderRadius:"12px",
                  padding:"16px 24px", marginBottom:"24px",
                  display:"inline-block", minWidth:"260px" }}>
                  <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                    textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>
                    Référence de commande
                  </div>
                  <div style={{ fontFamily:"monospace", fontSize:"20px",
                    fontWeight:900, color:"var(--green-dark)",
                    letterSpacing:"0.1em" }}>
                    {reference}
                  </div>
                </div>

                <p style={{ color:"var(--text-muted)", lineHeight:1.7,
                  marginBottom:"24px", fontSize:"14px" }}>
                  {modePaiement === "cinetpay" ? (
                    <>Votre paiement est en cours de vérification.<br/>
                    Votre pack <strong>{packChoisi.nom}</strong> sera activé dès confirmation.</> 
                  ) : (
                    <>Présentez-vous à la <strong>CCI-BF</strong> avec la référence ci-dessus.<br/>
                    Votre pack <strong>{packChoisi.nom}</strong> sera activé sous <strong>24h</strong> après paiement.</>
                  )}
                </p>

                {modePaiement === "agence" && (
                  <div style={{ background:"rgba(212,168,48,0.08)",
                    border:"1px solid rgba(212,168,48,0.2)", borderRadius:"10px",
                    padding:"14px 18px", marginBottom:"24px", textAlign:"left" }}>
                    <div style={{ fontWeight:700, fontSize:"13px", color:"#D4A830",
                      marginBottom:"8px" }}>
                      🏢 Adresse CCI-BF Ouagadougou
                    </div>
                    <div style={{ fontSize:"13px", color:"var(--text-muted)", lineHeight:1.7 }}>
                      Avenue de Lyon, 01 BP 502<br/>
                      Ouagadougou 01, Burkina Faso<br/>
                      Lun–Ven : 8h00 – 17h00<br/>
                      Tél : +226 25 30 61 22
                    </div>
                  </div>
                )}

                <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                  <button className="btn-save" onClick={() => navigate("/dashboard")}>
                    Mon espace abonné
                  </button>
                  <button className="btn-cancel" onClick={() => navigate("/")}>
                    Accueil
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background:"#fff", borderRadius:"16px",
                border:"1px solid var(--border)", overflow:"hidden" }}>

                {/* Barre étapes */}
                <div style={{ background:"var(--green-deep)", padding:"18px 28px",
                  display:"flex", alignItems:"center" }}>
                  {[{n:1,label:"Mode de paiement"},{n:2,label:"Confirmation"}].map((s,i) => (
                    <div key={s.n} style={{ display:"flex", alignItems:"center",
                      flex:i<1?1:"none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <div style={{ width:"26px", height:"26px", borderRadius:"50%",
                          background:etape>s.n?"var(--green-light)":
                            etape===s.n?"rgba(77,201,122,0.3)":"rgba(255,255,255,0.1)",
                          border:etape===s.n?"2px solid var(--green-light)":"2px solid transparent",
                          color:"#fff", display:"flex", alignItems:"center",
                          justifyContent:"center", fontSize:"12px", fontWeight:800, flexShrink:0 }}>
                          {etape>s.n ? "✓" : s.n}
                        </div>
                        <span style={{ fontSize:"12px", fontWeight:600,
                          color:etape>=s.n?"#fff":"rgba(255,255,255,0.3)" }}>
                          {s.label}
                        </span>
                      </div>
                      {i<1 && <div style={{ flex:1, height:"2px",
                        background:"rgba(255,255,255,0.1)", margin:"0 12px" }}/>}
                    </div>
                  ))}
                </div>

                <div style={{ padding:"28px" }}>

                  {/* ÉTAPE 1 — Choisir mode paiement */}
                  {etape === 1 && (<>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px",
                      color:"var(--text-dark)", marginBottom:"8px" }}>
                      Comment souhaitez-vous payer ?
                    </h3>
                    <p style={{ color:"var(--text-muted)", fontSize:"13px",
                      marginBottom:"24px" }}>
                      Choisissez votre mode de règlement pour le Pack{" "}
                      <strong>{packChoisi.nom}</strong>.
                    </p>

                    <div style={{ display:"flex", flexDirection:"column", gap:"12px",
                      marginBottom:"24px" }}>
                      {MODES_PAIEMENT.map(mode => (
                        <button key={mode.id} onClick={() => setMode(mode.id)}
                          style={{
                            padding:"20px 24px", borderRadius:"14px", textAlign:"left",
                            border: modePaiement===mode.id
                              ? "2px solid var(--green-light)"
                              : "1.5px solid var(--border)",
                            background: modePaiement===mode.id
                              ? "var(--green-pale)" : "#fff",
                            cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                            display:"flex", alignItems:"center", gap:"16px",
                          }}>
                          <span style={{ fontSize:"32px", flexShrink:0 }}>{mode.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center",
                              gap:"10px", marginBottom:"5px" }}>
                              <span style={{ fontWeight:700, fontSize:"15px",
                                color: modePaiement===mode.id
                                  ? "var(--green-dark)" : "var(--text-dark)" }}>
                                {mode.label}
                              </span>
                              <span style={{ background:`${mode.badgeColor}18`,
                                color:mode.badgeColor,
                                border:`1px solid ${mode.badgeColor}40`,
                                borderRadius:"100px", padding:"2px 10px",
                                fontSize:"10px", fontWeight:800 }}>
                                {mode.badge}
                              </span>
                            </div>
                            <p style={{ fontSize:"12px", color:"var(--text-muted)",
                              lineHeight:1.5, margin:0 }}>
                              {mode.description}
                            </p>
                          </div>
                          <div style={{ width:"20px", height:"20px", borderRadius:"50%",
                            border: modePaiement===mode.id
                              ? "2px solid var(--green-light)" : "2px solid var(--border)",
                            background: modePaiement===mode.id
                              ? "var(--green-light)" : "transparent",
                            display:"flex", alignItems:"center",
                            justifyContent:"center", flexShrink:0,
                            fontSize:"11px", color:"#0A3D1F", fontWeight:900 }}>
                            {modePaiement===mode.id ? "✓" : ""}
                          </div>
                        </button>
                      ))}
                    </div>

                    <button className="btn-save" style={{ padding:"13px 32px" }}
                      disabled={!modePaiement} onClick={() => setEtape(2)}>
                      Continuer →
                    </button>
                  </>)}

                  {/* ÉTAPE 2 — Confirmation */}
                  {etape === 2 && (<>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px",
                      color:"var(--text-dark)", marginBottom:"20px" }}>
                      Confirmation de commande
                    </h3>

                    {/* Récap */}
                    <div style={{ background:"var(--off-white)", borderRadius:"12px",
                      border:"1px solid var(--border)", padding:"18px",
                      marginBottom:"20px" }}>
                      {[
                        { label:"Abonné",      value:`${user.prenom} ${user.nom}` },
                        { label:"Email",       value:user.email },
                        { label:"Pack",        value:`${packChoisi.nom} — ${periodeChoisie === "mensuel" ? "Mensuel" : "Annuel"}` },
                        { label:"Mode",        value:MODES_PAIEMENT.find(m=>m.id===modePaiement)?.label },
                        { label:"Montant",     value:`${prix.toLocaleString("fr-FR")} FCFA` },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ display:"flex", gap:"16px",
                          padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                          <span style={{ width:"100px", fontSize:"12px", fontWeight:700,
                            color:"var(--text-muted)", textTransform:"uppercase",
                            letterSpacing:"0.06em", flexShrink:0 }}>
                            {label}
                          </span>
                          <span style={{ fontSize:"14px", color:"var(--text-dark)",
                            fontWeight:500 }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Message selon mode */}
                    {modePaiement === "cinetpay" && (
                      <div style={{ background:"rgba(77,201,122,0.06)",
                        border:"1px solid rgba(77,201,122,0.2)", borderRadius:"10px",
                        padding:"14px 16px", marginBottom:"20px",
                        fontSize:"13px", color:"var(--text-mid)", lineHeight:1.7 }}>
                        📱 Vous allez être redirigé vers <strong>CinetPay</strong> pour finaliser
                        le paiement via Orange Money, Moov Money ou Coris Money.
                        Votre pack sera activé <strong>immédiatement</strong> après confirmation.
                      </div>
                    )}

                    {modePaiement === "agence" && (
                      <div style={{ background:"rgba(212,168,48,0.06)",
                        border:"1px solid rgba(212,168,48,0.2)", borderRadius:"10px",
                        padding:"14px 16px", marginBottom:"20px",
                        fontSize:"13px", color:"var(--text-mid)", lineHeight:1.7 }}>
                        🏢 Une référence de paiement vous sera générée. Présentez-la à la{" "}
                        <strong>CCI-BF</strong> pour régler. Activation sous <strong>24h</strong>{" "}
                        après confirmation de paiement.
                      </div>
                    )}

                    {/* CGU */}
                    <div style={{ fontSize:"12px", color:"var(--text-muted)",
                      marginBottom:"20px", lineHeight:1.6,
                      padding:"12px 14px", background:"var(--off-white)",
                      borderRadius:"8px", border:"1px solid var(--border)" }}>
                      En validant, vous acceptez les{" "}
                      <span style={{ color:"var(--green-bright)", cursor:"pointer",
                        fontWeight:600 }}>
                        Conditions Générales d'Utilisation
                      </span>{" "}
                      de la plateforme NERE CCI-BF. L'abonnement se renouvelle automatiquement.
                      Quota atteint = accès bloqué jusqu'au prochain cycle.
                    </div>

                    <div style={{ display:"flex", gap:"10px" }}>
                      <button className="btn-cancel" onClick={() => setEtape(1)}>
                        ← Modifier
                      </button>
                      <button className="btn-save" style={{ padding:"13px 32px" }}
                        disabled={loading} onClick={handlePayer}>
                        {loading ? (
                          <><span className="spinner-sm"/>&nbsp;Traitement...</>
                        ) : modePaiement === "cinetpay" ? (
                          `💳 Payer ${prix.toLocaleString("fr-FR")} FCFA`
                        ) : (
                          `📋 Générer ma référence`
                        )}
                      </button>
                    </div>
                  </>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="dash-footer">
          <span>© 2026 CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <span>Paiement sécurisé · CinetPay · Agence CCI-BF</span>
        </footer>
      </div>
    </div>
  );
}