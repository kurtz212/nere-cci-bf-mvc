import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]         = useState(null);
  const [pubs, setPubs]         = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const u     = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!u) { navigate("/connexion"); return; }
    setUser(u);
    chargerDonnees(token);
  }, [navigate]);

  const chargerDonnees = async (token) => {
    setLoading(true);
    try {
      // Publications récentes
      const resPubs = await fetch("http://localhost:5000/api/publications?limit=5");
      const dataPubs = await resPubs.json();
      if (dataPubs.success) setPubs(dataPubs.data);

      // Mes demandes
      if (token) {
        const resDem = await fetch("http://localhost:5000/api/demandes/mes-demandes", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const dataDem = await resDem.json();
        if (dataDem.success) setDemandes(dataDem.data);
      }
    } catch(e) {
      console.warn("Erreur chargement:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (!user) return null;

  const initiales = `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase();

  const MENU = [
    {  label:"Accueil",           path:"/"                  },
    { label:"Recherche",          path:"/recherche"         },
    {  label:"Publications",       path:"/publications"      },
    {  label:"Demande document",   path:"/demande-document"  },
    {  label:"Chat",               path:"/chat"              },
    {  label:"Mon Profil",         path:"/profil"            },
    {  label:"Abonnement",         path:"/paiement"          },
  ];

  const statutCouleur = (s) => ({
    "en_attente": "#D4A830",
    "en_cours":   "#4A9EFF",
    "traite":     "#4DC97A",
    "rejete":     "#FF6B6B",
  }[s] || "#999");

  return (
    <div style={{ display:"flex", minHeight:"100vh",
      fontFamily:"'Plus Jakarta Sans',sans-serif", background:"#F5FAF7" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:"240px", background:"#ffffff", flexShrink:0,
        display:"flex", flexDirection:"column", position:"sticky",
        top:0, height:"100vh" }}>

        {/* Logo */}
        <div style={{ padding:"20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px",
            fontWeight:900, color:"#ED1C24", cursor:"pointer" }}
            onClick={() => navigate("/")}>
            NERE <span style={{ color:"#090909" }}>CCI-BF</span>
          </div>
          <div style={{ fontSize:"10px", color:"#090909", marginTop:"2px" }}>
            Espace utilisateur
          </div>
        </div>

        {/* Avatar */}
        <div style={{ padding:"20px", borderBottom:"1px solid rgba(7, 7, 7, 0.08)",
          display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"40px", height:"40px", borderRadius:"12px",
            background:"rgba(164, 112, 216, 0.2)", display:"flex", alignItems:"center",
            justifyContent:"center", fontWeight:800, fontSize:"16px",
            color:"#4DC97A", flexShrink:0 }}>
            {initiales}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:"13px", color:"#0b0b0b" }}>
              {user.prenom} {user.nom}
            </div>
            <div style={{ fontSize:"11px", color:"rgba(11, 11, 11, 0.4)" }}>
              {user.role === "admin" ? " Admin" : user.typeCompte || "Utilisateur"}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:"12px 8px" }}>
          {MENU.map(item => (
            <button key={item.path}
              onClick={() => navigate(item.path)}
              style={{ width:"100%", display:"flex", alignItems:"center",
                gap:"10px", padding:"10px 12px", borderRadius:"10px",
                border:"none", cursor:"pointer", background:"transparent",
                color:"#090909", fontWeight:500,
                fontSize:"13px", fontFamily:"inherit", marginBottom:"4px",
                transition:"all 0.15s", textAlign:"left" }}>
              <span style={{ fontSize:"18px" }}>{item.icone}</span>
              <span>{item.label}</span>
            </button>
          ))}
          {user.role === "admin" && (
            <button onClick={() => navigate("/admin")}
              style={{ width:"100%", display:"flex", alignItems:"center",
                gap:"10px", padding:"10px 12px", borderRadius:"10px",
                border:"none", cursor:"pointer",
                background:"rgba(171, 122, 31, 0.1)",
                color:"#4DC97A", fontWeight:700,
                fontSize:"13px", fontFamily:"inherit",
                marginBottom:"4px", textAlign:"left" }}>
              <span style={{ fontSize:"18px" }}></span>
              <span>Administration</span>
            </button>
          )}
        </nav>

        {/* Déconnexion */}
        <div style={{ padding:"12px 8px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout}
            style={{ width:"100%", display:"flex", alignItems:"center",
              gap:"10px", padding:"10px 12px", borderRadius:"10px",
              border:"none", cursor:"pointer", background:"rgba(255,100,100,0.1)",
              color:"#FF8080", fontWeight:600, fontSize:"13px",
              fontFamily:"inherit" }}>
            <span style={{ fontSize:"18px" }}></span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── CONTENU PRINCIPAL ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"auto" }}>

        {/* Topbar */}
        <div style={{ background:"#fff", borderBottom:"1px solid #E2EDE6",
          padding:"0 28px", height:"60px", display:"flex",
          alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ fontWeight:700, fontSize:"15px", color:"#3d0a0a" }}>
             Bonjour, {user.prenom} !
          </div>
          <div style={{ fontSize:"13px", color:"#6B9A7A" }}>
            {new Date().toLocaleDateString("fr-FR", {weekday:"long", day:"numeric", month:"long", year:"numeric"})}
          </div>
        </div>

        <div style={{ padding:"28px" }}>

          {/* KPIs utilisateur */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
            gap:"16px", marginBottom:"24px" }}>
            {[
              {  label:"Publications disponibles", val: pubs.length,    couleur:"#4A9EFF" },
              {  label:"Mes demandes",             val: demandes.length, couleur:"#4DC97A" },
              {  label:"Mon pack",                 val: user.role === "admin" ? "Admin" : (user.pack || "Gratuit"), couleur:"#D4A830" },
            ].map(k => (
              <div key={k.label} style={{ background:"#fff", borderRadius:"14px",
                border:"1px solid #E2EDE6", padding:"20px",
                display:"flex", alignItems:"center", gap:"14px" }}>
                <div style={{ width:"48px", height:"48px", borderRadius:"12px",
                  background:`${k.couleur}18`, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
                  {k.icone}
                </div>
                <div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px",
                    fontWeight:900, color:"#0A3D1F" }}>
                    {loading ? "..." : k.val}
                  </div>
                  <div style={{ fontSize:"12px", color:"#6B9A7A", fontWeight:600 }}>
                    {k.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>

            {/* Publications récentes */}
            <div style={{ background:"#fff", borderRadius:"14px",
              border:"1px solid #E2EDE6", padding:"22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"16px" }}>
                <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F" }}>
                   Publications récentes
                </div>
                <button onClick={() => navigate("/publications")}
                  style={{ fontSize:"12px", color:"#4DC97A", background:"none",
                    border:"none", cursor:"pointer", fontWeight:600 }}>
                  Voir tout →
                </button>
              </div>
              {loading ? (
                <div style={{ textAlign:"center", padding:"20px",
                  color:"#6B9A7A", fontSize:"13px" }}>⏳ Chargement...</div>
              ) : pubs.length === 0 ? (
                <div style={{ textAlign:"center", padding:"20px",
                  color:"#6B9A7A", fontSize:"13px" }}>Aucune publication</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {pubs.slice(0,4).map(p => (
                    <div key={p._id} style={{ padding:"10px 12px",
                      background:"#F5FAF7", borderRadius:"8px",
                      cursor:"pointer" }}
                      onClick={() => navigate("/publications")}>
                      <div style={{ fontWeight:600, fontSize:"13px",
                        color:"#0A3D1F", marginBottom:"3px" }}>
                        {p.titre}
                      </div>
                      <div style={{ fontSize:"11px", color:"#6B9A7A" }}>
                        {p.categorie} · {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mes demandes */}
            <div style={{ background:"#fff", borderRadius:"14px",
              border:"1px solid #E2EDE6", padding:"22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"16px" }}>
                <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F" }}>
                   Mes demandes de documents
                </div>
                <button onClick={() => navigate("/demande-document")}
                  style={{ fontSize:"12px", color:"#4DC97A", background:"none",
                    border:"none", cursor:"pointer", fontWeight:600 }}>
                  + Nouvelle
                </button>
              </div>
              {loading ? (
                <div style={{ textAlign:"center", padding:"20px",
                  color:"#6B9A7A", fontSize:"13px" }}>Chargement...</div>
              ) : demandes.length === 0 ? (
                <div style={{ textAlign:"center", padding:"30px 20px" }}>
                  <div style={{ fontSize:"32px", marginBottom:"8px" }}></div>
                  <div style={{ fontSize:"13px", color:"#6B9A7A",
                    marginBottom:"14px" }}>
                    Aucune demande pour l'instant
                  </div>
                  <button onClick={() => navigate("/demande-document")}
                    style={{ padding:"8px 18px", borderRadius:"8px",
                      background:"#0A3D1F", color:"#fff", border:"none",
                      fontWeight:600, fontSize:"13px", cursor:"pointer",
                      fontFamily:"inherit" }}>
                    Faire une demande
                  </button>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  {demandes.slice(0,4).map(d => (
                    <div key={d._id} style={{ padding:"10px 12px",
                      background:"#F5FAF7", borderRadius:"8px",
                      display:"flex", justifyContent:"space-between",
                      alignItems:"center" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:"13px",
                          color:"#0A3D1F", marginBottom:"2px" }}>
                          {d.typeRequete || "Demande"}
                        </div>
                        <div style={{ fontSize:"11px", color:"#6B9A7A" }}>
                          {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <span style={{ background:`${statutCouleur(d.statut)}18`,
                        color:statutCouleur(d.statut), borderRadius:"100px",
                        padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>
                        {d.statut?.replace("_"," ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Accès rapide */}
          <div style={{ background:"#fff", borderRadius:"14px",
            border:"1px solid #E2EDE6", padding:"22px", marginTop:"20px" }}>
            <div style={{ fontWeight:700, fontSize:"15px", color:"#0A3D1F",
              marginBottom:"16px" }}> Accès rapide</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
              {[
                {  label:"Rechercher une entreprise", path:"/recherche",        bg:"#E8F5EE", color:"#0A3D1F" },
                {  label:"Demander un document",      path:"/demande-document", bg:"#E8F0FF", color:"#3366CC" },
                {  label:"Voir les publications",     path:"/publications",     bg:"#FFF5E8", color:"#CC6600" },
                {  label:"Contacter un agent",        path:"/contact",          bg:"#F0FFF5", color:"#007A3F" },
              ].map(item => (
                <button key={item.path}
                  onClick={() => navigate(item.path)}
                  style={{ padding:"16px", borderRadius:"12px",
                    background:item.bg, border:"none", cursor:"pointer",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", gap:"8px",
                    fontFamily:"inherit", transition:"transform 0.15s" }}>
                  <span style={{ fontSize:"28px" }}>{item.icone}</span>
                  <span style={{ fontSize:"12px", fontWeight:600,
                    color:item.color, textAlign:"center", lineHeight:1.3 }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}