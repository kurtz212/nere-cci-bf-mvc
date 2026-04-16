import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.jpg";

const ENTREPRISES_MOCK = [
  { id:1, nom:"SOCOGEB SARL", raisonSociale:"SOCOGEB", rccm:"RCCM-BF-OUA-2020-B-1111", ifu:"IFU-BF-001234", ville:"Ouagadougou" },
  { id:2, nom:"AGRO-BF SA",   raisonSociale:"AGRO-BF", rccm:"RCCM-BF-BOB-2021-B-2222", ifu:"IFU-BF-005678", ville:"Bobo-Dioulasso" },
  { id:3, nom:"BATIKO SARL",  raisonSociale:"BATIKO",  rccm:"RCCM-BF-OUA-2019-B-3333", ifu:"IFU-BF-009012", ville:"Ouagadougou" },
  { id:4, nom:"TRANS SAHEL",  raisonSociale:"TRANS SAHEL", rccm:"RCCM-BF-KDG-2018-B-4444", ifu:"IFU-BF-003456", ville:"Koudougou" },
];

export default function RechercheEntreprise() {
  const navigate = useNavigate();

  const [user, setUser]           = useState(null);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [checked, setChecked]     = useState(false);
  const [onglet, setOnglet]       = useState("recherche");
  const [loading, setLoading]     = useState(false);
  const [resultats, setResultats] = useState([]);
  const [rechercheFaite, setRechercheFaite] = useState(false);
  const [form, setForm]           = useState({ rccm:"", ifu:"", raisonSociale:"" });
  const [historique, setHistorique]           = useState([]);
  const [histoLoading, setHistoLoading]       = useState(false);
  const [histoErreur, setHistoErreur]         = useState("");
  const [replayLoadingId, setReplayLoadingId] = useState(null);
  const [replayMessage, setReplayMessage]     = useState({ id:null, texte:"", type:"" });

  /* ── Vérification connexion ── */
  useEffect(() => {
    const u     = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (u && token) {
      setUser(JSON.parse(u));
    } else {
      navigate("/connexion");
    }
    setChecked(true);
  }, [navigate]);

  const chargerHistorique = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoLoading(true);
    setHistoErreur("");
    try {
      const res  = await fetch(
        "http://localhost:5000/api/searchlogs/mon-historique?type=entreprise&limit=50",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setHistorique(data.data || []);
      else setHistoErreur(data.message || "Impossible de charger l'historique.");
    } catch {
      setHistoErreur("Serveur inaccessible.");
    }
    setHistoLoading(false);
  }, []);

  useEffect(() => {
    if (onglet === "historique") chargerHistorique();
  }, [onglet, chargerHistorique]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const initiales = user
    ? `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase()
    : "";

  const relancerRecherche = async (item) => {
    if (!item?._id) return;
    setReplayMessage({ id:null, texte:"", type:"" });
    setReplayLoadingId(item._id);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(
        `http://localhost:5000/api/searchlogs/${item._id}/replay`,
        { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setReplayMessage({
          id: item._id,
          texte: data.updated
            ? "Modification détectée : nouvelle requête enregistrée et facturée."
            : "Aucune mise à jour : résultat servi depuis le cache, non facturé.",
          type: "succes",
        });
        chargerHistorique();
      } else {
        setReplayMessage({ id:item._id, texte:data.message || "Relance impossible.", type:"erreur" });
      }
    } catch {
      setReplayMessage({ id:item._id, texte:"Erreur serveur lors de la relance.", type:"erreur" });
    }
    setReplayLoadingId(null);
    setTimeout(() => setReplayMessage({ id:null, texte:"", type:"" }), 5000);
  };

  const handleRecherche = async (e) => {
    e.preventDefault();
    if (!form.rccm && !form.ifu && !form.raisonSociale) return;
    setLoading(true);
    setRechercheFaite(true);
    await new Promise(r => setTimeout(r, 600));
    let res = ENTREPRISES_MOCK;
    if (form.rccm)          res = res.filter(e => e.rccm.toLowerCase().includes(form.rccm.toLowerCase()));
    if (form.ifu)           res = res.filter(e => e.ifu.toLowerCase().includes(form.ifu.toLowerCase()));
    if (form.raisonSociale) res = res.filter(e => e.raisonSociale.toLowerCase().includes(form.raisonSociale.toLowerCase()));
    setResultats(res);
    setLoading(false);
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/searchlogs", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ type:"entreprise", description:"Recherche entreprise", criteres:form, nbResultats:res.length }),
      }).catch(() => {});
    }
  };

  const handleReset = () => {
    setForm({ rccm:"", ifu:"", raisonSociale:"" });
    setResultats([]);
    setRechercheFaite(false);
  };

  if (!checked) return null;
  if (!user)    return null;

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <style>{`* { font-family: Arial, Helvetica, sans-serif !important; }`}</style>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR ══ */}
        <nav className="dash-navbar">
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <img src={logoNERE} alt="NERE"
              style={{ height:"60px", width:"auto", borderRadius:"6px", flexShrink:0 }}/>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.4 }}>
              <span style={{ fontSize:"11px", fontWeight:800, color:"#ffffff",
                letterSpacing:"0.06em", textTransform:"uppercase" }}>Fichier NERE</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.85)" }}>
                Registre national des entreprises<br/>Du Burkina Faso
              </span>
            </div>
          </div>

          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link" onClick={() => navigate("/publications")}>Publications</span>
            <span className="dash-nav-link active" onClick={() => navigate("/rechercheacc")}>Recherche</span>
            <span className="dash-nav-link" onClick={() => navigate("/contact")}>Contact</span>
            <span className="dash-nav-link" onClick={() => navigate("/chat")}>Chat</span>
          </div>

          <div className="dash-nav-actions">
            <div style={{ position:"relative" }}>
              <div className="user-chip" onClick={() => setMenuOpen(o => !o)}>
                <div className="user-avatar">{initiales}</div>
                <span>{user.prenom} {user.nom}</span>
                <span style={{ fontSize:"10px", opacity:0.5, marginLeft:"2px" }}>▾</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={() => setMenuOpen(false)}/>
                  <div style={{ position:"absolute", zIndex:9999, background:"#00904C",
                    top:"calc(100% + 8px)", right:0, borderRadius:"12px",
                    border:"1px solid rgba(255,255,255,0.15)", minWidth:"200px",
                    overflow:"hidden", boxShadow:"0 10px 30px rgba(0,0,0,0.25)" }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ padding:"16px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontWeight:700, color:"#fff", fontSize:"14px" }}>{user.prenom} {user.nom}</div>
                      <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>{user.email || "—"}</div>
                      <div style={{ fontSize:"11px", color:"#4DC97A", marginTop:"4px", fontWeight:600 }}>
                        {user.role === "admin" ? "Administrateur" : "Pack · Actif"}
                      </div>
                    </div>
                    {[
                      { label:"Mon Profil",     path:"/profil" },
                      { label:"Mon Abonnement", path:"/paiement" },
                      { label:"Historique",     path:"/profil" },
                      { label:"Sécurité",       path:"/profil" },
                      { label:"Notifications",  path:"/profil" },
                    ].map(item => (
                      <div key={item.label}
                        style={{ padding:"11px 16px", color:"rgba(255,255,255,0.85)", fontSize:"13px", cursor:"pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        onClick={() => { navigate(item.path); setMenuOpen(false); }}>
                        {item.label}
                      </div>
                    ))}
                    {user.role === "admin" && (
                      <div style={{ padding:"11px 16px", color:"rgba(255,255,255,0.85)", fontSize:"13px", cursor:"pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        onClick={() => { navigate("/admin"); setMenuOpen(false); }}>
                        Tableau de bord
                      </div>
                    )}
                    {user.role === "manager" && (
                      <div style={{ padding:"11px 16px", color:"rgba(255,255,255,0.85)", fontSize:"13px", cursor:"pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        onClick={() => { navigate("/gestionnaire"); setMenuOpen(false); }}>
                        Tableau de bord
                      </div>
                    )}
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ padding:"11px 16px", color:"#FF6B6B", fontSize:"13px", cursor:"pointer", fontWeight:600 }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,107,107,0.1)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                        onClick={handleLogout}>
                        Déconnexion
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <div className="pub-page-hero" style={{ padding:"36px 48px 28px" }}>
          <div className="pub-page-tag">Registre NERE · CCI-BF</div>
          <h1 className="pub-page-title" style={{ fontSize:"28px", textAlign:"left" }}>
            Recherche d'entreprise
          </h1>
          <p style={{ color:"#6B9A7A", fontSize:"14px", marginTop:"8px" }}>
            Interrogez le registre national par RCCM, IFU ou raison sociale.
          </p>
        </div>

        {/* ══ ONGLETS ══ */}
        <div style={{ background:"#fff", borderBottom:"1px solid var(--border)",
          padding:"0 48px", display:"flex" }}>
          {[
            { key:"recherche",  label:"Recherche" },
            { key:"historique", label:`Mes recherches${historique.length > 0 ? ` (${historique.length})` : ""}` },
          ].map(t => (
            <button key={t.key} onClick={() => setOnglet(t.key)} style={{
              padding:"13px 20px", fontSize:"14px", fontWeight:600,
              background:"transparent", border:"none",
              color: onglet===t.key ? "#00904C" : "rgba(0,0,0,0.45)",
              borderBottom: onglet===t.key ? "2px solid #00904C" : "2px solid transparent",
              cursor:"pointer", transition:"all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"32px 48px 60px", background:"var(--off-white)" }}>

          {/* ── RECHERCHE ── */}
          {onglet === "recherche" && (
            <div style={{ display:"grid", gridTemplateColumns:"380px 1fr", gap:"28px", maxWidth:"1100px" }}>

              {/* Formulaire */}
              <div style={{ background:"#fff", borderRadius:"16px",
                border:"1px solid rgba(0,144,76,0.15)", padding:"28px",
                boxShadow:"0 2px 12px rgba(0,144,76,0.06)", height:"fit-content" }}>
                <h2 style={{ fontSize:"16px", fontWeight:800, color:"#0A2410", marginBottom:"6px" }}>
                  Critères de recherche
                </h2>
                <p style={{ fontSize:"12px", color:"#6B9A7A", marginBottom:"24px" }}>
                  Remplissez au moins un champ pour lancer la recherche.
                </p>
                <form onSubmit={handleRecherche}>
                  {[
                    { key:"rccm",          label:"Numéro RCCM",    placeholder:"ex: RCCM-BF-OUA-2020-B-1111" },
                    { key:"ifu",           label:"Numéro IFU",     placeholder:"ex: IFU-BF-001234" },
                    { key:"raisonSociale", label:"Raison sociale",  placeholder:"ex: SOCOGEB" },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom:"18px" }}>
                      <label style={{ fontSize:"11px", fontWeight:700, color:"#6B9A7A",
                        textTransform:"uppercase", letterSpacing:"0.08em",
                        display:"block", marginBottom:"6px" }}>
                        {f.label}
                      </label>
                      <input
                        value={form[f.key]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{ width:"100%", padding:"11px 14px",
                          background:"#F5FAF7", border:"1.5px solid rgba(0,144,76,0.2)",
                          borderRadius:"8px", color:"#0A2410", fontSize:"13px",
                          boxSizing:"border-box", outline:"none", transition:"border-color 0.2s" }}
                        onFocus={e => e.target.style.borderColor = "#00904C"}
                        onBlur={e  => e.target.style.borderColor = "rgba(0,144,76,0.2)"}
                      />
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
                    <button type="submit"
                      disabled={loading || (!form.rccm && !form.ifu && !form.raisonSociale)}
                      style={{ flex:1, padding:"12px", background:"#00904C", color:"#fff",
                        border:"none", borderRadius:"10px", cursor:"pointer",
                        fontSize:"14px", fontWeight:700,
                        boxShadow:"0 4px 14px rgba(0,144,76,0.3)",
                        opacity: (!form.rccm && !form.ifu && !form.raisonSociale) ? 0.5 : 1 }}>
                      {loading ? "Recherche..." : " Chercher"}
                    </button>
                    <button type="button" onClick={handleReset}
                      style={{ padding:"12px 16px", background:"#fff", color:"#6B9A7A",
                        border:"1.5px solid rgba(0,144,76,0.2)", borderRadius:"10px",
                        cursor:"pointer", fontSize:"14px", fontWeight:600 }}>
                      Réinitialiser
                    </button>
                  </div>
                </form>
              </div>

              {/* Résultats */}
              <div>
                {!rechercheFaite && (
                  <div style={{ background:"#fff", borderRadius:"16px",
                    border:"1px solid rgba(0,144,76,0.12)", padding:"60px 24px",
                    textAlign:"center", color:"#6B9A7A" }}>
                    <div style={{ fontSize:"48px", marginBottom:"16px" }}></div>
                    <div style={{ fontSize:"15px", fontWeight:600, color:"#0A2410", marginBottom:"8px" }}>
                      Lancez une recherche
                    </div>
                    <div style={{ fontSize:"13px" }}>
                      Remplissez au moins un critère et cliquez sur "Chercher".
                    </div>
                  </div>
                )}

                {rechercheFaite && loading && (
                  <div style={{ background:"#fff", borderRadius:"16px",
                    border:"1px solid rgba(0,144,76,0.12)", padding:"60px 24px",
                    textAlign:"center", color:"#6B9A7A" }}>
                    <div style={{ fontSize:"13px" }}>Recherche en cours...</div>
                  </div>
                )}

                {rechercheFaite && !loading && resultats.length === 0 && (
                  <div style={{ background:"#fff", borderRadius:"16px",
                    border:"1px solid rgba(0,144,76,0.12)", padding:"60px 24px",
                    textAlign:"center", color:"#6B9A7A" }}>
                    <div style={{ fontSize:"36px", marginBottom:"12px" }}></div>
                    <div style={{ fontSize:"15px", fontWeight:600, color:"#0A2410", marginBottom:"8px" }}>
                      Aucun résultat trouvé
                    </div>
                    <div style={{ fontSize:"13px" }}>Vérifiez les critères saisis et réessayez.</div>
                  </div>
                )}

                {rechercheFaite && !loading && resultats.length > 0 && (
                  <div>
                    <div style={{ fontSize:"13px", color:"#6B9A7A", marginBottom:"14px", fontWeight:600 }}>
                      {resultats.length} résultat{resultats.length > 1 ? "s" : ""} trouvé{resultats.length > 1 ? "s" : ""}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                      {resultats.map((ent, i) => (
                        <div key={i}
                          style={{ background:"#fff", border:"1px solid rgba(0,144,76,0.15)",
                            borderRadius:"14px", padding:"20px 24px",
                            boxShadow:"0 2px 8px rgba(0,144,76,0.05)", transition:"all 0.2s" }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#00904C";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,144,76,0.12)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "rgba(0,144,76,0.15)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,144,76,0.05)";
                          }}>
                          <div style={{ display:"flex", alignItems:"center",
                            justifyContent:"space-between", marginBottom:"14px" }}>
                            <div style={{ fontWeight:800, color:"#00904C", fontSize:"16px" }}>
                              {ent.nom}
                            </div>
                            <span style={{ background:"rgba(0,144,76,0.08)", color:"#00904C",
                              border:"1px solid rgba(0,144,76,0.2)", borderRadius:"100px",
                              padding:"3px 12px", fontSize:"11px", fontWeight:700 }}>
                              {ent.ville}
                            </span>
                          </div>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
                            {[
                              { label:"RCCM",          value:ent.rccm },
                              { label:"IFU",           value:ent.ifu },
                              { label:"Raison sociale", value:ent.raisonSociale },
                            ].map(({ label, value }) => (
                              <div key={label} style={{ background:"#F5FAF7", borderRadius:"8px", padding:"10px 14px" }}>
                                <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A",
                                  textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"4px" }}>
                                  {label}
                                </div>
                                <div style={{ fontSize:"13px", fontWeight:600, color:"#0A2410" }}>
                                  {value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── HISTORIQUE ── */}
          {onglet === "historique" && (
            <div style={{ maxWidth:"820px" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"20px" }}>
                <div>
                  <h2 style={{ fontSize:"20px", fontWeight:800, color:"#0A2410", margin:0 }}>
                    Historique des recherches
                  </h2>
                  <p style={{ color:"#6B9A7A", fontSize:"13px", margin:"4px 0 0" }}>
                    {historique.length} recherche{historique.length !== 1 ? "s" : ""} enregistrée{historique.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button onClick={chargerHistorique} disabled={histoLoading}
                  style={{ padding:"8px 18px", background:"#00904C", color:"#fff",
                    border:"none", borderRadius:"8px", cursor:"pointer",
                    fontSize:"13px", fontWeight:700 }}>
                  {histoLoading ? "Chargement..." : "Actualiser"}
                </button>
              </div>

              {histoLoading && (
                <div style={{ textAlign:"center", padding:"60px 0", color:"#6B9A7A" }}>
                  <p>Chargement de l'historique...</p>
                </div>
              )}

              {!histoLoading && histoErreur && (
                <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                  borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                  <p style={{ margin:0, fontSize:"14px" }}>{histoErreur}</p>
                  <button onClick={chargerHistorique}
                    style={{ marginTop:"12px", padding:"8px 16px", background:"#CC3333",
                      color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"12px" }}>
                    Réessayer
                  </button>
                </div>
              )}

              {!histoLoading && !histoErreur && historique.length === 0 && (
                <div style={{ background:"#fff", border:"1px solid rgba(0,144,76,0.12)",
                  borderRadius:"16px", padding:"48px", textAlign:"center", color:"#6B9A7A" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                  <p style={{ fontSize:"14px", marginBottom:"16px" }}>Aucune recherche enregistrée.</p>
                  <button onClick={() => setOnglet("recherche")}
                    style={{ padding:"10px 20px", background:"#00904C", color:"#fff",
                      border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"13px", fontWeight:700 }}>
                    Faire une recherche
                  </button>
                </div>
              )}

              {!histoLoading && !histoErreur && historique.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {historique.map((h, i) => (
                    <div key={h._id || i} style={{ background:"#fff",
                      border:"1px solid rgba(0,144,76,0.12)", borderRadius:"14px",
                      padding:"18px 22px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"flex-start", marginBottom:"12px" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:"14px", color:"#0A2410" }}>
                            {h.description || "Recherche d'entreprise"}
                          </div>
                          <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"3px" }}>
                            {h.createdAt
                              ? new Date(h.createdAt).toLocaleDateString("fr-FR",
                                  { day:"2-digit", month:"long", year:"numeric" }) +
                                " à " +
                                new Date(h.createdAt).toLocaleTimeString("fr-FR",
                                  { hour:"2-digit", minute:"2-digit" })
                              : "—"}
                          </div>
                        </div>
                        <span style={{ background:"rgba(0,144,76,0.08)", color:"#00904C",
                          border:"1px solid rgba(0,144,76,0.2)", borderRadius:"100px",
                          padding:"3px 12px", fontSize:"11px", fontWeight:700, flexShrink:0 }}>
                          {h.nbResultats ?? 0} résultat{(h.nbResultats ?? 0) > 1 ? "s" : ""}
                        </span>
                      </div>

                      {h.criteres && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"12px" }}>
                          {h.criteres.rccm && (
                            <span style={{ background:"#E6F4EC", color:"#00904C",
                              border:"1px solid rgba(0,144,76,0.2)", borderRadius:"100px",
                              padding:"2px 10px", fontSize:"11px", fontWeight:600 }}>
                              RCCM : {h.criteres.rccm}
                            </span>
                          )}
                          {h.criteres.ifu && (
                            <span style={{ background:"#E6F4EC", color:"#00904C",
                              border:"1px solid rgba(0,144,76,0.2)", borderRadius:"100px",
                              padding:"2px 10px", fontSize:"11px", fontWeight:600 }}>
                              IFU : {h.criteres.ifu}
                            </span>
                          )}
                          {h.criteres.raisonSociale && (
                            <span style={{ background:"#E6F4EC", color:"#00904C",
                              border:"1px solid rgba(0,144,76,0.2)", borderRadius:"100px",
                              padding:"2px 10px", fontSize:"11px", fontWeight:600 }}>
                              Raison sociale : {h.criteres.raisonSociale}
                            </span>
                          )}
                        </div>
                      )}

                      {replayMessage.id === h._id && replayMessage.texte && (
                        <div style={{ padding:"10px 14px", borderRadius:"8px",
                          fontSize:"12px", marginBottom:"10px",
                          background: replayMessage.type === "succes" ? "#E6F4EC" : "#FFF0F0",
                          color:      replayMessage.type === "succes" ? "#00904C" : "#CC3333",
                          border: `1px solid ${replayMessage.type === "succes" ? "rgba(0,144,76,0.2)" : "#FFB3B3"}` }}>
                          {replayMessage.texte}
                        </div>
                      )}

                      <button onClick={() => relancerRecherche(h)}
                        disabled={replayLoadingId === h._id}
                        style={{ padding:"7px 16px", borderRadius:"8px", fontSize:"12px",
                          fontWeight:700, cursor:"pointer",
                          background:"rgba(0,144,76,0.08)", color:"#00904C",
                          border:"1px solid rgba(0,144,76,0.2)",
                          opacity: replayLoadingId === h._id ? 0.6 : 1 }}>
                        {replayLoadingId === h._id ? "Vérification..." : "Relancer"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="dash-footer">
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{ display:"flex", gap:"20px" }}>
            <span>Tarifs officiels CCI-BF</span>
            <span>+226 25 30 61 22</span>
          </div>
        </footer>
      </div>
    </div>
  );
}