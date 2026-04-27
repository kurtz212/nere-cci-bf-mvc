import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.png";

const API = "/api";

const NAV_LINKS = [
  { label:"Accueil",      path:"/",            key:"accueil"      },
  { label:"Publications", path:"/publications", key:"publications" },
  { label:"Recherche",    path:"/rechercheacc", key:"recherche"    },
  { label:"Contact",      path:"/contact",      key:"contact"      },
  { label:"Messages",     path:"/chat",         key:"messages"     },
];

const TYPES_REQUETES = [
  {
    id:"liste", label:"Liste",
    prix:250, unite:"adresse", direct:true,
    description:"Liste d'entreprises selon vos critères. Résultats immédiats.",
    sousTypes:[
      { value:"liste_entreprises",  label:"Liste d'entreprises" },
      { value:"liste_associations", label:"Liste d'associations professionnelles" },
    ],
    couleur:"#4DC97A",
  },
  {
    id:"autre_specifique", label:"Autre demande",
    prix:null, unite:null, direct:false,
    description:"Demande spécifique personnalisée. Vous serez redirigé vers la messagerie pour discuter directement avec un administrateur.",
    sousTypes:[],
    couleur:"#7C3AED",
  },
  {
    id:"statistique", label:"Statistiques",
    prix:5000, unite:"statistique", direct:true,
    description:"Statistiques sur entreprises, importations et exportations. Résultats immédiats.",
    sousTypes:[
      { value:"stat_entreprises",  label:"Statistiques entreprises" },
      { value:"stat_associations", label:"Statistiques associations" },
      { value:"stat_importations", label:"Statistiques importations" },
      { value:"stat_exportations", label:"Statistiques exportations" },
    ],
    couleur:"#1A7A40",
  },
  {
    id:"fiche", label:"Fiche",
    prix:1000, unite:"fiche", direct:false,
    description:"Fiche complète d'une entreprise ou association. Vous serez redirigé vers la messagerie.",
    sousTypes:[
      { value:"fiche_entreprise",  label:"Fiche entreprise" },
      { value:"fiche_association", label:"Fiche association professionnelle" },
    ],
    couleur:"#0F5C2E",
  },
  {
    id:"autre", label:"Répertoire Thématique",
    prix:null, unite:null, direct:false,
    description:"Répertoire thématique personnalisé. Vous serez redirigé vers la messagerie pour envoyer votre demande.",
    sousTypes:[],
    couleur:"#D4A830",
  },
];

const REGIONS = [
  "OUAGADOUGOU","BOBO","KOUDOUGOU","BANFORA","OUAHIGOUYA",
  "KAYA","FADA","DEDOUGOU","TENKODOGO","ZINIARE",
  "MANGA","KOMBISSIRI","DORI","GAOUA","NOUNA",
];

/* Formes juridiques confirmées dans PFormeJ */
const FORMES_JURIDIQUES = [
  { label:"Personne physique",                              value:"PERSONNE PHYSIQUE",                              nb:126630 },
  { label:"SARL",                                          value:"Société à responsabilité limitée",               nb:42680  },
  { label:"EURL",                                          value:"Entreprise unipersonnelle à responsabilité limitée", nb:20295 },
  { label:"SA à Conseil d'Administration",                 value:"Société anonyme à Conseil d'Administration",     nb:6513   },
  { label:"SAS",                                           value:"Société par actions simplifiée",                 nb:445    },
  { label:"SA à Directoire",                               value:"Société Anonyme à Directoire",                   nb:187    },
  { label:"Coopérative ouvrière",                          value:"Société coopérative ouvrière de production",     nb:159    },
  { label:"SASU",                                          value:"Société par actions simplifiée unipersonnelle",  nb:141    },
  { label:"GIE",                                           value:"Groupement d'intérêt économique",                nb:118    },
  { label:"Succursale",                                    value:"SUCCURSALE",                                     nb:104    },
  { label:"Société civile professionnelle",                value:"Société civile professionnelle",                 nb:81     },
  { label:"Société civile immobilière",                    value:"Société civile immobilière",                     nb:41     },
  { label:"Autres formes juridiques",                      value:"AUTRES FORMES JURIDIQUES",                       nb:35     },
  { label:"Société d'État",                                value:"SOCIETE D'ETAT",                                 nb:22     },
  { label:"SNC",                                           value:"Société en nom collectif",                       nb:3      },
  { label:"SCS",                                           value:"Société en commandite simple",                   nb:3      },
  { label:"Société d'économie mixte",                      value:"Société d'économie mixte",                       nb:5      },
];

const TRANCHES_EFFECTIF = [
  { value:"1-9",    label:"1 à 9 employés (Micro-entreprise)" },
  { value:"10-49",  label:"10 à 49 employés (Petite entreprise)" },
  { value:"50-199", label:"50 à 199 employés (Moyenne entreprise)" },
  { value:"200-499",label:"200 à 499 employés (Grande entreprise)" },
  { value:"500+",   label:"500 employés et plus" },
];

/* ══ Secteurs et sous-secteurs d'activité ══ */
const SECTEURS = [
  {
    code: "C", label: "Commerce",
    sousCategories: [
      { code:"C01", label:"Petites entreprises de commerce" },
      { code:"C02", label:"Grandes entreprises de commerce" },
      { code:"C03", label:"Moyennes entreprises de commerce" },
    ]
  },
  {
    code: "I", label: "Industrie",
    sousCategories: [
      { code:"I04", label:"Grandes industries agroalimentaires" },
      { code:"I10", label:"Moyennes industries agroalimentaires" },
      { code:"I12", label:"Petites industries agroalimentaires" },
      { code:"I05", label:"Industries de transformation cotonnière et textile" },
      { code:"I06", label:"Industrie métallurgique et de montage industriel" },
      { code:"I02", label:"Industries du papier, du bois et industries diverses" },
      { code:"I08", label:"Industries chimiques" },
      { code:"I01", label:"Industries minières et extractives" },
      { code:"I03", label:"Industries du ciment" },
      { code:"I07", label:"Grandes entreprises de BTP" },
      { code:"I09", label:"Moyennes entreprises de BTP" },
      { code:"I11", label:"Petites entreprises de BTP" },
    ]
  },
  {
    code: "A", label: "Artisanat",
    sousCategories: [
      { code:"A01", label:"Sous catégorie artisanat" },
    ]
  },
  {
    code: "S", label: "Services",
    sousCategories: [
      { code:"S08", label:"Banques et établissements financiers" },
      { code:"S25", label:"Institutions de Microfinance" },
      { code:"S07", label:"Transfert d'argent et activités financières" },
      { code:"S04", label:"Assurances" },
      { code:"S17", label:"Etablissements d'enseignements privés" },
      { code:"S20", label:"Centres de santé privés" },
      { code:"S01", label:"Services de pharmacie" },
      { code:"S06", label:"Télécommunications" },
      { code:"S13", label:"Informatique" },
      { code:"S11", label:"Grandes entreprises de transports" },
      { code:"S03", label:"Moyennes entreprises de transports" },
      { code:"S02", label:"Petites entreprises de transports" },
      { code:"S15", label:"Transit, gestion de fret et d'entrepôt" },
      { code:"S12", label:"Hotel et Auberge" },
      { code:"S16", label:"Restaurant" },
      { code:"S26", label:"Agences de voyages et de tourisme" },
      { code:"S14", label:"Etudes et conseil aux entreprises" },
      { code:"S05", label:"Architectes, géomètres, topographes" },
      { code:"S21", label:"Experts comptables" },
      { code:"S23", label:"Avocats et auxiliaires de justice" },
      { code:"S22", label:"Agences immobilières" },
      { code:"S18", label:"Agences en communications et de publicité" },
      { code:"S24", label:"Agences de nettoyage et d'assainissement" },
      { code:"S19", label:"Services de protection et de gardiennage" },
      { code:"S27", label:"Enquêtes et sécurité" },
      { code:"S09", label:"Entreprises culturelles et créatives" },
      { code:"S10", label:"Autres services marchands" },
    ]
  },
];

/* Secteurs sans Services (pour import/export) */
const SECTEURS_DOUANE = SECTEURS.filter(s => s.code !== "S");

const STATUT_COLORS = {
  en_attente:{ bg:"rgba(212,168,48,0.1)",  color:"#D4A830", label:"En attente" },
  en_cours:  { bg:"rgba(34,160,82,0.1)",   color:"#22A052", label:"En cours"   },
  traite:    { bg:"rgba(26,122,64,0.12)",  color:"#1A7A40", label:"Traité"      },
  rejete:    { bg:"rgba(232,85,85,0.1)",   color:"#E85555", label:"Rejeté"      },
};

const ANNEE_COURANTE = new Date().getFullYear();

function formaterMontant(m) {
  if (!m) return "Sur devis";
  return m.toLocaleString("fr-FR") + " FCFA";
}

function Chip({ label }) {
  return (
    <span style={{ background:"var(--green-pale)", color:"var(--green-dark)",
      border:"1px solid rgba(34,160,82,0.2)", borderRadius:"100px",
      padding:"3px 10px", fontSize:"11px", fontWeight:600 }}>
      {label}
    </span>
  );
}

function SectionCritere({ titre, sous, children }) {
  return (
    <div style={{ background:"var(--off-white)", borderRadius:"12px",
      border:"1px solid var(--border)", padding:"20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
        <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)" }}>{titre}</span>
        {sous && <span style={{ fontSize:"11px", color:"var(--text-muted)" }}>{sous}</span>}
      </div>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   Génère le message prédéfini pour le chat
══════════════════════════════════════════ */
function genererMessageChat(typeRequete, sousType, user, form) {
  const sousTypeLabel = TYPES_REQUETES
    .find(t => t.id === typeRequete)
    ?.sousTypes?.find(s => s.value === sousType)?.label || "";

  const coordonnees = [
    user?.prenom && user?.nom ? `• Nom : ${user.prenom} ${user.nom}` : "",
    user?.email              ? `• Email : ${user.email}`             : "",
    user?.telephone          ? `• Téléphone : ${user.telephone}`     : "",
    user?.fonction           ? `• Fonction : ${user.fonction}`       : "",
  ].filter(Boolean).join("\n");

  if (typeRequete === "autre_specifique") {
    return ` Demande spécifique personnalisée\nBonjour,\n\nJe souhaite faire une demande spécifique auprès de la CCI-BF.\n\n Mes coordonnées :\n${coordonnees}\n${form?.description ? `\n Ma demande :\n${form.description}` : ""}\n\nMerci de me contacter pour traiter cette demande.`;
  }

  if (typeRequete === "autre") {
    return ` Demande de Répertoire Thématique\nBonjour,\nJe souhaite obtenir un répertoire thématique personnalisé auprès de la CCI-BF.\n Mes coordonnées :\n${coordonnees}\n${form?.description ? `\n Précisions : ${form.description}` : ""}\nMerci de me contacter pour convenir d'un rendez-vous au siège CCI-BF.`;
  }

  if (typeRequete === "fiche") {
    return ` Demande de Fiche — ${sousTypeLabel || "Entreprise / Association"}\nBonjour,\n\nJe souhaite obtenir une fiche complète pour : ${sousTypeLabel || "une entreprise / association"}.\n\n Mes coordonnées :\n${coordonnees}\n${form?.description ? `\n Précisions : ${form.description}` : ""}\n\nMerci de me contacter pour convenir d'un rendez-vous au siège CCI-BF.`;
  }

  return "";
}

export default function DemandeDocument() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [menuOpen, setMenuOpen]   = useState(false);
  const [onglet, setOnglet]       = useState("nouvelle");
  const [etape, setEtape]         = useState(1);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);
  const [erreur, setErreur]       = useState("");
  const [solde, setSolde]         = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [coutRequete, setCoutRequete] = useState(0);
  const [resultatNere, setResultatNere] = useState(null);

  const [form, setForm] = useState({
    typeRequete:"", sousType:[], quantite:"",
    regions:[], villes:"", formesJuridiques:[], tranches:[],
    secteur:"", sousCategories:[],
    description:"", contact:user?.email||"", telephone:"",
  });
  const [secteurOuvert, setSecteurOuvert] = useState(null);

  const [periodeType, setPeriodeType]         = useState("annee_courante");
  const [anneeSpecifique, setAnneeSpecifique] = useState(String(ANNEE_COURANTE));
  const [anneeDebut, setAnneeDebut]           = useState("2020");
  const [anneeFin, setAnneeFin]               = useState(String(ANNEE_COURANTE));

  const [demandes, setDemandes]               = useState([]);
  const [demandesLoading, setDemandesLoading] = useState(false);
  const [demandesErreur, setDemandesErreur]   = useState("");
  const [filtreStatut, setFiltreStatut]       = useState("tous");
  const [annulationId, setAnnulationId]       = useState(null);
  const [actionMessage, setActionMessage]     = useState({ id:null, texte:"", type:"" });

  const typeObj    = TYPES_REQUETES.find(t => t.id === form.typeRequete);
  const isDirect   = typeObj?.direct !== false;
  const isChat     = form.typeRequete === "autre" || form.typeRequete === "fiche" || form.typeRequete === "autre_specifique";
  const montant    = typeObj?.prix && form.quantite && form.typeRequete !== "statistique" && isDirect
    ? typeObj.prix * parseInt(form.quantite || 0) : null;
  const nbCriteres = form.regions.length + form.formesJuridiques.length + form.tranches.length;

  // Stat import/export uniquement : secteur + région + période
  const estStatDouane = form.typeRequete === "statistique" &&
    form.sousType.some(st => ["stat_importations","stat_exportations"].includes(st)) &&
    !form.sousType.some(st => ["stat_entreprises","stat_associations"].includes(st));

  // Stat associations uniquement : région + période
  const estStatAssociation = form.typeRequete === "statistique" &&
    form.sousType.includes("stat_associations") &&
    !form.sousType.some(st => ["stat_importations","stat_exportations","stat_entreprises"].includes(st));
  const initiales  = user ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase() : "";

  const chargerDemandes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDemandesLoading(true); setDemandesErreur("");
    try {
      const res  = await fetch(`${API}/demandes/mes-demandes`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setDemandes(data.data||[]);
      else setDemandesErreur(data.message||"Impossible de charger.");
    } catch { setDemandesErreur("Serveur inaccessible."); }
    setDemandesLoading(false);
  }, []);

  useEffect(() => {
    if (onglet === "historique") chargerDemandes();
  }, [onglet, chargerDemandes]);

  const toggleArr = (field, val) => setForm(f => ({
    ...f, [field]: f[field].includes(val) ? f[field].filter(v=>v!==val) : [...f[field], val],
  }));

  const getPeriodeLabel = () => {
    if (periodeType === "annee_courante")   return `Année ${ANNEE_COURANTE}`;
    if (periodeType === "annee_specifique") return `Année ${anneeSpecifique}`;
    if (periodeType === "intervalle")       return `${anneeDebut} → ${anneeFin}`;
    return "";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ── Rediriger vers /chat avec message prédéfini + déduction solde ── */
  const redirecterVersChat = async () => {
    const token = localStorage.getItem("token");
    setLoading(true); setErreur("");

    try {
      // autre_specifique = gratuit, pas de déduction
      if (form.typeRequete === "autre_specifique") {
        setLoading(false);
        const msg = genererMessageChat(form.typeRequete, form.sousType, user, form);
        navigate("/chat", { state: { messagePredefini: msg } });
        return;
      }

      const cout = form.typeRequete === "fiche" ? 1000 : 5000;

      const res  = await fetch(`${API}/abonnements/deduire`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          typeRequete: form.typeRequete === "fiche" ? "fiche" : "autre",
          quantite:    1,
          description: `Demande ${form.typeRequete === "fiche" ? "Fiche" : "Répertoire Thématique"}`,
        }),
      });
      const data = await res.json();

      if (!data.success && data.code === "SOLDE_INSUFFISANT") {
        setCoutRequete(data.cout || cout);
        setShowUpgrade(true);
        setLoading(false);
        return;
      }

      if (!data.success && data.code === "NO_ABO") {
        setErreur("Aucun abonnement actif. Veuillez souscrire à une formule.");
        setLoading(false);
        return;
      }

    } catch {
      /* Si le serveur est inaccessible on redirige quand même */
    }

    setLoading(false);
    const msg = genererMessageChat(form.typeRequete, form.sousType, user, form);
    navigate("/chat", { state: { messagePredefini: msg } });
  };

  /* ══ SOUMETTRE ══ */
  const soumettre = async () => {
    /* Fiche ou Répertoire → redirection directe vers chat */
    if (isChat) {
      redirecterVersChat();
      return;
    }

    setLoading(true); setErreur("");
    const token = localStorage.getItem("token");
    try {
      const quantiteEnvoyee = form.typeRequete === "statistique" ? 1 : parseInt(form.quantite || 1);

      const deductRes = await fetch(`${API}/abonnements/deduire`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          typeRequete: form.typeRequete,
          quantite:    quantiteEnvoyee,
          description: `Requête ${typeObj?.label}`,
        }),
      });
      const deductData = await deductRes.json();

      if (!deductData.success && deductData.code === "SOLDE_INSUFFISANT") {
        setCoutRequete(deductData.cout || montant || 0);
        setShowUpgrade(true);
        setLoading(false);
        return;
      }
      if (deductData.success) {
        setSolde(s => ({ ...(s||{}), solde: deductData.data?.solde }));
      }

      const params = new URLSearchParams({ limit:Math.min(quantiteEnvoyee, 50), page:1 });
      if (form.regions.length > 0)          params.append("region",          form.regions[0]);
      if (form.formesJuridiques.length > 0) params.append("forme_juridique", form.formesJuridiques[0]);
      if (form.villes)                       params.append("commune",          form.villes);
      if (form.sousCategories.length > 0)   params.append("sous_categorie",  form.sousCategories[0]);
      if (form.tranches.length > 0) {
        const t = form.tranches[0];
        if (t !== "500+") {
          const [min, max] = t.split("-");
          params.append("effectif_min", min);
          params.append("effectif_max", max);
        } else {
          params.append("effectif_min", "500");
        }
      }

      let nereData = null;

      /*  routes /nere/ */
      if (form.typeRequete === "statistique") {
        /* Statistiques — appels multiples selon les sous-types sélectionnés */
        const sousTypes = Array.isArray(form.sousType) ? form.sousType : [form.sousType];
        const STAT_ROUTES = {
          stat_entreprises:  `${API}/nere/statistiques`,
          stat_associations: `${API}/nere/statistiques/associations`,
          stat_importations: `${API}/nere/statistiques/importations`,
          stat_exportations: `${API}/nere/statistiques/exportations`,
        };
        const resultats = await Promise.all(
          sousTypes.map(st =>
            fetch(STAT_ROUTES[st] || `${API}/nere/statistiques`,
              { headers:{ Authorization:`Bearer ${token}` } }
            ).then(r => r.json()).then(d => ({ type: st, ...d }))
          )
        );
        nereData = { success:true, multi:true, resultats };
      } else if (['liste_associations'].includes(
          Array.isArray(form.sousType) ? form.sousType[0] : form.sousType)) {
        const r = await fetch(`${API}/nere/associations?${params}`, { headers:{ Authorization:`Bearer ${token}` } });
        nereData = await r.json();
      } else {
        /* Entreprises — multicritere */
        const r = await fetch(`${API}/nere/multicritere?${params}`, { headers:{ Authorization:`Bearer ${token}` } });
        nereData = await r.json();
      }

      setResultatNere(nereData);

      await fetch(`${API}/demandes`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          typeRequete:form.typeRequete, sousType:form.sousType, quantite:quantiteEnvoyee,
          regions:form.regions, villes:form.villes,
          formesJuridiques:form.formesJuridiques, tranches:form.tranches,
          sousCategories:form.sousCategories,
          description:form.description, contact:form.contact, telephone:form.telephone,
          montantEstime: form.typeRequete==="statistique" ? 5000 : montant,
          statut:"traite",
        }),
      });

      setSuccess(true);
    } catch(e) {
      setErreur(`Erreur : ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const annulerDemande = async (id) => {
    if (!window.confirm("Confirmer l'annulation ?")) return;
    setAnnulationId(id);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API}/demandes/${id}/annuler`,
        { method:"PUT", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" } });
      const data = await res.json();
      setActionMessage({ id, texte:data.success?"Annulée.":data.message, type:data.success?"succes":"erreur" });
      if (data.success) chargerDemandes();
    } catch { setActionMessage({ id, texte:"Erreur serveur.", type:"erreur" }); }
    setAnnulationId(null);
    setTimeout(()=>setActionMessage({ id:null, texte:"", type:"" }), 4000);
  };

  const reset = () => {
    setSuccess(false); setEtape(1); setResultatNere(null); setErreur("");
    setForm({ typeRequete:"", sousType:[], quantite:"", regions:[], villes:"",
      formesJuridiques:[], tranches:[], description:"", contact:user?.email||"", telephone:"" });
  };

  const demandesFiltrees = filtreStatut==="tous" ? demandes : demandes.filter(d=>d.statut===filtreStatut);

  /* ══ PAGE NON CONNECTÉ ══ */
  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#F5FAF7",
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"48px",
        maxWidth:"440px", textAlign:"center" }}>
        <div style={{ fontSize:"48px", marginBottom:"20px" }}></div>
        <h2 style={{ color:"#0A3D1F", marginBottom:"12px" }}>Service réservé aux abonnés</h2>
        <p style={{ color:"#6B9A7A", marginBottom:"28px" }}>
          Connectez-vous pour accéder aux demandes de données NERE.
        </p>
        <button onClick={()=>navigate("/connexion")}
          style={{ width:"100%", padding:"14px", background:"#00904C", color:"#fff", border:"none",
            borderRadius:"10px", fontWeight:700, fontSize:"15px", cursor:"pointer", marginBottom:"10px" }}>
          Se connecter
        </button>
        <button onClick={()=>navigate("/inscription")}
          style={{ width:"100%", padding:"14px", background:"#fff", color:"#00904C",
            border:"2px solid #00904C", borderRadius:"10px", fontWeight:700,
            fontSize:"15px", cursor:"pointer" }}>
          Créer un compte
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }
        .nere-navbar-dem {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; height: 120px;
          background: #00904C;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }
        .nere-navbar-dem .nav-pill {
          display: flex; align-items: center; gap: 3px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 100px; padding: 5px 8px;
          margin-left: auto; margin-right: 20px;
        }
        .nere-navbar-dem .nav-pill .nav-btn {
          padding: 7px 15px; border-radius: 100px;
          font-size: 20px; font-weight: 600;
          color: rgba(255,255,255,0.78); cursor: pointer;
          transition: all 0.18s; white-space: nowrap;
          border: none; background: transparent;
          font-family: Arial, Helvetica, sans-serif;
        }
        .nere-navbar-dem .nav-pill .nav-btn:hover { color: #fff; background: rgba(255,255,255,0.12); }
        .nere-navbar-dem .nav-pill .nav-btn.active {
          color: #0A3D1F; background: #4DC97A;
          font-weight: 700; box-shadow: 0 2px 8px rgba(77,201,122,0.4);
        }
        .nere-navbar-dem .u-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 12px 5px 5px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px; cursor: pointer;
          color: #fff; font-size: 13px; font-weight: 600;
          transition: all 0.2s; flex-shrink: 0;
        }
        .nere-navbar-dem .u-chip:hover { background: rgba(255,255,255,0.18); }
        .nere-navbar-dem .u-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: #4DC97A; color: #0A3D1F;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 12px; flex-shrink: 0;
        }
        .nere-dropdown-dem {
          position: absolute; z-index: 9999;
          top: calc(100% + 10px); right: 0;
          background: #fff; border-radius: 16px;
          border: 1px solid #E2EDE6; min-width: 220px;
          overflow: hidden; box-shadow: 0 16px 48px rgba(0,0,0,0.14);
          animation: dropInDem 0.18s ease;
        }
        @keyframes dropInDem {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .nere-dropdown-dem .dd-head {
          padding: 14px 18px 10px; border-bottom: 1px solid #F0F4F1;
          background: linear-gradient(135deg,#F5FAF7,#fff);
        }
        .nere-dropdown-dem .dd-name  { font-weight:800; color:#0A3D1F; font-size:14px; }
        .nere-dropdown-dem .dd-email { font-size:12px; color:#6B9A7A; margin-top:2px; }
        .nere-dropdown-dem .dd-role  {
          display:inline-flex; align-items:center; gap:5px; margin-top:6px;
          background:#E8F5EE; color:#00904C; border-radius:100px; padding:3px 10px;
          font-size:10px; font-weight:700; text-transform:uppercase;
        }
        .nere-dropdown-dem .dd-item {
          padding: 10px 18px; font-size:13px; color:#0A3D1F;
          cursor:pointer; transition:background 0.15s;
        }
        .nere-dropdown-dem .dd-item:hover { background:#F5FAF7; }
        .nere-dropdown-dem .dd-danger { color:#CC3333; }
        .nere-dropdown-dem .dd-danger:hover { background:#FFF0F0 !important; }
        .nere-dropdown-dem .dd-sep { height:1px; background:#F0F4F1; margin:4px 0; }
      `}</style>

      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR ══ */}
        <nav className="nere-navbar-dem">
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
                className={`nav-btn ${link.key==="demande"?"active":""}`}
                onClick={() => navigate(link.path)}>
                {link.label}
              </button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
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
                  <div className="nere-dropdown-dem" onClick={e => e.stopPropagation()}>
                    <div className="dd-head">
                      <div className="dd-name">{user.prenom} {user.nom}</div>
                      <div className="dd-email">{user.email||"—"}</div>
                      <div className="dd-role">
                        {user.role==="admin"   ? " Admin" :
                         user.role==="manager" ? "Gestionnaire" : " Abonné"}
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
                           Tableau de bord
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
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <div className="pub-page-hero" style={{ padding:"28px 48px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
            <div className="pub-page-tag">CCI-BF · Service des données NERE</div>
            {solde && (
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:"10px", padding:"8px 16px",
                display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.6)", textTransform:"uppercase" }}>Solde</span>
                <span style={{ fontWeight:800, fontSize:"18px",
                  color: solde.solde<2000?"#FF8080":solde.solde<5000?"#D4A830":"#4DC97A" }}>
                  {solde.solde?.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            )}
          </div>
          <h1 className="pub-page-title" style={{ fontSize:"26px", textAlign:"left", marginBottom:"10px" }}>
            Demande de données officielles
          </h1>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {TYPES_REQUETES.map(t=>(
              <span key={t.id} style={{ background:"rgba(255,255,255,0.1)",
                border:"1px solid rgba(255,255,255,0.15)", borderRadius:"100px",
                padding:"4px 12px", fontSize:"11px", color:"rgba(255,255,255,0.8)" }}>
                {t.label}
                {t.prix
                  ? ` — ${t.id==="statistique"?`${t.prix.toLocaleString()} FCFA forfait`:`${t.prix.toLocaleString()} FCFA/${t.unite}`}`
                  : " — Via messagerie"}
              </span>
            ))}
          </div>
        </div>

        {/* ══ MODAL SOLDE INSUFFISANT ══ */}
        {showUpgrade && (
          <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.6)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
            <div style={{ background:"#fff", borderRadius:"20px", padding:"36px",
              maxWidth:"420px", width:"100%", textAlign:"center" }}>
              <div style={{ fontSize:"48px", marginBottom:"16px" }}></div>
              <h3 style={{ fontSize:"22px", color:"#0A3D1F", marginBottom:"8px", fontWeight:800 }}>
                Solde insuffisant
              </h3>
              <p style={{ color:"#6B9A7A", fontSize:"14px", lineHeight:1.6, marginBottom:"24px" }}>
                Cette requête coûte{" "}
                <strong style={{ color:"#CC3333" }}>{coutRequete.toLocaleString("fr-FR")} FCFA</strong>.
                <br/>Rechargez votre compte pour continuer.
              </p>
              <button onClick={()=>{setShowUpgrade(false);navigate("/formules");}}
                style={{ width:"100%", padding:"13px", borderRadius:"10px", background:"#00904C",
                  color:"#fff", border:"none", fontWeight:700, fontSize:"14px",
                  cursor:"pointer", marginBottom:"10px" }}>
                Voir les formules →
              </button>
              <button onClick={()=>setShowUpgrade(false)}
                style={{ color:"#6B9A7A", background:"none", border:"none",
                  cursor:"pointer", fontSize:"13px" }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ══ ONGLETS ══ */}
        <div style={{ background:"#fff", borderBottom:"1px solid var(--border)",
          padding:"0 48px", display:"flex" }}>
          {[
             { key:"Recherche par un critère",   label:"Recherche par un critère" },
            { key:"nouvelle",   label:"Nouvelle demande" },
            { key:"historique", label:`Mes demandes${demandes.length>0?` (${demandes.length})`:""}`},
          ].map(o=>(
            <button key={o.key} onClick={()=>setOnglet(o.key)} style={{
              padding:"14px 24px", background:"transparent", border:"none",
              borderBottom: onglet===o.key?"3px solid var(--green-light)":"3px solid transparent",
              color: onglet===o.key?"var(--green-dark)":"var(--text-muted)",
              fontWeight: onglet===o.key?700:500, fontSize:"14px", cursor:"pointer" }}>
              {o.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"32px 48px 60px", background:"var(--off-white)" }}>

          {/* ══ NOUVELLE DEMANDE ══ */}
          {onglet==="nouvelle" && (
            <div style={{ maxWidth:"860px", margin:"0 auto" }}>

              {/* PAGE SUCCÈS */}
              {success ? (
                <div style={{ background:"#fff", borderRadius:"20px",
                  border:"1px solid var(--border)", padding:"40px", textAlign:"center" }}>
                  <div style={{ fontSize:"56px", marginBottom:"16px" }}></div>
                  <h2 style={{ fontSize:"26px", fontWeight:900, marginBottom:"12px", color:"#00904C" }}>
                    Résultats disponibles !
                  </h2>
                  <p style={{ color:"#6B9A7A", fontSize:"14px", lineHeight:1.8, marginBottom:"24px" }}>
                    Votre demande de <strong>{typeObj?.label}</strong> a été traitée et le montant débité.
                  </p>

                  {(form.typeRequete==="statistique" || montant) && (
                    <div style={{ display:"inline-flex", alignItems:"center", gap:"12px",
                      background:"rgba(0,144,76,0.06)", border:"1px solid rgba(0,144,76,0.18)",
                      borderRadius:"14px", padding:"16px 28px", marginBottom:"24px" }}>
                      <span style={{ fontSize:"24px" }}></span>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:"11px", fontWeight:700, color:"#6B9A7A",
                          textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px" }}>
                          Montant débité
                        </div>
                        <div style={{ fontSize:"24px", fontWeight:900, color:"#00904C" }}>
                          {form.typeRequete==="statistique" ? "5 000 FCFA" : formaterMontant(montant)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Résultats NERE */}
                  {resultatNere && (
                    <div style={{ marginBottom:"28px", textAlign:"left" }}>
                      {form.typeRequete==="statistique" ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                          {(resultatNere?.multi ? resultatNere.resultats : [{ type: form.sousType[0]||"stat_entreprises", ...resultatNere }]).map((stat, idx) => {
                            const LABELS = {
                              stat_entreprises:  { titre:"Statistiques Entreprises",  couleur:"#00904C" },
                              stat_associations: { titre:"Statistiques Associations",  couleur:"#1E60CC" },
                              stat_importations: { titre:"Statistiques Importations", couleur:"#D4A830" },
                              stat_exportations: { titre:"Statistiques Exportations", couleur:"#E85555" },
                            };
                            const meta = LABELS[stat.type] || LABELS.stat_entreprises;
                            return (
                              <div key={idx} style={{ border:`1px solid ${meta.couleur}33`, borderRadius:"14px", overflow:"hidden" }}>
                                <div style={{ background:meta.couleur, padding:"14px 18px" }}>
                                  <span style={{ fontWeight:700, color:"#fff" }}>{meta.emoji} {meta.titre}</span>
                                </div>
                                <div style={{ padding:"16px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                                  <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"16px", textAlign:"center" }}>
                                    <div style={{ fontSize:"11px", color:"#6B9A7A", textTransform:"uppercase", marginBottom:"4px" }}>Total</div>
                                    <div style={{ fontSize:"32px", fontWeight:900, color:meta.couleur }}>
                                      {stat.data?.total?.toLocaleString("fr-FR") || "—"}
                                    </div>
                                  </div>
                                  {stat.data?.valeur_totale && (
                                    <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"16px", textAlign:"center" }}>
                                      <div style={{ fontSize:"11px", color:"#6B9A7A", textTransform:"uppercase", marginBottom:"4px" }}>Valeur totale</div>
                                      <div style={{ fontSize:"18px", fontWeight:900, color:meta.couleur }}>
                                        {Number(stat.data.valeur_totale).toLocaleString("fr-FR")} FCFA
                                      </div>
                                    </div>
                                  )}
                                  {stat.data?.par_region?.slice(0,2).map((r,i)=>(
                                    <div key={i} style={{ background:"#F5FAF7", borderRadius:"10px", padding:"12px 16px" }}>
                                      <div style={{ fontSize:"11px", color:"#6B9A7A", marginBottom:"4px" }}>{r.region||r.province||"N/A"}</div>
                                      <div style={{ fontWeight:800, color:meta.couleur, fontSize:"18px" }}>{r.nb?.toLocaleString("fr-FR")}</div>
                                    </div>
                                  ))}
                                  {stat.data?.par_province?.slice(0,2).map((r,i)=>(
                                    <div key={i} style={{ background:"#F5FAF7", borderRadius:"10px", padding:"12px 16px" }}>
                                      <div style={{ fontSize:"11px", color:"#6B9A7A", marginBottom:"4px" }}>{r.province||"N/A"}</div>
                                      <div style={{ fontWeight:800, color:meta.couleur, fontSize:"18px" }}>{r.nb?.toLocaleString("fr-FR")}</div>
                                    </div>
                                  ))}
                                </div>
                                {stat.data?.par_forme_juridique?.slice(0,5).map((f,i)=>(
                                  <div key={i} style={{ padding:"10px 18px", borderTop:`1px solid ${meta.couleur}15`,
                                    display:"flex", justifyContent:"space-between" }}>
                                    <span style={{ fontSize:"13px", color:"#0A2410" }}>{f.forme_juridique||f.categorie||"N/A"}</span>
                                    <span style={{ fontWeight:700, color:meta.couleur }}>{f.nb?.toLocaleString("fr-FR")}</span>
                                  </div>
                                ))}
                                {stat.data?.par_produit?.slice(0,5).map((p,i)=>(
                                  <div key={i} style={{ padding:"10px 18px", borderTop:`1px solid ${meta.couleur}15`,
                                    display:"flex", justifyContent:"space-between" }}>
                                    <span style={{ fontSize:"12px", color:"#0A2410" }}>{p.produit||"N/A"}</span>
                                    <span style={{ fontWeight:700, color:meta.couleur }}>{p.nb?.toLocaleString("fr-FR")}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ) : resultatNere.data?.length > 0 ? (
                        <div style={{ border:"1px solid rgba(0,144,76,0.15)", borderRadius:"14px", overflow:"hidden" }}>
                          <div style={{ background:"#00904C", padding:"14px 18px",
                            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontWeight:700, color:"#fff" }}>
                              {typeObj?.label} — {resultatNere.total?.toLocaleString("fr-FR")} résultat{resultatNere.total>1?"s":""}
                            </span>
                            <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)" }}>
                              {resultatNere.data.length} affichés
                            </span>
                          </div>
                          <div style={{ maxHeight:"500px", overflowY:"auto" }}>
                            {resultatNere.data.map((ent,i)=>{
                              const estAss = !!ent.code_ass || !!ent.recepisse;
                              return (
                                <div key={ent.code_ent||ent.code_ass||i} style={{
                                  padding:"14px 18px",
                                  borderBottom:"1px solid rgba(0,144,76,0.08)",
                                  background:i%2===0?"#fff":"#F9FCF9" }}>

                                  {/* Ligne 1 — Nom + badges */}
                                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                                    <div>
                                      <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410" }}>
                                        {ent.denomination||ent.nom_commercial||ent.nom||"—"}
                                      </div>
                                      {(ent.sigle||ent.enseigne) && (
                                        <div style={{ fontSize:"11px", color:"#6B9A7A" }}>
                                          {[ent.sigle, ent.enseigne].filter(Boolean).join(" · ")}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", justifyContent:"flex-end" }}>
                                      {ent.region && (
                                        <span style={{ background:"rgba(0,144,76,0.08)", color:"#00904C",
                                          borderRadius:"100px", padding:"2px 10px", fontSize:"10px", fontWeight:600 }}>
                                          {ent.region}
                                        </span>
                                      )}
                                      {ent.etat && (
                                        <span style={{
                                          background:ent.etat==="A"?"rgba(77,201,122,0.1)":"rgba(232,85,85,0.1)",
                                          color:ent.etat==="A"?"#1A7A40":"#CC3333",
                                          borderRadius:"100px", padding:"2px 10px", fontSize:"10px", fontWeight:600 }}>
                                          {ent.etat==="A"?"Actif":"Inactif"}
                                        </span>
                                      )}
                                      {ent.statut_validite && (
                                        <span style={{
                                          background:ent.statut_validite==="1"||ent.statut_validite==="A"?"rgba(77,201,122,0.1)":"rgba(232,85,85,0.1)",
                                          color:ent.statut_validite==="1"||ent.statut_validite==="A"?"#1A7A40":"#CC3333",
                                          borderRadius:"100px", padding:"2px 10px", fontSize:"10px", fontWeight:600 }}>
                                          {ent.statut_validite==="1"||ent.statut_validite==="A"?"Valide":"Non valide"}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Identifiants — seulement si non null */}
                                  {[
                                    { label:"RCCM",      value:ent.rccm },
                                    { label:"IFU",       value:ent.ifu },
                                    { label:"CNSS",      value:ent.cnss },
                                    { label:"Récépissé", value:ent.recepisse },
                                  ].filter(f=>f.value).length > 0 && (
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px", marginBottom:"6px" }}>
                                      {[
                                        { label:"RCCM",      value:ent.rccm },
                                        { label:"IFU",       value:ent.ifu },
                                        { label:"CNSS",      value:ent.cnss },
                                        { label:"Récépissé", value:ent.recepisse },
                                      ].filter(f=>f.value).map(f=>(
                                        <span key={f.label} style={{ fontSize:"10px", color:"#6B9A7A",
                                          background:"#F0F4F1", borderRadius:"4px", padding:"2px 8px" }}>
                                          <strong>{f.label}:</strong> {f.value}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Forme juridique / sous-catégorie */}
                                  {(ent.forme_juridique||ent.sous_categorie) && (
                                    <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"6px" }}>
                                      {ent.forme_juridique && (
                                        <span style={{ fontSize:"10px", background:"rgba(0,144,76,0.06)",
                                          color:"#00904C", borderRadius:"4px", padding:"2px 8px" }}>
                                          {ent.forme_juridique}
                                        </span>
                                      )}
                                      {ent.sous_categorie && (
                                        <span style={{ fontSize:"10px", background:"rgba(30,96,204,0.06)",
                                          color:"#1E60CC", borderRadius:"4px", padding:"2px 8px" }}>
                                          {ent.sous_categorie}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Adresse — seulement si disponible */}
                                  {(ent.adresse_siege||ent.adresse) && (
                                    <div style={{ fontSize:"11px", color:"#6B9A7A", marginBottom:"6px" }}>
                                      📍 {ent.adresse_siege||ent.adresse}
                                      {ent.boite_postale && ` — BP ${ent.boite_postale}`}
                                    </div>
                                  )}

                                  {/* Contacts — seulement si disponibles */}
                                  {[ent.email, ent.telephone_fixe, ent.telephone_mobile, ent.fax, ent.contact_ass, ent.site_web].some(Boolean) && (
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"6px" }}>
                                      {ent.email           && <span style={{ fontSize:"11px", color:"#6B9A7A" }}> {ent.email}</span>}
                                      {ent.telephone_fixe  && <span style={{ fontSize:"11px", color:"#6B9A7A" }}> {ent.telephone_fixe}</span>}
                                      {ent.telephone_mobile && <span style={{ fontSize:"11px", color:"#6B9A7A" }}> {ent.telephone_mobile}</span>}
                                      {ent.fax             && <span style={{ fontSize:"11px", color:"#6B9A7A" }}> {ent.fax}</span>}
                                      {ent.contact_ass     && <span style={{ fontSize:"11px", color:"#6B9A7A" }}> {ent.contact_ass}</span>}
                                      {ent.site_web        && (
                                        <a href={ent.site_web.startsWith("http")?ent.site_web:`https://${ent.site_web}`}
                                          target="_blank" rel="noopener noreferrer"
                                          style={{ fontSize:"11px", color:"#00904C" }}>
                                           {ent.site_web}
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {/* Données financières — seulement si disponibles */}
                                  {[ent.capital, ent.effectif_permanent, ent.effectif_membres, ent.chiffre_affaires].some(Boolean) && (
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"6px" }}>
                                      {ent.capital && Number(ent.capital) > 0 && (
                                        <span style={{ fontSize:"10px", color:"#6B9A7A" }}> {Number(ent.capital).toLocaleString("fr-FR")} FCFA</span>
                                      )}
                                      {ent.effectif_permanent && (
                                        <span style={{ fontSize:"10px", color:"#6B9A7A" }}> {ent.effectif_permanent} employés</span>
                                      )}
                                      {ent.effectif_membres && (
                                        <span style={{ fontSize:"10px", color:"#6B9A7A" }}> {String(ent.effectif_membres).trim()} membres</span>
                                      )}
                                      {ent.chiffre_affaires && Number(ent.chiffre_affaires) > 0 && (
                                        <span style={{ fontSize:"10px", color:"#6B9A7A" }}> CA: {Number(ent.chiffre_affaires).toLocaleString("fr-FR")} FCFA</span>
                                      )}
                                    </div>
                                  )}

                                  {/* Activité / Objectif — seulement si disponible */}
                                  {(ent.activite||ent.objectif) && (
                                    <div style={{ fontSize:"11px", color:"#6B9A7A", borderTop:"1px solid rgba(0,144,76,0.06)", paddingTop:"6px" }}>
                                      {ent.activite && <><strong style={{ color:"#0A2410" }}>Activité : </strong>{ent.activite}</>}
                                      {ent.objectif && <><strong style={{ color:"#0A2410" }}>Objectif : </strong>{ent.objectif}</>}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div style={{ background:"#FFF8E6", border:"1px solid #F0D58C",
                          borderRadius:"12px", padding:"16px", fontSize:"13px", color:"#92700A" }}>
                           Aucun résultat trouvé pour ces critères. Le montant a été débité.
                        </div>
                      )}
                    </div>
                  )}

                  {erreur && (
                    <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                      borderRadius:"10px", padding:"12px 16px", marginBottom:"16px",
                      color:"#CC3333", fontSize:"13px" }}> {erreur}</div>
                  )}

                  <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                    <button className="btn-save" style={{ padding:"13px 28px" }} onClick={reset}>
                      + Nouvelle demande
                    </button>
                    <button className="btn-cancel" style={{ padding:"13px 28px" }}
                      onClick={()=>setOnglet("historique")}>
                      Voir mes demandes
                    </button>
                  </div>
                </div>

              ) : (
                /* FORMULAIRE EN ÉTAPES */
                <div style={{ background:"#fff", borderRadius:"16px",
                  border:"1px solid var(--border)", overflow:"hidden" }}>

                  {/* Barre étapes */}
                  <div style={{ background:"var(--green-deep)", padding:"16px 32px",
                    display:"flex", alignItems:"center" }}>
                    {[{n:1,label:"Type de requête"},{n:2,label:"Critères"},{n:3,label:"Vérification"}].map((s,i)=>(
                      <div key={s.n} style={{ display:"flex", alignItems:"center", flex:i<2?1:"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"28px", height:"28px", borderRadius:"50%",
                            background:etape>s.n?"var(--green-light)":etape===s.n?"rgba(77,201,122,0.3)":"rgba(255,255,255,0.1)",
                            border:etape===s.n?"2px solid var(--green-light)":"2px solid transparent",
                            color:etape>=s.n?"#fff":"rgba(255,255,255,0.3)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"12px", fontWeight:800, flexShrink:0 }}>
                            {etape>s.n?"✓":s.n}
                          </div>
                          <span style={{ fontSize:"12px", fontWeight:600,
                            color:etape>=s.n?"#fff":"rgba(255,255,255,0.35)" }}>{s.label}</span>
                        </div>
                        {i<2 && <div style={{ flex:1, height:"2px", background:"rgba(255,255,255,0.12)", margin:"0 12px" }}/>}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:"32px" }}>

                    {/* ── ÉTAPE 1 : Type ── */}
                    {etape===1 && (
                      <>
                        <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", marginBottom:"6px" }}>
                          Quel type de données souhaitez-vous ?
                        </h3>
                        <p style={{ color:"var(--text-muted)", fontSize:"13px", marginBottom:"20px" }}>
                          <strong>Liste, Tableaux, Statistiques</strong> → résultats immédiats avec déduction du solde.<br/>
                          <strong>Fiche, Répertoire Thématique</strong> → vous serez redirigé vers la messagerie avec un message prédéfini.
                        </p>

                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }}>
                          {TYPES_REQUETES.map(t=>(
                            <button key={t.id}
                              onClick={()=>{ setForm(f=>({...f,typeRequete:t.id,sousType:[],quantite:"",secteur:"",sousCategories:[]})); setSecteurOuvert(null); }}
                              style={{ padding:"18px 20px", borderRadius:"12px", textAlign:"left",
                                border:form.typeRequete===t.id?`2px solid ${t.couleur}`:"1.5px solid var(--border)",
                                background:form.typeRequete===t.id?"var(--green-pale)":"#fff",
                                cursor:"pointer", transition:"all 0.2s", position:"relative" }}>
                              {form.typeRequete===t.id && (
                                <div style={{ position:"absolute", top:"10px", right:"12px",
                                  width:"18px", height:"18px", borderRadius:"50%",
                                  background:t.couleur, color:"#fff", display:"flex",
                                  alignItems:"center", justifyContent:"center",
                                  fontSize:"10px", fontWeight:800 }}>✓</div>
                              )}
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                                <span style={{ fontWeight:800, fontSize:"15px",
                                  color:form.typeRequete===t.id?t.couleur:"var(--text-dark)" }}>
                                  {t.label}
                                </span>
                                {t.prix ? (
                                  <span style={{ marginLeft:"auto", fontSize:"11px", fontWeight:700, color:t.couleur }}>
                                    {t.id==="statistique"
                                      ? `${t.prix.toLocaleString()} FCFA forfait`
                                      : `${t.prix.toLocaleString()} FCFA/${t.unite}`}
                                  </span>
                                ) : (
                                  <span style={{ marginLeft:"auto", fontSize:"11px", fontWeight:700, color:"#1E60CC" }}>
                                    Via messagerie
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize:"12px", color:"var(--text-muted)", lineHeight:1.5, margin:0 }}>
                                {t.description}
                              </p>
                              {!t.direct && (
                                <div style={{ marginTop:"8px", display:"inline-flex", alignItems:"center", gap:"4px",
                                  background:"rgba(30,96,204,0.08)", borderRadius:"100px",
                                  padding:"3px 10px", fontSize:"10px", color:"#1E60CC", fontWeight:600 }}>
                                   Redirigé vers la messagerie
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Sous-types */}
                        {typeObj && typeObj.sousTypes.length > 0 && (
                          <div style={{ marginBottom:"20px" }}>
                            <label className="profil-label" style={{ display:"block", marginBottom:"10px" }}>
                              Objet précis *
                            </label>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                              {typeObj.sousTypes.map(s=>{
                                const estStat = form.typeRequete === "statistique";
                                const selectionne = Array.isArray(form.sousType)
                                  ? form.sousType.includes(s.value)
                                  : form.sousType === s.value;
                                return (
                                  <button key={s.value}
                                    onClick={()=>{
                                      if (estStat) {
                                        setForm(f => ({
                                          ...f,
                                          sousType: Array.isArray(f.sousType)
                                            ? (f.sousType.includes(s.value)
                                                ? f.sousType.filter(v => v !== s.value)
                                                : [...f.sousType, s.value])
                                            : [s.value]
                                        }));
                                      } else {
                                        setForm(f => ({ ...f, sousType: [s.value] }));
                                      }
                                    }}
                                    style={{
                                      padding:"10px 18px",
                                      borderRadius: estStat ? "10px" : "100px",
                                      border:selectionne?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                      background:selectionne?"var(--green-pale)":"#fff",
                                      color:selectionne?"var(--green-dark)":"var(--text-mid)",
                                      fontWeight:selectionne?700:500,
                                      fontSize:"13px", cursor:"pointer",
                                      display:"flex", alignItems:"center", gap:"8px"
                                    }}>
                                    <div style={{
                                      width:"16px", height:"16px", flexShrink:0,
                                      borderRadius: estStat ? "3px" : "50%",
                                      border: selectionne ? "2px solid var(--green-light)" : "2px solid #ccc",
                                      background: selectionne ? "var(--green-light)" : "transparent",
                                      display:"flex", alignItems:"center", justifyContent:"center",
                                      fontSize:"10px", color:"#fff", fontWeight:800
                                    }}>
                                      {selectionne ? "✓" : ""}
                                    </div>
                                    {s.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Quantité pour liste/detail */}
                        {typeObj?.prix && isDirect && form.typeRequete !== "statistique" && (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"20px" }}>
                            <div className="profil-field">
                              <label className="profil-label">Quantité ({typeObj.unite}s) *</label>
                              <input type="number" min="1" className="profil-input"
                                placeholder="ex: 100" value={form.quantite}
                                onChange={e=>setForm(f=>({...f,quantite:e.target.value}))}/>
                            </div>
                            {montant && (
                              <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:"2px" }}>
                                <div style={{ background:"var(--green-pale)",
                                  border:"1px solid rgba(34,160,82,0.2)",
                                  borderRadius:"12px", padding:"12px 18px", width:"100%" }}>
                                  <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                    textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>
                                    Montant à débiter
                                  </div>
                                  <div style={{ fontSize:"20px", fontWeight:800, color:"var(--green-dark)" }}>
                                    {formaterMontant(montant)}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Forfait statistique */}
                        {form.typeRequete === "statistique" && (
                          <div style={{ background:"var(--green-pale)",
                            border:"1px solid rgba(34,160,82,0.2)",
                            borderRadius:"12px", padding:"16px 20px", marginBottom:"20px",
                            display:"flex", alignItems:"center", gap:"16px" }}>
                            <span style={{ fontSize:"24px" }}></span>
                            <div>
                              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                textTransform:"uppercase", marginBottom:"4px" }}>Tarif forfaitaire</div>
                              <div style={{ fontSize:"22px", fontWeight:900, color:"var(--green-dark)" }}>
                                5 000 FCFA
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Info redirection chat */}
                        {typeObj && !isDirect && (
                          <div style={{ marginBottom:"20px", background:"rgba(30,96,204,0.06)",
                            border:"1px solid rgba(30,96,204,0.18)", borderRadius:"12px",
                            padding:"16px 20px", display:"flex", gap:"14px", alignItems:"flex-start" }}>
                            <span style={{ fontSize:"28px" }}></span>
                            <div>
                              <div style={{ fontWeight:700, fontSize:"13px", color:"#1E60CC", marginBottom:"4px" }}>
                                Redirection vers la messagerie
                              </div>
                              <div style={{ fontSize:"12px", color:"#6B9A7A", lineHeight:1.6 }}>
                                Un message prédéfini avec vos coordonnées sera automatiquement placé dans la barre de saisie du chat.
                                Vous pourrez le modifier ou l'envoyer directement à un agent CCI-BF.
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Précisions pour fiche/répertoire */}
                        {typeObj && !isDirect && (
                          <div className="profil-field" style={{ marginBottom:"20px" }}>
                            <label className="profil-label">
                              Précisions à inclure dans le message{" "}
                              <span style={{ fontWeight:400, opacity:0.5 }}>(facultatif)</span>
                            </label>
                            <textarea className="profil-input" rows={3}
                              placeholder="Ex: Nom de l'entreprise, secteur d'activité recherché..."
                              value={form.description}
                              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                              style={{ resize:"vertical" }}/>
                          </div>
                        )}

                        <button className="btn-save" style={{ padding:"12px 28px" }}
                          disabled={
                            loading ||
                            !form.typeRequete ||
                            (typeObj?.sousTypes.length > 0 && form.sousType.length === 0)
                          }
                          onClick={async () => {
                            if (isChat) {
                              await redirecterVersChat();
                            } else {
                              setEtape(2);
                            }
                          }}>
                          {loading && isChat ? " Traitement..." : isChat ? " Ouvrir la messagerie →" : "Continuer "}
                        </button>
                      </>
                    )}

                    {/* ── ÉTAPE 2 : Critères ── */}
                    {etape===2 && (
                      <>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"center", marginBottom:"20px" }}>
                          <div>
                            <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", margin:0 }}>
                              Critères de sélection
                            </h3>
                            <p style={{ color:"var(--text-muted)", fontSize:"13px", margin:"6px 0 0" }}>
                              Sélection multiple autorisée.
                            </p>
                          </div>
                          {nbCriteres > 0 && (
                            <span style={{ background:"var(--green-pale)", color:"var(--green-dark)",
                              border:"1px solid rgba(34,160,82,0.2)", borderRadius:"100px",
                              padding:"4px 12px", fontSize:"12px", fontWeight:700 }}>
                              {nbCriteres} critère{nbCriteres>1?"s":""}
                            </span>
                          )}
                        </div>

                        <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                          {/* ── Secteur & Sous-secteur d'activité ── */}
                          {(form.typeRequete === "liste" ||
                            (form.typeRequete === "statistique" && (estStatDouane || form.sousType.includes("stat_entreprises")))) && (
                            <div style={{ background:"var(--off-white)", borderRadius:"12px",
                              border:"1px solid var(--border)", padding:"20px" }}>
                              <div style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)", marginBottom:"14px" }}>
                                 Secteur d'activité
                                <span style={{ fontSize:"11px", color:"var(--text-muted)", fontWeight:400, marginLeft:"8px" }}>
                                  (sélection multiple de sous-catégories)
                                </span>
                              </div>
                              {(form.typeRequete === "statistique"
                                ? SECTEURS_DOUANE.filter(s =>
                                    !form.sousType.some(st => ["stat_importations","stat_exportations"].includes(st)) || s.code !== "S"
                                  )
                                : SECTEURS
                              ).map(secteur => (
                                <div key={secteur.code} style={{ marginBottom:"10px" }}>
                                  {/* Bouton secteur principal */}
                                  <button onClick={() => setSecteurOuvert(o => o===secteur.code ? null : secteur.code)}
                                    style={{ width:"100%", padding:"10px 14px", borderRadius:"8px",
                                      border: form.sousCategories.some(sc => sc.startsWith(secteur.code))
                                        ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                      background: form.sousCategories.some(sc => sc.startsWith(secteur.code))
                                        ? "var(--green-pale)" : "#fff",
                                      cursor:"pointer", display:"flex", justifyContent:"space-between",
                                      alignItems:"center", fontWeight:600, fontSize:"13px",
                                      color: form.sousCategories.some(sc => sc.startsWith(secteur.code))
                                        ? "var(--green-dark)" : "var(--text-dark)" }}>
                                    <span>{secteur.label}</span>
                                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                                      {form.sousCategories.filter(sc => sc.startsWith(secteur.code)).length > 0 && (
                                        <span style={{ background:"var(--green-light)", color:"#fff",
                                          borderRadius:"100px", padding:"1px 8px", fontSize:"10px", fontWeight:700 }}>
                                          {form.sousCategories.filter(sc => sc.startsWith(secteur.code)).length}
                                        </span>
                                      )}
                                      <span style={{ fontSize:"10px" }}>{secteurOuvert===secteur.code ? "▲" : "▼"}</span>
                                    </div>
                                  </button>
                                  {/* Sous-catégories */}
                                  {secteurOuvert===secteur.code && (
                                    <div style={{ marginTop:"8px", paddingLeft:"12px",
                                      display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                      {secteur.sousCategories.map(sc => {
                                        const sel = form.sousCategories.includes(sc.code);
                                        return (
                                          <button key={sc.code}
                                            onClick={() => setForm(f => ({
                                              ...f,
                                              sousCategories: sel
                                                ? f.sousCategories.filter(c => c !== sc.code)
                                                : [...f.sousCategories, sc.code]
                                            }))}
                                            style={{ padding:"6px 12px", borderRadius:"100px", fontSize:"11px",
                                              border: sel ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                              background: sel ? "var(--green-pale)" : "#fff",
                                              color: sel ? "var(--green-dark)" : "var(--text-mid)",
                                              fontWeight: sel ? 700 : 500, cursor:"pointer",
                                              display:"flex", alignItems:"center", gap:"5px" }}>
                                            <div style={{
                                              width:"12px", height:"12px", borderRadius:"2px", flexShrink:0,
                                              border: sel ? "2px solid var(--green-light)" : "2px solid #ccc",
                                              background: sel ? "var(--green-light)" : "transparent",
                                              display:"flex", alignItems:"center", justifyContent:"center",
                                              fontSize:"8px", color:"#fff", fontWeight:800
                                            }}>{sel?"✓":""}</div>
                                            {sc.label}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <SectionCritere titre="Région" sous="(sélection multiple)">
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                              {REGIONS.map(r=>(
                                <button key={r} onClick={()=>toggleArr("regions",r)}
                                  style={{ padding:"6px 14px", borderRadius:"100px", fontSize:"12px",
                                    border:form.regions.includes(r)?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                    background:form.regions.includes(r)?"var(--green-pale)":"#fff",
                                    color:form.regions.includes(r)?"var(--green-dark)":"var(--text-mid)",
                                    fontWeight:form.regions.includes(r)?700:500, cursor:"pointer" }}>
                                  {form.regions.includes(r)?"✓ ":""}{r}
                                </button>
                              ))}
                            </div>
                          </SectionCritere>

                         

                          {!estStatAssociation && !estStatDouane && <SectionCritere titre="Forme juridique" sous="(sélection multiple)">
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                              {FORMES_JURIDIQUES.map(fj=>(
                                <button key={fj.value} onClick={()=>toggleArr("formesJuridiques", fj.value)}
                                  style={{ padding:"7px 14px", borderRadius:"100px", fontSize:"12px",
                                    border:form.formesJuridiques.includes(fj.value)?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                    background:form.formesJuridiques.includes(fj.value)?"var(--green-pale)":"#fff",
                                    color:form.formesJuridiques.includes(fj.value)?"var(--green-dark)":"var(--text-mid)",
                                    fontWeight:form.formesJuridiques.includes(fj.value)?700:500, cursor:"pointer",
                                    display:"flex", alignItems:"center", gap:"6px" }}>
                                  <span style={{
                                    width:"14px", height:"14px", borderRadius:"3px", flexShrink:0,
                                    border:form.formesJuridiques.includes(fj.value)?"2px solid var(--green-light)":"2px solid #ccc",
                                    background:form.formesJuridiques.includes(fj.value)?"var(--green-light)":"transparent",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontSize:"9px", color:"#fff", fontWeight:800
                                  }}>{form.formesJuridiques.includes(fj.value)?"✓":""}</span>
                                  {fj.label}
                                  <span style={{ fontSize:"10px", color:"#aaa" }}>
                                    ({fj.nb?.toLocaleString("fr-FR")})
                                  </span>
                                </button>
                              ))}
                            </div>
                          </SectionCritere>}

                          {!estStatAssociation && !estStatDouane && <SectionCritere titre="Tranche d'effectif">
                            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                              {TRANCHES_EFFECTIF.map(t=>(
                                <button key={t.value} onClick={()=>toggleArr("tranches",t.value)}
                                  style={{ padding:"11px 16px", borderRadius:"10px", textAlign:"left",
                                    border:form.tranches.includes(t.value)?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                    background:form.tranches.includes(t.value)?"var(--green-pale)":"#fff",
                                    color:form.tranches.includes(t.value)?"var(--green-dark)":"var(--text-mid)",
                                    fontWeight:form.tranches.includes(t.value)?700:500,
                                    fontSize:"13px", cursor:"pointer",
                                    display:"flex", alignItems:"center", gap:"10px" }}>
                                  <div style={{ width:"18px", height:"18px", borderRadius:"50%", flexShrink:0,
                                    border:form.tranches.includes(t.value)?"2px solid var(--green-light)":"2px solid var(--border)",
                                    background:form.tranches.includes(t.value)?"var(--green-light)":"transparent",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontSize:"10px", color:"#fff" }}>
                                    {form.tranches.includes(t.value)?"✓":""}
                                  </div>
                                  {t.label}
                                </button>
                              ))}
                            </div>
                          </SectionCritere>}

                          {/* Période statistique */}
                          {form.typeRequete==="statistique" && (
                            <div style={{
                              background:"rgba(232,85,85,0.04)",
                              borderRadius:"12px",
                              border:"2px solid #E85555",
                              padding:"20px",
                              boxShadow:"0 0 0 4px rgba(232,85,85,0.08)"
                            }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
                                <span style={{ fontSize:"18px" }}></span>
                                <span style={{ fontWeight:800, fontSize:"14px", color:"#E85555" }}> Période</span>
                                <span style={{ fontSize:"11px", color:"#E85555", fontWeight:600,
                                  background:"rgba(232,85,85,0.1)", borderRadius:"100px",
                                  padding:"2px 10px" }}>
                                  obligatoire
                                </span>
                                <span style={{ fontSize:"11px", color:"#E85555", marginLeft:"auto" }}>
                                   Sans période, les résultats peuvent être incomplets
                                </span>
                              </div>
                              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"16px" }}>
                                {[
                                  { val:"annee_courante",   label:"Année en cours"    },
                                  { val:"annee_specifique", label:"Année spécifique"  },
                                  { val:"intervalle",       label:"Intervalle"         },
                                ].map(opt=>(
                                  <button key={opt.val} onClick={()=>setPeriodeType(opt.val)}
                                    style={{ padding:"9px 18px", borderRadius:"100px", fontSize:"13px",
                                      border:periodeType===opt.val?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                      background:periodeType===opt.val?"var(--green-pale)":"#fff",
                                      color:periodeType===opt.val?"var(--green-dark)":"var(--text-mid)",
                                      fontWeight:periodeType===opt.val?700:500, cursor:"pointer" }}>
                                    {periodeType===opt.val?"✓ ":""}{opt.label}
                                  </button>
                                ))}
                              </div>
                              {periodeType==="annee_courante" && (
                                <div style={{ background:"var(--green-pale)", borderRadius:"10px",
                                  padding:"12px 16px", fontSize:"14px", color:"var(--green-dark)", fontWeight:600 }}>
                                  ✓ Année {ANNEE_COURANTE}
                                </div>
                              )}
                              {periodeType==="annee_specifique" && (
                                <input type="number" min="2000" max={ANNEE_COURANTE}
                                  className="profil-input" value={anneeSpecifique}
                                  onChange={e=>setAnneeSpecifique(e.target.value)}
                                  style={{ maxWidth:"200px" }}/>
                              )}
                              {periodeType==="intervalle" && (
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                                  <div className="profil-field">
                                    <label className="profil-label">Début</label>
                                    <input type="number" min="2000" max={ANNEE_COURANTE}
                                      className="profil-input" value={anneeDebut}
                                      onChange={e=>setAnneeDebut(e.target.value)}/>
                                  </div>
                                  <div className="profil-field">
                                    <label className="profil-label">Fin</label>
                                    <input type="number" min="2000" max={ANNEE_COURANTE}
                                      className="profil-input" value={anneeFin}
                                      onChange={e=>setAnneeFin(e.target.value)}/>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="profil-field">
                            <label className="profil-label">Description complémentaire</label>
                            <textarea className="profil-input" rows={3}
                              placeholder="Précisez vos besoins spécifiques..."
                              value={form.description}
                              onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                              style={{ resize:"vertical" }}/>
                          </div>

                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                            <div className="profil-field">
                              <label className="profil-label">Email de contact *</label>
                              <input type="email" className="profil-input" value={form.contact}
                                onChange={e=>setForm(f=>({...f,contact:e.target.value}))}/>
                            </div>
                            <div className="profil-field">
                              <label className="profil-label">Téléphone</label>
                              <input type="tel" className="profil-input" placeholder="+226 XX XX XX XX"
                                value={form.telephone}
                                onChange={e=>setForm(f=>({...f,telephone:e.target.value}))}/>
                            </div>
                          </div>
                        </div>

                        <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
                          <button className="btn-cancel" onClick={()=>setEtape(1)}> Retour</button>
                          <button className="btn-save" style={{ padding:"12px 28px" }}
                            disabled={!form.contact} onClick={()=>setEtape(3)}>
                            Vérifier ma demande 
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── ÉTAPE 3 : Vérification ── */}
                    {etape===3 && (
                      <>
                        <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", marginBottom:"20px" }}>
                          Vérification avant soumission
                        </h3>

                        <div style={{ background:"var(--off-white)", borderRadius:"14px",
                          border:"1px solid var(--border)", padding:"20px", marginBottom:"16px" }}>

                          <div style={{ display:"flex", justifyContent:"space-between",
                            alignItems:"flex-start", paddingBottom:"16px",
                            borderBottom:"1px solid var(--border)", marginBottom:"16px" }}>
                            <div>
                              <div style={{ fontWeight:800, fontSize:"17px", color:"var(--text-dark)" }}>
                                {typeObj?.label}
                              </div>
                              <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"3px" }}>
                                {Array.isArray(form.sousType)
                                  ? form.sousType.map(st => typeObj?.sousTypes.find(s=>s.value===st)?.label).filter(Boolean).join(" + ")
                                  : typeObj?.sousTypes.find(s=>s.value===form.sousType)?.label || typeObj?.description}
                              </div>
                              {form.quantite && isDirect && form.typeRequete!=="statistique" && (
                                <div style={{ fontSize:"13px", color:"var(--green-bright)", fontWeight:600, marginTop:"4px" }}>
                                  {form.quantite} {typeObj?.unite}(s)
                                </div>
                              )}
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:"11px", color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em" }}>
                                {form.typeRequete==="statistique"?"Forfait":"Montant à débiter"}
                              </div>
                              <div style={{ fontSize:"26px", fontWeight:900, color:"var(--green-dark)" }}>
                                {form.typeRequete==="statistique" ? "5 000 FCFA" : montant ? formaterMontant(montant) : "—"}
                              </div>
                              <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"2px" }}>
                                sera débité de votre compte
                              </div>
                            </div>
                          </div>

                          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                            {form.regions.length>0 && (
                              <div>
                                <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                                  Régions
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                  {form.regions.map(r=><Chip key={r} label={r}/>)}
                                </div>
                              </div>
                            )}
                            {form.formesJuridiques.length>0 && (
                              <div>
                                <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                                  Formes juridiques
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                  {form.formesJuridiques.map(v=>{
                                    const fj = FORMES_JURIDIQUES.find(f=>f.value===v);
                                    return <Chip key={v} label={fj?.label||v}/>;
                                  })}
                                </div>
                              </div>
                            )}
                            {form.tranches.length>0 && (
                              <div>
                                <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                                  Effectif
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                  {form.tranches.map(t=>(
                                    <Chip key={t} label={TRANCHES_EFFECTIF.find(x=>x.value===t)?.label}/>
                                  ))}
                                </div>
                              </div>
                            )}
                            {form.villes && (
                              <div>
                                <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                                  Ville
                                </div>
                                <Chip label={form.villes}/>
                              </div>
                            )}
                            {form.sousCategories.length > 0 && (
                              <div>
                                <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                                  Secteurs d'activité
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                  {form.sousCategories.map(code => {
                                    const sc = SECTEURS.flatMap(s=>s.sousCategories).find(s=>s.code===code);
                                    return <Chip key={code} label={sc?.label||code}/>;
                                  })}
                                </div>
                              </div>
                            )}
                            {form.typeRequete==="statistique" && (
                              <div>
                                <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                                  Période
                                </div>
                                <span style={{ background:"rgba(0,144,76,0.12)", color:"#00904C",
                                  borderRadius:"100px", padding:"4px 14px", fontSize:"12px", fontWeight:700 }}>
                                   {getPeriodeLabel()}
                                </span>
                              </div>
                            )}
                            {nbCriteres===0 && form.typeRequete!=="statistique" && (
                              <p style={{ fontSize:"13px", color:"var(--text-muted)", fontStyle:"italic", margin:0 }}>
                                Aucun critère spécifique — toutes les données disponibles seront incluses.
                              </p>
                            )}
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"8px" }}>
                              <div style={{ background:"#F7FAF8", borderRadius:"8px", padding:"10px 14px" }}>
                                <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A",
                                  textTransform:"uppercase", marginBottom:"3px" }}>Contact</div>
                                <div style={{ fontSize:"13px", fontWeight:600, color:"#0A2410" }}>{form.contact}</div>
                              </div>
                              {form.telephone && (
                                <div style={{ background:"#F7FAF8", borderRadius:"8px", padding:"10px 14px" }}>
                                  <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A",
                                    textTransform:"uppercase", marginBottom:"3px" }}>Téléphone</div>
                                  <div style={{ fontSize:"13px", fontWeight:600, color:"#0A2410" }}>{form.telephone}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ borderRadius:"10px", padding:"14px 18px", marginBottom:"20px",
                          fontSize:"13px", background:"var(--green-pale)",
                          border:"1px solid rgba(34,160,82,0.2)",
                          color:"var(--text-mid)", lineHeight:1.6 }}>
                          En cliquant sur <strong>"Obtenir les résultats"</strong>, le montant sera
                          immédiatement débité de votre solde et les données s'afficheront sur cette page.
                        </div>

                        {erreur && (
                          <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                            borderRadius:"10px", padding:"12px 16px", marginBottom:"16px",
                            color:"#CC3333", fontSize:"13px" }}> {erreur}</div>
                        )}

                        <div style={{ display:"flex", gap:"10px" }}>
                          <button className="btn-cancel" onClick={()=>setEtape(2)}>← Modifier</button>
                          <button className="btn-save" style={{ padding:"12px 32px" }}
                            disabled={loading} onClick={soumettre}>
                            {loading ? " Traitement..." : " Obtenir les résultats"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ MES DEMANDES ══ */}
          {onglet==="historique" && (
            <div style={{ maxWidth:"820px", margin:"0 auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom:"20px" }}>
                <div>
                  <h2 style={{ fontSize:"22px", fontWeight:800, color:"var(--text-dark)", margin:0 }}>
                    Mes demandes
                  </h2>
                  <p style={{ color:"var(--text-muted)", fontSize:"13px", margin:"4px 0 0" }}>
                    {demandes.length} demande{demandes.length!==1?"s":""}
                  </p>
                </div>
                <button className="btn-save" style={{ fontSize:"12px", padding:"8px 16px" }}
                  onClick={chargerDemandes} disabled={demandesLoading}>
                  {demandesLoading ? "Chargement..." : " Actualiser"}
                </button>
              </div>

              <div style={{ display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" }}>
                {["tous","en_attente","en_cours","traite","rejete"].map(s=>{
                  const sc = STATUT_COLORS[s];
                  return (
                    <button key={s} onClick={()=>setFiltreStatut(s)}
                      style={{ padding:"6px 14px", borderRadius:"100px", fontSize:"12px",
                        border:filtreStatut===s?`2px solid ${sc?.color||"var(--green-light)"}`:"1.5px solid var(--border)",
                        background:filtreStatut===s?(sc?.bg||"var(--green-pale)"):"#fff",
                        color:filtreStatut===s?(sc?.color||"var(--green-dark)"):"var(--text-mid)",
                        fontWeight:filtreStatut===s?700:500, cursor:"pointer" }}>
                      {s==="tous" ? "Toutes" : sc?.label}
                      {s!=="tous" && (
                        <span style={{ marginLeft:"5px", opacity:0.6 }}>
                          ({demandes.filter(d=>d.statut===s).length})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {demandesLoading && (
                <div style={{ textAlign:"center", padding:"40px", color:"var(--text-muted)" }}>⏳ Chargement...</div>
              )}

              {!demandesLoading && demandesErreur && (
                <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                  borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                  {demandesErreur}
                  <br/><button className="btn-save" style={{ marginTop:"10px" }} onClick={chargerDemandes}>
                    Réessayer
                  </button>
                </div>
              )}

              {!demandesLoading && !demandesErreur && demandes.length===0 && (
                <div style={{ background:"#fff", border:"1px solid rgba(0,144,76,0.12)",
                  borderRadius:"16px", padding:"48px", textAlign:"center", color:"var(--text-muted)" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                  <p style={{ marginBottom:"16px" }}>Aucune demande enregistrée.</p>
                  <button className="btn-save" onClick={()=>setOnglet("nouvelle")}>
                    Faire une demande
                  </button>
                </div>
              )}

              {!demandesLoading && !demandesErreur && demandesFiltrees.length>0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {demandesFiltrees.map(d=>{
                    const sc  = STATUT_COLORS[d.statut]||STATUT_COLORS["en_attente"];
                    const typ = TYPES_REQUETES.find(t=>t.id===d.typeRequete);
                    return (
                      <div key={d._id} style={{ background:"#fff", borderRadius:"14px",
                        border:"1px solid var(--border)", padding:"20px 24px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"flex-start", marginBottom:"12px" }}>
                          <div>
                            <div style={{ fontWeight:700, fontSize:"15px", color:"var(--text-dark)" }}>
                              {typ?.label||d.typeRequete}
                            </div>
                            <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>
                              {d.createdAt
                                ? new Date(d.createdAt).toLocaleDateString("fr-FR",
                                    {day:"2-digit",month:"long",year:"numeric"})
                                : "—"}
                              {" · "}Réf. <strong>{d._id?.slice(-6).toUpperCase()}</strong>
                            </div>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
                            <span style={{ background:sc.bg, color:sc.color,
                              border:`1px solid ${sc.color}33`, borderRadius:"100px",
                              padding:"4px 12px", fontSize:"11px", fontWeight:700 }}>
                              {sc.label}
                            </span>
                            {d.montantEstime && (
                              <span style={{ fontSize:"13px", fontWeight:700, color:"var(--green-dark)" }}>
                                {d.montantEstime.toLocaleString("fr-FR")} FCFA
                              </span>
                            )}
                          </div>
                        </div>
                        {actionMessage.id===d._id && actionMessage.texte && (
                          <div style={{ padding:"8px 12px", borderRadius:"8px", fontSize:"12px",
                            marginBottom:"10px",
                            background:actionMessage.type==="succes"?"#E8F5EE":"#FFF0F0",
                            color:actionMessage.type==="succes"?"#1A7A40":"#CC3333" }}>
                            {actionMessage.texte}
                          </div>
                        )}
                        <div style={{ display:"flex", gap:"8px" }}>
                          {d.statut==="en_attente" && (
                            <button onClick={()=>annulerDemande(d._id)}
                              disabled={annulationId===d._id}
                              style={{ padding:"7px 14px", borderRadius:"8px", fontSize:"12px",
                                fontWeight:600, cursor:"pointer", background:"#FFF0F0",
                                color:"#CC3333", border:"1px solid rgba(204,51,51,0.3)",
                                opacity:annulationId===d._id?0.6:1 }}>
                              {annulationId===d._id ? "Annulation..." : "Annuler"}
                            </button>
                          )}
                          {typ && !typ.direct && (
                            <button onClick={()=>navigate("/chat")}
                              style={{ padding:"7px 14px", borderRadius:"8px", fontSize:"12px",
                                fontWeight:600, cursor:"pointer",
                                background:"rgba(30,96,204,0.08)", color:"#1E60CC",
                                border:"1px solid rgba(30,96,204,0.2)" }}>
                               Voir le message
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

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