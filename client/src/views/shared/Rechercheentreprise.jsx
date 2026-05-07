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

function genererEtTelechargerPDF(resultats, total, mode, titre, periode) {
  const now = new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
  const estAssociation = mode === "association" || (Array.isArray(resultats) && resultats[0]?.code_ass);
  const lignes = resultats.map((item, i) => {
    const nom = item.denomination || item.nom_commercial || item.nom || "—";
    const id1 = item.rccm || item.recepisse || "—";
    const id2 = item.ifu || "—";
    const contact = [item.email, item.telephone_fixe, item.telephone_mobile].filter(Boolean).join(" | ") || "—";
    const localisation = item.region || item.adresse_siege || item.adresse || "—";
    const statut = item.etat ? (item.etat==="A"?"Actif":"Inactif") : (item.statut_validite==="1"||item.statut_validite==="A"?"Valide":(item.statut_validite?"Non valide":"—"));
    return `<tr style="background:${i%2===0?"#fff":"#f9fdf9"}">
      <td style="padding:6px 8px;border-bottom:1px solid #e0ede6;font-weight:600;color:#0A2410">${i+1}. ${nom}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e0ede6;font-size:11px;color:#333">${id1}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e0ede6;font-size:11px;color:#333">${id2}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e0ede6;font-size:11px;color:#555">${contact}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e0ede6;font-size:11px;color:#555">${localisation}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e0ede6;text-align:center">
        <span style="background:${statut==="Actif"||statut==="Valide"?"#e8f5ee":"#fff0f0"};color:${statut==="Actif"||statut==="Valide"?"#1A7A40":"#CC3333"};border-radius:100px;padding:2px 8px;font-size:10px;font-weight:700">${statut}</span>
      </td></tr>`;
  }).join("");
  const col1 = estAssociation ? "Récépissé" : "RCCM";
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>${titre||"Résultats NERE"}</title>
  <style>@page{size:A4 landscape;margin:15mm 12mm}*{font-family:Arial,Helvetica,sans-serif;box-sizing:border-box}body{margin:0;padding:0;font-size:12px;color:#1A2E1F}
  .header{background:#00904C;color:#fff;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;border-radius:8px 8px 0 0}
  .header-left h1{margin:0;font-size:18px;font-weight:900}.header-left p{margin:3px 0 0;font-size:10px;opacity:.75}.header-right{text-align:right;font-size:11px;opacity:.85;line-height:1.6}
  .meta{background:#f5faf7;border:1px solid #c0deca;border-top:none;padding:10px 20px;display:flex;gap:30px;align-items:center}
  .meta-item span:first-child{font-size:9px;font-weight:700;color:#6B9A7A;text-transform:uppercase;letter-spacing:.07em}
  .meta-item span:last-child{font-size:13px;font-weight:800;color:#00904C}
  table{width:100%;border-collapse:collapse}thead tr{background:#00904C}
  thead th{padding:8px;color:#fff;font-size:10px;font-weight:700;text-align:left;text-transform:uppercase;letter-spacing:.06em}
  .footer{margin-top:16px;padding:10px 0;border-top:1px solid #e0ede6;display:flex;justify-content:space-between;font-size:9px;color:#6B9A7A}
  @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head>
  <body><div class="header"><div class="header-left"><h1>FICHIER NERE — CCI-BF</h1><p>Chambre de Commerce et d'Industrie du Burkina Faso · Registre National des Entreprises</p></div>
  <div class="header-right"><div>Date d'extraction : <strong>${now}</strong></div><div>Document officiel CCI-BF</div></div></div>
  <div class="meta"><div class="meta-item"><span>Type</span><span>${titre||(estAssociation?"Associations":"Entreprises")}</span></div>
  <div class="meta-item"><span>Total trouvé</span><span>${total?.toLocaleString("fr-FR")} résultat(s)</span></div>
  <div class="meta-item"><span>Affichés</span><span>${resultats.length}</span></div>
  ${periode?`<div class="meta-item"><span>Période</span><span>${periode}</span></div>`:""}</div>
  <table><thead><tr><th style="width:28%">Dénomination / Nom</th><th style="width:14%">${col1}</th><th style="width:11%">IFU</th>
  <th style="width:22%">Contact</th><th style="width:18%">Localisation</th><th style="width:7%;text-align:center">Statut</th></tr></thead>
  <tbody>${lignes}</tbody></table>
  <div class="footer"><span>© CCI-BF — Tous droits réservés</span><span>+226 25 30 61 22 · www.cci.bf</span></div>
  <script>window.onload=function(){window.print()};</script></body></html>`;
  const popup = window.open("","_blank","width=1200,height=800");
  if (popup) { popup.document.write(html); popup.document.close(); }
  else {
    const blob = new Blob([html],{type:"text/html;charset=utf-8"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.target="_blank"; a.click(); URL.revokeObjectURL(url);
  }
}

export default function RechercheEntreprise() {
  const navigate = useNavigate();

  const [user, setUser]                 = useState(null);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [mode, setMode]                 = useState("entreprise");
  const [loading, setLoading]           = useState(false);
  const [resultats, setResultats]       = useState([]);
  const [total, setTotal]               = useState(0);
  const [rechercheFaite, setRechercheFaite] = useState(false);
  const [erreur, setErreur]             = useState("");
  const [soldeRestant, setSoldeRestant] = useState(null);
  const [formEnt, setFormEnt] = useState({ rccm:"", ifu:"", raisonSociale:"" });
  const [formAss, setFormAss] = useState({ nom:"", sigle:"", recepisse:"" });
  const [permissionRefusee, setPermissionRefusee] = useState(false);

  // Historique — chargé au montage, affiché à droite
  const [historique, setHistorique]           = useState([]);
  const [histoLoading, setHistoLoading]       = useState(false);
  const [histoErreur, setHistoErreur]         = useState("");
  const [replayLoadingId, setReplayLoadingId] = useState(null);
  const [replayMessage, setReplayMessage]     = useState({ id:null, texte:"", type:"" });

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  const chargerHistorique = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setHistoLoading(true); setHistoErreur("");
    try {
      const res  = await fetch(`${API}/searchlogs/mon-historique?limit=50`,
        { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setHistorique(data.data || []);
      else setHistoErreur(data.message || "Impossible de charger.");
    } catch { setHistoErreur("Serveur inaccessible."); }
    setHistoLoading(false);
  }, []);

  // Vérifier la permission de recherche multicritère au montage
  useEffect(() => {
    if (user && user.role === 'manager') {
      // Si c'est un gestionnaire, vérifier s'il est autorisé à faire des recherches multicritères
      if (!user.canSearchMultiCriteria) {
        setPermissionRefusee(true);
      }
    }
  }, [user]);

  // Charger l'historique au montage
  useEffect(() => {
    chargerHistorique();
  }, [chargerHistorique]);

  useEffect(() => {
    setResultats([]); setRechercheFaite(false); setErreur("");
  }, [mode]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const initiales = user
    ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase()
    : "";

  // Envoyer une alerte à l'administrateur quand un gestionnaire bloqué essaie de rechercher
  const envoyerAlerteBlocage = async (typeRecherche, criteres) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API}/chat/alerte-blocage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          gestionnaire_id: user.id,
          gestionnaire_nom: `${user.prenom} ${user.nom}`,
          gestionnaire_email: user.email,
          gestionnaire_telephone: user.telephone || "Non fourni",
          type_recherche: typeRecherche,
          criteres: criteres,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Erreur lors de l'envoi de l'alerte", err);
    }
  };

  const rechercherEntreprise = async (e) => {
    e.preventDefault();
    
    // Compter les critères remplis
    const nbCriteres = [formEnt.rccm, formEnt.ifu, formEnt.raisonSociale].filter(Boolean).length;
    
    // Vérifier la permission de recherche pour les gestionnaires
    if (user && user.role === 'manager' && !user.canSearchMultiCriteria) {
      setErreur(" Vous n'êtes pas autorisé à effectuer des recherches d'entreprises. Veuillez contacter l'administrateur pour demander l'autorisation.");
      setRechercheFaite(false);
      // Envoyer une alerte à l'administrateur
      await envoyerAlerteBlocage("entreprise", { rccm: formEnt.rccm, ifu: formEnt.ifu, raisonSociale: formEnt.raisonSociale, nbCriteres });
      return;
    }
    
    if (!formEnt.rccm && !formEnt.ifu && !formEnt.raisonSociale) return;
    setLoading(true); setRechercheFaite(true); setErreur("");
    try {
      const token  = localStorage.getItem("token");
      const params = new URLSearchParams({ limit:20, page:1 });
      if (formEnt.rccm)          params.append("rccm",         formEnt.rccm.trim());
      if (formEnt.ifu)           params.append("ifu",          formEnt.ifu.trim());
      if (formEnt.raisonSociale) params.append("denomination", formEnt.raisonSociale.trim());
      const res  = await fetch(`${API}/nere/recherche?${params}`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.code === "SOLDE_INSUFFISANT") {
        setErreur(`Solde insuffisant — cette recherche coûte ${data.cout?.toLocaleString("fr-FR")} FCFA. Votre solde : ${data.solde_actuel?.toLocaleString("fr-FR")} FCFA.`);
        setResultats([]);
      } else if (data.success) {
        setResultats(data.data || []);
        setTotal(data.total || 0);
        if (data.solde_restant !== undefined) setSoldeRestant(data.solde_restant);
        fetch(`${API}/searchlogs`, {
          method:"POST",
          headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({ type:"entreprise", description:"Recherche entreprise", criteres:{ rccm:formEnt.rccm, ifu:formEnt.ifu, raisonSociale:formEnt.raisonSociale }, nbResultats:data.total||data.data?.length||0 }),
        }).catch(()=>{});
        // Recharger l'historique après recherche
        chargerHistorique();
      } else {
        setErreur(data.message || "Erreur lors de la recherche.");
        setResultats([]);
      }
    } catch { setErreur("Serveur inaccessible."); setResultats([]); }
    setLoading(false);
  };

  const rechercherAssociation = async (e) => {
    e.preventDefault();
    
    // Compter les critères remplis
    const nbCriteres = [formAss.nom, formAss.sigle, formAss.recepisse].filter(Boolean).length;
    
    // Vérifier la permission de recherche pour les gestionnaires
    if (user && user.role === 'manager' && !user.canSearchMultiCriteria) {
      setErreur(" Vous n'êtes pas autorisé à effectuer des recherches d'associations. Veuillez contacter l'administrateur pour demander l'autorisation.");
      setRechercheFaite(false);
      // Envoyer une alerte à l'administrateur
      await envoyerAlerteBlocage("association", { nom: formAss.nom, sigle: formAss.sigle, recepisse: formAss.recepisse, nbCriteres });
      return;
    }
    
    if (!formAss.nom && !formAss.sigle && !formAss.recepisse) return;
    setLoading(true); setRechercheFaite(true); setErreur("");
    try {
      const token  = localStorage.getItem("token");
      const params = new URLSearchParams({ limit:20, page:1 });
      if (formAss.nom)       params.append("nom",       formAss.nom.trim());
      if (formAss.sigle)     params.append("sigle",     formAss.sigle.trim());
      if (formAss.recepisse) params.append("recepisse", formAss.recepisse.trim());
      const res  = await fetch(`${API}/nere/associations?${params}`, { headers:{ Authorization:`Bearer ${token}` } });
      const data = await res.json();
      if (data.code === "SOLDE_INSUFFISANT") {
        setErreur(`Solde insuffisant — cette recherche coûte ${data.cout?.toLocaleString("fr-FR")} FCFA. Votre solde : ${data.solde_actuel?.toLocaleString("fr-FR")} FCFA.`);
        setResultats([]);
      } else if (data.success) {
        setResultats(data.data || []);
        setTotal(data.total || 0);
        if (data.solde_restant !== undefined) setSoldeRestant(data.solde_restant);
        fetch(`${API}/searchlogs`, {
          method:"POST",
          headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
          body: JSON.stringify({ type:"association", description:"Recherche association", criteres:{ nom:formAss.nom, sigle:formAss.sigle, recepisse:formAss.recepisse }, nbResultats:data.total||data.data?.length||0 }),
        }).catch(()=>{});
        chargerHistorique();
      } else {
        setErreur(data.message || "Erreur lors de la recherche.");
        setResultats([]);
      }
    } catch { setErreur("Serveur inaccessible."); setResultats([]); }
    setLoading(false);
  };

  const handleReset = () => {
    setFormEnt({ rccm:"", ifu:"", raisonSociale:"" });
    setFormAss({ nom:"", sigle:"", recepisse:"" });
    setResultats([]); setRechercheFaite(false); setErreur("");
  };

  const relancerRecherche = async (item) => {
    if (!item?._id) return;
    setReplayMessage({ id:null, texte:"", type:"" });
    setReplayLoadingId(item._id);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API}/searchlogs/${item._id}/replay`,
        { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) {
        setReplayMessage({ id:item._id, texte:data.updated?"Modification détectée : nouvelle requête enregistrée.":"Aucune mise à jour : résultat depuis le cache.", type:"succes" });
        chargerHistorique();
      } else setReplayMessage({ id:item._id, texte:data.message||"Relance impossible.", type:"erreur" });
    } catch { setReplayMessage({ id:item._id, texte:"Erreur serveur.", type:"erreur" }); }
    setReplayLoadingId(null);
    setTimeout(()=>setReplayMessage({ id:null, texte:"", type:"" }), 5000);
  };

  if (!user) return null;

  const CarteEntreprise = ({ ent, i }) => {
    const idents = [
      { label:"RCCM",            value:ent.rccm },
      { label:"IFU",             value:ent.ifu },
      { label:"CNSS",            value:ent.cnss },
      { label:"Forme juridique", value:ent.forme_juridique },
      { label:"Sous-catégorie",  value:ent.sous_categorie },
      { label:"Capital",         value:ent.capital&&Number(ent.capital)>0?`${Number(ent.capital).toLocaleString("fr-FR")} FCFA`:null },
      { label:"Effectif perm.",  value:ent.effectif_permanent?`${ent.effectif_permanent} employés`:null },
      { label:"Effectif temp.",  value:ent.effectif_temporaire?`${ent.effectif_temporaire} employés`:null },
      { label:"Chiffre d'aff.",  value:ent.chiffre_affaires&&Number(ent.chiffre_affaires)>0?`${Number(ent.chiffre_affaires).toLocaleString("fr-FR")} FCFA`:null },
      { label:"Date création",   value:ent.date_creation?new Date(ent.date_creation).toLocaleDateString("fr-FR"):null },
      { label:"Date RCCM",       value:ent.date_rccm?new Date(ent.date_rccm).toLocaleDateString("fr-FR"):null },
    ].filter(f => f.value);
    const contacts = [
      { value:ent.email }, { value:ent.telephone_fixe },
      { value:ent.telephone_mobile }, { value:ent.fax },
    ].filter(c => c.value);
    const adresse = [ent.adresse_siege, ent.rue, ent.quartier].filter(Boolean).join(", ");
    return (
      <div style={{ background:"#fff", border:"1px solid rgba(0,144,76,0.15)", borderRadius:"14px", padding:"20px 24px", boxShadow:"0 2px 8px rgba(0,144,76,0.05)" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="#00904C";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,144,76,0.12)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,144,76,0.15)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,144,76,0.05)";}}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" }}>
          <div>
            <div style={{ fontWeight:800, color:"#00904C", fontSize:"16px", marginBottom:"2px" }}>{ent.denomination||ent.nom_commercial||"—"}</div>
            {ent.enseigne&&ent.enseigne!==ent.denomination&&<div style={{ fontSize:"12px", color:"#0A2410", fontStyle:"italic" }}>{ent.enseigne}</div>}
            {ent.sigle&&<div style={{ fontSize:"12px", color:"#6B9A7A" }}>{ent.sigle}</div>}
            {ent.slogan&&<div style={{ fontSize:"11px", color:"#6B9A7A", fontStyle:"italic" }}>« {ent.slogan} »</div>}
          </div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"flex-end" }}>
            {ent.region&&<span style={{ background:"rgba(0,144,76,0.08)", color:"#00904C", border:"1px solid rgba(0,144,76,0.2)", borderRadius:"100px", padding:"3px 12px", fontSize:"11px", fontWeight:700 }}>{ent.region}</span>}
            {ent.etat&&<span style={{ background:ent.etat==="A"?"rgba(77,201,122,0.1)":"rgba(232,85,85,0.1)", color:ent.etat==="A"?"#1A7A40":"#CC3333", borderRadius:"100px", padding:"3px 12px", fontSize:"11px", fontWeight:700 }}>{ent.etat==="A"?"Actif":"Inactif"}</span>}
          </div>
        </div>
        {idents.length>0&&(
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"12px" }}>
            {idents.map(({label,value})=>(
              <div key={label} style={{ background:"#F5FAF7", borderRadius:"8px", padding:"8px 12px" }}>
                <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"3px" }}>{label}</div>
                <div style={{ fontSize:"12px", fontWeight:600, color:"#0A2410" }}>{value}</div>
              </div>
            ))}
          </div>
        )}
        {adresse&&<div style={{ marginBottom:"10px", paddingBottom:"10px", borderBottom:"1px solid rgba(0,144,76,0.08)", fontSize:"12px", color:"#6B9A7A" }}>📍 {adresse}{ent.boite_postale&&` — BP ${ent.boite_postale}`}</div>}
        {(contacts.length>0||ent.site_web)&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", alignItems:"center", marginBottom:"8px" }}>
            {contacts.map(c=><span key={c.value} style={{ fontSize:"12px", color:"#6B9A7A" }}>{c.value}</span>)}
            {ent.site_web&&<a href={ent.site_web.startsWith("http")?ent.site_web:`https://${ent.site_web}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"#00904C" }}>{ent.site_web}</a>}
          </div>
        )}
        {ent.activite&&<div style={{ paddingTop:"8px", borderTop:"1px solid rgba(0,144,76,0.08)", fontSize:"12px", color:"#6B9A7A", lineHeight:1.6 }}><strong style={{ color:"#0A2410" }}>Activité : </strong>{ent.activite}</div>}
      </div>
    );
  };

  const CarteAssociation = ({ ass }) => {
    const idents = [
      { label:"Récépissé",       value:ass.recepisse },
      { label:"IFU",             value:ass.ifu },
      { label:"Effectif membres",value:ass.effectif_membres?`${String(ass.effectif_membres).trim()} membres`:null },
      { label:"Date création",   value:ass.date_creation?new Date(ass.date_creation).toLocaleDateString("fr-FR"):null },
      { label:"Date récépissé",  value:ass.date_recepisse?new Date(ass.date_recepisse).toLocaleDateString("fr-FR"):null },
      { label:"Date validité",   value:ass.date_validite?new Date(ass.date_validite).toLocaleDateString("fr-FR"):null },
      { label:"Commune",         value:ass.commune },
      { label:"Région",          value:ass.region },
    ].filter(f => f.value);
    const contacts = [
      { value:ass.email }, { value:ass.telephone_fixe },
      { value:ass.telephone_mobile }, { value:ass.fax }, { value:ass.contact_ass },
    ].filter(c => c.value);
    return (
      <div style={{ background:"#fff", border:"1px solid rgba(0,144,76,0.15)", borderRadius:"14px", padding:"20px 24px", boxShadow:"0 2px 8px rgba(0,144,76,0.05)" }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="#00904C";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,144,76,0.12)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(0,144,76,0.15)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,144,76,0.05)";}}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"14px" }}>
          <div>
            <div style={{ fontWeight:800, color:"#00904C", fontSize:"16px", marginBottom:"2px" }}>{ass.nom||"—"}</div>
            {ass.sigle&&<div style={{ fontSize:"12px", color:"#6B9A7A" }}>{ass.sigle}</div>}
            {ass.categorie&&<div style={{ fontSize:"11px", color:"#1E60CC", marginTop:"3px", background:"rgba(30,96,204,0.08)", borderRadius:"100px", padding:"2px 10px", display:"inline-block" }}>{ass.categorie}</div>}
          </div>
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", justifyContent:"flex-end" }}>
            {ass.region&&<span style={{ background:"rgba(0,144,76,0.08)", color:"#00904C", border:"1px solid rgba(0,144,76,0.2)", borderRadius:"100px", padding:"3px 12px", fontSize:"11px", fontWeight:700 }}>{ass.region}</span>}
            {ass.statut_validite&&<span style={{ background:ass.statut_validite==="1"||ass.statut_validite==="A"?"rgba(77,201,122,0.1)":"rgba(232,85,85,0.1)", color:ass.statut_validite==="1"||ass.statut_validite==="A"?"#1A7A40":"#CC3333", borderRadius:"100px", padding:"3px 12px", fontSize:"11px", fontWeight:700 }}>{ass.statut_validite==="1"||ass.statut_validite==="A"?"Valide":"Non valide"}</span>}
          </div>
        </div>
        {idents.length>0&&(
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"12px" }}>
            {idents.map(({label,value})=>(
              <div key={label} style={{ background:"#F5FAF7", borderRadius:"8px", padding:"8px 12px" }}>
                <div style={{ fontSize:"10px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:"3px" }}>{label}</div>
                <div style={{ fontSize:"12px", fontWeight:600, color:"#0A2410" }}>{value}</div>
              </div>
            ))}
          </div>
        )}
        {ass.adresse&&<div style={{ marginBottom:"10px", fontSize:"12px", color:"#6B9A7A", paddingBottom:"8px", borderBottom:"1px solid rgba(0,144,76,0.08)" }}>📍 {ass.adresse}</div>}
        {(contacts.length>0||ass.site_web)&&(
          <div style={{ display:"flex", flexWrap:"wrap", gap:"12px", alignItems:"center", marginBottom:"8px" }}>
            {contacts.map(c=><span key={c.value} style={{ fontSize:"12px", color:"#6B9A7A" }}>{c.value}</span>)}
            {ass.site_web&&<a href={ass.site_web.startsWith("http")?ass.site_web:`https://${ass.site_web}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"#00904C" }}>{ass.site_web}</a>}
          </div>
        )}
        {ass.objectif&&<div style={{ paddingTop:"8px", borderTop:"1px solid rgba(0,144,76,0.08)", fontSize:"12px", color:"#6B9A7A", lineHeight:1.6 }}><strong style={{ color:"#0A2410" }}>Objectif : </strong>{ass.objectif}</div>}
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }
        .nere-navbar-re { position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:120px;background:#00904C;box-shadow:0 2px 16px rgba(0,0,0,0.15); }
        .nere-navbar-re .nav-pill { display:flex;align-items:center;gap:3px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:5px 8px;margin-left:auto;margin-right:20px; }
        .nere-navbar-re .nav-pill .nav-btn { padding:7px 15px;border-radius:100px;font-size:20px;font-weight:600;color:rgba(255,255,255,0.78);cursor:pointer;white-space:nowrap;border:none;background:transparent; }
        .nere-navbar-re .nav-pill .nav-btn:hover { color:#fff;background:rgba(255,255,255,0.12); }
        .nere-navbar-re .nav-pill .nav-btn.active { color:#0A3D1F;background:#4DC97A;font-weight:700;box-shadow:0 2px 8px rgba(77,201,122,0.4); }
        .nere-navbar-re .u-chip { display:flex;align-items:center;gap:8px;padding:5px 12px 5px 5px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:100px;cursor:pointer;color:#fff;font-size:13px;font-weight:600;flex-shrink:0; }
        .nere-navbar-re .u-chip:hover { background:rgba(255,255,255,0.18); }
        .nere-navbar-re .u-avatar { width:30px;height:30px;border-radius:50%;background:#4DC97A;color:#0A3D1F;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0; }
        .nere-dropdown-re { position:absolute;z-index:9999;top:calc(100% + 10px);right:0;background:#fff;border-radius:16px;border:1px solid #E2EDE6;min-width:220px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.14); }
        .nere-dropdown-re .dd-head { padding:14px 18px 10px;border-bottom:1px solid #F0F4F1;background:linear-gradient(135deg,#F5FAF7,#fff); }
        .nere-dropdown-re .dd-name { font-weight:800;color:#0A3D1F;font-size:14px; }
        .nere-dropdown-re .dd-email { font-size:12px;color:#6B9A7A;margin-top:2px; }
        .nere-dropdown-re .dd-role { display:inline-flex;align-items:center;gap:5px;margin-top:6px;background:#E8F5EE;color:#00904C;border-radius:100px;padding:3px 10px;font-size:10px;font-weight:700;text-transform:uppercase; }
        .nere-dropdown-re .dd-item { padding:10px 18px;font-size:13px;color:#0A3D1F;cursor:pointer; }
        .nere-dropdown-re .dd-item:hover { background:#F5FAF7; }
        .nere-dropdown-re .dd-danger { color:#CC3333; }
        .nere-dropdown-re .dd-danger:hover { background:#FFF0F0 !important; }
        .nere-dropdown-re .dd-sep { height:1px;background:#F0F4F1;margin:4px 0; }

        /* Panneau historique */
        .histo-panel { background:#fff;border-radius:14px;border:1px solid #E2EDE6;overflow:hidden;height:100%;max-height:calc(100vh - 250px);box-sizing:border-box;display:flex;flex-direction:column; }
        .histo-header { display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F4F1;flex-shrink:0; }
        .histo-body { padding:0 14px 14px;flex:1;overflow-y:auto;min-height:0; }
      `}</style>

      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* NAVBAR */}
        <nav className="nere-navbar-re">
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <img src={logoNERE} alt="NERE" style={{ height:"80px", width:"auto", borderRadius:"6px", flexShrink:0, backgroundColor:"#fff", padding:"4px" }}/>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
              <span style={{ fontSize:"18px", fontWeight:800, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase" }}>Fichier NERE</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>Registre national des entreprises</span>
            </div>
          </div>
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key} className={`nav-btn ${link.key==="recherche"?"active":""}`} onClick={()=>navigate(link.path)}>{link.label}</button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0 }}>
            <div style={{ position:"relative" }}>
              <div className="u-chip" onClick={()=>setMenuOpen(o=>!o)}>
                <div className="u-avatar">{initiales}</div>
                <span style={{ maxWidth:"100px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user.prenom} {user.nom}</span>
                <span style={{ fontSize:"9px", opacity:0.5 }}>▾</span>
              </div>
              {menuOpen && (
                <>
                  <div style={{ position:"fixed", inset:0, zIndex:50 }} onClick={()=>setMenuOpen(false)}/>
                  <div className="nere-dropdown-re" onClick={e=>e.stopPropagation()}>
                    <div className="dd-head">
                      <div className="dd-name">{user.prenom} {user.nom}</div>
                      <div className="dd-email">{user.email||"—"}</div>
                      <div className="dd-role">{user.role==="admin"?"Admin":user.role==="manager"?"Gestionnaire":"Abonné"}</div>
                    </div>
                    <div style={{ padding:"6px 0" }}>
                      {[{label:"Mon Profil",path:"/profil"},{label:"Mon Abonnement",path:"/paiement"}].map(item=>(
                        <div key={item.label} className="dd-item" onClick={()=>{navigate(item.path);setMenuOpen(false);}}>{item.label}</div>
                      ))}
                      {user.role==="admin"&&<div className="dd-item" onClick={()=>{navigate("/admin");setMenuOpen(false);}}>Tableau de bord</div>}
                      {user.role==="manager"&&<div className="dd-item" onClick={()=>{navigate("/gestionnaire");setMenuOpen(false);}}>Tableau de bord</div>}
                      <div className="dd-sep"/>
                      <div className="dd-item dd-danger" onClick={handleLogout}>Déconnexion</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div className="pub-page-hero" style={{ padding:"36px 48px 28px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div className="pub-page-tag">Registre NERE · CCI-BF</div>
            {soldeRestant !== null && (
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:"10px", padding:"8px 16px", display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.6)", textTransform:"uppercase" }}>Solde</span>
                <span style={{ fontWeight:800, fontSize:"16px", color:soldeRestant<2000?"#FF8080":soldeRestant<5000?"#D4A830":"#4DC97A" }}>{soldeRestant.toLocaleString("fr-FR")} FCFA</span>
              </div>
            )}
          </div>
          <h1 className="pub-page-title" style={{ fontSize:"28px", textAlign:"left" }}>Recherche dans le registre NERE</h1>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:"14px", marginTop:"8px" }}>
            Interrogez le registre national NERE — entreprises et associations. · <strong style={{ color:"#4DC97A" }}>250 FCFA / recherche</strong>
          </p>
        </div>

        {/* ONGLETS — seulement 2 */}
        <div style={{ background:"#fff", borderBottom:"1px solid var(--border)", padding:"0 48px", display:"flex" }}>
          {[
            { key:"multicritere", label:" Recherche multicritères", path:"/demande-document" },
            { key:"recherche",    label:" Recherche par critères" },
          ].map(t => (
            <button key={t.key}
              onClick={() => t.path ? navigate(t.path) : null}
              style={{ padding:"13px 20px", fontSize:"14px", fontWeight:600,
                background:"transparent", border:"none",
                color: t.key==="recherche"?"#00904C":"rgba(0,0,0,0.45)",
                borderBottom: t.key==="recherche"?"2px solid #00904C":"2px solid transparent",
                cursor:"pointer" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"32px 48px 60px", background:"var(--off-white)" }}>

          {/* ══ LAYOUT 3 COLONNES : formulaire | résultats | historique ══ */}
          <div style={{ display:"grid", gridTemplateColumns:"340px 1fr 320px", gap:"24px", alignItems:"stretch", maxWidth:"1400px", margin:"0 auto" }}>

            {/* ── Colonne 1 : Formulaire ── */}
            <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid rgba(0,144,76,0.15)", padding:"24px", boxShadow:"0 2px 12px rgba(0,144,76,0.06)", height:"87%", boxSizing:"border-box" }}>
              {/* Toggle entreprise / association */}
              <div style={{ display:"flex", gap:"8px", marginBottom:"20px", background:"#F5FAF7", borderRadius:"10px", padding:"4px" }}>
                {[{key:"entreprise",label:" Entreprise"},{key:"association",label:" Association"}].map(m=>(
                  <button key={m.key} onClick={()=>setMode(m.key)}
                    style={{ flex:1, padding:"9px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600,
                      background:mode===m.key?"#00904C":"transparent", color:mode===m.key?"#fff":"#6B9A7A" }}>
                    {m.label}
                  </button>
                ))}
              </div>

              <h2 style={{ fontSize:"15px", fontWeight:800, color:"#0A2410", marginBottom:"4px" }}>Critères de recherche</h2>
              <p style={{ fontSize:"12px", color:"#6B9A7A", marginBottom:"20px" }}>Remplissez au moins un champ. Coût : <strong>250 FCFA</strong></p>

              {mode==="entreprise" && (
                <form onSubmit={rechercherEntreprise}>
                  {[
                    { key:"rccm",          label:"Numéro RCCM",  placeholder:"ex: RCCM-BF-OUA-202X-B-1XXX" },
                    { key:"ifu",           label:"Numéro IFU",   placeholder:"ex: XXX-24856-X" },
                    { key:"raisonSociale", label:"Raison sociale",placeholder:"ex: SOCOGEB" },
                  ].map(f=>(
                    <div key={f.key} style={{ marginBottom:"16px" }}>
                      <label style={{ fontSize:"11px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"5px" }}>{f.label}</label>
                      <input value={formEnt[f.key]} onChange={e=>setFormEnt(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                        style={{ width:"100%", padding:"10px 12px", background:"#F5FAF7", border:"1.5px solid rgba(0,144,76,0.2)", borderRadius:"8px", color:"#0A2410", fontSize:"13px", boxSizing:"border-box", outline:"none" }}
                        onFocus={e=>e.target.style.borderColor="#00904C"} onBlur={e=>e.target.style.borderColor="rgba(0,144,76,0.2)"}/>
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:"8px", marginTop:"20px" }}>
                    <button type="submit" disabled={loading||(!formEnt.rccm&&!formEnt.ifu&&!formEnt.raisonSociale)}
                      style={{ flex:1, padding:"11px", background:"#00904C", color:"#fff", border:"none", borderRadius:"9px", cursor:"pointer", fontSize:"13px", fontWeight:700, opacity:(!formEnt.rccm&&!formEnt.ifu&&!formEnt.raisonSociale)?0.5:1 }}>
                      {loading?" Recherche...":" Chercher"}
                    </button>
                    <button type="button" onClick={handleReset} style={{ padding:"11px 14px", background:"#fff", color:"#6B9A7A", border:"1.5px solid rgba(0,144,76,0.2)", borderRadius:"9px", cursor:"pointer", fontSize:"13px", fontWeight:600 }}>Reset</button>
                  </div>
                </form>
              )}

              {mode==="association" && (
                <form onSubmit={rechercherAssociation}>
                  {[
                    { key:"nom",       label:"Nom de l'association", placeholder:"ex: ORDRE DES GEOMETRES" },
                    { key:"sigle",     label:"Sigle",                placeholder:"ex: OGEB" },
                    { key:"recepisse", label:"N° Récépissé",         placeholder:"ex: 21-2010/AN" },
                  ].map(f=>(
                    <div key={f.key} style={{ marginBottom:"16px" }}>
                      <label style={{ fontSize:"11px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:"5px" }}>{f.label}</label>
                      <input value={formAss[f.key]} onChange={e=>setFormAss(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder}
                        style={{ width:"100%", padding:"10px 12px", background:"#F5FAF7", border:"1.5px solid rgba(30,96,204,0.2)", borderRadius:"8px", color:"#0A2410", fontSize:"13px", boxSizing:"border-box", outline:"none" }}
                        onFocus={e=>e.target.style.borderColor="#1E60CC"} onBlur={e=>e.target.style.borderColor="rgba(30,96,204,0.2)"}/>
                    </div>
                  ))}
                  <div style={{ display:"flex", gap:"8px", marginTop:"20px" }}>
                    <button type="submit" disabled={loading||(!formAss.nom&&!formAss.sigle&&!formAss.recepisse)}
                      style={{ flex:1, padding:"11px", background:"#1E60CC", color:"#fff", border:"none", borderRadius:"9px", cursor:"pointer", fontSize:"13px", fontWeight:700, opacity:(!formAss.nom&&!formAss.sigle&&!formAss.recepisse)?0.5:1 }}>
                      {loading?" Recherche...":" Chercher"}
                    </button>
                    <button type="button" onClick={handleReset} style={{ padding:"11px 14px", background:"#fff", color:"#6B9A7A", border:"1.5px solid rgba(0,144,76,0.2)", borderRadius:"9px", cursor:"pointer", fontSize:"13px", fontWeight:600 }}>Reset</button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Colonne 2 : Résultats ── */}
            <div style={{ display:"flex", flexDirection:"column" }}>
              {erreur && (
                <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3", borderRadius:"12px", padding:"14px 18px", color:"#CC3333", fontSize:"13px", marginBottom:"16px", display:"flex", gap:"10px", alignItems:"center", flexWrap: "wrap" }}>
                  <span style={{ flex: "1 1 auto" }}>{erreur}</span>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {erreur.includes("Solde") && (
                      <button onClick={()=>navigate("/formules")} style={{ padding:"6px 12px", borderRadius:"7px", background:"#00904C", border:"none", color:"#fff", fontWeight:700, fontSize:"12px", cursor:"pointer", flexShrink:0 }}>Recharger →</button>
                    )}
                    {erreur.includes("autorisé") && (
                      <button onClick={()=>navigate("/Chatadmin")} style={{ padding:"6px 12px", borderRadius:"7px", background:"#1E60CC", border:"none", color:"#fff", fontWeight:700, fontSize:"12px", cursor:"pointer", flexShrink:0 }}>Contacter l'admin </button>
                    )}
                  </div>
                </div>
              )}

              {!rechercheFaite && !erreur && (
                <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid rgba(0,144,76,0.12)", padding:"60px 24px", textAlign:"center", color:"#6B9A7A" }}>
                  <div style={{ fontSize:"48px", marginBottom:"16px" }}>{mode==="entreprise"?"":""}</div>
                  <div style={{ fontSize:"15px", fontWeight:600, color:"#0A2410", marginBottom:"8px" }}>Lancez une recherche {mode==="entreprise"?"d'entreprise":"d'association"}</div>
                  <div style={{ fontSize:"13px" }}>Remplissez au moins un critère dans le formulaire.</div>
                </div>
              )}

              {rechercheFaite && loading && (
                <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid rgba(0,144,76,0.12)", padding:"60px 24px", textAlign:"center", color:"#6B9A7A" }}>
                  <div style={{ fontSize:"13px" }}> Recherche dans le registre NERE...</div>
                </div>
              )}

              {rechercheFaite && !loading && !erreur && resultats.length===0 && (
                <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid rgba(0,144,76,0.12)", padding:"60px 24px", textAlign:"center", color:"#6B9A7A" }}>
                  <div style={{ fontSize:"36px", marginBottom:"12px" }}></div>
                  <div style={{ fontSize:"15px", fontWeight:600, color:"#0A2410", marginBottom:"8px" }}>Aucun résultat trouvé</div>
                  <div style={{ fontSize:"13px" }}>Vérifiez les critères saisis.</div>
                </div>
              )}

              {rechercheFaite && !loading && resultats.length>0 && (
                <div style={{ display:"flex", flexDirection:"column", flex:1 }}>
                  {/* Cartes résultats */}
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px", flex:1 }}>
                    {resultats.map((item, i) =>
                      mode==="entreprise"
                        ? <CarteEntreprise key={item.code_ent||i} ent={item} i={i}/>
                        : <CarteAssociation key={item.code_ass||i} ass={item}/>
                    )}
                  </div>
                  {/* Bandeau infos + PDF — en bas */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                    marginTop:"16px", padding:"12px 16px",
                    background:"#fff", borderRadius:"12px",
                    border:"1px solid rgba(0,144,76,0.12)",
                    flexWrap:"wrap", gap:"10px" }}>
                    <div style={{ fontSize:"13px", color:"#6B9A7A", fontWeight:600 }}>
                      {total.toLocaleString("fr-FR")} résultat{total>1?"s":""} — {resultats.length} affichés
                      <span style={{ marginLeft:"10px", background:mode==="entreprise"?"rgba(0,144,76,0.1)":"rgba(30,96,204,0.1)", color:mode==="entreprise"?"#00904C":"#1E60CC", borderRadius:"100px", padding:"2px 10px", fontSize:"11px", fontWeight:700 }}>
                        {mode==="entreprise"?" Entreprises":" Associations"}
                      </span>
                    </div>
                    <button onClick={()=>genererEtTelechargerPDF(resultats,total,mode,mode==="entreprise"?"Liste d'entreprises":"Liste d'associations","")}
                      style={{ padding:"8px 16px", borderRadius:"9px", background:"#1E60CC", color:"#fff", border:"none", fontWeight:700, fontSize:"13px", cursor:"pointer" }}>
                       Télécharger PDF
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Colonne 3 : Historique fixe à droite ── */}
            <div className="histo-panel">
              <div className="histo-header">
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontSize:"15px", fontWeight:800, color:"#0A2410" }}> Historique</span>
                  {historique.length>0 && (
                    <span style={{ background:"#00904C", color:"#fff", borderRadius:"100px", padding:"2px 8px", fontSize:"11px", fontWeight:700 }}>
                      {historique.length}
                    </span>
                  )}
                </div>
                <button onClick={chargerHistorique} disabled={histoLoading}
                  style={{ padding:"4px 10px", borderRadius:"7px", background:"#E8F5EE", border:"none", color:"#00904C", fontSize:"11px", fontWeight:600, cursor:"pointer" }}>
                  
                </button>
              </div>

              <div className="histo-body">
                {histoLoading && <div style={{ textAlign:"center", padding:"20px", color:"#6B9A7A", fontSize:"13px" }}>⏳ Chargement...</div>}
                {!histoLoading && histoErreur && <div style={{ background:"#FFF0F0", borderRadius:"8px", padding:"12px", color:"#CC3333", fontSize:"12px", marginTop:"12px" }}>{histoErreur}</div>}
                {!histoLoading && !histoErreur && historique.length===0 && (
                  <div style={{ textAlign:"center", padding:"28px 12px", color:"#6B9A7A" }}>
                    <div style={{ fontSize:"28px", marginBottom:"8px" }}></div>
                    <p style={{ fontSize:"12px" }}>Aucune recherche enregistrée.</p>
                  </div>
                )}
                {!histoLoading && !histoErreur && historique.length>0 && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px", paddingTop:"12px" }}>
                    {historique.map((h, i) => (
                      <div key={h._id||i} style={{ background:"#F8FBF8", border:"1px solid #E2EDE6", borderRadius:"10px", padding:"12px 14px" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                          <div style={{ fontWeight:700, fontSize:"12px", color:"#0A2410" }}>{h.description||"Recherche"}</div>
                          <span style={{ background:"rgba(0,144,76,0.08)", color:"#00904C", borderRadius:"100px", padding:"2px 8px", fontSize:"10px", fontWeight:700, flexShrink:0, marginLeft:"6px" }}>
                            {h.nbResultats??0} rés.
                          </span>
                        </div>
                        <div style={{ fontSize:"10px", color:"#6B9A7A", marginBottom:"8px" }}>
                          {h.createdAt?new Date(h.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"})+" à "+new Date(h.createdAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"—"}
                        </div>
                        {h.criteres && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"8px" }}>
                            {Object.entries(h.criteres).filter(([,v])=>v).map(([k,v])=>(
                              <span key={k} style={{ background:"#E6F4EC", color:"#00904C", borderRadius:"100px", padding:"1px 8px", fontSize:"10px", fontWeight:600 }}>{k}: {v}</span>
                            ))}
                          </div>
                        )}
                        {replayMessage.id===h._id&&replayMessage.texte&&(
                          <div style={{ padding:"6px 8px", borderRadius:"6px", fontSize:"11px", marginBottom:"6px", background:replayMessage.type==="succes"?"#E6F4EC":"#FFF0F0", color:replayMessage.type==="succes"?"#00904C":"#CC3333" }}>{replayMessage.texte}</div>
                        )}
                        <button onClick={()=>relancerRecherche(h)} disabled={replayLoadingId===h._id}
                          style={{ padding:"5px 12px", borderRadius:"7px", fontSize:"11px", fontWeight:700, cursor:"pointer", background:"rgba(0,144,76,0.08)", color:"#00904C", border:"1px solid rgba(0,144,76,0.2)", opacity:replayLoadingId===h._id?0.6:1 }}>
                          {replayLoadingId===h._id?" Vérification...":" Relancer"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
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