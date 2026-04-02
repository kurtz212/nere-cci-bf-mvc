import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

// MOCK DATA
const ENTREPRISES_MOCK = [
  { id:1, nom:"SOCOGEB SARL", raisonSociale:"SOCOGEB", rccm:"RCCM-BF-OUA-2020-B-1111", ifu:"IFU-BF-001234", ville:"Ouagadougou" },
  { id:2, nom:"AGRO-BF SA", raisonSociale:"AGRO-BF", rccm:"RCCM-BF-BOB-2021-B-2222", ifu:"IFU-BF-005678", ville:"Bobo-Dioulasso" },
];

export default function RechercheEntreprise() {
  const navigate = useNavigate();
  const [onglet, setOnglet] = useState("recherche");
  const [loading, setLoading] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [resultats, setResultats] = useState([]);
  const [form, setForm] = useState({
    rccm: "",
    ifu: "",
    raisonSociale: "",
  });



  const handleRecherche = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    let res = ENTREPRISES_MOCK;

    if (form.rccm) {
      res = res.filter(e =>
        e.rccm.toLowerCase().includes(form.rccm.toLowerCase())
      );
    }
    if (form.ifu) {
      res = res.filter(e =>
        e.ifu.toLowerCase().includes(form.ifu.toLowerCase())
      );
    }
    if (form.raisonSociale) {
      res = res.filter(e =>
        e.raisonSociale.toLowerCase().includes(form.raisonSociale.toLowerCase())
      );
    }

    setResultats(res);
    setLoading(false);

    // Enregistrer la recherche
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/searchlogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: "Recherche entreprise",
          criteres: form,
          nbResultats: res.length,
        }),
      }).catch(() => {});
    }
  };

  const handleReset = () => {
    setForm({
      rccm: "",
      ifu: "",
      raisonSociale: "",
    });
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
          <div className="dash-nav-actions">
            
          </div>
        </nav>

        {/* HERO */}
        <div className="pub-page-hero" style={{ padding:"36px 48px 28px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            
          </div>
          <h1 className="pub-page-title" style={{ fontSize:"28px", textAlign:"left" }}>
            Recherche d'entreprise
          </h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", marginTop:"8px" }}>
            Trouvez les entreprises selon vos critères : RCCM, IFU, Raison sociale
          </p>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div style={{ position:"relative", zIndex:1, padding:"24px 48px", maxWidth:"1200px", margin:"0 auto" }}>

        {/* ONGLETS */}
        <div style={{ display:"flex", gap:"1px", marginBottom:"24px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
          {[
            { key:"recherche", label:"Recherche simple" },
            { key:"historique", label:"Historique" },
          ].map(t => (
            <button key={t.key}
              onClick={() => setOnglet(t.key)}
              style={{
                padding:"12px 16px", fontSize:"13px", fontWeight:"500",
                background:"transparent", border:"none", color:
                  onglet === t.key ? "#4DC97A" : "rgba(11, 11, 11, 0.5)",
                borderBottom: onglet === t.key ? "2px solid #4DC97A" : "none",
                cursor:"pointer", transition:"all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* RECHERCHE */}
        {onglet === "recherche" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 350px", gap:"24px" }}>

            {/* FORMULAIRE */}
            <div style={{
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(4, 4, 4, 0.1)",
              borderRadius:"12px", padding:"24px"
            }}>
              <h2 style={{ fontSize:"16px", fontWeight:"bold", color:"#060606", marginBottom:"20px" }}>
                Critères de recherche
              </h2>

              <form onSubmit={handleRecherche}>

                {/* IDENTIFIANTS */}
                <div style={{ marginBottom:"20px" }}>
                  <div style={{ marginBottom:"16px" }}>
                    <label style={{ fontSize:"12px", color:"rgba(10, 10, 10, 0.9)" }}>RCCM</label>
                    <input
                      value={form.rccm}
                      onChange={(e) => setForm(f => ({...f, rccm: e.target.value}))}
                      placeholder="RCCM-BF-..."
                      style={{
                        width:"100%", marginTop:"6px", padding:"10px 12px",
                        background:"rgba(12,29,53,0.9)", border:"1px solid rgba(7, 7, 7, 0.45)",
                        borderRadius:"6px", color:"#fff", fontSize:"13px"
                      }}
                    />
                  </div>

                  <div style={{ marginBottom:"16px" }}>
                    <label style={{ fontSize:"12px", color:"#000" }}>IFU</label>
                    <input
                      value={form.ifu}
                      onChange={(e) => setForm(f => ({...f, ifu: e.target.value}))}
                      placeholder="IFU-BF-..."
                      style={{
                        width:"100%", marginTop:"6px", padding:"10px 12px",
                        background:"#fff", border:"1px solid #333",
                        borderRadius:"6px", color:"#000", fontSize:"13px"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize:"12px", color:"#000" }}>Raison sociale</label>
                    <input
                      value={form.raisonSociale}
                      onChange={(e) => setForm(f => ({...f, raisonSociale: e.target.value}))}
                      placeholder="Nom de l'entreprise..."
                      style={{
                        width:"100%", marginTop:"6px", padding:"10px 12px",
                        background:"#fff", border:"1px solid #333",
                        borderRadius:"6px", color:"#000", fontSize:"13px"
                      }}
                    />
                  </div>
                </div>

                {/* BOUTONS */}
                <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
                  <button type="submit" disabled={loading} style={{
                    flex:1, padding:"12px", background:"#4DC97A", color:"#fff",
                    border:"none", borderRadius:"8px", cursor:"pointer", fontSize:"13px", fontWeight:"600"
                  }}>
                    {loading ? "Recherche..." : "Chercher"}
                  </button>
                  <button type="button" onClick={handleReset} style={{
                    flex:1, padding:"12px", background:"transparent", color:"rgba(12, 12, 12, 0.6)",
                    border:"1px solid rgba(255,255,255,0.2)", borderRadius:"8px", cursor:"pointer", fontSize:"13px", fontWeight:"600"
                  }}>
                    Réinitialiser
                  </button>
                </div>

              </form>
            </div>

            {/* RÉSULTATS */}
            <div>
              {/* Résultats */}
              {resultats.length > 0 && (
                <div>
                  <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginBottom:"12px" }}>
                    {resultats.length} résultat{resultats.length > 1 ? "s" : ""}
                  </div>
                  {resultats.map((e, i) => (
                    <div key={i} style={{
                      background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.1)",
                      borderRadius:"8px", padding:"12px", marginBottom:"8px", fontSize:"12px"
                    }}>
                      <div style={{ fontWeight:"600", color:"#4DC97A", marginBottom:"4px" }}>
                        {e.nom}
                      </div>
                      <div style={{ color:"rgba(255,255,255,0.5)", fontSize:"11px", lineHeight:"1.5" }}>
                        <div>RCCM: {e.rccm}</div>
                        <div>IFU: {e.ifu}</div>
                        <div>Ville: {e.ville}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* HISTORIQUE */}
        {onglet === "historique" && (
          <div style={{
            background:"#fff", border:"1px solid #ccc",
            borderRadius:"12px", padding:"24px", textAlign:"center", color:"#000"
          }}>
            Aucun historique pour le moment
          </div>
        )}

        </div>
      </div>
    </div>
  );
}