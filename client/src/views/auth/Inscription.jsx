import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";

const TYPES_COMPTE = [
  { value: "etudiant",       label: "Étudiant",       icon: "🎓" },
  { value: "entreprise",     label: "Entreprise",     icon: "🏢" },
  { value: "administration", label: "Administration", icon: "🏛️" },
  { value: "autre",          label: "Autre",          icon: "👤" },
];

export default function Inscription() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [packChoisi, setPackChoisi] = useState(null);
  const [montantPack3, setMontantPack3] = useState("");
  const [form, setForm] = useState({
    typeCompte: "",
    nom:        "",
    prenom:     "",
    fonction:   "",
    telephone:  "",
    email:      "",
    siteWeb:    "",
    password:   "",
    confirm:    "",
    cgu:        false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.typeCompte) return setError("Veuillez sélectionner un type de compte.");
    if (!form.cgu)        return setError("Veuillez accepter les CGU.");
    if (form.password !== form.confirm)
      return setError("Les mots de passe ne correspondent pas.");
    if (form.password.length < 8)
      return setError("Le mot de passe doit contenir au moins 8 caractères.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/inscription", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typeCompte: form.typeCompte,
          nom:        form.nom,
          prenom:     form.prenom,
          fonction:   form.fonction,
          telephone:  form.telephone,
          email:      form.email,
          siteWeb:    form.siteWeb,
          password:   form.password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.sansEmail) {
          // Pas d'email → compte activé directement → connexion
          navigate("/connexion?registered=1");
        } else {
          // Email fourni → écran de confirmation
          setStep(2);
        }
      } else {
        setError(data.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  const forceMdp = !form.password ? null
    : form.password.length < 6  ? "faible"
    : form.password.length < 10 ? "moyen"
    : "fort";

  return (
    <>
      <div className="auth-bg">
        <div className="auth-blob1"/><div className="auth-blob2"/><div className="auth-grid"/>
        <svg className="auth-skyline" viewBox="0 0 1400 200"
          preserveAspectRatio="xMidYMax meet" fill="rgba(46,111,204,0.4)">
          <rect x="40"   y="60"  width="80"  height="140"/>
          <rect x="150"  y="80"  width="60"  height="120"/>
          <rect x="240"  y="20"  width="100" height="180"/>
          <rect x="370"  y="70"  width="70"  height="130"/>
          <rect x="470"  y="40"  width="120" height="160"/>
          <rect x="700"  y="75"  width="60"  height="125"/>
          <rect x="790"  y="30"  width="90"  height="170"/>
          <rect x="910"  y="60"  width="75"  height="140"/>
          <rect x="1010" y="20"  width="110" height="180"/>
          <rect x="1150" y="70"  width="65"  height="130"/>
          <rect x="1240" y="40"  width="85"  height="160"/>
          <rect x="1350" y="80"  width="50"  height="120"/>
          <rect x="0"    y="198" width="1400" height="2" fill="rgba(46,111,204,0.5)"/>
        </svg>
      </div>

      <div className="auth-wrapper">
        <nav className="auth-navbar">
          <div className="auth-logo" onClick={() => navigate("/")}>NERE <span>CCI-BF</span></div>
          <div className="auth-nav-right">
            Déjà un compte ?{" "}
            <span className="auth-link" onClick={() => navigate("/connexion")}>Se connecter</span>
          </div>
        </nav>

        <div className="auth-container">

          {step === 1 && (
            <div className="auth-card wide-card">

              {/* Étapes */}
              <div className="steps-row">
                {["Informations","Vérification","Formule","Paiement"].map((s, i) => (
                  <div key={i} className={`step-item ${i === 0 ? "current" : ""}`}>
                    <div className="step-circle">{i + 1}</div>
                    <span>{s}</span>
                    {i < 3 && <div className="step-line"/>}
                  </div>
                ))}
              </div>

              <div className="auth-card-header">
                <h1 className="auth-title">Créer votre compte</h1>
                <p className="auth-subtitle">Accédez aux données économiques du Burkina Faso</p>
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">

                {/* TYPE DE COMPTE */}
                <div className="form-field full">
                  <label className="form-label">Type de compte *</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                    gap:"10px", marginTop:"8px" }}>
                    {TYPES_COMPTE.map(t => (
                      <button key={t.value} type="button"
                        onClick={() => { setForm(f=>({...f,typeCompte:t.value})); setError(""); }}
                        style={{
                          padding:"14px 8px", borderRadius:"10px",
                          border: form.typeCompte===t.value
                            ? "2px solid #4DC97A"
                            : "1.5px solid rgba(255,255,255,0.1)",
                          background: form.typeCompte===t.value
                            ? "rgba(77,201,122,0.12)"
                            : "rgba(255,255,255,0.03)",
                          color: form.typeCompte===t.value
                            ? "#4DC97A" : "rgba(255,255,255,0.5)",
                          fontWeight: form.typeCompte===t.value ? 700 : 500,
                          fontSize:"12px", cursor:"pointer",
                          fontFamily:"inherit", transition:"all 0.18s",
                          display:"flex", flexDirection:"column",
                          alignItems:"center", gap:"7px",
                        }}>
                        <span style={{fontSize:"22px"}}>{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CHAMPS PRINCIPAUX */}
                <div className="form-grid-2">

                  <div className="form-field">
                    <label className="form-label">Nom *</label>
                    <input className="form-input" name="nom" placeholder="NANA"
                      value={form.nom} onChange={handleChange} required/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Prénom *</label>
                    <input className="form-input" name="prenom" placeholder="Michael"
                      value={form.prenom} onChange={handleChange} required/>
                  </div>

                  <div className="form-field full">
                    <label className="form-label">Fonction *</label>
                    <input className="form-input" name="fonction"
                      placeholder="ex: Directeur commercial, Étudiant en master, Chef de service..."
                      value={form.fonction} onChange={handleChange} required/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Téléphone *</label>
                    <input className="form-input" name="telephone"
                      placeholder="+226 07 XX XX XX"
                      value={form.telephone} onChange={handleChange} required/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      Email{" "}
                      <span style={{fontSize:"11px",opacity:0.45,fontWeight:400}}>
                        (facultatif)
                      </span>
                    </label>
                    <input className="form-input" name="email" type="email"
                      placeholder="i.traore@exemple.bf"
                      value={form.email} onChange={handleChange}/>
                  </div>

                  <div className="form-field full">
                    <label className="form-label">
                      Site web{" "}
                      <span style={{fontSize:"11px",opacity:0.45,fontWeight:400}}>
                        (facultatif)
                      </span>
                    </label>
                    <input className="form-input" name="siteWeb"
                      placeholder="https://www.votre-site.bf"
                      value={form.siteWeb} onChange={handleChange}/>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Mot de passe *</label>
                    <div style={{ position:"relative" }}>
                      <input className="form-input" name="password"
                        type={showPwd ? "text" : "password"}
                        placeholder="Min. 8 caractères"
                        value={form.password} onChange={handleChange} required
                        style={{ paddingRight:"44px" }}/>
                      <button type="button"
                        onClick={() => setShowPwd(v => !v)}
                        style={{ position:"absolute", right:"12px", top:"50%",
                          transform:"translateY(-50%)", background:"none", border:"none",
                          cursor:"pointer", fontSize:"16px", opacity:0.5,
                          color:"#fff", padding:"0", lineHeight:1 }}>
                        {showPwd ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Confirmer *</label>
                    <div style={{ position:"relative" }}>
                      <input className="form-input" name="confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Répéter le mot de passe"
                        value={form.confirm} onChange={handleChange} required
                        style={{ paddingRight:"44px" }}/>
                      <button type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        style={{ position:"absolute", right:"12px", top:"50%",
                          transform:"translateY(-50%)", background:"none", border:"none",
                          cursor:"pointer", fontSize:"16px", opacity:0.5,
                          color:"#fff", padding:"0", lineHeight:1 }}>
                        {showConfirm ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Force mot de passe */}
                {forceMdp && (
                  <div className="pwd-strength">
                    <div className="pwd-bar">
                      <div className={`pwd-fill strength-${forceMdp}`}/>
                    </div>
                    <span className="pwd-label" style={{
                      color: forceMdp==="faible"?"#E85555"
                        : forceMdp==="moyen"?"#D4A830":"#4DC97A"
                    }}>
                      {forceMdp==="faible"?"Faible":forceMdp==="moyen"?"Moyen":"Fort"}
                    </span>
                  </div>
                )}

                {/* CGU */}
                <label className="cgu-row">
                  <input type="checkbox" name="cgu"
                    checked={form.cgu} onChange={handleChange}/>
                  <span>
                    J'accepte les{" "}
                    <span className="auth-link">Conditions Générales d'Utilisation</span>{" "}
                    et la{" "}
                    <span className="auth-link">Politique de confidentialité</span>{" "}
                    de la CCI-BF
                  </span>
                </label>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner"/> : "Créer mon compte →"}
                </button>
              </form>
            </div>
          )}

          {/* ÉTAPE 2 : Confirmation email */}
          {step === 2 && (
            <div className="auth-card verify-card">
              <div className="steps-row">
                {["Informations","Vérification","Formule","Paiement"].map((s, i) => (
                  <div key={i} className={`step-item ${i === 1 ? "current" : ""}`}>
                    <div className="step-circle">{i + 1}</div>
                    <span>{s}</span>
                    {i < 3 && <div className="step-line"/>}
                  </div>
                ))}
              </div>
              <div className="verify-icon">📧</div>
              <h2 className="auth-title">Vérifiez votre email</h2>
              <p className="verify-desc">
                Un lien de confirmation a été envoyé à{" "}
                <strong>{form.email}</strong>.<br/>
                Cliquez sur le lien pour activer votre compte.
              </p>
              <div className="info-chip">⏱ Le lien expire dans 24h</div>
              <p className="verify-resend">
                Pas reçu ?{" "}
                <span className="auth-link">Renvoyer le mail</span>
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button className="btn-auth" onClick={() => setStep(3)} style={{ flex: 1 }}>
                  ✓ Compte vérifié, continuer
                </button>
                <button className="btn-auth-outline" onClick={() => navigate("/connexion")} style={{ flex: 1 }}>
                  Aller à la connexion
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 - FORMULE */}
          {step === 3 && (
            <div className="auth-card wide-card">
              <div className="steps-row">
                {["Informations","Vérification","Formule","Paiement"].map((s, i) => (
                  <div key={i} className={`step-item ${i === 2 ? "current" : ""}`}>
                    <div className="step-circle">{i + 1}</div>
                    <span>{s}</span>
                    {i < 3 && <div className="step-line"/>}
                  </div>
                ))}
              </div>

              <div className="auth-card-header">
                <h1 className="auth-title">Choisissez votre formule</h1>
                <p className="auth-subtitle">Sélectionnez le crédit qui correspond à vos besoins</p>
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "24px" }}>
                {/* Pack 1 */}
                <div onClick={() => { setPackChoisi({ id: "pack1", nom: "Pack 1", prix: 5000 }); setError(""); }}
                  style={{
                    padding: "20px",
                    borderRadius: "10px",
                    border: packChoisi?.id === "pack1" ? "2px solid #4DC97A" : "1.5px solid rgba(255,255,255,0.1)",
                    background: packChoisi?.id === "pack1" ? "rgba(77,201,122,0.12)" : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4DC97A" }}>5 000 FCFA</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "8px" }}>
                    Crédit prépayé · Déduction à chaque requête
                  </div>
                </div>

                {/* Pack 2 */}
                <div onClick={() => { setPackChoisi({ id: "pack2", nom: "Pack 2", prix: 10000 }); setError(""); }}
                  style={{
                    padding: "20px",
                    borderRadius: "10px",
                    border: packChoisi?.id === "pack2" ? "2px solid #22A052" : "1.5px solid rgba(255,255,255,0.1)",
                    background: packChoisi?.id === "pack2" ? "rgba(34,160,82,0.12)" : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#22A052" }}>10 000 FCFA</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "8px" }}>
                    Crédit prépayé · Déduction à chaque requête
                  </div>
                </div>

                {/* Pack 3 */}
                <div onClick={() => { setPackChoisi({ id: "pack3", nom: "Pack 3", prix: null, flexible: true }); setError(""); }}
                  style={{
                    padding: "20px",
                    borderRadius: "10px",
                    border: packChoisi?.id === "pack3" ? "2px solid #D4A830" : "1.5px solid rgba(255,255,255,0.1)",
                    background: packChoisi?.id === "pack3" ? "rgba(212,168,48,0.12)" : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#D4A830" }}>À partir de 15 000 FCFA</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "8px" }}>
                    Montant flexible · Déduction à chaque requête
                  </div>
                </div>
              </div>

              {/* Montant personnalisé pour Pack 3 */}
              {packChoisi?.id === "pack3" && (
                <div style={{ marginTop: "20px" }}>
                  <label style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "8px" }}>
                    Montant (minimum 15 000 FCFA)
                  </label>
                  <input
                    type="number"
                    value={montantPack3}
                    onChange={(e) => setMontantPack3(e.target.value)}
                    placeholder="50 000"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1.5px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      color: "white",
                      fontSize: "14px",
                      fontFamily: "inherit"
                    }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button className="btn-auth-outline" onClick={() => setStep(2)} style={{ flex: 1 }}>
                  ← Retour
                </button>
                <button
                  className="btn-auth"
                  onClick={() => {
                    if (!packChoisi) {
                      setError("Veuillez sélectionner une formule.");
                      return;
                    }
                    if (packChoisi.id === "pack3" && parseInt(montantPack3) < 15000) {
                      setError("Le montant doit être au minimum 15 000 FCFA.");
                      return;
                    }
                    if (packChoisi.id === "pack3") {
                      packChoisi.prix = parseInt(montantPack3);
                    }
                    setStep(4);
                  }}
                  style={{ flex: 1 }}
                >
                  Continuer au paiement →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 - PAIEMENT */}
          {step === 4 && (
            <div className="auth-card wide-card">
              <div className="steps-row">
                {["Informations","Vérification","Formule","Paiement"].map((s, i) => (
                  <div key={i} className={`step-item ${i === 3 ? "current" : ""}`}>
                    <div className="step-circle">{i + 1}</div>
                    <span>{s}</span>
                    {i < 3 && <div className="step-line"/>}
                  </div>
                ))}
              </div>

              <div className="auth-card-header">
                <h1 className="auth-title">Finaliser votre paiement</h1>
                <p className="auth-subtitle">Complétez votre inscription avec le paiement</p>
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <div style={{
                background: "rgba(77,201,122,0.06)",
                border: "1px solid rgba(77,201,122,0.25)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>Formule choisie:</span>
                  <span style={{ fontWeight: "bold", color: "#4DC97A" }}>{packChoisi?.nom}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "rgba(255,255,255,0.6)" }}>Montant:</span>
                  <span style={{ fontWeight: "bold", fontSize: "18px", color: "#4DC97A" }}>
                    {packChoisi?.prix?.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button
                  className="btn-auth"
                  onClick={() => navigate("/paiement", { state: { pack: packChoisi, user: form } })}
                  style={{ width: "100%" }}
                >
                  Procéder au paiement (CinetPay)
                </button>
                <button
                  className="btn-auth-outline"
                  onClick={() => navigate("/paiement", { state: { pack: packChoisi, user: form, modePaiement: "agence" } })}
                  style={{ width: "100%" }}
                >
                  Payer à l'agence CCI-BF
                </button>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                <button className="btn-auth-outline" onClick={() => setStep(3)} style={{ flex: 1 }}>
                  ← Retour
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}