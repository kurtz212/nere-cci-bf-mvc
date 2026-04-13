import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../../styles/dashboard.css";

const SOCKET_URL = "http://localhost:5000";

export default function ChatAdmin() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState({}); // { userId: { nom, messages:[] } }
  const [userActif, setUserActif]         = useState(null); // userId sélectionné
  const [texte, setTexte]                 = useState("");
  const [usersEcrivent, setUsersEcrivent] = useState({}); // { userId: true/false }
  const [connecte, setConnecte]           = useState(false);

  // Redirection si pas admin
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "manager")) {
      navigate("/");
    }
  }, []);

  // Connexion Socket.io
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, {
      query: { userId: user._id||user.id||"", role: user.role, prenom: user.prenom, nom: user.nom },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnecte(true);
      socket.emit("charger_historique", { userId: user._id||user.id, role: user.role });
    });

    socket.on("disconnect", () => setConnecte(false));

    // Historique complet → grouper par utilisateur
    socket.on("historique", (msgs) => {
      const convs = {};
      msgs.forEach(m => {
        // Déterminer l'userId de la conversation
        const uid  = m.role === "admin" || m.role === "manager"
          ? m.destinataireId
          : m.expediteurId;
        const nom  = m.role === "admin" || m.role === "manager"
          ? (m.destinataireNom || "Utilisateur")
          : m.expediteurNom;
        if (!uid) return;
        if (!convs[uid]) convs[uid] = { nom, messages:[], nonLus:0 };
        convs[uid].messages.push(m);
        if (!m.lu && (m.role !== "admin")) convs[uid].nonLus++;
      });
      setConversations(convs);
    });

    // Nouveau message reçu
    socket.on("message_recu", (msg) => {
      const uid = msg.role === "admin" || msg.role === "manager"
        ? msg.destinataireId
        : msg.expediteurId;
      const nom = msg.role === "admin" || msg.role === "manager"
        ? "Utilisateur"
        : msg.expediteurNom;
      if (!uid) return;
      setConversations(prev => {
        const conv = prev[uid] || { nom, messages:[], nonLus:0 };
        return {
          ...prev,
          [uid]: {
            ...conv,
            nom: msg.role !== "admin" ? msg.expediteurNom : conv.nom,
            messages: [...conv.messages, msg],
            nonLus: userActif === uid ? 0 : conv.nonLus + (msg.role !== "admin" ? 1 : 0),
          }
        };
      });
    });

    // Message envoyé confirmé
    socket.on("message_envoye", (msg) => {
      const uid = msg.destinataireId;
      if (!uid) return;
      setConversations(prev => {
        const conv = prev[uid] || { nom:"Utilisateur", messages:[], nonLus:0 };
        // Éviter doublon
        if (conv.messages.find(m => m.id === msg.id)) return prev;
        return { ...prev, [uid]: { ...conv, messages:[...conv.messages, msg] }};
      });
    });

    // Indicateur "en train d'écrire"
    socket.on("user_ecrit", ({ ecrit, userId: uid, nom }) => {
      setUsersEcrivent(prev => ({ ...prev, [uid]: ecrit }));
    });

    return () => socket.disconnect();
  }, [user?._id]);

  // Scroll auto
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [conversations, userActif]);

  const messagesActifs = userActif ? (conversations[userActif]?.messages || []) : [];

  const envoyer = () => {
    if (!texte.trim() || !userActif || !socketRef.current) return;
    socketRef.current.emit("message_envoyer", {
      texte:         texte.trim(),
      expediteurId:  user._id || user.id,
      expediteurNom: `${user.prenom} ${user.nom}`,
      role:          user.role,
      destinataireId: userActif,
    });
    socketRef.current.emit("stop_ecrit", { role: user.role, userId: userActif });
    setTexte("");
  };

  const handleTexteChange = (e) => {
    setTexte(e.target.value);
    if (socketRef.current && userActif) {
      socketRef.current.emit("ecrit", { role: user.role, userId: userActif, nom: `${user.prenom} ${user.nom}` });
    }
  };

  const selectionnerUser = (uid) => {
    setUserActif(uid);
    // Marquer comme lu
    setConversations(prev => ({
      ...prev,
      [uid]: { ...prev[uid], nonLus: 0 }
    }));
  };

  const totalNonLus = Object.values(conversations).reduce((s, c) => s + (c.nonLus||0), 0);

  const S = {
    container: { display:"flex", height:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif",
      background:"#F5FAF7" },
    sidebar: { width:"300px", background:"#fff", borderRight:"1px solid #E2EDE6",
      display:"flex", flexDirection:"column" },
    sideHeader: { padding:"20px", background:"#00904C", display:"flex",
      alignItems:"center", justifyContent:"space-between" },
    conv: (actif) => ({ padding:"14px 16px", cursor:"pointer", display:"flex",
      alignItems:"center", gap:"12px",
      background: actif ? "#E6F4EC" : "#fff",
      borderBottom:"1px solid #F0F4F0",
      borderLeft: actif ? "3px solid #00904C" : "3px solid transparent",
      transition:"all 0.15s" }),
    main: { flex:1, display:"flex", flexDirection:"column" },
    topbar: { padding:"0 24px", height:"60px", background:"#fff",
      borderBottom:"1px solid #E2EDE6", display:"flex",
      alignItems:"center", justifyContent:"space-between" },
    messages: { flex:1, overflowY:"auto", padding:"20px 24px",
      display:"flex", flexDirection:"column", gap:"12px" },
    bubble: (role) => ({
      maxWidth:"65%", padding:"12px 16px", borderRadius:
        role==="admin"||role==="manager" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
      background: role==="admin"||role==="manager" ? "#00904C" : "#fff",
      color:       role==="admin"||role==="manager" ? "#fff" : "#0A2410",
      boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
      alignSelf:   role==="admin"||role==="manager" ? "flex-end" : "flex-start",
      border:      role==="admin"||role==="manager" ? "none" : "1px solid #E2EDE6",
    }),
    inputZone: { padding:"16px 24px", background:"#fff",
      borderTop:"1px solid #E2EDE6", display:"flex", gap:"10px" },
  };

  if (!user || (user.role !== "admin" && user.role !== "manager")) return null;

  return (
    <div style={S.container}>

      {/* ── SIDEBAR CONVERSATIONS ── */}
      <div style={S.sidebar}>
        {/* Header */}
        <div style={S.sideHeader}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif", fontSize:"16px",
              fontWeight:800, color:"#fff"}}>
              Chat Admin
            </div>
            <div style={{fontSize:"11px", color:"rgba(255,255,255,0.6)", marginTop:"2px"}}>
              {Object.keys(conversations).length} conversation{Object.keys(conversations).length>1?"s":""}
              {totalNonLus > 0 && (
                <span style={{marginLeft:"6px", background:"#FF6B6B", color:"#fff",
                  borderRadius:"100px", padding:"1px 7px", fontSize:"10px", fontWeight:800}}>
                  {totalNonLus} non lu{totalNonLus>1?"s":""}
                </span>
              )}
            </div>
          </div>
          <div style={{width:"8px", height:"8px", borderRadius:"50%",
            background: connecte ? "#4DC97A" : "#FF6B6B"}}/>
        </div>

        {/* Liste conversations */}
        <div style={{flex:1, overflowY:"auto"}}>
          {Object.keys(conversations).length === 0 ? (
            <div style={{padding:"32px 16px", textAlign:"center", color:"#6B9A7A", fontSize:"13px"}}>
              <div style={{fontSize:"32px", marginBottom:"8px"}}>💬</div>
              Aucune conversation pour l'instant
            </div>
          ) : (
            Object.entries(conversations).map(([uid, conv]) => (
              <div key={uid} style={S.conv(userActif===uid)}
                onClick={() => selectionnerUser(uid)}>
                {/* Avatar */}
                <div style={{width:"40px", height:"40px", borderRadius:"50%",
                  background:"#E6F4EC", display:"flex", alignItems:"center",
                  justifyContent:"center", fontWeight:800, fontSize:"14px",
                  color:"#00904C", flexShrink:0}}>
                  {conv.nom?.[0]?.toUpperCase() || "?"}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:"flex", justifyContent:"space-between",
                    alignItems:"center"}}>
                    <div style={{fontWeight:700, fontSize:"13px", color:"#0A2410",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                      {conv.nom}
                    </div>
                    {conv.nonLus > 0 && (
                      <span style={{background:"#FF6B6B", color:"#fff",
                        borderRadius:"100px", padding:"1px 7px",
                        fontSize:"10px", fontWeight:800, flexShrink:0}}>
                        {conv.nonLus}
                      </span>
                    )}
                  </div>
                  <div style={{fontSize:"11px", color:"#6B9A7A", marginTop:"2px",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                    {usersEcrivent[uid]
                      ? "✏️ En train d'écrire..."
                      : conv.messages[conv.messages.length-1]?.texte || "Aucun message"
                    }
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Retour */}
        <div style={{padding:"12px 16px", borderTop:"1px solid #E2EDE6"}}>
          <button onClick={() => navigate("/admin")}
            style={{width:"100%", padding:"10px", borderRadius:"8px",
              background:"#E6F4EC", border:"none", color:"#00904C",
              fontWeight:600, fontSize:"13px", cursor:"pointer",fontFamily:"inherit"}}>
            ← Retour au dashboard
          </button>
        </div>
      </div>

      {/* ── ZONE PRINCIPALE ── */}
      <div style={S.main}>

        {/* Topbar */}
        <div style={S.topbar}>
          {userActif ? (
            <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
              <div style={{width:"36px", height:"36px", borderRadius:"50%",
                background:"#E6F4EC", display:"flex", alignItems:"center",
                justifyContent:"center", fontWeight:800, color:"#00904C"}}>
                {conversations[userActif]?.nom?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{fontWeight:700, fontSize:"14px", color:"#0A2410"}}>
                  {conversations[userActif]?.nom}
                </div>
                <div style={{fontSize:"11px", color:"#6B9A7A"}}>
                  {usersEcrivent[userActif] ? "✏️ En train d'écrire..." : "Utilisateur"}
                </div>
              </div>
            </div>
          ) : (
            <div style={{fontSize:"14px", color:"#6B9A7A"}}>
              Sélectionnez une conversation
            </div>
          )}
          <div style={{fontSize:"12px", color: connecte ? "#00904C" : "#FF6B6B", fontWeight:600}}>
            {connecte ? "🟢 Connecté" : "🔴 Déconnecté"}
          </div>
        </div>

        {/* Messages */}
        <div style={S.messages}>
          {!userActif ? (
            <div style={{margin:"auto", textAlign:"center", color:"#6B9A7A"}}>
              <div style={{fontSize:"48px", marginBottom:"16px"}}>💬</div>
              <div style={{fontSize:"15px", fontWeight:600}}>
                Sélectionnez une conversation pour répondre
              </div>
            </div>
          ) : messagesActifs.length === 0 ? (
            <div style={{margin:"auto", textAlign:"center", color:"#6B9A7A"}}>
              <div style={{fontSize:"32px", marginBottom:"8px"}}>💬</div>
              Aucun message dans cette conversation
            </div>
          ) : (
            messagesActifs.map((m, i) => (
              <div key={m.id || i} style={{display:"flex",
                flexDirection:"column",
                alignItems: m.role==="admin"||m.role==="manager" ? "flex-end" : "flex-start"}}>
                {/* Nom expéditeur */}
                <div style={{fontSize:"10px", color:"#6B9A7A", marginBottom:"3px",
                  fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em"}}>
                  {m.role==="admin"||m.role==="manager" ? "Vous" : m.expediteurNom}
                </div>
                <div style={S.bubble(m.role)}>
                  <div style={{fontSize:"14px", lineHeight:1.6}}>{m.texte}</div>
                  <div style={{fontSize:"10px", marginTop:"6px",
                    color: m.role==="admin"||m.role==="manager"
                      ? "rgba(255,255,255,0.6)" : "#6B9A7A",
                    textAlign:"right"}}>
                    {m.heure}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Indicateur "en train d'écrire" */}
          {userActif && usersEcrivent[userActif] && (
            <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
              <div style={{display:"flex", gap:"4px", padding:"10px 14px",
                background:"#fff", borderRadius:"4px 16px 16px 16px",
                border:"1px solid #E2EDE6"}}>
                {[0,1,2].map(i => (
                  <div key={i} style={{width:"6px", height:"6px", borderRadius:"50%",
                    background:"#00904C", animation:`bounce 1s ${i*0.2}s infinite`}}/>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Zone de saisie */}
        <div style={S.inputZone}>
          <input
            value={texte}
            onChange={handleTexteChange}
            onKeyDown={e => e.key==="Enter" && !e.shiftKey && envoyer()}
            placeholder={userActif ? "Écrire une réponse..." : "Sélectionnez une conversation d'abord"}
            disabled={!userActif}
            style={{flex:1, padding:"12px 16px", borderRadius:"12px",
              border:"1.5px solid #E2EDE6", fontSize:"14px",
              fontFamily:"inherit", outline:"none",
              background: userActif ? "#fff" : "#F5FAF7",
              color:"#0A2410"}}/>
          <button onClick={envoyer} disabled={!texte.trim() || !userActif}
            style={{padding:"12px 24px", borderRadius:"12px",
              background: texte.trim() && userActif ? "#00904C" : "#E2EDE6",
              border:"none", color: texte.trim() && userActif ? "#fff" : "#6B9A7A",
              fontWeight:700, fontSize:"14px", cursor: texte.trim() && userActif ? "pointer" : "not-allowed",
              fontFamily:"inherit", transition:"all 0.2s"}}>
            Envoyer →
          </button>
        </div>

        <style>{`
          @keyframes bounce {
            0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)}
          }
        `}</style>
      </div>
    </div>
  );
}