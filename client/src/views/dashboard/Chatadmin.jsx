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

  // Conversations
  const [conversations, setConversations] = useState({}); // { userId: { nom, prenom, messages[], nonLus } }
  const [userActif, setUserActif]         = useState(null);
  const [usersConnectes, setUsersConnectes] = useState(new Set());
  const [usersEcrivent, setUsersEcrivent] = useState({});

  // Diffusion
  const [onglet, setOnglet]               = useState("conversations"); // "conversations" | "diffusion"
  const [texteDiff, setTexteDiff]         = useState("");
  const [ciblesMode, setCiblesMode]       = useState("tous"); // "tous" | "selection"
  const [usersSelect, setUsersSelect]     = useState(new Set());
  const [allUsers, setAllUsers]           = useState([]);
  const [diffusions, setDiffusions]       = useState([]);
  const [diffEnvoi, setDiffEnvoi]         = useState(false);
  const [diffMsg, setDiffMsg]             = useState({ texte:"", type:"" });

  // Message individuel
  const [texte, setTexte]                 = useState("");
  const [connecte, setConnecte]           = useState(false);

  // Charger tous les utilisateurs pour la diffusion ciblée
  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r=>r.json())
      .then(d => { if(d.success) setAllUsers(d.data.filter(u=>u.role!=="admin")); })
      .catch(()=>{});
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

    // Historique → grouper par userId
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

    // Nouveau message utilisateur
    socket.on("message_recu", (msg) => {
      const uid = (msg.role==="admin"||msg.role==="manager") ? msg.destinataireId : msg.expediteurId;
      if (!uid) return;
      setConversations(prev => {
        const conv = prev[uid] || { nom: msg.expediteurNom||"Utilisateur", messages:[], nonLus:0 };
        const dejaPresent = conv.messages.find(m=>m.id===msg.id);
        if (dejaPresent) return prev;
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

    // Confirmation envoi admin
    socket.on("message_envoye_admin", (msg) => {
      const uid = msg.destinataireId;
      if (!uid) return;
      setConversations(prev => {
        const conv = prev[uid] || { nom:"Utilisateur", messages:[], nonLus:0 };
        if (conv.messages.find(m=>m.id===msg.id)) return prev;
        return { ...prev, [uid]: { ...conv, messages:[...conv.messages, msg] }};
      });
    });

    // Diffusions
    socket.on("historique_diffusions", (msgs) => setDiffusions(msgs));
    socket.on("diffusion_envoyee", (msg) => setDiffusions(d=>[msg,...d]));

    // En train d'écrire
    socket.on("user_ecrit", ({ ecrit, userId: uid }) => {
      setUsersEcrivent(p=>({...p,[uid]:ecrit}));
    });

    // Connexions users
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

  const selectionnerUser = (uid) => {
    setUserActif(uid);
    setConversations(prev=>({
      ...prev,
      [uid]: { ...prev[uid], nonLus:0 }
    }));
    if (socketRef.current) {
      socketRef.current.emit("marquer_lu", { conversationUserId: uid });
    }
  };

  const envoyer = () => {
    if (!texte.trim() || !userActif || !socketRef.current) return;
    socketRef.current.emit("message_envoyer", {
      texte:         texte.trim(),
      expediteurId:  user._id||user.id||"",
      expediteurNom: `${user.prenom} ${user.nom}`,
      role:          user.role,
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
    setDiffMsg({ texte:` Message envoyé à ${ciblesMode==="tous"?"tous les utilisateurs":`${cibles.length} utilisateur(s) ciblé(s)`}`, type:"succes" });
    setTexteDiff(""); setUsersSelect(new Set()); setCiblesMode("tous");
    setDiffEnvoi(false);
    setTimeout(()=>setDiffMsg({texte:"",type:""}),4000);
  };

  const toggleUserSelect = (uid) => {
    setUsersSelect(prev => {
      const n = new Set(prev);
      n.has(uid) ? n.delete(uid) : n.add(uid);
      return n;
    });
  };

  const messagesActifs = userActif ? (conversations[userActif]?.messages||[]) : [];
  const totalNonLus = Object.values(conversations).reduce((s,c)=>s+(c.nonLus||0),0);

  const S = {
    container: { display:"flex", height:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F5FAF7" },
    sidebar:   { width:"300px", background:"#fff", borderRight:"1px solid #E2EDE6", display:"flex", flexDirection:"column" },
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
    }),
    inputZone: { padding:"16px 24px", background:"#fff", borderTop:"1px solid #E2EDE6", display:"flex", gap:"10px", flexShrink:0 },
  };

  if (!user || (user.role!=="admin"&&user.role!=="manager")) return null;

  return (
    <div style={S.container}>

      {/* ── SIDEBAR ── */}
      <div style={S.sidebar}>
        {/* Header sidebar */}
        <div style={S.sideHeader}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"16px",fontWeight:800,color:"#fff",marginBottom:"4px"}}>
            Chat Admin
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:"11px",color:"rgba(255,255,255,0.6)"}}>
              {Object.keys(conversations).length} conversation{Object.keys(conversations).length>1?"s":""}
              {totalNonLus>0 && <span style={{marginLeft:"6px",background:"#FF6B6B",color:"#fff",borderRadius:"100px",padding:"1px 7px",fontSize:"10px",fontWeight:800}}>{totalNonLus}</span>}
            </span>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:connecte?"#4DC97A":"#FF6B6B"}}/>
          </div>
        </div>

        {/* Onglets sidebar */}
        <div style={{display:"flex",borderBottom:"2px solid #E2EDE6",flexShrink:0}}>
          {[{key:"conversations",label:" Messages"},{key:"diffusion",label:" Diffusion"}].map(t=>(
            <button key={t.key} onClick={()=>setOnglet(t.key)}
              style={{flex:1,padding:"10px 6px",background:"transparent",border:"none",
                borderBottom:onglet===t.key?"3px solid #00904C":"3px solid transparent",
                color:onglet===t.key?"#00904C":"#6B9A7A",
                fontWeight:onglet===t.key?700:500,fontSize:"11px",cursor:"pointer",
                fontFamily:"inherit",marginBottom:"-2px"}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Liste conversations ── */}
        {onglet==="conversations" && (
          <div style={{flex:1,overflowY:"auto"}}>
            {Object.keys(conversations).length===0 ? (
              <div style={{padding:"32px 16px",textAlign:"center",color:"#6B9A7A",fontSize:"13px"}}>
                <div style={{fontSize:"32px",marginBottom:"8px"}}></div>
                Aucune conversation
              </div>
            ) : Object.entries(conversations).map(([uid,conv])=>(
              <div key={uid}
                onClick={()=>selectionnerUser(uid)}
                style={{padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:"12px",
                  background:userActif===uid?"#E6F4EC":"#fff",
                  borderBottom:"1px solid #F0F4F0",
                  borderLeft:userActif===uid?"3px solid #00904C":"3px solid transparent",
                  transition:"all 0.15s"}}>
                <div style={{position:"relative",flexShrink:0}}>
                  <div style={{width:"40px",height:"40px",borderRadius:"50%",background:"#E6F4EC",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:"14px",color:"#00904C"}}>
                    {conv.nom?.[0]?.toUpperCase()||"?"}
                  </div>
                  {usersConnectes.has(uid) && (
                    <div style={{position:"absolute",bottom:0,right:0,width:"10px",height:"10px",borderRadius:"50%",background:"#4DC97A",border:"2px solid #fff"}}/>
                  )}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{fontWeight:700,fontSize:"13px",color:"#0A2410",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{conv.nom}</div>
                    {conv.nonLus>0 && (
                      <span style={{background:"#FF6B6B",color:"#fff",borderRadius:"100px",padding:"1px 7px",fontSize:"10px",fontWeight:800,flexShrink:0}}>{conv.nonLus}</span>
                    )}
                  </div>
                  <div style={{fontSize:"11px",color:"#6B9A7A",marginTop:"2px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {usersEcrivent[uid] ? " En train d'écrire..." : (conv.messages[conv.messages.length-1]?.texte||"Aucun message")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Panneau diffusion ── */}
        {onglet==="diffusion" && (
          <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
            <div style={{marginBottom:"14px"}}>
              <div style={{fontWeight:700,fontSize:"13px",color:"#0A2410",marginBottom:"10px"}}>📢 Envoyer une annonce</div>

              {/* Mode ciblage */}
              <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
                {[{key:"tous",label:"Tous les utilisateurs"},{key:"selection",label:"Sélection ciblée"}].map(m=>(
                  <button key={m.key} onClick={()=>setCiblesMode(m.key)}
                    style={{flex:1,padding:"7px",borderRadius:"8px",border:`1.5px solid ${ciblesMode===m.key?"#00904C":"#E2EDE6"}`,background:ciblesMode===m.key?"#E6F4EC":"transparent",color:ciblesMode===m.key?"#00904C":"#6B9A7A",fontSize:"11px",fontWeight:ciblesMode===m.key?700:500,cursor:"pointer",fontFamily:"inherit"}}>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Sélection utilisateurs */}
              {ciblesMode==="selection" && (
                <div style={{marginBottom:"12px",maxHeight:"150px",overflowY:"auto",border:"1px solid #E2EDE6",borderRadius:"10px"}}>
                  {allUsers.length===0 ? (
                    <div style={{padding:"12px",color:"#6B9A7A",fontSize:"12px",textAlign:"center"}}>Chargement...</div>
                  ) : allUsers.map(u=>(
                    <div key={u._id} onClick={()=>toggleUserSelect(u._id)}
                      style={{display:"flex",alignItems:"center",gap:"10px",padding:"9px 12px",cursor:"pointer",background:usersSelect.has(u._id)?"#E6F4EC":"#fff",borderBottom:"1px solid #F5F5F5",transition:"all 0.15s"}}>
                      <div style={{width:"20px",height:"20px",borderRadius:"4px",border:`2px solid ${usersSelect.has(u._id)?"#00904C":"#D0D0D0"}`,background:usersSelect.has(u._id)?"#00904C":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {usersSelect.has(u._id) && <span style={{color:"#fff",fontSize:"12px",lineHeight:1}}>✓</span>}
                      </div>
                      <div style={{fontSize:"12px",color:"#0A2410",fontWeight:usersSelect.has(u._id)?600:400}}>{u.prenom} {u.nom}</div>
                      {usersConnectes.has(u._id) && <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#4DC97A",flexShrink:0,marginLeft:"auto"}}/>}
                    </div>
                  ))}
                </div>
              )}
              {ciblesMode==="selection" && (
                <div style={{fontSize:"11px",color:"#6B9A7A",marginBottom:"10px"}}>
                  {usersSelect.size} utilisateur{usersSelect.size>1?"s":""} sélectionné{usersSelect.size>1?"s":""}
                </div>
              )}

              {/* Message */}
              <textarea value={texteDiff} onChange={e=>setTexteDiff(e.target.value)}
                placeholder="Rédigez votre annonce..."
                style={{width:"100%",padding:"10px 12px",borderRadius:"10px",border:"1.5px solid #E2EDE6",fontSize:"13px",fontFamily:"inherit",outline:"none",resize:"vertical",minHeight:"90px",boxSizing:"border-box",color:"#0A2410"}}/>

              {diffMsg.texte && (
                <div style={{marginTop:"8px",padding:"8px 12px",borderRadius:"8px",fontSize:"12px",background:diffMsg.type==="succes"?"#E8F5EE":"#FFF0F0",color:diffMsg.type==="succes"?"#00904C":"#CC3333"}}>
                  {diffMsg.texte}
                </div>
              )}

              <button onClick={envoyerDiffusion}
                disabled={!texteDiff.trim()||(ciblesMode==="selection"&&usersSelect.size===0)||diffEnvoi}
                style={{width:"100%",marginTop:"10px",padding:"11px",borderRadius:"10px",background:texteDiff.trim()&&(ciblesMode==="tous"||usersSelect.size>0)?"#00904C":"#E2EDE6",border:"none",color:texteDiff.trim()&&(ciblesMode==="tous"||usersSelect.size>0)?"#fff":"#6B9A7A",fontWeight:700,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
                 {ciblesMode==="tous"?"Envoyer à tous":`Envoyer à ${usersSelect.size} utilisateur${usersSelect.size>1?"s":""}`}
              </button>
            </div>

            {/* Historique diffusions */}
            <div style={{borderTop:"1px solid #E2EDE6",paddingTop:"14px"}}>
              <div style={{fontWeight:700,fontSize:"12px",color:"#6B9A7A",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"10px"}}>Annonces envoyées</div>
              {diffusions.length===0 ? (
                <div style={{textAlign:"center",color:"#6B9A7A",fontSize:"12px",padding:"12px"}}>Aucune annonce</div>
              ) : diffusions.map((d,i)=>(
                <div key={d.id||i} style={{padding:"10px 12px",background:"#F5FAF7",borderRadius:"8px",marginBottom:"8px",border:"1px solid #E2EDE6"}}>
                  <div style={{fontSize:"11px",color:"#6B9A7A",marginBottom:"4px"}}>
                    {d.cibles?.length>0 ? `${d.cibles.length} utilisateur(s) ciblé(s)` : "Tous les utilisateurs"} · {d.date} {d.heure}
                  </div>
                  <div style={{fontSize:"12px",color:"#0A2410",lineHeight:1.5,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{d.texte}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retour */}
        <div style={{padding:"12px 16px",borderTop:"1px solid #E2EDE6",flexShrink:0}}>
          <button onClick={()=>navigate("/admin")}
            style={{width:"100%",padding:"10px",borderRadius:"8px",background:"#ffffff",border:"none",color:"#00904C",fontWeight:600,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
             Retour au dashboard
          </button>

          <button onClick={()=>navigate("/")}
            style={{width:"100%",padding:"10px",borderRadius:"8px",background:"#ffffff",border:"none",color:"#00904C",fontWeight:600,fontSize:"13px",cursor:"pointer",fontFamily:"inherit"}}>
             Retour à l'accueil
          </button>
        </div>
      </div>

      {/* ── ZONE PRINCIPALE ── */}
      <div style={S.main}>

        {/* Topbar */}
        <div style={S.topbar}>
          {userActif ? (
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <div style={{position:"relative"}}>
                <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"#E6F4EC",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#00904C"}}>
                  {conversations[userActif]?.nom?.[0]?.toUpperCase()}
                </div>
                {usersConnectes.has(userActif) && (
                  <div style={{position:"absolute",bottom:0,right:0,width:"10px",height:"10px",borderRadius:"50%",background:"#4DC97A",border:"2px solid #fff"}}/>
                )}
              </div>
              <div>
                <div style={{fontWeight:700,fontSize:"14px",color:"#0A2410"}}>{conversations[userActif]?.nom}</div>
                <div style={{fontSize:"11px",color:"#6B9A7A"}}>
                  {usersEcrivent[userActif] ? " En train d'écrire..." : usersConnectes.has(userActif) ? "🟢 En ligne" : "⚫ Hors ligne"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{fontSize:"14px",color:"#6B9A7A"}}>
              {onglet==="diffusion" ? " Panneau de diffusion" : "Sélectionnez une conversation"}
            </div>
          )}
          <div style={{fontSize:"12px",color:connecte?"#00904C":"#FF6B6B",fontWeight:600}}>
            {connecte?"🟢 Connecté":"🔴 Déconnecté"}
          </div>
        </div>

        {/* Messages */}
        <div style={S.messages}>
          {!userActif ? (
            <div style={{margin:"auto",textAlign:"center",color:"#6B9A7A"}}>
              <div style={{fontSize:"48px",marginBottom:"16px"}}></div>
              <div style={{fontSize:"15px",fontWeight:600,marginBottom:"8px"}}>Choisissez une conversation</div>
              <div style={{fontSize:"13px"}}>ou utilisez le panneau Diffusion pour envoyer une annonce</div>
            </div>
          ) : messagesActifs.length===0 ? (
            <div style={{margin:"auto",textAlign:"center",color:"#6B9A7A"}}>
              <div style={{fontSize:"32px",marginBottom:"8px"}}></div>
              Aucun message
            </div>
          ) : messagesActifs.map((m,i)=>{
            const moi = m.role==="admin"||m.role==="manager";
            return (
              <div key={m.id||i} style={{display:"flex",flexDirection:"column",alignItems:moi?"flex-end":"flex-start"}}>
                <div style={{fontSize:"10px",color:"#6B9A7A",marginBottom:"3px",fontWeight:600}}>
                  {moi?"Vous (CCI-BF)":m.expediteurNom}
                </div>
                <div style={S.bubble(moi)}>
                  <div style={{fontSize:"14px",lineHeight:1.6}}>{m.texte}</div>
                  <div style={{fontSize:"10px",marginTop:"6px",color:moi?"rgba(255,255,255,0.6)":"#6B9A7A",textAlign:"right"}}>
                    {m.heure} {m.lu&&!moi?"✓✓":""}
                  </div>
                </div>
              </div>
            );
          })}
          {userActif && usersEcrivent[userActif] && (
            <div style={{display:"flex",alignItems:"center",gap:"8px",alignSelf:"flex-start"}}>
              <div style={{padding:"10px 14px",background:"#fff",borderRadius:"4px 16px 16px 16px",border:"1px solid #E2EDE6",display:"flex",gap:"4px"}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00904C",animation:`bounce 1s ${i*0.2}s infinite`}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Zone saisie */}
        <div style={S.inputZone}>
          <input value={texte} onChange={handleTexteChange}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&envoyer()}
            placeholder={userActif?"Écrire une réponse...":"Sélectionnez une conversation d'abord"}
            disabled={!userActif}
            style={{flex:1,padding:"12px 16px",borderRadius:"12px",border:"1.5px solid #E2EDE6",fontSize:"14px",fontFamily:"inherit",outline:"none",background:userActif?"#fff":"#F5FAF7",color:"#0A2410"}}/>
          <button onClick={envoyer} disabled={!texte.trim()||!userActif}
            style={{padding:"12px 24px",borderRadius:"12px",background:texte.trim()&&userActif?"#00904C":"#E2EDE6",border:"none",color:texte.trim()&&userActif?"#fff":"#6B9A7A",fontWeight:700,fontSize:"14px",cursor:texte.trim()&&userActif?"pointer":"not-allowed",fontFamily:"inherit",transition:"all 0.2s"}}>
            Envoyer 
          </button>
        </div>
      </div>

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}