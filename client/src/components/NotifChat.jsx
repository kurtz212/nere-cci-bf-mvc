// client/src/components/NotifChat.jsx
// Composant global — placé dans App.js pour écouter les messages même hors de la page Chat

import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export default function NotifChat() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const socketRef = useRef(null);
  const audioRef  = useRef(null);

  const [toasts, setToasts] = useState([]);   // [{ id, texte, de, role }]
  const [nonLus, setNonLus] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Ne pas afficher si on est déjà sur la page chat ou chat-admin
  const surPageChat = location.pathname === "/chat" || location.pathname === "/chat-admin";

  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, {
      query: {
        userId: user._id || user.id || "",
        role:   user.role || "user",
        prenom: user.prenom || "",
        nom:    user.nom || "",
      },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    // Écouter les messages entrants
    socket.on("message_recu", (msg) => {
      if (surPageChat) return; // déjà sur la page, pas de notif
      ajouterToast(msg);
      setNonLus(n => n+1);
      jouerSon();
    });

    socket.on("diffusion_recue", (msg) => {
      if (location.pathname === "/chat") return;
      ajouterToast({ ...msg, diffusion: true });
      setNonLus(n => n+1);
      jouerSon();
    });

    // Pour l'admin : messages des utilisateurs
    if (user.role === "admin" || user.role === "manager") {
      socket.on("message_recu", (msg) => {
        if (surPageChat) return;
        ajouterToast(msg);
        setNonLus(n => n+1);
        jouerSon();
      });
    }

    return () => socket.disconnect();
  }, [location.pathname]);

  // Réinitialiser non lus quand on va sur la page chat
  useEffect(() => {
    if (surPageChat) setNonLus(0);
  }, [surPageChat]);

  const ajouterToast = (msg) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      texte:    msg.texte,
      de:       msg.diffusion ? "📢 Annonce CCI-BF" : (msg.expediteurNom || "CCI-BF"),
      diffusion:!!msg.diffusion,
    };
    setToasts(t => [...t, toast]);
    // Auto-supprimer après 6s
    setTimeout(() => supprimerToast(id), 6000);
  };

  const supprimerToast = (id) => {
    setToasts(t => t.filter(x => x.id !== id));
  };

  const jouerSon = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const allerAuChat = () => {
    setNonLus(0);
    setToasts([]);
    if (user?.role === "admin" || user?.role === "manager") {
      navigate("/chat-admin");
    } else {
      navigate("/chat");
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Badge flottant sur le bouton chat si non lus */}
      {nonLus > 0 && !surPageChat && (
        <div
          onClick={allerAuChat}
          title={`${nonLus} nouveau${nonLus>1?"x":""} message${nonLus>1?"s":""}`}
          style={{
            position:"fixed", bottom:"90px", right:"28px", zIndex:1001,
            width:"52px", height:"52px", borderRadius:"50%",
            background:"#00904C", border:"3px solid #fff",
            boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
            cursor:"pointer", display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:"22px",
            animation:"notifPulse 1.5s ease-in-out infinite",
          }}>
          💬
          <div style={{
            position:"absolute", top:"-4px", right:"-4px",
            background:"#FF6B6B", color:"#fff",
            borderRadius:"100px", minWidth:"20px", height:"20px",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"11px", fontWeight:800, padding:"0 5px",
            border:"2px solid #fff",
            animation:"notifPop 0.4s ease both",
          }}>
            {nonLus > 9 ? "9+" : nonLus}
          </div>
        </div>
      )}

      {/* Toasts notification */}
      <div style={{
        position:"fixed", bottom:"24px", left:"24px", zIndex:1002,
        display:"flex", flexDirection:"column-reverse", gap:"10px",
        maxWidth:"340px",
      }}>
        {toasts.map(toast => (
          <div key={toast.id}
            style={{
              background:"#fff", borderRadius:"14px",
              boxShadow:"0 8px 32px rgba(0,0,0,0.15)",
              border:`2px solid ${toast.diffusion?"rgba(0,144,76,0.3)":"rgba(0,144,76,0.2)"}`,
              padding:"14px 16px", cursor:"pointer",
              animation:"toastIn 0.4s ease both",
              display:"flex", gap:"12px", alignItems:"flex-start",
            }}
            onClick={allerAuChat}>
            {/* Icône */}
            <div style={{
              width:"38px", height:"38px", borderRadius:"10px",
              background:toast.diffusion?"#E6F4EC":"#00904C",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"18px", flexShrink:0,
            }}>
              {toast.diffusion ? "📢" : "💬"}
            </div>
            {/* Contenu */}
            <div style={{flex:1,minWidth:0}}>
              <div style={{
                fontSize:"12px", fontWeight:700,
                color:toast.diffusion?"#00904C":"#0A2410",
                marginBottom:"3px",
              }}>
                {toast.de}
              </div>
              <div style={{
                fontSize:"13px", color:"#0A2410", lineHeight:1.4,
                overflow:"hidden", textOverflow:"ellipsis",
                display:"-webkit-box", WebkitLineClamp:2,
                WebkitBoxOrient:"vertical",
              }}>
                {toast.texte}
              </div>
              <div style={{fontSize:"11px",color:"#6B9A7A",marginTop:"5px",fontWeight:600}}>
                Cliquez pour répondre →
              </div>
            </div>
            {/* Fermer */}
            <button
              onClick={e=>{e.stopPropagation();supprimerToast(toast.id);}}
              style={{background:"none",border:"none",color:"#6B9A7A",cursor:"pointer",
                fontSize:"14px",padding:"0",flexShrink:0,lineHeight:1}}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes notifPulse {
          0%,100%{box-shadow:0 4px 20px rgba(0,144,76,0.3),0 0 0 0 rgba(0,144,76,0.4)}
          50%{box-shadow:0 4px 20px rgba(0,144,76,0.3),0 0 0 10px rgba(0,144,76,0)}
        }
        @keyframes notifPop {
          0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1}
        }
        @keyframes toastIn {
          from{transform:translateX(-60px);opacity:0} to{transform:translateX(0);opacity:1}
        }
      `}</style>
    </>
  );
}