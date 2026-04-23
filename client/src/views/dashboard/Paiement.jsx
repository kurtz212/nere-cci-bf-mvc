import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/dashboard.css";

const API = "/api";

const MODES_PAIEMENT = [
  {
    id:          "cinetpay",
    label:       "CinetPay — Mobile Money",
    icon:        "📱",
    description: "Orange Money, Moov Money, Coris Money. Activation immédiate.",
    badge:       "Instantané",
    badgeColor:  "#4DC97A",
  },
  {
    id:          "agence",
    label:       "Paiement en agence CCI-BF",
    icon:        "🏢",
    description: "Rendez-vous à l'agence CCI-BF avec votre référence. Activation sous 24h.",
    badge:       "24h",
    badgeColor:  "#D4A830",
  },
];

export default function Paiement() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem("user") || "null");

  const packChoisi   = location.state?.pack;
  const montantState = location.state?.montant; // ✅ montant custom passé depuis Formules.jsx

  const [etape, setEtape]           = useState(1);
  const [modePaiement, setMode]     = useState("");
  const [loading, setLoading]       = useState(false);
  const [reference, setReference]   = useState("");
  const [success, setSuccess]       = useState(false);
  const [erreur, setErreur]         = useState("");

  if (!user) { navigate("/connexion"); return null; }

  if (!packChoisi) {
    return (
      <div style={{ minHeight:"100vh", background:"#F5FAF7", display:"flex",
        alignItems:"center", justifyContent:"center",
        fontFamily:"Arial, Helvetica, sans-serif" }}>
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

  /* ✅ BUG 2 CORRIGÉ — calcul du prix dans le bon ordre :
     1. montantState  → montant custom saisi dans Formules.jsx (Pack Pro / Entreprise)
     2. packChoisi.prix si c'est un Number direct
     3. packChoisi.prix.mensuel si c'est un objet (ancien format)
     4. 0 en fallback                                                          */
  const prix =
    parseInt(montantState)                                       ||
    (typeof packChoisi.prix === "number" ? packChoisi.prix : 0) ||
    (typeof packChoisi.prix === "object" ? (packChoisi.prix?.mensuel || 0) : 0);

  const nomPack = packChoisi.nom || packChoisi.label || "Pack";
  const packId  = packChoisi.id  || "pack1";

  /* ✅ BUG 1 CORRIGÉ — /recharger additionne au solde existant
     /souscrire remettait le solde à zéro → NE PLUS UTILISER pour les recharges */
  const handlePayer = async () => {
    if (prix <= 0) {
      setErreur("Montant invalide. Retournez choisir une formule.");
      return;
    }
    setLoading(true);
    setErreur("");
    const token = localStorage.getItem("token");

    try {
      const rechargeRes = await fetch(`${API}/abonnements/recharger`, {
        method:  "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          montant:       prix,   // ✅ montant exact saisi
          montantCustom: prix,   // ✅ aussi en custom pour les packs flexibles
          nouveauPack:   packId,
        }),
      });

      const rechargeData = await rechargeRes.json();

      if (!rechargeData.success) {
        setErreur(rechargeData.message || "Erreur lors de la mise à jour du solde.");
        setLoading(false);
        return;
      }

      /* Initier le paiement CinetPay / agence */
      try {
        const res  = await fetch(`${API}/paiements/initier`, {
          method:  "POST",
          headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({
            packId, packNom:nomPack, montant:prix, modePaiement,
          }),
        });
        const data = await res.json();
        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl;
          return;
        }
        setReference(data.reference || `NERE-${Date.now().toString(36).toUpperCase()}`);
      } catch {
        setReference(`NERE-${Date.now().toString(36).toUpperCase()}`);
      }

      setSuccess(true);

    } catch {
      setErreur("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <style>{`* { font-family: Arial, Helvetica, sans-serif !important; }`}</style>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR ══ */}
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

          {/* ── COLONNE GAUCHE : récapitulatif ── */}
          <div style={{ width:"320px", flexShrink:0 }}>
            <div style={{ background:"var(--green-deep)", borderRadius:"16px",
              padding:"24px", marginBottom:"16px",
              boxShadow:"0 8px 32px rgba(10,61,31,0.2)" }}>

              <div style={{ fontSize:"11px", fontWeight:700,
                color:"rgba(255,255,255,0.4)", textTransform:"uppercase",
                letterSpacing:"0.1em", marginBottom:"14px" }}>
                Votre sélection
              </div>

              <div style={{ marginBottom:"20px" }}>
                <div style={{ fontSize:"22px", fontWeight:800,
                  color:"#fff", marginBottom:"4px" }}>
                  {nomPack}
                </div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)" }}>
                  Crédit prépayé — déduction à chaque requête
                </div>
              </div>

              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:"10px",
                padding:"14px 16px", marginBottom:"20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)" }}>
                    Crédit à ajouter
                  </span>
                  <span style={{ fontSize:"15px", fontWeight:700, color:"#4DC97A" }}>
                    {prix > 0 ? prix.toLocaleString("fr-FR") : "—"} FCFA
                  </span>
                </div>
              </div>

              <div style={{ background:"rgba(77,201,122,0.08)", borderRadius:"10px",
                padding:"12px 14px", marginBottom:"20px",
                fontSize:"12px", color:"rgba(255,255,255,0.6)", lineHeight:1.6 }}>
                💡 Ce montant sera <strong>ajouté à votre solde existant</strong>.
                Chaque requête déduira le coût correspondant :
                Liste (250 FCFA), Statistiques (5 000 FCFA), Fiche (1 000 FCFA).
              </div>

              <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:"16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)" }}>Total à payer</span>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"26px", fontWeight:900, color:"#fff" }}>
                      {prix > 0 ? prix.toLocaleString("fr-FR") : "—"}
                    </div>
                    <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)" }}>FCFA</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background:"rgba(77,201,122,0.06)",
              border:"1px solid rgba(77,201,122,0.15)",
              borderRadius:"12px", padding:"14px 16px" }}>
              {[
                "🔒 Paiement sécurisé",
                "✅ Activation immédiate (CinetPay)",
                "💰 Solde cumulatif — s'ajoute à votre crédit actuel",
                "📞 Support CCI-BF : +226 25 30 61 22",
              ].map(item => (
                <div key={item} style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)",
                  padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* ── COLONNE DROITE : formulaire ── */}
          <div style={{ flex:1 }}>

            {/* SUCCÈS */}
            {success ? (
              <div style={{ background:"#fff", borderRadius:"16px",
                border:"1px solid var(--border)", padding:"48px", textAlign:"center" }}>
                <div style={{ fontSize:"56px", marginBottom:"16px" }}>
                  {modePaiement === "cinetpay" ? "" : ""}
                </div>
                <h2 style={{ color:"var(--green-dark)", fontSize:"24px", marginBottom:"12px" }}>
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
                  <div style={{ fontFamily:"monospace", fontSize:"20px", fontWeight:900,
                    color:"var(--green-dark)", letterSpacing:"0.1em" }}>
                    {reference}
                  </div>
                </div>

                <p style={{ color:"var(--text-muted)", lineHeight:1.7,
                  marginBottom:"24px", fontSize:"14px" }}>
                  {modePaiement === "cinetpay" ? (
                    <>Votre paiement est en cours de vérification.<br/>
                    <strong>{prix.toLocaleString("fr-FR")} FCFA</strong> seront
                    ajoutés à votre solde dès confirmation.</>
                  ) : (
                    <>Présentez-vous à la <strong>CCI-BF</strong> avec la référence ci-dessus.<br/>
                    Votre crédit sera activé sous <strong>24h</strong> après paiement.</>
                  )}
                </p>

                {modePaiement === "agence" && (
                  <div style={{ background:"rgba(212,168,48,0.08)",
                    border:"1px solid rgba(212,168,48,0.2)", borderRadius:"10px",
                    padding:"14px 18px", marginBottom:"24px", textAlign:"left" }}>
                    <div style={{ fontWeight:700, fontSize:"13px", color:"#D4A830", marginBottom:"8px" }}>
                       Adresse CCI-BF Ouagadougou
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
                  <button className="btn-save" onClick={() => navigate("/profil")}>
                    Voir mon solde
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
                  {[{ n:1, label:"Mode de paiement" }, { n:2, label:"Confirmation" }]
                    .map((s, i) => (
                    <div key={s.n} style={{ display:"flex", alignItems:"center", flex:i<1?1:"none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <div style={{ width:"26px", height:"26px", borderRadius:"50%",
                          background: etape>s.n ? "var(--green-light)"
                            : etape===s.n ? "rgba(77,201,122,0.3)" : "rgba(255,255,255,0.1)",
                          border: etape===s.n ? "2px solid var(--green-light)" : "2px solid transparent",
                          color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:"12px", fontWeight:800, flexShrink:0 }}>
                          {etape > s.n ? "✓" : s.n}
                        </div>
                        <span style={{ fontSize:"12px", fontWeight:600,
                          color: etape>=s.n ? "#fff" : "rgba(255,255,255,0.3)" }}>
                          {s.label}
                        </span>
                      </div>
                      {i < 1 && (
                        <div style={{ flex:1, height:"2px",
                          background:"rgba(255,255,255,0.1)", margin:"0 12px" }}/>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ padding:"28px" }}>

                  {/* Message erreur */}
                  {erreur && (
                    <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                      borderRadius:"10px", padding:"12px 16px", marginBottom:"20px",
                      color:"#CC3333", fontSize:"13px", fontWeight:600 }}>
                      ⚠️ {erreur}
                    </div>
                  )}

                  {/* ÉTAPE 1 */}
                  {etape === 1 && (
                    <>
                      <h3 style={{ fontSize:"20px", color:"var(--text-dark)", marginBottom:"8px" }}>
                        Comment souhaitez-vous payer ?
                      </h3>
                      <p style={{ color:"var(--text-muted)", fontSize:"13px", marginBottom:"24px" }}>
                        Choisissez votre mode de règlement pour{" "}
                        <strong>{prix.toLocaleString("fr-FR")} FCFA</strong>.
                      </p>

                      <div style={{ display:"flex", flexDirection:"column",
                        gap:"12px", marginBottom:"24px" }}>
                        {MODES_PAIEMENT.map(mode => (
                          <button key={mode.id} onClick={() => setMode(mode.id)}
                            style={{ padding:"20px 24px", borderRadius:"14px", textAlign:"left",
                              border: modePaiement===mode.id
                                ? "2px solid var(--green-light)"
                                : "1.5px solid var(--border)",
                              background: modePaiement===mode.id ? "var(--green-pale)" : "#fff",
                              cursor:"pointer", fontFamily:"inherit", transition:"all 0.2s",
                              display:"flex", alignItems:"center", gap:"16px" }}>
                            <span style={{ fontSize:"32px", flexShrink:0 }}>{mode.icon}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", alignItems:"center",
                                gap:"10px", marginBottom:"5px" }}>
                                <span style={{ fontWeight:700, fontSize:"15px",
                                  color: modePaiement===mode.id
                                    ? "var(--green-dark)" : "var(--text-dark)" }}>
                                  {mode.label}
                                </span>
                                <span style={{ background:`${mode.badgeColor}18`, color:mode.badgeColor,
                                  border:`1px solid ${mode.badgeColor}40`, borderRadius:"100px",
                                  padding:"2px 10px", fontSize:"10px", fontWeight:800 }}>
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
                                ? "2px solid var(--green-light)"
                                : "2px solid var(--border)",
                              background: modePaiement===mode.id ? "var(--green-light)" : "transparent",
                              display:"flex", alignItems:"center", justifyContent:"center",
                              flexShrink:0, fontSize:"11px", color:"#0A3D1F", fontWeight:900 }}>
                              {modePaiement===mode.id ? "✓" : ""}
                            </div>
                          </button>
                        ))}
                      </div>

                      <button className="btn-save" style={{ padding:"13px 32px" }}
                        disabled={!modePaiement} onClick={() => setEtape(2)}>
                        Continuer →
                      </button>
                    </>
                  )}

                  {/* ÉTAPE 2 */}
                  {etape === 2 && (
                    <>
                      <h3 style={{ fontSize:"20px", color:"var(--text-dark)", marginBottom:"20px" }}>
                        Confirmation de commande
                      </h3>

                      <div style={{ background:"var(--off-white)", borderRadius:"12px",
                        border:"1px solid var(--border)", padding:"18px", marginBottom:"20px" }}>
                        {[
                          { label:"Abonné",  value:`${user.prenom} ${user.nom}` },
                          { label:"Email",   value:user.email || "—" },
                          { label:"Pack",    value:nomPack },
                          { label:"Crédit",  value:`${prix.toLocaleString("fr-FR")} FCFA à ajouter` },
                          { label:"Mode",    value:MODES_PAIEMENT.find(m=>m.id===modePaiement)?.label },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ display:"flex", gap:"16px",
                            padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                            <span style={{ width:"100px", fontSize:"12px", fontWeight:700,
                              color:"var(--text-muted)", textTransform:"uppercase",
                              letterSpacing:"0.06em", flexShrink:0 }}>
                              {label}
                            </span>
                            <span style={{ fontSize:"14px", color:"var(--text-dark)", fontWeight:500 }}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {modePaiement === "cinetpay" && (
                        <div style={{ background:"rgba(77,201,122,0.06)",
                          border:"1px solid rgba(77,201,122,0.2)", borderRadius:"10px",
                          padding:"14px 16px", marginBottom:"20px",
                          fontSize:"13px", color:"var(--text-mid)", lineHeight:1.7 }}>
                           Vous allez être redirigé vers <strong>CinetPay</strong>.
                          Votre crédit sera <strong>ajouté immédiatement</strong> après confirmation.
                        </div>
                      )}

                      {modePaiement === "agence" && (
                        <div style={{ background:"rgba(212,168,48,0.06)",
                          border:"1px solid rgba(212,168,48,0.2)", borderRadius:"10px",
                          padding:"14px 16px", marginBottom:"20px",
                          fontSize:"13px", color:"var(--text-mid)", lineHeight:1.7 }}>
                           Une référence sera générée. Présentez-la à la <strong>CCI-BF</strong>.
                          Activation sous <strong>24h</strong> après paiement.
                        </div>
                      )}

                      <div style={{ fontSize:"12px", color:"var(--text-muted)", marginBottom:"20px",
                        lineHeight:1.6, padding:"12px 14px",
                        background:"var(--off-white)", borderRadius:"8px",
                        border:"1px solid var(--border)" }}>
                        En validant, vous acceptez les{" "}
                        <span style={{ color:"var(--green-bright)", cursor:"pointer", fontWeight:600 }}>
                          Conditions Générales d'Utilisation
                        </span>{" "}
                        de la plateforme NERE CCI-BF.
                      </div>

                      <div style={{ display:"flex", gap:"10px" }}>
                        <button className="btn-cancel" onClick={() => setEtape(1)}>
                          ← Modifier
                        </button>
                        <button className="btn-save" style={{ padding:"13px 32px" }}
                          disabled={loading} onClick={handlePayer}>
                          {loading
                            ? " Traitement..."
                            : modePaiement === "cinetpay"
                            ? `Payer ${prix.toLocaleString("fr-FR")} FCFA`
                            : "Générer ma référence"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="dash-footer">
          <span> CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <span>Paiement sécurisé · CinetPay · Agence CCI-BF</span>
        </footer>
      </div>
    </div>
  );
}