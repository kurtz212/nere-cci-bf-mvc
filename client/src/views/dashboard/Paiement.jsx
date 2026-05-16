// client/src/views/dashboard/Paiement.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import logoNERE from "../../assets/nere.png";

const API = "/api";

const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",     path:"/chat",         key:"messages"     },
];

export default function Paiement() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const [params]       = useSearchParams();

  const [user, setUser]           = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [solde, setSolde]         = useState(null);
  const [loading, setLoading]     = useState(false);
  const [erreur, setErreur]       = useState("");
  const [succes, setSucces]       = useState("");
  const [verifLoading, setVerifLoading] = useState(false);

  // Onglet : "mobile" | "agence"
  const [onglet, setOnglet]       = useState("mobile");

  // Agence — saisie numéro reçu
  const [numRecu, setNumRecu]     = useState("");
  const [photoRecu, setPhotoRecu] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [agenceLoading, setAgenceLoading] = useState(false);
  const [agenceSucces, setAgenceSucces]   = useState("");
  const [agenceErreur, setAgenceErreur]   = useState("");
  const fileRef = useRef(null);

  // Pack et montant transmis depuis Formules.jsx
  const packChoisi = location.state?.pack;
  const montant    = location.state?.montant || packChoisi?.prix || 5000;
  const nomPack    = packChoisi?.nom || "Recharge";

  // Statut retour LigdiCash
  const statusParam    = params.get("status");
  const refTransaction = params.get("ref");
  const isSucces       = statusParam === "success";
  const isAnnule       = statusParam === "cancelled";

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/connexion"); return; }
    setUser(JSON.parse(u));
    chargerSolde();
    if (isSucces && refTransaction) verifierTransaction();
  }, []);

  const chargerSolde = async () => {
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API}/abonnements/mon-solde`, { headers:{ Authorization:`Bearer ${token}` } });
      const d = await r.json();
      if (d.success && d.data) setSolde(d.data.solde);
    } catch {}
  };

  const verifierTransaction = async () => {
    setVerifLoading(true);
    await new Promise(r => setTimeout(r, 2500));
    await chargerSolde();
    setVerifLoading(false);
  };

  // ── Paiement Mobile Money LigdiCash ──
  const payerMobile = async () => {
    setErreur(""); setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API}/paiements/initier`, {
        method:  "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          packNom:      nomPack,
          montant:      montant,
          periode:      "recharge",
          modePaiement: "ligdicash",
        }),
      });
      const data = await res.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      if (data.demo) {
        setErreur(`Mode démo : ${data.message}`);
        return;
      }
      setErreur(data.message || "Impossible d'initier le paiement.");
    } catch {
      setErreur("Serveur inaccessible. Réessayez.");
    }
    setLoading(false);
  };

  // ── Validation reçu agence ──
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoRecu(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const validerAgence = async () => {
    if (!numRecu && !photoRecu) {
      setAgenceErreur("Veuillez saisir le numéro de reçu ou joindre une photo.");
      return;
    }
    setAgenceErreur(""); setAgenceLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Envoyer message automatique à l'admin avec le reçu
      const messageTexte = photoRecu
        ? `Validation paiement agence\n\nPack : ${nomPack}\nMontant : ${montant.toLocaleString("fr-FR")} FCFA\nNuméro de reçu : ${numRecu || "Non saisi"}\n Photo du reçu jointe.\n\nMerci de valider mon abonnement.`
        : `Validation paiement agence\n\nPack : ${nomPack}\nMontant : ${montant.toLocaleString("fr-FR")} FCFA\nNuméro de reçu : ${numRecu}\n\nMerci de valider mon abonnement.`;

      await fetch(`${API}/chat/envoyer-message`, {
        method:  "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ message: messageTexte }),
      });

      setAgenceSucces(" Votre demande a été envoyée à l'administration CCI-BF. Votre abonnement sera activé sous 24h ouvrables.");
    } catch {
      setAgenceErreur("Erreur lors de l'envoi. Réessayez.");
    }
    setAgenceLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/");
  };

  if (!user) return null;
  const initiales = `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase();

  // ── Page retour succès LigdiCash ──
  if (isSucces) {
    return (
      <div style={{ minHeight:"100vh", background:"#F5FAF7", fontFamily:"Arial, sans-serif",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ background:"#fff", borderRadius:"20px", border:"2px solid #00904C",
          padding:"48px 40px", textAlign:"center", maxWidth:"480px", width:"90%" }}>
          {verifLoading ? (
            <>
              <div style={{ fontSize:"48px", marginBottom:"16px" }}></div>
              <div style={{ fontWeight:700, fontSize:"18px", color:"#0A2410" }}>Vérification du paiement...</div>
              <div style={{ fontSize:"13px", color:"#6B9A7A", marginTop:"8px" }}>Patientez quelques secondes</div>
            </>
          ) : (
            <>
              <div style={{ fontSize:"64px", marginBottom:"16px" }}></div>
              <div style={{ fontWeight:900, fontSize:"24px", color:"#00904C", marginBottom:"8px" }}>Paiement reçu !</div>
              {solde !== null && (
                <div style={{ fontSize:"32px", fontWeight:900, color:"#0A2410", marginBottom:"6px" }}>
                  {solde.toLocaleString("fr-FR")} FCFA
                  <div style={{ fontSize:"13px", fontWeight:500, color:"#6B9A7A" }}>Solde disponible</div>
                </div>
              )}
              <div style={{ fontSize:"13px", color:"#6B9A7A", marginBottom:"28px", lineHeight:1.6 }}>
                Votre compte a été rechargé avec succès.<br/>
                Vous pouvez maintenant effectuer vos recherches.
              </div>
              <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={() => navigate("/demande")}
                  style={{ padding:"12px 24px", background:"#00904C", color:"#fff", border:"none",
                    borderRadius:"10px", fontWeight:700, cursor:"pointer", fontSize:"14px" }}>
                   Faire une recherche
                </button>
                <button onClick={() => navigate("/formules")}
                  style={{ padding:"12px 24px", background:"#F5FAF7", color:"#0A2410",
                    border:"1px solid #E2EDE6", borderRadius:"10px", fontWeight:600,
                    cursor:"pointer", fontSize:"14px" }}>
                   Recharger encore
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Page retour annulé ──
  if (isAnnule) {
    return (
      <div style={{ minHeight:"100vh", background:"#F5FAF7", fontFamily:"Arial, sans-serif",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ background:"#fff", borderRadius:"20px", border:"2px solid #D4A830",
          padding:"48px 40px", textAlign:"center", maxWidth:"480px", width:"90%" }}>
          <div style={{ fontSize:"64px", marginBottom:"16px" }}> </div>
          <div style={{ fontWeight:900, fontSize:"22px", color:"#D4A830", marginBottom:"8px" }}>Paiement annulé</div>
          <div style={{ fontSize:"13px", color:"#6B9A7A", marginBottom:"24px" }}>
            Vous avez annulé le paiement. Aucun montant n'a été débité.
          </div>
          <button onClick={() => navigate("/formules")}
            style={{ padding:"12px 24px", background:"#00904C", color:"#fff", border:"none",
              borderRadius:"10px", fontWeight:700, cursor:"pointer", fontSize:"14px" }}>
             Retour aux formules
          </button>
        </div>
      </div>
    );
  }

  // ── Page principale ──
  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif", background:"#F5FAF7" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }
        .nav-p { position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:120px;background:#00904C;box-shadow:0 2px 16px rgba(0,0,0,0.15); }
        .npill { display:flex;align-items:center;gap:3px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:5px 8px;margin-left:auto;margin-right:20px; }
        .nbtn { padding:7px 15px;border-radius:100px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.78);cursor:pointer;white-space:nowrap;border:none;background:transparent; }
        .nbtn:hover { color:#fff;background:rgba(255,255,255,0.12); }
        .uchip { display:flex;align-items:center;gap:8px;padding:5px 12px 5px 5px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:100px;cursor:pointer;color:#fff;font-size:13px;font-weight:600;flex-shrink:0; }
        .uavt { width:30px;height:30px;border-radius:50%;background:#4DC97A;color:#0A3D1F;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0; }
        .dd-p { position:absolute;z-index:9999;top:calc(100%+10px);right:0;background:#fff;border-radius:16px;border:1px solid #E2EDE6;min-width:200px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.14); }
        .dd-item { padding:10px 18px;font-size:13px;color:#0A3D1F;cursor:pointer; }
        .dd-item:hover { background:#F5FAF7; }
        .onglet-btn { padding:13px 28px;font-size:14px;font-weight:600;background:transparent;border:none;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.2s; }
        .onglet-btn.active { font-weight:800;color:#00904C;border-bottom-color:#00904C; }
        .upload-zone { border:2px dashed #C0D8C8;border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all 0.2s;background:#F9FCF9; }
        .upload-zone:hover { border-color:#00904C;background:#F0FAF5; }
      `}</style>

      {/* NAVBAR */}
      <nav className="nav-p">
        <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          <img src={logoNERE} alt="NERE" style={{ height:"80px", borderRadius:"6px", backgroundColor:"#fff", padding:"4px" }}/>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
            <span style={{ fontSize:"18px", fontWeight:800, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase" }}>Fichier NERE</span>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>Registre national des entreprises</span>
          </div>
        </div>
        <div className="npill">
          {NAV_LINKS.map(l => <button key={l.key} className="nbtn" onClick={() => navigate(l.path)}>{l.label}</button>)}
        </div>
        <div style={{ position:"relative" }}>
          <div className="uchip" onClick={() => setMenuOpen(o => !o)}>
            <div className="uavt">{initiales}</div>
            <span style={{ maxWidth:"100px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.prenom} {user.nom}</span>
            <span style={{ fontSize:"9px", opacity:0.5 }}>▾</span>
          </div>
          {menuOpen && (
            <>
              <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={() => setMenuOpen(false)}/>
              <div className="dd-p" onClick={e => e.stopPropagation()}>
                <div style={{ padding:"14px 18px 10px", borderBottom:"1px solid #F0F4F1" }}>
                  <div style={{ fontWeight:800, color:"#0A3D1F" }}>{user.prenom} {user.nom}</div>
                  {solde !== null && <div style={{ fontWeight:700, color:"#00904C", marginTop:"4px" }}> {solde.toLocaleString("fr-FR")} FCFA</div>}
                </div>
                <div style={{ padding:"6px 0" }}>
                  <div className="dd-item" onClick={() => { navigate("/profil"); setMenuOpen(false); }}> Mon Profil</div>
                  <div style={{ height:"1px", background:"#F0F4F1", margin:"4px 0" }}/>
                  <div className="dd-item" style={{ color:"#CC3333" }} onClick={handleLogout}> Déconnexion</div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:"linear-gradient(135deg,#006B38,#00904C)", padding:"32px 48px 24px", color:"#fff" }}>
        <div style={{ maxWidth:"760px", margin:"0 auto" }}>
          <button onClick={() => navigate("/formules")}
            style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
              color:"#fff", borderRadius:"8px", padding:"6px 14px", fontSize:"12px",
              fontWeight:600, cursor:"pointer", marginBottom:"12px" }}>
             Retour aux formules
          </button>
          <h1 style={{ fontSize:"26px", fontWeight:900, margin:"0 0 6px" }}>
            Finaliser votre abonnement
          </h1>
          <div style={{ display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap" }}>
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:"10px",
              padding:"8px 18px", border:"1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.65)" }}>Pack : </span>
              <span style={{ fontWeight:800, fontSize:"15px" }}>{nomPack}</span>
            </div>
            <div style={{ background:"rgba(255,255,255,0.15)", borderRadius:"10px",
              padding:"8px 18px", border:"1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.65)" }}>Montant : </span>
              <span style={{ fontWeight:900, fontSize:"18px", color:"#4DC97A" }}>
                {montant.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
            {solde !== null && (
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:"10px",
                padding:"8px 18px", border:"1px solid rgba(255,255,255,0.15)" }}>
                <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.65)" }}>Solde actuel : </span>
                <span style={{ fontWeight:700, fontSize:"15px",
                  color:solde>5000?"#4DC97A":solde>0?"#D4A830":"#FF8080" }}>
                  {solde.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:"760px", margin:"0 auto", padding:"28px 24px 60px" }}>

        {/* Onglets */}
        <div style={{ display:"flex", borderBottom:"2px solid #E2EDE6", marginBottom:"28px" }}>
          <button className={`onglet-btn ${onglet==="mobile"?"active":""}`}
            onClick={() => setOnglet("mobile")}
            style={{ color:onglet==="mobile"?"#00904C":"rgba(0,0,0,0.45)" }}>
             Mobile Money
          </button>
          <button className={`onglet-btn ${onglet==="agence"?"active":""}`}
            onClick={() => setOnglet("agence")}
            style={{ color:onglet==="agence"?"#00904C":"rgba(0,0,0,0.45)" }}>
             Paiement en agence
          </button>
        </div>

        {/* ══ ONGLET MOBILE MONEY ══ */}
        {onglet === "mobile" && (
          <div>
            {/* Info */}
            <div style={{ background:"#E8F5EE", border:"1px solid rgba(0,144,76,0.2)",
              borderRadius:"12px", padding:"16px 20px", marginBottom:"24px",
              display:"flex", alignItems:"flex-start", gap:"12px" }}>
              <span style={{ fontSize:"20px" }}></span>
              <div style={{ fontSize:"13px", color:"#0A2410", lineHeight:1.7 }}>
                <strong>Paiement instantané en 1 clic</strong><br/>
                Vous serez redirigé vers la page sécurisée LigdiCash. Choisissez votre opérateur,
                saisissez votre numéro et validez avec le code OTP reçu par SMS.
                Votre compte est crédité <strong>immédiatement</strong> après confirmation.
              </div>
            </div>

            {/* Erreur */}
            {erreur && (
              <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3", borderRadius:"12px",
                padding:"12px 18px", marginBottom:"20px", color:"#CC3333", fontSize:"13px",
                display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span> {erreur}</span>
                <button onClick={() => setErreur("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#CC3333", fontSize:"16px" }}></button>
              </div>
            )}

            {/* Card récap + bouton */}
            <div style={{ background:"#fff", borderRadius:"16px", border:"2px solid #00904C",
              padding:"28px", marginBottom:"20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", marginBottom:"20px" }}>
                <div>
                  <div style={{ fontSize:"13px", color:"#6B9A7A", marginBottom:"4px" }}>Pack sélectionné</div>
                  <div style={{ fontSize:"20px", fontWeight:900, color:"#0A2410" }}>{nomPack}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"13px", color:"#6B9A7A", marginBottom:"4px" }}>Montant à payer</div>
                  <div style={{ fontSize:"32px", fontWeight:900, color:"#00904C" }}>
                    {montant.toLocaleString("fr-FR")}
                    <span style={{ fontSize:"14px", fontWeight:500, color:"#6B9A7A" }}> FCFA</span>
                  </div>
                </div>
              </div>

              {/* Opérateurs */}
              <div style={{ display:"flex", gap:"10px", marginBottom:"24px", flexWrap:"wrap" }}>
                {[
                  {  label:"Orange Money",     color:"#FF6600" },
                  {  label:"Moov Money",       color:"#0066CC" },
                  {  label:"Wallet LigdiCash", color:"#00904C" },
                ].map(op => (
                  <div key={op.label} style={{ display:"flex", alignItems:"center", gap:"6px",
                    padding:"6px 14px", borderRadius:"8px",
                    border:`1px solid ${op.color}33`, background:`${op.color}08`,
                    fontSize:"12px", fontWeight:600, color:op.color }}>
                    {op.emoji} {op.label}
                  </div>
                ))}
              </div>

              <button onClick={payerMobile} disabled={loading}
                style={{ width:"100%", padding:"16px", background:loading?"#6B9A7A":"#00904C",
                  color:"#fff", border:"none", borderRadius:"12px", fontWeight:800,
                  fontSize:"16px", cursor:loading?"not-allowed":"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"10px",
                  transition:"all 0.2s" }}>
                {loading
                  ? <><span></span> Redirection vers LigdiCash...</>
                  : <><span></span> Payer {montant.toLocaleString("fr-FR")} FCFA maintenant</>}
              </button>

              <div style={{ textAlign:"center", fontSize:"11px", color:"#9AB0A0", marginTop:"10px" }}>
                 Paiement sécurisé par <strong>LigdiCash</strong> — certifié PCI/DSS · Burkina Faso
              </div>
            </div>
          </div>
        )}

        {/* ══ ONGLET PAIEMENT EN AGENCE ══ */}
        {onglet === "agence" && (
          <div>
            {/* Info */}
            <div style={{ background:"rgba(212,168,48,0.08)", border:"1px solid rgba(212,168,48,0.25)",
              borderRadius:"12px", padding:"16px 20px", marginBottom:"24px",
              display:"flex", alignItems:"flex-start", gap:"12px" }}>
              <span style={{ fontSize:"20px" }}></span>
              <div style={{ fontSize:"13px", color:"#0A2410", lineHeight:1.7 }}>
                <strong>Vous avez payé au siège CCI-BF ?</strong><br/>
                Saisissez le numéro de votre reçu ou joignez une photo. Un agent validera
                votre abonnement sous <strong>24h ouvrables</strong>.
              </div>
            </div>

            {/* Adresse CCI-BF */}
            <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #E2EDE6",
              padding:"16px 20px", marginBottom:"24px", fontSize:"13px", color:"#0A2410" }}>
              <div style={{ fontWeight:700, color:"#00904C", marginBottom:"8px" }}> Adresse CCI-BF</div>
              <div style={{ lineHeight:1.8, color:"#555" }}>
                Avenue de Lyon, 01 BP 502<br/>
                Ouagadougou 01, Burkina Faso<br/>
                <strong>Lun – Ven :</strong> 8h00 – 17h00<br/>
                <strong>Tél :</strong> +226 25 30 61 22
              </div>
            </div>

            {agenceSucces ? (
              <div style={{ background:"#E8F5EE", border:"2px solid #00904C", borderRadius:"16px",
                padding:"32px", textAlign:"center" }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}></div>
                <div style={{ fontWeight:800, fontSize:"18px", color:"#00904C", marginBottom:"8px" }}>
                  Demande envoyée !
                </div>
                <p style={{ fontSize:"13px", color:"#6B9A7A", lineHeight:1.7, marginBottom:"20px" }}>
                  {agenceSucces}
                </p>
                <button onClick={() => navigate("/chat")}
                  style={{ padding:"11px 24px", background:"#00904C", color:"#fff",
                    border:"none", borderRadius:"10px", fontWeight:700, cursor:"pointer", fontSize:"13px" }}>
                   Voir la messagerie
                </button>
              </div>
            ) : (
              <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #E2EDE6", padding:"28px" }}>

                {/* Récap */}
                <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"14px 16px",
                  marginBottom:"20px", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"13px", color:"#6B9A7A" }}>Pack</span>
                  <span style={{ fontWeight:700, color:"#0A2410" }}>{nomPack}</span>
                </div>
                <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"14px 16px",
                  marginBottom:"24px", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"13px", color:"#6B9A7A" }}>Montant payé</span>
                  <span style={{ fontWeight:900, fontSize:"18px", color:"#00904C" }}>
                    {montant.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>

                {/* Numéro de reçu */}
                <div style={{ marginBottom:"20px" }}>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                    color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.06em",
                    marginBottom:"8px" }}>
                    Numéro de reçu <span style={{ color:"#9AB0A0", fontWeight:400 }}>(optionnel si photo jointe)</span>
                  </label>
                  <input type="text" value={numRecu}
                    onChange={e => setNumRecu(e.target.value)}
                    placeholder="Ex: REC-2025-12345"
                    style={{ width:"100%", padding:"12px 14px", borderRadius:"10px",
                      border:"1.5px solid #E2EDE6", fontSize:"14px", outline:"none",
                      boxSizing:"border-box", color:"#0A2410" }}
                    onFocus={e => e.target.style.borderColor="#00904C"}
                    onBlur={e => e.target.style.borderColor="#E2EDE6"}/>
                </div>

                {/* Upload photo */}
                <div style={{ marginBottom:"24px" }}>
                  <label style={{ display:"block", fontSize:"12px", fontWeight:700,
                    color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.06em",
                    marginBottom:"8px" }}>
                    Photo du reçu <span style={{ color:"#9AB0A0", fontWeight:400 }}>(optionnel si numéro saisi)</span>
                  </label>

                  {photoPreview ? (
                    <div style={{ position:"relative", borderRadius:"12px", overflow:"hidden",
                      border:"2px solid #00904C" }}>
                      <img src={photoPreview} alt="Reçu"
                        style={{ width:"100%", maxHeight:"200px", objectFit:"cover" }}/>
                      <button onClick={() => { setPhotoRecu(null); setPhotoPreview(null); }}
                        style={{ position:"absolute", top:"8px", right:"8px",
                          background:"rgba(0,0,0,0.6)", color:"#fff", border:"none",
                          borderRadius:"50%", width:"28px", height:"28px",
                          cursor:"pointer", fontSize:"14px", fontWeight:700 }}>
                        
                      </button>
                      <div style={{ background:"rgba(0,144,76,0.9)", color:"#fff",
                        padding:"6px 12px", fontSize:"12px", fontWeight:600 }}>
                         Photo du reçu ajoutée
                      </div>
                    </div>
                  ) : (
                    <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                      <input ref={fileRef} type="file" accept="image/*"
                        style={{ display:"none" }} onChange={handlePhoto}/>
                      <div style={{ fontSize:"32px", marginBottom:"8px" }}></div>
                      <div style={{ fontWeight:600, fontSize:"13px", color:"#0A2410", marginBottom:"4px" }}>
                        Cliquez pour joindre une photo
                      </div>
                      <div style={{ fontSize:"11px", color:"#9AB0A0" }}>
                        JPG, PNG, WEBP — Max 5 Mo
                      </div>
                    </div>
                  )}
                </div>

                {/* Erreur */}
                {agenceErreur && (
                  <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3", borderRadius:"10px",
                    padding:"10px 14px", marginBottom:"16px", color:"#CC3333", fontSize:"13px" }}>
                     {agenceErreur}
                  </div>
                )}

                <button onClick={validerAgence} disabled={agenceLoading}
                  style={{ width:"100%", padding:"14px", background:agenceLoading?"#6B9A7A":"#D4A830",
                    color:"#fff", border:"none", borderRadius:"12px", fontWeight:800,
                    fontSize:"15px", cursor:agenceLoading?"not-allowed":"pointer" }}>
                  {agenceLoading ? " Envoi en cours..." : " Envoyer ma demande de validation"}
                </button>

                <div style={{ fontSize:"11px", color:"#9AB0A0", textAlign:"center", marginTop:"10px", lineHeight:1.6 }}>
                  Un agent CCI-BF recevra votre demande et activera votre abonnement<br/>
                  sous <strong>24h ouvrables</strong> après vérification du reçu.
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <footer style={{ background:"#fff", borderTop:"1px solid #E2EDE6", padding:"14px 48px",
        display:"flex", justifyContent:"space-between", fontSize:"12px", color:"#6B9A7A" }}>
        <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
        <span>+226 25 30 61 22</span>
      </footer>
    </div>
  );
}