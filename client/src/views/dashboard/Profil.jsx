import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({});
  const [activeTab, setActiveTab]   = useState("profil");
  const [abonnement, setAbonnement] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [histoForfait, setHistoForfait] = useState("tous");
  const [forfaits, setForfaits]     = useState([]);
  const [quota, setQuota]           = useState(null);
  const [histoLoading, setHistoLoading] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!u) { navigate("/connexion"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setForm({
      nom:          parsed.nom          || "",
      prenom:       parsed.prenom       || "",
      email:        parsed.email        || "",
      telephone:    parsed.telephone    || "",
      fonction:     parsed.fonction     || "",
      siteWeb:      parsed.siteWeb      || "",
    });

    // Charger le quota
    if (token) {
      fetch("http://localhost:5000/api/searchlogs/quota", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => { if (data.success) setQuota(data.data); })
      .catch(() => {});
    }

    // Charger l'abonnement
    if (token) {
      fetch("http://localhost:5000/api/abonnements/mon-solde", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setAbonnement(data.data); })
      .catch(() => {});
    }

    // Charger les données fraîches depuis l'API
    if (token) {
      fetch("http://localhost:5000/api/users/profil", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const u = data.data;
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          setForm({
            nom:       u.nom       || "",
            prenom:    u.prenom    || "",
            email:     u.email     || "",
            telephone: u.telephone || "",
            fonction:  u.fonction  || "",
            siteWeb:   u.siteWeb   || "",
          });
        }
      })
      .catch(() => {});
    }
  }, [navigate]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const chargerHistorique = async (forfait = "tous") => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoLoading(true);
    try {
      const url = forfait === "tous"
        ? "http://localhost:5000/api/searchlogs/mon-historique?limit=50"
        : `http://localhost:5000/api/searchlogs/mon-historique?forfait=${forfait}&limit=50`;
      const res  = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setHistorique(data.data);
        setForfaits(data.forfaits || []);
      }
    } catch(e) {}
    setHistoLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/users/profil", {
        method:  "PUT",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...user, ...data.data };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      } else {
        // Fallback local
        const updated = { ...user, ...form };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      }
    } catch(e) {
      const updated = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    }
    setEditing(false);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  const initiales = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#070E1C", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* FOND BLANC */}
      <div className="dash-bg">
        <div className="grid" />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── NAVBAR ── */}
        <nav className="dash-navbar">
          <div className="dash-logo" onClick={() => navigate("/")}>NERE <span>CCI-BF</span></div>
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link" onClick={() => navigate("/publications")}>Publications</span>
            <span className="dash-nav-link" onClick={() => navigate("/recherche")}>Recherche</span>
          </div>
          <div className="dash-nav-actions">
            <div className="user-chip active" onClick={() => navigate("/profil")}>
              <div className="user-avatar">{initiales}</div>
              <span>{user.prenom} {user.nom}</span>
            </div>
            <button className="btn-nav-outline" onClick={handleLogout}>Déconnexion</button>
          </div>
        </nav>

        <div className="profil-layout">

          {/* ── SIDEBAR ── */}
          <aside className="profil-sidebar">
            {/* Avatar */}
            <div className="profil-avatar-zone">
              <div className="profil-avatar">{initiales}</div>
              <div className="profil-name">{user.prenom} {user.nom}</div>
              <div className="profil-email">{user.email}</div>
              
            </div>

            {/* Menu */}
            <nav className="profil-menu">
              {[
                { key: "profil",        label: "Mon Profil" },
                { key: "abonnement",    label: "Abonnement" },
                { key: "securite",      label: "Sécurité" },
                { key: "notifications", label: "Notifications" },
              ].map(item => (
                <div
                  key={item.key}
                  className={`profil-menu-item ${activeTab === item.key ? "active" : ""}`}
                  onClick={() => setActiveTab(item.key)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="profil-menu-item danger" onClick={handleLogout}>
                <span></span><span>Déconnexion</span>
              </div>
            </nav>
          </aside>

          {/* ── CONTENU PRINCIPAL ── */}
          <main className="profil-main">

            {/* ══ ONGLET PROFIL ══ */}
            {activeTab === "profil" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Informations personnelles</div>
                    <h2 className="profil-section-title">Mon Profil</h2>
                  </div>
                  {!editing ? (
                    <button className="btn-edit" onClick={() => setEditing(true)}>
                       Modifier
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="btn-cancel" onClick={() => setEditing(false)}>
                        Annuler
                      </button>
                      <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner-sm" /> : " Enregistrer"}
                      </button>
                    </div>
                  )}
                </div>

                {saved && (
                  <div className="success-banner"> Profil mis à jour avec succès !</div>
                )}

                <div className="profil-form-grid">
                  {/* Nom */}
                  <div className="profil-field">
                    <label className="profil-label">Nom</label>
                    {editing ? (
                      <input className="profil-input" name="nom" value={form.nom} onChange={handleChange} />
                    ) : (
                      <div className="profil-value">{user.nom || <span className="empty">—</span>}</div>
                    )}
                  </div>

                  {/* Prénom */}
                  <div className="profil-field">
                    <label className="profil-label">Prénom</label>
                    {editing ? (
                      <input className="profil-input" name="prenom" value={form.prenom} onChange={handleChange} />
                    ) : (
                      <div className="profil-value">{user.prenom || <span className="empty">—</span>}</div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="profil-field full">
                    <label className="profil-label">Email</label>
                    {editing ? (
                      <input className="profil-input" name="email" type="email" value={form.email} onChange={handleChange} />
                    ) : (
                      <div className="profil-value">
                        {user.email}
                        <span className="verified-chip">✓ Vérifié</span>
                      </div>
                    )}
                  </div>

                  {/* Organisation */}
                  <div className="profil-field full">
                    <label className="profil-label">Organisation / Entreprise</label>
                    {editing ? (
                      <input className="profil-input" name="fonction" value={form.fonction}
                        onChange={handleChange} placeholder="Nom de votre société" />
                    ) : (
                      <div className="profil-value">{user.fonction || <span className="empty">Non renseigné</span>}</div>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div className="profil-field">
                    <label className="profil-label">Téléphone</label>
                    {editing ? (
                      <input className="profil-input" name="telephone" value={form.telephone}
                        onChange={handleChange} placeholder="+226 07 XX XX XX" />
                    ) : (
                      <div className="profil-value">{user.telephone || <span className="empty">Non renseigné</span>}</div>
                    )}
                  </div>

                  {/* Ville */}
                  <div className="profil-field">
                    <label className="profil-label">Ville</label>
                    {editing ? (
                      <select className="profil-input" name="siteWeb" value={form.siteWeb} onChange={handleChange}>
                        <option value="">Sélectionner...</option>
                        {["Ouagadougou","Bobo-Dioulasso","Koudougou","Ouahigouya","Banfora","Fada N'Gourma"].map(v =>
                          <option key={v}>{v}</option>
                        )}
                      </select>
                    ) : (
                      <div className="profil-value">{user.siteWeb || <span className="empty">Non renseigné</span>}</div>
                    )}
                  </div>

                  {/* Rôle */}
                  <div className="profil-field">
                    <label className="profil-label">Rôle</label>
                    <div className="profil-value">
                      <span className="role-chip">{user.role || "subscriber"}</span>
                    </div>
                  </div>

                  {/* Membre depuis */}
                  <div className="profil-field">
                    <label className="profil-label">Membre depuis</label>
                    <div className="profil-value">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "2025"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ONGLET ABONNEMENT ══ */}
            {activeTab === "abonnement" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    
                    <h2 className="profil-section-title">Mon Crédit</h2>
                  </div>
                </div>

                {/* Alerte si crédit épuisé */}
                {abonnement && abonnement.solde <= 0 && (
                  <div style={{
                    background: "#FFE5E5",
                    border: "2px solid #FF6B6B",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <span style={{ fontSize: "20px" }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#FF3333" }}>Crédit épuisé</div>
                      <div style={{ fontSize: "13px", color: "#D32F2F", marginTop: "4px" }}>
                        Veuillez recharger votre compte pour continuer à utiliser le service
                      </div>
                    </div>
                  </div>
                )}

                {/* Alerte si crédit faible (< 1000) */}
                {abonnement && abonnement.solde > 0 && abonnement.solde < 1000 && (
                  <div style={{
                    background: "#FFF4E5",
                    border: "2px solid #D4A830",
                    borderRadius: "8px",
                    padding: "16px",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <span style={{ fontSize: "20px" }}>⚡</span>
                    <div>
                      <div style={{ fontWeight: "bold", color: "#D4A830" }}>Crédit faible</div>
                      <div style={{ fontSize: "13px", color: "#B8860B", marginTop: "4px" }}>
                        Vous avez moins de 1 000 FCFA. Pensez à recharger bientôt.
                      </div>
                    </div>
                  </div>
                )}

                {/* Carte de crédit */}
                <div style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  padding: "24px",
                  color: "white",
                  marginBottom: "24px"
                }}>
                  <div style={{ fontSize: "13px", opacity: "0.9", marginBottom: "8px" }}>Solde disponible</div>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: "bold",
                    marginBottom: "4px"
                  }}>
                    {abonnement ? abonnement.solde?.toLocaleString("fr-FR") : "0"} FCFA
                  </div>
                  <div style={{ fontSize: "12px", opacity: "0.8" }}>
                    {abonnement && abonnement.solde > 0 ? "✓ Compte actif" : "✗ Veuillez recharger"}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                  <button
                    onClick={() => navigate("/formules")}
                    style={{
                      flex: 1,
                      background: "#3CC47A",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    Ajouter du crédit
                  </button>
                  <button
                    onClick={() => { setActiveTab("historique"); chargerHistorique("tous"); }}
                    style={{
                      flex: 1,
                      background: "#F0F0F0",
                      color: "#333",
                      border: "none",
                      borderRadius: "6px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    Voir l'historique
                  </button>
                </div>

                {/* Aperçu de l'historique */}
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "12px" }}>
                    Dernières transactions
                  </div>
                  {historique && historique.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {historique.slice(0, 5).map((item, idx) => (
                        <div key={idx} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px",
                          background: "#F9F9F9",
                          borderRadius: "6px",
                          fontSize: "13px"
                        }}>
                          <div>
                            <div style={{ fontWeight: "600", color: "#333" }}>{item.forfait || "Recherche"}</div>
                            <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
                              {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                          <div style={{ textAlign: "right", color: "#D32F2F", fontWeight: "600" }}>
                            -{item.montant?.toLocaleString("fr-FR") || "0"} FCFA
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#999", fontSize: "13px", textAlign: "center", padding: "20px" }}>
                      Aucune transaction enregistrée
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ ONGLET SÉCURITÉ ══ */}
            {activeTab === "securite" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Compte</div>
                    <h2 className="profil-section-title">Sécurité</h2>
                  </div>
                </div>
                <div className="security-item">
                  <div>
                    <div className="security-label">Mot de passe</div>
                    <div className="security-hint">Dernière modification : jamais</div>
                  </div>
                  <button className="btn-edit">Modifier</button>
                </div>
                <div className="security-item">
                  <div>
                    <div className="security-label">Email de vérification</div>
                    <div className="security-hint" style={{ color: "#3CC47A" }}> Email vérifié</div>
                  </div>
                </div>
                <div className="security-item">
                  <div>
                    <div className="security-label">Sessions actives</div>
                    <div className="security-hint">1 session active — Ce navigateur</div>
                  </div>
                  <button className="btn-cancel">Déconnecter tout</button>
                </div>
              </div>
            )}

            {/* ══ ONGLET HISTORIQUE ══ */}
            {activeTab === "historique" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Activité</div>
                    <h2 className="profil-section-title">Historique des recherches</h2>
                  </div>
                  <button className="btn-save" style={{ fontSize:"12px", padding:"8px 16px" }}
                    onClick={() => chargerHistorique(histoForfait)}>
                     Actualiser
                  </button>
                </div>

                {/* Quota */}
                {quota && (
                  <div style={{ background:"var(--green-pale)", borderRadius:"12px",
                    padding:"16px 20px", marginBottom:"20px",
                    border:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:"8px" }}>
                      <span style={{ fontWeight:700, fontSize:"14px",
                        color:"var(--green-dark)" }}>
                        Forfait {quota.pack} — Quota de recherches
                      </span>
                      <span style={{ fontWeight:800, fontSize:"16px",
                        color: quota.illimite ? "var(--green-dark)" :
                               quota.restant === 0 ? "#FF6B6B" :
                               quota.restant <= 5  ? "#D4A830" : "var(--green-dark)" }}>
                        {quota.illimite ? "♾️ Illimité" : `${quota.restant} / ${quota.quota} restantes`}
                      </span>
                    </div>
                    {!quota.illimite && (
                      <div style={{ height:"8px", borderRadius:"100px",
                        background:"var(--border)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:"100px",
                          width:`${Math.min(100,(quota.utilise/quota.quota)*100)}%`,
                          background: quota.restant === 0 ? "#FF6B6B" :
                                      quota.restant <= 5  ? "#D4A830" : "#4DC97A",
                          transition:"width 0.4s" }}/>
                      </div>
                    )}
                    <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"6px" }}>
                      {quota.utilise} recherche{quota.utilise > 1 ? "s" : ""} effectuée{quota.utilise > 1 ? "s" : ""} ce mois
                    </div>
                  </div>
                )}

                {/* Filtre par forfait */}
                {forfaits.length > 0 && (
                  <div style={{ display:"flex", gap:"8px", marginBottom:"16px",
                    flexWrap:"wrap" }}>
                    {["tous", ...forfaits].map(f => (
                      <button key={f}
                        onClick={() => { setHistoForfait(f); chargerHistorique(f); }}
                        style={{ padding:"6px 14px", borderRadius:"100px",
                          border: histoForfait===f
                            ? "2px solid var(--green-light)"
                            : "1.5px solid var(--border)",
                          background: histoForfait===f ? "var(--green-pale)" : "#fff",
                          color: histoForfait===f ? "var(--green-dark)" : "var(--text-mid)",
                          fontWeight: histoForfait===f ? 700 : 500,
                          fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>
                        {f === "tous" ? "Tous les forfaits" : `Forfait ${f}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bouton charger si vide */}
                {historique.length === 0 && !histoLoading && (
                  <div style={{ textAlign:"center", padding:"40px" }}>
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
                    <p style={{ color:"var(--text-muted)", fontSize:"14px",
                      marginBottom:"16px" }}>
                      Aucune recherche enregistrée
                    </p>
                    <button className="btn-save"
                      onClick={() => chargerHistorique(histoForfait)}>
                      Charger l'historique
                    </button>
                  </div>
                )}

                {histoLoading && (
                  <div style={{ textAlign:"center", padding:"40px",
                    color:"var(--text-muted)", fontSize:"14px" }}>
                     Chargement...
                  </div>
                )}

                {/* Liste historique */}
                {historique.length > 0 && (
                  <div className="histo-list">
                    {historique.map((h, i) => (
                      <div key={h._id || i} className="histo-item">
                        <div style={{ flex:1 }}>
                          <div className="histo-critere">
                            {h.description || "Recherche sans titre"}
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px",
                            marginTop:"4px" }}>
                            {h.criteres?.region && (
                              <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>
                                 {h.criteres.region}
                                {h.criteres.ville ? ` · ${h.criteres.ville}` : ""}
                              </span>
                            )}
                            {h.criteres?.categorie && (
                              <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>
                                 {h.criteres.categorie}
                              </span>
                            )}
                            {h.criteres?.typeAffichage && (
                              <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>
                                 {h.criteres.typeAffichage}
                              </span>
                            )}
                          </div>
                          <div className="histo-date">
                             {new Date(h.createdAt).toLocaleDateString("fr-FR", {
                              day:"2-digit", month:"long", year:"numeric"
                            })} à {new Date(h.createdAt).toLocaleTimeString("fr-FR", {
                              hour:"2-digit", minute:"2-digit"
                            })}
                            &nbsp;·&nbsp;
                            <strong>{h.nbResultats} résultat{h.nbResultats > 1 ? "s" : ""}</strong>
                            &nbsp;·&nbsp;
                            <span style={{ color:"var(--green-dark)", fontWeight:600 }}>
                              Forfait {h.forfait}
                            </span>
                          </div>
                        </div>
                        <button className="btn-relancer"
                          onClick={() => navigate("/recherche")}>
                           Nouvelle recherche
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ONGLET NOTIFICATIONS ══ */}
            {activeTab === "notifications" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Alertes</div>
                    <h2 className="profil-section-title">Notifications</h2>
                  </div>
                </div>
                <div className="notif-list">
                  {[
                    {  msg: "Votre abonnement PRO a été activé", date: "01 Jan. 2025", read: true },
                    {  msg: "Email de vérification envoyé", date: "31 Déc. 2024", read: true },
                   { msg: "Bienvenue sur NERE CCI-BF !", date: "31 Déc. 2024", read: true },
                  ].map((n, i) => (
                    <div key={i} className={`notif-item ${n.read ? "read" : "unread"}`}>
                      <div className="notif-icon">{n.icon}</div>
                      <div>
                        <div className="notif-msg">{n.msg}</div>
                        <div className="notif-date">{n.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </main>
        </div>

        {/* FOOTER */}
        <footer className="dash-footer">
          <span> CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{ display: "flex", gap: "20px" }}>
            <span>CGU</span><span>Contact</span><span>Support</span>
          </div>
        </footer>

      </div>
    </div>
  );
}