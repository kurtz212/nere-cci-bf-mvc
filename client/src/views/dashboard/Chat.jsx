import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.png";

const SOCKET_URL = "http://localhost:5000";

const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",     path:"/chat",         key:"messages"     },
];

const NAVBAR_CSS = `
  * { font-family: Arial, Helvetica, sans-serif !important; }
  .nere-navbar-ch {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; height: 120px;
    background: #00904C;
    box-shadow: 0 2px 16px rgba(0,0,0,0.15);
    flex-shrink: 0;
  }
  .nere-navbar-ch .nav-pill {
    display: flex; align-items: center; gap: 3px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 100px; padding: 5px 8px;
    margin-left: auto; margin-right: 20px;
  }
  .nere-navbar-ch .nav-pill .nav-btn {
    padding: 7px 15px; border-radius: 100px;
    font-size: 20px; font-weight: 600;
    color: rgba(255,255,255,0.78); cursor: pointer;
    transition: all 0.18s; white-space: nowrap;
    border: none; background: transparent;
    font-family: Arial, Helvetica, sans-serif;
  }
  .nere-navbar-ch .nav-pill .nav-btn:hover {
    color: #fff; background: rgba(255,255,255,0.12);
  }
  .nere-navbar-ch .nav-pill .nav-btn.active {
    color: #0A3D1F; background: #4DC97A;
    font-weight: 700; box-shadow: 0 2px 8px rgba(77,201,122,0.4);
  }
  .nere-navbar-ch .u-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 12px 5px 5px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 100px; cursor: pointer;
    color: #fff; font-size: 13px; font-weight: 600;
    transition: all 0.2s; flex-shrink: 0;
  }
  .nere-navbar-ch .u-chip:hover { background: rgba(255,255,255,0.18); }
  .nere-navbar-ch .u-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: #4DC97A; color: #0A3D1F;
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; font-size: 12px; flex-shrink: 0;
  }
  .nere-dropdown-ch {
    position: absolute; z-index: 9999;
    top: calc(100% + 10px); right: 0;
    background: #fff; border-radius: 16px;
    border: 1px solid #E2EDE6; min-width: 220px;
    overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.14);
    animation: dropInCh 0.18s ease;
  }
  @keyframes dropInCh {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .nere-dropdown-ch .dd-head {
    padding: 14px 18px 10px; border-bottom: 1px solid #F0F4F1;
    background: linear-gradient(135deg,#F5FAF7,#fff);
  }
  .nere-dropdown-ch .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
  .nere-dropdown-ch .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
  .nere-dropdown-ch .dd-role  {
    display:inline-flex; align-items:center; gap:5px; margin-top:6px;
    background:#E8F5EE; color:#00904C; border-radius:100px; padding:3px 10px;
    font-size:10px; font-weight:700; text-transform:uppercase;
  }
  .nere-dropdown-ch .dd-item {
    padding: 10px 18px; font-size:13px; color:#0A3D1F;
    cursor:pointer; transition:background 0.15s;
  }
  .nere-dropdown-ch .dd-item:hover { background:#F5FAF7; }
  .nere-dropdown-ch .dd-danger { color:#CC3333; }
  .nere-dropdown-ch .dd-danger:hover { background:#FFF0F0 !important; }
  .nere-dropdown-ch .dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
`;

function Navbar({ user, menuOpen, setMenuOpen, navigate, handleLogout, activeKey }) {
  const initiales = user
    ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase()
    : "";

  return (
    <nav className="nere-navbar-ch">
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

      <div className="nav-pill">
        {NAV_LINKS.map(link => (
          <button key={link.key}
            className={`nav-btn ${link.key===activeKey?"active":""}`}
            onClick={() => navigate(link.path)}>
            {link.label}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
        {user ? (
          <div style={{ position:"relative" }}>
            <div className="u-chip" onClick={() => setMenuOpen(o => !o)}>
              <div className="u-avatar">{initiales}</div>
              <span style={{ maxWidth:"100px", overflow:"hidden",
                textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {user.prenom} {user.nom}
              </span>
              <span style={{ fontSize:"9px", opacity:0.5 }}>▾</span>
            </div>
            {menuOpen && (
              <>
                <div style={{ position:"fixed", inset:0, zIndex:50 }}
                  onClick={() => setMenuOpen(false)}/>
                <div className="nere-dropdown-ch" onClick={e => e.stopPropagation()}>
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
                      { label:" Mon Profil",     path:"/profil"   },
                      { label:" Mon Abonnement", path:"/paiement" },
                    ].map(item => (
                      <div key={item.label} className="dd-item"
                        onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                        {item.label}
                      </div>
                    ))}
                    {user.role==="admin" && (
                      <div className="dd-item"
                        onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                        🛡 Tableau de bord
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
        ) : (
          <>
            <button onClick={() => navigate("/connexion")}
              style={{ padding:"7px 18px", borderRadius:"100px",
                border:"1.5px solid rgba(255,255,255,0.35)", background:"transparent",
                color:"#fff", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>
              Connexion
            </button>
            <button onClick={() => navigate("/inscription")}
              style={{ padding:"7px 18px", borderRadius:"100px",
                border:"none", background:"#4DC97A",
                color:"#0A3D1F", fontSize:"13px", fontWeight:700, cursor:"pointer" }}>
              S'inscrire
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default function Chat() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const socketRef = useRef(null);
  const endRef    = useRef(null);
  const textareaRef = useRef(null);

  const messagePredéfini = location.state?.messagePredefini || "";

  const [menuOpen, setMenuOpen]         = useState(false);
  const [messages, setMessages]         = useState([]);
  const [diffusions, setDiffusions]     = useState([]);
  const [texte, setTexte]               = useState(messagePredéfini);
  const [connecte, setConnecte]         = useState(false);
  const [adminEnLigne, setAdminEnLigne] = useState(false);
  const [adminEcrit, setAdminEcrit]     = useState(false);
  const [onglet, setOnglet]             = useState("chat");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

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
    socket.on("connect", () => {
      setConnecte(true);
      socket.emit("charger_historique",  { userId:user._id||user.id, role:user.role });
      socket.emit("charger_diffusions");
    });
    socket.on("disconnect", () => setConnecte(false));
    socket.on("historique",            msgs => setMessages(msgs));
    socket.on("historique_diffusions", msgs => setDiffusions(msgs));
    socket.on("message_recu",  msg => { setMessages(m => [...m, msg]); setAdminEcrit(false); });
    socket.on("message_envoye", msg => {
      setMessages(m => m.find(x => x.id===msg.id) ? m : [...m, msg]);
    });
    socket.on("diffusion_recue", msg => setDiffusions(d => [msg, ...d]));
    socket.on("admin_statut", ({ enLigne }) => setAdminEnLigne(enLigne));
    socket.on("admin_ecrit",  ({ ecrit })   => setAdminEcrit(ecrit));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, adminEcrit]);

  // Auto-resize textarea
  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  };

  const envoyer = () => {
    if (!texte.trim() || !socketRef.current) return;
    socketRef.current.emit("message_envoyer", {
      texte:         texte.trim(),
      expediteurId:  user._id || user.id || "",
      expediteurNom: `${user.prenom} ${user.nom}`,
      role:          user.role || "user",
      destinataireId:null,
    });
    socketRef.current.emit("stop_ecrit", { role:user.role, userId:user._id||user.id });
    setTexte("");
    // Reset hauteur textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleTexteChange = (e) => {
    setTexte(e.target.value);
    autoResize();
    if (socketRef.current) {
      socketRef.current.emit("ecrit", {
        role:user.role, userId:user._id||user.id,
        nom:`${user.prenom} ${user.nom}`,
      });
    }
  };

  const estMoi = (msg) =>
    msg.expediteurId === (user?._id||user?.id) ||
    (msg.role===user?.role && msg.expediteurNom===`${user?.prenom} ${user?.nom}`);

  const bubble = (moi) => ({
    maxWidth:"65%", padding:"12px 16px",
    borderRadius: moi ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
    background:   moi ? "#00904C" : "#fff",
    color:        moi ? "#fff"    : "#0A2410",
    boxShadow:"0 2px 8px rgba(0,0,0,0.08)",
    alignSelf:    moi ? "flex-end" : "flex-start",
    border:       moi ? "none"    : "1px solid #E2EDE6",
    whiteSpace:   "pre-wrap",
  });

  /* ══ PAGE NON CONNECTÉ ══ */
  if (!user) return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif", background:"#F5FAF7" }}>
      <style>{NAVBAR_CSS}</style>
      <Navbar user={null} menuOpen={false} setMenuOpen={()=>{}}
        navigate={navigate} handleLogout={()=>{}} activeKey="messages"/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
        minHeight:"calc(100vh - 120px)", padding:"40px 20px" }}>
        <div style={{ background:"#fff", borderRadius:"24px",
          border:"1.5px solid rgba(0,144,76,0.15)", padding:"60px 48px",
          maxWidth:"520px", width:"100%", textAlign:"center",
          boxShadow:"0 8px 40px rgba(0,144,76,0.08)" }}>

          <h2 style={{ fontSize:"26px", fontWeight:900, color:"#0A3D1F",
            marginBottom:"12px", lineHeight:1.3 }}>
            Messagerie CCI-BF
          </h2>
          <p style={{ color:"#6B9A7A", fontSize:"15px", lineHeight:1.8,
            maxWidth:"380px", margin:"0 auto 36px" }}>
            La messagerie est réservée aux abonnés NERE.<br/>
            Connectez-vous ou créez un compte pour discuter directement avec un agent CCI-BF.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"24px" }}>
            <button onClick={() => navigate("/connexion")}
              style={{ width:"100%", padding:"15px", borderRadius:"12px",
                background:"#00904C", color:"#fff", border:"none",
                fontWeight:800, fontSize:"15px", cursor:"pointer",
                boxShadow:"0 4px 16px rgba(0,144,76,0.3)" }}>
              Se connecter
            </button>
            <button onClick={() => navigate("/inscription")}
              style={{ width:"100%", padding:"15px", borderRadius:"12px",
                background:"#fff", color:"#00904C", border:"2px solid #00904C",
                fontWeight:800, fontSize:"15px", cursor:"pointer" }}>
              Créer un compte
            </button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
            <div style={{ flex:1, height:"1px", background:"#E2EDE6" }}/>
            <span style={{ fontSize:"12px", color:"#6B9A7A", fontWeight:600 }}>ou</span>
            <div style={{ flex:1, height:"1px", background:"#E2EDE6" }}/>
          </div>

          <div style={{ background:"rgba(0,144,76,0.05)",
            border:"1px solid rgba(0,144,76,0.15)", borderRadius:"12px",
            padding:"18px 20px", display:"flex",
            alignItems:"center", justifyContent:"space-between", gap:"12px" }}>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:"13px", fontWeight:700, color:"#0A3D1F", marginBottom:"3px" }}>
                Découvrir nos formules d'abonnement
              </div>
              <div style={{ fontSize:"12px", color:"#6B9A7A" }}>
                À partir de 5 000 FCFA — accès complet à la messagerie
              </div>
            </div>
            <button onClick={() => navigate("/formules")}
              style={{ flexShrink:0, padding:"9px 18px", borderRadius:"8px",
                background:"#00904C", color:"#fff", border:"none",
                fontWeight:700, fontSize:"13px", cursor:"pointer", whiteSpace:"nowrap" }}>
              Voir les formules 
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ══ CHAT CONNECTÉ ══ */
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh",
      fontFamily:"Arial, Helvetica, sans-serif", background:"#F5FAF7" }}>
      <style>{NAVBAR_CSS}</style>

      <Navbar user={user} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        navigate={navigate} handleLogout={handleLogout} activeKey="messages"/>

      {/* Barre statut admin */}
      <div style={{ background:"#fff", borderBottom:"1px solid #E2EDE6",
        padding:"8px 24px", display:"flex", alignItems:"center",
        justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"6px",
          fontSize:"12px", fontWeight:600,
          color: adminEnLigne ? "#00904C" : "#6B9A7A" }}>
          <div style={{ width:"8px", height:"8px", borderRadius:"50%",
            background: adminEnLigne ? "#4DC97A" : "#D1D5DB" }}/>
          {adminEnLigne ? "CCI-BF en ligne" : "CCI-BF hors ligne"}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px",
          fontSize:"11px", color: connecte ? "#00904C" : "#CC3333", fontWeight:600 }}>
          <div style={{ width:"6px", height:"6px", borderRadius:"50%",
            background: connecte ? "#4DC97A" : "#FF6B6B" }}/>
          {connecte ? "Connecté" : "Déconnecté"}
        </div>
      </div>

      {/* ══ ONGLETS ══ */}
      <div style={{ display:"flex", borderBottom:"2px solid #E2EDE6",
        background:"#fff", flexShrink:0 }}>
        {[
          { key:"chat",       label:" Mes messages"                    },
          { key:"diffusions", label:` Annonces (${diffusions.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setOnglet(t.key)} style={{
            flex:1, padding:"13px", background:"transparent", border:"none",
            borderBottom: onglet===t.key ? "3px solid #00904C" : "3px solid transparent",
            color:        onglet===t.key ? "#00904C" : "#6B9A7A",
            fontWeight:   onglet===t.key ? 700 : 500,
            fontSize:"13px", cursor:"pointer", marginBottom:"-2px", transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ ONGLET CHAT ══ */}
      {onglet==="chat" && (
        <>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px",
            display:"flex", flexDirection:"column", gap:"10px" }}>

            {messages.length===0 && (
              <div style={{ margin:"auto", textAlign:"center", color:"#6B9A7A" }}>
                <div style={{ fontSize:"48px", marginBottom:"12px" }}></div>
                <div style={{ fontSize:"15px", fontWeight:600 }}>Commencez la conversation</div>
                <div style={{ fontSize:"13px", marginTop:"6px" }}>
                  Un agent CCI-BF vous répondra dès que possible
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              const moi = estMoi(m);
              return (
                <div key={m.id||i} style={{ display:"flex", flexDirection:"column",
                  alignItems: moi ? "flex-end" : "flex-start" }}>
                  <div style={{ fontSize:"10px", color:"#6B9A7A",
                    marginBottom:"3px", fontWeight:600 }}>
                    {moi ? "Vous" : m.expediteurNom || "CCI-BF"}
                  </div>
                  <div style={bubble(moi)}>
                    <div style={{ fontSize:"14px", lineHeight:1.6 }}>{m.texte}</div>
                    <div style={{ fontSize:"10px", marginTop:"6px",
                      color: moi ? "rgba(255,255,255,0.6)" : "#6B9A7A", textAlign:"right" }}>
                      {m.heure}
                    </div>
                  </div>
                </div>
              );
            })}

            {adminEcrit && (
              <div style={{ display:"flex", alignItems:"center", gap:"8px", alignSelf:"flex-start" }}>
                <div style={{ padding:"10px 14px", background:"#fff",
                  borderRadius:"4px 16px 16px 16px", border:"1px solid #E2EDE6",
                  display:"flex", gap:"4px" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:"6px", height:"6px", borderRadius:"50%",
                      background:"#00904C",
                      animation:`bounce 1s ${i*0.2}s infinite` }}/>
                  ))}
                </div>
                <span style={{ fontSize:"11px", color:"#6B9A7A" }}>CCI-BF écrit...</span>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* ── Zone saisie avec textarea ── */}
          <div style={{ padding:"16px 24px", background:"#fff",
            borderTop:"1px solid #E2EDE6", display:"flex",
            gap:"10px", flexShrink:0, alignItems:"flex-end" }}>
            <textarea
              ref={textareaRef}
              value={texte}
              onChange={handleTexteChange}
              onKeyDown={e => {
                if (e.key==="Enter" && !e.shiftKey) {
                  e.preventDefault();
                  envoyer();
                }
              }}
              placeholder="Écrivez votre message... (Shift+Entrée pour revenir à la ligne)"
              rows={1}
              style={{
                flex:1, padding:"12px 16px", borderRadius:"12px",
                border:"1.5px solid #E2EDE6", fontSize:"14px",
                fontFamily:"inherit", outline:"none", color:"#0A2410",
                resize:"none", minHeight:"44px", maxHeight:"150px",
                overflowY:"auto", lineHeight:"1.5",
                boxSizing:"border-box", background:"#fff",
              }}
            />
            <button onClick={envoyer} disabled={!texte.trim()}
              style={{ padding:"12px 24px", borderRadius:"12px",
                background: texte.trim() ? "#00904C" : "#E2EDE6",
                border:"none",
                color: texte.trim() ? "#fff" : "#6B9A7A",
                fontWeight:700, fontSize:"14px",
                cursor: texte.trim() ? "pointer" : "not-allowed",
                transition:"all 0.2s", flexShrink:0, alignSelf:"flex-end" }}>
              Envoyer 
            </button>
          </div>
        </>
      )}

      {/* ══ ONGLET DIFFUSIONS ══ */}
      {onglet==="diffusions" && (
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {diffusions.length===0 ? (
            <div style={{ textAlign:"center", padding:"60px 0", color:"#6B9A7A" }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}></div>
              <div style={{ fontSize:"15px", fontWeight:600 }}>Aucune annonce pour le moment</div>
              <div style={{ fontSize:"13px", marginTop:"6px" }}>
                Les annonces de la CCI-BF apparaîtront ici
              </div>
            </div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {diffusions.map((d, i) => (
                <div key={d.id||i} style={{ background:"#fff", borderRadius:"14px",
                  padding:"18px 20px", border:"2px solid rgba(0,144,76,0.15)",
                  boxShadow:"0 2px 8px rgba(0,144,76,0.06)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:"10px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div style={{ width:"32px", height:"32px", borderRadius:"8px",
                        background:"#E6F4EC", display:"flex",
                        alignItems:"center", justifyContent:"center", fontSize:"16px" }}>
                        
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:"13px", color:"#00904C" }}>
                          Annonce CCI-BF
                        </div>
                        <div style={{ fontSize:"11px", color:"#6B9A7A" }}>{d.expediteurNom}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:"11px", color:"#6B9A7A" }}>{d.date} · {d.heure}</div>
                  </div>
                  <div style={{ fontSize:"14px", color:"#0A2410", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                    {d.texte}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}