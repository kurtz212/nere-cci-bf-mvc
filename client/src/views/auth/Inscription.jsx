import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/auth.css";

export default function Inscription() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=formulaire, 2=email envoyé
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    nom: "", prenom: "", email: "", organisation: "",
    telephone: "", ville: "", password: "", confirm: "", cgu: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cgu) return setError("Veuillez accepter les CGU.");
    if (form.password !== form.confirm) return setError("Les mots de passe ne correspondent pas.");
    if (form.password.length < 8) return setError("Le mot de passe doit contenir au moins 8 caractères.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom, prenom: form.prenom, email: form.email,
          password: form.password, telephone: form.telephone,
          ville: form.ville, organisation: form.organisation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep(2);
      } else {
        setError(data.message || "Une erreur est survenue.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FOND */}
      <div className="auth-bg">
        <div className="auth-blob1" />
        <div className="auth-blob2" />
        <div className="auth-grid" />
        <svg className="auth-skyline" viewBox="0 0 1400 200" preserveAspectRatio="xMidYMax meet" fill="rgba(46,111,204,0.4)" xmlns="http://www.w3.org/2000/svg">
          <rect x="40"  y="60"  width="80"  height="140" /><rect x="150" y="80"  width="60"  height="120" />
          <rect x="240" y="20"  width="100" height="180" /><rect x="370" y="70"  width="70"  height="130" />
          <rect x="470" y="40"  width="120" height="160" /><rect x="700" y="75"  width="60"  height="125" />
          <rect x="790" y="30"  width="90"  height="170" /><rect x="910" y="60"  width="75"  height="140" />
          <rect x="1010" y="20" width="110" height="180" /><rect x="1150" y="70" width="65"  height="130" />
          <rect x="1240" y="40" width="85"  height="160" /><rect x="1350" y="80" width="50"  height="120" />
          <rect x="0" y="198" width="1400" height="2" fill="rgba(46,111,204,0.5)" />
        </svg>
      </div>

      <div className="auth-wrapper">
        {/* NAVBAR MINI */}
        <nav className="auth-navbar">
          <div className="auth-logo" onClick={() => navigate("/")}>
            NERE <span>CCI-BF</span>
          </div>
          <div className="auth-nav-right">
            Déjà un compte ?{" "}
            <span className="auth-link" onClick={() => navigate("/connexion")}>
              Se connecter
            </span>
          </div>
        </nav>

        <div className="auth-container">

          {step === 1 ? (
            <div className="auth-card wide-card">
              {/* ÉTAPES */}
              <div className="steps-row">
                {["Informations","Vérification","Formule","Paiement"].map((s, i) => (
                  <div key={i} className={`step-item ${i === 0 ? "current" : ""}`}>
                    <div className="step-circle">{i + 1}</div>
                    <span>{s}</span>
                    {i < 3 && <div className="step-line" />}
                  </div>
                ))}
              </div>

              <div className="auth-card-header">
                <h1 className="auth-title">Créer votre compte</h1>
                <p className="auth-subtitle">Accédez aux données économiques du Burkina Faso</p>
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Nom *</label>
                    <input className="form-input" name="nom" placeholder="Traoré"
                      value={form.nom} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Prénom *</label>
                    <input className="form-input" name="prenom" placeholder="Ibrahim"
                      value={form.prenom} onChange={handleChange} required />
                  </div>
                  <div className="form-field full">
                    <label className="form-label">Email professionnel *</label>
                    <input className="form-input" name="email" type="email"
                      placeholder="i.traore@entreprise.bf"
                      value={form.email} onChange={handleChange} required />
                  </div>
                  <div className="form-field full">
                    <label className="form-label">Organisation / Entreprise</label>
                    <input className="form-input" name="organisation"
                      placeholder="Nom de votre société (optionnel)"
                      value={form.organisation} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Téléphone</label>
                    <input className="form-input" name="telephone"
                      placeholder="+226 07 XX XX XX"
                      value={form.telephone} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Ville</label>
                    <select className="form-input form-select" name="ville"
                      value={form.ville} onChange={handleChange}>
                      <option value="">Sélectionner...</option>
                      <option>Ouagadougou</option>
                      <option>Bobo-Dioulasso</option>
                      <option>Koudougou</option>
                      <option>Ouahigouya</option>
                      <option>Banfora</option>
                      <option>Fada N'Gourma</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label className="form-label">Mot de passe *</label>
                    <input className="form-input" name="password" type="password"
                      placeholder="Min. 8 caractères"
                      value={form.password} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Confirmer *</label>
                    <input className="form-input" name="confirm" type="password"
                      placeholder="Répéter le mot de passe"
                      value={form.confirm} onChange={handleChange} required />
                  </div>
                </div>

                {/* Force du mot de passe */}
                {form.password && (
                  <div className="pwd-strength">
                    <div className="pwd-bar">
                      <div className={`pwd-fill strength-${
                        form.password.length < 6 ? "weak"
                        : form.password.length < 10 ? "medium"
                        : "strong"
                      }`} />
                    </div>
                    <span className="pwd-label">
                      {form.password.length < 6 ? "Faible"
                        : form.password.length < 10 ? "Moyen"
                        : "Fort"}
                    </span>
                  </div>
                )}

                <label className="cgu-row">
                  <input type="checkbox" name="cgu" checked={form.cgu} onChange={handleChange} />
                  <span>
                    J'accepte les{" "}
                    <span className="auth-link">Conditions Générales d'Utilisation</span>{" "}
                    et la{" "}
                    <span className="auth-link">Politique de confidentialité</span>{" "}
                    de la CCI-BF
                  </span>
                </label>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <span className="spinner" /> : "Créer mon compte →"}
                </button>
              </form>
            </div>

          ) : (
            /* ── ÉTAPE 2 : Email envoyé ── */
            <div className="auth-card verify-card">
              <div className="verify-icon">📧</div>
              <h2 className="auth-title">Vérifiez votre email</h2>
              <p className="verify-desc">
                Un lien de confirmation a été envoyé à{" "}
                <strong>{form.email}</strong>.<br />
                Cliquez sur le lien pour activer votre compte.
              </p>
              <div className="info-chip">⏱ Le lien expire dans 24h</div>
              <p className="verify-resend">
                Pas reçu ?{" "}
                <span className="auth-link">Renvoyer le mail</span>
              </p>
              <button className="btn-auth-outline" onClick={() => navigate("/connexion")}>
                Aller à la connexion
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}