import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const API = "http://localhost:5000/api";

// ═══════════════════════════════════════
// DONNÉES MOCK
// ═══════════════════════════════════════


const CATS_PUB = ["Rapport","Étude","Classement","Note technique","Communiqué"];

const MOCK_PUBS = [
  { id:1, titre:"Enquête sur le commerce de détail au Burkina Faso", cat:"Rapport",   date:"28 Fév 2025", statut:"publié",   vues:312 },
  { id:2, titre:"Indice PME – T4 2024 : Reprise prudente",           cat:"Étude",     date:"15 Fév 2025", statut:"publié",   vues:218 },
  { id:3, titre:"Top 100 entreprises BTP – Burkina Faso 2024",       cat:"Classement",date:"10 Fév 2025", statut:"publié",   vues:476 },
  { id:4, titre:"Note sur la fiscalité des PME 2025",                cat:"Note technique",date:"–",       statut:"brouillon",vues:0   },
];

// ═══════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════

const getToken = () => localStorage.getItem("token");

// ── Écran de login admin ──
function AdminLogin({ onSuccess }) {
  const [form, setForm]     = useState({ email:"", password:"" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/connexion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.user?.role === "admin") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onSuccess(data.user);
      } else if (data.success && data.user?.role !== "admin") {
        setError("Accès refusé. Compte administrateur requis.");
      } else {
        setError(data.message || "Identifiants incorrects.");
      }
    } catch(e) {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#00904C", display:"flex",
      alignItems:"center", justifyContent:"center",
      fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ background:"#00904C", borderRadius:"20px",
        border:"1px solid #00904C", padding:"48px 40px",
        width:"100%", maxWidth:"400px" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px",
            fontWeight:900, color:"#fff", margin:0 }}>
            Administration NERE
          </h2>
          <p style={{ color:"#ffffff", fontSize:"13px",
            marginTop:"8px" }}>
            Accès réservé aux administrateurs
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:"14px" }}>
            <label style={{ display:"block", fontSize:"11px", fontWeight:700,
              color:"rgba(255,255,255,0.4)", textTransform:"uppercase",
              letterSpacing:"0.08em", marginBottom:"7px" }}>Email</label>
            <input type="email" value={form.email} required
              onChange={e=>setForm(f=>({...f,email:e.target.value}))}
              placeholder="admin@nere.bf"
              style={{ width:"100%", padding:"12px 14px", borderRadius:"10px",
                border:"1.5px solid rgba(255,255,255,0.12)",
                background:"rgba(255,255,255,0.07)", color:"#fff",
                fontSize:"14px", fontFamily:"inherit", outline:"none",
                boxSizing:"border-box" }}/>
          </div>
          <div style={{ marginBottom:"20px" }}>
            <label style={{ display:"block", fontSize:"11px", fontWeight:700,
              color:"rgba(255,255,255,0.4)", textTransform:"uppercase",
              letterSpacing:"0.08em", marginBottom:"7px" }}>Mot de passe</label>
            <input type="password" value={form.password} required
              onChange={e=>setForm(f=>({...f,password:e.target.value}))}
              placeholder="••••••••"
              style={{ width:"100%", padding:"12px 14px", borderRadius:"10px",
                border:"1.5px solid rgba(255,255,255,0.12)",
                background:"rgba(255,255,255,0.07)", color:"#fff",
                fontSize:"14px", fontFamily:"inherit", outline:"none",
                boxSizing:"border-box" }}/>
          </div>

          {error && (
            <div style={{ background:"rgba(232,85,85,0.1)", border:"1px solid rgba(232,85,85,0.3)",
              borderRadius:"8px", padding:"10px 14px", color:"#FF8080",
              fontSize:"13px", marginBottom:"16px" }}>
               {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width:"100%", padding:"13px", borderRadius:"12px",
              background:"#ffffff",
              border:"none", color:"#00904C", fontWeight:800,
              fontSize:"15px", cursor:"pointer", fontFamily:"inherit" }}>
            {loading ? "Connexion..." : "Accéder au panneau admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  // Toujours demander l'authentification à l'ouverture
  const [adminUser, setAdminUser] = useState(null);

  // Charger les pubs quand admin connecté et section publications
  const chargerPubs = async () => {
    try {
      const res  = await fetch(`${API}/publications?all=true&limit=100`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        const formatted = data.data.map(p => ({
          id:     p._id,
          titre:  p.titre,
          cat:    p.categorie || "Rapport",
          date:   new Date(p.createdAt).toLocaleDateString("fr-FR", {day:"2-digit",month:"short",year:"numeric"}),
          statut: p.statut,
          vues:   p.vues || 0,
        }));
        setPubs(formatted);
      }
    } catch(e) {
      console.warn(" Impossible de charger les publications:", e.message);
      setPubs(MOCK_PUBS);
    }
    setPubsChargees(true);
  };
  const [section, setSection]       = useState("dashboard");
  const [sidebarOpen, setSidebar]   = useState(true);

  // Publications
  const [pubs, setPubs]             = useState([]);
  const [pubsChargees, setPubsChargees] = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [editPub, setEditPub]       = useState(null);
  const [formPub, setFormPub]       = useState({ titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });
  const [pubLoading, setPubLoading] = useState(false);
  const [pubError, setPubError]     = useState("");

  // Utilisateurs
  const [users, setUsers]               = useState([]);
  const [usersCharges, setUsersCharges] = useState(false);
  const [searchUser, setSearchUser]     = useState("");

  // Activités
  const [activites, setActivites]         = useState([]);
  const [activitesChargees, setActivitesChargees] = useState(false);
  const [activitesLoading, setActivitesLoading]   = useState(false);
  const [activitesError, setActivitesError]       = useState("");

  // Partenaires
  const [partenaires, setPartenaires]       = useState([]);
  const [partCharges, setPartCharges]       = useState(false);
  const [showFormPart, setShowFormPart]     = useState(false);
  const [editPart, setEditPart]             = useState(null);
  const [formPart, setFormPart]             = useState({ nom:"", type:"", contribution:"", badge:"", actif:true });
  const [partError, setPartError]           = useState("");
  const [partLoading, setPartLoading]       = useState(false);

  // Gestion des gestionnaires
  const [showUserForm, setShowUserForm]     = useState(false);
  const [formUser, setFormUser]             = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    fonction: "Gestionnaire",
    typeCompte: "administration",
    role: "manager",
    password: "",
    isActive: true,
  });
  const [userError, setUserError]           = useState("");
  const [userLoading, setUserLoading]       = useState(false);

  // ── Charger les utilisateurs ──
  const chargerUsers = async () => {
    try {
      const res  = await fetch(`${API}/users`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        const formatted = data.data.map(u => ({
          id:     u._id,
          nom:    u.nom,
          prenom: u.prenom,
          email:  u.email || "—",
          type:   u.typeCompte || "autre",
          role:   u.role,
          pack:   u.pack || "—",
          statut: u.isActive ? "actif" : "suspendu",
          date:   new Date(u.createdAt).toLocaleDateString("fr-FR", {day:"2-digit",month:"short",year:"numeric"}),
        }));
        setUsers(formatted);
      }
    } catch(e) {
      console.warn("Impossible de charger les utilisateurs:", e.message);
      setUsers(MOCK_USERS);
    }
    setUsersCharges(true);
  };

 

  const sauvegarderPartenaire = async () => {
    if (!formPart.nom.trim()) { setPartError("Le nom est obligatoire."); return; }
    setPartLoading(true); setPartError("");
    try {
      const url    = editPart ? `${API}/partenaires/${editPart._id}` : `${API}/partenaires`;
      const method = editPart ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${getToken()}` },
        body: JSON.stringify(formPart),
      });
      const data = await res.json();
      if (data.success) {
        await chargerPartenaires();
        setShowFormPart(false);
        setEditPart(null);
        setFormPart({ nom:"", type:"", contribution:"", badge:"",  actif:true });
      } else {
        setPartError(data.message || "Erreur.");
      }
    } catch(e) { setPartError("Serveur indisponible."); }
    setPartLoading(false);
  };

  const supprimerPartenaire = async (id) => {
    if (!window.confirm("Supprimer ce partenaire ?")) return;
    try {
      await fetch(`${API}/partenaires/${id}`, {
        method:"DELETE",
        headers: { "Authorization":`Bearer ${getToken()}` }
      });
      setPartenaires(ps => ps.filter(p => p._id !== id));
    } catch(e) {}
  };

  const sauvegarderUtilisateur = async () => {
    if (!formUser.nom.trim() || !formUser.prenom.trim() || !formUser.email.trim() || !formUser.password.trim()) {
      setUserError("Nom, prénom, email et mot de passe sont obligatoires.");
      return;
    }
    setUserLoading(true);
    setUserError("");
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(formUser),
      });
      const data = await res.json();
      if (!data.success) {
        setUserError(data.message || "Impossible de créer le gestionnaire.");
      } else {
        await chargerUsers();
        setShowUserForm(false);
        setFormUser({
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          fonction: "Gestionnaire",
          typeCompte: "administration",
          role: "manager",
          password: "",
          isActive: true,
        });
      }
    } catch(e) {
      setUserError("Serveur indisponible.");
    }
    setUserLoading(false);
  };

  const mettreAJourRoleUtilisateur = async (id, role) => {
    try {
      const res = await fetch(`${API}/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(us => us.map(u => u.id === id ? ({ ...u, role: data.data.role }) : u));
      }
    } catch(e) {}
  };

  const activerDesactiverUtilisateur = async (id, isActive) => {
    try {
      const res = await fetch(`${API}/users/${id}/activate`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(us => us.map(u => u.id === id ? ({ ...u, statut: data.data.isActive ? 'actif' : 'suspendu' }) : u));
      }
    } catch(e) {}
  };

  const supprimerUtilisateur = async (id) => {
    if (!window.confirm("Supprimer ce gestionnaire ?")) return;
    try {
      await fetch(`${API}/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      setUsers(us => us.filter(u => u.id !== id));
    } catch(e) {}
  };

  const toggleActifPartenaire = async (p) => {
    try {
      const res  = await fetch(`${API}/partenaires/${p._id}`, {
        method:"PUT",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${getToken()}` },
        body: JSON.stringify({ actif: !p.actif }),
      });
      const data = await res.json();
      if (data.success) setPartenaires(ps => ps.map(x => x._id===p._id ? data.data : x));
    } catch(e) {}
  };

  // ── Handlers publications ──
  const ouvrirForm = (pub = null) => {
    setEditPub(pub);
    setFormPub(pub
      ? { titre:pub.titre, cat:pub.cat, contenu:"", statut:pub.statut }
      : { titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });
    setShowForm(true);
  };

  const sauvegarderPub = async () => {
    if (!formPub.titre.trim()) { setPubError("Le titre est obligatoire."); return; }
    setPubLoading(true); setPubError("");
    try {
      const url    = editPub
        ? `${API}/publications/${editPub.id}`
        : `${API}/publications`;
      const method = editPub ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          titre:     formPub.titre,
          categorie: formPub.cat,
          contenu:   formPub.contenu,
          statut:    formPub.statut,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (editPub) {
          setPubs(ps => ps.map(p => p.id===editPub.id
            ? {...p, titre:data.data.titre, cat:data.data.categorie, statut:data.data.statut}
            : p));
        } else {
          setPubs(ps => [...ps, {
            id:     data.data._id,
            titre:  data.data.titre,
            cat:    data.data.categorie,
            date:   new Date(data.data.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
            statut: data.data.statut,
            vues:   0,
          }]);
        }
        setShowForm(false);
      } else {
        setPubError(data.message || "Erreur lors de la sauvegarde.");
      }
    } catch(e) {
      // Fallback local si API indisponible
      if (editPub) {
        setPubs(ps => ps.map(p => p.id===editPub.id
          ? {...p, titre:formPub.titre, cat:formPub.cat, statut:formPub.statut}
          : p));
      } else {
        setPubs(ps => [...ps, {
          id: Date.now(), titre:formPub.titre, cat:formPub.cat,
          date: new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
          statut:formPub.statut, vues:0,
        }]);
      }
      setShowForm(false);
    } finally {
      setPubLoading(false);
    }
  };

  const supprimerPub = async (id) => {
    if (!window.confirm("Supprimer cette publication ?")) return;
    try {
      await fetch(`${API}/publications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` },
      });
    } catch(e) {}
    setPubs(ps => ps.filter(p => p.id !== id));
  };

  const publierPub = async (id) => {
    try {
      await fetch(`${API}/publications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ statut: "publie" }),
      });
    } catch(e) {}
    setPubs(ps => ps.map(p => p.id===id ? {...p, statut:"publié"} : p));
  };

  // ── Filtres ──
  const usersFiltres = users.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const kpis = [
    {  label:"Utilisateurs",   val: usersCharges ? users.length : "...",                                          couleur:"#4DC97A" },
    {  label:"Abonnés actifs", val: usersCharges ? users.filter(u=>u.role==="subscriber").length : "...",          couleur:"#D4A830" },
    {  label:"Publications",   val: pubsChargees ? pubs.length : "...",                                            couleur:"#4A9EFF" },
  ];

  const formatActivityDescription = (log) => {
    const prefix = log.user ? `${log.user} · ` : "";
    const criteres = log.criteres || {};
    const parts = [];
    if (criteres.denomination) parts.push(`Nom: ${criteres.denomination}`);
    if (criteres.rccm) parts.push(`RCCM: ${criteres.rccm}`);
    if (criteres.secteur) parts.push(criteres.secteur);
    if (criteres.region) parts.push(criteres.region);
    if (criteres.ville) parts.push(criteres.ville);
    if (parts.length > 0) {
      return `${prefix}Recherche ${parts.join(' • ')} — ${log.resultatCount} résultat${log.resultatCount > 1 ? 's' : ''}`;
    }
    return `${prefix}Recherche • ${log.resultatCount} résultat${log.resultatCount > 1 ? 's' : ''}`;
  };

  const formatActivityTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const chargerActivites = async () => {
    setActivitesLoading(true);
    setActivitesError("");
    try {
      const res = await fetch(`${API}/searchlogs/recent?limit=8`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) {
        setActivites(data.data.map(log => ({
          id: log.id,
          texte: log.description || formatActivityDescription(log),
          date: log.createdAt,
          heure: formatActivityTime(log.createdAt),
        })));
      } else {
        setActivitesError(data.message || "Impossible de charger les activités.");
      }
    } catch (e) {
      setActivitesError("Impossible de contacter le serveur.");
    }
    setActivitesLoading(false);
    setActivitesChargees(true);
  };

  useEffect(() => {
    if (adminUser) {
      chargerActivites();
    }
  }, [adminUser]);

  useEffect(() => {
    if (adminUser && section === 'activites' && !activitesChargees && !activitesLoading) {
      chargerActivites();
    }
  }, [adminUser, section, activitesChargees, activitesLoading]);

  // ═══════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════
  const S = {
    wrap:   { display:"flex", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F5FAF7" },
    side:   { width: sidebarOpen ? "240px" : "64px", background:"#FFFFFF", flexShrink:0,
              display:"flex", flexDirection:"column", transition:"width 0.25s ease",
              overflow:"hidden", position:"sticky", top:0, height:"100vh" },
    main:   { flex:1, display:"flex", flexDirection:"column", overflow:"auto" },
    topbar: { background:"#fff", borderBottom:"1px solid #E2EDE6", padding:"0 28px",
              height:"60px", display:"flex", alignItems:"center",
              justifyContent:"space-between", flexShrink:0 },
    content:{ padding:"28px", flex:1 },
    card:   { background:"#fff", borderRadius:"14px", border:"1px solid #E2EDE6", padding:"22px" },
    badge:  (c) => ({ background:`${c}18`, color:c, borderRadius:"100px",
              padding:"3px 10px", fontSize:"11px", fontWeight:700 }),
    btn:    { padding:"9px 18px", borderRadius:"10px", background:"#00904C", color:"#fff",
              border:"none", fontWeight:700, fontSize:"13px", cursor:"pointer",
              fontFamily:"inherit", transition:"opacity 0.15s" },
    btnGhost:{ padding:"9px 18px", borderRadius:"10px", background:"transparent",
               color:"#0A3D1F", border:"1.5px solid #0A3D1F",
               fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" },
    input:  { width:"100%", padding:"10px 14px", borderRadius:"10px",
              border:"1.5px solid #E2EDE6", fontSize:"13px", fontFamily:"inherit",
              outline:"none", boxSizing:"border-box", color:"#1A2E1F" },
    textarea:{ width:"100%", padding:"10px 14px", borderRadius:"10px",
               border:"1.5px solid #E2EDE6", fontSize:"13px", fontFamily:"inherit",
               outline:"none", boxSizing:"border-box", color:"#1A2E1F",
               resize:"vertical", minHeight:"160px" },
  };

  const NAV_ITEMS = [
    { id:"dashboard",     label:"Dashboard"      },
    { id:"publications",  label:"Publications"   },
    { id:"utilisateurs",  label:"Utilisateurs"   },
    { id:"activites",    label:"Activités"      },
  ];

  const statutBadge = (s) => {
    const map = {
      "publié":     "#4DC97A", "brouillon":"#D4A830",
      "actif":      "#4DC97A", "suspendu":  "#FF6B6B", "en attente":"#D4A830",
      "nouveau":    "#FF6B6B", "en_cours":  "#4A9EFF", "résolu":    "#4DC97A",
      "subscriber": "#4DC97A", "visitor":   "#D4A830",
    };
    return map[s] || "#999";
  };

  // ═══════════════════════════════════════
  // RENDER SECTIONS
  // ═══════════════════════════════════════
  const renderDashboard = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"16px", marginBottom:"24px" }}>
        <div>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
          color:"#00904C", margin:0 }}>Vue d'ensemble</h2>
          <p style={{ color:"#00904C", fontSize:"13px", marginTop:"4px" }}>
          Aujourd'hui — {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
        </p>
        </div>
        <button style={{ ...S.btn, whiteSpace:"nowrap" }}
          onClick={() => { setSection('utilisateurs'); setShowUserForm(true); }}>
          + Créer un gestionnaire
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...S.card, display:"flex", alignItems:"center", gap:"14px" }}>
            <div style={{ width:"48px", height:"48px", borderRadius:"12px",
              background:`${k.couleur}18`, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
              {k.icone}
            </div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px",
                fontWeight:900, color:"#00904C" }}>{k.val}</div>
              <div style={{ fontSize:"12px", color:"#6B9A7A", fontWeight:600 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"16px" }}>
        {/* Activités récentes */}
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F",
            marginBottom:"16px" }}> Activités récentes</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
            {activitesLoading ? (
              <div style={{ padding:"18px 0", color:"#6B9A7A", fontSize:"13px" }}>
                Chargement des activités...
              </div>
            ) : activitesError ? (
              <div style={{ padding:"18px 0", color:"#CC3333", fontSize:"13px" }}>
                {activitesError}
              </div>
            ) : activites.length === 0 ? (
              <div style={{ padding:"18px 0", color:"#6B9A7A", fontSize:"13px" }}>
                Aucune activité récente enregistrée.
              </div>
            ) : activites.map((a,i) => (
              <div key={a.id} style={{ display:"flex", gap:"12px", padding:"12px 0",
                borderBottom: i < activites.length-1 ? "1px solid #E2EDE6" : "none" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"10px",
                  background:"#F0F8F3", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
                  
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", color:"#1A2E1F", lineHeight:1.5 }}>{a.texte}</div>
                  <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"2px" }}>{a.heure}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPublications = () => {
    // Charger les pubs si pas encore fait
    if (!pubsChargees) chargerPubs();
    return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
            color:"#0A3D1F", margin:0 }}>Publications</h2>
          <p style={{ color:"#6B9A7A", fontSize:"13px", marginTop:"4px" }}>
            {pubs.length} publication{pubs.length>1?"s":""} · {pubs.filter(p=>p.statut==="publié").length} publiée{pubs.filter(p=>p.statut==="publié").length>1?"s":""}
          </p>
        </div>
        <button style={S.btn} onClick={() => ouvrirForm()}>
          + Nouvelle publication
        </button>
      </div>

      {/* Formulaire création/édition */}
      {showForm && (
        <div style={{ ...S.card, marginBottom:"20px",
          border:"2px solid #4DC97A" }}>
          <div style={{ fontWeight:700, fontSize:"16px", color:"#0A3D1F",
            marginBottom:"18px", fontFamily:"'Playfair Display',serif" }}>
            {editPub ? " Modifier la publication" : " Nouvelle publication"}
          </div>
          <div style={{ display:"grid", gap:"14px" }}>
            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                marginBottom:"6px" }}>Titre *</label>
              <input style={S.input} value={formPub.titre}
                onChange={e => setFormPub(f=>({...f, titre:e.target.value}))}
                placeholder="Titre de la publication..."/>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
              <div>
                <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                  color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                  marginBottom:"6px" }}>Catégorie</label>
                <select style={S.input} value={formPub.cat}
                  onChange={e => setFormPub(f=>({...f, cat:e.target.value}))}>
                  {CATS_PUB.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                  color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                  marginBottom:"6px" }}>Statut</label>
                <select style={S.input} value={formPub.statut}
                  onChange={e => setFormPub(f=>({...f, statut:e.target.value}))}>
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                marginBottom:"6px" }}>Contenu</label>
              <textarea style={S.textarea} value={formPub.contenu}
                onChange={e => setFormPub(f=>({...f, contenu:e.target.value}))}
                placeholder="Rédigez le contenu de la publication..."/>
            </div>

            <div style={{ display:"flex", gap:"10px" }}>
              <button style={S.btn} onClick={sauvegarderPub}>
                 {editPub ? "Enregistrer" : "Créer la publication"}
              </button>
              <button style={S.btnGhost} onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {!pubsChargees && (
        <div style={{ textAlign:"center", padding:"40px", color:"#6B9A7A" }}>
           Chargement des publications...
        </div>
      )}

      {/* Liste publications */}
      <div style={S.card}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #E2EDE6" }}>
              {["Titre","Catégorie","Date","Statut","Vues","Actions"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left",
                  fontSize:"11px", fontWeight:700, color:"#6B9A7A",
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pubs.map((p,i) => (
              <tr key={p.id} style={{ borderBottom:"1px solid #E2EDE6",
                background: i%2===0 ? "#fff" : "#FAFCFB" }}>
                <td style={{ padding:"12px 14px", fontWeight:700,
                  color:"#0A3D1F", maxWidth:"280px" }}>
                  <div style={{ overflow:"hidden", textOverflow:"ellipsis",
                    whiteSpace:"nowrap" }}>{p.titre}</div>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ background:"#E8F5EE", color:"#0A3D1F",
                    borderRadius:"100px", padding:"3px 10px",
                    fontSize:"11px", fontWeight:600 }}>{p.cat}</span>
                </td>
                <td style={{ padding:"12px 14px", color:"#6B9A7A" }}>{p.date}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={S.badge(statutBadge(p.statut))}>{p.statut}</span>
                </td>
                <td style={{ padding:"12px 14px", color:"#6B9A7A",
                  fontWeight:600 }}>{p.vues}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:"6px" }}>
                    <button onClick={() => ouvrirForm(p)}
                      style={{ padding:"5px 10px", borderRadius:"7px",
                        background:"#E8F5EE", border:"none", color:"#0A3D1F",
                        fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                      
                    </button>
                    {p.statut === "brouillon" && (
                      <button onClick={() => publierPub(p.id)}
                        style={{ padding:"5px 10px", borderRadius:"7px",
                          background:"#00904C", border:"none", color:"#fff",
                          fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                        Publier
                      </button>
                    )}
                    <button onClick={() => supprimerPub(p.id)}
                      style={{ padding:"5px 10px", borderRadius:"7px",
                        background:"#FFF0F0", border:"none", color:"#CC3333",
                        fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                      
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  }; // fin renderPublications

  const renderUtilisateurs = () => {
    if (!usersCharges) chargerUsers();
    return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
            color:"#0A3D1F", margin:0 }}>Utilisateurs</h2>
          <p style={{ color:"#6B9A7A", fontSize:"13px", marginTop:"4px" }}>
            {users.length} comptes enregistrés
          </p>
        </div>
        <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
          <button style={S.btn} onClick={() => setShowUserForm(true)}>
            + Nouveau gestionnaire
          </button>
        <input style={{ ...S.input, width:"260px" }}
            placeholder=" Rechercher un utilisateur..."
          value={searchUser}
          onChange={e => setSearchUser(e.target.value)}/>
        </div>
      </div>

      {showUserForm && (
        <div style={{ ...S.card, marginBottom:"20px", border:"2px solid #4DC97A" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
            <div>
              <div style={{ fontWeight:700, fontSize:"16px", color:"#0A3D1F", fontFamily:"'Playfair Display',serif" }}>
                 Création d'un gestionnaire
              </div>
              <div style={{ fontSize:"13px", color:"#6B9A7A", marginTop:"6px" }}>
                Remplissez les informations du compte, puis cliquez sur Enregistrer.
              </div>
            </div>
            <button style={S.btnGhost} onClick={() => {
              setShowUserForm(false);
              setUserError("");
            }}>
              Annuler
            </button>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            <div>
              <label style={S.label}>Nom *</label>
              <input style={S.input} value={formUser.nom}
                onChange={e => setFormUser(f => ({ ...f, nom: e.target.value }))}
                placeholder="Nom" />
            </div>
            <div>
              <label style={S.label}>Prénom *</label>
              <input style={S.input} value={formUser.prenom}
                onChange={e => setFormUser(f => ({ ...f, prenom: e.target.value }))}
                placeholder="Prénom" />
            </div>
            <div>
              <label style={S.label}>Email *</label>
              <input style={S.input} type="email" value={formUser.email}
                onChange={e => setFormUser(f => ({ ...f, email: e.target.value }))}
                placeholder="email@exemple.com" />
            </div>
            <div>
              <label style={S.label}>Téléphone</label>
              <input style={S.input} value={formUser.telephone}
                onChange={e => setFormUser(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+226 70 00 00 00" />
            </div>
            <div>
              <label style={S.label}>Fonction</label>
              <input style={S.input} value={formUser.fonction}
                onChange={e => setFormUser(f => ({ ...f, fonction: e.target.value }))}
                placeholder="Gestionnaire" />
            </div>
            <div>
              <label style={S.label}>Mot de passe *</label>
              <input style={S.input} type="password" value={formUser.password}
                onChange={e => setFormUser(f => ({ ...f, password: e.target.value }))}
                placeholder="Mot de passe" />
            </div>
          </div>

          {userError && (
            <div style={{ marginTop:"16px", padding:"12px 14px", background:"#FFF0F0",
              color:"#CC3333", borderRadius:"10px", fontSize:"13px" }}>
               {userError}
            </div>
          )}

          <div style={{ display:"flex", gap:"10px", marginTop:"18px" }}>
            <button style={S.btn} onClick={sauvegarderUtilisateur} disabled={userLoading}>
              {userLoading ? " Enregistrement..." : "Enregistrer le gestionnaire"}
            </button>
            <button style={S.btnGhost} onClick={() => {
              setShowUserForm(false);
              setUserError("");
            }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      <div style={S.card}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #E2EDE6" }}>
              {["Nom","Email","Type de compte","Rôle","Pack","Statut","Inscrit le","Actions"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left",
                  fontSize:"11px", fontWeight:700, color:"#6B9A7A",
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersFiltres.map((u,i) => (
              <tr key={u.id} style={{ borderBottom:"1px solid #E2EDE6",
                background: i%2===0 ? "#fff" : "#FAFCFB" }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"32px", height:"32px", borderRadius:"8px",
                      background:"#E8F5EE", display:"flex", alignItems:"center",
                      justifyContent:"center", fontWeight:800, fontSize:"12px",
                      color:"#0A3D1F", flexShrink:0 }}>
                      {u.prenom[0]}{u.nom[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, color:"#0A3D1F" }}>
                        {u.prenom} {u.nom}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", color:"#6B9A7A",
                  fontSize:"12px" }}>{u.email}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ background:"#F0F4FF", color:"#3366CC",
                    borderRadius:"100px", padding:"3px 10px",
                    fontSize:"11px", fontWeight:600 }}>
                    {u.type}
                  </span>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={S.badge(statutBadge(u.role))}>{u.role}</span>
                </td>
                <td style={{ padding:"12px 14px", fontWeight:700,
                  color:"#0A3D1F" }}>{u.pack}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={S.badge(statutBadge(u.statut))}>{u.statut}</span>
                </td>
                <td style={{ padding:"12px 14px", color:"#6B9A7A" }}>{u.date}</td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                    {u.role !== 'admin' && (
                      <button onClick={() => mettreAJourRoleUtilisateur(u.id, u.role === 'manager' ? 'subscriber' : 'manager')}
                        style={{ padding:"6px 10px", borderRadius:"8px", border:"none",
                          background:u.role === 'manager' ? "#FFECF0" : "#E8F5EE",
                          color:u.role === 'manager' ? "#CC3333" : "#0A3D1F",
                          fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                        {u.role === 'manager' ? "Retirer gestionnaire" : "Attribuer gestionnaire"}
                  </button>
                )}
                    {u.role !== 'admin' && (
                      <button onClick={() => activerDesactiverUtilisateur(u.id, u.statut !== 'actif')}
                        style={{ padding:"6px 10px", borderRadius:"8px", border:"none",
                          background:u.statut === 'actif' ? "#FFF4E6" : "#E8F5EE",
                          color:u.statut === 'actif' ? "#CC6600" : "#0A3D1F",
                          fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                        {u.statut === 'actif' ? "Suspendre" : "Réactiver"}
                  </button>
                )}
                    {u.role !== 'admin' && (
                      <button onClick={() => supprimerUtilisateur(u.id)}
                        style={{ padding:"6px 10px", borderRadius:"8px", border:"none",
                          background:"#FFF0F0", color:"#CC3333",
                          fontSize:"12px", fontWeight:700, cursor:"pointer" }}>
                        Supprimer
                </button>
                    )}
                </div>
                </td>
              </tr>
        ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  }; // fin renderUtilisateurs

  const renderPartenaires = () => {
    if (!partCharges) chargerPartenaires();
    return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
            color:"#0A3D1F", margin:0 }}>Partenaires</h2>
          <p style={{ color:"#6B9A7A", fontSize:"13px", marginTop:"4px" }}>
            {partenaires.length} partenaire{partenaires.length>1?"s":""} ·{" "}
            {partenaires.filter(p=>p.actif).length} actif{partenaires.filter(p=>p.actif).length>1?"s":""}
          </p>
        </div>
        <button style={S.btn} onClick={() => {
          setEditPart(null);
          setFormPart({ nom:"", type:"", contribution:"", badge:"",  actif:true });
          setShowFormPart(true);
        }}>+ Ajouter un partenaire</button>
      </div>

      {/* Formulaire */}
      {showFormPart && (
        <div style={{ ...S.card, marginBottom:"20px", border:"2px solid #4DC97A" }}>
          <div style={{ fontWeight:700, fontSize:"16px", color:"#0A3D1F",
            marginBottom:"18px", fontFamily:"'Playfair Display',serif" }}>
            {editPart ? " Modifier le partenaire" : " Nouveau partenaire"}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                marginBottom:"6px" }}>Nom *</label>
              <input style={S.input} value={formPart.nom}
                onChange={e => setFormPart(f=>({...f,nom:e.target.value}))}
                placeholder="Nom de l'institution..."/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                marginBottom:"6px" }}>Type</label>
              <input style={S.input} value={formPart.type}
                onChange={e => setFormPart(f=>({...f,type:e.target.value}))}
                placeholder="Ex: Institution d'État, ONG..."/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                marginBottom:"6px" }}>Icône (emoji)</label>
              <input style={S.input} value={formPart.icone}
                onChange={e => setFormPart(f=>({...f,icone:e.target.value}))}
                placeholder=""/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                marginBottom:"6px" }}>Badge</label>
              <input style={S.input} value={formPart.badge}
                onChange={e => setFormPart(f=>({...f,badge:e.target.value}))}
                placeholder="Ex: Données certifiées"/>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                marginBottom:"6px" }}>Contribution</label>
              <textarea style={{ ...S.textarea, minHeight:"80px" }}
                value={formPart.contribution}
                onChange={e => setFormPart(f=>({...f,contribution:e.target.value}))}
                placeholder="Rôle et apport de ce partenaire..."/>
            </div>
            <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:"10px" }}>
              <input type="checkbox" id="actif" checked={formPart.actif}
                onChange={e => setFormPart(f=>({...f,actif:e.target.checked}))}/>
              <label htmlFor="actif" style={{ fontSize:"13px", color:"#0A3D1F",
                fontWeight:600, cursor:"pointer" }}>
                Afficher dans le carousel
              </label>
            </div>
          </div>
          {partError && (
            <div style={{ padding:"10px 14px", background:"#FFF0F0",
              border:"1px solid #FFD0D0", borderRadius:"8px",
              color:"#CC3333", fontSize:"13px", marginTop:"14px" }}>
              ❌ {partError}
            </div>
          )}
          <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
            <button style={S.btn} onClick={sauvegarderPartenaire} disabled={partLoading}>
              {partLoading ? " Sauvegarde..." : ` ${editPart ? "Enregistrer" : "Ajouter"}`}
            </button>
            <button style={S.btnGhost} onClick={() => { setShowFormPart(false); setPartError(""); }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div style={S.card}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #E2EDE6" }}>
              {["Icône","Nom","Type","Badge","Statut","Actions"].map(h => (
                <th key={h} style={{ padding:"10px 14px", textAlign:"left",
                  fontSize:"11px", fontWeight:700, color:"#6B9A7A",
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partenaires.map((p,i) => (
              <tr key={p._id} style={{ borderBottom:"1px solid #E2EDE6",
                background: i%2===0 ? "#fff" : "#FAFCFB",
                opacity: p.actif ? 1 : 0.5 }}>
                <td style={{ padding:"12px 14px", fontSize:"24px" }}></td>
                <td style={{ padding:"12px 14px", fontWeight:700, color:"#0A3D1F" }}>
                  {p.nom}
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ background:"#F0F4FF", color:"#3366CC",
                    borderRadius:"100px", padding:"3px 10px",
                    fontSize:"11px", fontWeight:600 }}>{p.type}</span>
                </td>
                <td style={{ padding:"12px 14px", color:"#6B9A7A",
                  fontSize:"12px" }}>{p.badge}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ background: p.actif ? "#E8F5EE" : "#F0F0F0",
                    color: p.actif ? "#0A7A3F" : "#999",
                    borderRadius:"100px", padding:"3px 10px",
                    fontSize:"11px", fontWeight:700 }}>
                    {p.actif ? "● Actif" : "○ Inactif"}
                  </span>
                </td>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", gap:"6px" }}>
                    <button onClick={() => {
                        setEditPart(p);
                        setFormPart({ nom:p.nom, type:p.type, contribution:p.contribution,
                          badge:p.badge, actif:p.actif });
                        setShowFormPart(true);
                      }}
                      style={{ padding:"5px 10px", borderRadius:"7px",
                        background:"#E8F5EE", border:"none", color:"#0A3D1F",
                        fontSize:"12px", fontWeight:600, cursor:"pointer" }}>✏️</button>
                    <button onClick={() => toggleActifPartenaire(p)}
                      style={{ padding:"5px 10px", borderRadius:"7px",
                        background: p.actif ? "#FFF5E0" : "#E8F5EE",
                        border:"none", color: p.actif ? "#CC6600" : "#0A7A3F",
                        fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                      {p.actif ? "⏸ Masquer" : "▶ Afficher"}
                    </button>
                    <button onClick={() => supprimerPartenaire(p._id)}
                      style={{ padding:"5px 10px", borderRadius:"7px",
                        background:"#FFF0F0", border:"none", color:"#CC3333",
                        fontSize:"12px", fontWeight:600, cursor:"pointer" }}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {partenaires.length === 0 && (
          <div style={{ textAlign:"center", padding:"40px", color:"#6B9A7A" }}>
            Aucun partenaire enregistré
          </div>
        )}
      </div>
    </div>
    ); // fin renderPartenaires
  };

  const renderActivites = () => {
    return (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
            color:"#0A3D1F", margin:0 }}>Journal d'activités</h2>
        <p style={{ color:"#6B9A7A", fontSize:"13px", marginTop:"4px" }}>
          Toutes les actions enregistrées sur la plateforme
        </p>
      </div>
      <div style={S.card}>
          {activitesLoading ? (
            <div style={{ padding:"18px 0", color:"#6B9A7A", fontSize:"13px" }}>
              Chargement des activités...
            </div>
          ) : activitesError ? (
            <div style={{ padding:"18px 0", color:"#CC3333", fontSize:"13px" }}>
              {activitesError}
            </div>
          ) : activites.length === 0 ? (
            <div style={{ padding:"18px 0", color:"#6B9A7A", fontSize:"13px" }}>
              Aucune activité récente enregistrée.
            </div>
          ) : activites.map((a,i) => (
          <div key={a.id} style={{ display:"flex", gap:"14px", padding:"14px 0",
              borderBottom: i < activites.length-1 ? "1px solid #E2EDE6" : "none" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"10px",
              background:"#F0F8F3", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"18px", flexShrink:0 }}>
                
            </div>
            <div style={{ flex:1 }}>
                <div style={{ fontSize:"14px", color:"#0A3D1F", lineHeight:1.5,
                fontWeight:500 }}>{a.texte}</div>
              <div style={{ fontSize:"12px", color:"#6B9A7A", marginTop:"3px" }}>{a.heure}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };

  const RENDER = {
    dashboard:    renderDashboard,
    publications: renderPublications,
    utilisateurs: renderUtilisateurs,
    partenaires:  renderPartenaires,
    activites:    renderActivites,
  };

  // ═══════════════════════════════════════
  // JSX PRINCIPAL
  // ═══════════════════════════════════════
  // Afficher l'écran de login si pas authentifié comme admin
  if (!adminUser) {
    return <AdminLogin onSuccess={(u) => setAdminUser(u)} />;
  }

  return (
    <div style={S.wrap}>

      {/* ── SIDEBAR ── */}
      <aside style={S.side}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "20px 20px 16px" : "20px 12px 16px",
          borderBottom:"1px solid #00904C",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px",
                fontWeight:900, color:"#00904C" }}>
                NERE <span style={{ color:"#090909" }}>Admin</span>
              </div>
              <div style={{ fontSize:"10px", color:"rgba(12, 12, 12, 0.86)",
                marginTop:"2px" }}>CCI-BF · Backoffice</div>
            </div>
          )}
          <button onClick={() => setSidebar(o=>!o)}
            style={{ background:"#009032", border:"none",
              borderRadius:"8px", width:"30px", height:"30px",
              color:"rgba(255,255,255,0.5)", cursor:"pointer",
              fontSize:"14px", flexShrink:0 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:"12px 8px" }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => setSection(item.id)}
              style={{
                width:"100%", display:"flex", alignItems:"center",
                gap: sidebarOpen ? "10px" : "0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                padding: sidebarOpen ? "10px 12px" : "10px",
                borderRadius:"10px", border:"none", cursor:"pointer",
                background: section===item.id
                  ? "#009032" : "transparent",
                color: section===item.id ? "#070707" : "#070707",
                fontWeight: section===item.id ? 700 : 500,
                fontSize:"13px", fontFamily:"inherit",
                marginBottom:"4px", transition:"all 0.15s",
                position:"relative",
              }}>
              <span style={{ fontSize:"18px", flexShrink:0 }}>{item.icone}</span>
              {sidebarOpen && <span style={{ flex:1, textAlign:"left" }}>{item.label}</span>}
              {item.badge > 0 && (
                <span style={{
                  background:"#FF6B6B", color:"#fff", borderRadius:"100px",
                  padding:"1px 7px", fontSize:"10px", fontWeight:800,
                  position: sidebarOpen ? "static" : "absolute",
                  top: sidebarOpen ? "auto" : "6px",
                  right: sidebarOpen ? "auto" : "6px",
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Retour site */}
        <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(237, 6, 6, 0.08)" }}>
          <button onClick={() => navigate("/")}
            style={{ width:"100%", display:"flex", alignItems:"center",
              gap: sidebarOpen ? "10px" : "0",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              padding: sidebarOpen ? "10px 12px" : "10px",
              borderRadius:"10px", border:"none", cursor:"pointer",
              background:"#009032",
              color:"rgba(7, 1, 1, 0.35)",
              fontSize:"13px", fontFamily:"inherit" }}>
            <span style={{ fontSize:"18px" }}></span>
            {sidebarOpen && <span>Voir le site</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{ fontWeight:700, fontSize:"15px", color:"#00904C" }}>
            {NAV_ITEMS.find(n=>n.id===section)?.icone}{" "}
            {NAV_ITEMS.find(n=>n.id===section)?.label}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%",
              background:"#00904C" }}/>
            <span style={{ fontSize:"13px", color:"#00904C" }}>
              {adminUser?.prenom} {adminUser?.nom}
            </span>
            <div style={{ width:"34px", height:"34px", borderRadius:"10px",
              background:"#00904c", display:"flex", alignItems:"center",
              justifyContent:"center", color:"#4DC97A",
              fontWeight:800, fontSize:"13px" }}>
              {adminUser?.prenom?.[0]}{adminUser?.nom?.[0]}
            </div>
            <button
              onClick={() => setAdminUser(null)}
              style={{ padding:"7px 14px", borderRadius:"8px",
                background:"#FFF0F0", border:"1px solid #FFD0D0",
                color:"#CC3333", fontWeight:700, fontSize:"12px",
                cursor:"pointer", fontFamily:"inherit" }}>
               Déconnexion
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div style={S.content}>
          {RENDER[section]?.()}
        </div>
      </main>
    </div>
  );
}