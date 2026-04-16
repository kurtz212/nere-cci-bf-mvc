import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const API = "http://localhost:5000/api";
const CATS_PUB = ["Rapport","Étude","Classement","Note technique","Communiqué"];
const MOCK_PUBS = [
  { id:1, titre:"Enquête sur le commerce de détail au Burkina Faso", cat:"Rapport",      date:"28 Fév 2025", statut:"publié",   vues:312 },
  { id:2, titre:"Indice PME – T4 2024 : Reprise prudente",           cat:"Étude",        date:"15 Fév 2025", statut:"publié",   vues:218 },
  { id:3, titre:"Top 100 entreprises BTP – Burkina Faso 2024",       cat:"Classement",   date:"10 Fév 2025", statut:"publié",   vues:476 },
  { id:4, titre:"Note sur la fiscalité des PME 2025",                cat:"Note technique",date:"–",          statut:"brouillon",vues:0   },
];

const getToken = () => localStorage.getItem("token");

// ── Modal suspension temporaire ──
function ModalSuspension({ userId, userName, onConfirm, onClose }) {
  const [duree, setDuree] = useState("24h");
  const [raison, setRaison] = useState("");
  const DUREES = [
    { val:"1h",    label:"1 heure" },
    { val:"6h",    label:"6 heures" },
    { val:"24h",   label:"24 heures" },
    { val:"48h",   label:"48 heures" },
    { val:"7j",    label:"7 jours" },
    { val:"30j",   label:"30 jours" },
    { val:"indef", label:"Indéfini" },
  ];
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.5)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}
      onClick={onClose}>
      <div style={{background:"#fff",borderRadius:"16px",padding:"32px",maxWidth:"440px",
        width:"100%",boxShadow:"0 24px 60px rgba(0,0,0,0.2)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:"32px",marginBottom:"12px",textAlign:"center"}}>⏸️</div>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",color:"#0A2410",
          margin:"0 0 6px",textAlign:"center"}}>Suspendre l'accès</h3>
        <p style={{fontSize:"13px",color:"#6B9A7A",textAlign:"center",marginBottom:"24px"}}>
          Compte de <strong>{userName}</strong>
        </p>

        <div style={{marginBottom:"16px"}}>
          <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"#6B9A7A",
            textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"8px"}}>
            Durée de suspension
          </label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
            {DUREES.map(d=>(
              <button key={d.val} onClick={()=>setDuree(d.val)}
                style={{padding:"9px 12px",borderRadius:"8px",fontSize:"13px",
                  border:`2px solid ${duree===d.val?"#CC6600":"#E2EDE6"}`,
                  background:duree===d.val?"#FFF4E6":"#fff",
                  color:duree===d.val?"#CC6600":"#6B9A7A",
                  fontWeight:duree===d.val?700:500,cursor:"pointer",fontFamily:"inherit"}}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{marginBottom:"20px"}}>
          <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"#6B9A7A",
            textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"6px"}}>
            Raison (facultatif)
          </label>
          <textarea value={raison} onChange={e=>setRaison(e.target.value)}
            placeholder="Motif de la suspension..."
            style={{width:"100%",padding:"10px 12px",borderRadius:"8px",
              border:"1.5px solid #E2EDE6",fontSize:"13px",fontFamily:"inherit",
              outline:"none",resize:"vertical",minHeight:"70px",boxSizing:"border-box",color:"#0A2410"}}/>
        </div>

        <div style={{display:"flex",gap:"10px"}}>
          <button onClick={()=>onConfirm(duree, raison)}
            style={{flex:1,padding:"12px",borderRadius:"10px",background:"#CC6600",
              border:"none",color:"#fff",fontWeight:700,fontSize:"14px",cursor:"pointer",fontFamily:"inherit"}}>
            ⏸️ Confirmer la suspension
          </button>
          <button onClick={onClose}
            style={{flex:1,padding:"12px",borderRadius:"10px",background:"#fff",
              border:"1.5px solid #E2EDE6",color:"#6B9A7A",fontWeight:600,fontSize:"14px",
              cursor:"pointer",fontFamily:"inherit"}}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Écran de login admin ──
function AdminLogin({ onSuccess }) {
  const [form, setForm]       = useState({ email:"", password:"" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/connexion`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.user?.role === "admin") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onSuccess(data.user);
      } else if (data.success) {
        setError("Accès refusé. Compte administrateur requis.");
      } else {
        setError(data.message || "Identifiants incorrects.");
      }
    } catch { setError("Impossible de contacter le serveur."); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#006B38,#00904C)",
      display:"flex",alignItems:"center",justifyContent:"center",
      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{background:"rgba(255,255,255,0.08)",borderRadius:"20px",
        border:"1px solid rgba(255,255,255,0.15)",padding:"48px 40px",
        width:"100%",maxWidth:"400px",backdropFilter:"blur(20px)"}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{fontSize:"48px",marginBottom:"12px"}}></div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:900,color:"#fff",margin:0}}>
            Administration NERE
          </h2>
          <p style={{color:"rgba(255,255,255,0.6)",fontSize:"13px",marginTop:"8px"}}>
            Accès réservé aux administrateurs
          </p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:"14px"}}>
            <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"7px"}}>Email</label>
            <input type="email" value={form.email} required placeholder="admin@nere.bf"
              onChange={e=>setForm(p=>({...p,email:e.target.value}))}
              style={{width:"100%",padding:"12px 14px",borderRadius:"10px",
                border:"1.5px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",
                color:"#fff",fontSize:"14px",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:"20px"}}>
            <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"rgba(255,255,255,0.5)",
              textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"7px"}}>Mot de passe</label>
            <div style={{position:"relative"}}>
              <input type={showPwd?"text":"password"} value={form.password} required placeholder="••••••••"
                onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                style={{width:"100%",padding:"12px 44px 12px 14px",borderRadius:"10px",
                  border:"1.5px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",
                  color:"#fff",fontSize:"14px",fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
              <button type="button" onClick={()=>setShowPwd(o=>!o)}
                style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",fontSize:"16px",color:"rgba(255,255,255,0.6)"}}>
                {showPwd?"🙈":"👁️"}
              </button>
            </div>
          </div>
          {error && <div style={{background:"rgba(232,85,85,0.1)",border:"1px solid rgba(232,85,85,0.3)",
            borderRadius:"8px",padding:"10px 14px",color:"#FF8080",fontSize:"13px",marginBottom:"16px"}}>
            ❌ {error}
          </div>}
          <button type="submit" disabled={loading}
            style={{width:"100%",padding:"13px",borderRadius:"12px",background:"#fff",
              border:"none",color:"#00904C",fontWeight:800,fontSize:"15px",
              cursor:"pointer",fontFamily:"inherit",marginTop:"6px"}}>
            {loading ? "Connexion..." : "Accéder au panneau admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser]   = useState(null);
  const [section, setSection]       = useState("dashboard");
  const [sidebarOpen, setSidebar]   = useState(true);

  // Publications
  const [pubs, setPubs]               = useState([]);
  const [pubsChargees, setPubsChargees] = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [editPub, setEditPub]         = useState(null);
  const [formPub, setFormPub]         = useState({titre:"",cat:"Rapport",contenu:"",statut:"brouillon"});
  const [pubLoading, setPubLoading]   = useState(false);
  const [pubError, setPubError]       = useState("");

  // Utilisateurs
  const [users, setUsers]               = useState([]);
  const [usersCharges, setUsersCharges] = useState(false);
  const [searchUser, setSearchUser]     = useState("");
  const [filtreRole, setFiltreRole]     = useState("tous");
  const [showUserForm, setShowUserForm] = useState(false);
  const [formUser, setFormUser]         = useState({nom:"",prenom:"",email:"",telephone:"",fonction:"Gestionnaire",typeCompte:"administration",role:"manager",password:"",isActive:true});
  const [userError, setUserError]       = useState("");
  const [userLoading, setUserLoading]   = useState(false);

  // Suspension modale
  const [suspModal, setSuspModal]   = useState(null); // { userId, userName }
  const [actionMsg, setActionMsg]   = useState({});   // { [userId]: { texte, type } }

  // Activités
  const [activites, setActivites]               = useState([]);
  const [activitesChargees, setActivitesChargees] = useState(false);
  const [activitesLoading, setActivitesLoading] = useState(false);
  const [activitesError, setActivitesError]     = useState("");

  // ── Charger données ──
  const chargerPubs = async () => {
    try {
      const res  = await fetch(`${API}/publications?all=true&limit=100`,{headers:{"Authorization":`Bearer ${getToken()}`}});
      const data = await res.json();
      if (data.success) setPubs(data.data.map(p=>({
        id:p._id, titre:p.titre, cat:p.categorie||"Rapport",
        date:new Date(p.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
        statut:p.statut, vues:p.vues||0
      })));
    } catch { setPubs(MOCK_PUBS); }
    setPubsChargees(true);
  };

  const chargerUsers = async () => {
    try {
      const res  = await fetch(`${API}/users`,{headers:{"Authorization":`Bearer ${getToken()}`}});
      const data = await res.json();
      if (data.success) setUsers(data.data.map(u=>({
        id:u._id, nom:u.nom, prenom:u.prenom, email:u.email||"—",
        type:u.typeCompte||"autre", role:u.role, pack:u.pack||"—",
        statut:u.isActive?"actif":"suspendu",
        suspendJusquau: u.suspendJusquau || null,
        raison: u.raisonSuspension || "",
        date:new Date(u.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
      })));
    } catch { console.warn("users error"); }
    setUsersCharges(true);
  };

  const chargerActivites = async () => {
    setActivitesLoading(true); setActivitesError("");
    try {
      const res  = await fetch(`${API}/searchlogs/recent?limit=8`,{headers:{"Authorization":`Bearer ${getToken()}`}});
      const data = await res.json();
      if (data.success) setActivites(data.data.map(log=>({
        id:log.id||log._id,
        texte: log.description || (() => {
          const c=log.criteres||{}; const p=[];
          if(c.denomination)p.push(`Nom: ${c.denomination}`);
          if(c.rccm)p.push(`RCCM: ${c.rccm}`);
          if(c.secteur)p.push(c.secteur); if(c.region)p.push(c.region);
          return p.length?`Recherche ${p.join(' • ')} — ${log.resultatCount} résultat(s)`:`Recherche • ${log.resultatCount} résultat(s)`;
        })(),
        heure: new Date(log.createdAt).toLocaleString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}),
      })));
      else setActivitesError(data.message||"Erreur.");
    } catch { setActivitesError("Serveur inaccessible."); }
    setActivitesLoading(false); setActivitesChargees(true);
  };

  useEffect(()=>{ if(adminUser) chargerActivites(); },[adminUser]);
  useEffect(()=>{ if(adminUser&&section==="activites"&&!activitesChargees&&!activitesLoading) chargerActivites(); },[adminUser,section]);

  // ── Publications CRUD ──
  const ouvrirForm = (pub=null) => {
    setEditPub(pub);
    setFormPub(pub?{titre:pub.titre,cat:pub.cat,contenu:"",statut:pub.statut}:{titre:"",cat:"Rapport",contenu:"",statut:"brouillon"});
    setShowForm(true);
  };

  const sauvegarderPub = async () => {
    if(!formPub.titre.trim()){setPubError("Le titre est obligatoire.");return;}
    setPubLoading(true); setPubError("");
    try {
      const url=editPub?`${API}/publications/${editPub.id}`:`${API}/publications`;
      const res=await fetch(url,{method:editPub?"PUT":"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},
        body:JSON.stringify({titre:formPub.titre,categorie:formPub.cat,contenu:formPub.contenu,statut:formPub.statut})});
      const data=await res.json();
      if(data.success){
        if(editPub) setPubs(ps=>ps.map(p=>p.id===editPub.id?{...p,titre:data.data.titre,cat:data.data.categorie,statut:data.data.statut}:p));
        else setPubs(ps=>[...ps,{id:data.data._id,titre:data.data.titre,cat:data.data.categorie,
          date:new Date(data.data.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
          statut:data.data.statut,vues:0}]);
        setShowForm(false);
      } else setPubError(data.message||"Erreur.");
    } catch {
      if(editPub) setPubs(ps=>ps.map(p=>p.id===editPub.id?{...p,titre:formPub.titre,cat:formPub.cat,statut:formPub.statut}:p));
      else setPubs(ps=>[...ps,{id:Date.now(),titre:formPub.titre,cat:formPub.cat,
        date:new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
        statut:formPub.statut,vues:0}]);
      setShowForm(false);
    }
    setPubLoading(false);
  };

  const supprimerPub = async (id) => {
    if(!window.confirm("Supprimer cette publication ?"))return;
    try{await fetch(`${API}/publications/${id}`,{method:"DELETE",headers:{"Authorization":`Bearer ${getToken()}`}});}catch{}
    setPubs(ps=>ps.filter(p=>p.id!==id));
  };

  const publierPub = async (id) => {
    try{await fetch(`${API}/publications/${id}`,{method:"PUT",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},
      body:JSON.stringify({statut:"publie"})});}catch{}
    setPubs(ps=>ps.map(p=>p.id===id?{...p,statut:"publié"}:p));
  };

  // ── Gestion utilisateurs ──
  const sauvegarderUtilisateur = async () => {
    if(!formUser.nom.trim()||!formUser.prenom.trim()||!formUser.email.trim()||!formUser.password.trim()){
      setUserError("Tous les champs obligatoires.");return;
    }
    setUserLoading(true); setUserError("");
    try {
      const res=await fetch(`${API}/users`,{method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},
        body:JSON.stringify(formUser)});
      const data=await res.json();
      if(!data.success) setUserError(data.message||"Impossible de créer.");
      else{
        await chargerUsers();
        setShowUserForm(false);
        setFormUser({nom:"",prenom:"",email:"",telephone:"",fonction:"Gestionnaire",typeCompte:"administration",role:"manager",password:"",isActive:true});
      }
    } catch{setUserError("Serveur indisponible.");}
    setUserLoading(false);
  };

  // Attribuer/retirer rôle gestionnaire
  const mettreAJourRole = async (id, role) => {
    try{
      const res=await fetch(`${API}/users/${id}/role`,{method:"PUT",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},
        body:JSON.stringify({role})});
      const data=await res.json();
      if(data.success){
        setUsers(us=>us.map(u=>u.id===id?{...u,role:data.data.role}:u));
        afficherAction(id, `✅ Rôle mis à jour : ${data.data.role}`, "succes");
      }
    }catch{}
  };

  // Réactiver un compte
  const reactiver = async (id) => {
    try{
      const res=await fetch(`${API}/users/${id}/activate`,{method:"PUT",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},
        body:JSON.stringify({isActive:true, suspendJusquau:null, raisonSuspension:""})});
      const data=await res.json();
      if(data.success){
        setUsers(us=>us.map(u=>u.id===id?{...u,statut:"actif",suspendJusquau:null,raison:""}:u));
        afficherAction(id, "✅ Compte réactivé avec succès.", "succes");
      }
    }catch{}
  };

  // Confirmer suspension
  const confirmerSuspension = async (duree, raison) => {
    const { userId } = suspModal;
    setSuspModal(null);

    // Calculer la date de fin selon la durée choisie
    let suspendJusquau = null;
    if (duree !== "indef") {
      const now = new Date();
      const map = { "1h":1, "6h":6, "24h":24, "48h":48, "7j":168, "30j":720 };
      const heures = map[duree] || 24;
      now.setHours(now.getHours() + heures);
      suspendJusquau = now.toISOString();
    }

    try{
      const res=await fetch(`${API}/users/${userId}/activate`,{method:"PUT",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},
        body:JSON.stringify({isActive:false, suspendJusquau, raisonSuspension:raison})});
      const data=await res.json();
      if(data.success){
        setUsers(us=>us.map(u=>u.id===userId?{...u,statut:"suspendu",suspendJusquau,raison}:u));
        const dureeLabel = duree==="indef" ? "indéfiniment" : `pour ${duree}`;
        afficherAction(userId, `⏸️ Compte suspendu ${dureeLabel}.`, "warning");
      }
    }catch{}
  };

  const afficherAction = (userId, texte, type) => {
    setActionMsg(m=>({...m,[userId]:{texte,type}}));
    setTimeout(()=>setActionMsg(m=>{const n={...m};delete n[userId];return n;}), 4000);
  };

  // Filtres
  const usersFiltres = users.filter(u => {
    const matchSearch = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase());
    const matchRole   = filtreRole==="tous" || u.role===filtreRole || (filtreRole==="suspendu"&&u.statut==="suspendu");
    return matchSearch && matchRole;
  });

  const kpis = [
    {label:"Utilisateurs",  val:usersCharges?users.length:"...",                                  couleur:"#4DC97A"},
    {label:"Abonnés actifs",val:usersCharges?users.filter(u=>u.role==="subscriber").length:"...", couleur:"#D4A830"},
    {label:"Suspendus",     val:usersCharges?users.filter(u=>u.statut==="suspendu").length:"...",couleur:"#FF6B6B"},
    {label:"Publications",  val:pubsChargees?pubs.length:"...",                                    couleur:"#4A9EFF"},
  ];

  const S = {
    wrap:    {display:"flex",minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif",background:"#F5FAF7"},
    side:    {width:sidebarOpen?"240px":"64px",background:"#FFFFFF",flexShrink:0,display:"flex",
              flexDirection:"column",transition:"width 0.25s ease",overflow:"hidden",
              position:"sticky",top:0,height:"100vh"},
    main:    {flex:1,display:"flex",flexDirection:"column",overflow:"auto"},
    topbar:  {background:"#fff",borderBottom:"1px solid #E2EDE6",padding:"0 28px",height:"60px",
              display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0},
    content: {padding:"28px",flex:1},
    card:    {background:"#fff",borderRadius:"14px",border:"1px solid #E2EDE6",padding:"22px"},
    badge:   (c)=>({background:`${c}18`,color:c,borderRadius:"100px",padding:"3px 10px",fontSize:"11px",fontWeight:700}),
    btn:     {padding:"9px 18px",borderRadius:"10px",background:"#00904C",color:"#fff",
              border:"none",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"},
    btnGhost:{padding:"9px 18px",borderRadius:"10px",background:"transparent",color:"#00904C",
              border:"1.5px solid #00904C",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"},
    input:   {width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1.5px solid #E2EDE6",
              fontSize:"13px",fontFamily:"inherit",outline:"none",boxSizing:"border-box",color:"#1A2E1F"},
    textarea:{width:"100%",padding:"10px 14px",borderRadius:"10px",border:"1.5px solid #E2EDE6",
              fontSize:"13px",fontFamily:"inherit",outline:"none",boxSizing:"border-box",color:"#1A2E1F",
              resize:"vertical",minHeight:"160px"},
  };

  const NAV_ITEMS = [
    {id:"dashboard",   label:"Dashboard"},
    {id:"publications",label:"Publications"},
    {id:"utilisateurs",label:"Utilisateurs"},
    {id:"activites",   label:"Activités"},
  ];

  const statutBadge = (s) => ({
    "publié":"#4DC97A","brouillon":"#D4A830","actif":"#4DC97A",
    "suspendu":"#FF6B6B","en attente":"#D4A830","subscriber":"#4DC97A",
    "visitor":"#D4A830","manager":"#4A9EFF",
  }[s]||"#999");

  // ── Sections render ──
  const renderDashboard = () => (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",
        flexWrap:"wrap",gap:"16px",marginBottom:"24px"}}>
        <div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:"#00904C",margin:0}}>Vue d'ensemble</h2>
          <p style={{color:"#6B9A7A",fontSize:"13px",marginTop:"4px"}}>
            {new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </p>
        </div>
        <button style={{...S.btn,whiteSpace:"nowrap"}}
          onClick={()=>{setSection("utilisateurs");setShowUserForm(true);}}>
           Créer un gestionnaire
        </button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"16px",marginBottom:"24px"}}>
        {kpis.map(k=>(
          <div key={k.label} style={{...S.card,display:"flex",alignItems:"center",gap:"14px"}}>
            <div style={{borderRadius:"12px",
              background:`${k.couleur}18`,display:"flex",alignItems:"center",
              justifyContent:"center",fontSize:"22px",flexShrink:0}}>
              {k.icone}
            </div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:900,color:k.couleur}}>{k.val}</div>
              <div style={{fontSize:"12px",color:"#6B9A7A",fontWeight:600}}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <div style={{fontWeight:700,fontSize:"15px",color:"#0A3D1F",marginBottom:"16px"}}> Activités récentes</div>
        {activitesLoading ? <div style={{color:"#6B9A7A",fontSize:"13px"}}> Chargement...</div> :
         activitesError   ? <div style={{color:"#CC3333",fontSize:"13px"}}>{activitesError}</div> :
         activites.length===0 ? <div style={{color:"#6B9A7A",fontSize:"13px"}}>Aucune activité récente.</div> :
         activites.map((a,i)=>(
           <div key={a.id} style={{display:"flex",gap:"12px",padding:"12px 0",
             borderBottom:i<activites.length-1?"1px solid #E2EDE6":"none"}}>
             <div style={{borderRadius:"10px",background:"#F0F8F3",
               display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}></div>
             <div style={{flex:1}}>
               <div style={{fontSize:"13px",color:"#1A2E1F",lineHeight:1.5}}>{a.texte}</div>
               <div style={{fontSize:"11px",color:"#6B9A7A",marginTop:"2px"}}>{a.heure}</div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );

  const renderPublications = () => {
    if(!pubsChargees) chargerPubs();
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
          <div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:"#0A3D1F",margin:0}}>Publications</h2>
            <p style={{color:"#6B9A7A",fontSize:"13px",marginTop:"4px"}}>
              {pubs.length} publication{pubs.length>1?"s":""} · {pubs.filter(p=>/^publi/i.test(p.statut)).length} publiée{pubs.filter(p=>/^publi/i.test(p.statut)).length>1?"s":""}
            </p>
          </div>
          <button style={S.btn} onClick={()=>ouvrirForm()}> Nouvelle publication</button>
        </div>

        {showForm && (
          <div style={{...S.card,marginBottom:"20px",border:"2px solid #4DC97A"}}>
            <div style={{fontWeight:700,fontSize:"16px",color:"#0A3D1F",marginBottom:"18px",
              fontFamily:"'Playfair Display',serif"}}>
              {editPub?" Modifier":" Nouvelle publication"}
            </div>
            <div style={{display:"grid",gap:"14px"}}>
              <div>
                <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"#6B9A7A",
                  textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"6px"}}>Titre *</label>
                <input style={S.input} value={formPub.titre}
                  onChange={e=>setFormPub(f=>({...f,titre:e.target.value}))} placeholder="Titre de la publication..."/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"#6B9A7A",
                    textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"6px"}}>Catégorie</label>
                  <select style={S.input} value={formPub.cat} onChange={e=>setFormPub(f=>({...f,cat:e.target.value}))}>
                    {CATS_PUB.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"#6B9A7A",
                    textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"6px"}}>Statut</label>
                  <select style={S.input} value={formPub.statut} onChange={e=>setFormPub(f=>({...f,statut:e.target.value}))}>
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"#6B9A7A",
                  textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"6px"}}>Contenu</label>
                <textarea style={S.textarea} value={formPub.contenu}
                  onChange={e=>setFormPub(f=>({...f,contenu:e.target.value}))} placeholder="Rédigez le contenu..."/>
              </div>
              {pubError && <div style={{padding:"10px",background:"#FFF0F0",borderRadius:"8px",color:"#CC3333",fontSize:"13px"}}>❌ {pubError}</div>}
              <div style={{display:"flex",gap:"10px"}}>
                <button style={S.btn} onClick={sauvegarderPub} disabled={pubLoading}>
                  {pubLoading?"...":editPub?"Enregistrer":"Créer"}
                </button>
                <button style={S.btnGhost} onClick={()=>setShowForm(false)}>Annuler</button>
              </div>
            </div>
          </div>
        )}

        <div style={S.card}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
            <thead>
              <tr style={{borderBottom:"2px solid #E2EDE6"}}>
                {["Titre","Catégorie","Date","Statut","Vues","Actions"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"11px",
                    fontWeight:700,color:"#6B9A7A",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pubs.map((p,i)=>(
                <tr key={p.id} style={{borderBottom:"1px solid #E2EDE6",background:i%2===0?"#fff":"#FAFCFB"}}>
                  <td style={{padding:"12px 14px",fontWeight:700,color:"#0A3D1F",maxWidth:"280px"}}>
                    <div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.titre}</div>
                  </td>
                  <td style={{padding:"12px 14px"}}>
                    <span style={{background:"#E8F5EE",color:"#0A3D1F",borderRadius:"100px",
                      padding:"3px 10px",fontSize:"11px",fontWeight:600}}>{p.cat}</span>
                  </td>
                  <td style={{padding:"12px 14px",color:"#6B9A7A"}}>{p.date}</td>
                  <td style={{padding:"12px 14px"}}><span style={S.badge(statutBadge(p.statut))}>{p.statut}</span></td>
                  <td style={{padding:"12px 14px",color:"#6B9A7A",fontWeight:600}}>{p.vues}</td>
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",gap:"6px"}}>
                      <button onClick={()=>ouvrirForm(p)} style={{padding:"5px 10px",borderRadius:"7px",
                        background:"#E8F5EE",border:"none",color:"#0A3D1F",fontSize:"12px",fontWeight:600,cursor:"pointer"}}></button>
                      {!/^publi/i.test(p.statut) && (
                        <button onClick={()=>publierPub(p.id)} style={{padding:"5px 10px",borderRadius:"7px",
                          background:"#00904C",border:"none",color:"#fff",fontSize:"12px",fontWeight:600,cursor:"pointer"}}>Publier</button>
                      )}
                      <button onClick={()=>supprimerPub(p.id)} style={{padding:"5px 10px",borderRadius:"7px",
                        background:"#FFF0F0",border:"none",color:"#CC3333",fontSize:"12px",fontWeight:600,cursor:"pointer"}}></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUtilisateurs = () => {
    if(!usersCharges) chargerUsers();
    return (
      <div>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:"#0A3D1F",margin:0}}>Utilisateurs</h2>
            <p style={{color:"#6B9A7A",fontSize:"13px",marginTop:"4px"}}>{users.length} comptes enregistrés</p>
          </div>
          <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
            <button style={S.btn} onClick={()=>setShowUserForm(true)}> Nouveau gestionnaire</button>
            <input style={{...S.input,width:"220px"}} placeholder=" Rechercher..."
              value={searchUser} onChange={e=>setSearchUser(e.target.value)}/>
          </div>
        </div>

        {/* Filtres rôle */}
        <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
          {[
            {val:"tous",     label:"Tous"},
            {val:"admin",    label:"Admins"},
            {val:"manager",  label:"Gestionnaires"},
            {val:"subscriber",label:"Abonnés"},
            {val:"visitor",  label:"Visiteurs"},
            {val:"suspendu", label:"Suspendus"},
          ].map(f=>(
            <button key={f.val} onClick={()=>setFiltreRole(f.val)}
              style={{padding:"6px 14px",borderRadius:"100px",fontSize:"12px",
                border:`1.5px solid ${filtreRole===f.val?"#00904C":"#E2EDE6"}`,
                background:filtreRole===f.val?"#E6F4EC":"#fff",
                color:filtreRole===f.val?"#00904C":"#6B9A7A",
                fontWeight:filtreRole===f.val?700:500,cursor:"pointer",fontFamily:"inherit"}}>
              {f.label}
              <span style={{marginLeft:"5px",fontSize:"11px",opacity:0.7}}>
                ({f.val==="tous" ? users.length :
                  f.val==="suspendu" ? users.filter(u=>u.statut==="suspendu").length :
                  users.filter(u=>u.role===f.val).length})
              </span>
            </button>
          ))}
        </div>

        {/* Formulaire création gestionnaire */}
        {showUserForm && (
          <div style={{...S.card,marginBottom:"20px",border:"2px solid #4DC97A"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
              <div>
                <div style={{fontWeight:700,fontSize:"16px",color:"#0A3D1F",fontFamily:"'Playfair Display',serif"}}>
                   Création d'un gestionnaire
                </div>
                <div style={{fontSize:"13px",color:"#6B9A7A",marginTop:"6px"}}>Ce compte aura accès au tableau de bord gestionnaire.</div>
              </div>
              <button style={S.btnGhost} onClick={()=>{setShowUserForm(false);setUserError("");}}>Annuler</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
              {[{k:"nom",l:"Nom *",t:"text",p:"Nom"},{k:"prenom",l:"Prénom *",t:"text",p:"Prénom"},
                {k:"email",l:"Email *",t:"email",p:"email@exemple.com"},{k:"telephone",l:"Téléphone",t:"text",p:"+226 70 00 00 00"},
                {k:"fonction",l:"Fonction",t:"text",p:"Gestionnaire"},{k:"password",l:"Mot de passe *",t:"password",p:"••••••••"}].map(f=>(
                <div key={f.k}>
                  <label style={{display:"block",fontSize:"11px",fontWeight:700,color:"#6B9A7A",
                    textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"6px"}}>{f.l}</label>
                  <input style={S.input} type={f.t} value={formUser[f.k]}
                    onChange={e=>setFormUser(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p}/>
                </div>
              ))}
            </div>
            {userError && <div style={{marginTop:"14px",padding:"12px",background:"#FFF0F0",color:"#CC3333",borderRadius:"10px",fontSize:"13px"}}>❌ {userError}</div>}
            <div style={{display:"flex",gap:"10px",marginTop:"18px"}}>
              <button style={S.btn} onClick={sauvegarderUtilisateur} disabled={userLoading}>
                {userLoading?" Enregistrement...":"Enregistrer"}
              </button>
              <button style={S.btnGhost} onClick={()=>{setShowUserForm(false);setUserError("");}}>Fermer</button>
            </div>
          </div>
        )}

        {/* Tableau utilisateurs */}
        <div style={S.card}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"13px"}}>
            <thead>
              <tr style={{borderBottom:"2px solid #E2EDE6"}}>
                {["Utilisateur","Email","Rôle","Statut","Inscrit le","Actions"].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:"11px",
                    fontWeight:700,color:"#6B9A7A",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersFiltres.map((u,i)=>(
                <tr key={u.id} style={{borderBottom:"1px solid #E2EDE6",
                  background:u.statut==="suspendu"?"#FFF9F0":i%2===0?"#fff":"#FAFCFB"}}>

                  {/* Nom */}
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"50%",
                        background:u.statut==="suspendu"?"#FFF4E6":"#E8F5EE",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontWeight:800,fontSize:"13px",
                        color:u.statut==="suspendu"?"#CC6600":"#0A3D1F",flexShrink:0}}>
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <div>
                        <div style={{fontWeight:700,color:"#0A3D1F",fontSize:"13px"}}>{u.prenom} {u.nom}</div>
                        {u.statut==="suspendu" && u.suspendJusquau && (
                          <div style={{fontSize:"10px",color:"#CC6600",marginTop:"2px"}}>
                            Jusqu'au {new Date(u.suspendJusquau).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}
                          </div>
                        )}
                        {u.statut==="suspendu" && !u.suspendJusquau && (
                          <div style={{fontSize:"10px",color:"#CC3333",marginTop:"2px"}}>Suspension indéfinie</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{padding:"12px 14px",color:"#6B9A7A",fontSize:"12px"}}>{u.email}</td>

                  {/* Rôle */}
                  <td style={{padding:"12px 14px"}}>
                    <span style={S.badge(statutBadge(u.role))}>{u.role}</span>
                  </td>

                  {/* Statut */}
                  <td style={{padding:"12px 14px"}}>
                    <span style={S.badge(statutBadge(u.statut))}>{u.statut}</span>
                  </td>

                  <td style={{padding:"12px 14px",color:"#6B9A7A",fontSize:"12px"}}>{u.date}</td>

                  {/* Actions */}
                  <td style={{padding:"12px 14px"}}>
                    <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>

                      {/* Message d'action */}
                      {actionMsg[u.id] && (
                        <div style={{padding:"6px 10px",borderRadius:"6px",fontSize:"11px",
                          background:actionMsg[u.id].type==="succes"?"#E8F5EE":actionMsg[u.id].type==="warning"?"#FFF4E6":"#FFF0F0",
                          color:actionMsg[u.id].type==="succes"?"#00904C":actionMsg[u.id].type==="warning"?"#CC6600":"#CC3333"}}>
                          {actionMsg[u.id].texte}
                        </div>
                      )}

                      <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                        {/* Attribuer/retirer gestionnaire */}
                        {u.role!=="admin" && (
                          <button onClick={()=>mettreAJourRole(u.id, u.role==="manager"?"subscriber":"manager")}
                            style={{padding:"5px 10px",borderRadius:"7px",border:"none",fontSize:"11px",fontWeight:700,cursor:"pointer",
                              background:u.role==="manager"?"#FFF4E6":"#E8F5EE",
                              color:u.role==="manager"?"#CC6600":"#00904C"}}>
                            {u.role==="manager"?" Retirer gestionnaire":" Attribuer gestionnaire"}
                          </button>
                        )}

                        {/* Suspendre ou Réactiver */}
                        {u.role!=="admin" && (
                          u.statut==="suspendu" ? (
                            <button onClick={()=>reactiver(u.id)}
                              style={{padding:"5px 10px",borderRadius:"7px",border:"none",fontSize:"11px",fontWeight:700,cursor:"pointer",
                                background:"#E8F5EE",color:"#00904C"}}>
                              ▶️ Réactiver
                            </button>
                          ) : (
                            <button onClick={()=>setSuspModal({userId:u.id, userName:`${u.prenom} ${u.nom}`})}
                              style={{padding:"5px 10px",borderRadius:"7px",border:"none",fontSize:"11px",fontWeight:700,cursor:"pointer",
                                background:"#FFF4E6",color:"#CC6600"}}>
                               Suspendre
                            </button>
                          )
                        )}
                      </div>

                      {/* Raison de suspension */}
                      {u.statut==="suspendu" && u.raison && (
                        <div style={{fontSize:"10px",color:"#6B9A7A",fontStyle:"italic",
                          padding:"4px 8px",background:"#F5FAF7",borderRadius:"4px",maxWidth:"200px"}}>
                          Raison : {u.raison}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usersFiltres.length===0 && (
            <div style={{textAlign:"center",padding:"32px",color:"#6B9A7A",fontSize:"13px"}}>
              Aucun utilisateur correspondant à ce filtre
            </div>
          )}
        </div>

        {/* Note info */}
        <div style={{marginTop:"16px",padding:"12px 16px",background:"#F0F8F3",
          borderRadius:"10px",border:"1px solid rgba(0,144,76,0.15)",
          fontSize:"12px",color:"#6B9A7A",display:"flex",alignItems:"center",gap:"8px"}}>
          <span></span>
          <span> Utilisez la suspension d'un utilisateur pour restreindre ses accès.</span>
        </div>
      </div>
    );
  };

  const renderActivites = () => (
    <div>
      <div style={{marginBottom:"24px"}}>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",color:"#0A3D1F",margin:0}}>Journal d'activités</h2>
        <p style={{color:"#6B9A7A",fontSize:"13px",marginTop:"4px"}}>Toutes les actions enregistrées sur la plateforme</p>
      </div>
      <div style={S.card}>
        {activitesLoading ? <div style={{padding:"18px",color:"#6B9A7A"}}> Chargement...</div> :
         activitesError   ? <div style={{padding:"18px",color:"#CC3333"}}>{activitesError}</div> :
         activites.length===0 ? <div style={{padding:"18px",color:"#6B9A7A"}}>Aucune activité récente.</div> :
         activites.map((a,i)=>(
           <div key={a.id} style={{display:"flex",gap:"14px",padding:"14px 0",
             borderBottom:i<activites.length-1?"1px solid #E2EDE6":"none"}}>
             <div style={{width:"40px",height:"40px",borderRadius:"10px",background:"",
               display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}></div>
             <div style={{flex:1}}>
               <div style={{fontSize:"14px",color:"#0A3D1F",lineHeight:1.5,fontWeight:500}}>{a.texte}</div>
               <div style={{fontSize:"12px",color:"#6B9A7A",marginTop:"3px"}}>{a.heure}</div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );

  const RENDER = { dashboard:renderDashboard, publications:renderPublications, utilisateurs:renderUtilisateurs, activites:renderActivites };

  if(!adminUser) return <AdminLogin onSuccess={u=>setAdminUser(u)}/>;

  return (
    <div style={S.wrap}>

      {/* Modal suspension */}
      {suspModal && (
        <ModalSuspension
          userId={suspModal.userId}
          userName={suspModal.userName}
          onConfirm={confirmerSuspension}
          onClose={()=>setSuspModal(null)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={S.side}>
        <div style={{padding:sidebarOpen?"20px 20px 16px":"20px 12px 16px",
          borderBottom:"1px solid rgba(255,255,255,0.15)",
          display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          {sidebarOpen && (
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"17px",fontWeight:900,color:"#050505"}}>
                NERE <span style={{color:"#ED1C24"}}>Admin</span>
              </div>
              <div style={{fontSize:"10px",color:"#050505",marginTop:"2px"}}>CCI-BF · Backoffice</div>
            </div>
          )}
          <button onClick={()=>setSidebar(o=>!o)}
            style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"8px",
              width:"30px",height:"30px",color:"rgba(255,255,255,0.7)",cursor:"pointer",
              fontSize:"14px",flexShrink:0}}>
            {sidebarOpen?"◀":"▶"}
          </button>
        </div>

        <nav style={{flex:1,padding:"12px 8px"}}>
          {NAV_ITEMS.map(item=>(
            <button key={item.id} onClick={()=>setSection(item.id)}
              style={{width:"100%",display:"flex",alignItems:"center",
                gap:sidebarOpen?"10px":"0",justifyContent:sidebarOpen?"flex-start":"center",
                padding:sidebarOpen?"10px 12px":"10px",borderRadius:"10px",border:"none",
                cursor:"pointer",
                background:section===item.id?"#4DC97A":"transparent",
                color:"#060606",fontWeight:section===item.id?700:500,
                fontSize:"20px",fontFamily:"inherit",marginBottom:"4px",transition:"all 0.15s"}}>
              <span style={{fontSize:"18px",flexShrink:0}}>{item.icon}</span>
              {sidebarOpen && <span style={{flex:1,textAlign:"left"}}>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{padding:"8px",borderTop:"1px solid rgba(255,255,255,0.15)"}}>
          <button onClick={()=>navigate("/Chatadmin")}
            style={{width:"100%",display:"flex",alignItems:"center",gap:sidebarOpen?"10px":"0",
              justifyContent:sidebarOpen?"flex-start":"center",padding:sidebarOpen?"10px 12px":"10px",
              borderRadius:"10px",border:"none",cursor:"pointer",background:"#4DC97A",
              color:"#FFFFFF",fontWeight:700,fontSize:"13px",fontFamily:"inherit",marginBottom:"6px"}}>
            <span style={{fontSize:"18px"}}></span>
            {sidebarOpen && <span>Chat utilisateurs</span>}
          </button>
          <button onClick={()=>navigate("/")}
            style={{width:"100%",display:"flex",alignItems:"center",gap:sidebarOpen?"10px":"0",
              justifyContent:sidebarOpen?"flex-start":"center",padding:sidebarOpen?"10px 12px":"10px",
              borderRadius:"10px",border:"none",cursor:"pointer",background:"#4DC97A",
              color:"#FFFFFF",fontSize:"13px",fontFamily:"inherit"}}>
            <span style={{fontSize:"18px"}}></span>
            {sidebarOpen && <span>Voir le site</span>}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={S.main}>
        <div style={S.topbar}>
          <div style={{fontWeight:700,fontSize:"15px",color:"#00904C"}}>
            {NAV_ITEMS.find(n=>n.id===section)?.icon}{" "}
            {NAV_ITEMS.find(n=>n.id===section)?.label}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:"#00904C"}}/>
            <span style={{fontSize:"13px",color:"#00904C"}}>{adminUser?.prenom} {adminUser?.nom}</span>
            <div style={{width:"34px",height:"34px",borderRadius:"10px",background:"#00904C",
              display:"flex",alignItems:"center",justifyContent:"center",
              color:"#4DC97A",fontWeight:800,fontSize:"13px"}}>
              {adminUser?.prenom?.[0]}{adminUser?.nom?.[0]}
            </div>
            <button onClick={()=>setAdminUser(null)}
              style={{padding:"7px 14px",borderRadius:"8px",background:"#FFF0F0",
                border:"1px solid #FFD0D0",color:"#CC3333",fontWeight:700,fontSize:"12px",
                cursor:"pointer",fontFamily:"inherit"}}>
               Déconnexion
            </button>
          </div>
        </div>

        <div style={S.content}>{RENDER[section]?.()}</div>
      </main>
    </div>
  );
}