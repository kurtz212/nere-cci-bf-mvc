import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const ENTREPRISES_MOCK = [
  { id:1, nom:"SOCOGEB SARL", raisonSociale:"SOCOGEB", rccm:"RCCM-BF-OUA-2020-B-1111", ifu:"IFU-BF-001234", ville:"Ouagadougou" },
  { id:2, nom:"AGRO-BF SA",   raisonSociale:"AGRO-BF", rccm:"RCCM-BF-BOB-2021-B-2222", ifu:"IFU-BF-005678", ville:"Bobo-Dioulasso" },
];

export default function RechercheEntreprise() {
  const navigate  = useNavigate();
  const [onglet, setOnglet]     = useState("recherche");
  const [loading, setLoading]   = useState(false);
  const [resultats, setResultats] = useState([]);
  const [form, setForm] = useState({ rccm:"", ifu:"", raisonSociale:"" });

  /* ── Historique ── */
  const [historique, setHistorique]         = useState([]);
  const [histoLoading, setHistoLoading]     = useState(false);
  const [histoErreur, setHistoErreur]       = useState("");
  const [replayLoadingId, setReplayLoadingId] = useState(null);
  const [replayMessage, setReplayMessage]   = useState({ id:null, texte:"", type:"" });

  /* ── Chargement historique depuis l'API ── */
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
      if (data.success) {
        setHistorique(data.data || []);
      } else {
        setHistoErreur(data.message || "Impossible de charger l'historique.");
      }
    } catch {
      setHistoErreur("Serveur inaccessible. Vérifiez votre connexion.");
    }
    setHistoLoading(false);
  }, []);

  useEffect(() => {
    if (onglet === "historique") chargerHistorique();
  }, [onglet, chargerHistorique]);

  /* ── Relancer une recherche ── */
  const relancerRecherche = async (item) => {
    if (!item?._id) return;
    setReplayMessage({ id: null, texte: "", type: "" });
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
        setReplayMessage({ id: item._id, texte: data.message || "Relance impossible.", type: "erreur" });
      }
    } catch {
      setReplayMessage({ id: item._id, texte: "Erreur serveur lors de la relance.", type: "erreur" });
    }
    setReplayLoadingId(null);
    setTimeout(() => setReplayMessage({ id: null, texte: "", type: "" }), 5000);
  };

  /* ── Recherche ── */
  const handleRecherche = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

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
        body: JSON.stringify({
          type: "entreprise",
          description: "Recherche entreprise",
          criteres: form,
          nbResultats: res.length,
        }),
      }).catch(() => {});
    }
  };

  const handleReset = () => {
    setForm({ rccm:"", ifu:"", raisonSociale:"" });
    setResultats([]);
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAVBAR */}
        <nav className="dash-navbar">
          <div className="dash-logo" onClick={() => navigate("/")}>NERE <span>CCI-BF</span></div>
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link active">Recherche</span>
            <span className="dash-nav-link" onClick={() => navigate("/chat")}>Chat</span>
          </div>
          <div className="dash-nav-actions" />
        </nav>

        {/* HERO */}
        <div className="pub-page-hero" style={{ padding:"36px 48px 28px" }}>
          <h1 className="pub-page-title" style={{ fontSize:"28px", textAlign:"left" }}>
            Recherche d'entreprise
          </h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", marginTop:"8px" }}>
            Trouvez les entreprises selon vos critères : RCCM, IFU, Raison sociale
          </p>
        </div>

        {/* CONTENU */}
        <div style={{ position:"relative", zIndex:1, padding:"24px 48px", maxWidth:"1200px", margin:"0 auto" }}>

          {/* ONGLETS */}
          <div style={{ display:"flex", gap:"1px", marginBottom:"24px", borderBottom:"1px solid rgba(0,0,0,0.1)" }}>
            {[
              { key:"recherche",  label:"Recherche simple" },
              { key:"historique", label:`Mes recherches${historique.length > 0 ? ` (${historique.length})` : ""}` },
            ].map(t => (
              <button key={t.key} onClick={() => setOnglet(t.key)} style={{
                padding:"12px 16px", fontSize:"13px", fontWeight:"500",
                background:"transparent", border:"none",
                color: onglet === t.key ? "#4DC97A" : "rgba(11,11,11,0.5)",
                borderBottom: onglet === t.key ? "2px solid #4DC97A" : "none",
                cursor:"pointer", transition:"all 0.2s",
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* ══ ONGLET RECHERCHE ══ */}
          {onglet === "recherche" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 350px", gap:"24px" }}>

              {/* FORMULAIRE */}
              <div style={{
                background:"rgba(255,255,255,0.03)", border:"1px solid rgba(4,4,4,0.1)",
                borderRadius:"12px", padding:"24px"
              }}>
                <h2 style={{ fontSize:"16px", fontWeight:"bold", color:"#060606", marginBottom:"20px" }}>
                  Critères de recherche
                </h2>
                <form onSubmit={handleRecherche}>
                  <div style={{ marginBottom:"20px" }}>
                    {[
                      { key:"rccm",          label:"RCCM",          placeholder:"RCCM-BF-..." },
                      { key:"ifu",           label:"IFU",           placeholder:"IFU-BF-..." },
                      { key:"raisonSociale", label:"Raison sociale", placeholder:"Nom de l'entreprise..." },
                    ].map(f => (
                      <div key={f.key} style={{ marginBottom:"16px" }}>
                        <label style={{ fontSize:"12px", color:"#000" }}>{f.label}</label>
                        <input
                          value={form[f.key]}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          style={{
                            width:"100%", marginTop:"6px", padding:"10px 12px",
                            background:"#fff", border:"1px solid #333",
                            borderRadius:"6px", color:"#000", fontSize:"13px",
                            boxSizing:"border-box",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
                    <button type="submit" disabled={loading} style={{
                      flex:1, padding:"12px", background:"#4DC97A", color:"#fff",
                      border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"13px", fontWeight:"600"
                    }}>
                      {loading ? "Recherche..." : "Chercher"}
                    </button>
                    <button type="button" onClick={handleReset} style={{
                      flex:1, padding:"12px", background:"transparent", color:"rgba(12,12,12,0.6)",
                      border:"1px solid rgba(0,0,0,0.2)", borderRadius:"8px", cursor:"pointer", fontSize:"13px", fontWeight:"600"
                    }}>
                      Réinitialiser
                    </button>
                  </div>
                </form>
              </div>

              {/* RÉSULTATS */}
              <div>
                {resultats.length > 0 && (
                  <div>
                    <div style={{ fontSize:"12px", color:"rgba(0,0,0,0.5)", marginBottom:"12px" }}>
                      {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
                    </div>
                    {resultats.map((e, i) => (
                      <div key={i} style={{
                        background:"rgba(255,255,255,0.9)", border:"1px solid rgba(0,0,0,0.1)",
                        borderRadius:"8px", padding:"12px", marginBottom:"8px", fontSize:"12px"
                      }}>
                        <div style={{ fontWeight:"600", color:"#4DC97A", marginBottom:"4px" }}>{e.nom}</div>
                        <div style={{ color:"rgba(0,0,0,0.6)", fontSize:"11px", lineHeight:"1.5" }}>
                          <div>RCCM: {e.rccm}</div>
                          <div>IFU: {e.ifu}</div>
                          <div>Ville: {e.ville}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {resultats.length === 0 && !loading && (
                  <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(0,0,0,0.4)", fontSize:"13px" }}>
                    Lancez une recherche pour voir les résultats
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ ONGLET HISTORIQUE ══ */}
          {onglet === "historique" && (
            <div style={{ maxWidth:"820px" }}>

              {/* En-tête */}
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"20px" }}>
                <div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px",
                    color:"#060606", margin:0 }}>Historique des recherches d'entreprises</h2>
                  <p style={{ color:"rgba(0,0,0,0.5)", fontSize:"13px", margin:"4px 0 0" }}>
                    {historique.length} recherche{historique.length !== 1 ? "s" : ""} enregistrée{historique.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button onClick={chargerHistorique} disabled={histoLoading}
                  style={{ padding:"8px 16px", background:"#4DC97A", color:"#fff",
                    border:"none", borderRadius:"8px", cursor:"pointer",
                    fontSize:"12px", fontWeight:"600", fontFamily:"inherit" }}>
                  {histoLoading ? "Chargement..." : "Actualiser"}
                </button>
              </div>

              {/* Chargement */}
              {histoLoading && (
                <div style={{ textAlign:"center", padding:"60px 0", color:"rgba(0,0,0,0.4)" }}>
                  <div style={{ fontSize:"32px", marginBottom:"12px" }}></div>
                  <p style={{ fontSize:"14px" }}>Chargement de l'historique...</p>
                </div>
              )}

              {/* Erreur */}
              {!histoLoading && histoErreur && (
                <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                  borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                  <div style={{ fontSize:"24px", marginBottom:"8px" }}>⚠️</div>
                  <p style={{ margin:0, fontSize:"14px" }}>{histoErreur}</p>
                  <button onClick={chargerHistorique}
                    style={{ marginTop:"12px", padding:"8px 16px", background:"#CC3333",
                      color:"#fff", border:"none", borderRadius:"8px",
                      cursor:"pointer", fontSize:"12px", fontFamily:"inherit" }}>
                    Réessayer
                  </button>
                </div>
              )}

              {/* Vide */}
              {!histoLoading && !histoErreur && historique.length === 0 && (
                <div style={{ background:"#fff", border:"1px solid #e0e0e0",
                  borderRadius:"12px", padding:"48px", textAlign:"center", color:"rgba(0,0,0,0.4)" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
                  <p style={{ fontSize:"14px", marginBottom:"16px" }}>Aucune recherche enregistrée.</p>
                  <button onClick={() => setOnglet("recherche")}
                    style={{ padding:"10px 20px", background:"#4DC97A", color:"#fff",
                      border:"none", borderRadius:"8px", cursor:"pointer",
                      fontSize:"13px", fontWeight:"600", fontFamily:"inherit" }}>
                    Faire une recherche
                  </button>
                </div>
              )}

              {/* Liste */}
              {!histoLoading && !histoErreur && historique.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {historique.map((h, i) => (
                    <div key={h._id || i} style={{
                      background:"#fff", border:"1px solid #e0e0e0",
                      borderRadius:"12px", padding:"18px 20px"
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"flex-start", marginBottom:"10px" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:"14px", color:"#060606" }}>
                            {h.description || "Recherche d'entreprise"}
                          </div>
                          <div style={{ fontSize:"11px", color:"rgba(0,0,0,0.45)", marginTop:"3px" }}>
                            {h.createdAt
                              ? new Date(h.createdAt).toLocaleDateString("fr-FR",
                                  { day:"2-digit", month:"long", year:"numeric" }) +
                                " à " +
                                new Date(h.createdAt).toLocaleTimeString("fr-FR",
                                  { hour:"2-digit", minute:"2-digit" })
                              : "—"}
                          </div>
                        </div>
                        <span style={{
                          background:"rgba(77,201,122,0.1)", color:"#1A7A40",
                          border:"1px solid rgba(77,201,122,0.3)", borderRadius:"100px",
                          padding:"3px 10px", fontSize:"11px", fontWeight:700, flexShrink:0
                        }}>
                          {h.nbResultats ?? 0} résultat{(h.nbResultats ?? 0) > 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Critères */}
                      {h.criteres && (
                        <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"12px" }}>
                          {h.criteres.rccm && (
                            <span style={{ background:"#F0F7FF", color:"#1E60CC",
                              border:"1px solid rgba(30,96,204,0.2)", borderRadius:"100px",
                              padding:"2px 10px", fontSize:"11px", fontWeight:600 }}>
                              RCCM: {h.criteres.rccm}
                            </span>
                          )}
                          {h.criteres.ifu && (
                            <span style={{ background:"#F0F7FF", color:"#1E60CC",
                              border:"1px solid rgba(30,96,204,0.2)", borderRadius:"100px",
                              padding:"2px 10px", fontSize:"11px", fontWeight:600 }}>
                              IFU: {h.criteres.ifu}
                            </span>
                          )}
                          {h.criteres.raisonSociale && (
                            <span style={{ background:"#F0F7FF", color:"#1E60CC",
                              border:"1px solid rgba(30,96,204,0.2)", borderRadius:"100px",
                              padding:"2px 10px", fontSize:"11px", fontWeight:600 }}>
                              Raison sociale: {h.criteres.raisonSociale}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message replay */}
                      {replayMessage.id === h._id && replayMessage.texte && (
                        <div style={{
                          padding:"10px 14px", borderRadius:"8px",
                          fontSize:"12px", marginBottom:"10px",
                          background: replayMessage.type === "succes" ? "#E8F5EE" : "#FFF0F0",
                          color:      replayMessage.type === "succes" ? "#1A7A40" : "#CC3333",
                          border: `1px solid ${replayMessage.type === "succes" ? "#C0D8C8" : "#FFB3B3"}`,
                        }}>
                          {replayMessage.texte}
                        </div>
                      )}

                      {/* Bouton relancer */}
                      <button
                        onClick={() => relancerRecherche(h)}
                        disabled={replayLoadingId === h._id}
                        style={{
                          padding:"7px 14px", borderRadius:"8px", fontSize:"12px",
                          fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                          background:"#EFF6FF", color:"#1E60CC",
                          border:"1px solid rgba(30,96,204,0.3)",
                          opacity: replayLoadingId === h._id ? 0.6 : 1,
                          transition:"all 0.15s",
                        }}>
                        {replayLoadingId === h._id ? "Vérification..." : "Relancer"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}