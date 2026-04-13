import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/home.css";

// ── Packs NERE CCI-BF (basés sur solde FCFA) ──
const PACKS = [
  {
    id: "pack1", packId:"pack1",
    nom: "Pack 1", niveau:1, 
    couleur:"#4DC97A", fondCarte:"rgba(77,201,122,0.06)", bordure:"rgba(77,201,122,0.25)",
    prix: { mensuel: 5000, annuel: 50000 }, reductionAnnuelle: 17, 
    description:"Créditez votre compte avec 5 000 FCFA. Déduction directe à chaque requête.",
  },
  {
    id: "pack2", packId:"pack2",
    nom: "Pack 2", niveau:2, 
    couleur:"#22A052", fondCarte:"rgba(34,160,82,0.08)", bordure:"rgba(34,160,82,0.35)",
    prix: { mensuel: 10000, annuel: 100000 }, reductionAnnuelle: 17, 
    description:"Créditez votre compte avec 10 000 FCFA. Déduction directe à chaque requête.",
  },
  {
    id: "pack3", packId:"pack3",
    nom: "Pack 3", niveau:3, 
    couleur:"#D4A830", fondCarte:"rgba(212,168,48,0.06)", bordure:"rgba(212,168,48,0.3)",
    prix: { mensuel: 15000, annuel: 150000 }, reductionAnnuelle: 17, prixMin:15000, flexible:true, 
    description:"Créditez votre compte avec un montant personnalisé. Déduction directe à chaque requête.",
  },
];

function formaterPrix(prix) {
  return prix.toLocaleString("fr-FR");
}

export default function Formules() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const [hover, setHover]               = useState(null);
  const [packsAPI, setPacksAPI]         = useState([]);
  const [montantPack3, setMontantPack3] = useState("15000");
  const [showPack3Input, setShowPack3Input] = useState(false);
  const [erreurPack3, setErreurPack3]   = useState("");
  const [soldeActuel, setSoldeActuel]   = useState(null);
  const periode = "mensuel";

  // Charger le solde actuel
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:5000/api/abonnements/mon-solde", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => { if (data.success && data.data) setSoldeActuel(data.data); })
    .catch(() => {});
  }, []);

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
      a.niveau === p.niveau
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
    if (pack.flexible) {
      setShowPack3Input(true);
    } else {
      navigate("/paiement", { state: { pack, periode } });
    }
  };

  const confirmerPack3 = () => {
    const pack = PACKS.find(p => p.id === "pack3");
    let montant = Number(montantPack3);
    if (Number.isNaN(montant) || montant < 15000) {
      setErreurPack3("Montant invalide : minimum 15 000 FCFA");
      return;
    }
    setErreurPack3("");
    navigate("/paiement", { state: { pack: { ...pack, prix: { mensuel: montant } }, periode } });
    setShowPack3Input(false);
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif",
      background:"#00904C", overflow:"hidden", position:"relative" }}>

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
        </div>

        {/* MODAL PACK 3 FLEXIBLE */}
        {showPack3Input && (
          <div style={{position:"fixed",inset:0,zIndex:1000,
            background:"rgba(0,0,0,0.7)",display:"flex",
            alignItems:"center",justifyContent:"center",padding:"20px"}}>
            <div style={{background:"#c1a81a",border:"1px solid rgba(212,168,48,0.3)",
              borderRadius:"20px",padding:"40px",maxWidth:"420px",width:"100%",
              textAlign:"center"}}>
              <div style={{fontSize:"40px",marginBottom:"16px"}}></div>
              <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",
                color:"#0b0b0b",marginBottom:"8px"}}>Pack 3 — Montant flexible</h3>
              <p style={{color:"rgba(8, 8, 8, 0.5)",fontSize:"13px",
                lineHeight:1.7,marginBottom:"24px"}}>
                Saisissez le montant à créditer sur votre compte.<br/>
                Montant personnalisé.
              </p>
              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:"12px",
                padding:"20px",marginBottom:"20px"}}>
                <div style={{fontSize:"11px",fontWeight:700,
                  color:"rgba(255,255,255,0.4)",textTransform:"uppercase",
                  letterSpacing:"0.08em",marginBottom:"10px"}}>
                  Montant à créditer (FCFA)
                </div>
                <input type="number" min="15000" step="1000"
                  value={montantPack3}
                  onChange={e => {
                    const raw = e.target.value;
                    if (raw === "") {
                      setMontantPack3("");
                    } else {
                      const digits = raw.replace(/\D/g, "");
                      setMontantPack3(digits);
                    }
                    setErreurPack3("");
                  }}
                  style={{width:"100%",padding:"14px",borderRadius:"10px",
                    border:"1.5px solid rgba(212,168,48,0.4)",
                    background:"rgba(255,255,255,0.07)",color:"#fff",
                    fontSize:"22px",fontWeight:800,textAlign:"center",
                    fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                <div style={{fontSize:"12px",color:"rgba(255,255,255,0.3)",
                  marginTop:"8px"}}>
                  Minimum : 15 000 FCFA, montant libre supérieur
                </div>
                {erreurPack3 && (
                  <div style={{color:"#FF6B6B", fontSize:"12px", marginTop:"10px", fontWeight:700}}>
                    {erreurPack3}
                  </div>
                )}
              </div>
              {/* Suggestions rapides */}
              <div style={{display:"flex",gap:"8px",justifyContent:"center",
                marginBottom:"20px"}}>
                {[20000,30000,50000,100000].map(m => (
                  <button key={m}
                    onClick={() => setMontantPack3(String(m))}
                    style={{padding:"6px 12px",borderRadius:"8px",
                      background: Number(montantPack3)===m ? "#D4A830" : "rgba(255,255,255,0.08)",
                      border:"none",color: Number(montantPack3)===m ? "#0A3D1F" : "rgba(255,255,255,0.5)",
                      fontWeight:700,fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>
                    {m.toLocaleString()}
                  </button>
                ))}
              </div>
              <button onClick={confirmerPack3}
                style={{width:"100%",padding:"14px",borderRadius:"12px",
                  background:"linear-gradient(135deg,#D4A830,#A07820)",
                  border:"none",color:"#0A3D1F",fontWeight:800,
                  fontSize:"15px",cursor:"pointer",fontFamily:"inherit",
                  marginBottom:"10px"}}>
                Continuer avec {(Number(montantPack3) || 15000).toLocaleString()} FCFA →
              </button>
              <button onClick={() => setShowPack3Input(false)}
                style={{color:"rgba(255,255,255,0.4)",background:"none",
                  border:"none",cursor:"pointer",fontSize:"13px"}}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* SOLDE ACTUEL si connecté */}
        {user && soldeActuel && (
          <div style={{maxWidth:"1100px",margin:"0 auto",padding:"0 48px 24px"}}>
            <div style={{background:"rgba(77,201,122,0.08)",
              border:"1px solid rgba(77,201,122,0.2)",
              borderRadius:"14px",padding:"16px 24px",
              display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:"13px",color:"rgba(255,255,255,0.5)"}}>
                Votre solde actuel · {soldeActuel.packLabel}
              </div>
              <div style={{fontFamily:"'Playfair Display',serif",
                fontSize:"22px",fontWeight:900,
                color: soldeActuel.solde < 2000 ? "#FF8080" :
                       soldeActuel.solde < 5000 ? "#D4A830" : "#4DC97A"}}>
                {soldeActuel.solde?.toLocaleString("fr-FR")} FCFA
              </div>
            </div>
          </div>
        )}

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
                        /mois
                      </div>
                    </div>
                  </div>
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
                  {user
                    ? pack.flexible
                      ? ` Choisir le montant →`
                      : `Souscrire `
                    : `Commencer avec ${pack.nom}`}
                </button>

                {/* Mention paiement */}
                <p style={{ textAlign:"center", fontSize:"11px",
                  color:"rgba(255,255,255,0.2)", marginTop:"10px", marginBottom:0 }}>
                 
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
            <span style={{ fontSize:"20px" }}></span>
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
              {  titre:"Renouvellement automatique",
                desc:"Votre pack se renouvelle automatiquement à l'échéance." },
              {  titre:"Upgrade possible à tout moment",
                desc:"Passez à un pack supérieur en cours de période. La différence est proratisée." },
              {  titre:"Paiement en agence",
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
            color:"#", textAlign:"center", marginBottom:"32px" }}>
            Questions fréquentes
          </h2>
          {[
            { q:"Puis-je changer de pack en cours d'abonnement ?",
              r:"Oui, vous pouvez augmenter votre credit  à tout moment. La différence est calculée au prorata de la période restante." },
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
              background:"#ffffff",
              color:"#00904CF", fontWeight:800, fontSize:"15px",
              border:"none", cursor:"pointer", fontFamily:"inherit" }}>
              Contacter un agent
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