import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoNERE from "../../assets/nere.jpg";
import "../../styles/dashboard.css";

const PACKS = [
  {
    id: "pack1", nom: "Pack 1", niveau: 1,
    prix: { mensuel: 5000, annuel: 50000 },
    description: "Créditez votre compte avec 5 000 FCFA. Déduction directe à chaque requête.",
    flexible: false,
  },
  {
    id: "pack2", nom: "Pack 2", niveau: 2, populaire: true,
    prix: { mensuel: 10000, annuel: 100000 },
    description: "Créditez votre compte avec 10 000 FCFA. Déduction directe à chaque requête.",
    flexible: false,
  },
  {
    id: "pack3", nom: "Pack 3", niveau: 3, flexible: true,
    prixMin: 15000,
    prix: { mensuel: 15000, annuel: 150000 },
    description: "Montant personnalisé à partir de 15 000 FCFA. Déduction directe à chaque requête.",
  },
];

const FAQS = [
  { q: "Puis-je changer de pack en cours d'abonnement ?", r: "Oui, vous pouvez augmenter votre crédit à tout moment. La différence est calculée au prorata de la période restante." },
  { q: "Que se passe-t-il quand mon quota est épuisé ?",   r: "Votre accès aux données est bloqué jusqu'au renouvellement. Vous pouvez consulter vos demandes en cours." },
  { q: "Comment payer en agence CCI-BF ?",                 r: "Soumettez votre demande en ligne, puis rendez-vous à la CCI-BF avec le numéro de référence. Activation sous 24h." },
  { q: "Les prix sont-ils HT ou TTC ?",                    r: "Les prix affichés sont en FCFA TTC, toutes taxes comprises." },
];

const S = {
  page:     { fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif", background:"#fff", color:"#111", minHeight:"100vh" },
  navLink:  { fontSize:"20px", fontWeight:500, color:"#ffffff", cursor:"pointer" },
  navLinkActive: { fontSize:"14px", fontWeight:700, color:"#4DC97A", cursor:"pointer", borderBottom:"2px solid #4DC97A", paddingBottom:"2px" },
  navActions: { display:"flex", gap:"10px" },
  btnOutline: { padding:"8px 20px", border:"1.5px solid #fff", borderRadius:"8px", color:"#fff", background:"transparent", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" },
  btnSolid:   { padding:"8px 20px", border:"none", borderRadius:"8px", background:"#fff", color:"#00904C", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" },
  hero: { textAlign:"center", padding:"64px 48px 40px", borderBottom:"1px solid #f5f5f5" },
  heroBadge: { display:"inline-flex", alignItems:"center", gap:"6px", background:"#fff0f0", border:"1px solid #ffd6d6", borderRadius:"100px", padding:"5px 16px", fontSize:"11px", fontWeight:700, color:"#ED1C24", marginBottom:"20px", textTransform:"uppercase", letterSpacing:"0.08em" },
  heroTitle: { fontSize:"clamp(30px,5vw,44px)", fontWeight:800, color:"#0a0a0a", marginBottom:"14px", lineHeight:1.15, fontFamily:"Georgia,serif" },
  heroSubtitle: { color:"#777", fontSize:"16px", maxWidth:"480px", margin:"0 auto", lineHeight:1.7 },
  packsGrid: { display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:"20px", padding:"48px 48px 0", maxWidth:"1080px", margin:"0 auto" },
  packCard: (h, f) => ({
    borderRadius:"16px", border: f ? "2px solid #00904C" : "1.5px solid #e8e8e8",
    background:"#fff", padding:"28px 24px", position:"relative",
    transition:"transform 0.25s,box-shadow 0.25s",
    transform: h ? "translateY(-6px)" : "translateY(0)",
    boxShadow: h ? "0 16px 40px rgba(0,0,0,0.09)" : f ? "0 4px 20px rgba(0,144,76,0.08)" : "none",
  }),
  packBadge: { position:"absolute", top:"-13px", left:"50%", transform:"translateX(-50%)", background:"#00904C", color:"#fff", padding:"4px 16px", borderRadius:"100px", fontSize:"11px", fontWeight:700, letterSpacing:"0.08em", whiteSpace:"nowrap", textTransform:"uppercase" },
  packLevel: (n) => ({ display:"inline-flex", alignItems:"center", justifyContent:"center", width:"32px", height:"32px", borderRadius:"8px", fontWeight:800, fontSize:"14px", marginBottom:"12px", background: n===1?"#e8f8ef":n===2?"#d0f0e0":"#fff3cd", color: n===1?"#00904C":n===2?"#007a40":"#b8860b" }),
  packName:  { fontSize:"19px", fontWeight:800, color:"#111", fontFamily:"Georgia,serif", marginBottom:"6px" },
  packDesc:  { fontSize:"12.5px", color:"#888", lineHeight:1.6, margin:0 },
  packPrice: { padding:"18px 0", borderTop:"1px solid #f0f0f0", borderBottom:"1px solid #f0f0f0", margin:"20px 0" },
  priceRow:  { display:"flex", alignItems:"flex-end", gap:"6px" },
  priceAmount: (c) => ({ fontSize:"40px", fontWeight:800, color:c||"#111", fontFamily:"Georgia,serif", lineHeight:1 }),
  priceCurrency: { fontSize:"13px", fontWeight:700, color:"#aaa", paddingBottom:"6px" },
  pricePeriod:   { fontSize:"11px", color:"#bbb" },
  btnPrimary:   (h) => ({ width:"100%", padding:"13px", borderRadius:"10px", border:"none", background: h?"#007a40":"#00904C", color:"#fff", fontWeight:700, fontSize:"14px", cursor:"pointer", fontFamily:"inherit", transition:"background 0.2s" }),
  btnSecondary: { width:"100%", padding:"13px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#f5f5f5", color:"#333", fontWeight:700, fontSize:"14px", cursor:"pointer", fontFamily:"inherit" },
  btnGold:      { width:"100%", padding:"13px", borderRadius:"10px", border:"none", background:"linear-gradient(135deg,#f5c842,#d4a827)", color:"#5a3d00", fontWeight:700, fontSize:"14px", cursor:"pointer", fontFamily:"inherit" },
  infoStrip: { display:"flex", alignItems:"center", gap:"10px", background:"#fff5f5", border:"1px solid #ffd6d6", borderRadius:"12px", padding:"14px 20px", maxWidth:"1080px", margin:"28px auto 0" },
  tagsRow:   { display:"flex", gap:"8px", flexWrap:"wrap", maxWidth:"1080px", margin:"20px auto 0", padding:"0 48px" },
  tagGreen:  { padding:"6px 14px", borderRadius:"100px", fontSize:"12px", fontWeight:600, background:"#e8f8ef", color:"#00904C" },
  tagRed:    { padding:"6px 14px", borderRadius:"100px", fontSize:"12px", fontWeight:600, background:"#fff0f0", color:"#ED1C24" },
  faqSection: { maxWidth:"680px", margin:"48px auto 0", padding:"0 48px" },
  faqTitle:   { fontFamily:"Georgia,serif", fontSize:"26px", fontWeight:800, color:"#111", textAlign:"center", marginBottom:"28px" },
  faqItem:    { borderBottom:"1px solid #f0f0f0", padding:"18px 0" },
  faqQ:       { fontWeight:700, fontSize:"14px", color:"#111", marginBottom:"7px", display:"flex", alignItems:"flex-start", gap:"10px" },
  faqDot:     { width:"6px", height:"6px", borderRadius:"50%", background:"#00904C", marginTop:"5px", flexShrink:0 },
  faqA:       { fontSize:"13px", color:"#777", lineHeight:1.7, paddingLeft:"16px", margin:0 },
  ctaSection: { textAlign:"center", padding:"56px 48px", marginTop:"48px", background:"#00904C" },
  ctaTitle:   { fontFamily:"Georgia,serif", fontSize:"28px", fontWeight:800, color:"#fff", marginBottom:"10px" },
  ctaSubtitle:{ color:"rgba(255,255,255,0.65)", fontSize:"14px", marginBottom:"24px" },
  ctaBtns:    { display:"flex", gap:"12px", justifyContent:"center" },
  ctaBtnWhite:{ padding:"13px 28px", borderRadius:"10px", background:"#fff", color:"#00904C", fontWeight:700, fontSize:"14px", border:"none", cursor:"pointer", fontFamily:"inherit" },
  ctaBtnGhost:{ padding:"13px 28px", borderRadius:"10px", background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.8)", fontWeight:600, fontSize:"14px", border:"1px solid rgba(255,255,255,0.2)", cursor:"pointer", fontFamily:"inherit" },
  modalOverlay:{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  modalBox:    { background:"#fff", borderRadius:"20px", padding:"40px", maxWidth:"420px", width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle:  { fontFamily:"Georgia,serif", fontSize:"22px", fontWeight:800, color:"#111", marginBottom:"8px" },
  modalSubtitle:{ color:"#777", fontSize:"13px", lineHeight:1.7, marginBottom:"24px" },
  modalInputWrap:{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:"12px", padding:"20px", marginBottom:"16px" },
  modalInputLabel:{ fontSize:"11px", fontWeight:700, color:"#888", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px", display:"block" },
  modalInput:  { width:"100%", padding:"14px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#111", fontSize:"22px", fontWeight:800, textAlign:"center", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  modalHint:   { fontSize:"12px", color:"#bbb", marginTop:"8px", marginBottom:0 },
  modalError:  { color:"#ED1C24", fontSize:"12px", marginTop:"10px", fontWeight:700, marginBottom:0 },
  quickBtnsRow:{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"20px", flexWrap:"wrap" },
  modalConfirmBtn:{ width:"100%", padding:"14px", borderRadius:"12px", background:"linear-gradient(135deg,#f5c842,#d4a827)", border:"none", color:"#5a3d00", fontWeight:800, fontSize:"15px", cursor:"pointer", fontFamily:"inherit", marginBottom:"10px" },
  modalCancelBtn: { color:"#aaa", background:"none", border:"none", cursor:"pointer", fontSize:"13px", fontFamily:"inherit" },
  soldeBar: { background:"rgba(0,144,76,0.05)", border:"1px solid rgba(0,144,76,0.15)", borderRadius:"14px", padding:"16px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:"1080px", margin:"0 auto 24px" },
};

export default function Formules() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [hover, setHover]               = useState(null);
  const [montantPack3, setMontantPack3] = useState("15000");
  const [showPack3Input, setShowPack3Input] = useState(false);
  const [erreurPack3, setErreurPack3]   = useState("");
  const [soldeActuel, setSoldeActuel]   = useState(null);
  const [menuOpen, setMenuOpen]         = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/abonnements/mon-solde", { headers:{ Authorization:`Bearer ${token}` } })
      .then(r=>r.json())
      .then(d=>{ if(d.success && d.data) setSoldeActuel(d.data); })
      .catch(()=>{});
  }, []);

  const handleChoisir = (pack) => {
    if (!user) { navigate("/inscription"); return; }
    if (pack.flexible) { setShowPack3Input(true); }
    else               { navigate("/paiement", { state:{ pack, periode:"mensuel" } }); }
  };

  const confirmerPack3 = () => {
    const pack   = PACKS.find(p=>p.id==="pack3");
    const montant = Number(montantPack3);
    if (Number.isNaN(montant) || montant < 15000) {
      setErreurPack3("Montant invalide : minimum 15 000 FCFA"); return;
    }
    setErreurPack3("");
    navigate("/paiement", { state:{ pack:{...pack, prix:{mensuel:montant}}, periode:"mensuel" } });
    setShowPack3Input(false);
  };

  const getSoldeColor = (s) => s<2000?"#ED1C24":s<5000?"#d4a827":"#00904C";
  const getPriceColor = (n) => n===2?"#00904C":n===3?"#b8860b":"#111";
  const initiales     = user ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase() : "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <div style={S.page}>

      {/* NAVBAR */}
      <nav className="dash-navbar">
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <img src={logoNERE} alt="NERE" style={{height:"80px",width:"auto",borderRadius:"6px",flexShrink:0}}/>
          <div style={{display:"flex",flexDirection:"column",lineHeight:1.4}}>
            <span style={{fontSize:"11px",fontWeight:800,color:"#fff",letterSpacing:"0.06em",textTransform:"uppercase"}}>Fichier NERE</span>
            <span style={{fontSize:"10px",color:"rgba(255,255,255,0.85)"}}>Registre national des entreprises<br/>Du Burkina Faso</span>
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:"24px"}}>
          {[
            {label:"Accueil",path:"/"},
            {label:"Publications",path:"/publications"},
            {label:"Recherche",path:"/rechercheacc"},
            {label:"Contact",path:"/contact"},
            {label:"Chat",path:"/chat"},
          ].map(l=>(
            <span key={l.label} style={S.navLink} onClick={()=>navigate(l.path)}>{l.label}</span>
          ))}
          <span style={S.navLinkActive}>Formules</span>
        </div>

        <div style={S.navActions}>
          {user ? (
            <div style={{position:"relative"}}>
              <div className="user-nav-chip" onClick={()=>setMenuOpen(o=>!o)}
                style={{display:"flex",alignItems:"center",gap:"8px",padding:"6px 14px",borderRadius:"100px",background:"rgba(255,255,255,0.15)",cursor:"pointer",border:"1px solid rgba(255,255,255,0.2)"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"#fff",color:"#00904C",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:700}}>{initiales}</div>
                <span style={{fontSize:"13px",fontWeight:600,color:"#fff"}}>{user.prenom}</span>
                <span style={{fontSize:"10px",color:"rgba(255,255,255,0.5)"}}>▾</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{position:"fixed",inset:0,zIndex:50}} onClick={()=>setMenuOpen(false)}/>
                  <div style={{position:"absolute",zIndex:9999,top:"calc(100% + 8px)",right:0,background:"#00904C",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.15)",minWidth:"200px",overflow:"hidden",boxShadow:"0 10px 30px rgba(0,0,0,0.25)"}}>
                    <div style={{padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
                      <div style={{fontWeight:700,color:"#fff",fontSize:"14px"}}>{user.prenom} {user.nom}</div>
                      <div style={{fontSize:"12px",color:"rgba(255,255,255,0.6)"}}>{user.email}</div>
                    </div>
                    {[{label:"👤 Mon Profil",path:"/profil"},{label:"💳 Mon Abonnement",path:"/paiement"}].map(i=>(
                      <div key={i.label} style={{padding:"11px 16px",color:"rgba(255,255,255,0.85)",fontSize:"13px",cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.1)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        onClick={()=>{navigate(i.path);setMenuOpen(false);}}>
                        {i.label}
                      </div>
                    ))}
                    <div style={{borderTop:"1px solid rgba(255,255,255,0.1)"}}>
                      <div style={{padding:"11px 16px",color:"#FF8080",fontSize:"13px",cursor:"pointer",fontWeight:600}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,107,107,0.1)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                        onClick={handleLogout}>
                        🚪 Déconnexion
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button style={S.btnOutline} onClick={()=>navigate("/connexion")}>Connexion</button>
              <button style={S.btnSolid}   onClick={()=>navigate("/inscription")}>S'inscrire</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={S.hero}>
        <div style={S.heroBadge}><div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#ED1C24"}}/>Base de données CCI-BF</div>
        <h1 style={S.heroTitle}>Choisissez votre <span style={{color:"#00904C"}}>formule</span></h1>
        <p style={S.heroSubtitle}>Accédez à la base de données NERE selon vos besoins. Packs prépayés avec déduction directe à chaque requête.</p>
      </div>

      {/* MODAL PACK 3 */}
      {showPack3Input && (
        <div style={S.modalOverlay} onClick={()=>setShowPack3Input(false)}>
          <div style={S.modalBox} onClick={e=>e.stopPropagation()}>
            <h3 style={S.modalTitle}>Pack 3 — Montant flexible</h3>
            <p style={S.modalSubtitle}>Saisissez le montant à créditer.<br/>Minimum 15 000 FCFA.</p>
            <div style={S.modalInputWrap}>
              <label style={S.modalInputLabel}>Montant à créditer (FCFA)</label>
              <input type="number" min="15000" step="1000" value={montantPack3}
                onChange={e=>{setMontantPack3(e.target.value.replace(/\D/g,""));setErreurPack3("");}}
                style={S.modalInput}/>
              <p style={S.modalHint}>Minimum : 15 000 FCFA</p>
              {erreurPack3 && <p style={S.modalError}>{erreurPack3}</p>}
            </div>
            <div style={S.quickBtnsRow}>
              {[20000,30000,50000,100000].map(m=>(
                <button key={m} onClick={()=>setMontantPack3(String(m))}
                  style={{padding:"6px 14px",borderRadius:"8px",border:"1.5px solid",
                    borderColor:Number(montantPack3)===m?"#d4a827":"#e8e8e8",
                    background:Number(montantPack3)===m?"#fff3cd":"#fff",
                    color:Number(montantPack3)===m?"#5a3d00":"#888",
                    fontWeight:700,fontSize:"12px",cursor:"pointer",fontFamily:"inherit"}}>
                  {m.toLocaleString("fr-FR")}
                </button>
              ))}
            </div>
            <button onClick={confirmerPack3} style={S.modalConfirmBtn}>
              Continuer avec {(Number(montantPack3)||15000).toLocaleString("fr-FR")} FCFA →
            </button>
            <button onClick={()=>setShowPack3Input(false)} style={S.modalCancelBtn}>Annuler</button>
          </div>
        </div>
      )}

      {/* SOLDE ACTUEL */}
      {user && soldeActuel && (
        <div style={{padding:"28px 48px 0",maxWidth:"1080px",margin:"0 auto"}}>
          <div style={S.soldeBar}>
            <span style={{fontSize:"13px",color:"#888"}}>Votre solde actuel · {soldeActuel.packLabel}</span>
            <span style={{fontFamily:"Georgia,serif",fontSize:"22px",fontWeight:900,color:getSoldeColor(soldeActuel.solde)}}>
              {soldeActuel.solde?.toLocaleString("fr-FR")} FCFA
            </span>
          </div>
        </div>
      )}

      {/* PACKS */}
      <div style={S.packsGrid}>
        {PACKS.map(pack=>{
          const isHover = hover===pack.id;
          const prix    = pack.prix.mensuel;
          return (
            <div key={pack.id}
              onMouseEnter={()=>setHover(pack.id)}
              onMouseLeave={()=>setHover(null)}
              style={S.packCard(isHover, pack.populaire)}>

              {pack.populaire && <div style={S.packBadge}>Le plus populaire</div>}

              <div style={{marginBottom:"20px"}}>
                <div style={S.packLevel(pack.niveau)}>{pack.niveau}</div>
                <div style={S.packName}>{pack.nom}</div>
                <p style={S.packDesc}>{pack.description}</p>
              </div>

              {/* PRIX */}
              <div style={S.packPrice}>
                <div style={S.priceRow}>
                  <span style={S.priceAmount(getPriceColor(pack.niveau))}>
                    {prix.toLocaleString("fr-FR")}{pack.flexible?"+":""}
                  </span>
                  <div style={{paddingBottom:"6px"}}>
                    <div style={S.priceCurrency}>FCFA</div>
                    {pack.flexible && <div style={S.pricePeriod}>et plus</div>}
                  </div>
                </div>
              </div>

              {pack.populaire ? (
                <button onClick={()=>handleChoisir(pack)} style={S.btnPrimary(isHover)}>Souscrire</button>
              ) : pack.flexible ? (
                <button onClick={()=>handleChoisir(pack)} style={S.btnGold}>Choisir le montant →</button>
              ) : (
                <button onClick={()=>handleChoisir(pack)} style={S.btnSecondary}>
                  {user?"Souscrire":`Commencer avec ${pack.nom}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* INFO */}
      <div style={{padding:"0 48px"}}>
        <div style={S.infoStrip}>
          <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#ED1C24",flexShrink:0}}/>
          <div>
            <p style={{fontWeight:700,fontSize:"13px",color:"#ED1C24",margin:0}}>Quota atteint = accès bloqué jusqu'au renouvellement</p>
            <p style={{fontSize:"12px",color:"#c0504a",marginTop:"2px",marginBottom:0}}>Aucun dépassement possible — renouvelez ou changez de pack avant l'échéance.</p>
          </div>
        </div>
      </div>

      {/* TAGS */}
      <div style={S.tagsRow}>
        <span style={S.tagGreen}>Renouvellement automatique</span>
        <span style={S.tagGreen}>Upgrade possible à tout moment</span>
        <span style={S.tagRed}>Paiement en agence CCI-BF</span>
        <span style={S.tagGreen}>Activation sous 24h</span>
      </div>

      {/* FAQ */}
      <div style={S.faqSection}>
        <h2 style={S.faqTitle}>Questions <span style={{color:"#ED1C24"}}>fréquentes</span></h2>
        {FAQS.map((faq,i)=>(
          <div key={i} style={S.faqItem}>
            <div style={S.faqQ}><div style={S.faqDot}/>{faq.q}</div>
            <p style={S.faqA}>{faq.r}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={S.ctaSection}>
        <h2 style={S.ctaTitle}>Besoin d'un devis personnalisé ?</h2>
        <p style={S.ctaSubtitle}>Pour les grandes structures ou les besoins spécifiques, contactez-nous directement.</p>
        <div style={S.ctaBtns}>
          <button style={S.ctaBtnWhite} onClick={()=>navigate("/chat")}>Contacter un agent</button>
          <button style={S.ctaBtnGhost} onClick={()=>navigate("/")}>Retour à l'accueil</button>
        </div>
      </div>

    </div>
  );
}