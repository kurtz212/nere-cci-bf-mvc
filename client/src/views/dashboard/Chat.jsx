import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.jpg";
// ── Heures ouvrables : Lun–Ven 8h–17h ──
function estOuvrable() {
  const now  = new Date();
  const jour = now.getDay();
  const h    = now.getHours();
  return jour >= 1 && jour <= 5 && h >= 8 && h < 17;
}

// Messages mock — à remplacer par API/WebSocket
const MESSAGES_MOCK = [
  { id:1, role:"admin", texte:"Bonjour ! Je suis l'agent CCI-BF. Comment puis-je vous aider ?",
    heure:"09:14", date:"Aujourd'hui", lu:true },
  { id:2, role:"user",  texte:"Bonjour, j'aimerais savoir comment mettre à jour les informations de mon entreprise dans le registre NERE.",
    heure:"09:16", date:"Aujourd'hui", lu:true },
  { id:3, role:"admin", texte:"Bien sûr ! Pour mettre à jour vos informations, vous devez vous présenter au guichet CCI-BF avec votre RCCM original et une pièce d'identité. Souhaitez-vous connaître nos horaires d'ouverture ?",
    heure:"09:18", date:"Aujourd'hui", lu:true },
];

const ADMIN_STATUT = "en_ligne"; // "en_ligne" | "absent" | "occupe"

const STATUT_ADMIN = {
  en_ligne: { color:"#4DC97A", label:"En ligne", description:"Répond en quelques minutes" },
  absent:   { color:"#D4A830", label:"Absent",   description:"Répond sous 24h par message" },
  occupe:   { color:"#E85555", label:"Occupé",   description:"Répond dès que possible" },
};

export default function Chat() {
  const navigate  = useNavigate();
  const user      = JSON.parse(localStorage.getItem("user") || "null");
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const [messages, setMessages]   = useState(MESSAGES_MOCK);
  const [texte, setTexte]         = useState("");
  const [envoi, setEnvoi]         = useState(false);
  const [adminEcrit, setAdminEcrit] = useState(false);

  const statut = STATUT_ADMIN[ADMIN_STATUT];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, adminEcrit]);

  const handleEnvoyer = async () => {
    if (!texte.trim() || envoi) return;
    const msg = {
      id: Date.now(), role:"user",
      texte: texte.trim(),
      heure: new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }),
      date:"Aujourd'hui", lu:false,
    };
    setMessages(m => [...m, msg]);
    setTexte("");
    setEnvoi(true);

    // Simulation réponse admin (temps réel si en ligne)
    if (ADMIN_STATUT === "en_ligne") {
      await new Promise(r => setTimeout(r, 800));
      setAdminEcrit(true);
      await new Promise(r => setTimeout(r, 2000));
      setAdminEcrit(false);
      setMessages(m => [...m, {
        id: Date.now()+1, role:"admin",
        texte:"Merci pour votre message. Un agent CCI-BF va vous répondre dans un instant.",
        heure: new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }),
        date:"Aujourd'hui", lu:true,
      }]);
    }
    setEnvoi(false);
    inputRef.current?.focus();
  };

  if (!user) {
    return (
      <div style={{ minHeight:"100vh", background:"#F5FAF7", display:"flex",
        alignItems:"center", justifyContent:"center", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <h2 style={{ color:"#0A3D1F" }}>Accès réservé aux abonnés</h2>
          <button onClick={() => navigate("/connexion")} className="btn-save" style={{ marginTop:"16px" }}>
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // ── Bloquer hors heures ouvrables ──
  if (!estOuvrable()) {
    const now        = new Date();
    const jours      = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
    const jourActuel = jours[now.getDay()];
    const heure      = `${String(now.getHours()).padStart(2,"0")}h${String(now.getMinutes()).padStart(2,"0")}`;
    return (
      <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif",
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"#0A3D1F" }}>
        <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:"20px",
          border:"1px solid rgba(255,255,255,0.1)", padding:"48px 40px",
          textAlign:"center", maxWidth:"420px", width:"100%" }}>
          <div style={{ fontSize:"56px", marginBottom:"16px" }}></div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px",
            fontWeight:900, color:"#fff", marginBottom:"12px" }}>
            Chat indisponible
          </h2>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"6px",
            background:"rgba(255,255,255,0.08)", borderRadius:"100px",
            padding:"5px 14px", marginBottom:"20px" }}>
            <span style={{ width:"7px", height:"7px", borderRadius:"50%",
              background:"#888", display:"inline-block" }}/>
            <span style={{ fontSize:"12px", fontWeight:700, color:"#888" }}>Hors ligne</span>
          </div>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"14px",
            lineHeight:1.8, marginBottom:"8px" }}>
            Le chat est disponible uniquement<br/>
            <strong style={{ color:"#4DC97A" }}>Lundi – Vendredi · 8h00 – 17h00</strong>
          </p>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px",
            marginBottom:"32px" }}>
            Aujourd'hui : {jourActuel} · {heure}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <button onClick={() => navigate("/contact")}
              style={{ padding:"12px", borderRadius:"12px",
                background:"linear-gradient(135deg,#4DC97A,#1A7A40)",
                border:"none", color:"#0A3D1F", fontWeight:800,
                fontSize:"14px", cursor:"pointer", fontFamily:"inherit" }}>
              Laisser un message
            </button>
            <button onClick={() => navigate("/")}
              style={{ padding:"12px", borderRadius:"12px",
                background:"rgba(255,255,255,0.08)",
                border:"1px solid rgba(255,255,255,0.1)",
                color:"rgba(255,255,255,0.5)", fontWeight:600,
                fontSize:"14px", cursor:"pointer", fontFamily:"inherit" }}>
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", height:"100vh" }}>

        {/* NAVBAR */}

        
       <nav className="dash-navbar">
                 <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                   <img src={logoNERE} alt="NERE"
                     style={{ height:"60px", width:"auto", borderRadius:"6px", flexShrink:0 }}/>
                   <div style={{ display:"flex", flexDirection:"column", lineHeight:1.4 }}>
                     <span style={{ fontSize:"11px", fontWeight:800, color:"#fff",
                       letterSpacing:"0.06em", textTransform:"uppercase" }}>Fichier NERE</span>
                     <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.85)" }}>
                       Registre national des entreprises<br/>Du Burkina Faso
                     </span>
                   </div>
                 </div>
       
      
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link" onClick={() => navigate("/contact")}>Contact</span>

            <span className="dash-nav-link active"> Chat</span>
          </div>
          <div className="dash-nav-actions">
            <div className="user-chip" onClick={() => navigate("/profil")}>
              <div className="user-avatar">{user.prenom?.[0]}{user.nom?.[0]}</div>
              <span>{user.prenom} {user.nom}</span>
            </div>
          </div>
        </nav>

        {/* CONTENEUR CHAT */}
        <div style={{ flex:1, display:"flex", overflow:"hidden",
          padding:"24px 48px 28px", gap:"20px", background:"var(--off-white)" }}>

          {/* COLONNE GAUCHE — Infos agent */}
          <div style={{ width:"240px", flexShrink:0, display:"flex", flexDirection:"column", gap:"14px" }}>

            {/* Card agent */}
            <div style={{ background:"#fff", borderRadius:"14px",
              border:"1px solid var(--border)", padding:"20px",
              boxShadow:"0 2px 8px rgba(10,61,31,0.06)" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
                <div style={{ position:"relative" }}>
                  <div style={{ width:"56px", height:"56px", borderRadius:"50%",
                    background:"var(--green-deep)", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    fontSize:"22px", fontWeight:800, color:"#4DC97A",
                    fontFamily:"'Playfair Display',serif" }}>
                    CCI
                  </div>
                  <div style={{ position:"absolute", bottom:2, right:2,
                    width:"13px", height:"13px", borderRadius:"50%",
                    background: statut.color,
                    border:"2px solid #fff" }}/>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)" }}>
                    Agent CCI-BF
                  </div>
                  <div style={{ fontSize:"11px", color:statut.color, fontWeight:600, marginTop:"3px" }}>
                    ● {statut.label}
                  </div>
                </div>
              </div>

              <div style={{ marginTop:"16px", padding:"10px 12px",
                background:"var(--off-white)", borderRadius:"8px",
                border:"1px solid var(--border)", fontSize:"12px",
                color:"var(--text-muted)", lineHeight:1.5, textAlign:"center" }}>
                {statut.description}
              </div>
            </div>

            {/* Infos utiles */}
            <div style={{ background:"#fff", borderRadius:"14px",
              border:"1px solid var(--border)", padding:"16px",
              boxShadow:"0 2px 8px rgba(10,61,31,0.06)" }}>
              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"12px" }}>
                Contacts CCI-BF
              </div>
              {[
                { label:"Tel:+226 25 30 61 22" },
                {  label:"Email: info@cci-bf.org" },
                {  label:"Heures d'ouverture: Lun–Ven 8h–17h" },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:"8px",
                  padding:"8px 0", borderBottom:"1px solid var(--border)",
                  fontSize:"12px", color:"var(--text-mid)" }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>

            {/* Liens rapides */}
            <div style={{ background:"#fff", borderRadius:"14px",
              border:"1px solid var(--border)", padding:"16px" }}>
              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"10px" }}>
                Actions rapides
              </div>
              <button className="btn-edit" style={{ width:"100%", marginBottom:"8px", fontSize:"12px" }}
                onClick={() => navigate("/demande-document")}>
                Demander un document
              </button>
              <button className="btn-edit" style={{ width:"100%", fontSize:"12px" }}
                onClick={() => navigate("/demande-document")}>
                 Rechercher une entreprise
              </button>
            </div>
          </div>

          {/* ZONE CHAT */}
          <div style={{ flex:1, display:"flex", flexDirection:"column",
            background:"#fff", borderRadius:"16px",
            border:"1px solid var(--border)",
            boxShadow:"0 4px 20px rgba(10,61,31,0.08)", overflow:"hidden" }}>

            {/* En-tête chat */}
            <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--border)",
              display:"flex", alignItems:"center", gap:"12px",
              background:"var(--green-deep)" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%",
                background:"rgba(77,201,122,0.2)", display:"flex",
                alignItems:"center", justifyContent:"center", fontSize:"16px" }}>
                
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:"14px", color:"#fff" }}>
                  Discussion avec CCI-BF
                </div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)", marginTop:"1px" }}>
                  {messages.length} message{messages.length>1?"s":""} · Conversation sécurisée
                </div>
              </div>
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"50%",
                  background: statut.color,
                  boxShadow:`0 0 6px ${statut.color}` }}/>
                <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>
                  {statut.label}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"20px 24px",
              display:"flex", flexDirection:"column", gap:"16px",
              background:"var(--off-white)" }}>

              {/* Bandeau mode asynchrone si absent */}
              {ADMIN_STATUT !== "en_ligne" && (
                <div style={{ background:"rgba(212,168,48,0.08)",
                  border:"1px solid rgba(212,168,48,0.25)", borderRadius:"10px",
                  padding:"10px 16px", fontSize:"12px", color:"#a07820",
                  display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
                  <span style={{ fontSize:"16px" }}>📬</span>
                  <span>
                    L'agent est actuellement <strong>{statut.label.toLowerCase()}</strong>.
                    Votre message sera traité et vous recevrez une réponse par email.
                  </span>
                </div>
              )}

              {messages.map((msg, i) => {
                const isUser  = msg.role === "user";
                const showDate = i===0 || messages[i-1]?.date !== msg.date;
                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div style={{ textAlign:"center", fontSize:"11px",
                        color:"var(--text-muted)", margin:"8px 0",
                        display:"flex", alignItems:"center", gap:"10px" }}>
                        <div style={{ flex:1, height:"1px", background:"var(--border)" }}/>
                        {msg.date}
                        <div style={{ flex:1, height:"1px", background:"var(--border)" }}/>
                      </div>
                    )}
                    <div style={{ display:"flex",
                      justifyContent: isUser ? "flex-end" : "flex-start",
                      alignItems:"flex-end", gap:"8px" }}>

                      {/* Avatar admin */}
                      {!isUser && (
                        <div style={{ width:"30px", height:"30px", borderRadius:"50%",
                          background:"var(--green-deep)", display:"flex",
                          alignItems:"center", justifyContent:"center",
                          fontSize:"11px", fontWeight:800, color:"#4DC97A",
                          flexShrink:0 }}>
                          CC
                        </div>
                      )}

                      <div style={{ maxWidth:"68%" }}>
                        <div style={{
                          padding:"12px 16px", borderRadius:
                            isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isUser ? "var(--green-dark)" : "#fff",
                          color: isUser ? "#fff" : "var(--text-dark)",
                          fontSize:"14px", lineHeight:1.6,
                          boxShadow: isUser
                            ? "0 2px 8px rgba(15,92,46,0.3)"
                            : "0 2px 6px rgba(10,61,31,0.08)",
                          border: isUser ? "none" : "1px solid var(--border)",
                        }}>
                          {msg.texte}
                        </div>
                        <div style={{ fontSize:"10px", color:"var(--text-muted)",
                          marginTop:"4px",
                          textAlign: isUser ? "right" : "left",
                          display:"flex", gap:"4px",
                          justifyContent: isUser ? "flex-end" : "flex-start",
                          alignItems:"center" }}>
                          {msg.heure}
                          {isUser && (
                            <span style={{ color: msg.lu ? "#4DC97A" : "var(--text-muted)" }}>
                              {msg.lu ? "✓✓" : "✓"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Avatar user */}
                      {isUser && (
                        <div className="user-avatar" style={{ flexShrink:0 }}>
                          {user.prenom?.[0]}{user.nom?.[0]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Indicateur "admin écrit..." */}
              {adminEcrit && (
                <div style={{ display:"flex", alignItems:"flex-end", gap:"8px" }}>
                  <div style={{ width:"30px", height:"30px", borderRadius:"50%",
                    background:"var(--green-deep)", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    fontSize:"11px", fontWeight:800, color:"#4DC97A" }}>CC</div>
                  <div style={{ background:"#fff", border:"1px solid var(--border)",
                    borderRadius:"18px 18px 18px 4px", padding:"12px 18px",
                    boxShadow:"0 2px 6px rgba(10,61,31,0.08)" }}>
                    <div style={{ display:"flex", gap:"4px", alignItems:"center" }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{
                          width:"7px", height:"7px", borderRadius:"50%",
                          background:"var(--green-bright)",
                          animation:`bounce 1s ease-in-out ${i*0.2}s infinite`,
                        }}/>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Zone de saisie */}
            <div style={{ padding:"16px 20px", borderTop:"1px solid var(--border)",
              background:"#fff", display:"flex", gap:"10px", alignItems:"flex-end" }}>
              <textarea
                ref={inputRef}
                rows={1} value={texte}
                onChange={e => setTexte(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleEnvoyer(); } }}
                placeholder="Écrivez votre message... (Entrée pour envoyer)"
                style={{
                  flex:1, padding:"12px 16px", borderRadius:"12px",
                  border:"1.5px solid var(--border)", fontFamily:"inherit",
                  fontSize:"14px", color:"var(--text-dark)", resize:"none",
                  outline:"none", lineHeight:1.5, maxHeight:"120px", overflowY:"auto",
                  transition:"border-color 0.2s",
                  background:"var(--off-white)",
                }}
                onFocus={e => e.target.style.borderColor="var(--green-light)"}
                onBlur={e => e.target.style.borderColor="var(--border)"}
              />
              <button
                onClick={handleEnvoyer}
                disabled={!texte.trim() || envoi}
                style={{
                  width:"44px", height:"44px", borderRadius:"12px", flexShrink:0,
                  background: texte.trim() ? "var(--green-dark)" : "var(--border)",
                  border:"none", cursor: texte.trim() ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"18px", transition:"all 0.2s",
                  transform: texte.trim() ? "scale(1)" : "scale(0.95)",
                }}>
                {envoi ? <span className="spinner-sm" style={{ width:"16px", height:"16px" }}/> : "➤"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform:translateY(0); opacity:0.4; }
          50% { transform:translateY(-4px); opacity:1; }
        }
      `}</style>
    </div>
  );
}