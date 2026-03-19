import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { value: "", label: "Toutes les catégories" },
  { value: "commerce_gros",             label: "Commerce de gros" },
  { value: "commerce_detail",           label: "Commerce de détail" },
  { value: "industrie_agroalimentaire", label: "Industrie agro-alimentaire" },
  { value: "industrie_textile",         label: "Industrie textile" },
  { value: "industrie_metallurgie",     label: "Industrie métallurgie / métal" },
  { value: "industrie_papier",          label: "Industrie papier / imprimerie" },
  { value: "artisanat",                 label: "Artisanat" },
  { value: "agrobusiness_elevage",      label: "Agrobusiness — Élevage" },
  { value: "agrobusiness_agriculture",  label: "Agrobusiness — Agriculture" },
  { value: "service_banque",            label: "Services — Banque & Finance" },
  { value: "service_etude",             label: "Services — Bureau d'études" },
  { value: "service_enseignement",      label: "Services — Enseignement" },
  { value: "service_sante",             label: "Services — Santé" },
  { value: "service_transport",         label: "Services — Transport & Logistique" },
  { value: "btp",                       label: "BTP — Bâtiment & Travaux Publics" },
  { value: "telecom",                   label: "Télécommunications & IT" },
  { value: "tourisme",                  label: "Tourisme & Hôtellerie" },
];

// Données mock — à remplacer par appel API /api/recherche
const ENTREPRISES_MOCK = [
  { id:1, nom:"SOCOGEB SARL", dirigeant:"Kouamé Traoré", ifu:"IFU-BF-001234", categorie:"commerce_gros", ville:"Ouagadougou", statut:"Actif", effectif:"50-199" },
  { id:2, nom:"AGRO-BF SA", dirigeant:"Aminata Ouédraogo", ifu:"IFU-BF-005678", categorie:"agrobusiness_agriculture", ville:"Bobo-Dioulasso", statut:"Actif", effectif:"10-49" },
  { id:3, nom:"BATIBUR SARL", dirigeant:"Ibrahim Sawadogo", ifu:"IFU-BF-009012", categorie:"btp", ville:"Ouagadougou", statut:"Actif", effectif:"50-199" },
  { id:4, nom:"TECHNO SERVICES BF", dirigeant:"Fatima Compaoré", ifu:"IFU-BF-013456", categorie:"telecom", ville:"Koudougou", statut:"Actif", effectif:"1-9" },
  { id:5, nom:"TRANSPORT EXPRESS BF", dirigeant:"Moussa Diallo", ifu:"IFU-BF-017890", categorie:"service_transport", ville:"Ouagadougou", statut:"Actif", effectif:"10-49" },
  { id:6, nom:"MEUNERIE DU FASO", dirigeant:"Salif Zongo", ifu:"IFU-BF-022134", categorie:"industrie_agroalimentaire", ville:"Banfora", statut:"Actif", effectif:"200-499" },
];

export default function RechercheEntreprise() {
  const navigate = useNavigate();

  const [filtres, setFiltres] = useState({
    nom_dirigeant: "",
    ifu:           "",
    categorie:     "",
  });
  const [rechercheLancee, setRechercheLancee] = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [resultats, setResultats]             = useState([]);
  const [entrepriseSelectionnee, setEntreprise] = useState(null);

  const handleChange = (e) =>
    setFiltres(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleRecherche = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEntreprise(null);
    await new Promise(r => setTimeout(r, 700));

    // Filtrage mock
    const res = ENTREPRISES_MOCK.filter(e => {
      const okDirigeant = !filtres.nom_dirigeant ||
        e.dirigeant.toLowerCase().includes(filtres.nom_dirigeant.toLowerCase());
      const okIfu = !filtres.ifu ||
        e.ifu.toLowerCase().includes(filtres.ifu.toLowerCase());
      const okCategorie = !filtres.categorie || e.categorie === filtres.categorie;
      return okDirigeant && okIfu && okCategorie;
    });

    setResultats(res);
    setRechercheLancee(true);
    setLoading(false);
  };

  const handleReset = () => {
    setFiltres({ nom_dirigeant:"", ifu:"", categorie:"" });
    setResultats([]);
    setRechercheLancee(false);
    setEntreprise(null);
  };

  const nbFiltresActifs = Object.values(filtres).filter(v => v !== "").length;

  return (
    <div style={{
      minHeight:"100vh",
      fontFamily:"'Plus Jakarta Sans',sans-serif",
      background:"#0A3D1F",
      position:"relative",
      overflow:"hidden",
    }}>

      {/* Fond animé */}
      <div style={{ position:"absolute", inset:0, zIndex:0 }}>
        <div style={{
          position:"absolute", top:"-20%", left:"-10%",
          width:"600px", height:"600px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(77,201,122,0.12) 0%, transparent 70%)",
          animation:"blob1 8s ease-in-out infinite",
        }}/>
        <div style={{
          position:"absolute", bottom:"-10%", right:"-5%",
          width:"500px", height:"500px", borderRadius:"50%",
          background:"radial-gradient(circle, rgba(26,122,64,0.15) 0%, transparent 70%)",
          animation:"blob2 10s ease-in-out infinite",
        }}/>
        <div style={{
          position:"absolute", inset:0,
          backgroundImage:"linear-gradient(rgba(77,201,122,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(77,201,122,0.04) 1px, transparent 1px)",
          backgroundSize:"40px 40px",
        }}/>
      </div>

      <div style={{ position:"relative", zIndex:1, minHeight:"100vh",
        display:"flex", flexDirection:"column" }}>

        {/* NAVBAR */}
        <nav style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 48px", height:"64px",
          background:"rgba(10,61,31,0.8)", backdropFilter:"blur(12px)",
          borderBottom:"1px solid rgba(77,201,122,0.12)",
        }}>
          <div onClick={() => navigate("/")} style={{
            fontFamily:"'Playfair Display',serif", fontSize:"20px",
            fontWeight:900, color:"#fff", cursor:"pointer", letterSpacing:"0.02em",
          }}>
            NERE <span style={{ color:"#4DC97A" }}>CCI-BF</span>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={() => navigate("/")} style={{
              padding:"9px 20px", borderRadius:"100px",
              background:"rgba(255,255,255,0.08)",
              border:"1px solid rgba(255,255,255,0.12)",
              color:"rgba(255,255,255,0.7)", fontSize:"13px",
              fontWeight:600, cursor:"pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", gap:"6px",
              transition:"all 0.2s",
            }}>
              ← Retour à l'accueil
            </button>
          </div>
        </nav>

        {/* CONTENU */}
        <div style={{ flex:1, padding:"48px", display:"flex",
          flexDirection:"column", alignItems:"center" }}>

          {/* TITRE */}
          <div style={{ textAlign:"center", marginBottom:"40px", maxWidth:"560px" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"8px",
              background:"rgba(77,201,122,0.1)",
              border:"1px solid rgba(77,201,122,0.2)",
              borderRadius:"100px", padding:"5px 16px", marginBottom:"16px",
            }}>
              <span style={{ width:"6px", height:"6px", borderRadius:"50%",
                background:"#4DC97A", display:"inline-block" }}/>
              <span style={{ fontSize:"11px", fontWeight:700, color:"#4DC97A",
                textTransform:"uppercase", letterSpacing:"0.1em" }}>
                Base NERE — {ENTREPRISES_MOCK.length} entreprises (démo)
              </span>
            </div>
            <h1 style={{
              fontFamily:"'Playfair Display',serif", fontSize:"36px",
              fontWeight:900, color:"#fff", margin:"0 0 12px", lineHeight:1.2,
            }}>
              Rechercher une entreprise
            </h1>
            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"15px",
              lineHeight:1.7, margin:0 }}>
              Recherchez par nom du dirigeant, numéro IFU ou catégorie d'activité.
            </p>
          </div>

          {/* FORMULAIRE RECHERCHE */}
          <div style={{
            width:"100%", maxWidth:"760px",
            background:"rgba(255,255,255,0.04)",
            border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"20px", padding:"32px",
            backdropFilter:"blur(12px)",
            marginBottom:"32px",
          }}>
            <form onSubmit={handleRecherche}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                gap:"16px", marginBottom:"16px" }}>

                {/* Nom dirigeant */}
                <div>
                  <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                    color:"rgba(255,255,255,0.4)", textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:"8px" }}>
                    👤 Nom du dirigeant
                  </label>
                  <input
                    name="nom_dirigeant"
                    value={filtres.nom_dirigeant}
                    onChange={handleChange}
                    placeholder="ex: ky omar..."
                    style={{
                      width:"100%", padding:"12px 16px",
                      borderRadius:"10px", border:"1px solid rgba(255,255,255,0.12)",
                      background:"rgba(255,255,255,0.06)", color:"#fff",
                      fontSize:"14px", fontFamily:"inherit", outline:"none",
                      boxSizing:"border-box",
                      transition:"border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor="rgba(77,201,122,0.5)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.12)"}
                  />
                </div>

                {/* IFU */}
                <div>
                  <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                    color:"rgba(255,255,255,0.4)", textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:"8px" }}>
                    🔢 Numéro IFU
                  </label>
                  <input
                    name="ifu"
                    value={filtres.ifu}
                    onChange={handleChange}
                    placeholder="ex: IFU-BF-001234..."
                    style={{
                      width:"100%", padding:"12px 16px",
                      borderRadius:"10px", border:"1px solid rgba(255,255,255,0.12)",
                      background:"rgba(255,255,255,0.06)", color:"#fff",
                      fontSize:"14px", fontFamily:"inherit", outline:"none",
                      boxSizing:"border-box", transition:"border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor="rgba(77,201,122,0.5)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.12)"}
                  />
                </div>

                {/* Catégorie — pleine largeur */}
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={{ display:"block", fontSize:"11px", fontWeight:700,
                    color:"rgba(255,255,255,0.4)", textTransform:"uppercase",
                    letterSpacing:"0.08em", marginBottom:"8px" }}>
                    🏭 Catégorie d'activité
                  </label>
                  <select
                    name="categorie"
                    value={filtres.categorie}
                    onChange={handleChange}
                    style={{
                      width:"100%", padding:"12px 16px",
                      borderRadius:"10px", border:"1px solid rgba(255,255,255,0.12)",
                      background:"#0F5C2E", color: filtres.categorie ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize:"14px", fontFamily:"inherit", outline:"none",
                      cursor:"pointer", transition:"border 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor="rgba(77,201,122,0.5)"}
                    onBlur={e => e.target.style.borderColor="rgba(255,255,255,0.12)"}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}
                        style={{ background:"#0A3D1F", color:"#fff" }}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                <button type="submit" disabled={loading} style={{
                  padding:"13px 32px", borderRadius:"12px",
                  background:"linear-gradient(135deg, #4DC97A, #1A7A40)",
                  color:"#0A3D1F", fontWeight:800, fontSize:"15px",
                  border:"none", cursor:"pointer", fontFamily:"inherit",
                  display:"flex", alignItems:"center", gap:"8px",
                  transition:"all 0.2s", opacity: loading ? 0.7 : 1,
                }}>
                  {loading ? (
                    <><span style={{ width:"16px", height:"16px", border:"2px solid #0A3D1F",
                      borderTopColor:"transparent", borderRadius:"50%",
                      display:"inline-block", animation:"spin 0.8s linear infinite" }}/> Recherche...</>
                  ) : (
                    <> 🔍 Lancer la recherche</>
                  )}
                </button>

                {nbFiltresActifs > 0 && (
                  <button type="button" onClick={handleReset} style={{
                    padding:"13px 20px", borderRadius:"12px",
                    background:"rgba(255,255,255,0.06)",
                    border:"1px solid rgba(255,255,255,0.12)",
                    color:"rgba(255,255,255,0.5)", fontWeight:600,
                    fontSize:"14px", cursor:"pointer", fontFamily:"inherit",
                    transition:"all 0.2s",
                  }}>
                    ✕ Réinitialiser
                  </button>
                )}

                {nbFiltresActifs > 0 && (
                  <span style={{ fontSize:"12px", color:"rgba(77,201,122,0.7)",
                    fontWeight:600 }}>
                    {nbFiltresActifs} filtre{nbFiltresActifs > 1 ? "s" : ""} actif{nbFiltresActifs > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* RÉSULTATS */}
          {rechercheLancee && (
            <div style={{ width:"100%", maxWidth:"760px" }}>

              {/* Compteur */}
              <div style={{ display:"flex", alignItems:"center",
                justifyContent:"space-between", marginBottom:"16px" }}>
                <span style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)",
                  fontWeight:600 }}>
                  {resultats.length === 0
                    ? "Aucun résultat trouvé"
                    : `${resultats.length} résultat${resultats.length > 1 ? "s" : ""} trouvé${resultats.length > 1 ? "s" : ""}`}
                </span>
              </div>

              {/* Aucun résultat */}
              {resultats.length === 0 && (
                <div style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:"16px", padding:"48px",
                  textAlign:"center",
                }}>
                  <div style={{ fontSize:"48px", marginBottom:"12px" }}>🔍</div>
                  <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"15px",
                    lineHeight:1.7, margin:0 }}>
                    Aucune entreprise ne correspond à vos critères.<br/>
                    Essayez avec d'autres termes.
                  </p>
                </div>
              )}

              {/* Liste des résultats */}
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {resultats.map(e => (
                  <div key={e.id}
                    onClick={() => setEntreprise(entrepriseSelectionnee?.id === e.id ? null : e)}
                    style={{
                      background: entrepriseSelectionnee?.id === e.id
                        ? "rgba(77,201,122,0.1)"
                        : "rgba(255,255,255,0.04)",
                      border: entrepriseSelectionnee?.id === e.id
                        ? "1px solid rgba(77,201,122,0.35)"
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius:"14px", padding:"18px 22px",
                      cursor:"pointer", transition:"all 0.2s",
                    }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontWeight:800, fontSize:"16px",
                          color:"#fff", marginBottom:"5px" }}>
                          {e.nom}
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                          <span style={{ fontSize:"12px",
                            color:"rgba(255,255,255,0.45)" }}>
                            👤 {e.dirigeant}
                          </span>
                          <span style={{ fontSize:"12px",
                            color:"rgba(255,255,255,0.45)" }}>
                            🔢 {e.ifu}
                          </span>
                          <span style={{ fontSize:"12px",
                            color:"rgba(255,255,255,0.45)" }}>
                            📍 {e.ville}
                          </span>
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column",
                        alignItems:"flex-end", gap:"6px", flexShrink:0 }}>
                        <span style={{
                          background:"rgba(77,201,122,0.15)",
                          color:"#4DC97A",
                          border:"1px solid rgba(77,201,122,0.25)",
                          borderRadius:"100px", padding:"3px 10px",
                          fontSize:"11px", fontWeight:700,
                        }}>
                          ● {e.statut}
                        </span>
                        <span style={{ fontSize:"11px",
                          color:"rgba(255,255,255,0.25)" }}>
                          {entrepriseSelectionnee?.id === e.id ? "▲ Masquer" : "▼ Détails"}
                        </span>
                      </div>
                    </div>

                    {/* Détail déroulant */}
                    {entrepriseSelectionnee?.id === e.id && (
                      <div style={{
                        marginTop:"16px", paddingTop:"16px",
                        borderTop:"1px solid rgba(255,255,255,0.08)",
                        display:"grid", gridTemplateColumns:"1fr 1fr",
                        gap:"10px",
                      }}>
                        {[
                          { label:"Raison sociale", val:e.nom },
                          { label:"Dirigeant",      val:e.dirigeant },
                          { label:"IFU",            val:e.ifu },
                          { label:"Catégorie",      val:CATEGORIES.find(c=>c.value===e.categorie)?.label || e.categorie },
                          { label:"Ville",          val:e.ville },
                          { label:"Effectif",       val:e.effectif + " employés" },
                        ].map(item => (
                          <div key={item.label}>
                            <div style={{ fontSize:"10px", fontWeight:700,
                              color:"rgba(255,255,255,0.3)",
                              textTransform:"uppercase", letterSpacing:"0.07em",
                              marginBottom:"3px" }}>
                              {item.label}
                            </div>
                            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.75)",
                              fontWeight:500 }}>
                              {item.val}
                            </div>
                          </div>
                        ))}

                        <div style={{ gridColumn:"1 / -1", marginTop:"8px",
                          display:"flex", gap:"10px" }}>
                          <button onClick={(ev) => { ev.stopPropagation(); navigate("/demande-document"); }}
                            style={{
                              padding:"9px 18px", borderRadius:"8px",
                              background:"rgba(77,201,122,0.15)",
                              border:"1px solid rgba(77,201,122,0.3)",
                              color:"#4DC97A", fontWeight:700, fontSize:"12px",
                              cursor:"pointer", fontFamily:"inherit",
                            }}>
                            📄 Demander un document
                          </button>
                          <button onClick={(ev) => { ev.stopPropagation(); navigate("/contact"); }}
                            style={{
                              padding:"9px 18px", borderRadius:"8px",
                              background:"rgba(255,255,255,0.06)",
                              border:"1px solid rgba(255,255,255,0.1)",
                              color:"rgba(255,255,255,0.5)", fontWeight:600,
                              fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
                            }}>
                            ✉️ Contacter la CCI-BF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ padding:"20px 48px",
          borderTop:"1px solid rgba(255,255,255,0.06)",
          display:"flex", justifyContent:"space-between",
          fontSize:"12px", color:"rgba(255,255,255,0.2)" }}>
          <span>© 2025 CCI-BF — Registre National des Entreprises</span>
          <span>Données officielles NERE · Burkina Faso</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,20px) scale(1.05)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-20px,30px) scale(0.95)} }
        input::placeholder { color:rgba(255,255,255,0.25); }
      `}</style>
    </div>
  );
}