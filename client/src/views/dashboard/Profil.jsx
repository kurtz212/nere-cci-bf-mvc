import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.png";

const API = "/api";

const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",     path:"/chat",         key:"messages"     },
];

const ACTIVITES = [
  { value:"commerce_gros",            label:"Commerce de gros" },
  { value:"commerce_detail",          label:"Commerce de détail" },
  { value:"industrie_agroalimentaire",label:"Industrie agro-alimentaire" },
  { value:"industrie_textile",        label:"Industrie textile" },
  { value:"industrie_metallurgie",    label:"Industrie métallurgie / métal" },
  { value:"industrie_papier",         label:"Industrie papier / imprimerie" },
  { value:"artisanat",                label:"Artisanat" },
  { value:"agrobusiness_elevage",     label:"Agrobusiness — Élevage" },
  { value:"agrobusiness_agriculture", label:"Agrobusiness — Agriculture" },
  { value:"service_banque",           label:"Services — Banque & Finance" },
  { value:"service_etude",            label:"Services — Bureau d'études" },
  { value:"service_enseignement",     label:"Services — Enseignement" },
  { value:"service_sante",            label:"Services — Santé" },
  { value:"service_transport",        label:"Services — Transport & Logistique" },
];

const TYPES_REQUETES = [
  { id:"liste",       label:"Liste" },
  { id:"detail",      label:"Détails" },
  { id:"statistique", label:"Statistiques" },
  { id:"fiche",       label:"Fiche" },
  { id:"autre",       label:"Répertoire Thématique" },
];

const STATUT_COLORS = {
  en_attente:{ bg:"rgba(212,168,48,0.1)", color:"#D4A830", label:"En attente" },
  en_cours:  { bg:"rgba(34,160,82,0.1)",  color:"#22A052", label:"En cours"   },
  traite:    { bg:"rgba(26,122,64,0.12)", color:"#1A7A40", label:"Traité"      },
  rejete:    { bg:"rgba(232,85,85,0.1)",  color:"#E85555", label:"Rejeté"      },
};

const NAVBAR_CSS = `
  * { font-family: Arial, Helvetica, sans-serif !important; }

  /* ══ NAVBAR —  ══ */
  .nere-navbar-profil {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 120px;
    background: #00904C;
    box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  }
  /* Pilule liens — margin-left:auto la pousse à droite */
  .nere-navbar-profil .nav-pill {
    display: flex; align-items: center; gap: 3px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 100px; padding: 5px 8px;
    margin-left: auto; margin-right: 20px;
  }
  .nere-navbar-profil .nav-pill .nav-btn {
    padding: 7px 15px; border-radius: 100px;
    font-size: 20px; font-weight: 600;
    color: rgba(255,255,255,0.78); cursor: pointer;
    transition: all 0.18s; white-space: nowrap;
    border: none; background: transparent;
    font-family: Arial, Helvetica, sans-serif;
  }
  .nere-navbar-profil .nav-pill .nav-btn:hover {
    color: #fff; background: rgba(255,255,255,0.12);
  }
  .nere-navbar-profil .nav-pill .nav-btn.active {
    color: #0A3D1F; background: #4DC97A;
    font-weight: 700; box-shadow: 0 2px 8px rgba(77,201,122,0.4);
  }
  /* User chip */
  .nere-navbar-profil .u-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 12px 5px 5px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 100px; cursor: pointer;
    color: #fff; font-size: 13px; font-weight: 600;
    transition: all 0.2s; flex-shrink: 0;
  }
  .nere-navbar-profil .u-chip:hover { background: rgba(255,255,255,0.18); }
  .nere-navbar-profil .u-chip.active { background: #4DC97A; color: #0A3D1F; }
  .nere-navbar-profil .u-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: #4DC97A; color: #0A3D1F;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 12px; flex-shrink: 0;
  }
  .nere-navbar-profil .u-chip.active .u-avatar {
    background: #0A3D1F; color: #4DC97A;
  }
  /* Dropdown blanc */
  .nere-dropdown-profil {
    position: absolute; z-index: 9999;
    top: calc(100% + 10px); right: 0;
    background: #fff; border-radius: 16px;
    border: 1px solid #E2EDE6; min-width: 220px;
    overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.14);
    animation: dropInP 0.18s ease;
  }
  @keyframes dropInP {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .nere-dropdown-profil .dd-head {
    padding: 14px 18px 10px; border-bottom: 1px solid #F0F4F1;
    background: linear-gradient(135deg,#F5FAF7,#fff);
  }
  .nere-dropdown-profil .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
  .nere-dropdown-profil .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
  .nere-dropdown-profil .dd-role  {
    display:inline-flex; align-items:center; gap:5px; margin-top:6px;
    background:#E8F5EE; color:#00904C; border-radius:100px; padding:3px 10px;
    font-size:10px; font-weight:700; text-transform:uppercase;
  }
  .nere-dropdown-profil .dd-item {
    padding: 10px 18px; font-size:13px; color:#0A3D1F;
    cursor:pointer; transition:background 0.15s;
  }
  .nere-dropdown-profil .dd-item:hover { background:#F5FAF7; }
  .nere-dropdown-profil .dd-danger { color:#CC3333; }
  .nere-dropdown-profil .dd-danger:hover { background:#FFF0F0 !important; }
  .nere-dropdown-profil .dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }
`;

export default function Profil() {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [form, setForm]           = useState({});
  const [activeTab, setActiveTab] = useState("profil");
  const [abonnement, setAbonnement] = useState(null);
  const [quota, setQuota]           = useState(null);

  const [histoRecherches, setHistoRecherches]             = useState([]);
  const [histoRechercheLoading, setHistoRechercheLoading] = useState(false);
  const [histoRechercheErreur, setHistoRechercheErreur]   = useState("");
  const [replayLoadingId, setReplayLoadingId]             = useState(null);
  const [replayMessage, setReplayMessage]                 = useState({ id:null, texte:"", type:"" });

  const [histoDemandes, setHistoDemandes]             = useState([]);
  const [histoDemandeLoading, setHistoDemandeLoading] = useState(false);
  const [histoDemandeErreur, setHistoDemandeErreur]   = useState("");
  const [sectionHisto, setSectionHisto]               = useState("recherches");

  const [showMdpForm, setShowMdpForm]     = useState(false);
  const [mdpForm, setMdpForm]             = useState({ ancien:"", nouveau:"", confirm:"" });
  const [mdpLoading, setMdpLoading]       = useState(false);
  const [mdpMsg, setMdpMsg]               = useState({ texte:"", type:"" });
  const [deconnLoading, setDeconnLoading] = useState(false);
  const [showMdpVis, setShowMdpVis]       = useState({ ancien:false, nouveau:false, confirm:false });

  const [notifs, setNotifs]               = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  useEffect(() => {
    const u     = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!u) { navigate("/connexion"); return; }
    const parsed = JSON.parse(u);
    setUser(parsed);
    setForm({ nom:parsed.nom||"", prenom:parsed.prenom||"", email:parsed.email||"",
      telephone:parsed.telephone||"", fonction:parsed.fonction||"", siteWeb:parsed.siteWeb||"" });
    if (token) {
      fetch(`${API}/searchlogs/quota`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r=>r.json()).then(d=>{ if(d.success) setQuota(d.data); }).catch(()=>{});
      fetch(`${API}/abonnements/mon-solde`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r=>r.json()).then(d=>{ if(d.success&&d.data) setAbonnement(d.data); }).catch(()=>{});
      fetch(`${API}/users/profil`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r=>r.json()).then(d=>{
          if(d.success){ const u=d.data; setUser(u); localStorage.setItem("user",JSON.stringify(u));
            setForm({ nom:u.nom||"", prenom:u.prenom||"", email:u.email||"",
              telephone:u.telephone||"", fonction:u.fonction||"", siteWeb:u.siteWeb||"" }); }
        }).catch(()=>{});
    }
  }, [navigate]);

  const chargerNotifs = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setNotifsLoading(true);
    try {
      const res  = await fetch(`${API}/chat/diffusions`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setNotifs(data.data.map(m => ({
          id: m._id, msg: m.texte,
          date: new Date(m.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}),
          heure: new Date(m.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
          type:"diffusion", lu:m.lu||false,
        })));
      }
    } catch {
      const parsed = JSON.parse(localStorage.getItem("user")||"null");
      if (parsed) {
        const sys = [{ id:"1", msg:"Bienvenue sur NERE CCI-BF !", date:"", type:"system", lu:true }];
        if (parsed.emailVerified) sys.push({ id:"2", msg:"Email de vérification confirmé", date:"", type:"system", lu:true });
        setNotifs(sys);
      }
    }
    setNotifsLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab==="historique")    { chargerHistoRecherches(); chargerHistoDemandes(); }
    if (activeTab==="notifications") chargerNotifs();
  }, [activeTab]);

  const chargerHistoRecherches = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoRechercheLoading(true); setHistoRechercheErreur("");
    try {
      const res  = await fetch(`${API}/searchlogs/mon-historique?type=entreprise&limit=50`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setHistoRecherches(data.data||[]);
      else setHistoRechercheErreur(data.message||"Impossible de charger.");
    } catch { setHistoRechercheErreur("Serveur inaccessible."); }
    setHistoRechercheLoading(false);
  }, []);

  const chargerHistoDemandes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoDemandeLoading(true); setHistoDemandeErreur("");
    try {
      const res  = await fetch(`${API}/demandes/mes-demandes`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setHistoDemandes(data.data||[]);
      else setHistoDemandeErreur(data.message||"Impossible de charger.");
    } catch { setHistoDemandeErreur("Serveur inaccessible."); }
    setHistoDemandeLoading(false);
  }, []);

  const relancerRecherche = async (item) => {
    if (!item?._id) return;
    setReplayMessage({ id:null, texte:"", type:"" });
    setReplayLoadingId(item._id);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API}/searchlogs/${item._id}/replay`,
        { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) {
        setReplayMessage({ id:item._id,
          texte: data.updated ? "Modification détectée : nouvelle requête enregistrée." : "Aucune mise à jour : résultat depuis le cache.",
          type:"succes" });
        chargerHistoRecherches();
      } else setReplayMessage({ id:item._id, texte:data.message||"Relance impossible.", type:"erreur" });
    } catch { setReplayMessage({ id:item._id, texte:"Erreur serveur.", type:"erreur" }); }
    setReplayLoadingId(null);
    setTimeout(()=>setReplayMessage({ id:null, texte:"", type:"" }), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API}/users/profil`, { method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify(form) });
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
    setTimeout(()=>setSaved(false), 3000);
  };

  const changerMdp = async () => {
    if (!mdpForm.ancien||!mdpForm.nouveau||!mdpForm.confirm) {
      setMdpMsg({ texte:"Tous les champs sont obligatoires.", type:"erreur" }); return;
    }
    if (mdpForm.nouveau !== mdpForm.confirm) {
      setMdpMsg({ texte:"Les nouveaux mots de passe ne correspondent pas.", type:"erreur" }); return;
    }
    if (mdpForm.nouveau.length < 6) {
      setMdpMsg({ texte:"Minimum 6 caractères requis.", type:"erreur" }); return;
    }
    setMdpLoading(true); setMdpMsg({ texte:"", type:"" });
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API}/users/changer-mot-de-passe`, { method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ ancienMotDePasse:mdpForm.ancien, nouveauMotDePasse:mdpForm.nouveau }) });
      const data  = await res.json();
      if (data.success) {
        setMdpMsg({ texte:" Mot de passe modifié avec succès !", type:"succes" });
        setMdpForm({ ancien:"", nouveau:"", confirm:"" });
        setTimeout(()=>{ setShowMdpForm(false); setMdpMsg({ texte:"", type:"" }); }, 2500);
      } else setMdpMsg({ texte:data.message||"Erreur lors du changement.", type:"erreur" });
    } catch { setMdpMsg({ texte:"Serveur inaccessible.", type:"erreur" }); }
    setMdpLoading(false);
  };

  const deconnecterTout = async () => {
    if (!window.confirm("Déconnecter toutes les sessions actives ?")) return;
    setDeconnLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/auth/deconnecter-tout`, { method:"POST", headers:{ Authorization:`Bearer ${token}` } });
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/connexion");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;
  const initiales = `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase();

  const Chip = ({ label, color }) => (
    <span style={{ background:color?`${color}15`:"var(--green-pale)",
      color:color||"var(--green-dark)", border:`1px solid ${color?`${color}33`:"rgba(34,160,82,0.2)"}`,
      borderRadius:"100px", padding:"2px 10px", fontSize:"11px", fontWeight:600 }}>
      {label}
    </span>
  );

  const InputMdp = ({ name, label, placeholder }) => (
    <div className="profil-field">
      <label className="profil-label">{label}</label>
      <div style={{ position:"relative" }}>
        <input className="profil-input"
          type={showMdpVis[name] ? "text" : "password"}
          value={mdpForm[name]} placeholder={placeholder}
          onChange={e=>setMdpForm(m=>({...m,[name]:e.target.value}))}
          style={{ paddingRight:"44px" }}/>
        <button type="button"
          onClick={()=>setShowMdpVis(v=>({...v,[name]:!v[name]}))}
          style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)",
            background:"none", border:"none", cursor:"pointer",
            fontSize:"16px", color:"#6B9A7A", padding:"2px", lineHeight:1 }}>
          {showMdpVis[name] ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F5FAF7", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <style>{NAVBAR_CSS}</style>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR — même design que Home.jsx ══ */}
        <nav className="nere-navbar-profil">

          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <img src={logoNERE} alt="NERE"
              style={{ height:"80px", width:"auto", borderRadius:"6px",
                flexShrink:0, backgroundColor:"#fff", padding:"4px" }}/>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
              <span style={{ fontSize:"18px", fontWeight:800, color:"#fff",
                letterSpacing:"0.08em", textTransform:"uppercase" }}>Fichier NERE</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>
                Registre national des entreprises
              </span>
            </div>
          </div>

          {/* Pilule liens */}
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key} className="nav-btn"
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions droite — chip profil actif + déconnexion */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
            <div style={{ position:"relative" }}>
              <div className="u-chip active" onClick={() => setMenuOpen(o => !o)}>
                <div className="u-avatar">{initiales}</div>
                <span style={{ maxWidth:"100px", overflow:"hidden",
                  textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {user.prenom} {user.nom}
                </span>
                <span style={{ fontSize:"9px", opacity:0.7 }}>▾</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:50 }}
                    onClick={() => setMenuOpen(false)}/>
                  <div className="nere-dropdown-profil" onClick={e => e.stopPropagation()}>
                    <div className="dd-head">
                      <div className="dd-name">{user.prenom} {user.nom}</div>
                      <div className="dd-email">{user.email||"—"}</div>
                      <div className="dd-role">
                        {user.role==="admin"   ? " Admin" :
                         user.role==="manager" ? " Gestionnaire" : " Abonné"}
                      </div>
                    </div>
                    <div style={{ padding:"6px 0" }}>
                      {[
                        { label:" Mon Profil",     tab:"profil"        },
                        { label:" Historique",     tab:"historique"    },
                          { label:" Abonnement",     tab:"abonnement"    },
                        { label:" Sécurité",       tab:"securite"      },
                        { label:" Notifications",  tab:"notifications" },
                      ].map(item => (
                        <div key={item.tab} className="dd-item"
                          onClick={() => { setActiveTab(item.tab); setMenuOpen(false); }}>
                          {item.label}
                        </div>
                      ))}
                      {user.role==="admin" && (
                        <div className="dd-item"
                          onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                           Tableau de bord
                        </div>
                      )}
                      {user.role==="manager" && (
                        <div className="dd-item"
                          onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>
                           Tableau de bord
                        </div>
                      )}
                      <div className="dd-sep"/>
                      <div className="dd-item dd-danger" onClick={handleLogout}>
                         Déconnexion
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ══ LAYOUT PROFIL ══ */}
        <div className="profil-layout">

          {/* ── SIDEBAR ── */}
          <aside className="profil-sidebar">
            <div className="profil-avatar-zone">
              <div className="profil-avatar">{initiales}</div>
              <div className="profil-name">{user.prenom} {user.nom}</div>
              <div className="profil-email">{user.email}</div>
            </div>
            <nav className="profil-menu">
              {[
                { key:"profil",        label:" Mon Profil"     },
                { key:"historique",    label:" Historique"     },
                  { key:"abonnement",    label:" Abonnement"     },
                { key:"securite",      label:" Sécurité"       },
                { key:"notifications", label:" Notifications"  },
              ].map(item => (
                <div key={item.key}
                  className={`profil-menu-item ${activeTab===item.key?"active":""}`}
                  onClick={() => setActiveTab(item.key)}>
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="profil-menu-item danger" onClick={handleLogout}>
                <span> Déconnexion</span>
              </div>
            </nav>
          </aside>

          {/* ── CONTENU PRINCIPAL ── */}
          <main className="profil-main">

            {/* ══ PROFIL ══ */}
            {activeTab==="profil" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Informations personnelles</div>
                    <h2 className="profil-section-title">Mon Profil</h2>
                  </div>
                  {!editing
                    ? <button className="btn-edit" onClick={()=>setEditing(true)}> Modifier</button>
                    : <div style={{ display:"flex", gap:"10px" }}>
                        <button className="btn-cancel" onClick={()=>setEditing(false)}>Annuler</button>
                        <button className="btn-save" onClick={handleSave} disabled={saving}>
                          {saving ? <span className="spinner-sm"/> : "Enregistrer"}
                        </button>
                      </div>}
                </div>
                {saved && <div className="success-banner"> Profil mis à jour avec succès !</div>}
                <div className="profil-form-grid">
                  {[{name:"nom",label:"Nom"},{name:"prenom",label:"Prénom"}].map(f=>(
                    <div key={f.name} className="profil-field">
                      <label className="profil-label">{f.label}</label>
                      {editing
                        ? <input className="profil-input" name={f.name} value={form[f.name]}
                            onChange={e=>setForm(p=>({...p,[e.target.name]:e.target.value}))}/>
                        : <div className="profil-value">{user[f.name]||<span className="empty">—</span>}</div>}
                    </div>
                  ))}
                  <div className="profil-field full">
                    <label className="profil-label">Email</label>
                    {editing
                      ? <input className="profil-input" name="email" type="email"
                          value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
                      : <div className="profil-value">{user.email}<span className="verified-chip">✓ Vérifié</span></div>}
                  </div>
                  <div className="profil-field full">
                    <label className="profil-label">Organisation / Entreprise</label>
                    {editing
                      ? <input className="profil-input" name="fonction" value={form.fonction}
                          onChange={e=>setForm(p=>({...p,fonction:e.target.value}))}
                          placeholder="Nom de votre société"/>
                      : <div className="profil-value">{user.fonction||<span className="empty">Non renseigné</span>}</div>}
                  </div>
                  <div className="profil-field">
                    <label className="profil-label">Téléphone</label>
                    {editing
                      ? <input className="profil-input" name="telephone" value={form.telephone}
                          onChange={e=>setForm(p=>({...p,telephone:e.target.value}))}
                          placeholder="+226 07 XX XX XX"/>
                      : <div className="profil-value">{user.telephone||<span className="empty">Non renseigné</span>}</div>}
                  </div>
                  <div className="profil-field">
                    <label className="profil-label">Ville</label>
                    {editing
                      ? <select className="profil-input" name="siteWeb" value={form.siteWeb}
                          onChange={e=>setForm(p=>({...p,siteWeb:e.target.value}))}>
                          <option value="">Sélectionner...</option>
                          {["Ouagadougou","Bobo-Dioulasso","Koudougou","Ouahigouya","Banfora","Fada N'Gourma"]
                            .map(v=><option key={v}>{v}</option>)}
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
            {activeTab==="abonnement" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Crédit NERE</div>
                    <h2 className="profil-section-title">Mon Abonnement</h2>
                  </div>
                </div>

                {abonnement && abonnement.solde<=0 && (
                  <div style={{ background:"#FFE5E5", border:"2px solid #FF6B6B", borderRadius:"10px",
                    padding:"16px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={{ fontSize:"24px" }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight:700, color:"#FF3333" }}>Crédit épuisé</div>
                      <div style={{ fontSize:"13px", color:"#D32F2F", marginTop:"4px" }}>
                        Veuillez recharger pour continuer à utiliser le service
                      </div>
                    </div>
                  </div>
                )}
                {abonnement && abonnement.solde>0 && abonnement.solde<1000 && (
                  <div style={{ background:"#FFF4E5", border:"2px solid #D4A830", borderRadius:"10px",
                    padding:"16px", marginBottom:"20px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={{ fontSize:"24px" }}>⚡</span>
                    <div>
                      <div style={{ fontWeight:700, color:"#D4A830" }}>Crédit faible</div>
                      <div style={{ fontSize:"13px", color:"#B8860B", marginTop:"4px" }}>
                        Moins de 1 000 FCFA — Pensez à recharger
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ background:"linear-gradient(135deg,#00904C 0%,#006B38 100%)",
                  borderRadius:"16px", padding:"28px", color:"#fff", marginBottom:"24px",
                  boxShadow:"0 8px 24px rgba(0,144,76,0.25)" }}>
                  <div style={{ fontSize:"13px", opacity:0.8, marginBottom:"8px",
                    textTransform:"uppercase", letterSpacing:"0.06em" }}>Solde disponible</div>
                  <div style={{ fontSize:"42px", fontWeight:900, marginBottom:"6px" }}>
                    {abonnement ? abonnement.solde?.toLocaleString("fr-FR") : "0"}{" "}
                    <span style={{ fontSize:"20px", fontWeight:400 }}>FCFA</span>
                  </div>
                  <div style={{ fontSize:"13px", opacity:0.7 }}>
                    {abonnement && abonnement.solde>0 ? "✓ Compte actif" : "✗ Veuillez recharger"}
                  </div>
                </div>

                <div style={{ display:"flex", gap:"12px", marginBottom:"24px" }}>
                  <button onClick={()=>navigate("/formules")}
                    style={{ flex:1, background:"#00904C", color:"#fff", border:"none",
                      borderRadius:"10px", padding:"13px 16px", cursor:"pointer",
                      fontSize:"14px", fontWeight:700 }}>
                     Ajouter du crédit
                  </button>
                  <button onClick={()=>setActiveTab("historique")}
                    style={{ flex:1, background:"#F0F4F0", color:"#333", border:"none",
                      borderRadius:"10px", padding:"13px 16px", cursor:"pointer",
                      fontSize:"14px", fontWeight:600 }}>
                     Voir l'historique
                  </button>
                </div>

                {quota && (
                  <div style={{ background:"var(--green-pale)", borderRadius:"12px",
                    padding:"16px 20px", border:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"center", marginBottom:"10px" }}>
                      <span style={{ fontWeight:700, fontSize:"14px", color:"var(--green-dark)" }}>
                        Quota de recherches
                      </span>
                      <span style={{ fontWeight:800, fontSize:"16px",
                        color:quota.restant===0?"#FF6B6B":quota.restant<=5?"#D4A830":"var(--green-dark)" }}>
                        {quota.illimite ? "♾️ Illimité" : `${quota.restant} / ${quota.quota} restantes`}
                      </span>
                    </div>
                    {!quota.illimite && (
                      <div style={{ height:"8px", borderRadius:"100px",
                        background:"var(--border)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:"100px",
                          width:`${Math.min(100,(quota.utilise/quota.quota)*100)}%`,
                          background:quota.restant===0?"#FF6B6B":quota.restant<=5?"#D4A830":"#4DC97A",
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

            {/* ══ HISTORIQUE ══ */}
            {activeTab==="historique" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Activité</div>
                    <h2 className="profil-section-title">Historique complet</h2>
                  </div>
                  <button className="btn-save" style={{ fontSize:"12px", padding:"8px 16px" }}
                    onClick={()=>{ chargerHistoRecherches(); chargerHistoDemandes(); }}>
                     Actualiser
                  </button>
                </div>

                <div style={{ display:"flex", marginBottom:"24px", borderBottom:"2px solid var(--border)" }}>
                  {[
                    { key:"recherches", label:"Recherches", count:histoRecherches.length },
                    { key:"demandes",   label:"Demandes",   count:histoDemandes.length   },
                  ].map(s => (
                    <button key={s.key} onClick={()=>setSectionHisto(s.key)} style={{
                      padding:"10px 20px", background:"transparent", border:"none",
                      borderBottom:sectionHisto===s.key?"3px solid var(--green-light)":"3px solid transparent",
                      color:sectionHisto===s.key?"var(--green-dark)":"var(--text-muted)",
                      fontWeight:sectionHisto===s.key?700:500, fontSize:"13px",
                      cursor:"pointer", fontFamily:"inherit", marginBottom:"-2px",
                      display:"flex", alignItems:"center", gap:"8px" }}>
                      {s.label}
                      <span style={{ background:sectionHisto===s.key?"var(--green-pale)":"rgba(0,0,0,0.06)",
                        color:sectionHisto===s.key?"var(--green-dark)":"var(--text-muted)",
                        borderRadius:"100px", padding:"1px 8px", fontSize:"11px", fontWeight:700 }}>
                        {s.count}
                      </span>
                    </button>
                  ))}
                </div>

                {sectionHisto==="recherches" && (
                  <div>
                    {histoRechercheLoading && (
                      <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}> Chargement...</div>
                    )}
                    {!histoRechercheLoading && histoRechercheErreur && (
                      <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                        borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                        <p style={{ margin:0 }}>{histoRechercheErreur}</p>
                        <button className="btn-save" style={{ marginTop:"12px", fontSize:"12px" }}
                          onClick={chargerHistoRecherches}>Réessayer</button>
                      </div>
                    )}
                    {!histoRechercheLoading && !histoRechercheErreur && histoRecherches.length===0 && (
                      <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}>
                        <div style={{ fontSize:"40px", marginBottom:"12px" }}>🔍</div>
                        <p style={{ marginBottom:"16px" }}>Aucune recherche enregistrée.</p>
                        <button className="btn-save" onClick={()=>navigate("/rechercheacc")}>
                          Faire une recherche
                        </button>
                      </div>
                    )}
                    {!histoRechercheLoading && !histoRechercheErreur && histoRecherches.length>0 && (
                      <div className="histo-list">
                        {histoRecherches.map((h,i)=>(
                          <div key={h._id||i} className="histo-item">
                            <div style={{ flex:1 }}>
                              <div className="histo-critere">{h.description||"Recherche d'entreprise"}</div>
                              {h.criteres && (
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginTop:"6px" }}>
                                  {h.criteres.rccm && <Chip label={`RCCM: ${h.criteres.rccm}`} color="#1E60CC"/>}
                                  {h.criteres.ifu  && <Chip label={`IFU: ${h.criteres.ifu}`}  color="#1E60CC"/>}
                                  {h.criteres.raisonSociale && <Chip label={`Raison: ${h.criteres.raisonSociale}`} color="#1E60CC"/>}
                                </div>
                              )}
                              <div className="histo-date">
                                {h.createdAt
                                  ? new Date(h.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"})
                                    + " à " + new Date(h.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
                                  : "—"}
                                &nbsp;·&nbsp;
                                <strong>{h.nbResultats??0} résultat{(h.nbResultats??0)>1?"s":""}</strong>
                              </div>
                              {replayMessage.id===h._id && replayMessage.texte && (
                                <div style={{ marginTop:"8px", padding:"8px 12px", borderRadius:"8px",
                                  fontSize:"12px",
                                  background:replayMessage.type==="succes"?"#E8F5EE":"#FFF0F0",
                                  color:replayMessage.type==="succes"?"#1A7A40":"#CC3333" }}>
                                  {replayMessage.texte}
                                </div>
                              )}
                            </div>
                            <button className="btn-relancer" onClick={()=>relancerRecherche(h)}
                              disabled={replayLoadingId===h._id} style={{ minWidth:"110px" }}>
                              {replayLoadingId===h._id ? "Vérification..." : " Relancer"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {sectionHisto==="demandes" && (
                  <div>
                    {histoDemandeLoading && (
                      <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}>⏳ Chargement...</div>
                    )}
                    {!histoDemandeLoading && histoDemandeErreur && (
                      <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                        borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                        <p style={{ margin:0 }}>{histoDemandeErreur}</p>
                        <button className="btn-save" style={{ marginTop:"12px", fontSize:"12px" }}
                          onClick={chargerHistoDemandes}>Réessayer</button>
                      </div>
                    )}
                    {!histoDemandeLoading && !histoDemandeErreur && histoDemandes.length===0 && (
                      <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}>
                        <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                        <p style={{ marginBottom:"16px" }}>Aucune demande enregistrée.</p>
                        <button className="btn-save" onClick={()=>navigate("/demande-document")}>
                          Faire une demande
                        </button>
                      </div>
                    )}
                    {!histoDemandeLoading && !histoDemandeErreur && histoDemandes.length>0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                        {histoDemandes.map((d,i)=>{
                          const sc  = STATUT_COLORS[d.statut]||STATUT_COLORS["en_attente"];
                          const typ = TYPES_REQUETES.find(t=>t.id===d.typeRequete);
                          return (
                            <div key={d._id||i} style={{ background:"#fff", borderRadius:"12px",
                              border:"1px solid var(--border)", padding:"16px 20px" }}>
                              <div style={{ display:"flex", justifyContent:"space-between",
                                alignItems:"flex-start", marginBottom:"10px" }}>
                                <div>
                                  <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)" }}>
                                    {typ?.label||d.typeRequete}
                                  </div>
                                  <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"3px" }}>
                                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString("fr-FR",
                                      {day:"2-digit",month:"long",year:"numeric"}) : "—"}
                                    {" · "}Réf. <strong>{d._id?.slice(-6).toUpperCase()}</strong>
                                  </div>
                                </div>
                                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
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
                              {(d.regions?.length>0||d.activites?.length>0) && (
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                  {d.regions?.map(r=><Chip key={r} label={r}/>)}
                                  {d.activites?.map(a=>(
                                    <Chip key={a} label={ACTIVITES.find(x=>x.value===a)?.label||a}/>
                                  ))}
                                </div>
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
            {activeTab==="securite" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Compte</div>
                    <h2 className="profil-section-title">Sécurité</h2>
                  </div>
                </div>

                <div className="security-item">
                  <div>
                    <div className="security-label"> Mot de passe</div>
                    <div className="security-hint">
                      {showMdpForm ? "Remplissez le formulaire ci-dessous"
                        : "Cliquez sur Modifier pour changer votre mot de passe"}
                    </div>
                  </div>
                  <button className="btn-edit"
                    onClick={()=>{ setShowMdpForm(o=>!o); setMdpMsg({ texte:"", type:"" });
                      setShowMdpVis({ ancien:false, nouveau:false, confirm:false }); }}>
                    {showMdpForm ? "✕ Fermer" : " Modifier"}
                  </button>
                </div>

                {showMdpForm && (
                  <div style={{ background:"var(--off-white)", border:"1px solid var(--border)",
                    borderRadius:"12px", padding:"20px", marginBottom:"16px" }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                      <InputMdp name="ancien"  label="Mot de passe actuel *" placeholder="••••••••"/>
                      <InputMdp name="nouveau" label="Nouveau mot de passe *" placeholder="Min. 6 caractères"/>
                      <InputMdp name="confirm" label="Confirmer le nouveau *" placeholder="••••••••"/>
                    </div>
                    {mdpMsg.texte && (
                      <div style={{ marginTop:"12px", padding:"10px 14px", borderRadius:"8px", fontSize:"13px",
                        background:mdpMsg.type==="succes"?"#E8F5EE":"#FFF0F0",
                        color:mdpMsg.type==="succes"?"#1A7A40":"#CC3333" }}>
                        {mdpMsg.texte}
                      </div>
                    )}
                    <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
                      <button className="btn-save" onClick={changerMdp} disabled={mdpLoading}>
                        {mdpLoading ? <span className="spinner-sm"/> : " Enregistrer"}
                      </button>
                      <button className="btn-cancel"
                        onClick={()=>{ setShowMdpForm(false); setMdpMsg({ texte:"", type:"" });
                          setMdpForm({ ancien:"", nouveau:"", confirm:"" });
                          setShowMdpVis({ ancien:false, nouveau:false, confirm:false }); }}>
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                <div className="security-item">
                  <div>
                    <div className="security-label"> Email de vérification</div>
                    <div className="security-hint" style={{ color:"#3CC47A" }}>
                       {user.email} — Email vérifié
                    </div>
                  </div>
                </div>

                <div className="security-item">
                  <div>
                    <div className="security-label"> Sessions actives</div>
                    <div className="security-hint">1 session active — Ce navigateur</div>
                  </div>
                  <button onClick={deconnecterTout} disabled={deconnLoading}
                    style={{ padding:"9px 18px", borderRadius:"8px", background:"#FFF0F0",
                      border:"1.5px solid #FFB3B3", color:"#CC3333",
                      fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
                    {deconnLoading ? "..." : "🔌 Déconnecter tout"}
                  </button>
                </div>

                <div style={{ marginTop:"24px", background:"#FFF5F5",
                  border:"1px solid rgba(232,85,85,0.2)", borderRadius:"12px", padding:"18px 20px" }}>
                  <div style={{ fontWeight:700, fontSize:"14px", color:"#CC3333", marginBottom:"6px" }}>
                     Zone dangereuse
                  </div>
                  <div style={{ fontSize:"13px", color:"#6B9A7A", marginBottom:"14px" }}>
                    La déconnexion de toutes les sessions fermera votre compte sur tous les appareils.
                  </div>
                  <button onClick={deconnecterTout} disabled={deconnLoading}
                    style={{ padding:"10px 20px", borderRadius:"8px", background:"#CC3333",
                      color:"#fff", border:"none", fontWeight:700, fontSize:"13px",
                      cursor:"pointer", fontFamily:"inherit" }}>
                    {deconnLoading ? "Déconnexion en cours..." : "🔌 Déconnecter tous les appareils"}
                  </button>
                </div>
              </div>
            )}

            {/* ══ NOTIFICATIONS ══ */}
            {activeTab==="notifications" && (
              <div className="profil-section">
                <div className="profil-section-header">
                  <div>
                    <div className="section-tag-small">Alertes & Messages</div>
                    <h2 className="profil-section-title">Notifications</h2>
                  </div>
                  <button className="btn-save" style={{ fontSize:"12px", padding:"8px 16px" }}
                    onClick={chargerNotifs}>
                     Actualiser
                  </button>
                </div>

                {notifsLoading ? (
                  <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}>
                     Chargement...
                  </div>
                ) : (
                  <div className="notif-list">
                    <div className="notif-item unread" style={{ borderLeft:"3px solid #00904C" }}>
                      <div className="notif-icon"></div>
                      <div style={{ flex:1 }}>
                        <div className="notif-msg">Bienvenue sur NERE CCI-BF !</div>
                        <div className="notif-date">Votre compte est actif et opérationnel.</div>
                      </div>
                    </div>

                    {user.emailVerified && (
                      <div className="notif-item read">
                        <div className="notif-icon"></div>
                        <div style={{ flex:1 }}>
                          <div className="notif-msg">Email vérifié</div>
                          <div className="notif-date">{user.email} — Adresse confirmée</div>
                        </div>
                      </div>
                    )}

                    {abonnement && (
                      <div className="notif-item read">
                        <div className="notif-icon"></div>
                        <div style={{ flex:1 }}>
                          <div className="notif-msg">Solde disponible</div>
                          <div className="notif-date">
                            <strong style={{ color: abonnement.solde<=0?"#FF3333":abonnement.solde<1000?"#D4A830":"#00904C" }}>
                              {abonnement.solde?.toLocaleString("fr-FR")} FCFA
                            </strong>
                            {abonnement.solde<=0 ? " — Crédit épuisé, rechargez." :
                             abonnement.solde<1000 ? " — Crédit faible, pensez à recharger." :
                             " — Compte actif."}
                          </div>
                        </div>
                        <button onClick={()=>navigate("/formules")}
                          style={{ padding:"6px 12px", borderRadius:"8px", background:"#E6F4EC",
                            border:"none", color:"#00904C", fontWeight:700,
                            fontSize:"12px", cursor:"pointer", flexShrink:0 }}>
                          Recharger
                        </button>
                      </div>
                    )}

                    {notifs.filter(n=>n.type==="diffusion").map(n=>(
                      <div key={n.id} className={`notif-item ${n.lu?"read":"unread"}`}
                        style={{ borderLeft:!n.lu?"3px solid #00904C":"none" }}>
                        <div className="notif-icon"></div>
                        <div style={{ flex:1 }}>
                          <div className="notif-msg" style={{ fontWeight:!n.lu?700:500 }}>{n.msg}</div>
                          <div className="notif-date">{n.date}{n.heure && ` à ${n.heure}`}</div>
                        </div>
                        {!n.lu && (
                          <span style={{ background:"#FF6B6B", color:"#fff", borderRadius:"100px",
                            padding:"2px 8px", fontSize:"10px", fontWeight:800, flexShrink:0 }}>
                            Nouveau
                          </span>
                        )}
                      </div>
                    ))}

                    {notifs.filter(n=>n.type==="diffusion").length===0 && (
                      <div style={{ textAlign:"center", padding:"24px", color:"var(--text-muted)", fontSize:"13px" }}>
                        <div style={{ fontSize:"32px", marginBottom:"8px" }}></div>
                        Aucune annonce de la CCI-BF pour le moment
                      </div>
                    )}

                    <div style={{ marginTop:"16px", padding:"16px", background:"var(--green-pale)",
                      borderRadius:"12px", border:"1px solid var(--border)",
                      display:"flex", alignItems:"center", gap:"12px" }}>
                      <div style={{ fontSize:"24px" }}></div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)" }}>
                          Messages directs
                        </div>
                        <div style={{ fontSize:"12px", color:"var(--text-muted)" }}>
                          Consultez vos échanges avec la CCI-BF
                        </div>
                      </div>
                      <button onClick={()=>navigate("/chat")}
                        style={{ padding:"8px 16px", borderRadius:"8px", background:"#00904C",
                          border:"none", color:"#fff", fontWeight:700, fontSize:"13px", cursor:"pointer" }}>
                        Ouvrir →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>

        <footer className="dash-footer">
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{ display:"flex", gap:"20px" }}>
            <span style={{ cursor:"pointer" }} onClick={()=>navigate("/contact")}>Contact</span>
            <span>Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
}