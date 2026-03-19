import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const TYPES_REQUETES = [
  {
    id: "liste", label: "Liste", icon: "📋",
    prix: 250, unite: "adresse",
    description: "Liste d'entreprises ou d'associations professionnelles",
    sousTypes: [
      { value: "liste_entreprises",  label: "Liste d'entreprises" },
      { value: "liste_associations", label: "Liste d'associations professionnelles" },
    ],
    couleur: "#4DC97A",
  },
  {
    id: "detail", label: "Détails", icon: "🔍",
    prix: null, unite: null,
    description: "Informations détaillées sur entreprises, associations ou flux commerciaux",
    sousTypes: [
      { value: "detail_entreprises",  label: "Détails entreprises" },
      { value: "detail_associations", label: "Détails associations professionnelles" },
    ],
    couleur: "#22A052",
  },
  {
    id: "statistique", label: "Statistiques", icon: "📊",
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
    id: "fiche", label: "Fiche", icon: "📄",
    prix: 1000, unite: "fiche",
    description: "Fiche complète d'une entreprise ou association professionnelle",
    sousTypes: [
      { value: "fiche_entreprise",  label: "Fiche entreprise" },
      { value: "fiche_association", label: "Fiche association professionnelle" },
    ],
    couleur: "#0F5C2E",
  },
  {
    id: "autre", label: "Autre", icon: "✉️",
    prix: null, unite: null,
    description: "Toute autre demande spécifique — un agent vous recontactera",
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

const DEMANDES_MOCK = [
  { id:"R001", typeRequete:"liste", sousType:"liste_entreprises", statut:"en_cours",
    date:"05 Mar. 2025", criteres:{ regions:["Centre","Hauts-Bassins"],
    activites:["commerce_gros"], tranches:["50-199"] },
    quantite:120, montantEstime:30000, description:"Liste pour prospection commerciale." },
  { id:"R002", typeRequete:"fiche", sousType:"fiche_entreprise", statut:"traite",
    date:"18 Fév. 2025", criteres:{ regions:["Centre"], activites:[], tranches:[] },
    quantite:1, montantEstime:1000, description:"Fiche complète SOCOGEB SARL." },
];

function formaterMontant(m) {
  if (!m) return "Sur devis";
  return m.toLocaleString("fr-FR") + " FCFA";
}

export default function DemandeDocument() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [onglet, setOnglet]   = useState("nouvelle");
  const [etape, setEtape]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    typeRequete:"", sousType:"", quantite:"",
    regions:[], villes:"", activites:[],
    formesJuridiques:[], tranches:[],
    description:"", contact: user?.email||"", telephone: user?.telephone||"",
  });

  const toggleArr = (field, val) => setForm(f => ({
    ...f,
    [field]: f[field].includes(val) ? f[field].filter(v=>v!==val) : [...f[field], val],
  }));

  const typeObj = TYPES_REQUETES.find(t => t.id === form.typeRequete);
  const montant = typeObj?.prix && form.quantite
    ? typeObj.prix * parseInt(form.quantite || 0) : null;
  const nbCriteres = form.regions.length + form.activites.length +
    form.formesJuridiques.length + form.tranches.length;

  const soumettre = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false); setSuccess(true);
  };

  const reset = () => {
    setSuccess(false); setEtape(1);
    setForm({ typeRequete:"", sousType:"", quantite:"", regions:[], villes:"",
      activites:[], formesJuridiques:[], tranches:[],
      description:"", contact:user?.email||"", telephone:user?.telephone||"" });
  };

  if (!user) return (
    <div style={{minHeight:"100vh",background:"#F5FAF7",display:"flex",alignItems:"center",
      justifyContent:"center",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:"48px",marginBottom:"16px"}}>🔒</div>
        <h2 style={{color:"#0A3D1F"}}>Accès réservé aux abonnés</h2>
        <button onClick={()=>navigate("/connexion")} className="btn-save" style={{marginTop:"16px"}}>
          Se connecter</button>
      </div>
    </div>
  );

  /* ── Composants internes réutilisables ── */
  const Chip = ({ label, onRemove }) => (
    <span style={{ background:"var(--green-pale)", color:"var(--green-dark)",
      border:"1px solid rgba(34,160,82,0.2)", borderRadius:"100px",
      padding:"3px 10px", fontSize:"11px", fontWeight:600,
      display:"inline-flex", alignItems:"center", gap:"5px" }}>
      {label}
      {onRemove && <span onClick={onRemove} style={{cursor:"pointer",opacity:0.6}}>✕</span>}
    </span>
  );

  const SectionCritere = ({ icon, titre, sous, children }) => (
    <div style={{ background:"var(--off-white)", borderRadius:"12px",
      border:"1px solid var(--border)", padding:"20px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
        <span style={{fontSize:"18px"}}>{icon}</span>
        <span style={{fontWeight:700,fontSize:"14px",color:"var(--text-dark)"}}>{titre}</span>
        {sous && <span style={{fontSize:"11px",color:"var(--text-muted)"}}>{sous}</span>}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{minHeight:"100vh",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div className="dash-bg"><div className="grid"/></div>
      <div style={{position:"relative",zIndex:1}}>

        {/* NAVBAR */}
        <nav className="dash-navbar">
          <div className="dash-logo" onClick={()=>navigate("/")}>NERE <span>CCI-BF</span></div>
          <div className="dash-nav-links">
            <span className="dash-nav-link" onClick={()=>navigate("/")}>Accueil</span>
            <span className="dash-nav-link" onClick={()=>navigate("/recherche")}>Recherche</span>
            <span className="dash-nav-link active">Demande</span>
            <span className="dash-nav-link" onClick={()=>navigate("/chat")}>💬 Chat</span>
          </div>
          <div className="dash-nav-actions">
            <div className="user-chip" onClick={()=>navigate("/profil")}>
              <div className="user-avatar">{user.prenom?.[0]}{user.nom?.[0]}</div>
              <span>{user.prenom} {user.nom}</span>
            </div>
          </div>
        </nav>

        {/* HERO avec tarifs */}
        <div className="pub-page-hero" style={{padding:"36px 48px 28px"}}>
          <div className="pub-page-tag">CCI-BF · Service des données NERE</div>
          <h1 className="pub-page-title" style={{fontSize:"28px",textAlign:"left"}}>
            Demande de données officielles
          </h1>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap",marginTop:"16px"}}>
            {TYPES_REQUETES.filter(t=>t.prix).map(t=>(
              <div key={t.id} style={{background:"rgba(255,255,255,0.07)",
                border:"1px solid rgba(255,255,255,0.12)",borderRadius:"100px",
                padding:"5px 14px",fontSize:"12px",color:"rgba(255,255,255,0.8)",
                display:"flex",alignItems:"center",gap:"6px"}}>
                <span>{t.icon}</span>
                <span style={{fontWeight:700,color:"#4DC97A"}}>{t.label}</span>
                <span>—</span>
                <span>{t.prix.toLocaleString()} FCFA/{t.unite}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ONGLETS */}
        <div style={{background:"#fff",borderBottom:"1px solid var(--border)",
          padding:"0 48px",display:"flex"}}>
          {[{key:"nouvelle",label:"📝 Nouvelle demande"},
            {key:"historique",label:`📋 Mes demandes (${DEMANDES_MOCK.length})`}]
            .map(o=>(
            <button key={o.key} onClick={()=>setOnglet(o.key)} style={{
              padding:"14px 24px",background:"transparent",border:"none",
              borderBottom:onglet===o.key?"3px solid var(--green-light)":"3px solid transparent",
              color:onglet===o.key?"var(--green-dark)":"var(--text-muted)",
              fontWeight:onglet===o.key?700:500,fontSize:"14px",
              cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
              {o.label}
            </button>
          ))}
        </div>

        <div style={{padding:"32px 48px 60px",background:"var(--off-white)"}}>

          {/* ══════ NOUVELLE DEMANDE ══════ */}
          {onglet==="nouvelle" && (
            <div style={{maxWidth:"820px"}}>
              {success ? (
                <div style={{background:"#fff",borderRadius:"16px",border:"1px solid var(--border)",
                  padding:"48px",textAlign:"center"}}>
                  <div style={{fontSize:"56px",marginBottom:"16px"}}>✅</div>
                  <h2 style={{fontFamily:"'Playfair Display',serif",color:"var(--green-dark)",
                    fontSize:"24px",marginBottom:"12px"}}>Demande enregistrée !</h2>
                  <p style={{color:"var(--text-muted)",lineHeight:1.7,marginBottom:"28px"}}>
                    Votre demande a été transmise à la CCI-BF.<br/>
                    Un agent vous recontactera à <strong>{form.contact}</strong> sous{" "}
                    <strong>3 à 5 jours ouvrables</strong> pour confirmer et organiser le paiement.
                  </p>
                  {montant && (
                    <div style={{background:"var(--green-pale)",border:"1px solid rgba(34,160,82,0.2)",
                      borderRadius:"12px",padding:"16px 24px",marginBottom:"24px",
                      display:"inline-flex",alignItems:"center",gap:"12px"}}>
                      <span style={{fontSize:"24px"}}>💰</span>
                      <div style={{textAlign:"left"}}>
                        <div style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",
                          textTransform:"uppercase",letterSpacing:"0.08em"}}>Montant estimé</div>
                        <div style={{fontSize:"22px",fontWeight:800,color:"var(--green-dark)",
                          fontFamily:"'Playfair Display',serif"}}>{formaterMontant(montant)}</div>
                      </div>
                    </div>
                  )}
                  <div style={{display:"flex",gap:"12px",justifyContent:"center"}}>
                    <button className="btn-save" onClick={reset}>+ Nouvelle demande</button>
                    <button className="btn-cancel" onClick={()=>setOnglet("historique")}>
                      Voir mes demandes</button>
                  </div>
                </div>
              ) : (
                <div style={{background:"#fff",borderRadius:"16px",
                  border:"1px solid var(--border)",overflow:"hidden"}}>

                  {/* Barre étapes */}
                  <div style={{background:"var(--green-deep)",padding:"18px 32px",
                    display:"flex",alignItems:"center"}}>
                    {[{n:1,label:"Type de requête"},{n:2,label:"Critères de sélection"},
                      {n:3,label:"Confirmation"}].map((s,i)=>(
                      <div key={s.n} style={{display:"flex",alignItems:"center",
                        flex:i<2?1:"none"}}>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <div style={{width:"28px",height:"28px",borderRadius:"50%",
                            background:etape>s.n?"var(--green-light)":
                              etape===s.n?"rgba(77,201,122,0.3)":"rgba(255,255,255,0.1)",
                            border:etape===s.n?"2px solid var(--green-light)":"2px solid transparent",
                            color:etape>=s.n?"#fff":"rgba(255,255,255,0.3)",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:"12px",fontWeight:800,flexShrink:0}}>
                            {etape>s.n?"✓":s.n}
                          </div>
                          <span style={{fontSize:"12px",fontWeight:600,
                            color:etape>=s.n?"#fff":"rgba(255,255,255,0.35)"}}>
                            {s.label}
                          </span>
                        </div>
                        {i<2 && <div style={{flex:1,height:"2px",
                          background:"rgba(255,255,255,0.12)",margin:"0 12px"}}/>}
                      </div>
                    ))}
                  </div>

                  <div style={{padding:"32px"}}>

                    {/* ─────── ÉTAPE 1 : TYPE ─────── */}
                    {etape===1 && (<>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",
                        color:"var(--text-dark)",marginBottom:"8px"}}>
                        Quel type de données souhaitez-vous ?
                      </h3>
                      <p style={{color:"var(--text-muted)",fontSize:"13px",marginBottom:"24px"}}>
                        Sélectionnez le type de requête selon vos besoins.
                      </p>

                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",
                        marginBottom:"24px"}}>
                        {TYPES_REQUETES.map(t=>(
                          <button key={t.id}
                            onClick={()=>setForm(f=>({...f,typeRequete:t.id,sousType:""}))}
                            style={{padding:"18px 20px",borderRadius:"12px",textAlign:"left",
                              border:form.typeRequete===t.id?`2px solid ${t.couleur}`:"1.5px solid var(--border)",
                              background:form.typeRequete===t.id?"var(--green-pale)":"#fff",
                              cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",
                              position:"relative"}}>
                            {form.typeRequete===t.id && (
                              <div style={{position:"absolute",top:"10px",right:"12px",
                                width:"18px",height:"18px",borderRadius:"50%",
                                background:t.couleur,color:"#fff",display:"flex",
                                alignItems:"center",justifyContent:"center",
                                fontSize:"10px",fontWeight:800}}>✓</div>
                            )}
                            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"8px"}}>
                              <span style={{fontSize:"22px"}}>{t.icon}</span>
                              <span style={{fontWeight:800,fontSize:"15px",
                                color:form.typeRequete===t.id?t.couleur:"var(--text-dark)"}}>
                                {t.label}
                              </span>
                              {t.prix && (
                                <span style={{marginLeft:"auto",fontSize:"12px",
                                  fontWeight:700,color:t.couleur}}>
                                  {t.prix.toLocaleString()} FCFA/{t.unite}
                                </span>
                              )}
                            </div>
                            <p style={{fontSize:"12px",color:"var(--text-muted)",
                              lineHeight:1.5,margin:0}}>{t.description}</p>
                          </button>
                        ))}
                      </div>

                      {/* Sous-type */}
                      {typeObj && typeObj.sousTypes.length>0 && (
                        <div style={{marginBottom:"20px"}}>
                          <label className="profil-label" style={{marginBottom:"10px",display:"block"}}>
                            Objet précis de la demande *
                          </label>
                          <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
                            {typeObj.sousTypes.map(s=>(
                              <button key={s.value}
                                onClick={()=>setForm(f=>({...f,sousType:s.value}))}
                                style={{padding:"10px 18px",borderRadius:"100px",
                                  border:form.sousType===s.value?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                  background:form.sousType===s.value?"var(--green-pale)":"#fff",
                                  color:form.sousType===s.value?"var(--green-dark)":"var(--text-mid)",
                                  fontWeight:form.sousType===s.value?700:500,
                                  fontSize:"13px",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
                                {form.sousType===s.value?"✓ ":""}{s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantité + montant estimé */}
                      {typeObj?.prix && (
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"20px"}}>
                          <div className="profil-field">
                            <label className="profil-label">
                              Quantité estimée ({typeObj.unite}s) *
                            </label>
                            <input type="number" min="1" className="profil-input"
                              placeholder="ex: 100" value={form.quantite}
                              onChange={e=>setForm(f=>({...f,quantite:e.target.value}))} />
                          </div>
                          {montant && (
                            <div style={{display:"flex",alignItems:"flex-end",paddingBottom:"2px"}}>
                              <div style={{background:"var(--green-pale)",
                                border:"1px solid rgba(34,160,82,0.2)",borderRadius:"12px",
                                padding:"12px 18px",width:"100%"}}>
                                <div style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",
                                  textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"4px"}}>
                                  Montant estimé
                                </div>
                                <div style={{fontSize:"20px",fontWeight:800,color:"var(--green-dark)",
                                  fontFamily:"'Playfair Display',serif"}}>{formaterMontant(montant)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <button className="btn-save" style={{padding:"12px 28px"}}
                        disabled={!form.typeRequete||(typeObj?.sousTypes.length>0&&!form.sousType)}
                        onClick={()=>setEtape(2)}>
                        Continuer → Critères de sélection
                      </button>
                    </>)}

                    {/* ─────── ÉTAPE 2 : CRITÈRES ─────── */}
                    {etape===2 && (<>
                      <div style={{display:"flex",alignItems:"center",
                        justifyContent:"space-between",marginBottom:"20px"}}>
                        <div>
                          <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",
                            color:"var(--text-dark)",margin:0}}>Critères de sélection</h3>
                          <p style={{color:"var(--text-muted)",fontSize:"13px",margin:"6px 0 0"}}>
                            Choisissez un ou plusieurs critères — sélection multiple autorisée.
                          </p>
                        </div>
                        {nbCriteres>0 && (
                          <span style={{background:"var(--green-pale)",color:"var(--green-dark)",
                            border:"1px solid rgba(34,160,82,0.2)",borderRadius:"100px",
                            padding:"4px 12px",fontSize:"12px",fontWeight:700,flexShrink:0}}>
                            {nbCriteres} critère{nbCriteres>1?"s":""} sélectionné{nbCriteres>1?"s":""}
                          </span>
                        )}
                      </div>

                      <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

                        {/* Géographique */}
                        <SectionCritere icon="🗺️" titre="Sélection par secteur géographique"
                          sous="(Région, Province, Ville)">
                          <div style={{marginBottom:"12px"}}>
                            <label className="profil-label" style={{marginBottom:"8px",display:"block"}}>
                              Régions
                            </label>
                            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                              {REGIONS.map(r=>(
                                <button key={r} onClick={()=>toggleArr("regions",r)}
                                  style={{padding:"6px 14px",borderRadius:"100px",fontSize:"12px",
                                    border:form.regions.includes(r)?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                    background:form.regions.includes(r)?"var(--green-pale)":"#fff",
                                    color:form.regions.includes(r)?"var(--green-dark)":"var(--text-mid)",
                                    fontWeight:form.regions.includes(r)?700:500,
                                    cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                                  {form.regions.includes(r)?"✓ ":""}{r}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="profil-field">
                            <label className="profil-label">Villes / Provinces spécifiques</label>
                            <input type="text" className="profil-input"
                              placeholder="ex: Ouagadougou, Bobo-Dioulasso, Koudougou..."
                              value={form.villes}
                              onChange={e=>setForm(f=>({...f,villes:e.target.value}))} />
                          </div>
                        </SectionCritere>

                        {/* Activité */}
                        <SectionCritere icon="🏭" titre="Sélection par activité"
                          sous="(Commerce, Industrie, Services)">
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                            {ACTIVITES.map(a=>(
                              <button key={a.value} onClick={()=>toggleArr("activites",a.value)}
                                style={{padding:"9px 14px",borderRadius:"8px",textAlign:"left",
                                  border:form.activites.includes(a.value)?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                  background:form.activites.includes(a.value)?"var(--green-pale)":"#fff",
                                  color:form.activites.includes(a.value)?"var(--green-dark)":"var(--text-mid)",
                                  fontWeight:form.activites.includes(a.value)?700:500,
                                  fontSize:"12px",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                                {form.activites.includes(a.value)?"✓ ":""}{a.label}
                              </button>
                            ))}
                          </div>
                        </SectionCritere>

                        {/* Forme juridique */}
                        <SectionCritere icon="⚖️" titre="Sélection par structure"
                          sous="(Forme juridique)">
                          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                            {FORMES_JURIDIQUES.map(f=>(
                              <button key={f} onClick={()=>toggleArr("formesJuridiques",f)}
                                style={{padding:"7px 14px",borderRadius:"100px",fontSize:"12px",
                                  border:form.formesJuridiques.includes(f)?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                  background:form.formesJuridiques.includes(f)?"var(--green-pale)":"#fff",
                                  color:form.formesJuridiques.includes(f)?"var(--green-dark)":"var(--text-mid)",
                                  fontWeight:form.formesJuridiques.includes(f)?700:500,
                                  cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
                                {form.formesJuridiques.includes(f)?"✓ ":""}{f}
                              </button>
                            ))}
                          </div>
                        </SectionCritere>

                        {/* Effectif */}
                        <SectionCritere icon="👥" titre="Sélection par tranche d'effectif salarié">
                          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                            {TRANCHES_EFFECTIF.map(t=>(
                              <button key={t.value} onClick={()=>toggleArr("tranches",t.value)}
                                style={{padding:"11px 16px",borderRadius:"10px",textAlign:"left",
                                  border:form.tranches.includes(t.value)?"2px solid var(--green-light)":"1.5px solid var(--border)",
                                  background:form.tranches.includes(t.value)?"var(--green-pale)":"#fff",
                                  color:form.tranches.includes(t.value)?"var(--green-dark)":"var(--text-mid)",
                                  fontWeight:form.tranches.includes(t.value)?700:500,
                                  fontSize:"13px",cursor:"pointer",fontFamily:"inherit",
                                  transition:"all 0.15s",display:"flex",alignItems:"center",gap:"10px"}}>
                                <div style={{width:"18px",height:"18px",borderRadius:"50%",flexShrink:0,
                                  border:form.tranches.includes(t.value)?"2px solid var(--green-light)":"2px solid var(--border)",
                                  background:form.tranches.includes(t.value)?"var(--green-light)":"transparent",
                                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",color:"#fff"}}>
                                  {form.tranches.includes(t.value)?"✓":""}
                                </div>
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </SectionCritere>

                        {/* Description + contact */}
                        <div className="profil-field">
                          <label className="profil-label">Précisions supplémentaires (facultatif)</label>
                          <textarea className="profil-input" rows={3}
                            placeholder="Tout détail utile pour préciser votre demande..."
                            value={form.description}
                            onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                            style={{resize:"vertical"}} />
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
                          <div className="profil-field">
                            <label className="profil-label">Email de contact *</label>
                            <input type="email" className="profil-input" value={form.contact}
                              onChange={e=>setForm(f=>({...f,contact:e.target.value}))} />
                          </div>
                          <div className="profil-field">
                            <label className="profil-label">Téléphone</label>
                            <input type="tel" className="profil-input"
                              placeholder="+226 XX XX XX XX" value={form.telephone}
                              onChange={e=>setForm(f=>({...f,telephone:e.target.value}))} />
                          </div>
                        </div>
                      </div>

                      <div style={{display:"flex",gap:"10px",marginTop:"24px"}}>
                        <button className="btn-cancel" onClick={()=>setEtape(1)}>← Retour</button>
                        <button className="btn-save" style={{padding:"12px 28px"}}
                          disabled={!form.contact} onClick={()=>setEtape(3)}>
                          Vérifier ma demande →
                        </button>
                      </div>
                    </>)}

                    {/* ─────── ÉTAPE 3 : CONFIRMATION ─────── */}
                    {etape===3 && (<>
                      <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",
                        color:"var(--text-dark)",marginBottom:"20px"}}>
                        Récapitulatif de votre demande
                      </h3>

                      <div style={{background:"var(--off-white)",borderRadius:"12px",
                        border:"1px solid var(--border)",padding:"20px",marginBottom:"16px"}}>

                        {/* Type + montant */}
                        <div style={{display:"flex",alignItems:"center",
                          justifyContent:"space-between",paddingBottom:"16px",
                          borderBottom:"1px solid var(--border)",marginBottom:"16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                            <span style={{fontSize:"32px"}}>{typeObj?.icon}</span>
                            <div>
                              <div style={{fontWeight:800,fontSize:"16px",color:"var(--text-dark)"}}>
                                {typeObj?.label}
                              </div>
                              <div style={{fontSize:"12px",color:"var(--text-muted)",marginTop:"2px"}}>
                                {typeObj?.sousTypes.find(s=>s.value===form.sousType)?.label
                                  || typeObj?.description}
                              </div>
                              {form.quantite && (
                                <div style={{fontSize:"12px",color:"var(--green-bright)",
                                  fontWeight:600,marginTop:"2px"}}>
                                  {form.quantite} {typeObj?.unite}(s) demandé(s)
                                </div>
                              )}
                            </div>
                          </div>
                          {montant ? (
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:"11px",color:"var(--text-muted)",
                                textTransform:"uppercase",letterSpacing:"0.06em"}}>Montant estimé</div>
                              <div style={{fontSize:"22px",fontWeight:800,color:"var(--green-dark)",
                                fontFamily:"'Playfair Display',serif"}}>{formaterMontant(montant)}</div>
                            </div>
                          ) : (
                            <span style={{background:"rgba(212,168,48,0.1)",color:"#D4A830",
                              border:"1px solid rgba(212,168,48,0.3)",borderRadius:"100px",
                              padding:"4px 12px",fontSize:"12px",fontWeight:700}}>
                              Sur devis
                            </span>
                          )}
                        </div>

                        {/* Critères */}
                        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                          {form.regions.length>0 && (
                            <div>
                              <div style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",
                                textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"6px"}}>
                                🗺️ Régions
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                                {form.regions.map(r=><Chip key={r} label={r}/>)}
                              </div>
                            </div>
                          )}
                          {form.activites.length>0 && (
                            <div>
                              <div style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",
                                textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"6px"}}>
                                🏭 Activités
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                                {form.activites.map(a=>(
                                  <Chip key={a} label={ACTIVITES.find(x=>x.value===a)?.label}/>
                                ))}
                              </div>
                            </div>
                          )}
                          {form.formesJuridiques.length>0 && (
                            <div>
                              <div style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",
                                textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"6px"}}>
                                ⚖️ Formes juridiques
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                                {form.formesJuridiques.map(f=><Chip key={f} label={f}/>)}
                              </div>
                            </div>
                          )}
                          {form.tranches.length>0 && (
                            <div>
                              <div style={{fontSize:"11px",fontWeight:700,color:"var(--text-muted)",
                                textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"6px"}}>
                                👥 Tranches d'effectif
                              </div>
                              <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                                {form.tranches.map(t=>(
                                  <Chip key={t} label={TRANCHES_EFFECTIF.find(x=>x.value===t)?.label}/>
                                ))}
                              </div>
                            </div>
                          )}
                          {nbCriteres===0 && (
                            <p style={{fontSize:"13px",color:"var(--text-muted)",
                              fontStyle:"italic",margin:0}}>
                              Aucun critère — toutes les données disponibles seront incluses
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{background:"var(--green-pale)",
                        border:"1px solid rgba(34,160,82,0.2)",borderRadius:"10px",
                        padding:"12px 16px",marginBottom:"20px",
                        fontSize:"13px",color:"var(--text-mid)",lineHeight:1.6}}>
                        ℹ️ Un agent CCI-BF vous recontactera à <strong>{form.contact}</strong> sous{" "}
                        <strong>3 à 5 jours ouvrables</strong> pour confirmer et organiser le paiement.
                      </div>

                      <div style={{display:"flex",gap:"10px"}}>
                        <button className="btn-cancel" onClick={()=>setEtape(2)}>← Modifier</button>
                        <button className="btn-save" style={{padding:"12px 32px"}}
                          disabled={loading} onClick={soumettre}>
                          {loading
                            ? <><span className="spinner-sm"/>&nbsp;Envoi...</>
                            : "📤 Soumettre la demande"}
                        </button>
                      </div>
                    </>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════ HISTORIQUE ══════ */}
          {onglet==="historique" && (
            <div style={{maxWidth:"820px"}}>
              {DEMANDES_MOCK.length===0 ? (
                <div style={{textAlign:"center",padding:"60px 0",color:"var(--text-muted)"}}>
                  <div style={{fontSize:"48px",marginBottom:"12px"}}>📋</div>
                  <p>Aucune demande pour l'instant.</p>
                  <button className="btn-save" style={{marginTop:"16px"}}
                    onClick={()=>setOnglet("nouvelle")}>Faire une demande</button>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
                  {DEMANDES_MOCK.map(d=>{
                    const sc  = STATUT_COLORS[d.statut];
                    const typ = TYPES_REQUETES.find(t=>t.id===d.typeRequete);
                    return (
                      <div key={d.id} style={{background:"#fff",borderRadius:"14px",
                        border:"1px solid var(--border)",padding:"20px 24px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",
                          alignItems:"flex-start",marginBottom:"14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                            <span style={{fontSize:"28px"}}>{typ?.icon}</span>
                            <div>
                              <div style={{fontWeight:700,fontSize:"15px",color:"var(--text-dark)"}}>
                                {typ?.label}
                              </div>
                              <div style={{fontSize:"12px",color:"var(--text-muted)"}}>
                                {d.date} · Réf. {d.id}
                              </div>
                            </div>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",
                            alignItems:"flex-end",gap:"6px"}}>
                            <span style={{background:sc.bg,color:sc.color,
                              border:`1px solid ${sc.color}33`,borderRadius:"100px",
                              padding:"4px 12px",fontSize:"11px",fontWeight:700}}>
                              ● {sc.label}
                            </span>
                            {d.montantEstime && (
                              <span style={{fontSize:"13px",fontWeight:700,color:"var(--green-dark)"}}>
                                {d.montantEstime.toLocaleString()} FCFA
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
                          {d.criteres?.regions?.map(r=><Chip key={r} label={"🗺️ "+r}/>)}
                          {d.criteres?.activites?.map(a=>(
                            <Chip key={a} label={"🏭 "+ACTIVITES.find(x=>x.value===a)?.label}/>
                          ))}
                          {d.criteres?.tranches?.map(t=>(
                            <Chip key={t} label={"👥 "+t}/>
                          ))}
                        </div>
                        <p style={{fontSize:"13px",color:"var(--text-muted)",
                          lineHeight:1.6,margin:0}}>{d.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="dash-footer">
          <span>© 2025 CCI-BF — Chambre de Commerce et d'Industrie du Burkina Faso</span>
          <div style={{display:"flex",gap:"20px"}}>
            <span>Tarifs officiels CCI-BF</span>
            <span>+226 25 30 61 22</span>
          </div>
        </footer>
      </div>
    </div>
  );
}