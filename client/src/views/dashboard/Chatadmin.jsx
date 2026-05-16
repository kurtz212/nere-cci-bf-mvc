import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../../styles/dashboard.css";

const SOCKET_URL = "http://localhost:5000";
const API = "/api";

export default function ChatAdmin() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const socketRef = useRef(null);
  const endRef    = useRef(null);

  const [conversations, setConversations]   = useState({});
  const [userActif, setUserActif]           = useState(null);
  const [usersConnectes, setUsersConnectes] = useState(new Set());
  const [usersEcrivent, setUsersEcrivent]   = useState({});

  const [onglet, setOnglet]         = useState("conversations");
  const [texteDiff, setTexteDiff]   = useState("");
  const [ciblesMode, setCiblesMode] = useState("tous");
  const [usersSelect, setUsersSelect] = useState(new Set());
  const [allUsers, setAllUsers]     = useState([]);
  const [searchCible, setSearchCible] = useState("");
  const [diffusions, setDiffusions] = useState([]);
  const [diffEnvoi, setDiffEnvoi]   = useState(false);
  const [diffMsg, setDiffMsg]       = useState({ texte:"", type:"" });

  // Recherche dans la liste des conversations/utilisateurs
  const [searchConv, setSearchConv] = useState("");
  // Onglet interne sidebar : conversations existantes ou tous les utilisateurs
  const [sideView, setSideView]     = useState("convs"); // "convs" | "users"

  const [texte, setTexte]     = useState("");
  const [connecte, setConnecte] = useState(false);

  // Charger tous les utilisateurs (y compris gestionnaires, sauf l'admin connecté)
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          // Inclure tout le monde sauf l'admin connecté lui-même
          setAllUsers(d.data.filter(u => u._id !== (user?._id || user?.id)));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      navigate("/"); return;
    }
    const socket = io(SOCKET_URL, {
      query: { userId: user._id||user.id||"", role: user.role, prenom: user.prenom, nom: user.nom },
      transports: ["websocket"],
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnecte(true);
      socket.emit("charger_historique", { userId: user._id||user.id, role: user.role });
      socket.emit("charger_diffusions");
    });
    socket.on("disconnect", () => setConnecte(false));
    socket.on("historique", (msgs) => {
      const convs = {};
      msgs.forEach(m => {
        const uid = (m.role==="admin"||m.role==="manager") ? m.destinataireId : m.expediteurId;
        const nom  = (m.role==="admin"||m.role==="manager") ? "" : m.expediteurNom;
        if (!uid) return;
        if (!convs[uid]) convs[uid] = { nom, messages:[], nonLus:0 };
        if (nom) convs[uid].nom = nom;
        convs[uid].messages.push(m);
        if (!m.lu && m.role!=="admin" && m.role!=="manager") convs[uid].nonLus++;
      });
      setConversations(convs);
    });
    socket.on("message_recu", (msg) => {
      const uid = (msg.role==="admin"||msg.role==="manager") ? msg.destinataireId : msg.expediteurId;
      if (!uid) return;
      setConversations(prev => {
        const conv = prev[uid] || { nom:msg.expediteurNom||"Utilisateur", messages:[], nonLus:0 };
        if (conv.messages.find(m=>m.id===msg.id)) return prev;
        return {
          ...prev,
          [uid]: {
            ...conv,
            nom: msg.role!=="admin" ? (msg.expediteurNom||conv.nom) : conv.nom,
            messages: [...conv.messages, msg],
            nonLus: userActif===uid ? 0 : conv.nonLus + (msg.role!=="admin"?1:0),
          }
        };
      });
    });
    socket.on("message_envoye_admin", (msg) => {
      const uid = msg.destinataireId;
      if (!uid) return;
      setConversations(prev => {
        const conv = prev[uid] || { nom:"Utilisateur", messages:[], nonLus:0 };
        if (conv.messages.find(m=>m.id===msg.id)) return prev;
        return { ...prev, [uid]: { ...conv, messages:[...conv.messages, msg] }};
      });
    });
    socket.on("historique_diffusions", (msgs) => setDiffusions(msgs));
    socket.on("diffusion_envoyee", (msg) => setDiffusions(d=>[msg,...d]));
    socket.on("user_ecrit", ({ ecrit, userId:uid }) => {
      setUsersEcrivent(p=>({...p,[uid]:ecrit}));
    });
    socket.on("users_connectes", (users) => {
      setUsersConnectes(new Set(users.map(u=>u.userId)));
    });
    socket.on("user_connecte",   ({ userId }) => setUsersConnectes(s=>new Set([...s,userId])));
    socket.on("user_deconnecte", ({ userId }) => {
      setUsersConnectes(s=>{ const n=new Set(s); n.delete(userId); return n; });
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [conversations, userActif]);

  const selectionnerUser = (uid, nomOverride) => {
    setUserActif(uid);
    setConversations(prev => {
      if (!prev[uid]) {
        // Créer une entrée vide si pas encore de conversation
        return { ...prev, [uid]: { nom: nomOverride||"Utilisateur", messages:[], nonLus:0 } };
      }
      return { ...prev, [uid]: { ...prev[uid], nonLus:0 } };
    });
    if (socketRef.current) socketRef.current.emit("marquer_lu", { conversationUserId: uid });
    setSideView("convs"); // Revenir à la vue conversations après sélection
  };

  const envoyer = () => {
    if (!texte.trim() || !userActif || !socketRef.current) return;
    socketRef.current.emit("message_envoyer", {
      texte:          texte.trim(),
      expediteurId:   user._id||user.id||"",
      expediteurNom:  `${user.prenom} ${user.nom}`,
      role:           user.role,
      destinataireId: userActif,
    });
    socketRef.current.emit("stop_ecrit", { role:user.role, userId:userActif, destinataireId:userActif });
    setTexte("");
  };

  const handleTexteChange = (e) => {
    setTexte(e.target.value);
    if (socketRef.current && userActif) {
      socketRef.current.emit("ecrit", {
        role:user.role, userId:user._id||user.id,
        nom:`${user.prenom} ${user.nom}`, destinataireId:userActif
      });
    }
  };

  const envoyerDiffusion = () => {
    if (!texteDiff.trim() || !socketRef.current) return;
    setDiffEnvoi(true);
    const cibles = ciblesMode==="tous" ? [] : Array.from(usersSelect);
    socketRef.current.emit("diffusion_envoyer", {
      texte:         texteDiff.trim(),
      expediteurId:  user._id||user.id||"",
      expediteurNom: `${user.prenom} ${user.nom}`,
      cibles,
    });
    setDiffMsg({
      texte: ` Message envoyé à ${ciblesMode==="tous" ? "tous les utilisateurs" : `${cibles.length} utilisateur(s) ciblé(s)`}`,
      type: "succes"
    });
    setTexteDiff(""); setUsersSelect(new Set()); setCiblesMode("tous"); setSearchCible("");
    setDiffEnvoi(false);
    setTimeout(()=>setDiffMsg({texte:"",type:""}), 4000);
  };

  const toggleUserSelect = (uid) => {
    setUsersSelect(prev => {
      const n = new Set(prev);
      n.has(uid) ? n.delete(uid) : n.add(uid);
      return n;
    });
  };

  // Badge rôle coloré
  const roleBadge = (role) => {
    const map = {
      admin:      { label:"Admin",        bg:"#FFF4E6", color:"#CC6600" },
      manager:    { label:"Gestionnaire", bg:"#E6F0FF", color:"#1E60CC" },
      subscriber: { label:"Abonné",       bg:"#E8F5EE", color:"#00904C" },
      visitor:    { label:"Visiteur",     bg:"#F5F5F5", color:"#6B9A7A" },
    };
    const r = map[role] || map.visitor;
    return (
      <span style={{ background:r.bg, color:r.color, borderRadius:"100px",
        padding:"1px 8px", fontSize:"9px", fontWeight:700, flexShrink:0 }}>
        {r.label}
      </span>
    );
  };

  // Filtrer conversations existantes
  const convsFiltrees = Object.entries(conversations).filter(([uid, conv]) =>
    conv.nom?.toLowerCase().includes(searchConv.toLowerCase())
  );

  // Filtrer tous les utilisateurs pour la vue "Nouvel utilisateur"
  const usersFiltresConv = allUsers.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(searchConv.toLowerCase())
  );

  // Filtrer pour le panneau diffusion
  const usersFiltresDiff = allUsers.filter(u =>
    `${u.prenom} ${u.nom} ${u.email}`.toLowerCase().includes(searchCible.toLowerCase())
  );

  const messagesActifs = userActif ? (conversations[userActif]?.messages || []) : [];
  const totalNonLus    = Object.values(conversations).reduce((s,c)=>s+(c.nonLus||0), 0);

  const S = {
    container: { display:"flex", height:"100vh", fontFamily:"Arial, Helvetica, sans-serif", background:"#F5FAF7" },
    sidebar:   { width:"320px", background:"#fff", borderRight:"1px solid #E2EDE6", display:"flex", flexDirection:"column" },
    sideHeader:{ padding:"16px 20px", background:"#00904C", flexShrink:0 },
    main:      { flex:1, display:"flex", flexDirection:"column" },
    topbar:    { padding:"0 24px", height:"60px", background:"#fff", borderBottom:"1px solid #E2EDE6", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
    messages:  { flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:"10px" },
    bubble:    (moi) => ({
      maxWidth:"65%", padding:"12px 16px",
      borderRadius: moi?"16px 4px 16px 16px":"4px 16px 16px 16px",
      background:   moi?"#00904C":"#fff",
      color:        moi?"#fff":"#0A2410",
      boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
      alignSelf:    moi?"flex-end":"flex-start",
      border:       moi?"none":"1px solid #E2EDE6",
      whiteSpace:   "pre-wrap",
    }),
    inputZone: { padding:"16px 24px", background:"#fff", borderTop:"1px solid #E2EDE6", display:"flex", gap:"10px", flexShrink:0, alignItems:"flex-end" },
  };

  if (!user || (user.role!=="admin"&&user.role!=="manager")) return null;

  return (
    <div style={S.container}>

      {/* ── SIDEBAR ── */}
      <div style={S.sidebar}>
        {/* Header */}
        <div style={S.sideHeader}>
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:800, color:"#fff", marginBottom:"4px" }}>
            Chat Admin
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.6)" }}>
              {Object.keys(conversations).length} conversation{Object.keys(conversations).length>1?"s":""}
              {totalNonLus>0 && (
                <span style={{ marginLeft:"6px", background:"#FF6B6B", color:"#fff", borderRadius:"100px", padding:"1px 7px", fontSize:"10px", fontWeight:800 }}>
                  {totalNonLus}
                </span>
              )}
            </span>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:connecte?"#4DC97A":"#FF6B6B" }}/>
          </div>
        </div>

        {/* Onglets Messages / Diffusion */}
        <div style={{ display:"flex", borderBottom:"2px solid #E2EDE6", flexShrink:0 }}>
          {[{ key:"conversations", label:" Messages" }, { key:"diffusion", label:" Diffusion" }].map(t=>(
            <button key={t.key} onClick={()=>setOnglet(t.key)}
              style={{ flex:1, padding:"10px 6px", background:"transparent", border:"none",
                borderBottom:onglet===t.key?"3px solid #00904C":"3px solid transparent",
                color:onglet===t.key?"#00904C":"#6B9A7A",
                fontWeight:onglet===t.key?700:500, fontSize:"11px", cursor:"pointer",
                fontFamily:"inherit", marginBottom:"-2px" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ONGLET CONVERSATIONS ── */}
        {onglet==="conversations" && (
          <>
            {/* Barre de recherche + toggle vue */}
            <div style={{ padding:"10px 12px", borderBottom:"1px solid #F0F4F0", flexShrink:0 }}>
              <div style={{ position:"relative", marginBottom:"8px" }}>
                <span style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", color:"#6B9A7A" }}></span>
                <input
                  value={searchConv}
                  onChange={e=>setSearchConv(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  style={{ width:"100%", padding:"8px 10px 8px 32px", borderRadius:"8px",
                    border:"1.5px solid #E2EDE6", fontSize:"12px", fontFamily:"inherit",
                    outline:"none", boxSizing:"border-box", color:"#0A2410", background:"#F5FAF7" }}/>
                {searchConv && (
                  <button onClick={()=>setSearchConv("")}
                    style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)",
                      background:"none", border:"none", cursor:"pointer", fontSize:"12px", color:"#6B9A7A" }}>
                  </button>
                )}
              </div>
              {/* Toggle : conversations existantes / tous les utilisateurs */}
              <div style={{ display:"flex", gap:"4px", background:"#F5FAF7", borderRadius:"8px", padding:"3px" }}>
                <button onClick={()=>setSideView("convs")}
                  style={{ flex:1, padding:"5px 8px", borderRadius:"6px", border:"none",
                    background:sideView==="convs"?"#fff":"transparent",
                    color:sideView==="convs"?"#00904C":"#6B9A7A",
                    fontWeight:sideView==="convs"?700:500, fontSize:"11px", cursor:"pointer",
                    fontFamily:"inherit",
                    boxShadow:sideView==="convs"?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
                  Conversations {Object.keys(conversations).length>0&&`(${Object.keys(conversations).length})`}
                </button>
                <button onClick={()=>setSideView("users")}
                  style={{ flex:1, padding:"5px 8px", borderRadius:"6px", border:"none",
                    background:sideView==="users"?"#fff":"transparent",
                    color:sideView==="users"?"#00904C":"#6B9A7A",
                    fontWeight:sideView==="users"?700:500, fontSize:"11px", cursor:"pointer",
                    fontFamily:"inherit",
                    boxShadow:sideView==="users"?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
                  Tous ({allUsers.length})
                </button>
              </div>
            </div>

            {/* ── Vue : Conversations existantes ── */}
            {sideView==="convs" && (
              <div style={{ flex:1, overflowY:"auto" }}>
                {convsFiltrees.length===0 ? (
                  <div style={{ padding:"28px 16px", textAlign:"center", color:"#6B9A7A", fontSize:"13px" }}>
                    
                    {searchConv ? "Aucun résultat" : "Aucune conversation"}
                    <div style={{ marginTop:"12px" }}>
                      <button onClick={()=>setSideView("users")}
                        style={{ padding:"7px 14px", background:"#E8F5EE", color:"#00904C", border:"none",
                          borderRadius:"8px", cursor:"pointer", fontSize:"12px", fontWeight:600, fontFamily:"inherit" }}>
                        Voir tous les utilisateurs →
                      </button>
                    </div>
                  </div>
                ) : convsFiltrees.map(([uid, conv])=>(
                  <div key={uid} onClick={()=>selectionnerUser(uid, conv.nom)}
                    style={{ padding:"12px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px",
                      background:userActif===uid?"#E6F4EC":"#fff",
                      borderBottom:"1px solid #F0F4F0",
                      borderLeft:userActif===uid?"3px solid #00904C":"3px solid transparent" }}>
                    <div style={{ position:"relative", flexShrink:0 }}>
                      <div style={{ width:"38px", height:"38px", borderRadius:"50%", background:"#E6F4EC",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontWeight:800, fontSize:"14px", color:"#00904C" }}>
                        {conv.nom?.[0]?.toUpperCase()||"?"}
                      </div>
                      {usersConnectes.has(uid) && (
                        <div style={{ position:"absolute", bottom:0, right:0, width:"10px", height:"10px",
                          borderRadius:"50%", background:"#4DC97A", border:"2px solid #fff" }}/>
                      )}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"4px" }}>
                        <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410",
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {conv.nom}
                        </div>
                        {conv.nonLus>0 && (
                          <span style={{ background:"#FF6B6B", color:"#fff", borderRadius:"100px",
                            padding:"1px 7px", fontSize:"10px", fontWeight:800, flexShrink:0 }}>
                            {conv.nonLus}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"2px",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {usersEcrivent[uid] ? " En train d'écrire..." : (conv.messages[conv.messages.length-1]?.texte||"Aucun message")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Vue : Tous les utilisateurs ── */}
            {sideView==="users" && (
              <div style={{ flex:1, overflowY:"auto" }}>
                {/* Séparateurs par rôle */}
                {[
                  { role:"manager",    label:"Gestionnaires" },
                  { role:"subscriber", label:"Abonnés"       },
                  { role:"visitor",    label:"Visiteurs"     },
                ].map(group => {
                  const usersGroupe = usersFiltresConv.filter(u=>u.role===group.role);
                  if (usersGroupe.length===0) return null;
                  return (
                    <div key={group.role}>
                      <div style={{ padding:"6px 14px 4px", fontSize:"10px", fontWeight:700,
                        color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em",
                        background:"#F8FBF8", borderBottom:"1px solid #F0F4F0", borderTop:"1px solid #F0F4F0" }}>
                        {group.label} ({usersGroupe.length})
                      </div>
                      {usersGroupe.map(u=>{
                        const uid = u._id;
                        const nom = `${u.prenom} ${u.nom}`;
                        const aConv = !!conversations[uid];
                        const nonLus = conversations[uid]?.nonLus || 0;
                        return (
                          <div key={uid} onClick={()=>selectionnerUser(uid, nom)}
                            style={{ padding:"11px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px",
                              background:userActif===uid?"#E6F4EC":"#fff",
                              borderBottom:"1px solid #F0F4F0",
                              borderLeft:userActif===uid?"3px solid #00904C":"3px solid transparent" }}>
                            <div style={{ position:"relative", flexShrink:0 }}>
                              <div style={{ width:"36px", height:"36px", borderRadius:"50%",
                                background: u.role==="manager"?"#E6F0FF":"#E6F4EC",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontWeight:800, fontSize:"13px",
                                color: u.role==="manager"?"#1E60CC":"#00904C" }}>
                                {u.prenom?.[0]?.toUpperCase()||"?"}
                              </div>
                              {usersConnectes.has(uid) && (
                                <div style={{ position:"absolute", bottom:0, right:0, width:"9px", height:"9px",
                                  borderRadius:"50%", background:"#4DC97A", border:"2px solid #fff" }}/>
                              )}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"5px", flexWrap:"wrap" }}>
                                <div style={{ fontWeight:700, fontSize:"12px", color:"#0A2410",
                                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {nom}
                                </div>
                                {roleBadge(u.role)}
                                {nonLus>0 && (
                                  <span style={{ background:"#FF6B6B", color:"#fff", borderRadius:"100px",
                                    padding:"1px 6px", fontSize:"9px", fontWeight:800 }}>{nonLus}</span>
                                )}
                              </div>
                              <div style={{ fontSize:"10px", color:"#9AB0A0", marginTop:"1px",
                                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                {u.email}
                              </div>
                              {aConv && (
                                <div style={{ fontSize:"10px", color:"#00904C", fontWeight:600, marginTop:"1px" }}>
                                   Conversation en cours
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {usersFiltresConv.length===0 && (
                  <div style={{ padding:"28px 16px", textAlign:"center", color:"#6B9A7A", fontSize:"13px" }}>
                    <div style={{ fontSize:"32px", marginBottom:"8px" }}></div>
                    Aucun utilisateur trouvé
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── ONGLET DIFFUSION ── */}
        {onglet==="diffusion" && (
          <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
            <div style={{ marginBottom:"14px" }}>
              <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410", marginBottom:"10px" }}>Envoyer une annonce</div>

              {/* Mode ciblage */}
              <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
                {[{ key:"tous", label:"Tous" }, { key:"selection", label:"Sélection ciblée" }].map(m=>(
                  <button key={m.key} onClick={()=>{ setCiblesMode(m.key); setSearchCible(""); }}
                    style={{ flex:1, padding:"7px", borderRadius:"8px",
                      border:`1.5px solid ${ciblesMode===m.key?"#00904C":"#E2EDE6"}`,
                      background:ciblesMode===m.key?"#E6F4EC":"transparent",
                      color:ciblesMode===m.key?"#00904C":"#6B9A7A",
                      fontSize:"11px", fontWeight:ciblesMode===m.key?700:500,
                      cursor:"pointer", fontFamily:"inherit" }}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Sélection ciblée avec recherche */}
              {ciblesMode==="selection" && (
                <div style={{ marginBottom:"12px" }}>
                  <div style={{ position:"relative", marginBottom:"8px" }}>
                    <span style={{ position:"absolute", left:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"13px", color:"#6B9A7A" }}></span>
                    <input
                      value={searchCible}
                      onChange={e=>setSearchCible(e.target.value)}
                      placeholder="Rechercher un utilisateur..."
                      style={{ width:"100%", padding:"8px 10px 8px 32px", borderRadius:"8px",
                        border:"1.5px solid #E2EDE6", fontSize:"12px",
                        fontFamily:"inherit", outline:"none", boxSizing:"border-box",
                        color:"#0A2410", background:"#F5FAF7" }}/>
                    {searchCible && (
                      <button onClick={()=>setSearchCible("")}
                        style={{ position:"absolute", right:"8px", top:"50%", transform:"translateY(-50%)",
                          background:"none", border:"none", cursor:"pointer", fontSize:"12px", color:"#6B9A7A" }}>
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight:"160px", overflowY:"auto", border:"1px solid #E2EDE6", borderRadius:"10px" }}>
                    {usersFiltresDiff.length===0 ? (
                      <div style={{ padding:"12px", color:"#6B9A7A", fontSize:"12px", textAlign:"center" }}>
                        {allUsers.length===0 ? "Chargement..." : "Aucun utilisateur trouvé"}
                      </div>
                    ) : usersFiltresDiff.map(u=>(
                      <div key={u._id} onClick={()=>toggleUserSelect(u._id)}
                        style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 12px",
                          cursor:"pointer",
                          background:usersSelect.has(u._id)?"#E6F4EC":"#fff",
                          borderBottom:"1px solid #F5F5F5" }}>
                        <div style={{ width:"18px", height:"18px", borderRadius:"4px", flexShrink:0,
                          border:`2px solid ${usersSelect.has(u._id)?"#00904C":"#D0D0D0"}`,
                          background:usersSelect.has(u._id)?"#00904C":"transparent",
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {usersSelect.has(u._id) && <span style={{ color:"#fff", fontSize:"11px", lineHeight:1 }}></span>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"12px", color:"#0A2410", fontWeight:usersSelect.has(u._id)?700:400,
                            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                            {u.prenom} {u.nom}
                          </div>
                          <div style={{ fontSize:"10px", color:"#6B9A7A" }}>{u.email}</div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
                          {roleBadge(u.role)}
                          {usersConnectes.has(u._id) && (
                            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4DC97A", flexShrink:0 }}/>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"6px", display:"flex", justifyContent:"space-between" }}>
                    <span>{usersSelect.size} sélectionné{usersSelect.size>1?"s":""}</span>
                    {usersSelect.size>0 && (
                      <button onClick={()=>setUsersSelect(new Set())}
                        style={{ background:"none", border:"none", color:"#CC3333", fontSize:"11px", cursor:"pointer", fontFamily:"inherit" }}>
                        Tout désélectionner
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Message diffusion */}
              <textarea value={texteDiff} onChange={e=>setTexteDiff(e.target.value)}
                placeholder="Rédigez votre annonce..."
                style={{ width:"100%", padding:"10px 12px", borderRadius:"10px",
                  border:"1.5px solid #E2EDE6", fontSize:"13px", fontFamily:"inherit",
                  outline:"none", resize:"vertical", minHeight:"90px",
                  boxSizing:"border-box", color:"#0A2410" }}/>

              {diffMsg.texte && (
                <div style={{ marginTop:"8px", padding:"8px 12px", borderRadius:"8px", fontSize:"12px",
                  background:diffMsg.type==="succes"?"#E8F5EE":"#FFF0F0",
                  color:diffMsg.type==="succes"?"#00904C":"#CC3333" }}>
                  {diffMsg.texte}
                </div>
              )}

              <button onClick={envoyerDiffusion}
                disabled={!texteDiff.trim()||(ciblesMode==="selection"&&usersSelect.size===0)||diffEnvoi}
                style={{ width:"100%", marginTop:"10px", padding:"11px", borderRadius:"10px",
                  background:texteDiff.trim()&&(ciblesMode==="tous"||usersSelect.size>0)?"#00904C":"#E2EDE6",
                  border:"none",
                  color:texteDiff.trim()&&(ciblesMode==="tous"||usersSelect.size>0)?"#fff":"#6B9A7A",
                  fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
                {ciblesMode==="tous"
                  ? " Envoyer à tous"
                  : ` Envoyer à ${usersSelect.size} utilisateur${usersSelect.size>1?"s":""}`}
              </button>
            </div>

            {/* Historique diffusions */}
            <div style={{ borderTop:"1px solid #E2EDE6", paddingTop:"14px" }}>
              <div style={{ fontWeight:700, fontSize:"12px", color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>
                Annonces envoyées
              </div>
              {diffusions.length===0 ? (
                <div style={{ textAlign:"center", color:"#6B9A7A", fontSize:"12px", padding:"12px" }}>Aucune annonce</div>
              ) : diffusions.map((d,i)=>(
                <div key={d.id||i} style={{ padding:"10px 12px", background:"#F5FAF7", borderRadius:"8px", marginBottom:"8px", border:"1px solid #E2EDE6" }}>
                  <div style={{ fontSize:"11px", color:"#6B9A7A", marginBottom:"4px" }}>
                    {d.cibles?.length>0 ? `${d.cibles.length} utilisateur(s) ciblé(s)` : "Tous les utilisateurs"} · {d.date} {d.heure}
                  </div>
                  <div style={{ fontSize:"12px", color:"#0A2410", lineHeight:1.5, overflow:"hidden", textOverflow:"ellipsis", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                    {d.texte}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons retour */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid #E2EDE6", flexShrink:0, display:"flex", flexDirection:"column", gap:"6px" }}>
          <button onClick={()=>navigate("/admin")}
            style={{ width:"100%", padding:"10px", borderRadius:"8px", background:"#E6F4EC", border:"none", color:"#00904C", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
             Retour sur le tableau de bord
          </button>
          <button onClick={()=>navigate("/")}
            style={{ width:"100%", padding:"10px", borderRadius:"8px", background:"#fff", border:"1px solid #E2EDE6", color:"#6B9A7A", fontWeight:600, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>
             Retour à l'accueil
          </button>
        </div>
      </div>

      {/* ── ZONE PRINCIPALE ── */}
      <div style={S.main}>
        <div style={S.topbar}>
          {userActif ? (
            <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ position:"relative" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"#E6F4EC",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:800, color:"#00904C" }}>
                  {conversations[userActif]?.nom?.[0]?.toUpperCase()}
                </div>
                {usersConnectes.has(userActif) && (
                  <div style={{ position:"absolute", bottom:0, right:0, width:"10px", height:"10px",
                    borderRadius:"50%", background:"#4DC97A", border:"2px solid #fff" }}/>
                )}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:"14px", color:"#0A2410", display:"flex", alignItems:"center", gap:"8px" }}>
                  {conversations[userActif]?.nom}
                  {/* Badge rôle dans le topbar */}
                  {(() => {
                    const u = allUsers.find(u=>u._id===userActif);
                    return u ? roleBadge(u.role) : null;
                  })()}
                </div>
                <div style={{ fontSize:"11px", color:"#6B9A7A" }}>
                  {usersEcrivent[userActif] ? " En train d'écrire..." : usersConnectes.has(userActif) ? "EN LIGNE" : "HORS LIGNE"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:"14px", color:"#6B9A7A" }}>
              Sélectionnez un utilisateur pour démarrer ou reprendre une conversation
            </div>
          )}
          <div style={{ fontSize:"12px", color:connecte?"#00904C":"#FF6B6B", fontWeight:600 }}>
            {connecte ? "CONNECTE" : "DECONNECTE"}
          </div>
        </div>

        {/* Messages */}
        <div style={S.messages}>
          {!userActif ? (
            <div style={{ margin:"auto", textAlign:"center", color:"#6B9A7A" }}>
              
              <div style={{ fontSize:"15px", fontWeight:600, marginBottom:"8px" }}>Choisissez une conversation</div>
              <div style={{ fontSize:"13px", marginBottom:"16px" }}>
                Ou cliquez sur "Tous" pour voir et contacter tous les utilisateurs
              </div>
              <button onClick={()=>{ setOnglet("conversations"); setSideView("users"); }}
                style={{ padding:"9px 20px", background:"#00904C", color:"#fff", border:"none",
                  borderRadius:"8px", cursor:"pointer", fontWeight:700, fontSize:"13px", fontFamily:"Arial" }}>
                Voir tous les utilisateurs →
              </button>
            </div>
          ) : messagesActifs.length===0 ? (
            <div style={{ margin:"auto", textAlign:"center", color:"#6B9A7A" }}>
              <div style={{ fontSize:"40px", marginBottom:"12px" }}>️</div>
              <div style={{ fontWeight:600, fontSize:"14px", color:"#0A2410", marginBottom:"6px" }}>
                Nouvelle conversation avec {conversations[userActif]?.nom}
              </div>
              <div style={{ fontSize:"13px" }}>Envoyez un premier message.</div>
            </div>
          ) : messagesActifs.map((m,i)=>{
            const moi = m.role==="admin"||m.role==="manager";
            return (
              <div key={m.id||i} style={{ display:"flex", flexDirection:"column", alignItems:moi?"flex-end":"flex-start" }}>
                <div style={{ fontSize:"10px", color:"#6B9A7A", marginBottom:"3px", fontWeight:600 }}>
                  {moi ? "Vous (CCI-BF)" : m.expediteurNom}
                </div>
                <div style={S.bubble(moi)}>
                  <div style={{ fontSize:"14px", lineHeight:1.6 }}>{m.texte}</div>
                  <div style={{ fontSize:"10px", marginTop:"6px", color:moi?"rgba(255,255,255,0.6)":"#6B9A7A", textAlign:"right" }}>
                    {m.heure} {m.lu&&!moi?"":""}
                  </div>
                </div>
              </div>
            );
          })}
          {userActif && usersEcrivent[userActif] && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px", alignSelf:"flex-start" }}>
              <div style={{ padding:"10px 14px", background:"#fff", borderRadius:"4px 16px 16px 16px", border:"1px solid #E2EDE6", display:"flex", gap:"4px" }}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#00904C", animation:`bounce 1s ${i*0.2}s infinite` }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Zone saisie */}
        <div style={S.inputZone}>
          <textarea
            value={texte}
            onChange={handleTexteChange}
            onKeyDown={e => {
              if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); envoyer(); }
            }}
            placeholder={userActif ? "Écrire une réponse... (Shift+Entrée pour saut de ligne)" : "Sélectionnez un utilisateur d'abord"}
            disabled={!userActif}
            rows={1}
            style={{ flex:1, padding:"12px 16px", borderRadius:"12px",
              border:"1.5px solid #E2EDE6", fontSize:"14px", fontFamily:"inherit", outline:"none",
              background:userActif?"#fff":"#F5FAF7", color:"#0A2410",
              resize:"none", minHeight:"44px", maxHeight:"150px",
              overflowY:"auto", lineHeight:"1.5", boxSizing:"border-box" }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
            }}
          />
          <button onClick={envoyer} disabled={!texte.trim()||!userActif}
            style={{ padding:"12px 24px", borderRadius:"12px",
              background:texte.trim()&&userActif?"#00904C":"#E2EDE6",
              border:"none",
              color:texte.trim()&&userActif?"#fff":"#6B9A7A",
              fontWeight:700, fontSize:"14px",
              cursor:texte.trim()&&userActif?"pointer":"not-allowed",
              fontFamily:"inherit", flexShrink:0, alignSelf:"flex-end" }}>
            Envoyer 
          </button>
        </div>
      </div>

      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  );
}