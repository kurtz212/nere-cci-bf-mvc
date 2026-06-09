// client/src/views/dashboard/Paiement.jsx
// Flux OTP démo complet — Orange Money / Moov Money BF
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoNERE from "../../assets/nere.png";

const API = "/api";

const NAV_LINKS = [
  { label: "Accueil",      path: "/",            key: "accueil"      },
  { label: "Publications", path: "/publications", key: "publications" },
  { label: "Recherche",    path: "/rechercheacc", key: "recherche"    },
  { label: "Contact",      path: "/contact",      key: "contact"      },
  { label: "Messages",     path: "/chat",         key: "messages"     },
];

// ─── Étapes du flux Mobile Money ───
// "saisie"  → l'utilisateur entre son numéro + choisit opérateur
// "otp"     → l'utilisateur entre le code OTP reçu
// "succes"  → paiement confirmé

export default function Paiement() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [solde, setSolde]       = useState(null);
  const [onglet, setOnglet]     = useState("mobile");

  // ── Flux Mobile Money ──
  const [etape, setEtape]           = useState("saisie");  // "saisie" | "otp" | "succes"
  const [operateur, setOperateur]   = useState("orange");
  const [telephone, setTelephone]   = useState("");
  const [otp, setOtp]               = useState("");
  const [reference, setReference]   = useState("");
  const [loadingMobile, setLoadingMobile] = useState(false);
  const [erreurMobile, setErreurMobile]   = useState("");
  const [nouveauSolde, setNouveauSolde]   = useState(null);
  const [countdown, setCountdown]   = useState(0);
  const countdownRef = useRef(null);

  // ── Agence ──
  const [numRecu, setNumRecu]             = useState("");
  const [photoRecu, setPhotoRecu]         = useState(null);
  const [photoPreview, setPhotoPreview]   = useState(null);
  const [agenceLoading, setAgenceLoading] = useState(false);
  const [agenceSucces, setAgenceSucces]   = useState("");
  const [agenceErreur, setAgenceErreur]   = useState("");
  const fileRef = useRef(null);

  const packChoisi = location.state?.pack;
  const montant    = location.state?.montant || packChoisi?.prix || 5000;
  const nomPack    = packChoisi?.nom || "Recharge";

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/connexion"); return; }
    setUser(JSON.parse(u));
    chargerSolde();
  }, []);

  // Décompte re-envoi OTP
  useEffect(() => {
    if (countdown <= 0) return;
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countdownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [countdown]);

  const chargerSolde = async () => {
    const token = localStorage.getItem("token");
    try {
      const r = await fetch(`${API}/abonnements/mon-solde`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      if (d.success && d.data) setSolde(d.data.solde);
    } catch {}
  };

  // ─── Étape 1 : initier le paiement démo → obtenir OTP ───
  const initierPaiement = async () => {
    setErreurMobile("");
    const telNettoye = telephone.replace(/[\s\-().+]/g, "").replace(/^00226/, "").replace(/^226/, "").replace(/^0/, "");
    if (!telNettoye || telNettoye.length < 8) {
      setErreurMobile("Veuillez saisir un numéro de téléphone valide (8 chiffres).");
      return;
    }
    setLoadingMobile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/paiements/demo/initier`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ packNom: nomPack, montant, telephone: telNettoye }),
      });
      const data = await res.json();
      if (!data.success) {
        setErreurMobile(data.message || "Erreur lors de l'envoi de l'OTP.");
        setLoadingMobile(false);
        return;
      }
      setReference(data.reference);
      setEtape("otp");
      setCountdown(120); // 2 minutes avant re-envoi
    } catch (e) {
      setErreurMobile(`Erreur réseau : ${e.message}`);
    }
    setLoadingMobile(false);
  };

  // ─── Étape 2 : valider l'OTP ───
  const validerOtp = async () => {
    setErreurMobile("");
    if (!otp || otp.length !== 6) {
      setErreurMobile("Le code OTP doit contenir 6 chiffres.");
      return;
    }
    setLoadingMobile(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/paiements/demo/valider`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reference, otp }),
      });
      const data = await res.json();
      if (!data.success) {
        setErreurMobile(data.message || "Code OTP incorrect.");
        setLoadingMobile(false);
        return;
      }
      setNouveauSolde(data.data?.solde ?? montant);
      setEtape("succes");
    } catch (e) {
      setErreurMobile(`Erreur réseau : ${e.message}`);
    }
    setLoadingMobile(false);
  };

  const renvoyerOtp = async () => {
    if (countdown > 0) return;
    setEtape("saisie");
    setOtp("");
    setReference("");
    setErreurMobile("");
  };

  // ── Agence ──
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
      const msg = `Validation paiement agence\n\nPack : ${nomPack}\nMontant : ${montant.toLocaleString("fr-FR")} FCFA\nNuméro de reçu : ${numRecu || "Non saisi"}\n${photoRecu ? "📸 Photo du reçu jointe.\n" : ""}Merci de valider mon abonnement.`;
      await fetch(`${API}/chat/envoyer-message`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: msg }),
      });
      setAgenceSucces(" Votre demande a été envoyée. Votre abonnement sera activé sous 24h ouvrables.");
    } catch {
      setAgenceErreur("Erreur lors de l'envoi. Réessayez.");
    }
    setAgenceLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;
  const initiales = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();

  // ─── Page succès ───
  if (etape === "succes") {
    return (
      <div style={{ minHeight: "100vh", background: "#F5FAF7", fontFamily: "Arial, sans-serif",
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: "20px", border: "2px solid #00904C",
          padding: "48px 40px", textAlign: "center", maxWidth: "480px", width: "90%",
          boxShadow: "0 12px 40px rgba(0,144,76,0.15)" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}></div>
          <div style={{ fontWeight: 900, fontSize: "24px", color: "#00904C", marginBottom: "8px" }}>
            Paiement réussi !
          </div>
          {nouveauSolde !== null && (
            <div style={{ fontSize: "36px", fontWeight: 900, color: "#0A2410", marginBottom: "6px" }}>
              {nouveauSolde.toLocaleString("fr-FR")} FCFA
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#6B9A7A" }}>Solde disponible</div>
            </div>
          )}
          <p style={{ fontSize: "13px", color: "#6B9A7A", lineHeight: 1.7, marginBottom: "28px" }}>
            Votre compte <strong>{nomPack}</strong> a été rechargé avec succès.<br />
            Vous pouvez maintenant effectuer vos recherches.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/demande-document")}
              style={{ padding: "12px 24px", background: "#00904C", color: "#fff", border: "none",
                borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}>
               Faire une recherche
            </button>
            <button onClick={() => { setEtape("saisie"); setOtp(""); setReference(""); setErreurMobile(""); }}
              style={{ padding: "12px 24px", background: "#F5FAF7", color: "#0A2410",
                border: "1px solid #E2EDE6", borderRadius: "10px", fontWeight: 600,
                cursor: "pointer", fontSize: "14px" }}>
               Recharger encore
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Arial, Helvetica, sans-serif", background: "#F5FAF7" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }
        .nav-p { position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:120px;background:#00904C;box-shadow:0 2px 16px rgba(0,0,0,0.15); }
        .npill { display:flex;align-items:center;gap:3px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:5px 8px;margin-left:auto;margin-right:20px; }
        .nbtn { padding:7px 15px;border-radius:100px;font-size:20px;font-weight:600;color:rgba(255,255,255,0.78);cursor:pointer;white-space:nowrap;border:none;background:transparent; }
        .nbtn:hover { color:#fff;background:rgba(255,255,255,0.12); }
        .uchip { display:flex;align-items:center;gap:8px;padding:5px 12px 5px 5px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:100px;cursor:pointer;color:#fff;font-size:13px;font-weight:600; }
        .uavt { width:30px;height:30px;border-radius:50%;background:#4DC97A;color:#0A3D1F;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px; }
        .dd-p { position:absolute;z-index:9999;top:calc(100%+10px);right:0;background:#fff;border-radius:16px;border:1px solid #E2EDE6;min-width:200px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.14); }
        .dd-item { padding:10px 18px;font-size:13px;color:#0A3D1F;cursor:pointer; }
        .dd-item:hover { background:#F5FAF7; }
        .onglet-btn { padding:13px 28px;font-size:14px;font-weight:600;background:transparent;border:none;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all 0.2s; }
        .onglet-btn.active { font-weight:800;color:#00904C;border-bottom-color:#00904C; }
        .op-card { flex:1;min-width:130px;padding:14px 10px;border-radius:12px;border:2px solid #E2EDE6;background:#fff;cursor:pointer;text-align:center;transition:all 0.18s; }
        .op-card.selected { border-color:#00904C;background:#F0FAF5; }
        .op-card:hover { border-color:#00904C; }
        .otp-input { width:48px;height:56px;border-radius:10px;border:2px solid #E2EDE6;font-size:24px;font-weight:900;text-align:center;outline:none;transition:border-color 0.18s;color:#0A2410; }
        .otp-input:focus { border-color:#00904C; }
        .input-tel { width:100%;padding:13px 16px;border-radius:10px;border:1.5px solid #E2EDE6;font-size:15px;outline:none;box-sizing:border-box;color:#0A2410;transition:border-color 0.18s; }
        .input-tel:focus { border-color:#00904C; }
        .upload-zone { border:2px dashed #C0D8C8;border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all 0.2s;background:#F9FCF9; }
        .upload-zone:hover { border-color:#00904C;background:#F0FAF5; }
        .btn-payer { width:100%;padding:16px;background:#00904C;color:#fff;border:none;border-radius:12px;font-weight:800;font-size:16px;cursor:pointer;transition:background 0.18s; }
        .btn-payer:hover:not(:disabled) { background:#007A40; }
        .btn-payer:disabled { background:#6B9A7A;cursor:not-allowed; }
      `}</style>

      {/* NAVBAR */}
      <nav className="nav-p">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <img src={logoNERE} alt="NERE" style={{ height: "80px", borderRadius: "6px", backgroundColor: "#fff", padding: "4px" }} />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.35 }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase" }}>Fichier NERE</span>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.65)" }}>Registre national des entreprises</span>
          </div>
        </div>
        <div className="npill">
          {NAV_LINKS.map(l => <button key={l.key} className="nbtn" onClick={() => navigate(l.path)}>{l.label}</button>)}
        </div>
        <div style={{ position: "relative" }}>
          <div className="uchip" onClick={() => setMenuOpen(o => !o)}>
            <div className="uavt">{initiales}</div>
            <span style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.prenom} {user.nom}</span>
            <span style={{ fontSize: "9px", opacity: 0.5 }}>▾</span>
          </div>
          {menuOpen && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 50 }} onClick={() => setMenuOpen(false)} />
              <div className="dd-p" onClick={e => e.stopPropagation()}>
                <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #F0F4F1" }}>
                  <div style={{ fontWeight: 800, color: "#0A3D1F" }}>{user.prenom} {user.nom}</div>
                  {solde !== null && <div style={{ fontWeight: 700, color: "#00904C", marginTop: "4px" }}> {solde.toLocaleString("fr-FR")} FCFA</div>}
                </div>
                <div style={{ padding: "6px 0" }}>
                  <div className="dd-item" onClick={() => { navigate("/profil"); setMenuOpen(false); }}> Mon Profil</div>
                  <div style={{ height: "1px", background: "#F0F4F1", margin: "4px 0" }} />
                  <div className="dd-item" style={{ color: "#CC3333" }} onClick={handleLogout}> Déconnexion</div>
                </div>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg,#006B38,#00904C)", padding: "32px 48px 24px", color: "#fff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <button onClick={() => navigate("/formules")}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff", borderRadius: "8px", padding: "6px 14px", fontSize: "12px",
              fontWeight: 600, cursor: "pointer", marginBottom: "12px" }}>
             Retour aux formules
          </button>
          <h1 style={{ fontSize: "26px", fontWeight: 900, margin: "0 0 12px" }}>Finaliser votre abonnement</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px 18px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Pack : </span>
              <span style={{ fontWeight: 800, fontSize: "15px" }}>{nomPack}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px 18px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Montant : </span>
              <span style={{ fontWeight: 900, fontSize: "18px", color: "#4DC97A" }}>{montant.toLocaleString("fr-FR")} FCFA</span>
            </div>
            {solde !== null && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 18px", border: "1px solid rgba(255,255,255,0.15)" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Solde actuel : </span>
                <span style={{ fontWeight: 700, fontSize: "15px", color: solde > 5000 ? "#4DC97A" : solde > 0 ? "#D4A830" : "#FF8080" }}>
                  {solde.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Onglets */}
        <div style={{ display: "flex", borderBottom: "2px solid #E2EDE6", marginBottom: "28px" }}>
          <button className={`onglet-btn ${onglet === "mobile" ? "active" : ""}`}
            onClick={() => setOnglet("mobile")}
            style={{ color: onglet === "mobile" ? "#00904C" : "rgba(0,0,0,0.45)" }}>
             Mobile Money
          </button>
          <button className={`onglet-btn ${onglet === "agence" ? "active" : ""}`}
            onClick={() => setOnglet("agence")}
            style={{ color: onglet === "agence" ? "#00904C" : "rgba(0,0,0,0.45)" }}>
             Paiement en agence
          </button>
        </div>

        {/* ══ MOBILE MONEY ══ */}
        {onglet === "mobile" && (
          <div>

            {/* Message erreur */}
            {erreurMobile && (
              <div style={{ background: "#FFF0F0", border: "1px solid #FFB3B3", borderRadius: "12px",
                padding: "12px 18px", marginBottom: "20px", color: "#CC3333", fontSize: "13px",
                display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span> {erreurMobile}</span>
                <button onClick={() => setErreurMobile("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#CC3333", fontSize: "16px" }}>✕</button>
              </div>
            )}

            {/* ── ÉTAPE 1 : Saisie numéro ── */}
            {etape === "saisie" && (
              <div style={{ background: "#fff", borderRadius: "16px", border: "2px solid #00904C", padding: "28px" }}>

                {/* Récap montant */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                  <div>
                    <div style={{ fontSize: "13px", color: "#6B9A7A", marginBottom: "4px" }}>Pack sélectionné</div>
                    <div style={{ fontSize: "20px", fontWeight: 900, color: "#0A2410" }}>{nomPack}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", color: "#6B9A7A", marginBottom: "4px" }}>Montant</div>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#00904C" }}>
                      {montant.toLocaleString("fr-FR")}
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B9A7A" }}> FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Choix opérateur */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B9A7A",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                    Choisissez votre opérateur
                  </div>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div className={`op-card ${operateur === "orange" ? "selected" : ""}`}
                      onClick={() => setOperateur("orange")}>
                      <div style={{ fontSize: "28px", marginBottom: "6px" }}>🟠</div>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: operateur === "orange" ? "#00904C" : "#0A2410" }}>Orange Money</div>
                      <div style={{ fontSize: "11px", color: "#9AB0A0", marginTop: "2px" }}>07X / 77X</div>
                    </div>
                    <div className={`op-card ${operateur === "moov" ? "selected" : ""}`}
                      onClick={() => setOperateur("moov")}>
                      <div style={{ fontSize: "28px", marginBottom: "6px" }}>🔵</div>
                      <div style={{ fontWeight: 700, fontSize: "13px", color: operateur === "moov" ? "#00904C" : "#0A2410" }}>Moov Money</div>
                      <div style={{ fontSize: "11px", color: "#9AB0A0", marginTop: "2px" }}>65X / 66X</div>
                    </div>
                  </div>
                </div>

                {/* Numéro téléphone */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B9A7A",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                    Numéro {operateur === "orange" ? "Orange Money" : "Moov Money"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ background: "#F5FAF7", border: "1.5px solid #E2EDE6", borderRadius: "10px",
                      padding: "13px 14px", fontSize: "14px", fontWeight: 700, color: "#0A2410", whiteSpace: "nowrap" }}>
                      🇧🇫 +226
                    </div>
                    <input
                      type="tel"
                      className="input-tel"
                      placeholder={operateur === "orange" ? "65 00 00 00" : "70 00 00 00"}
                      value={telephone}
                      onChange={e => setTelephone(e.target.value.replace(/[^0-9\s]/g, ""))}
                      maxLength={12}
                    />
                  </div>
                  <div style={{ fontSize: "11px", color: "#9AB0A0", marginTop: "6px" }}>
                    Un code OTP à 6 chiffres sera envoyé sur ce numéro pour confirmer le paiement.
                  </div>
                </div>

                <button className="btn-payer" onClick={initierPaiement} disabled={loadingMobile}>
                  {loadingMobile ? " Envoi de l'OTP..." : ` Recevoir le code OTP — ${montant.toLocaleString("fr-FR")} FCFA`}
                </button>

                <div style={{ textAlign: "center", fontSize: "11px", color: "#9AB0A0", marginTop: "10px" }}>
                   Paiement sécurisé — Orange Money & Moov Money BF
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 : Saisie OTP ── */}
            {etape === "otp" && (
              <div style={{ background: "#fff", borderRadius: "16px", border: "2px solid #00904C", padding: "28px" }}>

                {/* Info OTP */}
                <div style={{ background: "#E8F5EE", border: "1px solid rgba(0,144,76,0.2)", borderRadius: "12px",
                  padding: "16px 20px", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "22px" }}>{operateur === "orange" ? "🟠" : "🔵"}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "14px", color: "#0A2410", marginBottom: "4px" }}>
                      Code OTP envoyé !
                    </div>
                    <div style={{ fontSize: "13px", color: "#2D5A3A", lineHeight: 1.6 }}>
                      Un code à 6 chiffres a été envoyé au <strong>+226 {telephone}</strong> via {operateur === "orange" ? "Orange Money" : "Moov Money"}.
                      Saisissez-le ci-dessous pour confirmer votre paiement de <strong>{montant.toLocaleString("fr-FR")} FCFA</strong>.
                    </div>
                  </div>
                </div>

                {/* Saisie OTP */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#6B9A7A",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", textAlign: "center" }}>
                    Code OTP reçu par SMS
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        className="otp-input"
                        maxLength={1}
                        value={otp[i] || ""}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          const newOtp = otp.split("");
                          newOtp[i] = val;
                          setOtp(newOtp.join(""));
                          if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
                        }}
                        onKeyDown={e => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                            const newOtp = otp.split("");
                            newOtp[i - 1] = "";
                            setOtp(newOtp.join(""));
                          }
                        }}
                        onPaste={e => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                          setOtp(pasted.padEnd(6, "").slice(0, 6));
                          document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ textAlign: "center", marginTop: "12px", fontSize: "12px", color: "#9AB0A0" }}>
                    {countdown > 0
                      ? `Re-envoyer le code dans ${countdown}s`
                      : <button onClick={renvoyerOtp}
                          style={{ background: "none", border: "none", color: "#00904C", cursor: "pointer",
                            fontWeight: 700, fontSize: "12px", textDecoration: "underline" }}>
                           Renvoyer le code
                        </button>
                    }
                  </div>
                </div>

                <button className="btn-payer" onClick={validerOtp} disabled={loadingMobile || otp.length < 6}>
                  {loadingMobile ? " Vérification en cours..." : " Confirmer le paiement"}
                </button>

                <button onClick={() => { setEtape("saisie"); setOtp(""); setReference(""); setErreurMobile(""); }}
                  style={{ width: "100%", marginTop: "10px", padding: "11px", background: "transparent",
                    color: "#6B9A7A", border: "1px solid #E2EDE6", borderRadius: "10px",
                    fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
                  ← Modifier le numéro
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ PAIEMENT EN AGENCE ══ */}
        {onglet === "agence" && (
          <div>
            <div style={{ background: "rgba(212,168,48,0.08)", border: "1px solid rgba(212,168,48,0.25)",
              borderRadius: "12px", padding: "16px 20px", marginBottom: "24px",
              display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "20px" }}></span>
              <div style={{ fontSize: "13px", color: "#0A2410", lineHeight: 1.7 }}>
                <strong>Vous avez payé au siège CCI-BF ?</strong><br />
                Saisissez le numéro de votre reçu ou joignez une photo. Un agent activera
                votre abonnement sous <strong>24h ouvrables</strong>.
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #E2EDE6",
              padding: "16px 20px", marginBottom: "24px", fontSize: "13px" }}>
              <div style={{ fontWeight: 700, color: "#00904C", marginBottom: "8px" }}> Adresse CCI-BF</div>
              <div style={{ lineHeight: 1.8, color: "#555" }}>
                Avenue de Lyon, 01 BP 502 · Ouagadougou 01<br />
                <strong>Lun - Ven :</strong> 8h00 - 17h00 · <strong>Tél :</strong> +226 25 30 61 22
              </div>
            </div>

            {agenceSucces ? (
              <div style={{ background: "#E8F5EE", border: "2px solid #00904C", borderRadius: "16px",
                padding: "32px", textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}></div>
                <div style={{ fontWeight: 800, fontSize: "18px", color: "#00904C", marginBottom: "8px" }}>Demande envoyée !</div>
                <p style={{ fontSize: "13px", color: "#6B9A7A", lineHeight: 1.7, marginBottom: "20px" }}>{agenceSucces}</p>
                <button onClick={() => navigate("/chat")}
                  style={{ padding: "11px 24px", background: "#00904C", color: "#fff",
                    border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}>
                   Voir la messagerie
                </button>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E2EDE6", padding: "28px" }}>
                <div style={{ background: "#F5FAF7", borderRadius: "10px", padding: "14px 16px",
                  marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13px", color: "#6B9A7A" }}>Pack / Montant</span>
                  <span style={{ fontWeight: 900, color: "#00904C" }}>{nomPack} — {montant.toLocaleString("fr-FR")} FCFA</span>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#6B9A7A",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                    Numéro de reçu <span style={{ color: "#9AB0A0", fontWeight: 400 }}>(optionnel si photo jointe)</span>
                  </label>
                  <input type="text" value={numRecu} onChange={e => setNumRecu(e.target.value)}
                    placeholder="Ex: REC-2025-12345"
                    style={{ width: "100%", padding: "12px 14px", borderRadius: "10px",
                      border: "1.5px solid #E2EDE6", fontSize: "14px", outline: "none",
                      boxSizing: "border-box", color: "#0A2410" }} />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#6B9A7A",
                    textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                    Photo du reçu <span style={{ color: "#9AB0A0", fontWeight: 400 }}>(optionnel si numéro saisi)</span>
                  </label>
                  {photoPreview ? (
                    <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: "2px solid #00904C" }}>
                      <img src={photoPreview} alt="Reçu" style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }} />
                      <button onClick={() => { setPhotoRecu(null); setPhotoPreview(null); }}
                        style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)",
                          color: "#fff", border: "none", borderRadius: "50%", width: "28px", height: "28px",
                          cursor: "pointer", fontSize: "14px", fontWeight: 700 }}>✕</button>
                    </div>
                  ) : (
                    <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📸</div>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "#0A2410", marginBottom: "4px" }}>Cliquez pour joindre une photo</div>
                      <div style={{ fontSize: "11px", color: "#9AB0A0" }}>JPG, PNG, WEBP — Max 5 Mo</div>
                    </div>
                  )}
                </div>

                {agenceErreur && (
                  <div style={{ background: "#FFF0F0", border: "1px solid #FFB3B3", borderRadius: "10px",
                    padding: "10px 14px", marginBottom: "16px", color: "#CC3333", fontSize: "13px" }}>
                     {agenceErreur}
                  </div>
                )}

                <button onClick={validerAgence} disabled={agenceLoading}
                  style={{ width: "100%", padding: "14px", background: agenceLoading ? "#6B9A7A" : "#D4A830",
                    color: "#fff", border: "none", borderRadius: "12px", fontWeight: 800,
                    fontSize: "15px", cursor: agenceLoading ? "not-allowed" : "pointer" }}>
                  {agenceLoading ? " Envoi en cours..." : " Envoyer ma demande de validation"}
                </button>

                <div style={{ fontSize: "11px", color: "#9AB0A0", textAlign: "center", marginTop: "10px", lineHeight: 1.6 }}>
                  Un agent CCI-BF recevra votre demande et activera votre abonnement sous <strong>24h ouvrables</strong>.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ background: "#fff", borderTop: "1px solid #E2EDE6", padding: "14px 48px",
        display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#6B9A7A" }}>
        <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
        <span>+226 25 30 61 22</span>
      </footer>
    </div>
  );
}