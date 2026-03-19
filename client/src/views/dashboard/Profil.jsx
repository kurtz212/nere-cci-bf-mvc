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
  const [activeTab, setActiveTab] = useState("profil");

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) { navigate("/connexion"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setForm({
      nom: parsed.nom || "",
      prenom: parsed.prenom || "",
      email: parsed.email || "",
      telephone: parsed.telephone || "",
      ville: parsed.ville || "",
      organisation: parsed.organisation || "",
    });
  }, [navigate]);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    // Simule un appel API
    await new Promise(r => setTimeout(r, 1000));
    const updated = { ...user, ...form };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
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
              <div className="profil-pack-badge">
                <span className="pack-dot" />
                Pack PRO · Actif
              </div>
            </div>

            {/* Menu */}
            <nav className="profil-menu">
              {[
                { key: "profil",       icon: "👤", label: "Mon Profil" },
                { key: "abonnement",   icon: "💳", label: "Abonnement" },
                { key: "securite",     icon: "🔒", label: "Sécurité" },
                { key: "historique",   icon: "📋", label: "Historique" },
                { key: "notifications",icon: "🔔", label: "Notifications" },
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
                <span>🚪</span><span>Déconnexion</span>
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
                      ✏️ Modifier
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="btn-cancel" onClick={() => setEditing(false)}>
                        Annuler
                      </button>
                      <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner-sm" /> : "💾 Enregistrer"}
                      </button>
                    </div>
                  )}
                </div>

                {saved && (
                  <div className="success-banner">✅ Profil mis à jour avec succès !</div>
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
                      <input className="profil-input" name="organisation" value={form.organisation}
                        onChange={handleChange} placeholder="Nom de votre société" />
                    ) : (
                      <div className="profil-value">{user.organisation || <span className="empty">Non renseigné</span>}</div>
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
                      <select className="profil-input" name="ville" value={form.ville} onChange={handleChange}>
                        <option value="">Sélectionner...</option>
                        {["Ouagadougou","Bobo-Dioulasso","Koudougou","Ouahigouya","Banfora","Fada N'Gourma"].map(v =>
                          <option key={v}>{v}</option>
                        )}
                      </select>
                    ) : (
                      <div className="profil-value">{user.ville || <span className="empty">Non renseigné</span>}</div>
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
                    <div className="section-tag-small">Gestion</div>
                    <h2 className="profil-section-title">Mon Abonnement</h2>
                  </div>
                </div>

                {/* Pack actuel */}
                <div className="abo-current-card">
                  <div className="abo-card-left">
                    <div className="abo-pack-name">Pack PRO</div>
                    <div className="abo-pack-price">35 000 FCFA / an</div>
                    <div className="abo-dates">
                      Activé le <strong>01 Jan. 2025</strong> · Expire le <strong>31 Jan. 2026</strong>
                    </div>
                    <div className="abo-status-chip">● Abonnement actif</div>
                  </div>
                  <div className="abo-card-right">
                    <div className="abo-quota-label">Recherches ce mois</div>
                    <div className="abo-quota-value">13 <span>/ 100</span></div>
                    <div className="abo-quota-bar">
                      <div className="abo-quota-fill" style={{ width: "13%" }} />
                    </div>
                    <div className="abo-quota-hint">87 recherches restantes</div>
                  </div>
                </div>

                {/* Fonctionnalités */}
                <div className="abo-features-title">Fonctionnalités incluses</div>
                <div className="abo-features-grid">
                  {[
                    { icon: "🔍", label: "Recherche simple", ok: true },
                    { icon: "⚙️", label: "Recherche avancée", ok: true },
                    { icon: "📄", label: "Export PDF / Excel", ok: true },
                    { icon: "💰", label: "Données financières partielles", ok: true },
                    { icon: "♾️", label: "Recherches illimitées", ok: false },
                    { icon: "💎", label: "Données financières complètes", ok: false },
                  ].map((f, i) => (
                    <div key={i} className={`abo-feature ${f.ok ? "ok" : "no"}`}>
                      <span>{f.icon}</span>
                      <span>{f.label}</span>
                      <span className="feature-check">{f.ok ? "✓" : "✕"}</span>
                    </div>
                  ))}
                </div>

                <div className="abo-actions">
                  <button className="btn-renew">🔄 Renouveler</button>
                  <button className="btn-upgrade-pack">⬆️ Passer Premium</button>
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
                    <div className="security-hint" style={{ color: "#3CC47A" }}>✓ Email vérifié</div>
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
                </div>
                <div className="histo-list">
                  {[
                    { critere: "BTP · Ouagadougou · CA > 100M", date: "Hier, 14h32", nb: 14 },
                    { critere: "Commerce · Bobo-Dioulasso · > 50 employés", date: "Lundi 24 Fév.", nb: 8 },
                    { critere: "Agriculture · Région Nord", date: "Vendredi 21 Fév.", nb: 22 },
                    { critere: "Transport · IFU: 000-12345-A", date: "Mercredi 19 Fév.", nb: 1 },
                  ].map((h, i) => (
                    <div key={i} className="histo-item">
                      <div>
                        <div className="histo-critere">{h.critere}</div>
                        <div className="histo-date">{h.date} · {h.nb} résultat{h.nb > 1 ? "s" : ""}</div>
                      </div>
                      <button className="btn-relancer">↻ Relancer</button>
                    </div>
                  ))}
                </div>
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
                    { icon: "✅", msg: "Votre abonnement PRO a été activé", date: "01 Jan. 2025", read: true },
                    { icon: "📧", msg: "Email de vérification envoyé", date: "31 Déc. 2024", read: true },
                    { icon: "🔔", msg: "Bienvenue sur NERE CCI-BF !", date: "31 Déc. 2024", read: true },
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
          <span>© 2026 CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{ display: "flex", gap: "20px" }}>
           
          </div>
        </footer>

      </div>
    </div>
  );
}