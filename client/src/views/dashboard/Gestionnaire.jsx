import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

const STATUT_COLORS = {
  en_attente: { bg:"rgba(212,168,48,0.12)",  color:"#B8860B", label:"En attente" },
  en_cours:   { bg:"rgba(74,158,255,0.12)",  color:"#1E60CC", label:"En cours"   },
  traite:     { bg:"rgba(34,160,82,0.12)",   color:"#1A7A40", label:"Traité"     },
  rejete:     { bg:"rgba(232,85,85,0.12)",   color:"#CC3333", label:"Rejeté"     },
  annule:     { bg:"rgba(150,150,150,0.1)",  color:"#777",    label:"Annulé"     },
};

const TYPES_REQUETES = [
  { id:"liste",       label:"Liste",                 },
  { id:"detail",      label:"Détails",               },
  { id:"statistique", label:"Statistiques",         },
  { id:"fiche",       label:"Fiche",                 },
  { id:"autre",       label:"Répertoire Thématique", },
];

const CATS_PUB = ["Rapport","Étude","Classement","Note technique","Communiqué"];

/* ══════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════ */
function ManagerLogin({ onSuccess }) {
  const [form, setForm]       = useState({ email:"", password:"" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API}/auth/connexion`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.user?.role === "manager") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onSuccess(data.user);
      } else if (data.success && data.user?.role !== "manager") {
        setError("Accès refusé. Compte gestionnaire requis.");
      } else {
        setError(data.message || "Identifiants incorrects.");
      }
    } catch { setError("Impossible de contacter le serveur."); }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight:"100vh",
      background:"#00904C",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Plus Jakarta Sans',sans-serif", position:"relative", overflow:"hidden",
    }}>
      {[
        { w:500, h:500, top:"-120px", right:"-120px" },
        { w:300, h:300, bottom:"-80px", left:"-80px" },
      ].map((d,i) => (
        <div key={i} style={{ position:"absolute", width:`${d.w}px`, height:`${d.h}px`,
          borderRadius:"50%", border:"1px solid rgba(77,201,122,0.06)",
          top:d.top, right:d.right, bottom:d.bottom, left:d.left, pointerEvents:"none" }}/>
      ))}

      <div style={{
        background:"#00904C", backdropFilter:"blur(24px)",
        borderRadius:"28px", border:"1px solid #00904C",
        padding:"56px 48px", width:"100%", maxWidth:"420px",
        boxShadow:"0 40px 80px rgba(0,0,0,0.35)", position:"relative", zIndex:1,
      }}>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{
            width:"68px", height:"68px", borderRadius:"20px",
            background:"linear-gradient(135deg,#4DC97A,#1A7A40)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"28px", margin:"0 auto 18px",
            boxShadow:"0 12px 32px rgba(77,201,122,0.3)",
          }}></div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px",
            fontWeight:900, color:"#fff", margin:"0 0 8px" }}>
            Espace Gestionnaire
          </h1>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px", margin:0 }}>
            NERE CCI-BF · Accès réservé
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {[
            { key:"email",    type:"email",    label:"Email",         ph:"gestionnaire@nere.bf" },
            { key:"password", type:"password", label:"Mot de passe",  ph:"••••••••" },
          ].map(f => (
            <div key={f.key} style={{ marginBottom:"16px" }}>
              <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                color:"rgba(255,255,255,0.3)", textTransform:"uppercase",
                letterSpacing:"0.1em", marginBottom:"8px" }}>{f.label}</label>
              <input type={f.type} value={form[f.key]} required
                onChange={e => setForm(p => ({ ...p, [f.key]:e.target.value }))}
                placeholder={f.ph}
                style={{ width:"100%", padding:"14px 16px", borderRadius:"12px",
                  border:"1.5px solid rgba(255,255,255,0.08)",
                  background:"rgba(255,255,255,0.05)", color:"#fff",
                  fontSize:"14px", fontFamily:"inherit", outline:"none",
                  boxSizing:"border-box" }}/>
            </div>
          ))}

          {error && (
            <div style={{ background:"rgba(232,85,85,0.1)", border:"1px solid rgba(232,85,85,0.2)",
              borderRadius:"10px", padding:"11px 14px", color:"#FF8080",
              fontSize:"13px", marginBottom:"14px" }}>
               {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width:"100%", padding:"14px", borderRadius:"14px",
            background:"linear-gradient(135deg,#4DC97A,#22A052)",
            border:"none", color:"#0A3D1F", fontWeight:800,
            fontSize:"15px", cursor: loading?"not-allowed":"pointer",
            fontFamily:"inherit", boxShadow:"0 8px 24px rgba(77,201,122,0.28)",
            marginTop:"8px", opacity:loading?0.75:1, transition:"all 0.2s",
          }}>
            {loading ? "Connexion..." : "Accéder au tableau de bord"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════ */
export default function Gestionnaire() {
  const navigate = useNavigate();

  const [managerUser, setManagerUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      if (!u) return null;
      const p = JSON.parse(u);
      return p.role === "manager" ? p : null;
    } catch { return null; }
  });

  const [section, setSection]     = useState("dashboard");
  const [sidebarOpen, setSidebar] = useState(true);

  /* Demandes */
  const [demandes, setDemandes]               = useState([]);
  const [demandesLoading, setDemandesLoading] = useState(false);
  const [demandesErreur, setDemandesErreur]   = useState("");
  const [filtreStatut, setFiltreStatut]       = useState("tous");
  const [searchDemande, setSearchDemande]     = useState("");
  const [demandeSelectee, setDemandeSelectee] = useState(null);
  const [statutLoading, setStatutLoading]     = useState(null);
  const [actionMsg, setActionMsg]             = useState({ id:null, texte:"", type:"" });
  const [noteModal, setNoteModal]             = useState({ open:false, id:null, texte:"" });
  const [noteLoading, setNoteLoading]         = useState(false);

  /* Publications */
  const [pubs, setPubs]               = useState([]);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [showFormPub, setShowFormPub] = useState(false);
  const [editPub, setEditPub]         = useState(null);
  const [formPub, setFormPub]         = useState({ titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });
  const [pubLoading, setPubLoading]   = useState(false);
  const [pubError, setPubError]       = useState("");

  /* Utilisateurs */
  const [users, setUsers]               = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchUser, setSearchUser]     = useState("");

  /* Activités */
  const [activites, setActivites]               = useState([]);
  const [activitesLoading, setActivitesLoading] = useState(false);

  /* ── Chargements ── */
  const chargerDemandes = useCallback(async () => {
    setDemandesLoading(true); setDemandesErreur("");
    try {
      const res  = await fetch(`${API}/demandes/toutes`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setDemandes(data.data || []);
      else setDemandesErreur(data.message || "Impossible de charger les demandes.");
    } catch { setDemandesErreur("Serveur inaccessible."); }
    setDemandesLoading(false);
  }, []);

  const chargerPubs = useCallback(async () => {
    setPubsLoading(true);
    try {
      const res  = await fetch(`${API}/publications?all=true&limit=100`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setPubs(data.data.map(p => ({
        id:p._id, titre:p.titre, cat:p.categorie||"Rapport",
        date:new Date(p.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
        statut:p.statut, vues:p.vues||0,
      })));
    } catch {}
    setPubsLoading(false);
  }, []);

  const chargerUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res  = await fetch(`${API}/users`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setUsers(data.data.map(u => ({
        id:u._id, nom:u.nom, prenom:u.prenom, email:u.email||"—",
        role:u.role, pack:u.pack||"—",
        statut:u.isActive?"actif":"suspendu",
        date:new Date(u.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}),
      })));
    } catch {}
    setUsersLoading(false);
  }, []);

  const chargerActivites = useCallback(async () => {
    setActivitesLoading(true);
    try {
      const res  = await fetch(`${API}/searchlogs/recent?limit=30`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      const data = await res.json();
      if (data.success) setActivites(data.data || []);
    } catch {}
    setActivitesLoading(false);
  }, []);

  useEffect(() => {
    if (!managerUser) return;
    chargerDemandes();
    chargerActivites();
  }, [managerUser, chargerDemandes, chargerActivites]);

  useEffect(() => {
    if (!managerUser) return;
    if (section==="publications")  chargerPubs();
    if (section==="utilisateurs")  chargerUsers();
    if (section==="activites")     chargerActivites();
  }, [section, managerUser, chargerPubs, chargerUsers, chargerActivites]);

  /* ── Actions demandes ── */
  const changerStatut = async (id, statut) => {
    setStatutLoading(id);
    try {
      const res  = await fetch(`${API}/demandes/${id}/statut`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ statut }),
      });
      const data = await res.json();
      if (data.success) {
        setDemandes(ds => ds.map(d => d._id===id ? { ...d, statut } : d));
        if (demandeSelectee?._id===id) setDemandeSelectee(d => ({ ...d, statut }));
        setActionMsg({ id, texte:`✓ Statut mis à jour : ${STATUT_COLORS[statut]?.label}`, type:"succes" });
      } else {
        setActionMsg({ id, texte:data.message||"Erreur.", type:"erreur" });
      }
    } catch { setActionMsg({ id, texte:"Erreur serveur.", type:"erreur" }); }
    setStatutLoading(null);
    setTimeout(() => setActionMsg({ id:null, texte:"", type:"" }), 4000);
  };

  const ajouterNote = async () => {
    if (!noteModal.texte.trim()) return;
    setNoteLoading(true);
    try {
      const res  = await fetch(`${API}/demandes/${noteModal.id}/note`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ note:noteModal.texte }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg({ id:noteModal.id, texte:"✓ Note ajoutée.", type:"succes" });
        if (demandeSelectee?._id===noteModal.id) setDemandeSelectee(data.data);
      } else {
        setActionMsg({ id:noteModal.id, texte:data.message||"Erreur.", type:"erreur" });
      }
    } catch { setActionMsg({ id:noteModal.id, texte:"Erreur serveur.", type:"erreur" }); }
    setNoteLoading(false);
    setNoteModal({ open:false, id:null, texte:"" });
    setTimeout(() => setActionMsg({ id:null, texte:"", type:"" }), 4000);
  };

  /* ── Actions publications ── */
  const sauvegarderPub = async () => {
    if (!formPub.titre.trim()) { setPubError("Le titre est obligatoire."); return; }
    setPubLoading(true); setPubError("");
    try {
      const url    = editPub ? `${API}/publications/${editPub.id}` : `${API}/publications`;
      const method = editPub ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ titre:formPub.titre, categorie:formPub.cat, contenu:formPub.contenu, statut:formPub.statut }),
      });
      const data = await res.json();
      if (data.success) {
        await chargerPubs();
        setShowFormPub(false); setEditPub(null);
        setFormPub({ titre:"", cat:"Rapport", contenu:"", statut:"brouillon" });
      } else { setPubError(data.message||"Erreur."); }
    } catch { setPubError("Serveur indisponible."); }
    setPubLoading(false);
  };

  const publierPub = async (id) => {
    try {
      await fetch(`${API}/publications/${id}`, {
        method:"PUT",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${getToken()}` },
        body: JSON.stringify({ statut:"publie" }),
      });
      setPubs(ps => ps.map(p => p.id===id ? { ...p, statut:"publié" } : p));
    } catch {}
  };

  /* ── Styles ── */
  const S = {
    card:     { background:"#fff", borderRadius:"16px", border:"1px solid #EAF0EB", padding:"24px", boxShadow:"0 2px 16px #00904C" },
    btn:      { padding:"10px 20px", borderRadius:"10px", background:"#00904C", color:"#fff", border:"none", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" },
    btnGhost: { padding:"10px 20px", borderRadius:"10px", background:"transparent", color:"#00904C", border:"1.5px solid #C8DDD0", fontWeight:700, fontSize:"13px", cursor:"pointer", fontFamily:"inherit" },
    input:    { width:"100%", padding:"11px 14px", borderRadius:"10px", border:"1.5px solid #E2EDE6", fontSize:"13px", fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:"#1A2E1F", background:"#FAFCFB" },
    textarea: { width:"100%", padding:"11px 14px", borderRadius:"10px", border:"1.5px solid #E2EDE6", fontSize:"13px", fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:"#1A2E1F", resize:"vertical", minHeight:"120px", background:"#FAFCFB" },
    label:    { display:"block", fontSize:"11px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"7px" },
  };

  const NAV = [
    { id:"dashboard",    label:"Tableau de bord", },
    { id:"demandes",     label:"Demandes",         },
    { id:"publications", label:"Publications",     },
    { id:"utilisateurs", label:"Utilisateurs",     },
    { id:"activites",    label:"Activités",        },
  ];

  const kpis = [
    { label:"En attente", val:demandes.filter(d=>d.statut==="en_attente").length, color:"#B8860B", bg:"rgba(212,168,48,0.1)",   filtre:"en_attente" },
    { label:"En cours",   val:demandes.filter(d=>d.statut==="en_cours").length,   color:"#1E60CC", bg:"rgba(74,158,255,0.1)",  ifiltre:"en_cours"   },
    { label:"Traitées",   val:demandes.filter(d=>d.statut==="traite").length,     color:"#1A7A40", bg:"rgba(34,160,82,0.1)",    filtre:"traite"     },
    { label:"Total",      val:demandes.length,                                    color:"#00904C", bg:"rgba(10,61,31,0.06)",    filtre:"tous"       },
  ];

  const demandesFiltrees = (filtreStatut==="tous" ? demandes : demandes.filter(d=>d.statut===filtreStatut))
    .filter(d => {
      if (!searchDemande) return true;
      const q = searchDemande.toLowerCase();
      return d._id?.toLowerCase().includes(q) || d.contact?.toLowerCase().includes(q) || d.typeRequete?.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
    });

  const usersFiltres = users.filter(u =>
    `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  const nbAttente = demandes.filter(d=>d.statut==="en_attente").length;

  /* ══ RENDERS ══ */

  const renderDashboard = () => (
    <div>
      <div style={{ marginBottom:"28px" }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", color:"#0A3D1F", margin:"0 0 6px" }}>
          Bonjour, {managerUser?.prenom} 
        </h2>
        <p style={{ color:"#6B9A7A", fontSize:"13px", margin:0 }}>
          {new Date().toLocaleDateString("fr-FR",{ weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", marginBottom:"24px" }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...S.card, display:"flex", alignItems:"center", gap:"16px", cursor:"pointer" }}
            onClick={() => { setSection("demandes"); setFiltreStatut(k.filtre); }}>
            <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:k.bg,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", flexShrink:0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:900, color:k.color, lineHeight:1 }}>{k.val}</div>
              <div style={{ fontSize:"12px", color:"#6B9A7A", fontWeight:600, marginTop:"4px" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"20px" }}>
        {/* Demandes récentes */}
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F" }}>Demandes récentes</div>
            <button onClick={() => setSection("demandes")} style={{ ...S.btnGhost, padding:"6px 14px", fontSize:"12px" }}>
              Voir tout →
            </button>
          </div>
          {demandesLoading ? (
            <div style={{ textAlign:"center", padding:"32px", color:"#6B9A7A" }}> Chargement...</div>
          ) : demandes.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px", color:"#6B9A7A", fontSize:"13px" }}>Aucune demande</div>
          ) : demandes.slice(0,6).map((d,i) => {
            const sc  = STATUT_COLORS[d.statut] || STATUT_COLORS["en_attente"];
            const typ = TYPES_REQUETES.find(t=>t.id===d.typeRequete);
            return (
              <div key={d._id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px 0",
                borderBottom:i<5?"1px solid #F0F4F1":"none", cursor:"pointer" }}
                onClick={() => { setSection("demandes"); setDemandeSelectee(d); }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:sc.bg,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>
                  {typ?.icon||""}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:"13px", color:"#00904C",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {typ?.label||d.typeRequete} — {d.contact||"—"}
                  </div>
                  <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"2px" }}>
                    Réf. {d._id?.slice(-6).toUpperCase()} · {d.createdAt ? new Date(d.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </div>
                </div>
                <span style={{ background:sc.bg, color:sc.color, borderRadius:"100px",
                  padding:"3px 10px", fontSize:"10px", fontWeight:700, flexShrink:0 }}>
                  {sc.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Activités */}
        <div style={S.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F" }}>Activités récentes</div>
            <button onClick={() => setSection("activites")} style={{ ...S.btnGhost, padding:"6px 14px", fontSize:"12px" }}>
              Voir tout →
            </button>
          </div>
          {activitesLoading ? (
            <div style={{ textAlign:"center", padding:"32px", color:"#6B9A7A" }}></div>
          ) : activites.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px", color:"#6B9A7A", fontSize:"13px" }}>Aucune activité</div>
          ) : activites.slice(0,6).map((a,i) => (
            <div key={a._id||i} style={{ display:"flex", gap:"10px", padding:"10px 0",
              borderBottom:i<5?"1px solid #F0F4F1":"none" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"10px", background:"#F0F8F3",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", flexShrink:0 }}></div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:"12px", color:"#1A2E1F", lineHeight:1.4,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {a.description||"Recherche effectuée"}
                </div>
                <div style={{ fontSize:"10px", color:"#6B9A7A", marginTop:"2px" }}>
                  {a.createdAt ? new Date(a.createdAt).toLocaleString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDemandes = () => (
    <div style={{ display:"grid", gridTemplateColumns:demandeSelectee?"1fr 400px":"1fr", gap:"20px" }}>
      <div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#0A3D1F", margin:0 }}>Gestion des demandes</h2>
            <p style={{ color:"#6B9A7A", fontSize:"13px", margin:"4px 0 0" }}>
              {demandes.length} demande{demandes.length!==1?"s":""} · {nbAttente} en attente
            </p>
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            <input style={{ ...S.input, width:"220px" }} placeholder="🔍 Rechercher..." value={searchDemande} onChange={e=>setSearchDemande(e.target.value)}/>
            <button style={S.btn} onClick={chargerDemandes} disabled={demandesLoading}>{demandesLoading?"⏳":"↺"} Actualiser</button>
          </div>
        </div>

        {/* Filtres */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" }}>
          {["tous","en_attente","en_cours","traite","rejete","annule"].map(s => {
            const sc = STATUT_COLORS[s];
            const count = s==="tous" ? demandes.length : demandes.filter(d=>d.statut===s).length;
            return (
              <button key={s} onClick={()=>setFiltreStatut(s)} style={{
                padding:"7px 16px", borderRadius:"100px", fontSize:"12px",
                fontWeight:filtreStatut===s?700:500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
                border:filtreStatut===s?`2px solid ${sc?.color||"#0A3D1F"}`:"1.5px solid #E2EDE6",
                background:filtreStatut===s?(sc?.bg||"#E8F5EE"):"#fff",
                color:filtreStatut===s?(sc?.color||"#0A3D1F"):"#6B9A7A",
              }}>
                {s==="tous"?"Toutes":sc?.label} <span style={{ opacity:0.7 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {demandesErreur && (
          <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3", borderRadius:"12px",
            padding:"14px 16px", color:"#CC3333", fontSize:"13px", marginBottom:"16px" }}>
             {demandesErreur}
          </div>
        )}

        {demandesLoading && <div style={{ ...S.card, textAlign:"center", padding:"60px", color:"#6B9A7A" }}> Chargement...</div>}

        {!demandesLoading && demandesFiltrees.length === 0 && (
          <div style={{ ...S.card, textAlign:"center", padding:"60px", color:"#6B9A7A" }}>
            <div style={{ fontSize:"48px", marginBottom:"12px" }}></div>
            <p>Aucune demande{filtreStatut!=="tous"?" avec ce statut":""}.</p>
          </div>
        )}

        {!demandesLoading && demandesFiltrees.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {demandesFiltrees.map(d => {
              const sc  = STATUT_COLORS[d.statut] || STATUT_COLORS["en_attente"];
              const typ = TYPES_REQUETES.find(t=>t.id===d.typeRequete);
              const sel = demandeSelectee?._id===d._id;
              return (
                <div key={d._id} onClick={()=>setDemandeSelectee(sel?null:d)}
                  style={{ ...S.card, cursor:"pointer", padding:"18px 22px",
                    border:sel?"2px solid #4DC97A":"1px solid #EAF0EB",
                    background:sel?"#F0FAF4":"#fff", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap", marginBottom:"6px" }}>
                        <span style={{ fontSize:"18px" }}>{typ?.icon||""}</span>
                        <span style={{ fontWeight:700, fontSize:"14px", color:"#0A3D1F" }}>{typ?.label||d.typeRequete}</span>
                        <span style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}33`,
                          borderRadius:"100px", padding:"2px 10px", fontSize:"11px", fontWeight:700 }}>
                          {sc.label}
                        </span>
                        {d.nbRelances > 0 && (
                          <span style={{ background:"rgba(106,63,204,0.1)", color:"#6A3FCC",
                            borderRadius:"100px", padding:"2px 8px", fontSize:"10px", fontWeight:700 }}>
                             {d.nbRelances}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize:"12px", color:"#6B9A7A" }}>
                        Réf. <strong>{d._id?.slice(-6).toUpperCase()}</strong>
                        {d.contact && <> · {d.contact}</>}
                        {d.telephone && <> · {d.telephone}</>}
                        {" · "}{d.createdAt ? new Date(d.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}) : "—"}
                      </div>
                      {d.description && (
                        <p style={{ fontSize:"12px", color:"#6B9A7A", margin:"6px 0 0",
                          overflow:"hidden", display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>
                          {d.description}
                        </p>
                      )}
                    </div>
                    <span style={{ color:"#ccc", marginLeft:"12px" }}>{sel?"▲":"▼"}</span>
                  </div>

                  {actionMsg.id===d._id && actionMsg.texte && (
                    <div style={{ marginTop:"10px", padding:"8px 14px", borderRadius:"8px", fontSize:"12px",
                      background:actionMsg.type==="succes"?"#E8F5EE":"#FFF0F0",
                      color:actionMsg.type==="succes"?"#1A7A40":"#CC3333",
                      border:`1px solid ${actionMsg.type==="succes"?"#C0D8C8":"#FFB3B3"}` }}>
                      {actionMsg.texte}
                    </div>
                  )}

                  {sel && (
                    <div style={{ marginTop:"14px", paddingTop:"14px", borderTop:"1px solid #EAF0EB",
                      display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {d.statut!=="en_cours" && d.statut!=="annule" && (
                        <button onClick={e=>{e.stopPropagation();changerStatut(d._id,"en_cours");}} disabled={statutLoading===d._id}
                          style={{ padding:"7px 14px", borderRadius:"8px", background:"#EFF6FF", color:"#1E60CC",
                            border:"none", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                            opacity:statutLoading===d._id?0.6:1 }}>
                           Prendre en charge
                        </button>
                      )}
                      {d.statut!=="traite" && d.statut!=="annule" && (
                        <button onClick={e=>{e.stopPropagation();changerStatut(d._id,"traite");}} disabled={statutLoading===d._id}
                          style={{ padding:"7px 14px", borderRadius:"8px", background:"#E8F5EE", color:"#1A7A40",
                            border:"none", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                            opacity:statutLoading===d._id?0.6:1 }}>
                           Marquer traité
                        </button>
                      )}
                      {d.statut!=="rejete" && d.statut!=="annule" && (
                        <button onClick={e=>{e.stopPropagation();changerStatut(d._id,"rejete");}} disabled={statutLoading===d._id}
                          style={{ padding:"7px 14px", borderRadius:"8px", background:"#FFF0F0", color:"#CC3333",
                            border:"none", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                            opacity:statutLoading===d._id?0.6:1 }}>
                           Rejeter
                        </button>
                      )}
                      <button onClick={e=>{e.stopPropagation();setNoteModal({open:true,id:d._id,texte:""}); }}
                        style={{ padding:"7px 14px", borderRadius:"8px", background:"#F5F0FF", color:"#6A3FCC",
                          border:"none", fontSize:"12px", fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                         Note
                      </button>
                      {d.contact && (
                        <a href={`mailto:${d.contact}`} onClick={e=>e.stopPropagation()}
                          style={{ padding:"7px 14px", borderRadius:"8px", background:"#FFF8E6", color:"#B8860B",
                            border:"none", fontSize:"12px", fontWeight:700, cursor:"pointer",
                            textDecoration:"none", fontFamily:"inherit" }}>
                           Contacter
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panneau détail */}
      {demandeSelectee && (
        <div style={{ ...S.card, position:"sticky", top:"20px", height:"fit-content",
          border:"2px solid #4DC97A", maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", fontWeight:700, color:"#0A3D1F" }}>
              Détail
            </div>
            <button onClick={()=>setDemandeSelectee(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"20px", color:"#aaa" }}>✕</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {[
              { label:"Référence",      value:demandeSelectee._id?.slice(-6).toUpperCase() },
              { label:"Type",           value:TYPES_REQUETES.find(t=>t.id===demandeSelectee.typeRequete)?.label||demandeSelectee.typeRequete },
              { label:"Statut",         value:STATUT_COLORS[demandeSelectee.statut]?.label||demandeSelectee.statut },
              { label:"Contact",        value:demandeSelectee.contact||"—" },
              { label:"Téléphone",      value:demandeSelectee.telephone||"—" },
              { label:"Montant estimé", value:demandeSelectee.montantEstime ? `${demandeSelectee.montantEstime.toLocaleString("fr-FR")} FCFA` : "Sur devis" },
              { label:"Relances",       value:demandeSelectee.nbRelances||0 },
              { label:"Date",           value:demandeSelectee.createdAt ? new Date(demandeSelectee.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}) : "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:"#F7FAF8", borderRadius:"10px", padding:"10px 14px" }}>
                <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"3px" }}>{label}</div>
                <div style={{ fontSize:"13px", fontWeight:600, color:"#0A3D1F" }}>{value}</div>
              </div>
            ))}

            {demandeSelectee.regions?.length > 0 && (
              <div style={{ background:"#F7FAF8", borderRadius:"10px", padding:"10px 14px" }}>
                <div style={S.label}>Régions</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                  {demandeSelectee.regions.map(r => (
                    <span key={r} style={{ background:"#E8F5EE", color:"#1A7A40", borderRadius:"100px", padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>{r}</span>
                  ))}
                </div>
              </div>
            )}

            {demandeSelectee.description && (
              <div style={{ background:"#F7FAF8", borderRadius:"10px", padding:"10px 14px" }}>
                <div style={S.label}>Description</div>
                <p style={{ fontSize:"12px", color:"#333", lineHeight:1.6, margin:0 }}>{demandeSelectee.description}</p>
              </div>
            )}

            {demandeSelectee.notes?.length > 0 && (
              <div style={{ background:"#F5F0FF", borderRadius:"10px", padding:"12px 14px" }}>
                <div style={{ ...S.label, color:"#6A3FCC" }}>Notes internes</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {demandeSelectee.notes.map((n,i) => (
                    <div key={i} style={{ background:"#fff", borderRadius:"8px", padding:"8px 12px" }}>
                      <p style={{ margin:"0 0 4px", fontSize:"12px", color:"#333", lineHeight:1.5 }}>{n.texte}</p>
                      <span style={{ fontSize:"10px", color:"#6B9A7A" }}>
                        {n.auteur?.prenom} {n.auteur?.nom} · {n.createdAt ? new Date(n.createdAt).toLocaleDateString("fr-FR") : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {demandeSelectee.historiqueStatuts?.length > 0 && (
              <div style={{ background:"#F7FAF8", borderRadius:"10px", padding:"12px 14px" }}>
                <div style={S.label}>Historique statuts</div>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {demandeSelectee.historiqueStatuts.map((h,i) => {
                    const sc = STATUT_COLORS[h.statut] || STATUT_COLORS["en_attente"];
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"11px" }}>
                        <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:sc.color, flexShrink:0 }}/>
                        <span style={{ fontWeight:600, color:sc.color }}>{sc.label}</span>
                        <span style={{ color:"#6B9A7A" }}>
                          {h.date ? new Date(h.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"}) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal note */}
      {noteModal.open && (
        <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.45)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
          onClick={()=>setNoteModal({open:false,id:null,texte:""})}>
          <div style={{ background:"#fff", borderRadius:"20px", padding:"36px",
            maxWidth:"480px", width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.2)" }}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", color:"#0A3D1F", margin:"0 0 6px" }}>
               Note interne
            </h3>
            <p style={{ color:"#6B9A7A", fontSize:"13px", margin:"0 0 18px" }}>Visible uniquement par les gestionnaires et admins.</p>
            <textarea value={noteModal.texte} onChange={e=>setNoteModal(n=>({...n,texte:e.target.value}))}
              placeholder="Votre commentaire..." style={{ ...S.textarea, marginBottom:"16px" }} autoFocus/>
            <div style={{ display:"flex", gap:"10px" }}>
              <button style={S.btn} onClick={ajouterNote} disabled={!noteModal.texte.trim()||noteLoading}>
                {noteLoading?" Enregistrement...":"Enregistrer"}
              </button>
              <button style={S.btnGhost} onClick={()=>setNoteModal({open:false,id:null,texte:""})}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPublications = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#0A3D1F", margin:0 }}>Publications</h2>
          <p style={{ color:"#6B9A7A", fontSize:"13px", margin:"4px 0 0" }}>
            {pubs.length} publication{pubs.length!==1?"s":""} · {pubs.filter(p=>p.statut==="publié").length} publiée{pubs.filter(p=>p.statut==="publié").length!==1?"s":""}
          </p>
        </div>
        <button style={S.btn} onClick={()=>{ setEditPub(null); setFormPub({titre:"",cat:"Rapport",contenu:"",statut:"brouillon"}); setShowFormPub(true); }}>
           Nouvelle publication
        </button>
      </div>

      {showFormPub && (
        <div style={{ ...S.card, marginBottom:"20px", border:"2px solid #4DC97A" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px", fontWeight:700, color:"#0A3D1F", marginBottom:"20px" }}>
            {editPub?" Modifier":" Nouvelle publication"}
          </div>
          <div style={{ display:"grid", gap:"14px" }}>
            <div>
              <label style={S.label}>Titre *</label>
              <input style={S.input} value={formPub.titre} onChange={e=>setFormPub(f=>({...f,titre:e.target.value}))} placeholder="Titre..."/>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
              <div>
                <label style={S.label}>Catégorie</label>
                <select style={S.input} value={formPub.cat} onChange={e=>setFormPub(f=>({...f,cat:e.target.value}))}>
                  {CATS_PUB.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>Statut</label>
                <select style={S.input} value={formPub.statut} onChange={e=>setFormPub(f=>({...f,statut:e.target.value}))}>
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié directement</option>
                </select>
              </div>
            </div>
            <div>
              <label style={S.label}>Contenu</label>
              <textarea style={S.textarea} value={formPub.contenu} onChange={e=>setFormPub(f=>({...f,contenu:e.target.value}))} placeholder="Contenu..."/>
            </div>
            {pubError && <div style={{ padding:"10px 14px", background:"#FFF0F0", color:"#CC3333", borderRadius:"10px", fontSize:"13px" }}> {pubError}</div>}
            <div style={{ display:"flex", gap:"10px" }}>
              <button style={S.btn} onClick={sauvegarderPub} disabled={pubLoading}>{pubLoading?"⏳ Sauvegarde...":editPub?"Enregistrer":"Créer"}</button>
              <button style={S.btnGhost} onClick={()=>{ setShowFormPub(false); setEditPub(null); setPubError(""); }}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {pubsLoading ? (
        <div style={{ ...S.card, textAlign:"center", padding:"48px", color:"#6B9A7A" }}> Chargement...</div>
      ) : (
        <div style={S.card}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #EAF0EB" }}>
                {["Titre","Catégorie","Date","Statut","Vues","Actions"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pubs.map((p,i)=>(
                <tr key={p.id} style={{ borderBottom:"1px solid #EAF0EB", background:i%2===0?"#fff":"#FAFCFB" }}>
                  <td style={{ padding:"12px 14px", fontWeight:700, color:"#0A3D1F", maxWidth:"240px" }}>
                    <div style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.titre}</div>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ background:"#E8F5EE", color:"#0A3D1F", borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:600 }}>{p.cat}</span>
                  </td>
                  <td style={{ padding:"12px 14px", color:"#6B9A7A" }}>{p.date}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ background:p.statut==="publié"?"rgba(77,201,122,0.12)":"rgba(212,168,48,0.12)",
                      color:p.statut==="publié"?"#1A7A40":"#B8860B", borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                      {p.statut}
                    </span>
                  </td>
                  <td style={{ padding:"12px 14px", color:"#6B9A7A", fontWeight:600 }}>{p.vues}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button onClick={()=>{ setEditPub(p); setFormPub({titre:p.titre,cat:p.cat,contenu:"",statut:p.statut}); setShowFormPub(true); }}
                        style={{ padding:"5px 10px", borderRadius:"7px", background:"#E8F5EE", border:"none", color:"#0A3D1F", fontSize:"12px", fontWeight:600, cursor:"pointer" }}></button>
                      {p.statut==="brouillon" && (
                        <button onClick={()=>publierPub(p.id)}
                          style={{ padding:"5px 12px", borderRadius:"7px", background:"#4DC97A", border:"none", color:"#fff", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                          Publier
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pubs.length===0 && <div style={{ textAlign:"center", padding:"40px", color:"#6B9A7A" }}>Aucune publication</div>}
        </div>
      )}
    </div>
  );

  const renderUtilisateurs = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#0A3D1F", margin:0 }}>Utilisateurs</h2>
          <p style={{ color:"#6B9A7A", fontSize:"13px", margin:"4px 0 0" }}>Consultation uniquement · {users.length} comptes</p>
        </div>
        <input style={{ ...S.input, width:"260px" }} placeholder=" Rechercher..." value={searchUser} onChange={e=>setSearchUser(e.target.value)}/>
      </div>
      <div style={{ background:"#FFFBEB", border:"1px solid #F0D58C", borderRadius:"12px",
        padding:"12px 18px", marginBottom:"20px", fontSize:"13px", color:"#92700A",
        display:"flex", alignItems:"center", gap:"10px" }}>
        <span></span> Accès en lecture seule. La gestion des comptes est réservée à l'administrateur.
      </div>
      {usersLoading ? (
        <div style={{ ...S.card, textAlign:"center", padding:"48px", color:"#6B9A7A" }}> Chargement...</div>
      ) : (
        <div style={S.card}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #EAF0EB" }}>
                {["Utilisateur","Email","Rôle","Pack","Statut","Inscrit le"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:"11px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.06em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usersFiltres.map((u,i)=>(
                <tr key={u.id} style={{ borderBottom:"1px solid #EAF0EB", background:i%2===0?"#fff":"#FAFCFB" }}>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:"#E8F5EE",
                        display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"12px", color:"#0A3D1F", flexShrink:0 }}>
                        {u.prenom?.[0]}{u.nom?.[0]}
                      </div>
                      <span style={{ fontWeight:700, color:"#0A3D1F" }}>{u.prenom} {u.nom}</span>
                    </div>
                  </td>
                  <td style={{ padding:"12px 14px", color:"#6B9A7A", fontSize:"12px" }}>{u.email}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ background:u.role==="manager"?"rgba(74,158,255,0.1)":"rgba(77,201,122,0.1)",
                      color:u.role==="manager"?"#1E60CC":"#1A7A40",
                      borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding:"12px 14px", fontWeight:600, color:"#0A3D1F" }}>{u.pack}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ background:u.statut==="actif"?"rgba(77,201,122,0.1)":"rgba(232,85,85,0.1)",
                      color:u.statut==="actif"?"#1A7A40":"#CC3333",
                      borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                      {u.statut}
                    </span>
                  </td>
                  <td style={{ padding:"12px 14px", color:"#6B9A7A" }}>{u.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {usersFiltres.length===0 && <div style={{ textAlign:"center", padding:"40px", color:"#6B9A7A" }}>Aucun utilisateur trouvé</div>}
        </div>
      )}
    </div>
  );

  const renderActivites = () => (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#0A3D1F", margin:0 }}>Journal d'activités</h2>
          <p style={{ color:"#6B9A7A", fontSize:"13px", margin:"4px 0 0" }}>
            {activites.length} activité{activites.length!==1?"s":""} enregistrée{activites.length!==1?"s":""}
          </p>
        </div>
        <button style={S.btn} onClick={chargerActivites} disabled={activitesLoading}>{activitesLoading?"":""} Actualiser</button>
      </div>
      <div style={S.card}>
        {activitesLoading ? (
          <div style={{ textAlign:"center", padding:"48px", color:"#6B9A7A" }}> Chargement...</div>
        ) : activites.length===0 ? (
          <div style={{ textAlign:"center", padding:"48px", color:"#6B9A7A" }}>
            <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
            Aucune activité enregistrée
          </div>
        ) : activites.map((a,i)=>(
          <div key={a._id||i} style={{ display:"flex", gap:"14px", padding:"14px 0",
            borderBottom:i<activites.length-1?"1px solid #EAF0EB":"none" }}>
            <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:"#F0F8F3",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}></div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"13px", color:"#0A3D1F", fontWeight:500, lineHeight:1.5 }}>
                {a.description||"Recherche effectuée"}
              </div>
              {a.user && <div style={{ fontSize:"11px", color:"#4DC97A", fontWeight:600, marginTop:"2px" }}>{a.user}</div>}
              <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"2px" }}>
                {a.createdAt ? new Date(a.createdAt).toLocaleString("fr-FR",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
              </div>
            </div>
            <span style={{ background:"rgba(77,201,122,0.1)", color:"#1A7A40", borderRadius:"100px",
              padding:"3px 10px", fontSize:"11px", fontWeight:700, alignSelf:"flex-start", flexShrink:0 }}>
              {a.resultatCount??a.nbResultats??0} résultat{(a.resultatCount??0)>1?"s":""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const RENDERS = { dashboard:renderDashboard, demandes:renderDemandes, publications:renderPublications, utilisateurs:renderUtilisateurs, activites:renderActivites };

  if (!managerUser) return <ManagerLogin onSuccess={u=>setManagerUser(u)} />;

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F2F7F3" }}>

      {/* SIDEBAR */}
      <aside style={{ width:sidebarOpen?"250px":"70px", background:"#00904C",
        flexShrink:0, display:"flex", flexDirection:"column", transition:"width 0.25s ease",
        overflow:"hidden", position:"sticky", top:0, height:"100vh",
        boxShadow:"4px 0 20px rgba(0,0,0,0.15)" }}>

        <div style={{ padding:sidebarOpen?"24px 20px 20px":"24px 14px 20px",
          borderBottom:"1px solid rgba(255,255,255,0.06)",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", fontWeight:900, color:"#fff" }}>
                NERE <span style={{ color:"#4DC97A" }}>Gestion</span>
              </div>
              <div style={{ fontSize:"10px", color:"#ffffff", marginTop:"3px", textTransform:"uppercase", letterSpacing:"0.08em" }}>
                CCI-BF · Gestionnaire
              </div>
            </div>
          )}
          <button onClick={()=>setSidebar(o=>!o)} style={{ background:"rgba(255,255,255,0.06)", border:"none",
            borderRadius:"8px", width:"32px", height:"32px", flexShrink:0,
            color:"rgba(255,255,255,0.35)", cursor:"pointer", fontSize:"13px" }}>
            {sidebarOpen?"◀":"▶"}
          </button>
        </div>

        <nav style={{ flex:1, padding:"14px 10px" }}>
          {NAV.map(item => {
            const active = section===item.id;
            return (
              <button key={item.id} onClick={()=>setSection(item.id)} style={{
                width:"100%", display:"flex", alignItems:"center",
                gap:sidebarOpen?"12px":"0", justifyContent:sidebarOpen?"flex-start":"center",
                padding:sidebarOpen?"11px 14px":"11px", borderRadius:"12px", border:"none",
                cursor:"pointer", background:active?"#77bca5":"transparent",
                color:active?"#050d08":"rgba(255,255,255,0.45)",
                fontWeight:active?700:500, fontSize:"13px", fontFamily:"inherit",
                marginBottom:"4px", transition:"all 0.15s", position:"relative",
              }}>
                <span style={{ fontSize:"19px", flexShrink:0 }}>{item.icone}</span>
                {sidebarOpen && <span style={{ flex:1, textAlign:"left" }}>{item.label}</span>}
                {item.id==="demandes" && nbAttente > 0 && (
                  <span style={{ background:"#FF6B6B", color:"#fff", borderRadius:"100px",
                    padding:"1px 7px", fontSize:"10px", fontWeight:800, flexShrink:0,
                    position:sidebarOpen?"static":"absolute", top:sidebarOpen?"auto":"6px", right:sidebarOpen?"auto":"6px" }}>
                    {nbAttente}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={()=>navigate("/")} style={{ width:"100%", display:"flex", alignItems:"center",
            gap:sidebarOpen?"12px":"0", justifyContent:sidebarOpen?"flex-start":"center",
            padding:sidebarOpen?"10px 14px":"10px", borderRadius:"10px", border:"none",
            cursor:"pointer", background:"#77bca5", color:"#ffffff",
            fontSize:"13px", fontFamily:"inherit" }}>
            <span style={{ fontSize:"18px" }}></span>
            {sidebarOpen && <span>Voir le site</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto" }}>
        <div style={{ background:"#fff", borderBottom:"1px solid #E8EEE9", padding:"0 32px", height:"64px",
          display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0,
          boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ fontSize:"20px" }}>{NAV.find(n=>n.id===section)?.icone}</span>
            <span style={{ fontWeight:700, fontSize:"16px", color:"#00904C" }}>{NAV.find(n=>n.id===section)?.label}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <span style={{ background:"rgba(77,201,122,0.12)", color:"#1A7A40", borderRadius:"100px", padding:"4px 12px", fontSize:"11px", fontWeight:700 }}>
              🟢 Gestionnaire
            </span>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"10px",
                background:"linear-gradient(135deg,#0A3D1F,#1A7A40)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#4DC97A", fontWeight:800, fontSize:"13px" }}>
                {managerUser?.prenom?.[0]}{managerUser?.nom?.[0]}
              </div>
              <div>
                <div style={{ fontSize:"13px", fontWeight:700, color:"#0A3D1F" }}>{managerUser?.prenom} {managerUser?.nom}</div>
                <div style={{ fontSize:"11px", color:"#6B9A7A" }}>{managerUser?.email}</div>
              </div>
            </div>
            <button onClick={()=>{ setManagerUser(null); localStorage.removeItem("token"); localStorage.removeItem("user"); }}
              style={{ padding:"8px 16px", borderRadius:"10px", background:"#FFF0F0",
                border:"1px solid #FFD0D0", color:"#CC3333", fontWeight:700,
                fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>
               Déconnexion
            </button>
          </div>
        </div>

        <div style={{ padding:"28px 32px", flex:1 }}>
          {RENDERS[section]?.()}
        </div>
      </main>
    </div>
  );
}