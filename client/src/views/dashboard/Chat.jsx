import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../../styles/dashboard.css";

const SOCKET_URL = "http://localhost:5000";

export default function Chat() {
  const navigate   = useNavigate();
  const user       = JSON.parse(localStorage.getItem("user") || "null");
  const socketRef  = useRef(null);
  const endRef     = useRef(null);

  const [messages, setMessages]       = useState([]);
  const [diffusions, setDiffusions]   = useState([]);
  const [texte, setTexte]             = useState("");
  const [connecte, setConnecte]       = useState(false);
  const [adminEnLigne, setAdminEnLigne] = useState(false);
  const [adminEcrit, setAdminEcrit]   = useState(false);
  const [onglet, setOnglet]           = useState("chat"); // "chat" | "diffusions"

  useEffect(() => {
    if (!user) { navigate("/connexion"); return; }

    const socket = io(SOCKET_URL, {
      query: { userId: user._id||user.id||"", role: user.role||"user", prenom: user.prenom||"", nom: user.nom||"" },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnecte(true);
      socket.emit("charger_historique", { userId: user._id||user.id, role: user.role });
      socket.emit("charger_diffusions");
    });
    socket.on("disconnect", () => setConnecte(false));

    socket.on("historique", (msgs) => setMessages(msgs));
    socket.on("historique_diffusions", (msgs) => setDiffusions(msgs));

    socket.on("message_recu", (msg) => {
      setMessages(m => [...m, msg]);
      setAdminEcrit(false);
    });
    socket.on("message_envoye", (msg) => {
      setMessages(m => {
        if (m.find(x => x.id === msg.id)) return m;
        return [...m, msg];
      });
    });
    socket.on("diffusion_recue", (msg) => {
      setDiffusions(d => [msg, ...d]);
    });

    socket.on("admin_statut", ({ enLigne }) => setAdminEnLigne(enLigne));
    socket.on("admin_ecrit",  ({ ecrit })   => setAdminEcrit(ecrit));

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminEcrit]);

  const envoyer = () => {
    if (!texte.trim() || !socketRef.current) return;
    socketRef.current.emit("message_envoyer", {
      texte:         texte.trim(),
      expediteurId:  user._id || user.id || "",
      expediteurNom: `${user.prenom} ${user.nom}`,
      role:          user.role || "user",
      destinataireId: null,
    });
    socketRef.current.emit("stop_ecrit", { role: user.role, userId: user._id||user.id });
    setTexte("");
  };

  const handleTexteChange = (e) => {
    setTexte(e.target.value);
    if (socketRef.current) {
      socketRef.current.emit("ecrit", {
        role: user.role, userId: user._id||user.id, nom: `${user.prenom} ${user.nom}`
      });
    }
  };

  const S = {
    container: { display:"flex", flexDirection:"column", height:"100vh",
      fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F5FAF7" },
    header: { background:"#00904C", padding:"0 24px", height:"60px",
      display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
    messages: { flex:1, overflowY:"auto", padding:"20px 24px",
      display:"flex", flexDirection:"column", gap:"10px" },
    bubble: (estMoi) => ({
      maxWidth:"65%", padding:"12px 16px",
      borderRadius: estMoi ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
      background:   estMoi ? "#00904C" : "#fff",
      color:        estMoi ? "#fff"    : "#0A2410",
      boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
      alignSelf:    estMoi ? "flex-end" : "flex-start",
      border:       estMoi ? "none"    : "1px solid #E2EDE6",
    }),
    inputZone: { padding:"16px 24px", background:"#fff",
      borderTop:"1px solid #E2EDE6", display:"flex", gap:"10px", flexShrink:0 },
  };

  const estMoi = (msg) =>
    msg.expediteurId === (user._id||user.id) ||
    msg.role === user.role && msg.expediteurNom === `${user.prenom} ${user.nom}`;

  if (!user) return null;

  return (
    <div style={S.container}>

      {/* Header */}
      <div style={S.header}>
        <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
          <button onClick={()=>navigate("/")}
            style={{background:"rgba(255,255,255,0.1)",border:"none",borderRadius:"8px",padding:"7px 12px",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:"13px"}}>
            ← Accueil
          </button>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:"18px",fontWeight:800,color:"#fff"}}>
            Messagerie NERE
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"12px",color:adminEnLigne?"#4DC97A":"rgba(255,255,255,0.5)",fontWeight:600}}>
            <div style={{width:"8px",height:"8px",borderRadius:"50%",background:adminEnLigne?"#4DC97A":"rgba(255,255,255,0.3)"}}/>
            {adminEnLigne?"CCI-BF en ligne":"CCI-BF hors ligne"}
          </div>
          <div style={{width:"8px",height:"8px",borderRadius:"50%",background:connecte?"#4DC97A":"#FF6B6B"}}/>
        </div>
      </div>

      {/* Onglets */}
      <div style={{display:"flex",borderBottom:"2px solid #E2EDE6",background:"#fff",flexShrink:0}}>
        {[{key:"chat",label:" Mes messages"},{key:"diffusions",label:` Annonces (${diffusions.length})`}].map(t=>(
          <button key={t.key} onClick={()=>setOnglet(t.key)}
            style={{flex:1,padding:"12px",background:"transparent",border:"none",
              borderBottom:onglet===t.key?"3px solid #00904C":"3px solid transparent",
              color:onglet===t.key?"#00904C":"#6B9A7A",
              fontWeight:onglet===t.key?700:500,
              fontSize:"13px",cursor:"pointer",fontFamily:"inherit",marginBottom:"-2px"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ONGLET CHAT ── */}
      {onglet === "chat" && (
        <>
          <div style={S.messages}>
            {messages.length === 0 && (
              <div style={{margin:"auto",textAlign:"center",color:"#6B9A7A"}}>
                <div style={{fontSize:"48px",marginBottom:"12px"}}>💬</div>
                <div style={{fontSize:"15px",fontWeight:600}}>Commencez la conversation</div>
                <div style={{fontSize:"13px",marginTop:"6px"}}>Un agent CCI-BF vous répondra dès que possible</div>
              </div>
            )}
            {messages.map((m,i) => {
              const moi = estMoi(m);
              return (
                <div key={m.id||i} style={{display:"flex",flexDirection:"column",alignItems:moi?"flex-end":"flex-start"}}>
                  <div style={{fontSize:"10px",color:"#6B9A7A",marginBottom:"3px",fontWeight:600}}>
                    {moi ? "Vous" : m.expediteurNom || "CCI-BF"}
                  </div>
                  <div style={S.bubble(moi)}>
                    <div style={{fontSize:"14px",lineHeight:1.6}}>{m.texte}</div>
                    <div style={{fontSize:"10px",marginTop:"6px",color:moi?"rgba(255,255,255,0.6)":"#6B9A7A",textAlign:"right"}}>
                      {m.heure}
                    </div>
                  </div>
                </div>
              );
            })}
            {adminEcrit && (
              <div style={{display:"flex",alignItems:"center",gap:"8px",alignSelf:"flex-start"}}>
                <div style={{padding:"10px 14px",background:"#fff",borderRadius:"4px 16px 16px 16px",border:"1px solid #E2EDE6",display:"flex",gap:"4px"}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:"#00904C",animation:`bounce 1s ${i*0.2}s infinite`}}/>
                  ))}
                </div>
                <span style={{fontSize:"11px",color:"#6B9A7A"}}>CCI-BF écrit...</span>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Zone saisie */}
          <div style={S.inputZone}>
            <input value={texte} onChange={handleTexteChange}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&envoyer()}
              placeholder="Écrivez votre message à la CCI-BF..."
              style={{flex:1,padding:"12px 16px",borderRadius:"12px",border:"1.5px solid #E2EDE6",fontSize:"14px",fontFamily:"inherit",outline:"none",color:"#0A2410"}}/>
            <button onClick={envoyer} disabled={!texte.trim()}
              style={{padding:"12px 24px",borderRadius:"12px",background:texte.trim()?"#00904C":"#E2EDE6",border:"none",color:texte.trim()?"#fff":"#6B9A7A",fontWeight:700,fontSize:"14px",cursor:texte.trim()?"pointer":"not-allowed",fontFamily:"inherit",transition:"all 0.2s"}}>
              Envoyer →
            </button>
          </div>
        </>
      )}

      {/* ── ONGLET DIFFUSIONS ── */}
      {onglet === "diffusions" && (
        <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
          {diffusions.length === 0 ? (
            <div style={{textAlign:"center",padding:"40px",color:"#6B9A7A"}}>
              <div style={{fontSize:"48px",marginBottom:"12px"}}></div>
              <div style={{fontSize:"15px",fontWeight:600}}>Aucune annonce pour le moment</div>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              {diffusions.map((d,i)=>(
                <div key={d.id||i} style={{background:"#fff",borderRadius:"14px",padding:"18px 20px",border:"2px solid rgba(0,144,76,0.15)",boxShadow:"0 2px 8px rgba(0,144,76,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <div style={{width:"32px",height:"32px",borderRadius:"8px",background:"#E6F4EC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>📢</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:"13px",color:"#00904C"}}>Annonce CCI-BF</div>
                        <div style={{fontSize:"11px",color:"#6B9A7A"}}>{d.expediteurNom}</div>
                      </div>
                    </div>
                    <div style={{fontSize:"11px",color:"#6B9A7A"}}>{d.date} · {d.heure}</div>
                  </div>
                  <div style={{fontSize:"14px",color:"#0A2410",lineHeight:1.7}}>{d.texte}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
    </div>
  );
}