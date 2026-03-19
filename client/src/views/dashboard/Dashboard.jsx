import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

// ═══════════════════════════════════════
// DONNÉES MOCK
// ═══════════════════════════════════════
const MOCK_USERS = [
  { id:1, nom:"ky", prenom:"omar",  email:"i.traore@gmail.com",    type:"entreprise",    role:"subscriber", pack:"PRO",     statut:"actif",    date:"12 Jan 2025" },
  { id:2, nom:"Ouédraogo", prenom:"Aminata",email:"a.ouedraogo@bf.org",   type:"administration",role:"subscriber", pack:"PREMIUM", statut:"actif",    date:"18 Jan 2025" },
  { id:3, nom:"Sawadogo", prenom:"Salif",  email:"s.sawadogo@gmail.com",  type:"etudiant",      role:"visitor",    pack:"–",       statut:"en attente",date:"02 Fév 2025" },
  { id:4, nom:"Compaoré", prenom:"Fatima", email:"f.compaore@univ-bf.edu",type:"etudiant",      role:"subscriber", pack:"BASIC",   statut:"actif",    date:"14 Fév 2025" },
  { id:5, nom:"Barry",    prenom:"Hamidou",email:"h.barry@sahel-agro.com",type:"entreprise",    role:"visitor",    pack:"–",       statut:"suspendu", date:"28 Fév 2025" },
];

const MOCK_RECLAMATIONS = [
  { id:1, auteur:"ky omar",   type:"Données incorrectes",  sujet:"Erreur sur l'IFU de mon entreprise",      statut:"nouveau",    date:"10 Mar 2025" },
  { id:2, auteur:"Fatima Compaoré",  type:"Problème de paiement", sujet:"Abonnement débité sans activation",         statut:"en_cours",   date:"08 Mar 2025" },
  { id:3, auteur:"Moussa Diallo",    type:"Accès refusé",         sujet:"Impossible d'accéder à la recherche avancée",statut:"résolu",     date:"05 Mar 2025" },
  { id:4, auteur:"Aïcha Nikiéma",    type:"Compte",               sujet:"Compte bloqué sans explication",           statut:"nouveau",    date:"12 Mar 2025" },
];

const MOCK_ACTIVITES = [
  { id:1, icone:"👤", texte:"Nouvelle inscription : Salif Sawadogo (Étudiant)",         heure:"Il y a 5 min" },
  { id:2, icone:"💳", texte:"Paiement reçu : ky omar — Pack PRO — 35 000 FCFA", heure:"Il y a 22 min" },
  { id:3, icone:"🔍", texte:"Recherche avancée : 48 requêtes cette heure",              heure:"Il y a 1h" },
  { id:4, icone:"📋", texte:"Nouvelle réclamation : Aïcha Nikiéma",                    heure:"Il y a 2h" },
  { id:5, icone:"📰", texte:"Publication lue : «Enquête commerce de détail» × 124",    heure:"Il y a 3h" },
  { id:6, icone:"💬", texte:"Chat ouvert : Fatima Compaoré — Problème paiement",       heure:"Il y a 4h" },
];

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
export default function Admin() {
  const navigate = useNavigate();
  const [section, setSection]       = useState("dashboard");
  const [sidebarOpen, setSidebar]   = useState(true);

  // Publications
  const [pubs, setPubs]             = useState(MOCK_PUBS);
  const [showForm, setShowForm]     = useState(false);
  const [editPub, setEditPub]       = useState(null);
  const [formPub, setFormPub]       = useState({ titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });

  // Utilisateurs
  const [users]                     = useState(MOCK_USERS);
  const [searchUser, setSearchUser] = useState("");

  // Réclamations
  const [reclamations, setReclamations] = useState(MOCK_RECLAMATIONS);
  const [reponse, setReponse]           = useState({});
  const [recOuverte, setRecOuverte]     = useState(null);

  // ── Handlers publications ──
  const ouvrirForm = (pub = null) => {
    setEditPub(pub);
    setFormPub(pub
      ? { titre:pub.titre, cat:pub.cat, contenu:"", statut:pub.statut }
      : { titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });
    setShowForm(true);
  };

  const sauvegarderPub = () => {
    if (!formPub.titre.trim()) return;
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
  };

  const supprimerPub = (id) => setPubs(ps => ps.filter(p => p.id !== id));

  const publierPub = (id) =>
    setPubs(ps => ps.map(p => p.id===id ? {...p, statut:"publié"} : p));

  // ── Handlers réclamations ──
  const changerStatut = (id, statut) =>
    setReclamations(rs => rs.map(r => r.id===id ? {...r, statut} : r));

  // ── Filtres ──
  const usersFiltres = users.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const kpis = [
    { icone:"👥", label:"Utilisateurs",    val: users.length,                          couleur:"#4DC97A" },
    { icone:"💳", label:"Abonnés actifs",  val: users.filter(u=>u.role==="subscriber").length, couleur:"#D4A830" },
    { icone:"📰", label:"Publications",    val: pubs.length,                           couleur:"#4A9EFF" },
    { icone:"📋", label:"Réclamations",    val: reclamations.filter(r=>r.statut==="nouveau").length+" nouvelles", couleur:"#FF6B6B" },
  ];

  // ═══════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════
  const S = {
    wrap:   { display:"flex", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F5FAF7" },
    side:   { width: sidebarOpen ? "240px" : "64px", background:"#0A3D1F", flexShrink:0,
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
    btn:    { padding:"9px 18px", borderRadius:"10px", background:"#0A3D1F", color:"#fff",
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
    { id:"dashboard",    icone:"📊", label:"Tableau de bord"      },
    { id:"publications", icone:"📰", label:"Publications"   },
    { id:"utilisateurs", icone:"👥", label:"Utilisateurs"   },
    { id:"reclamations", icone:"📋", label:"Réclamations",
      badge: reclamations.filter(r=>r.statut==="nouveau").length },
    { id:"activites",    icone:"⚡", label:"Historiques"      },
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
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
          color:"#0A3D1F", margin:0 }}>Vue d'ensemble</h2>
        <p style={{ color:"#6B9A7A", fontSize:"13px", marginTop:"4px" }}>
          Aujourd'hui — {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
        </p>
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
                fontWeight:900, color:"#0A3D1F" }}>{k.val}</div>
              <div style={{ fontSize:"12px", color:"#6B9A7A", fontWeight:600 }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"16px" }}>
        {/* Activités récentes */}
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F",
            marginBottom:"16px" }}>⚡ Activités récentes</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>
            {MOCK_ACTIVITES.map((a,i) => (
              <div key={a.id} style={{ display:"flex", gap:"12px", padding:"12px 0",
                borderBottom: i < MOCK_ACTIVITES.length-1 ? "1px solid #E2EDE6" : "none" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"10px",
                  background:"#F0F8F3", display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
                  {a.icone}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", color:"#1A2E1F", lineHeight:1.5 }}>{a.texte}</div>
                  <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"2px" }}>{a.heure}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Réclamations nouvelles */}
        <div style={S.card}>
          <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F",
            marginBottom:"16px" }}>
            📋 Réclamations en attente
            <span style={{ ...S.badge("#FF6B6B"), marginLeft:"8px" }}>
              {reclamations.filter(r=>r.statut==="nouveau").length}
            </span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {reclamations.filter(r=>r.statut==="nouveau").map(r => (
              <div key={r.id} style={{ padding:"12px", background:"#FFF5F5",
                borderRadius:"10px", border:"1px solid #FFD0D0", cursor:"pointer" }}
                onClick={() => { setSection("reclamations"); setRecOuverte(r.id); }}>
                <div style={{ fontWeight:700, fontSize:"12px", color:"#CC3333",
                  marginBottom:"4px" }}>{r.type}</div>
                <div style={{ fontSize:"12px", color:"#1A2E1F" }}>{r.sujet}</div>
                <div style={{ fontSize:"11px", color:"#999", marginTop:"4px" }}>{r.auteur} · {r.date}</div>
              </div>
            ))}
            {reclamations.filter(r=>r.statut==="nouveau").length === 0 && (
              <div style={{ textAlign:"center", padding:"20px", color:"#6B9A7A",
                fontSize:"13px" }}>✅ Aucune réclamation en attente</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPublications = () => (
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
            {editPub ? "✏️ Modifier la publication" : "✍️ Nouvelle publication"}
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
                  <option value="publié">Publié</option>
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
                💾 {editPub ? "Enregistrer" : "Créer la publication"}
              </button>
              <button style={S.btnGhost} onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </div>
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
                      ✏️
                    </button>
                    {p.statut === "brouillon" && (
                      <button onClick={() => publierPub(p.id)}
                        style={{ padding:"5px 10px", borderRadius:"7px",
                          background:"#4DC97A", border:"none", color:"#fff",
                          fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                        Publier
                      </button>
                    )}
                    <button onClick={() => supprimerPub(p.id)}
                      style={{ padding:"5px 10px", borderRadius:"7px",
                        background:"#FFF0F0", border:"none", color:"#CC3333",
                        fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                      🗑️
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

  const renderUtilisateurs = () => (
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
        <input style={{ ...S.input, width:"260px" }}
          placeholder="🔍 Rechercher un utilisateur..."
          value={searchUser}
          onChange={e => setSearchUser(e.target.value)}/>
      </div>

      <div style={S.card}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #E2EDE6" }}>
              {["Nom","Email","Type de compte","Rôle","Pack","Statut","Inscrit le"].map(h => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReclamations = () => (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
          color:"#0A3D1F", margin:0 }}>Réclamations</h2>
        <p style={{ color:"#6B9A7A", fontSize:"13px", marginTop:"4px" }}>
          {reclamations.length} réclamations · {reclamations.filter(r=>r.statut==="nouveau").length} nouvelles
        </p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {reclamations.map(r => (
          <div key={r.id} style={{ ...S.card,
            borderLeft: `4px solid ${statutBadge(r.statut)}` }}>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px",
                  marginBottom:"6px" }}>
                  <span style={S.badge(statutBadge(r.statut))}>{r.statut}</span>
                  <span style={{ background:"#F0F4FF", color:"#3366CC",
                    borderRadius:"100px", padding:"3px 10px",
                    fontSize:"11px", fontWeight:600 }}>{r.type}</span>
                  <span style={{ fontSize:"12px", color:"#6B9A7A" }}>{r.date}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F",
                  marginBottom:"4px" }}>{r.sujet}</div>
                <div style={{ fontSize:"13px", color:"#6B9A7A" }}>
                  👤 {r.auteur}
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", flexShrink:0, marginLeft:"16px" }}>
                {r.statut !== "en_cours" && r.statut !== "résolu" && (
                  <button onClick={() => changerStatut(r.id, "en_cours")}
                    style={{ padding:"7px 14px", borderRadius:"8px",
                      background:"#E8F0FF", border:"none", color:"#3366CC",
                      fontWeight:600, fontSize:"12px", cursor:"pointer" }}>
                    Prendre en charge
                  </button>
                )}
                {r.statut !== "résolu" && (
                  <button onClick={() => changerStatut(r.id, "résolu")}
                    style={{ padding:"7px 14px", borderRadius:"8px",
                      background:"#E8F5EE", border:"none", color:"#0A7A3F",
                      fontWeight:600, fontSize:"12px", cursor:"pointer" }}>
                    ✅ Résoudre
                  </button>
                )}
                <button onClick={() => setRecOuverte(recOuverte===r.id ? null : r.id)}
                  style={{ padding:"7px 14px", borderRadius:"8px",
                    background:"#F5FAF7", border:"1px solid #E2EDE6",
                    color:"#0A3D1F", fontWeight:600, fontSize:"12px",
                    cursor:"pointer" }}>
                  {recOuverte===r.id ? "▲ Fermer" : "▼ Répondre"}
                </button>
              </div>
            </div>

            {/* Zone réponse */}
            {recOuverte === r.id && (
              <div style={{ marginTop:"16px", paddingTop:"16px",
                borderTop:"1px solid #E2EDE6" }}>
                <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                  color:"#6B9A7A", textTransform:"uppercase",
                  letterSpacing:"0.08em", marginBottom:"8px" }}>
                  Réponse à envoyer
                </label>
                <textarea
                  value={reponse[r.id] || ""}
                  onChange={e => setReponse(rp => ({...rp, [r.id]: e.target.value}))}
                  placeholder="Écrivez votre réponse à l'utilisateur..."
                  style={{ ...S.textarea, minHeight:"100px" }}/>
                <div style={{ display:"flex", gap:"10px", marginTop:"10px" }}>
                  <button style={S.btn}
                    onClick={() => {
                      changerStatut(r.id, "résolu");
                      setRecOuverte(null);
                    }}>
                    📤 Envoyer la réponse
                  </button>
                  <button style={S.btnGhost}
                    onClick={() => setRecOuverte(null)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderActivites = () => (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px",
          color:"#0A3D1F", margin:0 }}>Journal d'activités</h2>
        <p style={{ color:"#6B9A7A", fontSize:"13px", marginTop:"4px" }}>
          Toutes les actions enregistrées sur la plateforme
        </p>
      </div>
      <div style={S.card}>
        {MOCK_ACTIVITES.map((a,i) => (
          <div key={a.id} style={{ display:"flex", gap:"14px", padding:"14px 0",
            borderBottom: i < MOCK_ACTIVITES.length-1 ? "1px solid #E2EDE6" : "none" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"10px",
              background:"#F0F8F3", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"18px", flexShrink:0 }}>
              {a.icone}
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

  const RENDER = {
    dashboard:    renderDashboard,
    publications: renderPublications,
    utilisateurs: renderUtilisateurs,
    reclamations: renderReclamations,
    activites:    renderActivites,
  };

  // ═══════════════════════════════════════
  // JSX PRINCIPAL
  // ═══════════════════════════════════════
  return (
    <div style={S.wrap}>

      {/* ── SIDEBAR ── */}
      <aside style={S.side}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? "20px 20px 16px" : "20px 12px 16px",
          borderBottom:"1px solid rgba(255,255,255,0.08)",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px",
                fontWeight:900, color:"#fff" }}>
                NERE <span style={{ color:"#4DC97A" }}>Admin</span>
              </div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)",
                marginTop:"2px" }}>CCI-BF · Backoffice</div>
            </div>
          )}
          <button onClick={() => setSidebar(o=>!o)}
            style={{ background:"rgba(255,255,255,0.08)", border:"none",
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
                  ? "rgba(77,201,122,0.15)" : "transparent",
                color: section===item.id ? "#4DC97A" : "rgba(255,255,255,0.55)",
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
        <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => navigate("/")}
            style={{ width:"100%", display:"flex", alignItems:"center",
              gap: sidebarOpen ? "10px" : "0",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              padding: sidebarOpen ? "10px 12px" : "10px",
              borderRadius:"10px", border:"none", cursor:"pointer",
              background:"transparent",
              color:"rgba(255,255,255,0.35)",
              fontSize:"13px", fontFamily:"inherit" }}>
            <span style={{ fontSize:"18px" }}>🌐</span>
            {sidebarOpen && <span>Voir le site</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={S.main}>
        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F" }}>
            {NAV_ITEMS.find(n=>n.id===section)?.icone}{" "}
            {NAV_ITEMS.find(n=>n.id===section)?.label}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%",
              background:"#4DC97A" }}/>
            <span style={{ fontSize:"13px", color:"#6B9A7A" }}>Admin connecté</span>
            <div style={{ width:"34px", height:"34px", borderRadius:"10px",
              background:"#0A3D1F", display:"flex", alignItems:"center",
              justifyContent:"center", color:"#4DC97A",
              fontWeight:800, fontSize:"13px" }}>A</div>
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