import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const ACTIVITES = [
  { value: "commerce_gros",            label: "Commerce de gros" },
  { value: "commerce_detail",          label: "Commerce de détail" },
  { value: "industrie_agroalimentaire",label: "Industrie agro-alimentaire" },
  { value: "industrie_textile",        label: "Industrie textile" },
  { value: "industrie_metallurgie",    label: "Industrie métallurgie / métal" },
  { value: "industrie_papier",         label: "Industrie papier / imprimerie" },
  { value: "artisanat",                label: "Artisanat" },
  { value: "agrobusiness_elevage",     label: "Agrobusiness — Élevage" },
  { value: "agrobusiness_agriculture", label: "Agrobusiness — Agriculture" },
  { value: "service_banque",           label: "Services — Banque & Finance" },
  { value: "service_etude",            label: "Services — Bureau d'études" },
  { value: "service_enseignement",     label: "Services — Enseignement" },
  { value: "service_sante",            label: "Services — Santé" },
  { value: "service_transport",        label: "Services — Transport & Logistique" },
];

const TYPES_REQUETES = [
  { id:"liste",       label:"Liste" },
  { id:"detail",      label:"Détails" },
  { id:"statistique", label:"Statistiques" },
  { id:"fiche",       label:"Fiche" },
  { id:"autre",       label:"Répertoire Thématique" },
];

const STATUT_COLORS = {
  en_attente: { bg:"rgba(212,168,48,0.1)",  color:"#D4A830", label:"En attente" },
  en_cours:   { bg:"rgba(34,160,82,0.1)",   color:"#22A052", label:"En cours" },
  traite:     { bg:"rgba(26,122,64,0.12)",  color:"#1A7A40", label:"Traité" },
  rejete:     { bg:"rgba(232,85,85,0.1)",   color:"#E85555", label:"Rejeté" },
};

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [form, setForm]       = useState({});
  const [activeTab, setActiveTab]   = useState("profil");
  const [abonnement, setAbonnement] = useState(null);
  const [quota, setQuota]           = useState(null);

  /* ── Historique recherches entreprises ── */
  const [histoRecherches, setHistoRecherches]               = useState([]);
  const [histoRechercheLoading, setHistoRechercheLoading]   = useState(false);
  const [histoRechercheErreur, setHistoRechercheErreur]     = useState("");
  const [replayLoadingId, setReplayLoadingId]               = useState(null);
  const [replayMessage, setReplayMessage]                   = useState({ id:null, texte:"", type:"" });

  /* ── Historique demandes documents ── */
  const [histoDemandes, setHistoDemandes]                   = useState([]);
  const [histoDemandeLoading, setHistoDemandeLoading]       = useState(false);
  const [histoDemandeErreur, setHistoDemandeErreur]         = useState("");

  /* ── Sous-section active dans l'onglet historique ── */
  const [sectionHisto, setSectionHisto] = useState("recherches");

  useEffect(() => {
    const u     = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!u) { navigate("/connexion"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setForm({
      nom:       parsed.nom       || "",
      prenom:    parsed.prenom    || "",
      email:     parsed.email     || "",
      telephone: parsed.telephone || "",
      fonction:  parsed.fonction  || "",
      siteWeb:   parsed.siteWeb   || "",
    });
    if (token) {
      fetch("http://localhost:5000/api/searchlogs/quota", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r=>r.json()).then(d=>{ if(d.success) setQuota(d.data); }).catch(()=>{});

      fetch("http://localhost:5000/api/abonnements/mon-solde", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r=>r.json()).then(d=>{ if(d.success&&d.data) setAbonnement(d.data); }).catch(()=>{});

      fetch("http://localhost:5000/api/users/profil", {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r=>r.json()).then(d=>{
        if(d.success){
          const u=d.data; setUser(u); localStorage.setItem("user",JSON.stringify(u));
          setForm({ nom:u.nom||"", prenom:u.prenom||"", email:u.email||"",
            telephone:u.telephone||"", fonction:u.fonction||"", siteWeb:u.siteWeb||"" });
        }
      }).catch(()=>{});
    }
  }, [navigate]);

  /* ── Chargement recherches entreprises ── */
  const chargerHistoRecherches = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoRechercheLoading(true);
    setHistoRechercheErreur("");
    try {
      const res  = await fetch(
        "http://localhost:5000/api/searchlogs/mon-historique?type=entreprise&limit=50",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setHistoRecherches(data.data || []);
      else setHistoRechercheErreur(data.message || "Impossible de charger.");
    } catch { setHistoRechercheErreur("Serveur inaccessible."); }
    setHistoRechercheLoading(false);
  }, []);

  /* ── Chargement demandes documents ── */
  const chargerHistoDemandes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoDemandeLoading(true);
    setHistoDemandeErreur("");
    try {
      const res  = await fetch("http://localhost:5000/api/demandes/mes-demandes",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setHistoDemandes(data.data || []);
      else setHistoDemandeErreur(data.message || "Impossible de charger.");
    } catch { setHistoDemandeErreur("Serveur inaccessible."); }
    setHistoDemandeLoading(false);
  }, []);

  /* Charger les deux quand on ouvre l'onglet historique */
  useEffect(() => {
    if (activeTab === "historique") {
      chargerHistoRecherches();
      chargerHistoDemandes();
    }
  }, [activeTab, chargerHistoRecherches, chargerHistoDemandes]);

  /* ── Relancer une recherche entreprise ── */
  const relancerRecherche = async (item) => {
    if (!item?._id) return;
    setReplayMessage({ id:null, texte:"", type:"" });
    setReplayLoadingId(item._id);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`http://localhost:5000/api/searchlogs/${item._id}/replay`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setReplayMessage({
          id: item._id,
          texte: data.updated
            ? "Modification détectée : nouvelle requête enregistrée et facturée."
            : "Aucune mise à jour : résultat servi depuis le cache, non facturé.",
          type: "succes",
        });
        chargerHistoRecherches();
      } else {
        setReplayMessage({ id:item._id, texte:data.message||"Relance impossible.", type:"erreur" });
      }
    } catch {
      setReplayMessage({ id:item._id, texte:"Erreur serveur lors de la relance.", type:"erreur" });
    }
    setReplayLoadingId(null);
    setTimeout(() => setReplayMessage({ id:null, texte:"", type:"" }), 5000);
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch("http://localhost:5000/api/users/profil", {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const updated = { ...user, ...(data.success ? data.data : form) };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    } catch {
      const updated = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
    }
    setEditing(false); setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  const initiales = `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase();

  const Chip = ({ label, color }) => (
    <span style={{
      background: color ? `${color}15` : "var(--green-pale)",
      color:      color || "var(--green-dark)",
      border: `1px solid ${color ? `${color}33` : "rgba(34,160,82,0.2)"}`,
      borderRadius:"100px", padding:"2px 10px",
      fontSize:"11px", fontWeight:600,
    }}>{label}</span>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#070E1C", fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div className="dash-bg"><div className="grid"/></div>

      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAVBAR */}
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

          {/* SIDEBAR */}
          <aside className="profil-sidebar">
            <div className="profil-avatar-zone">
              <div className="profil-avatar">{initiales}</div>
              <div className="profil-name">{user.prenom} {user.nom}</div>
              <div className="profil-email">{user.email}</div>
            </div>
            <nav className="profil-menu">
              {[
                { key:"profil",        label:"Mon Profil" },
                { key:"abonnement",    label:"Abonnement" },
                { key:"historique",    label:"Historique" },
                { key:"securite",      label:"Sécurité" },
                { key:"notifications", label:"Notifications" },
               
              ].map(item => (
                <div key={item.key}
                  className={`profil-menu-item ${activeTab===item.key?"active":""}`}
                  onClick={() => setActiveTab(item.key)}>
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="profil-menu-item danger" onClick={handleLogout}>
                <span>Déconnexion</span>
              </div>
            </nav>
          </aside>

          {/* CONTENU PRINCIPAL */}
          <main className="profil-main">

            {/* ══ PROFIL ══ */}
            {activeTab === "profil" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Informations personnelles</div>
                    <h2 className="profil-section-title">Mon Profil</h2>
                  </div>
                  {!editing ? (
                    <button className="btn-edit" onClick={() => setEditing(true)}>Modifier</button>
                  ) : (
                    <div style={{ display:"flex", gap:"10px" }}>
                      <button className="btn-cancel" onClick={() => setEditing(false)}>Annuler</button>
                      <button className="btn-save" onClick={handleSave} disabled={saving}>
                        {saving ? <span className="spinner-sm"/> : "Enregistrer"}
                      </button>
                    </div>
                  )}
                </div>
                {saved && <div className="success-banner">Profil mis à jour avec succès !</div>}
                <div className="profil-form-grid">
                  {[{ name:"nom", label:"Nom" }, { name:"prenom", label:"Prénom" }].map(f => (
                    <div key={f.name} className="profil-field">
                      <label className="profil-label">{f.label}</label>
                      {editing
                        ? <input className="profil-input" name={f.name} value={form[f.name]} onChange={handleChange}/>
                        : <div className="profil-value">{user[f.name]||<span className="empty">—</span>}</div>}
                    </div>
                  ))}
                  <div className="profil-field full">
                    <label className="profil-label">Email</label>
                    {editing
                      ? <input className="profil-input" name="email" type="email" value={form.email} onChange={handleChange}/>
                      : <div className="profil-value">{user.email}<span className="verified-chip"> Vérifié</span></div>}
                  </div>
                  <div className="profil-field full">
                    <label className="profil-label">Organisation / Entreprise</label>
                    {editing
                      ? <input className="profil-input" name="fonction" value={form.fonction} onChange={handleChange} placeholder="Nom de votre société"/>
                      : <div className="profil-value">{user.fonction||<span className="empty">Non renseigné</span>}</div>}
                  </div>
                  <div className="profil-field">
                    <label className="profil-label">Téléphone</label>
                    {editing
                      ? <input className="profil-input" name="telephone" value={form.telephone} onChange={handleChange} placeholder="+226 07 XX XX XX"/>
                      : <div className="profil-value">{user.telephone||<span className="empty">Non renseigné</span>}</div>}
                  </div>
                  <div className="profil-field">
                    <label className="profil-label">Ville</label>
                    {editing
                      ? <select className="profil-input" name="siteWeb" value={form.siteWeb} onChange={handleChange}>
                          <option value="">Sélectionner...</option>
                          {["Ouagadougou","Bobo-Dioulasso","Koudougou","Ouahigouya","Banfora","Fada N'Gourma"].map(v =>
                            <option key={v}>{v}</option>)}
                        </select>
                      : <div className="profil-value">{user.siteWeb||<span className="empty">Non renseigné</span>}</div>}
                  </div>
                  <div className="profil-field">
                    <label className="profil-label">Rôle</label>
                    <div className="profil-value"><span className="role-chip">{user.role||"subscriber"}</span></div>
                  </div>
                  <div className="profil-field">
                    <label className="profil-label">Membre depuis</label>
                    <div className="profil-value">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "2025"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ ABONNEMENT ══ */}
            {activeTab === "abonnement" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div><h2 className="profil-section-title">Mon Crédit</h2></div>
                </div>
                {abonnement && abonnement.solde <= 0 && (
                  <div style={{ background:"#FFE5E5", border:"2px solid #FF6B6B", borderRadius:"8px",
                    padding:"16px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={{ fontSize:"20px" }}></span>
                    <div>
                      <div style={{ fontWeight:"bold", color:"#FF3333" }}>Crédit épuisé</div>
                      <div style={{ fontSize:"13px", color:"#D32F2F", marginTop:"4px" }}>
                        Veuillez recharger votre compte pour continuer à utiliser le service
                      </div>
                    </div>
                  </div>
                )}
                {abonnement && abonnement.solde > 0 && abonnement.solde < 1000 && (
                  <div style={{ background:"#FFF4E5", border:"2px solid #D4A830", borderRadius:"8px",
                    padding:"16px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={{ fontSize:"20px" }}>⚡</span>
                    <div>
                      <div style={{ fontWeight:"bold", color:"#D4A830" }}>Crédit faible</div>
                      <div style={{ fontSize:"13px", color:"#B8860B", marginTop:"4px" }}>
                        Vous avez moins de 1 000 FCFA. Pensez à recharger bientôt.
                      </div>
                    </div>
                  </div>
                )}
                <div style={{ background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                  borderRadius:"12px", padding:"24px", color:"white", marginBottom:"24px" }}>
                  <div style={{ fontSize:"13px", opacity:0.9, marginBottom:"8px" }}>Solde disponible</div>
                  <div style={{ fontSize:"36px", fontWeight:"bold", marginBottom:"4px" }}>
                    {abonnement ? abonnement.solde?.toLocaleString("fr-FR") : "0"} FCFA
                  </div>
                  <div style={{ fontSize:"12px", opacity:0.8 }}>
                    {abonnement && abonnement.solde > 0 ? "✓ Compte actif" : "✗ Veuillez recharger"}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"12px", marginBottom:"24px" }}>
                  <button onClick={() => navigate("/formules")} style={{
                    flex:1, background:"#3CC47A", color:"white", border:"none",
                    borderRadius:"6px", padding:"12px 16px", cursor:"pointer", fontSize:"14px", fontWeight:"600" }}>
                    Ajouter du crédit
                  </button>
                  <button onClick={() => setActiveTab("historique")} style={{
                    flex:1, background:"#F0F0F0", color:"#333", border:"none",
                    borderRadius:"6px", padding:"12px 16px", cursor:"pointer", fontSize:"14px", fontWeight:"600" }}>
                    Voir l'historique
                  </button>
                </div>
                {quota && (
                  <div style={{ background:"var(--green-pale)", borderRadius:"12px",
                    padding:"16px 20px", border:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:"8px" }}>
                      <span style={{ fontWeight:700, fontSize:"14px", color:"var(--green-dark)" }}>
                        Forfait {quota.pack} — Quota de recherches
                      </span>
                      <span style={{ fontWeight:800, fontSize:"16px",
                        color: quota.illimite ? "var(--green-dark)" :
                               quota.restant===0 ? "#FF6B6B" :
                               quota.restant<=5  ? "#D4A830" : "var(--green-dark)" }}>
                        {quota.illimite ? "♾️ Illimité" : `${quota.restant} / ${quota.quota} restantes`}
                      </span>
                    </div>
                    {!quota.illimite && (
                      <div style={{ height:"8px", borderRadius:"100px",
                        background:"var(--border)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:"100px",
                          width:`${Math.min(100,(quota.utilise/quota.quota)*100)}%`,
                          background: quota.restant===0?"#FF6B6B":quota.restant<=5?"#D4A830":"#4DC97A",
                          transition:"width 0.4s" }}/>
                      </div>
                    )}
                    <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"6px" }}>
                      {quota.utilise} recherche{quota.utilise>1?"s":""} effectuée{quota.utilise>1?"s":""} ce mois
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══ HISTORIQUE COMPLET (2 sous-sections) ══ */}
            {activeTab === "historique" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Activité</div>
                    <h2 className="profil-section-title">Historique complet</h2>
                  </div>
                  <button className="btn-save" style={{ fontSize:"12px", padding:"8px 16px" }}
                    onClick={() => { chargerHistoRecherches(); chargerHistoDemandes(); }}>
                    Actualiser tout
                  </button>
                </div>

                {/* Sous-onglets */}
                <div style={{ display:"flex", gap:"0", marginBottom:"24px",
                  borderBottom:"2px solid var(--border)" }}>
                  {[
                    { key:"recherches", label:"Recherches d'entreprises", count: histoRecherches.length },
                    { key:"demandes",   label:"Demandes de documents",    count: histoDemandes.length },
                  ].map(s => (
                    <button key={s.key} onClick={() => setSectionHisto(s.key)} style={{
                      padding:"10px 20px", background:"transparent", border:"none",
                      borderBottom: sectionHisto===s.key
                        ? "3px solid var(--green-light)" : "3px solid transparent",
                      color: sectionHisto===s.key ? "var(--green-dark)" : "var(--text-muted)",
                      fontWeight: sectionHisto===s.key ? 700 : 500,
                      fontSize:"13px", cursor:"pointer", fontFamily:"inherit",
                      transition:"all 0.2s", marginBottom:"-2px", display:"flex",
                      alignItems:"center", gap:"8px",
                    }}>
                      {s.label}
                      <span style={{
                        background: sectionHisto===s.key ? "var(--green-pale)" : "rgba(0,0,0,0.06)",
                        color:      sectionHisto===s.key ? "var(--green-dark)" : "var(--text-muted)",
                        borderRadius:"100px", padding:"1px 8px",
                        fontSize:"11px", fontWeight:700,
                      }}>{s.count}</span>
                    </button>
                  ))}
                </div>

                {/* ─── Recherches entreprises ─── */}
                {sectionHisto === "recherches" && (
                  <div>
                    {histoRechercheLoading && (
                      <div style={{ textAlign:"center", padding:"40px",
                        color:"var(--text-muted)", fontSize:"14px" }}>
                         Chargement...
                      </div>
                    )}
                    {!histoRechercheLoading && histoRechercheErreur && (
                      <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                        borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                        <p style={{ margin:0, fontSize:"14px" }}>{histoRechercheErreur}</p>
                        <button className="btn-save" style={{ marginTop:"12px", fontSize:"12px" }}
                          onClick={chargerHistoRecherches}>Réessayer</button>
                      </div>
                    )}
                    {!histoRechercheLoading && !histoRechercheErreur && histoRecherches.length === 0 && (
                      <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}>
                        <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
                        <p style={{ fontSize:"14px", marginBottom:"16px" }}>
                          Aucune recherche d'entreprise enregistrée.
                        </p>
                        <button className="btn-save" onClick={() => navigate("/recherche")}>
                          Faire une recherche
                        </button>
                      </div>
                    )}
                    {!histoRechercheLoading && !histoRechercheErreur && histoRecherches.length > 0 && (
                      <div className="histo-list">
                        {histoRecherches.map((h, i) => (
                          <div key={h._id||i} className="histo-item">
                            <div style={{ flex:1 }}>
                              <div className="histo-critere">
                                {h.description || "Recherche d'entreprise"}
                              </div>
                              {h.criteres && (
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"6px" }}>
                                  {h.criteres.rccm && <Chip label={`RCCM: ${h.criteres.rccm}`} color="#1E60CC"/>}
                                  {h.criteres.ifu  && <Chip label={`IFU: ${h.criteres.ifu}`}   color="#1E60CC"/>}
                                  {h.criteres.raisonSociale && (
                                    <Chip label={`Raison sociale: ${h.criteres.raisonSociale}`} color="#1E60CC"/>
                                  )}
                                </div>
                              )}
                              <div className="histo-date">
                                {h.createdAt
                                  ? new Date(h.createdAt).toLocaleDateString("fr-FR",
                                      { day:"2-digit", month:"long", year:"numeric" }) +
                                    " à " +
                                    new Date(h.createdAt).toLocaleTimeString("fr-FR",
                                      { hour:"2-digit", minute:"2-digit" })
                                  : "—"}
                                &nbsp;·&nbsp;
                                <strong>{h.nbResultats??0} résultat{(h.nbResultats??0)>1?"s":""}</strong>
                              </div>
                              {replayMessage.id===h._id && replayMessage.texte && (
                                <div style={{ marginTop:"8px", padding:"8px 12px", borderRadius:"8px",
                                  fontSize:"12px",
                                  background: replayMessage.type==="succes" ? "#E8F5EE" : "#FFF0F0",
                                  color:      replayMessage.type==="succes" ? "#1A7A40" : "#CC3333",
                                  border:`1px solid ${replayMessage.type==="succes"?"#C0D8C8":"#FFB3B3"}` }}>
                                  {replayMessage.texte}
                                </div>
                              )}
                            </div>
                            <button className="btn-relancer"
                              onClick={() => relancerRecherche(h)}
                              disabled={replayLoadingId===h._id}
                              style={{ minWidth:"110px" }}>
                              {replayLoadingId===h._id ? "Vérification..." : "Relancer"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── Demandes de documents ─── */}
                {sectionHisto === "demandes" && (
                  <div>
                    {histoDemandeLoading && (
                      <div style={{ textAlign:"center", padding:"40px",
                        color:"var(--text-muted)", fontSize:"14px" }}>
                         Chargement...
                      </div>
                    )}
                    {!histoDemandeLoading && histoDemandeErreur && (
                      <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                        borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                        <p style={{ margin:0, fontSize:"14px" }}>{histoDemandeErreur}</p>
                        <button className="btn-save" style={{ marginTop:"12px", fontSize:"12px" }}
                          onClick={chargerHistoDemandes}>Réessayer</button>
                      </div>
                    )}
                    {!histoDemandeLoading && !histoDemandeErreur && histoDemandes.length === 0 && (
                      <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}>
                        <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
                        <p style={{ fontSize:"14px", marginBottom:"16px" }}>
                          Aucune demande de document enregistrée.
                        </p>
                        <button className="btn-save" onClick={() => navigate("/demande")}>
                          Faire une demande
                        </button>
                      </div>
                    )}
                    {!histoDemandeLoading && !histoDemandeErreur && histoDemandes.length > 0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                        {histoDemandes.map((d, i) => {
                          const sc  = STATUT_COLORS[d.statut] || STATUT_COLORS["en_attente"];
                          const typ = TYPES_REQUETES.find(t => t.id === d.typeRequete);
                          return (
                            <div key={d._id||i} style={{ background:"#fff",
                              borderRadius:"12px", border:"1px solid var(--border)", padding:"16px 20px" }}>
                              <div style={{ display:"flex", justifyContent:"space-between",
                                alignItems:"flex-start", marginBottom:"10px" }}>
                                <div>
                                  <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)" }}>
                                    {typ?.label || d.typeRequete}
                                  </div>
                                  <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"3px" }}>
                                    {d.createdAt
                                      ? new Date(d.createdAt).toLocaleDateString("fr-FR",
                                          { day:"2-digit", month:"long", year:"numeric" })
                                      : "—"}
                                    {" · "}Réf. <strong>{d._id?.slice(-6).toUpperCase()}</strong>
                                  </div>
                                </div>
                                <div style={{ display:"flex", flexDirection:"column",
                                  alignItems:"flex-end", gap:"4px" }}>
                                  <span style={{ background:sc.bg, color:sc.color,
                                    border:`1px solid ${sc.color}33`, borderRadius:"100px",
                                    padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                                    {sc.label}
                                  </span>
                                  {d.montantEstime && (
                                    <span style={{ fontSize:"12px", fontWeight:700, color:"var(--green-dark)" }}>
                                      {d.montantEstime.toLocaleString("fr-FR")} FCFA
                                    </span>
                                  )}
                                </div>
                              </div>
                              {(d.regions?.length>0 || d.activites?.length>0) && (
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"8px" }}>
                                  {d.regions?.map(r => <Chip key={r} label={r}/>)}
                                  {d.activites?.map(a => (
                                    <Chip key={a} label={ACTIVITES.find(x=>x.value===a)?.label||a}/>
                                  ))}
                                </div>
                              )}
                              {d.description && (
                                <p style={{ fontSize:"12px", color:"var(--text-muted)",
                                  lineHeight:1.5, margin:0, overflow:"hidden",
                                  display:"-webkit-box", WebkitLineClamp:2,
                                  WebkitBoxOrient:"vertical" }}>
                                  {d.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ══ SÉCURITÉ ══ */}
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
                    <div className="security-hint" style={{ color:"#3CC47A" }}>Email vérifié</div>
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

            {/* ══ NOTIFICATIONS ══ */}
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
                    { msg:"Votre abonnement PRO a été activé",  date:"01 Jan. 2025", read:true },
                    { msg:"Email de vérification envoyé",       date:"31 Déc. 2024", read:true },
                    { msg:"Bienvenue sur NERE CCI-BF !",        date:"31 Déc. 2024", read:true },
                  ].map((n, i) => (
                    <div key={i} className={`notif-item ${n.read?"read":"unread"}`}>
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
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{ display:"flex", gap:"20px" }}>
            <span>CGU</span><span>Contact</span><span>Support</span>
          </div>
        </footer>

      </div>
    </div>
  );
}