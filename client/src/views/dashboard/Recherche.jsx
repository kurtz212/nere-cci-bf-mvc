import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

// ── Catégories & sous-catégories ──
const CATEGORIES = [
  {
    value: "commerce",
    label: "Commerce",
    icon: "",
    sousCats: [
      { value: "commerce_gros",   label: "Commerce de gros" },
      { value: "commerce_detail", label: "Commerce de détail" },
    ],
  },
  {
    value: "industrie",
    label: "Industrie",
   
    sousCats: [
      { value: "industrie_agro",    label: "Agro-alimentaire" },
      { value: "industrie_textile", label: "Textile" },
      { value: "industrie_metal",   label: "Métallurgie" },
      { value: "industrie_papier",  label: "Papier & Imprimerie" },
    ],
  },
  {
    value: "artisanat",
    label: "Artisanat",
   
    sousCats: [
      { value: "artisanat_bijou",      label: "Bijouterie" },
      { value: "artisanat_tissage",    label: "Tissage" },
      { value: "artisanat_teinture",   label: "Teinture" },
      { value: "artisanat_reparation", label: "Réparation" },
    ],
  },
  {
    value: "services",
    label: "Services",
   
    sousCats: [
      { value: "service_banque",       label: "Banques" },
      { value: "service_finance",      label: "Établissements financiers" },
      { value: "service_enseignement", label: "Enseignement" },
      { value: "service_etude",        label: "Bureaux d'études" },
    ],
  },
  {
    value: "agrobusiness",
    label: "Agrobusiness",
    
    sousCats: [
      { value: "agro_elevage",     label: "Élevage" },
      { value: "agro_agriculture", label: "Agriculture" },
    ],
  },
];

const REGIONS = [
  "Centre","Hauts-Bassins","Est","Nord","Boucle du Mouhoun",
  "Sahel","Sud-Ouest","Centre-Nord","Centre-Est","Centre-Ouest",
  "Plateau-Central","Centre-Sud","Cascades",
];

const VILLES_PAR_REGION = {
  "Centre":           ["Ouagadougou","Ziniaré","Kombissiri"],
  "Hauts-Bassins":    ["Bobo-Dioulasso","Houndé","Orodara"],
  "Est":              ["Fada N'Gourma","Diapaga","Bogandé"],
  "Nord":             ["Ouahigouya","Titao","Yako"],
  "Boucle du Mouhoun":["Dédougou","Nouna","Solenzo"],
  "Sahel":            ["Dori","Djibo","Gorom-Gorom"],
  "Sud-Ouest":        ["Gaoua","Diébougou","Batié"],
  "Centre-Nord":      ["Kaya","Kongoussi","Boulsa"],
  "Centre-Est":       ["Tenkodogo","Koupéla","Garango"],
  "Centre-Ouest":     ["Koudougou","Réo","Sabou"],
  "Plateau-Central":  ["Ziniaré","Zorgho","Boussé"],
  "Centre-Sud":       ["Manga","Pô","Kombissiri"],
  "Cascades":         ["Banfora","Sindou","Orodara"],
};

// ── Données mock ──
const MOCK = [
  { id:1, nom:"SOCOGEB SARL", annee:2024,           dirigeant:"Kouamé Traoré",     ifu:"IFU-BF-001234", annee:2024, cat:"commerce",    sousCat:"commerce_gros",      region:"Centre",       ville:"Ouagadougou",  effectif:142, ca:2400000000 },
  { id:2, nom:"AGROTEX BF",             dirigeant:"Aminata Ouédraogo", ifu:"IFU-BF-005678", annee:2023, cat:"industrie",   sousCat:"industrie_textile",   region:"Hauts-Bassins",ville:"Bobo-Dioulasso",effectif:87,  ca:980000000  },
  { id:3, nom:"FERME SAHEL VERT",       dirigeant:"Salif Zongo",       ifu:"IFU-BF-009012", annee:2022, cat:"agrobusiness",sousCat:"agro_agriculture",    region:"Sahel",        ville:"Dori",          effectif:210, ca:1100000000 },
  { id:4, nom:"METALEX BURKINA",        dirigeant:"Ibrahim Sawadogo",  ifu:"IFU-BF-013456", annee:2024, cat:"industrie",   sousCat:"industrie_metal",     region:"Centre",       ville:"Ouagadougou",  effectif:63,  ca:560000000  },
  { id:5, nom:"BANI BANK FINANCE",      dirigeant:"Fatima Compaoré",   ifu:"IFU-BF-017890", annee:2023, cat:"services",    sousCat:"service_banque",      region:"Centre",       ville:"Ouagadougou",  effectif:320, ca:3200000000 },
  { id:6, nom:"IMPRIMERIE DU FASO",     dirigeant:"Moussa Diallo",     ifu:"IFU-BF-022134", annee:2022, cat:"industrie",   sousCat:"industrie_papier",    region:"Hauts-Bassins",ville:"Bobo-Dioulasso",effectif:34,  ca:280000000  },
  { id:7, nom:"ÉCOLE SAVANAH",          dirigeant:"Aïcha Nikiéma",     ifu:"IFU-BF-026578", annee:2024, cat:"services",    sousCat:"service_enseignement",region:"Centre",       ville:"Ouagadougou",  effectif:58,  ca:420000000  },
  { id:8, nom:"ÉLEVAGE PEULH DU NORD",  dirigeant:"Hamidou Barry",     ifu:"IFU-BF-030012", annee:2023, cat:"agrobusiness",sousCat:"agro_elevage",        region:"Nord",         ville:"Ouahigouya",   effectif:95,  ca:750000000  },
  { id:9, nom:"BIJOUX FASO ART",        dirigeant:"Mariam Sawadogo",   ifu:"IFU-BF-034456", annee:2024, cat:"artisanat",   sousCat:"artisanat_bijou",     region:"Centre",       ville:"Ouagadougou",  effectif:12,  ca:85000000   },
  { id:10,nom:"BUREAU ETUDES SAHEL",    dirigeant:"Lassina Traoré",    ifu:"IFU-BF-038890", annee:2022, cat:"services",    sousCat:"service_etude",       region:"Centre",       ville:"Ouagadougou",  effectif:28,  ca:320000000  },
  { id:11,nom:"AGRO-ALIM BF",           dirigeant:"Bintou Kaboré",     ifu:"IFU-BF-043234", annee:2023, cat:"industrie",   sousCat:"industrie_agro",      region:"Hauts-Bassins",ville:"Bobo-Dioulasso",effectif:180, ca:1800000000 },
  { id:12,nom:"TISSAGE TRADITION",      dirigeant:"Adama Coulibaly",   ifu:"IFU-BF-047678", annee:2024, cat:"artisanat",   sousCat:"artisanat_tissage",   region:"Centre-Ouest", ville:"Koudougou",    effectif:8,   ca:45000000   },
];

function formaterCA(ca) {
  if (!ca) return "N/D";
  if (ca >= 1000000000) return `${(ca/1000000000).toFixed(1)} Mrd FCFA`;
  if (ca >= 1000000)    return `${(ca/1000000).toFixed(0)} M FCFA`;
  return `${ca.toLocaleString()} FCFA`;
}

const TYPES_AFFICHAGE = [
  { value:"liste",       label:"Liste",                 desc:"Noms et adresses",        sousTypes:[
      { value:"entreprise",   label:"Entreprises" },
      { value:"association",  label:"Associations professionnelles" },
  ]},
  { value:"tableau",     label:"Tableau",               desc:"Données détaillées",       sousTypes:[] },
  { value:"statistique", label:"Statistiques",          desc:"Analyses & chiffres",      sousTypes:[
      { value:"entreprise",   label:"Entreprises" },
      { value:"association",  label:"Associations professionnelles" },
      { value:"import_export",label:"Importation & Exportation" },
  ]},
  { value:"fiche",       label:"Fiche entreprise",      desc:"Demande de fiche détaillée", sousTypes:[
      { value:"entreprise",   label:"Fiche d'entreprise" },
      { value:"association",  label:"Fiche d'association" },
  ]},
  { value:"repertoire",  label:"Répertoire thématique", desc:"Répertoire par secteur",   sousTypes:[] },
];

export default function Recherche() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [typeAffichage, setTypeAffichage]     = useState("tableau");
  const [sousTypeAffichage, setSousType]      = useState("");
  const ANNEE_COURANTE = new Date().getFullYear();
  const [filtres, setFiltres] = useState({
    region:   "",
    ville:    "",
    categorie:"",
    sousCat:  "",
    nombre:   1,
  });
  const [modeAnnee, setModeAnnee]   = useState("toutes");   // "toutes" | "precise" | "intervalle" | "courante"
  const [anneeVal, setAnneeVal]     = useState(2024);
  const [anneeMin, setAnneeMin]     = useState(2022);
  const [anneeMax, setAnneeMax]     = useState(2024);
  const [resultats, setResultats]       = useState([]);
  const [rechercheLancee, setLancee]    = useState(false);
  const [loading, setLoading]           = useState(false);
  const [detail, setDetail]             = useState(null);
  const [description, setDescription]  = useState("");
  const [quota, setQuota]              = useState(null);

  // Charger le quota au montage
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("http://localhost:5000/api/searchlogs/quota", {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => { if (data.success) setQuota(data.data); })
    .catch(() => {});
  }, []);

  const catObj    = CATEGORIES.find(c => c.value === filtres.categorie);
  const villesDispo = filtres.region ? VILLES_PAR_REGION[filtres.region] || [] : [];

  const set = (k, v) => setFiltres(f => ({
    ...f, [k]: v,
    ...(k === "region"    ? { ville:"" }   : {}),
    ...(k === "categorie" ? { sousCat:"" } : {}),
  }));

  const lancer = async () => {
    setLoading(true); setDetail(null);
    await new Promise(r => setTimeout(r, 600));

    let res = MOCK.filter(e => {
      if (filtres.region    && e.region  !== filtres.region)    return false;
      if (filtres.ville     && e.ville   !== filtres.ville)     return false;
      if (filtres.categorie && e.cat     !== filtres.categorie) return false;
      if (filtres.sousCat   && e.sousCat !== filtres.sousCat)   return false;
      // Filtre année (uniquement pour stats)
      if (typeAffichage === "statistique") {
        if (modeAnnee === "precise"    && e.annee !== anneeVal)                        return false;
        if (modeAnnee === "intervalle" && (e.annee < anneeMin || e.annee > anneeMax)) return false;
        if (modeAnnee === "courante"   && e.annee !== ANNEE_COURANTE)                 return false;
      }
      return true;
    });

    // Limiter au nombre demandé
    if (filtres.nombre >= 1) res = res.slice(0, parseInt(filtres.nombre) || res.length);

    setResultats(res);
    setLancee(true);
    setLoading(false);

    // Enregistrer la recherche dans l'historique
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:5000/api/searchlogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: description || "Recherche sans titre",
          criteres: {
            typeAffichage: typeAffichage,
            sousType: sousTypeAffichage,
            region:   filtres.region,
            ville:    filtres.ville,
            categorie:filtres.categorie,
            sousCat:  filtres.sousCat,
            nombre:   filtres.nombre,
          },
          nbResultats: res.length,
          forfait: user?.pack || "gratuit",
          quotaAvant: quota?.restant || 0,
          quotaApres: quota?.restant !== "illimité" ? Math.max(0, (quota?.restant || 0) - 1) : "illimité",
        }),
      })
      .then(r => r.json())
      .then(() => {
        // Rafraîchir le quota
        return fetch("http://localhost:5000/api/searchlogs/quota", {
          headers: { "Authorization": `Bearer ${token}` }
        });
      })
      .then(r => r.json())
      .then(data => { if (data.success) setQuota(data.data); })
      .catch(() => {});
    }
  };

  const reset = () => {
    setFiltres({ region:"", ville:"", categorie:"", sousCat:"", nombre:1 });
    setModeAnnee("toutes"); setAnneeVal(2024); setAnneeMin(2022); setAnneeMax(2024);
    setResultats([]); setLancee(false); setDetail(null);
    setDescription("");
  };

  // ── Stats calculées ──
  const totalEffectif = resultats.reduce((s,e) => s + e.effectif, 0);
  const totalCA       = resultats.reduce((s,e) => s + e.ca, 0);
  const parCat        = resultats.reduce((acc,e) => {
    const label = CATEGORIES.find(c=>c.value===e.cat)?.label || e.cat;
    acc[label] = (acc[label]||0) + 1; return acc;
  }, {});

  const inputStyle = {
    width:"100%", padding:"11px 14px", borderRadius:"10px",
    border:"1.5px solid var(--border)", background:"#fff",
    color:"var(--text-dark)", fontSize:"13px",
    fontFamily:"inherit", outline:"none", boxSizing:"border-box",
    transition:"border 0.2s",
  };

  const labelStyle = {
    display:"block", fontSize:"11px", fontWeight:700,
    color:"var(--text-muted)", textTransform:"uppercase",
    letterSpacing:"0.08em", marginBottom:"7px",
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
            <span className="dash-nav-link" onClick={() => navigate("/publications")}>Publications</span>
            <span className="dash-nav-link active">Recherche</span>
           
            <span className="dash-nav-link" onClick={() => navigate("/contact")}>Contact</span>
            {user && <span className="dash-nav-link" onClick={() => navigate("/profil")}>Mon Profil</span>}
          </div>
          <div className="dash-nav-actions">
            {user ? (
              <div className="user-chip" onClick={() => navigate("/profil")}>
                <div className="user-avatar">{user.prenom?.[0]}{user.nom?.[0]}</div>
                <span>{user.prenom}</span>
              </div>
            ) : (
              <button className="btn-save" style={{ padding:"8px 18px", fontSize:"13px" }}
                onClick={() => navigate("/connexion")}>Connexion</button>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div className="pub-page-hero" style={{ padding:"28px 48px 24px" }}>
          <div className="pub-page-tag">NERE CCI-BF · Base de données officielle</div>
          <h1 className="pub-page-title" style={{ fontSize:"26px", textAlign:"left" }}>
            Recherche multicritère
          </h1>
        </div>

        <div style={{ padding:"28px 48px 60px", background:"var(--off-white)",
          display:"grid", gridTemplateColumns:"320px 1fr", gap:"24px",
          alignItems:"flex-start" }}>

          {/* ══ PANNEAU FILTRES ══ */}
          <div style={{ display:"flex", flexDirection:"column", gap:"0",
            background:"#fff", borderRadius:"16px",
            border:"1px solid var(--border)", overflow:"hidden",
            position:"sticky", top:"24px" }}>

            {/* En-tête */}
            <div style={{ background:"var(--green-deep)", padding:"16px 20px" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px",
                fontWeight:800, color:"#fff" }}> Critères de recherche</div>
            </div>

            <div style={{ padding:"20px", display:"flex", flexDirection:"column", gap:"18px" }}>

              {/* QUOTA */}
              {quota && (
                <div style={{ padding:"10px 14px", borderRadius:"10px",
                  background: quota.illimite ? "rgba(77,201,122,0.1)" :
                    quota.restant === 0 ? "rgba(255,107,107,0.1)" :
                    quota.restant <= 5  ? "rgba(212,168,48,0.1)" : "rgba(77,201,122,0.1)",
                  border: quota.illimite ? "1px solid rgba(77,201,122,0.3)" :
                    quota.restant === 0 ? "1px solid rgba(255,107,107,0.3)" :
                    quota.restant <= 5  ? "1px solid rgba(212,168,48,0.3)" : "1px solid rgba(77,201,122,0.3)",
                }}>
                  <div style={{ fontSize:"11px", fontWeight:700,
                    color:"var(--text-muted)", textTransform:"uppercase",
                    letterSpacing:"0.07em", marginBottom:"6px" }}>
                    Quota du forfait {quota.pack}
                  </div>
                  {quota.illimite ? (
                    <div style={{ fontSize:"13px", fontWeight:700, color:"var(--green-dark)" }}>
                      ♾️ Recherches illimitées
                    </div>
                  ) : (
                    <>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        fontSize:"12px", marginBottom:"6px" }}>
                        <span style={{ color:"var(--text-mid)" }}>{quota.utilise} utilisées</span>
                        <span style={{ fontWeight:700,
                          color: quota.restant === 0 ? "#FF6B6B" :
                                 quota.restant <= 5  ? "#D4A830" : "var(--green-dark)" }}>
                          {quota.restant} restantes
                        </span>
                      </div>
                      <div style={{ height:"6px", borderRadius:"100px",
                        background:"var(--border)", overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:"100px",
                          width:`${Math.min(100,(quota.utilise/quota.quota)*100)}%`,
                          background: quota.restant === 0 ? "#FF6B6B" :
                                      quota.restant <= 5  ? "#D4A830" : "#4DC97A",
                          transition:"width 0.4s ease" }}/>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* DESCRIPTION */}
              <div>
                <label style={labelStyle}> Titre / Description de la recherche</label>
                <input
                  type="text"
                  placeholder="Ex: Entreprises BTP région Centre..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={inputStyle}
                  onFocus={el => el.target.style.borderColor="var(--green-light)"}
                  onBlur={el => el.target.style.borderColor="var(--border)"}
                />
              </div>

              {/* ÉTAPE 1 — Type d'affichage */}
              <div>
                <label style={labelStyle}>① Type de résultat</label>
                <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                  {TYPES_AFFICHAGE.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => { setTypeAffichage(t.value); setSousType(""); }}
                      style={{
                        padding:"10px 14px", borderRadius:"10px",
                        border: typeAffichage===t.value
                          ? "2px solid var(--green-light)"
                          : "1.5px solid var(--border)",
                        background: typeAffichage===t.value ? "var(--green-pale)" : "#fff",
                        color: typeAffichage===t.value ? "var(--green-dark)" : "var(--text-mid)",
                        fontWeight: typeAffichage===t.value ? 700 : 500,
                        fontSize:"13px", cursor:"pointer", fontFamily:"inherit",
                        display:"flex", alignItems:"center", gap:"10px",
                        transition:"all 0.15s", textAlign:"left",
                      }}>
                      <span style={{ fontSize:"18px" }}>{t.icon}</span>
                      <div>
                        <div style={{ fontWeight:700 }}>{t.label}</div>
                        <div style={{ fontSize:"11px", opacity:0.6, fontWeight:400 }}>{t.desc}</div>
                      </div>
                      {typeAffichage===t.value && (
                        <span style={{ marginLeft:"auto", fontSize:"12px",
                          color:"var(--green-bright)" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* SOUS-TYPE si liste ou statistique ou fiche */}
              {TYPES_AFFICHAGE.find(t=>t.value===typeAffichage)?.sousTypes?.length > 0 && (
                <div>
                  <label style={labelStyle}>
                    {typeAffichage==="liste" ? "① Type d'entité" :
                     typeAffichage==="statistique" ? "① Type de données" :
                     "① Type de fiche"}
                  </label>
                  <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                    {TYPES_AFFICHAGE.find(t=>t.value===typeAffichage).sousTypes.map(s => (
                      <button key={s.value} type="button"
                        onClick={() => setSousType(s.value)}
                        style={{
                          padding:"9px 14px", borderRadius:"10px", textAlign:"left",
                          border: sousTypeAffichage===s.value
                            ? "2px solid var(--green-light)"
                            : "1.5px solid var(--border)",
                          background: sousTypeAffichage===s.value ? "var(--green-pale)" : "#fff",
                          color: sousTypeAffichage===s.value ? "var(--green-dark)" : "var(--text-mid)",
                          fontWeight: sousTypeAffichage===s.value ? 700 : 500,
                          fontSize:"13px", cursor:"pointer", fontFamily:"inherit",
                          transition:"all 0.15s",
                        }}>
                        {sousTypeAffichage===s.value ? "✓ " : ""}{s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CAS SPÉCIAUX : Fiche et Répertoire → bouton redirection */}
              {(typeAffichage === "fiche" || typeAffichage === "repertoire") && (
                <div style={{ background:"rgba(77,201,122,0.08)",
                  border:"1px solid rgba(77,201,122,0.2)",
                  borderRadius:"12px", padding:"16px" }}>
                  <div style={{ fontSize:"13px", color:"var(--green-dark)",
                    fontWeight:600, marginBottom:"8px" }}>
                    {typeAffichage === "fiche"
                      ? " Demande de fiche " + (sousTypeAffichage === "association" ? "d'association" : "d'entreprise")
                      : " Demande de répertoire thématique"}
                  </div>
                  <div style={{ fontSize:"12px", color:"var(--text-muted)",
                    lineHeight:1.6, marginBottom:"12px" }}>
                    {typeAffichage === "fiche"
                      ? "Votre demande sera transmise à la CCI-BF. Un rendez-vous vous sera confirmé par email."
                      : "Précisez le thème souhaité dans le formulaire. Un rendez-vous vous sera confirmé par email."}
                  </div>
                  <button className="btn-save" style={{ width:"100%", padding:"11px" }}
                    onClick={() => {
                      const msg = typeAffichage === "fiche"
                        ? `Bonjour, je souhaite obtenir une fiche ${sousTypeAffichage === "association" ? "d'association professionnelle" : "d'entreprise"} du fichier NERE. Merci de me confirmer un rendez-vous.`
                        : `Bonjour, je souhaite obtenir un répertoire thématique du fichier NERE. Merci de me confirmer un rendez-vous.`;
                      navigate("/contact?demande=" + encodeURIComponent(msg));
                    }}>
                     Faire ma demande →
                  </button>
                </div>
              )}

              <div style={{ borderTop:"1px solid var(--border)" }}/>

              {/* ÉTAPE 2 — Région + Ville */}
              <div>
                <label style={labelStyle}>② Région</label>
                <select style={inputStyle} value={filtres.region}
                  onChange={e => set("region", e.target.value)}
                  onFocus={el => el.target.style.borderColor="var(--green-light)"}
                  onBlur={el => el.target.style.borderColor="var(--border)"}>
                  <option value="">Toutes les régions</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Ville</label>
                <select  value={filtres.ville}
                  onChange={e => set("ville", e.target.value)}
                  disabled={!filtres.region}
                  onFocus={el => el.target.style.borderColor="var(--green-light)"}
                  onBlur={el => el.target.style.borderColor="var(--border)"}
                  style={{
                    width:"100%", padding:"11px 14px", borderRadius:"10px",
                    border:"1.5px solid var(--border)", fontSize:"13px",
                    fontFamily:"inherit", outline:"none", boxSizing:"border-box",
                    transition:"border 0.2s",
                    opacity: filtres.region ? 1 : 0.45,
                    cursor: filtres.region ? "pointer" : "not-allowed",
                    background: filtres.region ? "#fff" : "var(--off-white)",
                    color: filtres.region ? "var(--text-dark)" : "var(--text-muted)",
                  }}>
                  <option value="">
                    {filtres.region ? "Toutes les villes" : "— Choisir d'abord une région —"}
                  </option>
                  {villesDispo.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div style={{ borderTop:"1px solid var(--border)" }}/>

              {/* ÉTAPE 3 — Catégorie */}
              <div>
                <label style={labelStyle}>③ Catégorie</label>
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {CATEGORIES.map(c => (
                    <button key={c.value} type="button"
                      onClick={() => set("categorie", filtres.categorie===c.value ? "" : c.value)}
                      style={{
                        padding:"9px 12px", borderRadius:"8px",
                        border: filtres.categorie===c.value
                          ? "2px solid var(--green-light)"
                          : "1.5px solid var(--border)",
                        background: filtres.categorie===c.value ? "var(--green-pale)" : "#fff",
                        color: filtres.categorie===c.value ? "var(--green-dark)" : "var(--text-mid)",
                        fontWeight: filtres.categorie===c.value ? 700 : 500,
                        fontSize:"13px", cursor:"pointer", fontFamily:"inherit",
                        display:"flex", alignItems:"center", gap:"8px",
                        transition:"all 0.15s", textAlign:"left",
                      }}>
                      <span>{c.icon}</span>
                      <span style={{ flex:1 }}>{c.label}</span>
                      {filtres.categorie===c.value && <span style={{ fontSize:"11px" }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* ÉTAPE 4 — Sous-catégorie */}
              {catObj && (
                <div>
                  <label style={labelStyle}>④ Sous-catégorie</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                    {catObj.sousCats.map(s => (
                      <button key={s.value} type="button"
                        onClick={() => set("sousCat", filtres.sousCat===s.value ? "" : s.value)}
                        style={{
                          padding:"6px 12px", borderRadius:"100px",
                          border: filtres.sousCat===s.value
                            ? "2px solid var(--green-light)"
                            : "1.5px solid var(--border)",
                          background: filtres.sousCat===s.value ? "var(--green-pale)" : "#fff",
                          color: filtres.sousCat===s.value ? "var(--green-dark)" : "var(--text-mid)",
                          fontWeight: filtres.sousCat===s.value ? 700 : 500,
                          fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
                          transition:"all 0.15s",
                        }}>
                        {filtres.sousCat===s.value ? "✓ " : ""}{s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ borderTop:"1px solid var(--border)" }}/>

              {/* ÉTAPE 5 — Nombre */}
              <div>
                <label style={labelStyle}>⑤ Nombre de résultats (≥ 1)</label>
                <input type="number" min="1" max="500" style={inputStyle}
                  value={filtres.nombre}
                  onChange={e => set("nombre", Math.max(1, parseInt(e.target.value)||1))}
                  onFocus={el => el.target.style.borderColor="var(--green-light)"}
                  onBlur={el => el.target.style.borderColor="var(--border)"}/>
              </div>

              {/* FILTRE ANNÉE — affiché uniquement en mode statistique */}
              {typeAffichage === "statistique" && (
                <>
                  <div style={{ borderTop:"1px solid var(--border)" }}/>
                  <div>
                    <label style={labelStyle}>⑥ Période</label>
                    <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                      {[
                        { v:"toutes",     l:"Toutes les années" },
                        { v:"courante",   l:`Année en cours (${new Date().getFullYear()})` },
                        { v:"precise",    l:"Année précise" },
                        { v:"intervalle", l:"Intervalle d'années" },
                      ].map(opt => (
                        <button key={opt.v} type="button"
                          onClick={() => setModeAnnee(opt.v)}
                          style={{
                            padding:"8px 12px", borderRadius:"8px", textAlign:"left",
                            border: modeAnnee===opt.v ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                            background: modeAnnee===opt.v ? "var(--green-pale)" : "#fff",
                            color: modeAnnee===opt.v ? "var(--green-dark)" : "var(--text-mid)",
                            fontWeight: modeAnnee===opt.v ? 700 : 500,
                            fontSize:"12px", cursor:"pointer", fontFamily:"inherit",
                            transition:"all 0.15s",
                          }}>
                          {modeAnnee===opt.v ? "✓ " : ""}{opt.l}
                        </button>
                      ))}
                    </div>

                    {/* Année précise */}
                    {modeAnnee === "precise" && (
                      <div style={{ marginTop:"10px" }}>
                        <label style={labelStyle}>Année</label>
                        <input type="number" min="2000" max={new Date().getFullYear()}
                          style={inputStyle} value={anneeVal}
                          onChange={e => setAnneeVal(parseInt(e.target.value)||2024)}/>
                      </div>
                    )}

                    {/* Intervalle */}
                    {modeAnnee === "intervalle" && (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                        gap:"10px", marginTop:"10px" }}>
                        <div>
                          <label style={labelStyle}>De</label>
                          <input type="number" min="2000" max={new Date().getFullYear()}
                            style={inputStyle} value={anneeMin}
                            onChange={e => setAnneeMin(parseInt(e.target.value)||2020)}/>
                        </div>
                        <div>
                          <label style={labelStyle}>À</label>
                          <input type="number" min="2000" max={new Date().getFullYear()}
                            style={inputStyle} value={anneeMax}
                            onChange={e => setAnneeMax(parseInt(e.target.value)||2024)}/>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Boutons */}
              <div style={{ display:"flex", gap:"8px" }}>
                <button className="btn-save" style={{ flex:1, padding:"12px",
                    opacity: (typeAffichage==="fiche"||typeAffichage==="repertoire") ? 0.4 : 1 }}
                  onClick={lancer}
                  disabled={loading || typeAffichage==="fiche" || typeAffichage==="repertoire"}>
                  {loading
                    ? <><span className="spinner-sm"/>&nbsp;...</>
                    : (typeAffichage==="fiche"||typeAffichage==="repertoire")
                      ? "↑ Utilisez le bouton ci-dessus"
                      : " Rechercher"}
                </button>
                <button className="btn-cancel" style={{ padding:"12px 14px" }}
                  onClick={reset} title="Réinitialiser">
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* ══ ZONE RÉSULTATS ══ */}
          <div>
            {!rechercheLancee && !loading && (
              <div style={{ background:"#fff", borderRadius:"16px",
                border:"1px solid var(--border)", padding:"60px",
                textAlign:"center" }}>
                <div style={{ fontSize:"56px", marginBottom:"16px" }}></div>
                <h3 style={{ fontFamily:"'Playfair Display',serif",
                  color:"var(--text-dark)", fontSize:"20px", marginBottom:"8px" }}>
                  Lancez votre recherche
                </h3>
                <p style={{ color:"var(--text-muted)", fontSize:"14px",
                  lineHeight:1.7, maxWidth:"360px", margin:"0 auto" }}>
                  Sélectionnez vos critères dans le panneau de gauche
                  puis cliquez sur <strong>Rechercher</strong>.
                </p>
              </div>
            )}

            {rechercheLancee && (
              <>
                {/* Barre de résumé */}
                <div style={{ display:"flex", alignItems:"center",
                  justifyContent:"space-between", marginBottom:"16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <span style={{ fontWeight:700, fontSize:"15px", color:"var(--text-dark)" }}>
                      {resultats.length} résultat{resultats.length>1?"s":""}
                    </span>
                    {filtres.region && (
                      <span style={{ background:"var(--green-pale)",
                        color:"var(--green-dark)", borderRadius:"100px",
                        padding:"3px 10px", fontSize:"11px", fontWeight:600 }}>
                         {filtres.region}
                      </span>
                    )}
                    {catObj && (
                      <span style={{ background:"var(--green-pale)",
                        color:"var(--green-dark)", borderRadius:"100px",
                        padding:"3px 10px", fontSize:"11px", fontWeight:600 }}>
                        {catObj.icon} {catObj.label}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>
                    Affichage : <strong>{TYPES_AFFICHAGE.find(t=>t.value===typeAffichage)?.label}</strong>
                    {typeAffichage==="statistique" && modeAnnee !== "toutes" && (
                      <span style={{ marginLeft:"8px", background:"#E8F0FF",
                        color:"#3366CC", borderRadius:"100px",
                        padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>
                         {modeAnnee==="courante" ? `${new Date().getFullYear()}`
                          : modeAnnee==="precise" ? anneeVal
                          : `${anneeMin} – ${anneeMax}`}
                      </span>
                    )}
                  </span>
                </div>

                {resultats.length === 0 && (
                  <div style={{ background:"#fff", borderRadius:"14px",
                    border:"1px solid var(--border)", padding:"48px", textAlign:"center" }}>
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}></div>
                    <p style={{ color:"var(--text-muted)", fontSize:"14px" }}>
                      Aucune entreprise ne correspond à vos critères.
                    </p>
                  </div>
                )}

                {/* ── VUE LISTE ── */}
                {typeAffichage==="liste" && resultats.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    {resultats.map((e,i) => (
                      <div key={e.id} style={{ background:"#fff", borderRadius:"12px",
                        border:"1px solid var(--border)", padding:"14px 18px",
                        display:"flex", alignItems:"center", gap:"14px" }}>
                        <div style={{ width:"32px", height:"32px", borderRadius:"8px",
                          background:"var(--green-pale)", display:"flex",
                          alignItems:"center", justifyContent:"center",
                          fontFamily:"'Playfair Display',serif", fontWeight:800,
                          fontSize:"14px", color:"var(--green-dark)", flexShrink:0 }}>
                          {i+1}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:"14px",
                            color:"var(--text-dark)" }}>{e.nom}</div>
                          <div style={{ fontSize:"12px", color:"var(--text-muted)",
                            marginTop:"2px" }}>
                             {e.ville}, {e.region} &nbsp;·&nbsp; {CATEGORIES.find(c=>c.value===e.cat)?.icon} {CATEGORIES.find(c=>c.value===e.cat)?.label}
                          </div>
                        </div>
                        <div style={{ fontSize:"12px", color:"var(--text-muted)",
                          fontFamily:"monospace" }}>{e.ifu}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── VUE TABLEAU ── */}
                {typeAffichage==="tableau" && resultats.length > 0 && (
                  <div style={{ background:"#fff", borderRadius:"14px",
                    border:"1px solid var(--border)", overflow:"hidden" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse",
                      fontSize:"13px" }}>
                      <thead>
                        <tr style={{ background:"var(--green-deep)" }}>
                          {["#","Raison sociale","Dirigeant","IFU","Catégorie","Ville","Effectif","CA"].map(h => (
                            <th key={h} style={{ padding:"12px 14px", textAlign:"left",
                              color:"rgba(255,255,255,0.7)", fontWeight:700,
                              fontSize:"11px", textTransform:"uppercase",
                              letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultats.map((e,i) => (
                          <tr key={e.id}
                            onClick={() => setDetail(detail?.id===e.id ? null : e)}
                            style={{ borderBottom:"1px solid var(--border)",
                              cursor:"pointer",
                              background: detail?.id===e.id
                                ? "var(--green-pale)"
                                : i%2===0 ? "#fff" : "var(--off-white)",
                              transition:"background 0.15s" }}>
                            <td style={{ padding:"12px 14px", fontWeight:700,
                              color:"var(--text-muted)" }}>{i+1}</td>
                            <td style={{ padding:"12px 14px", fontWeight:700,
                              color:"var(--text-dark)" }}>{e.nom}</td>
                            <td style={{ padding:"12px 14px",
                              color:"var(--text-mid)" }}>{e.dirigeant}</td>
                            <td style={{ padding:"12px 14px", fontFamily:"monospace",
                              fontSize:"11px", color:"var(--text-muted)" }}>{e.ifu}</td>
                            <td style={{ padding:"12px 14px" }}>
                              <span style={{ background:"var(--green-pale)",
                                color:"var(--green-dark)", borderRadius:"100px",
                                padding:"2px 8px", fontSize:"11px", fontWeight:600 }}>
                                {CATEGORIES.find(c=>c.value===e.cat)?.label}
                              </span>
                            </td>
                            <td style={{ padding:"12px 14px",
                              color:"var(--text-mid)" }}>{e.ville}</td>
                            <td style={{ padding:"12px 14px",
                              color:"var(--text-mid)" }}>{e.effectif}</td>
                            <td style={{ padding:"12px 14px", fontWeight:700,
                              color:"var(--green-dark)" }}>{formaterCA(e.ca)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Détail ligne */}
                    {detail && (
                      <div style={{ padding:"20px 24px",
                        borderTop:"2px solid var(--green-light)",
                        background:"var(--green-pale)" }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:"14px" }}>
                          <span style={{ fontWeight:800, fontSize:"15px",
                            color:"var(--green-dark)" }}>{detail.nom}</span>
                          <button onClick={() => setDetail(null)}
                            style={{ background:"none", border:"none",
                              cursor:"pointer", fontSize:"16px", opacity:0.5 }}>✕</button>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                          gap:"12px", marginBottom:"14px" }}>
                          {[
                            { l:"Dirigeant", v:detail.dirigeant },
                            { l:"IFU",       v:detail.ifu },
                            { l:"Région",    v:detail.region },
                            { l:"Ville",     v:detail.ville },
                            { l:"Catégorie", v:CATEGORIES.find(c=>c.value===detail.cat)?.label },
                            { l:"Effectif",  v:detail.effectif+" emp." },
                            { l:"CA",        v:formaterCA(detail.ca) },
                          ].map(item => (
                            <div key={item.l}>
                              <div style={{ fontSize:"10px", fontWeight:700,
                                color:"var(--text-muted)", textTransform:"uppercase",
                                letterSpacing:"0.07em", marginBottom:"3px" }}>{item.l}</div>
                              <div style={{ fontSize:"13px", fontWeight:600,
                                color:"var(--text-dark)" }}>{item.v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display:"flex", gap:"8px" }}>
                          <button className="btn-save" style={{ fontSize:"12px", padding:"8px 16px" }}
                            onClick={() => navigate("/demande-document")}>
                             Demander un document
                          </button>
                          <button className="btn-cancel" style={{ fontSize:"12px", padding:"8px 16px" }}
                            onClick={() => navigate("/contact")}>
                             Contacter la CCI-BF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── VUE STATISTIQUES ── */}
                {typeAffichage==="statistique" && resultats.length > 0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

                    {/* KPIs */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px" }}>
                      {[
                        {  label:"Entreprises", val:resultats.length },
                        {  label:"Effectif total", val:totalEffectif.toLocaleString() },
                        {  label:"CA total", val:formaterCA(totalCA) },
                      ].map(k => (
                        <div key={k.label} style={{ background:"#fff", borderRadius:"14px",
                          border:"1px solid var(--border)", padding:"20px",
                          textAlign:"center" }}>
                          <div style={{ fontSize:"28px", marginBottom:"8px" }}>{k.icon}</div>
                          <div style={{ fontFamily:"'Playfair Display',serif",
                            fontSize:"22px", fontWeight:900,
                            color:"var(--green-dark)", marginBottom:"4px" }}>
                            {k.val}
                          </div>
                          <div style={{ fontSize:"12px", color:"var(--text-muted)",
                            fontWeight:600, textTransform:"uppercase",
                            letterSpacing:"0.06em" }}>{k.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Répartition par catégorie */}
                    <div style={{ background:"#fff", borderRadius:"14px",
                      border:"1px solid var(--border)", padding:"22px" }}>
                      <div style={{ fontWeight:700, fontSize:"14px",
                        color:"var(--text-dark)", marginBottom:"16px" }}>
                        Répartition par catégorie
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                        {Object.entries(parCat).sort((a,b)=>b[1]-a[1]).map(([cat,nb]) => {
                          const pct = Math.round((nb/resultats.length)*100);
                          return (
                            <div key={cat}>
                              <div style={{ display:"flex", justifyContent:"space-between",
                                fontSize:"13px", marginBottom:"5px" }}>
                                <span style={{ fontWeight:600, color:"var(--text-dark)" }}>{cat}</span>
                                <span style={{ color:"var(--text-muted)" }}>{nb} ({pct}%)</span>
                              </div>
                              <div style={{ height:"8px", borderRadius:"100px",
                                background:"var(--green-pale)", overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${pct}%`,
                                  borderRadius:"100px",
                                  background:"linear-gradient(90deg,#4DC97A,#1A7A40)",
                                  transition:"width 0.5s ease" }}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Répartition par année */}
                    <div style={{ background:"#fff", borderRadius:"14px",
                      border:"1px solid var(--border)", padding:"22px" }}>
                      <div style={{ fontWeight:700, fontSize:"14px",
                        color:"var(--text-dark)", marginBottom:"16px" }}>
                         Répartition par année
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                        {Object.entries(
                          resultats.reduce((acc,e)=>{ acc[e.annee]=(acc[e.annee]||0)+1; return acc; },{})
                        ).sort((a,b)=>b[0]-a[0]).map(([an,nb])=>(
                          <div key={an} style={{ display:"flex", justifyContent:"space-between",
                            padding:"8px 12px", background:"#F0F4FF",
                            borderRadius:"8px", fontSize:"13px" }}>
                            <span style={{ color:"#3366CC", fontWeight:600 }}>📅 {an}</span>
                            <span style={{ fontWeight:700, color:"#0A3D1F" }}>{nb} entreprise{nb>1?"s":""}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Répartition par région */}
                    <div style={{ background:"#fff", borderRadius:"14px",
                      border:"1px solid var(--border)", padding:"22px" }}>
                      <div style={{ fontWeight:700, fontSize:"14px",
                        color:"var(--text-dark)", marginBottom:"16px" }}>
                        Répartition par région
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                        {Object.entries(
                          resultats.reduce((acc,e)=>{ acc[e.region]=(acc[e.region]||0)+1; return acc; },{})
                        ).sort((a,b)=>b[1]-a[1]).map(([reg,nb])=>(
                          <div key={reg} style={{ display:"flex", justifyContent:"space-between",
                            padding:"8px 12px", background:"var(--off-white)",
                            borderRadius:"8px", fontSize:"13px" }}>
                            <span style={{ color:"var(--text-mid)" }}>{reg}</span>
                            <span style={{ fontWeight:700, color:"var(--green-dark)" }}>{nb}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <footer className="dash-footer">
          <span>CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <span>Base NERE · Données officielles</span>
        </footer>
      </div>
    </div>
  );
}