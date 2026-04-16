import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import logoNERE from "../../assets/nere.jpg";

const TYPES_REQUETES = [
  {
    id: "liste", label: "Liste",
    prix: 250, unite: "adresse",
    description: "Liste d'entreprises ou d'associations professionnelles",
    sousTypes: [
      { value: "liste_entreprises",  label: "Liste d'entreprises" },
      { value: "liste_associations", label: "Liste d'associations professionnelles" },
    ],
    couleur: "#4DC97A",
  },
  {
    id: "detail", label: "Détails",
    prix: null, unite: null,
    description: "Informations détaillées sur entreprises, associations ou flux commerciaux",
    sousTypes: [
      { value: "detail_entreprises",  label: "Détails entreprises" },
      { value: "detail_associations", label: "Détails associations professionnelles" },
    ],
    couleur: "#22A052",
  },
  {
    id: "statistique", label: "Statistiques",
    prix: 5000, unite: "statistique",
    description: "Statistiques sur entreprises, associations, importations et exportations",
    sousTypes: [
      { value: "stat_entreprises",  label: "Statistiques entreprises" },
      { value: "stat_associations", label: "Statistiques associations professionnelles" },
      { value: "stat_importations", label: "Statistiques importations" },
      { value: "stat_exportations", label: "Statistiques exportations" },
    ],
    couleur: "#1A7A40",
  },
  {
    id: "fiche", label: "Fiche",
    prix: 1000, unite: "fiche",
    description: "Fiche complète d'une entreprise ou association professionnelle",
    sousTypes: [
      { value: "fiche_entreprise",  label: "Fiche entreprise" },
      { value: "fiche_association", label: "Fiche association professionnelle" },
    ],
    couleur: "#0F5C2E",
  },
  {
    id: "autre", label: "Répertoire Thematique",
    prix: null, unite: null,
    description: "Pour la demande la reception un agent vous recontactera",
    sousTypes: [],
    couleur: "#D4A830",
  },
];

const REGIONS = [
  "Centre","Hauts-Bassins","Est","Nord","Boucle du Mouhoun",
  "Sahel","Sud-Ouest","Centre-Nord","Centre-Est","Centre-Ouest",
  "Plateau-Central","Centre-Sud","Cascades",
];

const ACTIVITES = [
  { value: "commerce_gros",            label: "Commerce de gros" },
  { value: "commerce_detail",          label: "Commerce de détail" },
  { value: "industrie_agroalimentaire",label: "Industrie agro-alimentaire" },
  { value: "industrie_textile",        label: "Industrie textile" },
  { value: "industrie_metallurgie",    label: "Industrie métallurgie / métal" },
  { value: "industrie_papier",         label: "Industrie papier / imprimerie" },
  { value: "artisanat",                label: "Artisanat" },
  { value: "agrobusiness_elevage",     label: "Agrobusiness — Élevage" },
  { value: "agrobusiness_agriculture", label: "Agrobusiness — Agriculture" },
  { value: "service_banque",           label: "Services — Banque & Finance" },
  { value: "service_etude",            label: "Services — Bureau d'études" },
  { value: "service_enseignement",     label: "Services — Enseignement" },
  { value: "service_sante",            label: "Services — Santé" },
  { value: "service_transport",        label: "Services — Transport & Logistique" },
];

const FORMES_JURIDIQUES = [
  "SA","SARL","SNC","SCS","GIE","EI","Coopérative","Association","ONG",
];

const TRANCHES_EFFECTIF = [
  { value: "1-9",    label: "1 à 9 employés (Micro-entreprise)" },
  { value: "10-49",  label: "10 à 49 employés (Petite entreprise)" },
  { value: "50-199", label: "50 à 199 employés (Moyenne entreprise)" },
  { value: "200-499",label: "200 à 499 employés (Grande entreprise)" },
  { value: "500+",   label: "500 employés et plus" },
];

const STATUT_COLORS = {
  en_attente: { bg:"rgba(212,168,48,0.1)",  color:"#D4A830", label:"En attente" },
  en_cours:   { bg:"rgba(34,160,82,0.1)",   color:"#22A052", label:"En cours" },
  traite:     { bg:"rgba(26,122,64,0.12)",  color:"#1A7A40", label:"Traité" },
  rejete:     { bg:"rgba(232,85,85,0.1)",   color:"#E85555", label:"Rejeté" },
};

const PACKS_UPGRADE = [
  { id:"pack1", label:"Pack 1", montant:5000  },
  { id:"pack2", label:"Pack 2", montant:10000 },
  { id:"pack3", label:"Pack 3", montant:15000 },
];

const ANNEE_COURANTE = new Date().getFullYear();

function formaterMontant(m) {
  if (!m) return "Sur devis";
  return m.toLocaleString("fr-FR") + " FCFA";
}

/* ── Composants globaux ── */
function Chip({ label }) {
  return (
    <span style={{ background:"var(--green-pale)", color:"var(--green-dark)",
      border:"1px solid rgba(34,160,82,0.2)", borderRadius:"100px",
      padding:"3px 10px", fontSize:"11px", fontWeight:600,
      display:"inline-flex", alignItems:"center" }}>
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

function ModalDetail({ demande, onClose }) {
  if (!demande) return null;
  const typ = TYPES_REQUETES.find(t => t.id === demande.typeRequete);
  const sc  = STATUT_COLORS[demande.statut] || STATUT_COLORS["en_attente"];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.55)", display:"flex",
      alignItems:"center", justifyContent:"center", padding:"20px" }}
      onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"36px",
        maxWidth:"560px", width:"100%", maxHeight:"85vh", overflowY:"auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:"24px" }}>
          <div>
            <div style={{ fontSize:"11px", fontWeight:700, color:"#6B9A7A",
              textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>
              Réf. {demande._id?.slice(-6).toUpperCase() || "—"}
            </div>
            <h3 style={{ fontSize:"22px", color:"#0A3D1F", margin:0, fontWeight:800 }}>
              {typ?.label || demande.typeRequete}
            </h3>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
            <span style={{ background:sc.bg, color:sc.color,
              border:`1px solid ${sc.color}33`, borderRadius:"100px",
              padding:"4px 14px", fontSize:"12px", fontWeight:700 }}>
              {sc.label}
            </span>
            <button onClick={onClose} style={{ background:"none", border:"none",
              cursor:"pointer", fontSize:"20px", color:"#999" }}>✕</button>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"20px" }}>
          {[
            { label:"Date", value: demande.createdAt
              ? new Date(demande.createdAt).toLocaleDateString("fr-FR",
                  { day:"2-digit", month:"long", year:"numeric" }) : "—" },
            { label:"Sous-type", value: typ?.sousTypes?.find(s => s.value === demande.sousType)?.label || "—" },
            { label:"Quantité",  value: demande.typeRequete === "statistique"
              ? "1 statistique — 5 000 FCFA"
              : demande.quantite ? `${demande.quantite} ${typ?.unite||""}(s)` : "—" },
            { label:"Montant estimé", value: formaterMontant(demande.montantEstime) },
            { label:"Contact",   value: demande.contact || "—" },
            { label:"Téléphone", value: demande.telephone || "—" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background:"#F7FAF8", borderRadius:"10px", padding:"12px 14px" }}>
              <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A",
                textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"4px" }}>{label}</div>
              <div style={{ fontSize:"14px", fontWeight:600, color:"#0A3D1F" }}>{value}</div>
            </div>
          ))}
        </div>
        {demande.typeRequete === "statistique" && demande.periode && (
          <div style={{ background:"rgba(0,144,76,0.06)", border:"1px solid rgba(0,144,76,0.15)",
            borderRadius:"10px", padding:"12px 14px", marginBottom:"16px" }}>
            <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A",
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"4px" }}>Période</div>
            <div style={{ fontSize:"14px", fontWeight:600, color:"#00904C" }}>
               {demande.periode.type === "annee_courante"   ? `Année ${ANNEE_COURANTE}` :
                  demande.periode.type === "annee_specifique" ? `Année ${demande.periode.annee}` :
                  `${demande.periode.debut} → ${demande.periode.fin}`}
            </div>
          </div>
        )}
        {demande.description && (
          <div style={{ background:"#F7FAF8", borderRadius:"10px", padding:"14px", marginBottom:"20px" }}>
            <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A",
              textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"6px" }}>Description</div>
            <p style={{ fontSize:"13px", color:"#333", lineHeight:1.6, margin:0 }}>{demande.description}</p>
          </div>
        )}
        <button onClick={onClose} style={{ width:"100%", padding:"12px",
          background:"#00904C", color:"#fff", border:"none", borderRadius:"10px",
          fontWeight:700, fontSize:"14px", cursor:"pointer" }}>Fermer</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════ */
export default function DemandeDocument() {
  const navigate = useNavigate();

  const [solde, setSolde]               = useState(null);
  const [showUpgrade, setShowUpgrade]   = useState(false);
  const [coutRequete, setCoutRequete]   = useState(0);
  const [user, setUser]                 = useState(null);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [onglet, setOnglet]             = useState("nouvelle");
  const [etape, setEtape]               = useState(1);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [demandes, setDemandes]               = useState([]);
  const [demandesLoading, setDemandesLoading] = useState(false);
  const [demandesErreur, setDemandesErreur]   = useState("");
  const [demandeDetail, setDemandeDetail]     = useState(null);
  const [annulationId, setAnnulationId]       = useState(null);
  const [relanceId, setRelanceId]             = useState(null);
  const [actionMessage, setActionMessage]     = useState({ id:null, texte:"", type:"" });
  const [filtreStatut, setFiltreStatut]       = useState("tous");

  /* ── Période statistique ── */
  const [periodeType, setPeriodeType]         = useState("annee_courante");
  const [anneeSpecifique, setAnneeSpecifique] = useState(String(ANNEE_COURANTE));
  const [anneeDebut, setAnneeDebut]           = useState("2020");
  const [anneeFin, setAnneeFin]               = useState(String(ANNEE_COURANTE));

  const [form, setForm] = useState({
    typeRequete:"", sousType:"", quantite:"",
    regions:[], villes:"", activites:[],
    formesJuridiques:[], tranches:[],
    description:"", contact:"", telephone:"",
    confirmationDescription:"",
  });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setForm(f => ({ ...f, contact: parsed.email || "", telephone: parsed.telephone || "" }));
    }
  }, []);

  const chargerDemandes = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setDemandesLoading(true);
    setDemandesErreur("");
    try {
      const res  = await fetch("http://localhost:5000/api/demandes/mes-demandes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setDemandes(data.data || []);
      else setDemandesErreur(data.message || "Impossible de charger vos demandes.");
    } catch {
      setDemandesErreur("Serveur inaccessible. Vérifiez votre connexion.");
    }
    setDemandesLoading(false);
  }, []);

  useEffect(() => {
    if (onglet === "historique") chargerDemandes();
  }, [onglet, chargerDemandes]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const annulerDemande = async (id) => {
    if (!window.confirm("Confirmer l'annulation de cette demande ?")) return;
    setAnnulationId(id);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`http://localhost:5000/api/demandes/${id}/annuler`, {
        method:"PUT", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ id, texte:"Demande annulée avec succès.", type:"succes" });
        chargerDemandes();
      } else {
        setActionMessage({ id, texte:data.message || "Annulation impossible.", type:"erreur" });
      }
    } catch {
      setActionMessage({ id, texte:"Erreur serveur lors de l'annulation.", type:"erreur" });
    }
    setAnnulationId(null);
    setTimeout(() => setActionMessage({ id:null, texte:"", type:"" }), 4000);
  };

  const relancerDemande = async (demande) => {
    setRelanceId(demande._id);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`http://localhost:5000/api/demandes/${demande._id}/relancer`, {
        method:"POST", headers:{ Authorization:`Bearer ${token}`, "Content-Type":"application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ id:demande._id, texte:"Demande relancée. Un agent vous recontactera.", type:"succes" });
        chargerDemandes();
      } else {
        setActionMessage({ id:demande._id, texte:data.message || "Relance impossible.", type:"erreur" });
      }
    } catch {
      setActionMessage({ id:demande._id, texte:"Erreur serveur lors de la relance.", type:"erreur" });
    }
    setRelanceId(null);
    setTimeout(() => setActionMessage({ id:null, texte:"", type:"" }), 4000);
  };

  const toggleArr = (field, val) => setForm(f => ({
    ...f, [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val],
  }));

  /* ── Helpers période ── */
  const getPeriodeLabel = () => {
    if (periodeType === "annee_courante")   return `Année ${ANNEE_COURANTE} (en cours)`;
    if (periodeType === "annee_specifique") return `Année ${anneeSpecifique}`;
    if (periodeType === "intervalle")       return `${anneeDebut} → ${anneeFin}`;
    return "";
  };

  const getPeriodePayload = () => {
    if (form.typeRequete !== "statistique") return null;
    return {
      type:  periodeType,
      annee: periodeType === "annee_specifique" ? anneeSpecifique : null,
      debut: periodeType === "intervalle"       ? anneeDebut      : null,
      fin:   periodeType === "intervalle"       ? anneeFin        : null,
    };
  };

  const periodeValide = () => {
    if (form.typeRequete !== "statistique") return true;
    if (periodeType === "intervalle") return parseInt(anneeDebut) <= parseInt(anneeFin);
    return true;
  };

  const soumettre = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      /* Pour les statistiques : quantité = 1 fixe, montant = 5000 fixe */
      const quantiteEnvoyee = form.typeRequete === "statistique" ? 1 : (form.quantite || 1);

      const deductRes = await fetch("http://localhost:5000/api/abonnements/deduire", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          typeRequete: form.typeRequete,
          quantite:    quantiteEnvoyee,
          description: `Requête ${form.typeRequete} - ${form.sousType}`,
        }),
      });
      const deductData = await deductRes.json();
      if (!deductData.success && deductData.code === "SOLDE_INSUFFISANT") {
        setCoutRequete(deductData.cout);
        setShowUpgrade(true);
        setLoading(false);
        return;
      }
      if (deductData.success) setSolde(s => s ? { ...s, solde:deductData.data.solde } : null);

      await fetch("http://localhost:5000/api/demandes", {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          typeRequete:      form.typeRequete,
          sousType:         form.sousType,
          /* Statistique : quantité 1, montant fixe 5000 */
          quantite:         quantiteEnvoyee,
          montantEstime:    form.typeRequete === "statistique" ? 5000 : montant,
          regions:          form.regions,
          villes:           form.villes,
          activites:        form.activites,
          formesJuridiques: form.formesJuridiques,
          tranches:         form.tranches,
          description:      form.description,
          contact:          form.contact,
          telephone:        form.telephone,
          periode:          getPeriodePayload(),
        }),
      });
      setSuccess(true);
    } catch {
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSuccess(false);
    setEtape(1);
    setPeriodeType("annee_courante");
    setAnneeSpecifique(String(ANNEE_COURANTE));
    setAnneeDebut("2020");
    setAnneeFin(String(ANNEE_COURANTE));
    setForm({
      typeRequete:"", sousType:"", quantite:"", regions:[], villes:"",
      activites:[], formesJuridiques:[], tranches:[],
      description:"", contact:user?.email||"", telephone:user?.telephone||"",
      confirmationDescription:"",
    });
  };

  /* ── Valeurs dérivées ── */
  const initiales  = user ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase() : "";
  const typeObj    = TYPES_REQUETES.find(t => t.id === form.typeRequete);
  /* montant uniquement pour les types non-statistique */
  const montant    = typeObj?.prix && form.quantite && form.typeRequete !== "statistique"
    ? typeObj.prix * parseInt(form.quantite||0) : null;
  const nbCriteres = form.regions.length + form.activites.length + form.formesJuridiques.length + form.tranches.length;
  const demandesFiltrees = filtreStatut === "tous" ? demandes : demandes.filter(d => d.statut === filtreStatut);

  /* ── Garde non connecté ── */
  if (!user) return (
    <>
      <style>{`* { font-family: Arial, Helvetica, sans-serif !important; }`}</style>
      <nav className="dash-navbar" style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <img src={logoNERE} alt="NERE" style={{ height:"60px", width:"auto", borderRadius:"6px" }}/>
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
          <span className="dash-nav-link" onClick={() => navigate("/rechercheacc")}>Recherche</span>
          <span className="dash-nav-link" onClick={() => navigate("/contact")}>Contact</span>
        </div>
        <div style={{ width:"120px" }}/>
      </nav>
      <div style={{ height:"calc(100vh - 70px)", background:"#F5FAF7",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", textAlign:"center" }}>
        <div style={{ fontSize:"48px", marginBottom:"16px" }}></div>
        <h2 style={{ color:"#0A3D1F", marginBottom:"16px" }}>Accès réservé aux abonnés</h2>
        <button onClick={() => navigate("/connexion")} className="btn-save"
          style={{ padding:"12px 28px", fontSize:"15px" }}>
          Se connecter
        </button>
      </div>
    </>
  );

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
              <span style={{ fontSize:"11px", fontWeight:800, color:"#fff",
                letterSpacing:"0.06em", textTransform:"uppercase" }}>Fichier NERE</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.85)" }}>
                Registre national des entreprises<br/>Du Burkina Faso
              </span>
            </div>
          </div>
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={() => navigate("/")}>Accueil</span>
            <span className="dash-nav-link" onClick={() => navigate("/publications")}>Publications</span>
            <span className="dash-nav-link" onClick={() => navigate("/rechercheacc")}>Recherche</span>
            <span className="dash-nav-link active">Demande</span>
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
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div className="pub-page-tag">CCI-BF · Service des données NERE</div>
            {solde && (
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:"12px",
                padding:"8px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.5)",
                  textTransform:"uppercase", letterSpacing:"0.06em" }}>Solde {solde.packLabel}</div>
                <div style={{ fontWeight:800, fontSize:"18px",
                  color: solde.solde < 2000 ? "#FF8080" : solde.solde < 5000 ? "#D4A830" : "#4DC97A" }}>
                  {solde.solde?.toLocaleString()} FCFA
                </div>
              </div>
            )}
          </div>
          <h1 className="pub-page-title" style={{ fontSize:"28px", textAlign:"left" }}>
            Demande de données officielles
          </h1>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginTop:"16px" }}>
            {TYPES_REQUETES.filter(t => t.prix).map(t => (
              <div key={t.id} style={{ background:"rgba(255,255,255,0.07)",
                border:"1px solid rgba(255,255,255,0.12)", borderRadius:"100px",
                padding:"5px 14px", fontSize:"12px", color:"rgba(255,255,255,0.8)",
                display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ fontWeight:700, color:"#4DC97A" }}>{t.label}</span>
                <span>—</span>
                <span>
                  {t.id === "statistique"
                    ? `${t.prix.toLocaleString()} FCFA forfait`
                    : `${t.prix.toLocaleString()} FCFA/${t.unite}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ MODAL UPGRADE ══ */}
        {showUpgrade && (
          <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.6)",
            display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
            <div style={{ background:"#fff", borderRadius:"20px", padding:"36px",
              maxWidth:"440px", width:"100%", textAlign:"center" }}>
              <div style={{ fontSize:"48px", marginBottom:"16px" }}>💳</div>
              <h3 style={{ fontSize:"22px", color:"#0A3D1F", marginBottom:"8px", fontWeight:800 }}>
                Solde insuffisant
              </h3>
              <p style={{ color:"#6B9A7A", fontSize:"14px", lineHeight:1.6, marginBottom:"20px" }}>
                Cette requête coûte{" "}
                <strong style={{ color:"#CC3333" }}>{coutRequete.toLocaleString()} FCFA</strong>.<br/>
                Votre solde actuel est de <strong>{solde?.solde?.toLocaleString() || 0} FCFA</strong>.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"20px" }}>
                {PACKS_UPGRADE.filter(p => p.montant > (solde?.montantInitial || 0)).map(p => (
                  <button key={p.id}
                    onClick={async () => {
                      const token = localStorage.getItem("token");
                      await fetch("http://localhost:5000/api/abonnements/recharger", {
                        method:"POST",
                        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
                        body: JSON.stringify({ nouveauPack:p.id }),
                      });
                      setSolde({ pack:p.id, packLabel:p.label, montantInitial:p.montant, solde:p.montant });
                      setShowUpgrade(false);
                    }}
                    style={{ padding:"12px", borderRadius:"10px", background:"#00904C", color:"#fff",
                      border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer" }}>
                    Passer au {p.label} — {p.montant.toLocaleString()} FCFA
                  </button>
                ))}
              </div>
              <button onClick={() => setShowUpgrade(false)}
                style={{ color:"#6B9A7A", background:"none", border:"none", cursor:"pointer", fontSize:"13px" }}>
                Annuler
              </button>
            </div>
          </div>
        )}

        <ModalDetail demande={demandeDetail} onClose={() => setDemandeDetail(null)} />

        {/* ══ ONGLETS ══ */}
        <div style={{ background:"#fff", borderBottom:"1px solid var(--border)", padding:"0 48px", display:"flex" }}>
          {[
            { key:"nouvelle",   label:"Nouvelle demande" },
            { key:"historique", label:`Mes demandes${demandes.length > 0 ? ` (${demandes.length})` : ""}` },
          ].map(o => (
            <button key={o.key} onClick={() => setOnglet(o.key)} style={{
              padding:"14px 24px", background:"transparent", border:"none",
              borderBottom: onglet===o.key ? "3px solid var(--green-light)" : "3px solid transparent",
              color: onglet===o.key ? "var(--green-dark)" : "var(--text-muted)",
              fontWeight: onglet===o.key ? 700 : 500, fontSize:"14px",
              cursor:"pointer", transition:"all 0.2s" }}>
              {o.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"40px 48px 60px", background:"var(--off-white)" }}>

          {/* ══ NOUVELLE DEMANDE ══ */}
          {onglet === "nouvelle" && (
            <div style={{ maxWidth:"820px", margin:"0 auto" }}>
              {success ? (
                /* ── SUCCÈS ── */
                <div style={{ background:"#fff", borderRadius:"24px",
                  border:"1.5px solid rgba(0,144,76,0.2)", padding:"64px 48px",
                  textAlign:"center", boxShadow:"0 8px 40px rgba(0,144,76,0.1)" }}>
                  <div style={{ width:"80px", height:"80px", borderRadius:"50%",
                    background:"rgba(0,144,76,0.1)", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    fontSize:"40px", margin:"0 auto 24px" }}>✅</div>
                  <h2 style={{ fontSize:"28px", fontWeight:900, color:"#00904C", marginBottom:"14px" }}>
                    Demande enregistrée !
                  </h2>
                  <p style={{ color:"#6B9A7A", lineHeight:1.9, fontSize:"15px",
                    maxWidth:"460px", margin:"0 auto 32px" }}>
                    Votre demande a été transmise à la CCI-BF.<br/>
                    Un agent vous recontactera à{" "}
                    <strong style={{ color:"#00904C" }}>{form.contact}</strong>{" "}
                    sous <strong>3 à 5 jours ouvrables</strong>.
                  </p>

                  {/* Montant */}
                  <div style={{ display:"inline-flex", alignItems:"center",
                    background:"rgba(0,144,76,0.06)", border:"1px solid rgba(0,144,76,0.18)",
                    borderRadius:"16px", padding:"20px 36px", marginBottom:"28px" }}>
                    <div>
                      <div style={{ fontSize:"11px", fontWeight:700, color:"#6B9A7A",
                        textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>
                        Montant
                      </div>
                      <div style={{ fontSize:"30px", fontWeight:900, color:"#00904C" }}>
                        {form.typeRequete === "statistique"
                          ? "5 000 FCFA"
                          : montant ? formaterMontant(montant) : "Sur devis"}
                      </div>
                    </div>
                  </div>

                  {/* Récap type */}
                  <div style={{ background:"#F5FAF7", borderRadius:"12px",
                    border:"1px solid rgba(0,144,76,0.12)", padding:"16px 24px",
                    marginBottom:"36px", display:"inline-flex", flexDirection:"column",
                    alignItems:"center", gap:"6px" }}>
                    <div style={{ fontSize:"12px", color:"#6B9A7A", fontWeight:600,
                      textTransform:"uppercase", letterSpacing:"0.06em" }}>Type de demande</div>
                    <div style={{ fontSize:"16px", fontWeight:800, color:"#0A2410" }}>
                      {typeObj?.label || form.typeRequete}
                    </div>
                    {form.sousType && (
                      <div style={{ fontSize:"13px", color:"#6B9A7A" }}>
                        {typeObj?.sousTypes?.find(s => s.value === form.sousType)?.label}
                      </div>
                    )}
                    {form.typeRequete === "statistique" && (
                      <div style={{ fontSize:"13px", color:"#00904C", fontWeight:600 }}>
                         {getPeriodeLabel()}
                      </div>
                    )}
                  </div>

                  <div style={{ display:"flex", gap:"14px", justifyContent:"center" }}>
                    <button className="btn-save" style={{ padding:"14px 32px", fontSize:"14px" }} onClick={reset}>
                      + Nouvelle demande
                    </button>
                    <button className="btn-cancel" style={{ padding:"14px 32px", fontSize:"14px" }}
                      onClick={() => setOnglet("historique")}>
                      Voir mes demandes
                    </button>
                  </div>
                </div>
              ) : (
                /* ── FORMULAIRE ── */
                <div style={{ background:"#fff", borderRadius:"16px",
                  border:"1px solid var(--border)", overflow:"hidden" }}>

                  {/* Barre étapes */}
                  <div style={{ background:"var(--green-deep)", padding:"18px 32px", display:"flex", alignItems:"center" }}>
                    {[{ n:1, label:"Type de requête" }, { n:2, label:"Critères" }, { n:3, label:"Confirmation" }]
                      .map((s, i) => (
                      <div key={s.n} style={{ display:"flex", alignItems:"center", flex:i<2?1:"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"28px", height:"28px", borderRadius:"50%",
                            background: etape>s.n ? "var(--green-light)" :
                              etape===s.n ? "rgba(77,201,122,0.3)" : "rgba(255,255,255,0.1)",
                            border: etape===s.n ? "2px solid var(--green-light)" : "2px solid transparent",
                            color: etape>=s.n ? "#fff" : "rgba(255,255,255,0.3)",
                            display:"flex", alignItems:"center", justifyContent:"center",
                            fontSize:"12px", fontWeight:800, flexShrink:0 }}>
                            {etape>s.n ? "✓" : s.n}
                          </div>
                          <span style={{ fontSize:"12px", fontWeight:600,
                            color: etape>=s.n ? "#fff" : "rgba(255,255,255,0.35)" }}>{s.label}</span>
                        </div>
                        {i < 2 && <div style={{ flex:1, height:"2px", background:"rgba(255,255,255,0.12)", margin:"0 12px" }}/>}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:"32px" }}>

                    {/* ═══ ÉTAPE 1 ═══ */}
                    {etape === 1 && (<>
                      <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", marginBottom:"8px" }}>
                        Quel type de données souhaitez-vous ?
                      </h3>
                      <p style={{ color:"var(--text-muted)", fontSize:"13px", marginBottom:"24px" }}>
                        Sélectionnez le type de requête selon vos besoins.
                      </p>

                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"24px" }}>
                        {TYPES_REQUETES.map(t => (
                          <button key={t.id}
                            onClick={() => setForm(f => ({ ...f, typeRequete:t.id, sousType:"", quantite:"" }))}
                            style={{ padding:"18px 20px", borderRadius:"12px", textAlign:"left",
                              border: form.typeRequete===t.id ? `2px solid ${t.couleur}` : "1.5px solid var(--border)",
                              background: form.typeRequete===t.id ? "var(--green-pale)" : "#fff",
                              cursor:"pointer", transition:"all 0.2s", position:"relative" }}>
                            {form.typeRequete===t.id && (
                              <div style={{ position:"absolute", top:"10px", right:"12px",
                                width:"18px", height:"18px", borderRadius:"50%",
                                background:t.couleur, color:"#fff", display:"flex",
                                alignItems:"center", justifyContent:"center",
                                fontSize:"10px", fontWeight:800 }}>✓</div>
                            )}
                            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                              <span style={{ fontWeight:800, fontSize:"15px",
                                color: form.typeRequete===t.id ? t.couleur : "var(--text-dark)" }}>
                                {t.label}
                              </span>
                              {t.prix && (
                                <span style={{ marginLeft:"auto", fontSize:"12px", fontWeight:700, color:t.couleur }}>
                                  {t.id === "statistique"
                                    ? `${t.prix.toLocaleString()} FCFA forfait`
                                    : `${t.prix.toLocaleString()} FCFA/${t.unite}`}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize:"12px", color:"var(--text-muted)", lineHeight:1.5, margin:0 }}>
                              {t.description}
                            </p>
                          </button>
                        ))}
                      </div>

                      {/* Sous-types */}
                      {typeObj && typeObj.sousTypes.length > 0 && (
                        <div style={{ marginBottom:"20px" }}>
                          <label className="profil-label" style={{ marginBottom:"10px", display:"block" }}>
                            Objet précis de la demande *
                          </label>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                            {typeObj.sousTypes.map(s => (
                              <button key={s.value}
                                onClick={() => setForm(f => ({ ...f, sousType:s.value }))}
                                style={{ padding:"10px 18px", borderRadius:"100px",
                                  border: form.sousType===s.value ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                  background: form.sousType===s.value ? "var(--green-pale)" : "#fff",
                                  color: form.sousType===s.value ? "var(--green-dark)" : "var(--text-mid)",
                                  fontWeight: form.sousType===s.value ? 700 : 500,
                                  fontSize:"13px", cursor:"pointer", transition:"all 0.2s" }}>
                                {form.sousType===s.value ? "✓ " : ""}{s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Statistique : montant forfaitaire fixe affiché */}
                      {form.typeRequete === "statistique" && (
                        <div style={{ background:"var(--green-pale)",
                          border:"1px solid rgba(34,160,82,0.2)", borderRadius:"12px",
                          padding:"16px 20px", marginBottom:"20px",
                          display:"flex", alignItems:"center", gap:"16px" }}>
                          <div style={{ fontSize:"24px" }}></div>
                          <div>
                            <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                              textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>
                              Tarif forfaitaire
                            </div>
                            <div style={{ fontSize:"22px", fontWeight:900, color:"var(--green-dark)" }}>
                              5 000 FCFA
                            </div>
                            <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>
                              Quelle que soit la quantité de données — tarif unique par demande
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quantité — uniquement pour les types NON statistique */}
                      {typeObj?.prix && form.typeRequete !== "statistique" && (
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"20px" }}>
                          <div className="profil-field">
                            <label className="profil-label">Quantité estimée ({typeObj.unite}s) *</label>
                            <input type="number" min="1" className="profil-input"
                              placeholder="ex: 100" value={form.quantite}
                              onChange={e => setForm(f => ({ ...f, quantite:e.target.value }))} />
                          </div>
                          {montant && (
                            <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:"2px" }}>
                              <div style={{ background:"var(--green-pale)",
                                border:"1px solid rgba(34,160,82,0.2)", borderRadius:"12px",
                                padding:"12px 18px", width:"100%" }}>
                                <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                  textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px" }}>
                                  Montant estimé
                                </div>
                                <div style={{ fontSize:"20px", fontWeight:800, color:"var(--green-dark)" }}>
                                  {formaterMontant(montant)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button className="btn-save" style={{ padding:"12px 28px" }}
                        disabled={!form.typeRequete || (typeObj?.sousTypes.length > 0 && !form.sousType)}
                        onClick={() => {
                          if (form.typeRequete === "autre" || form.typeRequete === "fiche") setEtape(1.5);
                          else setEtape(2);
                        }}>
                        Continuer 
                      </button>
                    </>)}

                    {/* ═══ ÉTAPE 1.5 ═══ */}
                    {etape === 1.5 && (<>
                      <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", marginBottom:"8px" }}>
                        Confirmation de votre demande
                      </h3>
                      <p style={{ color:"var(--text-muted)", fontSize:"13px", marginBottom:"24px" }}>
                        Un agent de la CCI-BF vous contactera sous 24-48h pour établir un devis personnalisé.
                      </p>
                      <div style={{ background:"var(--green-pale)", border:"1px solid rgba(34,160,82,0.2)",
                        borderRadius:"12px", padding:"20px", marginBottom:"24px" }}>
                        <h4 style={{ fontSize:"16px", fontWeight:700, color:"var(--green-dark)", marginBottom:"12px" }}>
                          Récapitulatif
                        </h4>
                        <div style={{ display:"flex", flexDirection:"column", gap:"8px", fontSize:"14px" }}>
                          <div><strong>Type :</strong> {typeObj?.label}</div>
                          {form.sousType && (
                            <div><strong>Sous-type :</strong>{" "}
                              {typeObj?.sousTypes?.find(s => s.value === form.sousType)?.label}</div>
                          )}
                        </div>
                      </div>
                      <div className="profil-field" style={{ marginBottom:"24px" }}>
                        <label className="profil-label">Description complémentaire (facultatif)</label>
                        <textarea className="profil-input" rows={4}
                          placeholder="Précisez vos besoins spécifiques..."
                          value={form.confirmationDescription}
                          onChange={e => setForm(f => ({ ...f, confirmationDescription:e.target.value }))}
                          style={{ resize:"vertical" }} />
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"24px" }}>
                        <div className="profil-field">
                          <label className="profil-label">Email *</label>
                          <input type="email" className="profil-input" value={form.contact}
                            onChange={e => setForm(f => ({ ...f, contact:e.target.value }))} />
                        </div>
                        <div className="profil-field">
                          <label className="profil-label">Téléphone</label>
                          <input type="tel" className="profil-input" value={form.telephone}
                            onChange={e => setForm(f => ({ ...f, telephone:e.target.value }))} />
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:"12px", justifyContent:"space-between" }}>
                        <button className="btn-cancel" onClick={() => setEtape(1)}> Retour</button>
                        <button className="btn-save" style={{ padding:"12px 28px" }}
                          disabled={!form.contact.trim() || loading}
                          onClick={async () => {
                            setLoading(true);
                            try {
                              const token = localStorage.getItem("token");
                              const prixSpecial = typeObj?.prix || (form.typeRequete==="autre" ? 5000 : 1000);
                              const deductRes = await fetch("http://localhost:5000/api/abonnements/deduire", {
                                method:"POST",
                                headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
                                body: JSON.stringify({ typeRequete:form.typeRequete, quantite:1,
                                  description:`Demande spéciale ${form.typeRequete}` }),
                              });
                              const deductData = await deductRes.json();
                              if (!deductData.success && deductData.code === "SOLDE_INSUFFISANT") {
                                setCoutRequete(prixSpecial); setShowUpgrade(true);
                                setLoading(false); return;
                              }
                              if (deductData.success) setSolde(s => s ? { ...s, solde:deductData.data.solde } : null);
                              await fetch("http://localhost:5000/api/demandes", {
                                method:"POST",
                                headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
                                body: JSON.stringify({ typeRequete:form.typeRequete, sousType:form.sousType,
                                  quantite:1, description:form.confirmationDescription,
                                  contact:form.contact, telephone:form.telephone, montantEstime:prixSpecial }),
                              });
                              setSuccess(true);
                            } catch { setSuccess(true); }
                            finally { setLoading(false); }
                          }}>
                          {loading ? "Traitement..." : "Envoyer la demande "}
                        </button>
                      </div>
                    </>)}

                    {/* ═══ ÉTAPE 2 ═══ */}
                    {etape === 2 && (<>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px" }}>
                        <div>
                          <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", margin:0 }}>
                            Critères de sélection
                          </h3>
                          <p style={{ color:"var(--text-muted)", fontSize:"13px", margin:"6px 0 0" }}>
                            Choisissez un ou plusieurs critères — sélection multiple autorisée.
                          </p>
                        </div>
                        {nbCriteres > 0 && (
                          <span style={{ background:"var(--green-pale)", color:"var(--green-dark)",
                            border:"1px solid rgba(34,160,82,0.2)", borderRadius:"100px",
                            padding:"4px 12px", fontSize:"12px", fontWeight:700, flexShrink:0 }}>
                            {nbCriteres} critère{nbCriteres>1?"s":""} sélectionné{nbCriteres>1?"s":""}
                          </span>
                        )}
                      </div>

                      <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

                        <SectionCritere titre="Sélection par secteur géographique" sous="(Région, Province, Ville)">
                          <div style={{ marginBottom:"12px" }}>
                            <label className="profil-label" style={{ marginBottom:"8px", display:"block" }}>Régions</label>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                              {REGIONS.map(r => (
                                <button key={r} onClick={() => toggleArr("regions", r)}
                                  style={{ padding:"6px 14px", borderRadius:"100px", fontSize:"12px",
                                    border: form.regions.includes(r) ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                    background: form.regions.includes(r) ? "var(--green-pale)" : "#fff",
                                    color: form.regions.includes(r) ? "var(--green-dark)" : "var(--text-mid)",
                                    fontWeight: form.regions.includes(r) ? 700 : 500,
                                    cursor:"pointer", transition:"all 0.15s" }}>
                                  {form.regions.includes(r) ? "✓ " : ""}{r}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="profil-field">
                            <label className="profil-label">Villes / Provinces spécifiques</label>
                            <input type="text" className="profil-input"
                              placeholder="ex: Ouagadougou, Bobo-Dioulasso..."
                              value={form.villes} onChange={e => setForm(f => ({ ...f, villes:e.target.value }))} />
                          </div>
                        </SectionCritere>

                        <SectionCritere titre="Sélection par activité" sous="(Commerce, Industrie, Services)">
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                            {ACTIVITES.map(a => (
                              <button key={a.value} onClick={() => toggleArr("activites", a.value)}
                                style={{ padding:"9px 14px", borderRadius:"8px", textAlign:"left",
                                  border: form.activites.includes(a.value) ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                  background: form.activites.includes(a.value) ? "var(--green-pale)" : "#fff",
                                  color: form.activites.includes(a.value) ? "var(--green-dark)" : "var(--text-mid)",
                                  fontWeight: form.activites.includes(a.value) ? 700 : 500,
                                  fontSize:"12px", cursor:"pointer", transition:"all 0.15s" }}>
                                {form.activites.includes(a.value) ? "✓ " : ""}{a.label}
                              </button>
                            ))}
                          </div>
                        </SectionCritere>

                        <SectionCritere titre="Sélection par structure" sous="(Forme juridique)">
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                            {FORMES_JURIDIQUES.map(f => (
                              <button key={f} onClick={() => toggleArr("formesJuridiques", f)}
                                style={{ padding:"7px 14px", borderRadius:"100px", fontSize:"12px",
                                  border: form.formesJuridiques.includes(f) ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                  background: form.formesJuridiques.includes(f) ? "var(--green-pale)" : "#fff",
                                  color: form.formesJuridiques.includes(f) ? "var(--green-dark)" : "var(--text-mid)",
                                  fontWeight: form.formesJuridiques.includes(f) ? 700 : 500,
                                  cursor:"pointer", transition:"all 0.15s" }}>
                                {form.formesJuridiques.includes(f) ? "✓ " : ""}{f}
                              </button>
                            ))}
                          </div>
                        </SectionCritere>

                        <SectionCritere titre="Sélection par tranche d'effectif salarié">
                          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                            {TRANCHES_EFFECTIF.map(t => (
                              <button key={t.value} onClick={() => toggleArr("tranches", t.value)}
                                style={{ padding:"11px 16px", borderRadius:"10px", textAlign:"left",
                                  border: form.tranches.includes(t.value) ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                  background: form.tranches.includes(t.value) ? "var(--green-pale)" : "#fff",
                                  color: form.tranches.includes(t.value) ? "var(--green-dark)" : "var(--text-mid)",
                                  fontWeight: form.tranches.includes(t.value) ? 700 : 500,
                                  fontSize:"13px", cursor:"pointer", transition:"all 0.15s",
                                  display:"flex", alignItems:"center", gap:"10px" }}>
                                <div style={{ width:"18px", height:"18px", borderRadius:"50%", flexShrink:0,
                                  border: form.tranches.includes(t.value) ? "2px solid var(--green-light)" : "2px solid var(--border)",
                                  background: form.tranches.includes(t.value) ? "var(--green-light)" : "transparent",
                                  display:"flex", alignItems:"center", justifyContent:"center",
                                  fontSize:"10px", color:"#fff" }}>
                                  {form.tranches.includes(t.value) ? "✓" : ""}
                                </div>
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </SectionCritere>

                        {/* ═══ PÉRIODE STATISTIQUE ═══ */}
                        {form.typeRequete === "statistique" && (
                          <SectionCritere titre=" Période des statistiques" sous="(Obligatoire)">
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px", marginBottom:"20px" }}>
                              {[
                                { val:"annee_courante",   label:"Année en cours" },
                                { val:"annee_specifique", label:"Année spécifique" },
                                { val:"intervalle",       label:"Intervalle d'années" },
                              ].map(opt => (
                                <button key={opt.val} onClick={() => setPeriodeType(opt.val)}
                                  style={{ padding:"10px 20px", borderRadius:"100px", fontSize:"13px",
                                    border: periodeType===opt.val ? "2px solid var(--green-light)" : "1.5px solid var(--border)",
                                    background: periodeType===opt.val ? "var(--green-pale)" : "#fff",
                                    color: periodeType===opt.val ? "var(--green-dark)" : "var(--text-mid)",
                                    fontWeight: periodeType===opt.val ? 700 : 500,
                                    cursor:"pointer", transition:"all 0.2s" }}>
                                  {periodeType===opt.val ? "✓ " : ""}{opt.label}
                                </button>
                              ))}
                            </div>

                            {/* Année en cours */}
                            {periodeType === "annee_courante" && (
                              <div style={{ background:"var(--green-pale)",
                                border:"1px solid rgba(34,160,82,0.2)", borderRadius:"10px",
                                padding:"14px 18px", fontSize:"14px",
                                color:"var(--green-dark)", fontWeight:600 }}>
                                ✓ Statistiques de l'année {ANNEE_COURANTE} (année en cours)
                              </div>
                            )}

                            {/* Année spécifique */}
                            {periodeType === "annee_specifique" && (
                              <div className="profil-field">
                                <label className="profil-label">Année *</label>
                                <input type="number" min="2000" max={ANNEE_COURANTE}
                                  className="profil-input" value={anneeSpecifique}
                                  onChange={e => setAnneeSpecifique(e.target.value)}
                                  placeholder={`ex: ${ANNEE_COURANTE - 1}`}
                                  style={{ maxWidth:"200px" }} />
                                <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"6px" }}>
                                  Entre 2000 et {ANNEE_COURANTE}
                                </div>
                              </div>
                            )}

                            {/* Intervalle */}
                            {periodeType === "intervalle" && (
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
                                <div className="profil-field">
                                  <label className="profil-label">Année de début *</label>
                                  <input type="number" min="2000" max={ANNEE_COURANTE}
                                    className="profil-input" value={anneeDebut}
                                    onChange={e => setAnneeDebut(e.target.value)}
                                    placeholder="ex: 2020" />
                                </div>
                                <div className="profil-field">
                                  <label className="profil-label">Année de fin *</label>
                                  <input type="number" min="2000" max={ANNEE_COURANTE}
                                    className="profil-input" value={anneeFin}
                                    onChange={e => setAnneeFin(e.target.value)}
                                    placeholder={`ex: ${ANNEE_COURANTE}`} />
                                </div>
                                {parseInt(anneeDebut) > parseInt(anneeFin) && (
                                  <div style={{ gridColumn:"1/-1", padding:"10px 14px",
                                    background:"#FFF0F0", border:"1px solid #FFB3B3",
                                    borderRadius:"8px", fontSize:"12px", color:"#CC3333" }}>
                                    ⚠️ L'année de début doit être inférieure ou égale à l'année de fin.
                                  </div>
                                )}
                              </div>
                            )}
                          </SectionCritere>
                        )}

                        <div className="profil-field">
                          <label className="profil-label">Précisions supplémentaires (facultatif)</label>
                          <textarea className="profil-input" rows={3}
                            placeholder="Tout détail utile pour préciser votre demande..."
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description:e.target.value }))}
                            style={{ resize:"vertical" }} />
                        </div>

                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                          <div className="profil-field">
                            <label className="profil-label">Email de contact *</label>
                            <input type="email" className="profil-input" value={form.contact}
                              onChange={e => setForm(f => ({ ...f, contact:e.target.value }))} />
                          </div>
                          <div className="profil-field">
                            <label className="profil-label">Téléphone</label>
                            <input type="tel" className="profil-input"
                              placeholder="+226 XX XX XX XX" value={form.telephone}
                              onChange={e => setForm(f => ({ ...f, telephone:e.target.value }))} />
                          </div>
                        </div>
                      </div>

                      <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
                        <button className="btn-cancel" onClick={() => setEtape(1)}>← Retour</button>
                        <button className="btn-save" style={{ padding:"12px 28px" }}
                          disabled={!form.contact || !periodeValide()}
                          onClick={() => setEtape(3)}>
                          Vérifier ma demande 
                        </button>
                      </div>
                    </>)}

                    {/* ═══ ÉTAPE 3 ═══ */}
                    {etape === 3 && (<>
                      <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", marginBottom:"20px" }}>
                        Récapitulatif de votre demande
                      </h3>
                      <div style={{ background:"var(--off-white)", borderRadius:"12px",
                        border:"1px solid var(--border)", padding:"20px", marginBottom:"16px" }}>

                        {/* En-tête récap */}
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                          paddingBottom:"16px", borderBottom:"1px solid var(--border)", marginBottom:"16px" }}>
                          <div>
                            <div style={{ fontWeight:800, fontSize:"16px", color:"var(--text-dark)" }}>
                              {typeObj?.label}
                            </div>
                            <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>
                              {typeObj?.sousTypes.find(s => s.value === form.sousType)?.label || typeObj?.description}
                            </div>
                            {/* Pas de quantité pour les statistiques */}
                            {form.quantite && form.typeRequete !== "statistique" && (
                              <div style={{ fontSize:"12px", color:"var(--green-bright)", fontWeight:600, marginTop:"2px" }}>
                                {form.quantite} {typeObj?.unite}(s) demandé(s)
                              </div>
                            )}
                          </div>
                          {/* Montant */}
                          {form.typeRequete === "statistique" ? (
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:"11px", color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em" }}>Forfait</div>
                              <div style={{ fontSize:"22px", fontWeight:800, color:"var(--green-dark)" }}>
                                5 000 FCFA
                              </div>
                            </div>
                          ) : montant ? (
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:"11px", color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em" }}>Montant estimé</div>
                              <div style={{ fontSize:"22px", fontWeight:800, color:"var(--green-dark)" }}>
                                {formaterMontant(montant)}
                              </div>
                            </div>
                          ) : (
                            <span style={{ background:"rgba(212,168,48,0.1)", color:"#D4A830",
                              border:"1px solid rgba(212,168,48,0.3)", borderRadius:"100px",
                              padding:"4px 12px", fontSize:"12px", fontWeight:700 }}>Sur devis</span>
                          )}
                        </div>

                        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                          {form.regions.length > 0 && (
                            <div>
                              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>Régions</div>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                {form.regions.map(r => <Chip key={r} label={r}/>)}
                              </div>
                            </div>
                          )}
                          {form.activites.length > 0 && (
                            <div>
                              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>Activités</div>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                {form.activites.map(a => <Chip key={a} label={ACTIVITES.find(x => x.value === a)?.label}/>)}
                              </div>
                            </div>
                          )}
                          {form.formesJuridiques.length > 0 && (
                            <div>
                              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>Formes juridiques</div>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                {form.formesJuridiques.map(f => <Chip key={f} label={f}/>)}
                              </div>
                            </div>
                          )}
                          {form.tranches.length > 0 && (
                            <div>
                              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>Tranches d'effectif</div>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                {form.tranches.map(t => <Chip key={t} label={TRANCHES_EFFECTIF.find(x => x.value === t)?.label}/>)}
                              </div>
                            </div>
                          )}

                          {/* Période statistique dans le récap */}
                          {form.typeRequete === "statistique" && (
                            <div>
                              <div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)",
                                textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"6px" }}>
                                Période
                              </div>
                              <span style={{ background:"rgba(0,144,76,0.12)", color:"#00904C",
                                border:"1px solid rgba(0,144,76,0.25)", borderRadius:"100px",
                                padding:"4px 14px", fontSize:"12px", fontWeight:700 }}>
                                 {getPeriodeLabel()}
                              </span>
                            </div>
                          )}

                          {nbCriteres === 0 && form.typeRequete !== "statistique" && (
                            <p style={{ fontSize:"13px", color:"var(--text-muted)", fontStyle:"italic", margin:0 }}>
                              Aucun critère — toutes les données disponibles seront incluses
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ background:"var(--green-pale)", border:"1px solid rgba(34,160,82,0.2)",
                        borderRadius:"10px", padding:"12px 16px", marginBottom:"20px",
                        fontSize:"13px", color:"var(--text-mid)", lineHeight:1.6 }}>
                        Un agent CCI-BF vous recontactera à <strong>{form.contact}</strong> sous{" "}
                        <strong>3 à 5 jours ouvrables</strong> pour confirmer et organiser le paiement.
                      </div>

                      <div style={{ display:"flex", gap:"10px" }}>
                        <button className="btn-cancel" onClick={() => setEtape(2)}> Modifier</button>
                        <button className="btn-save" style={{ padding:"12px 32px" }}
                          disabled={loading} onClick={soumettre}>
                          {loading ? <><span className="spinner-sm"/>&nbsp;Envoi...</> : "Soumettre la demande"}
                        </button>
                      </div>
                    </>)}

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ MES DEMANDES ══ */}
          {onglet === "historique" && (
            <div style={{ maxWidth:"820px", margin:"0 auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
                <div>
                  <h2 style={{ fontSize:"22px", fontWeight:800, color:"var(--text-dark)", margin:0 }}>Mes demandes</h2>
                  <p style={{ color:"var(--text-muted)", fontSize:"13px", margin:"4px 0 0" }}>
                    {demandes.length} demande{demandes.length!==1?"s":""} enregistrée{demandes.length!==1?"s":""}
                  </p>
                </div>
                <button className="btn-save" style={{ fontSize:"12px", padding:"8px 16px" }}
                  onClick={chargerDemandes} disabled={demandesLoading}>
                  {demandesLoading ? "Chargement..." : "Actualiser"}
                </button>
              </div>

              <div style={{ display:"flex", gap:"8px", marginBottom:"20px", flexWrap:"wrap" }}>
                {["tous","en_attente","en_cours","traite","rejete"].map(s => {
                  const sc = STATUT_COLORS[s];
                  return (
                    <button key={s} onClick={() => setFiltreStatut(s)}
                      style={{ padding:"6px 14px", borderRadius:"100px", fontSize:"12px",
                        border: filtreStatut===s ? `2px solid ${sc?.color||"var(--green-light)"}` : "1.5px solid var(--border)",
                        background: filtreStatut===s ? (sc?.bg||"var(--green-pale)") : "#fff",
                        color: filtreStatut===s ? (sc?.color||"var(--green-dark)") : "var(--text-mid)",
                        fontWeight: filtreStatut===s ? 700 : 500, cursor:"pointer", transition:"all 0.15s" }}>
                      {s === "tous" ? "Toutes" : sc?.label}
                      {s !== "tous" && (
                        <span style={{ marginLeft:"6px", opacity:0.7 }}>
                          ({demandes.filter(d => d.statut === s).length})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {demandesLoading && (
                <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
                  <p style={{ fontSize:"14px" }}>Chargement de vos demandes...</p>
                </div>
              )}
              {!demandesLoading && demandesErreur && (
                <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3",
                  borderRadius:"12px", padding:"20px", textAlign:"center", color:"#CC3333" }}>
                  <p style={{ margin:0, fontSize:"14px" }}>{demandesErreur}</p>
                  <button className="btn-save" style={{ marginTop:"12px", fontSize:"12px" }}
                    onClick={chargerDemandes}>Réessayer</button>
                </div>
              )}
              {!demandesLoading && !demandesErreur && demandes.length === 0 && (
                <div style={{ textAlign:"center", padding:"60px 0", color:"var(--text-muted)" }}>
                  <div style={{ fontSize:"48px", marginBottom:"12px" }}></div>
                  <p style={{ fontSize:"14px", marginBottom:"16px" }}>Aucune demande pour l'instant.</p>
                  <button className="btn-save" onClick={() => setOnglet("nouvelle")}>Faire une demande</button>
                </div>
              )}
              {!demandesLoading && !demandesErreur && demandesFiltrees.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {demandesFiltrees.map(d => {
                    const sc  = STATUT_COLORS[d.statut] || STATUT_COLORS["en_attente"];
                    const typ = TYPES_REQUETES.find(t => t.id === d.typeRequete);
                    const peutAnnuler  = ["en_attente"].includes(d.statut);
                    const peutRelancer = ["traite","rejete"].includes(d.statut);
                    return (
                      <div key={d._id} style={{ background:"#fff", borderRadius:"14px",
                        border:"1px solid var(--border)", padding:"20px 24px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between",
                          alignItems:"flex-start", marginBottom:"14px" }}>
                          <div>
                            <div style={{ fontWeight:700, fontSize:"15px", color:"var(--text-dark)" }}>
                              {typ?.label || d.typeRequete}
                            </div>
                            <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>
                              {d.createdAt ? new Date(d.createdAt).toLocaleDateString("fr-FR",
                                { day:"2-digit", month:"long", year:"numeric" }) : "—"}
                              {" · "}Réf. <strong>{d._id?.slice(-6).toUpperCase()}</strong>
                            </div>
                            {/* Période pour les statistiques */}
                            {d.typeRequete === "statistique" && d.periode && (
                              <div style={{ fontSize:"11px", color:"#00904C", fontWeight:600, marginTop:"4px" }}>
                                {" "}
                                {d.periode.type === "annee_courante"   ? `Année ${ANNEE_COURANTE}` :
                                 d.periode.type === "annee_specifique" ? `Année ${d.periode.annee}` :
                                 `${d.periode.debut} → ${d.periode.fin}`}
                              </div>
                            )}
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px" }}>
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
                        {actionMessage.id === d._id && actionMessage.texte && (
                          <div style={{ padding:"10px 14px", borderRadius:"8px", fontSize:"13px", marginBottom:"12px",
                            background: actionMessage.type==="succes" ? "#E8F5EE" : "#FFF0F0",
                            color: actionMessage.type==="succes" ? "#1A7A40" : "#CC3333",
                            border:`1px solid ${actionMessage.type==="succes"?"#C0D8C8":"#FFB3B3"}` }}>
                            {actionMessage.texte}
                          </div>
                        )}
                        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                          <button onClick={() => setDemandeDetail(d)}
                            style={{ padding:"7px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:600,
                              cursor:"pointer", background:"var(--green-pale)", color:"var(--green-dark)",
                              border:"1px solid rgba(34,160,82,0.3)", transition:"all 0.15s" }}>
                            Voir le détail
                          </button>
                          {peutRelancer && (
                            <button onClick={() => relancerDemande(d)} disabled={relanceId===d._id}
                              style={{ padding:"7px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:600,
                                cursor:"pointer", background:"#EFF6FF", color:"#1E60CC",
                                border:"1px solid rgba(30,96,204,0.3)", opacity:relanceId===d._id?0.6:1 }}>
                              {relanceId===d._id ? "Relance..." : "Relancer"}
                            </button>
                          )}
                          {peutAnnuler && (
                            <button onClick={() => annulerDemande(d._id)} disabled={annulationId===d._id}
                              style={{ padding:"7px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:600,
                                cursor:"pointer", background:"#FFF0F0", color:"#CC3333",
                                border:"1px solid rgba(204,51,51,0.3)", opacity:annulationId===d._id?0.6:1 }}>
                              {annulationId===d._id ? "Annulation..." : "Annuler"}
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