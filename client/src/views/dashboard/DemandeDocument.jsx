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

const REGIONS_GEO = [
  { label:"Centre",           value:"Centre"           },
  { label:"Hauts-Bassins",    value:"Hauts-bassins"    },
  { label:"Est",              value:"Est"              },
  { label:"Nord",             value:"Nord"             },
  { label:"Boucle du Mouhoun",value:"Boucle du Mouhoun"},
  { label:"Sahel",            value:"Sahel"            },
  { label:"Sud-Ouest",        value:"Sud-Ouest"        },
  { label:"Centre-Nord",      value:"Centre-Nord"      },
  { label:"Centre-Est",       value:"Centre-Est"       },
  { label:"Centre-Ouest",     value:"Centre-Ouest"     },
  { label:"Plateau-Central",  value:"Plateau-Central"  },
  { label:"Centre-Sud",       value:"Centre-Sud"       },
  { label:"Cascades",         value:"Cascades"         },
];

const REGIONS_VILLES = [
  { label:"Ouagadougou",   value:"OUAGADOUGOU"   },
  { label:"Bobo-Dioulasso",value:"BOBO-DIOULASSO" },
  { label:"Koudougou",     value:"KOUDOUGOU"      },
  { label:"Banfora",       value:"BANFORA"        },
  { label:"Ouahigouya",    value:"OUAHIGOUYA"     },
  { label:"Kaya",          value:"KAYA"           },
  { label:"Fada N'Gourma", value:"FADA"           },
  { label:"Dédougou",      value:"DEDOUGOU"       },
  { label:"Tenkodogo",     value:"TENKODOGO"      },
  { label:"Ziniaré",       value:"ZINIARE"        },
  { label:"Manga",         value:"MANGA"          },
  { label:"Dori",          value:"DORI"           },
  { label:"Gaoua",         value:"GAOUA"          },
  { label:"Nouna",         value:"NOUNA"          },
];

const REGIONS = REGIONS_VILLES;

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

const SECTEURS_DOUANE = SECTEURS.filter(s => s.code !== "S");

const PRODUITS_IMPORT = [
  { code:"P001", label:"Riz paddy" }, { code:"P002", label:"Huile de palme" },
  { code:"P003", label:"Ciment Portland" }, { code:"P004", label:"Véhicules utilitaires" },
  { code:"P005", label:"Médicaments génériques" }, { code:"P006", label:"Engrais NPK" },
  { code:"P007", label:"Textiles coton" }, { code:"P008", label:"Matériel informatique" },
  { code:"P009", label:"Sucre raffiné" }, { code:"P010", label:"Groupes électrogènes" },
  { code:"P011", label:"Farine de blé" }, { code:"P012", label:"Tôles ondulées zinc" },
  { code:"P013", label:"Pièces automobiles" }, { code:"P014", label:"Câbles électriques" },
  { code:"P015", label:"Produits chimiques agricoles" }, { code:"P016", label:"Matériel médical" },
  { code:"P017", label:"Téléphones mobiles" }, { code:"P018", label:"Huile moteur" },
  { code:"P019", label:"Papier bureau" }, { code:"P020", label:"Peintures industrielles" },
  { code:"P021", label:"Pneumatiques poids lourds" }, { code:"P022", label:"Savons et détergents" },
  { code:"P023", label:"Générateurs solaires" }, { code:"P024", label:"Aliments bétail" },
  { code:"P025", label:"Bouteilles gaz GPL" },
];

const PRODUITS_EXPORT = [
  { code:"P101", label:"Coton fibre" }, { code:"P102", label:"Or brut" },
  { code:"P103", label:"Sésame graines" }, { code:"P104", label:"Noix de cajou" },
  { code:"P105", label:"Beurre de karité" }, { code:"P106", label:"Zinc minerai" },
  { code:"P107", label:"Haricots verts" }, { code:"P108", label:"Mangues fraîches" },
  { code:"P109", label:"Cuir tanné" }, { code:"P110", label:"Arachides décortiquées" },
  { code:"P111", label:"Gomme arabique" }, { code:"P112", label:"Neem feuilles poudre" },
  { code:"P113", label:"Charbon de bois" }, { code:"P114", label:"Artisanat bronze" },
  { code:"P115", label:"Niébé séché" }, { code:"P116", label:"Coton graine" },
  { code:"P117", label:"Maïs grain" }, { code:"P118", label:"Bois de rose sculpture" },
  { code:"P119", label:"Sorgho grain" }, { code:"P120", label:"Peau bovine brute" },
  { code:"P121", label:"Zinc raffiné lingots" }, { code:"P122", label:"Poudre de baobab" },
  { code:"P123", label:"Coton écru tissu" }, { code:"P124", label:"Mil grain" },
  { code:"P125", label:"Igname fraîche" },
];

const PROVINCES_DOUANE = [
  { label:"Kadiogo (Ouagadougou)", value:"KADIOGO" },
  { label:"Houet (Bobo-Dioulasso)", value:"HOUET"  },
];

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

function genererEtTelechargerPDF(resultats, total, mode, titre, periode) {
  const now = new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
  const timestamp = new Date().getTime();
  const estAssociation = mode === "association" || (Array.isArray(resultats) && resultats[0]?.code_ass);
  const siteUrl = window.location.origin || "https://www.cci.bf";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(siteUrl)}&format=png`;
  
  const lignes = resultats.map((item, i) => {
    const nom = item.denomination || item.nom_commercial || item.nom || "—";
    const id1 = item.rccm || item.recepisse || "—";
    const id2 = item.ifu || "—";
    const contact = [item.email, item.telephone_fixe, item.telephone_mobile].filter(Boolean).join(" | ") || "—";
    const localisation = item.region || item.adresse_siege || item.adresse || "—";
    const statut = item.etat ? (item.etat === "A" ? "Actif" : "Inactif") : (item.statut_validite === "1" || item.statut_validite === "A" ? "Valide" : (item.statut_validite ? "Non valide" : "—"));
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
  .footer{margin-top:16px;padding:12px 0;border-top:2px solid #e0ede6;display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#6B9A7A}
  .footer-left{flex:1}
  .footer-right{display:flex;align-items:center;gap:12px;padding-left:12px;border-left:1px solid #e0ede6}
  .qr-code-box{display:flex;flex-direction:column;align-items:center;gap:3px}
  .qr-code-box img{width:90px;height:90px;border:1px solid #ddd;padding:2px;background:#fff}
  .qr-label{font-size:8px;font-weight:700;color:#6B9A7A;text-transform:uppercase;letter-spacing:0.05em}
  .auth-badge{background:#E8F5EE;color:#1A7A40;border:1px solid #4DC97A;border-radius:4px;padding:4px 8px;font-size:8px;font-weight:700;text-align:center;white-space:nowrap}
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
  <div class="footer">
    <div class="footer-left">
      <div>© CCI-BF — Tous droits réservés</div>
      <div>+226 25 30 61 22 · www.cci.bf</div>
    </div>
    <div class="footer-right">
      <div class="qr-code-box">
        <img src="${qrCodeUrl}" alt="QR Code"/>
        <div class="qr-label">Vérifier</div>
      </div>
      <div class="auth-badge"> DOCUMENT OFFICIEL CCI-BF<br/>Généré automatiquement<br/>${now}</div>
    </div>
  </div>
  <script>window.onload=function(){window.print()};</script></body></html>`;
  const popup = window.open("","_blank","width=1200,height=800");
  if (popup) { popup.document.write(html); popup.document.close(); }
}

function genererStatsPDF(resultatNere, typeObj, getPeriodeLabel) {
  const now = new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" });
  const siteUrl = window.location.origin || "https://www.cci.bf";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(siteUrl)}&format=png`;
  
  const resultats = resultatNere?.multi ? resultatNere.resultats : [{ type:"stats", ...resultatNere }];
  const LABELS = {
    stat_entreprises:  { titre:"Statistiques Entreprises",  couleur:"#00904C" },
    stat_associations: { titre:"Statistiques Associations",  couleur:"#1E60CC" },
    stat_importations: { titre:"Statistiques Importations", couleur:"#D4A830" },
    stat_exportations: { titre:"Statistiques Exportations", couleur:"#CC3333" },
  };
  let sections = resultats.map(stat => {
    const meta = LABELS[stat.type] || LABELS.stat_entreprises;
    const breakdowns = [
      { title: "Produits", items: stat.data?.par_produit, field: "produit" },
      { title: "Provinces", items: stat.data?.par_province, field: "province" },
      { title: "Régions", items: stat.data?.par_region, field: "region" },
      { title: "Catégories", items: stat.data?.par_categorie, field: "categorie" },
    ];
    const breakdownHtml = breakdowns.map(({ title, items, field }) => {
      if (!items?.length) return "";
      let rows = "";
      items.slice(0, 20).forEach((r, i) => {
        rows += `<tr style="background:${i % 2 === 0 ? "#fff" : "#f9f9f9"}">
          <td style="padding:6px 10px;border-bottom:1px solid #eee">${r[field] || "—"}</td>
          <td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:${meta.couleur}">${r.nb?.toLocaleString("fr-FR") || "—"}</td>
          ${r.valeur_totale ? `<td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:right">${Number(r.valeur_totale).toLocaleString("fr-FR")} FCFA</td>` : ""}
        </tr>`;
      });
      return `<div style="margin-top:16px">
        <div style="margin-bottom:10px;font-size:11px;color:${meta.couleur};font-weight:700;text-transform:uppercase">${title}</div>
        <table style="width:100%;border-collapse:collapse"><thead><tr style="background:${meta.couleur}22">
          <th style="padding:7px 10px;text-align:left;font-size:10px;color:${meta.couleur};text-transform:uppercase">${title}</th>
          <th style="padding:7px 10px;text-align:right;font-size:10px;color:${meta.couleur};text-transform:uppercase">Nombre</th>
          ${items.some(item => item.valeur_totale) ? `<th style="padding:7px 10px;text-align:right;font-size:10px;color:${meta.couleur};text-transform:uppercase">Valeur</th>` : ""}
        </tr></thead><tbody>${rows}</tbody></table>
      </div>`;
    }).join("");
    return `<div style="margin-bottom:24px;border:1px solid ${meta.couleur}44;border-radius:8px;overflow:hidden;page-break-inside:avoid">
      <div style="background:${meta.couleur};padding:10px 16px;color:#fff;font-weight:800;font-size:14px">${meta.titre}</div>
      <div style="padding:14px 16px;background:#f9fdf9;display:flex;gap:24px;flex-wrap:wrap">
        <div><div style="font-size:10px;color:#6B9A7A;text-transform:uppercase;font-weight:700">Total</div>
        <div style="font-size:26px;font-weight:900;color:${meta.couleur}">${stat.data?.total?.toLocaleString("fr-FR")||"—"}</div></div>
        ${stat.data?.valeur_totale?`<div><div style="font-size:10px;color:#6B9A7A;text-transform:uppercase;font-weight:700">Valeur totale</div>
        <div style="font-size:18px;font-weight:800;color:${meta.couleur}">${Number(stat.data.valeur_totale).toLocaleString("fr-FR")} FCFA</div></div>`:""}
      </div>
      ${breakdownHtml}
    </div>`;
  }).join("");
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/><title>Statistiques NERE</title>
  <style>@page{size:A4 portrait;margin:15mm 12mm}*{font-family:Arial,Helvetica,sans-serif;box-sizing:border-box}body{margin:0;padding:0;font-size:12px;color:#1A2E1F}
  .header{background:#00904C;color:#fff;padding:14px 20px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center}
  .header h1{margin:0;font-size:18px;font-weight:900}.header p{margin:3px 0 0;font-size:10px;opacity:.75}
  .meta{background:#f5faf7;border:1px solid #c0deca;border-top:none;padding:10px 20px;display:flex;gap:24px;margin-bottom:20px}
  .meta-item span:first-child{display:block;font-size:9px;font-weight:700;color:#6B9A7A;text-transform:uppercase}
  .meta-item span:last-child{display:block;font-size:13px;font-weight:800;color:#00904C}
  .footer{margin-top:16px;padding:12px 0;border-top:2px solid #e0ede6;display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#6B9A7A}
  .footer-left{flex:1}
  .footer-right{display:flex;align-items:center;gap:12px;padding-left:12px;border-left:1px solid #e0ede6}
  .qr-code-box{display:flex;flex-direction:column;align-items:center;gap:3px}
  .qr-code-box img{width:90px;height:90px;border:1px solid #ddd;padding:2px;background:#fff}
  .qr-label{font-size:8px;font-weight:700;color:#6B9A7A;text-transform:uppercase;letter-spacing:0.05em}
  .auth-badge{background:#E8F5EE;color:#1A7A40;border:1px solid #4DC97A;border-radius:4px;padding:4px 8px;font-size:8px;font-weight:700;text-align:center;white-space:nowrap}
  @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head>
  <body><div class="header"><div><h1>FICHIER NERE — CCI-BF</h1><p>Chambre de Commerce et d'Industrie du Burkina Faso</p></div>
  <div style="text-align:right;font-size:11px;opacity:.85"><div>Date : <strong>${now}</strong></div></div></div>
  <div class="meta"><div class="meta-item"><span>Type</span><span>${typeObj?.label||"Statistiques"}</span></div>
  <div class="meta-item"><span>Période</span><span>${getPeriodeLabel()}</span></div></div>
  ${sections}
  <div class="footer">
    <div class="footer-left">
      <div>© CCI-BF — Tous droits réservés</div>
      <div>+226 25 30 61 22 · www.cci.bf</div>
    </div>
    <div class="footer-right">
      <div class="qr-code-box">
        <img src="${qrCodeUrl}" alt="QR Code"/>
        <div class="qr-label">Vérifier</div>
      </div>
      <div class="auth-badge"> DOCUMENT OFFICIEL CCI-BF<br/>Généré automatiquement<br/>${now}</div>
    </div>
  </div>
  <script>window.onload=function(){window.print()};</script></body></html>`;
  const popup = window.open("","_blank","width=900,height=800");
  if (popup) { popup.document.write(html); popup.document.close(); }
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

function genererMessageChat(typeRequete, sousType, user, form) {
  const sousTypeValue = Array.isArray(sousType) ? sousType[0] : sousType;
  const sousTypeLabel = TYPES_REQUETES.find(t=>t.id===typeRequete)?.sousTypes?.find(s=>s.value===sousTypeValue)?.label||"";
  const coordonnees = [
    user?.prenom&&user?.nom?`• Nom : ${user.prenom} ${user.nom}`:"",
    user?.email?`• Email : ${user.email}`:"",
    user?.telephone?`• Téléphone : ${user.telephone}`:"",
    user?.fonction?`• Fonction : ${user.fonction}`:"",
  ].filter(Boolean).join("\n");
  if (typeRequete==="autre_specifique") return `Demande spécifique personnalisée\nBonjour,\n\nJe souhaite faire une demande spécifique auprès de la CCI-BF.\n\nMes coordonnées :\n${coordonnees}\n${form?.description?`\nMa demande :\n${form.description}`:""}\n\nMerci de me contacter pour traiter cette demande.`;
  if (typeRequete==="autre") return `Demande de Répertoire Thématique\nBonjour,\nJe souhaite obtenir un répertoire thématique personnalisé auprès de la CCI-BF.\nMes coordonnées :\n${coordonnees}\n${form?.description?`\nPrécisions : ${form.description}`:""}\nMerci de me contacter pour convenir d'un rendez-vous au siège CCI-BF.`;
  if (typeRequete==="fiche") return `Demande de Fiche — ${sousTypeLabel||"Entreprise / Association"}\nBonjour,\n\nJe souhaite obtenir une fiche complète pour : ${sousTypeLabel||"une entreprise / association"}.\n\nMes coordonnées :\n${coordonnees}\n${form?.description?`\nPrécisions : ${form.description}`:""}\n\nMerci de me contacter pour convenir d'un rendez-vous au siège CCI-BF.`;
  return "";
}

export default function DemandeDocument() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "null");

  const [menuOpen, setMenuOpen]     = useState(false);
  const [onglet, setOnglet]         = useState("nouvelle");
  const [etape, setEtape]           = useState(1);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [erreur, setErreur]         = useState("");
  const [solde, setSolde]           = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [coutRequete, setCoutRequete] = useState(0);
  const [resultatNere, setResultatNere] = useState(null);

  // ── HISTORIQUE intégré — visible et rétractable ──

  const [demandes, setDemandes]                 = useState([]);
  const [demandesLoading, setDemandesLoading]   = useState(false);
  const [demandesErreur, setDemandesErreur]     = useState("");
  const [filtreStatut, setFiltreStatut]         = useState("tous");
  const [annulationId, setAnnulationId]         = useState(null);
  const [actionMessage, setActionMessage]       = useState({ id:null, texte:"", type:"" });

  const [form, setForm] = useState({
    typeRequete:"", sousType:[], quantite:"",
    regions:[], villes:"", formesJuridiques:[], tranches:[],
    secteur:"", sousCategories:[],
    produitDouane:"", provinceDouane:"",
    description:"", contact:user?.email||"", telephone:"",
  });
  const [secteurOuvert, setSecteurOuvert] = useState(null);

  const [periodeType, setPeriodeType]         = useState("annee_courante");
  const [anneeSpecifique, setAnneeSpecifique] = useState(String(ANNEE_COURANTE));
  const [anneeDebut, setAnneeDebut]           = useState("2020");
  const [anneeFin, setAnneeFin]               = useState(String(ANNEE_COURANTE));

  const typeObj  = TYPES_REQUETES.find(t => t.id === form.typeRequete);
  const isDirect = typeObj?.direct !== false;
  const isChat   = form.typeRequete === "autre" || form.typeRequete === "fiche" || form.typeRequete === "autre_specifique";
  const montant  = typeObj?.prix && form.quantite && form.typeRequete !== "statistique" && isDirect
    ? typeObj.prix * parseInt(form.quantite || 0) : null;
  const nbCriteres = form.regions.length + form.formesJuridiques.length + form.tranches.length;

  const estListeAssociation = form.typeRequete === "liste" &&
    (Array.isArray(form.sousType) ? form.sousType[0] : form.sousType) === "liste_associations";
  const estStatDouane = form.typeRequete === "statistique" &&
    form.sousType.some(st => ["stat_importations","stat_exportations"].includes(st)) &&
    !form.sousType.some(st => ["stat_entreprises","stat_associations"].includes(st));
  const estStatAssociation = form.typeRequete === "statistique" &&
    form.sousType.includes("stat_associations") &&
    !form.sousType.some(st => ["stat_importations","stat_exportations","stat_entreprises"].includes(st));

  const initiales = user ? `${user.prenom?.[0]||""}${user.nom?.[0]||""}`.toUpperCase() : "";

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

  // Charger l'historique au montage et à chaque fois qu'on est sur "nouvelle"
  useEffect(() => {
    chargerDemandes();
  }, [chargerDemandes]);

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

  const redirecterVersChat = async () => {
    const token = localStorage.getItem("token");
    setLoading(true); setErreur("");
    try {
      if (form.typeRequete === "autre_specifique") {
        setLoading(false);
        const msg = genererMessageChat(form.typeRequete, form.sousType, user, form);
        navigate("/chat", { state:{ messagePredefini:msg } });
        return;
      }
      const cout = form.typeRequete === "fiche" ? 1000 : 5000;
      const res  = await fetch(`${API}/abonnements/deduire`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ typeRequete:form.typeRequete==="fiche"?"fiche":"autre", quantite:1, description:`Demande ${form.typeRequete==="fiche"?"Fiche":"Répertoire Thématique"}` }),
      });
      const data = await res.json();
      if (!data.success && data.code === "SOLDE_INSUFFISANT") { setCoutRequete(data.cout||cout); setShowUpgrade(true); setLoading(false); return; }
      if (!data.success && data.code === "NO_ABO") { setErreur("Aucun abonnement actif. Veuillez souscrire à une formule."); setLoading(false); return; }
    } catch {}
    setLoading(false);
    const msg = genererMessageChat(form.typeRequete, form.sousType, user, form);
    navigate("/chat", { state:{ messagePredefini:msg } });
  };

  const soumettre = async () => {
    if (isChat) { redirecterVersChat(); return; }
    setLoading(true); setErreur("");
    const token = localStorage.getItem("token");
    try {
      const quantiteEnvoyee = form.typeRequete === "statistique" ? 1 : parseInt(form.quantite||1);
      const deductRes = await fetch(`${API}/abonnements/deduire`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ typeRequete:form.typeRequete, quantite:quantiteEnvoyee, description:`Requête ${typeObj?.label}` }),
      });
      const deductData = await deductRes.json();
      if (!deductData.success && deductData.code === "SOLDE_INSUFFISANT") { setCoutRequete(deductData.cout||montant||0); setShowUpgrade(true); setLoading(false); return; }
      if (deductData.success) setSolde(s => ({...(s||{}), solde:deductData.data?.solde}));

      const params = new URLSearchParams({ limit:Math.min(quantiteEnvoyee,50), page:1 });
      if (form.regions.length>0)          params.append("region",         form.regions[0]);
      if (form.formesJuridiques.length>0) params.append("forme_juridique",form.formesJuridiques[0]);
      if (form.villes)                    params.append("commune",         form.villes);
      if (form.sousCategories.length>0)   params.append("sous_categorie", form.sousCategories[0]);
      if (form.produitDouane)             params.append("code_prd",        form.produitDouane);
      if (form.provinceDouane)            params.append("province",        form.provinceDouane);
      if (form.tranches.length>0) {
        const t = form.tranches[0];
        if (t!=="500+") { const [min,max]=t.split("-"); params.append("effectif_min",min); params.append("effectif_max",max); }
        else params.append("effectif_min","500");
      }

      let nereData = null;
      if (form.typeRequete==="statistique") {
        const sousTypes = Array.isArray(form.sousType)?form.sousType:[form.sousType];
        const STAT_ROUTES = { stat_entreprises:`${API}/nere/statistiques`, stat_associations:`${API}/nere/statistiques/associations`, stat_importations:`${API}/nere/statistiques/importations`, stat_exportations:`${API}/nere/statistiques/exportations` };
        const resultats = await Promise.all(sousTypes.map(st => fetch(STAT_ROUTES[st]||`${API}/nere/statistiques`,{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(d=>({type:st,...d}))));
        nereData = { success:true, multi:true, resultats };
      } else if (["liste_associations"].includes(Array.isArray(form.sousType)?form.sousType[0]:form.sousType)) {
        const r = await fetch(`${API}/nere/associations?${params}`,{headers:{Authorization:`Bearer ${token}`}});
        nereData = await r.json();
      } else {
        const r = await fetch(`${API}/nere/multicritere?${params}`,{headers:{Authorization:`Bearer ${token}`}});
        nereData = await r.json();
      }

      setResultatNere(nereData);
      const demandeRes = await fetch(`${API}/demandes`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({ typeRequete:form.typeRequete, sousType:form.sousType, quantite:quantiteEnvoyee, regions:form.regions, villes:form.villes, formesJuridiques:form.formesJuridiques, tranches:form.tranches, sousCategories:form.sousCategories, description:form.description, contact:form.contact, telephone:form.telephone, montantEstime:form.typeRequete==="statistique"?5000:montant, statut:"traite" }),
      });
      const demandeData = await demandeRes.json();
      if (!demandeData.success) {
        throw new Error(demandeData.message || "Erreur lors de la création de la demande");
      }
      // Recharger l'historique après soumission
      chargerDemandes();
      setSuccess(true);
    } catch(e) { setErreur(`Erreur : ${e.message}`); }
    finally { setLoading(false); }
  };

  const annulerDemande = async (id) => {
    if (!window.confirm("Confirmer l'annulation ?")) return;
    setAnnulationId(id);
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch(`${API}/demandes/${id}/annuler`,{method:"PUT",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"}});
      const data = await res.json();
      setActionMessage({ id, texte:data.success?"Annulée.":data.message, type:data.success?"succes":"erreur" });
      if (data.success) chargerDemandes();
    } catch { setActionMessage({ id, texte:"Erreur serveur.", type:"erreur" }); }
    setAnnulationId(null);
    setTimeout(()=>setActionMessage({id:null,texte:"",type:""}),4000);
  };

  const reset = () => {
    setSuccess(false); setEtape(1); setResultatNere(null); setErreur("");
    setForm({ typeRequete:"", sousType:[], quantite:"", regions:[], villes:"", formesJuridiques:[], tranches:[], produitDouane:"", provinceDouane:"", description:"", contact:user?.email||"", telephone:"" });
  };

  const demandesFiltrees = filtreStatut==="tous" ? demandes : demandes.filter(d=>d.statut===filtreStatut);

  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#F5FAF7", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#fff", borderRadius:"20px", padding:"48px", maxWidth:"440px", textAlign:"center" }}>
        <div style={{ fontSize:"48px", marginBottom:"20px" }}></div>
        <h2 style={{ color:"#0A3D1F", marginBottom:"12px" }}>Service réservé aux abonnés</h2>
        <p style={{ color:"#6B9A7A", marginBottom:"28px" }}>Connectez-vous pour accéder aux demandes de données NERE.</p>
        <button onClick={()=>navigate("/connexion")} style={{ width:"100%", padding:"14px", background:"#00904C", color:"#fff", border:"none", borderRadius:"10px", fontWeight:700, fontSize:"15px", cursor:"pointer", marginBottom:"10px" }}>Se connecter</button>
        <button onClick={()=>navigate("/inscription")} style={{ width:"100%", padding:"14px", background:"#fff", color:"#00904C", border:"2px solid #00904C", borderRadius:"10px", fontWeight:700, fontSize:"15px", cursor:"pointer" }}>Créer un compte</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Arial, Helvetica, sans-serif" }}>
      <style>{`
        * { font-family: Arial, Helvetica, sans-serif !important; }
        @keyframes slideDown { 0% { opacity:0.4; transform:translateY(-8px); } 50% { opacity:1; } 100% { opacity:0.4; transform:translateY(8px); } }
        @keyframes pulse { 0%, 100% { opacity:1; } 50% { opacity:0.5; } }
        .arrow-indicator { animation: slideDown 2s infinite; font-size:24px; display:inline-block; }
        .required-badge { background:#E85555; color:#fff; border-radius:100px; padding:2px 8px; font-size:10px; font-weight:700; text-transform:uppercase; margin-left:6px; }
        .optional-badge { background:#B0C3B0; color:#0A2410; border-radius:100px; padding:2px 8px; font-size:10px; font-weight:600; text-transform:uppercase; margin-left:6px; opacity:0.7; }
        .step-chevron { display:inline-flex; align-items:center; justify-content:center; margin:0 12px; }
        .section-guide { position:relative; padding-left:24px; }
        .section-guide::before { content:'→'; position:absolute; left:0; font-size:16px; color:var(--green-light); font-weight:800; }
        .nere-navbar-dem { position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 32px;height:120px;background:#00904C;box-shadow:0 2px 16px rgba(0,0,0,0.15); }
        .nere-navbar-dem .nav-pill { display:flex;align-items:center;gap:3px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:100px;padding:5px 8px;margin-left:auto;margin-right:20px; }
        .nere-navbar-dem .nav-pill .nav-btn { padding:7px 15px;border-radius:100px;font-size:20px;font-weight:600;color:rgba(255,255,255,0.78);cursor:pointer;white-space:nowrap;border:none;background:transparent;font-family:Arial,Helvetica,sans-serif; }
        .nere-navbar-dem .nav-pill .nav-btn:hover { color:#fff;background:rgba(255,255,255,0.12); }
        .nere-navbar-dem .nav-pill .nav-btn.active { color:#0A3D1F;background:#4DC97A;font-weight:700;box-shadow:0 2px 8px rgba(77,201,122,0.4); }
        .nere-navbar-dem .u-chip { display:flex;align-items:center;gap:8px;padding:5px 12px 5px 5px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:100px;cursor:pointer;color:#fff;font-size:13px;font-weight:600;flex-shrink:0; }
        .nere-navbar-dem .u-chip:hover { background:rgba(255,255,255,0.18); }
        .nere-navbar-dem .u-avatar { width:30px;height:30px;border-radius:50%;background:#4DC97A;color:#0A3D1F;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0; }
        .nere-dropdown-dem { position:absolute;z-index:9999;top:calc(100% + 10px);right:0;background:#fff;border-radius:16px;border:1px solid #E2EDE6;min-width:220px;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,0.14); }
        .nere-dropdown-dem .dd-head { padding:14px 18px 10px;border-bottom:1px solid #F0F4F1;background:linear-gradient(135deg,#F5FAF7,#fff); }
        .nere-dropdown-dem .dd-name { font-weight:800;color:#0A3D1F;font-size:14px; }
        .nere-dropdown-dem .dd-email { font-size:12px;color:#6B9A7A;margin-top:2px; }
        .nere-dropdown-dem .dd-role { display:inline-flex;align-items:center;gap:5px;margin-top:6px;background:#E8F5EE;color:#00904C;border-radius:100px;padding:3px 10px;font-size:10px;font-weight:700;text-transform:uppercase; }
        .nere-dropdown-dem .dd-item { padding:10px 18px;font-size:13px;color:#0A3D1F;cursor:pointer; }
        .nere-dropdown-dem .dd-item:hover { background:#F5FAF7; }
        .nere-dropdown-dem .dd-danger { color:#CC3333; }
        .nere-dropdown-dem .dd-danger:hover { background:#FFF0F0 !important; }
        .nere-dropdown-dem .dd-sep { height:1px;background:#F0F4F1;margin:4px 0; }

        /* Historique rétractable */
        .historique-panel { background:#fff;border-radius:14px;border:1px solid #E2EDE6;overflow:hidden;position:sticky;top:140px; }
        .historique-header { display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #F0F4F1; }
        .historique-header:hover { background:#F7FAF8; }
        
        /* Indicateurs de progression */
        .step-progress { display:inline-flex;align-items:center;gap:6px;background:rgba(0,144,76,0.1);color:#00904C;padding:6px 12px;border-radius:100px;font-size:11px;font-weight:700;text-transform:uppercase }
        .field-indicator { margin-left:auto;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600 }
        .field-required { color:#E85555;background:rgba(232,85,85,0.08);padding:2px 6px;border-radius:4px }
        .field-optional { color:#9DB39D;background:rgba(157,179,157,0.1);padding:2px 6px;border-radius:4px }
      `}</style>

      <div className="dash-bg"><div className="grid"/></div>
      <div style={{ position:"relative", zIndex:1 }}>

        {/* ══ NAVBAR ══ */}
        <nav className="nere-navbar-dem">
          <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
            <img src={logoNERE} alt="NERE" style={{ height:"80px", width:"auto", borderRadius:"6px", flexShrink:0, backgroundColor:"#fff", padding:"4px" }}/>
            <div style={{ display:"flex", flexDirection:"column", lineHeight:1.35 }}>
              <span style={{ fontSize:"18px", fontWeight:800, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase" }}>Fichier NERE</span>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.65)" }}>Registre national des entreprises</span>
            </div>
          </div>
          <div className="nav-pill">
            {NAV_LINKS.map(link => (
              <button key={link.key} className={`nav-btn ${link.key==="demande"?"active":""}`} onClick={()=>navigate(link.path)}>{link.label}</button>
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
                  <div className="nere-dropdown-dem" onClick={e=>e.stopPropagation()}>
                    <div className="dd-head">
                      <div className="dd-name">{user.prenom} {user.nom}</div>
                      <div className="dd-email">{user.email||"—"}</div>
                      <div className="dd-role">{user.role==="admin"?"Admin":user.role==="manager"?"Gestionnaire":"Abonné"}</div>
                    </div>
                    <div style={{ padding:"6px 0" }}>
                      {[{label:"Mon Profil",path:"/profil"},{label:"Mon Abonnement",path:"/paiement"}].map(item=>(
                        <div key={item.label} className="dd-item" onClick={()=>{navigate(item.path);setMenuOpen(false);}}>{item.label}</div>
                      ))}
                      {user.role==="admin" && <div className="dd-item" onClick={()=>{navigate("/admin");setMenuOpen(false);}}>Tableau de bord</div>}
                      {user.role==="manager" && <div className="dd-item" onClick={()=>{navigate("/gestionnaire");setMenuOpen(false);}}>Tableau de bord</div>}
                      <div className="dd-sep"/>
                      <div className="dd-item dd-danger" onClick={handleLogout}>Déconnexion</div>
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
              <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:"10px", padding:"8px 16px", display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ fontSize:"11px", color:"rgba(255,255,255,0.6)", textTransform:"uppercase" }}>Solde</span>
                <span style={{ fontWeight:800, fontSize:"18px", color:solde.solde<2000?"#FF8080":solde.solde<5000?"#D4A830":"#4DC97A" }}>
                  {solde.solde?.toLocaleString("fr-FR")} FCFA
                </span>
              </div>
            )}
          </div>
          <h1 className="pub-page-title" style={{ fontSize:"26px", textAlign:"left", marginBottom:"10px" }}>Demande de données officielles</h1>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {TYPES_REQUETES.map(t=>(
              <span key={t.id} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"100px", padding:"4px 12px", fontSize:"11px", color:"rgba(255,255,255,0.8)" }}>
                {t.label}{t.prix?` — ${t.id==="statistique"?`${t.prix.toLocaleString()} FCFA forfait`:`${t.prix.toLocaleString()} FCFA/${t.unite}`}`:" — Via messagerie"}
              </span>
            ))}
          </div>
        </div>

        {/* ══ MODAL SOLDE INSUFFISANT ══ */}
        {showUpgrade && (
          <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
            <div style={{ background:"#fff", borderRadius:"20px", padding:"36px", maxWidth:"420px", width:"100%", textAlign:"center" }}>
              <div style={{ fontSize:"48px", marginBottom:"16px" }}></div>
              <h3 style={{ fontSize:"22px", color:"#0A3D1F", marginBottom:"8px", fontWeight:800 }}>Solde insuffisant</h3>
              <p style={{ color:"#6B9A7A", fontSize:"14px", lineHeight:1.6, marginBottom:"24px" }}>
                Cette requête coûte <strong style={{ color:"#CC3333" }}>{coutRequete.toLocaleString("fr-FR")} FCFA</strong>.<br/>Rechargez votre compte pour continuer.
              </p>
              <button onClick={()=>{setShowUpgrade(false);navigate("/formules");}} style={{ width:"100%", padding:"13px", borderRadius:"10px", background:"#00904C", color:"#fff", border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer", marginBottom:"10px" }}>Voir les formules →</button>
              <button onClick={()=>setShowUpgrade(false)} style={{ color:"#6B9A7A", background:"none", border:"none", cursor:"pointer", fontSize:"13px" }}>Annuler</button>
            </div>
          </div>
        )}

        {/* ══ ONGLETS — seulement 2 ══ */}
        <div style={{ background:"#fff", borderBottom:"1px solid var(--border)", padding:"0 48px", display:"flex" }}>
          {[
            { key:"recherche_simple", label:" Recherche par critère", path:"/recherche-entreprise" },
            { key:"nouvelle",         label:"Recherche multi-critères" },
          ].map(o=>(
            <button key={o.key}
              onClick={()=> o.path ? navigate(o.path) : setOnglet(o.key)}
              style={{ padding:"14px 24px", background:"transparent", border:"none",
                borderBottom: onglet===o.key?"3px solid var(--green-light)":"3px solid transparent",
                color: onglet===o.key?"var(--green-dark)":"var(--text-muted)",
                fontWeight: onglet===o.key?700:500, fontSize:"14px", cursor:"pointer" }}>
              {o.label}
            </button>
          ))}
        </div>

        <div style={{ padding:"32px 48px 60px", background:"var(--off-white)" }}>
          {onglet==="nouvelle" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:"24px", alignItems:"start", maxWidth:"1280px", margin:"0 auto" }}>
              {/* ── Colonne gauche : formulaire ── */}
              <div>

              {/* PAGE SUCCÈS */}
              {success ? (
                <div style={{ background:"#fff", borderRadius:"20px", border:"1px solid var(--border)", padding:"40px", textAlign:"center" }}>
                  <div style={{ fontSize:"56px", marginBottom:"16px" }}></div>
                  <h2 style={{ fontSize:"26px", fontWeight:900, marginBottom:"12px", color:"#00904C" }}>Résultats disponibles !</h2>
                  <p style={{ color:"#6B9A7A", fontSize:"14px", lineHeight:1.8, marginBottom:"24px" }}>
                    Votre demande de <strong>{typeObj?.label}</strong> a été traitée et le montant débité.
                  </p>
                  {(form.typeRequete==="statistique"||montant) && (
                    <div style={{ display:"inline-flex", alignItems:"center", gap:"12px", background:"rgba(0,144,76,0.06)", border:"1px solid rgba(0,144,76,0.18)", borderRadius:"14px", padding:"16px 28px", marginBottom:"24px" }}>
                      <span style={{ fontSize:"24px" }}></span>
                      <div style={{ textAlign:"left" }}>
                        <div style={{ fontSize:"11px", fontWeight:700, color:"#6B9A7A", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"4px" }}>Montant débité</div>
                        <div style={{ fontSize:"24px", fontWeight:900, color:"#00904C" }}>{form.typeRequete==="statistique"?"5 000 FCFA":formaterMontant(montant)}</div>
                      </div>
                    </div>
                  )}

                  {/* Résultats NERE */}
                  {resultatNere && (
                    <div style={{ marginBottom:"28px", textAlign:"left" }}>
                      {form.typeRequete==="statistique" ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                          {(resultatNere?.multi?resultatNere.resultats:[{type:form.sousType[0]||"stat_entreprises",...resultatNere}]).map((stat,idx)=>{
                            const LABELS = { stat_entreprises:{titre:"Statistiques Entreprises",couleur:"#00904C"}, stat_associations:{titre:"Statistiques Associations",couleur:"#1E60CC"}, stat_importations:{titre:"Statistiques Importations",couleur:"#D4A830"}, stat_exportations:{titre:"Statistiques Exportations",couleur:"#E85555"} };
                            const meta = LABELS[stat.type]||LABELS.stat_entreprises;
                            return (
                              <div key={idx} style={{ border:`1px solid ${meta.couleur}33`, borderRadius:"14px", overflow:"hidden" }}>
                                <div style={{ background:meta.couleur, padding:"14px 18px" }}><span style={{ fontWeight:700, color:"#fff" }}>{meta.titre}</span></div>
                                <div style={{ padding:"16px", display:"grid", gridTemplateColumns:"repeat(4, minmax(0, 1fr))", gap:"12px" }}>
                                  <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"16px", textAlign:"center" }}>
                                    <div style={{ fontSize:"11px", color:"#6B9A7A", textTransform:"uppercase", marginBottom:"4px" }}>Total</div>
                                    <div style={{ fontSize:"28px", fontWeight:900, color:meta.couleur }}>{stat.data?.total?.toLocaleString("fr-FR")||"—"}</div>
                                  </div>
                                  {stat.data?.valeur_totale && (
                                    <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"16px", textAlign:"center" }}>
                                      <div style={{ fontSize:"11px", color:"#6B9A7A", textTransform:"uppercase", marginBottom:"4px" }}>Valeur totale</div>
                                      <div style={{ fontSize:"18px", fontWeight:900, color:meta.couleur }}>{Number(stat.data.valeur_totale).toLocaleString("fr-FR")} FCFA</div>
                                    </div>
                                  )}
                                  {stat.data?.poids_total && (
                                    <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"16px", textAlign:"center" }}>
                                      <div style={{ fontSize:"11px", color:"#6B9A7A", textTransform:"uppercase", marginBottom:"4px" }}>Poids total</div>
                                      <div style={{ fontSize:"18px", fontWeight:900, color:meta.couleur }}>{Number(stat.data.poids_total).toLocaleString("fr-FR")} kg</div>
                                    </div>
                                  )}
                                  {(stat.data?.taxes_totales || stat.data?.droits_douane) && (
                                    <div style={{ background:"#F5FAF7", borderRadius:"10px", padding:"16px", textAlign:"center" }}>
                                      <div style={{ fontSize:"11px", color:"#6B9A7A", textTransform:"uppercase", marginBottom:"4px" }}>Taxes / droits</div>
                                      <div style={{ fontSize:"18px", fontWeight:900, color:meta.couleur }}>
                                        {stat.data?.taxes_totales ? Number(stat.data.taxes_totales).toLocaleString("fr-FR") + " FCFA" : ""}
                                        {stat.data?.taxes_totales && stat.data?.droits_douane ? " / " : ""}
                                        {stat.data?.droits_douane ? Number(stat.data.droits_douane).toLocaleString("fr-FR") + " FCFA" : ""}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {(stat.data?.par_produit?.length || stat.data?.par_province?.length || stat.data?.par_region?.length || stat.data?.par_categorie?.length) && (
                                  <div style={{ padding:"0 16px 16px", display:"grid", gap:"16px" }}>
                                    {stat.data?.par_produit?.length > 0 && (
                                      <div>
                                        <div style={{ marginBottom:"10px", fontSize:"13px", fontWeight:700, color:meta.couleur }}>Produits</div>
                                        <div style={{ overflowX:"auto" }}>
                                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                            <thead>
                                              <tr>
                                                <th style={{ textAlign:"left", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Produit</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Nombre</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Valeur</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {stat.data.par_produit.slice(0, 10).map((r,i) => (
                                                <tr key={i} style={{ background:i%2===0?"#fff":"#fbfbfb" }}>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee" }}>{r.produit||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.nb?.toLocaleString("fr-FR")||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.valeur_totale?Number(r.valeur_totale).toLocaleString("fr-FR") + " FCFA":"—"}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                    {stat.data?.par_province?.length > 0 && (
                                      <div>
                                        <div style={{ marginBottom:"10px", fontSize:"13px", fontWeight:700, color:meta.couleur }}>Provinces</div>
                                        <div style={{ overflowX:"auto" }}>
                                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                            <thead>
                                              <tr>
                                                <th style={{ textAlign:"left", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Province</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Nombre</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Valeur</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {stat.data.par_province.slice(0, 10).map((r,i) => (
                                                <tr key={i} style={{ background:i%2===0?"#fff":"#fbfbfb" }}>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee" }}>{r.province||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.nb?.toLocaleString("fr-FR")||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.valeur_totale?Number(r.valeur_totale).toLocaleString("fr-FR") + " FCFA":"—"}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                    {stat.data?.par_region?.length > 0 && (
                                      <div>
                                        <div style={{ marginBottom:"10px", fontSize:"13px", fontWeight:700, color:meta.couleur }}>Régions</div>
                                        <div style={{ overflowX:"auto" }}>
                                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                            <thead>
                                              <tr>
                                                <th style={{ textAlign:"left", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Région</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Nombre</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Valeur</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {stat.data.par_region.slice(0, 10).map((r,i) => (
                                                <tr key={i} style={{ background:i%2===0?"#fff":"#fbfbfb" }}>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee" }}>{r.region||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.nb?.toLocaleString("fr-FR")||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.valeur_totale?Number(r.valeur_totale).toLocaleString("fr-FR") + " FCFA":"—"}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                    {stat.data?.par_categorie?.length > 0 && (
                                      <div>
                                        <div style={{ marginBottom:"10px", fontSize:"13px", fontWeight:700, color:meta.couleur }}>Catégories</div>
                                        <div style={{ overflowX:"auto" }}>
                                          <table style={{ width:"100%", borderCollapse:"collapse" }}>
                                            <thead>
                                              <tr>
                                                <th style={{ textAlign:"left", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Catégorie</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Nombre</th>
                                                <th style={{ textAlign:"right", padding:"8px", fontSize:"11px", color:meta.couleur, textTransform:"uppercase" }}>Valeur</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {stat.data.par_categorie.slice(0, 10).map((r,i) => (
                                                <tr key={i} style={{ background:i%2===0?"#fff":"#fbfbfb" }}>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee" }}>{r.categorie||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.nb?.toLocaleString("fr-FR")||"—"}</td>
                                                  <td style={{ padding:"8px", borderBottom:"1px solid #eee", textAlign:"right" }}>{r.valeur_totale?Number(r.valeur_totale).toLocaleString("fr-FR") + " FCFA":"—"}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : resultatNere.data?.length>0 ? (
                        <div style={{ border:"1px solid rgba(0,144,76,0.15)", borderRadius:"14px", overflow:"hidden" }}>
                          <div style={{ background:"#00904C", padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontWeight:700, color:"#fff" }}>{typeObj?.label} — {resultatNere.total?.toLocaleString("fr-FR")} résultat{resultatNere.total>1?"s":""}</span>
                            <span style={{ fontSize:"12px", color:"rgba(255,255,255,0.7)" }}>{resultatNere.data.length} affichés</span>
                          </div>
                          <div style={{ maxHeight:"500px", overflowY:"auto" }}>
                            {resultatNere.data.map((ent,i)=>(
                              <div key={ent.code_ent||ent.code_ass||i} style={{ padding:"14px 18px", borderBottom:"1px solid rgba(0,144,76,0.08)", background:i%2===0?"#fff":"#F9FCF9" }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                                  <div style={{ fontWeight:700, fontSize:"13px", color:"#0A2410" }}>{ent.denomination||ent.nom_commercial||ent.nom||"—"}</div>
                                  <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
                                    {ent.region && <span style={{ background:"rgba(0,144,76,0.08)", color:"#00904C", borderRadius:"100px", padding:"2px 10px", fontSize:"10px", fontWeight:600 }}>{ent.region}</span>}
                                    {ent.etat && <span style={{ background:ent.etat==="A"?"rgba(77,201,122,0.1)":"rgba(232,85,85,0.1)", color:ent.etat==="A"?"#1A7A40":"#CC3333", borderRadius:"100px", padding:"2px 10px", fontSize:"10px", fontWeight:600 }}>{ent.etat==="A"?"Actif":"Inactif"}</span>}
                                  </div>
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                                  {ent.rccm && <span style={{ fontSize:"10px", color:"#6B9A7A", background:"#F0F4F1", borderRadius:"4px", padding:"2px 8px" }}><strong>RCCM:</strong> {ent.rccm}</span>}
                                  {ent.ifu  && <span style={{ fontSize:"10px", color:"#6B9A7A", background:"#F0F4F1", borderRadius:"4px", padding:"2px 8px" }}><strong>IFU:</strong> {ent.ifu}</span>}
                                </div>
                                {(ent.adresse_siege||ent.adresse) && <div style={{ fontSize:"11px", color:"#6B9A7A", marginTop:"4px" }}> {ent.adresse_siege||ent.adresse}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ background:"#FFF8E6", border:"1px solid #F0D58C", borderRadius:"12px", padding:"16px", fontSize:"13px", color:"#92700A" }}>
                           Aucun résultat trouvé pour ces critères. Le montant a été débité.
                        </div>
                      )}
                    </div>
                  )}

                  {erreur && <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3", borderRadius:"10px", padding:"12px 16px", marginBottom:"16px", color:"#CC3333", fontSize:"13px" }}> {erreur}</div>}

                  <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                    {resultatNere && (
                      <button onClick={()=>{
                        if (form.typeRequete==="statistique") genererStatsPDF(resultatNere,typeObj,getPeriodeLabel);
                        else genererEtTelechargerPDF(resultatNere.data||[],resultatNere.total,Array.isArray(form.sousType)&&form.sousType[0]==="liste_associations"?"association":"entreprise",typeObj?.label,getPeriodeLabel());
                      }} style={{ padding:"13px 28px", borderRadius:"10px", background:"#1E60CC", color:"#fff", border:"none", fontWeight:700, fontSize:"14px", cursor:"pointer" }}>
                         Télécharger PDF
                      </button>
                    )}
                    <button className="btn-save" style={{ padding:"13px 28px" }} onClick={reset}>+ Nouvelle demande</button>
                  </div>
                </div>

              ) : (
                /* FORMULAIRE EN ÉTAPES */
                <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid var(--border)", overflow:"hidden" }}>
                  {/* Barre étapes */}
                  <div style={{ background:"var(--green-deep)", padding:"16px 32px", display:"flex", alignItems:"center" }}>
                    {[{n:1,label:"Type"},{n:2,label:"Critères"},{n:3,label:"Vérif"}].map((s,i)=>(
                      <div key={s.n} style={{ display:"flex", alignItems:"center", flex:i<2?1:"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                          <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:etape>s.n?"var(--green-light)":etape===s.n?"rgba(77,201,122,0.25)":"rgba(255,255,255,0.1)", border:etape===s.n?"3px solid var(--green-light)":"2px solid transparent", color:etape>=s.n?"#fff":"rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:800, flexShrink:0, transition:"all 0.3s ease" }}>{etape>s.n?"":s.n}</div>
                          <span style={{ fontSize:"13px", fontWeight:700, color:etape>=s.n?"#fff":"rgba(255,255,255,0.4)", transition:"color 0.3s ease" }}>{s.label}</span>
                        </div>
                        {i<2 && <div style={{ flex:1, height:"3px", background:etape>s.n?"var(--green-light)":"rgba(255,255,255,0.15)", margin:"0 16px", transition:"all 0.3s ease" }}/>}
                      </div>
                    ))}
                  </div>

                  <div style={{ padding:"32px" }}>
                    {/* ── ÉTAPE 1 ── */}
                    {etape===1 && (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                          <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)" }}>① Quel type de données souhaitez-vous ?</span>
                          <span className="required-badge">obligatoire</span>
                        </div>
                        <p style={{ color:"var(--text-muted)", fontSize:"13px", marginBottom:"20px" }}>
                          <strong>Liste, Statistiques</strong> → résultats immédiats.<br/>
                          <strong>Fiche, Répertoire Thématique</strong> → redirigé vers la messagerie.
                        </p>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"24px" }}>
                          {TYPES_REQUETES.map(t=>(
                            <button key={t.id} onClick={()=>{setForm(f=>({...f,typeRequete:t.id,sousType:[],quantite:"",secteur:"",sousCategories:[]}));setSecteurOuvert(null);}}
                              style={{ padding:"18px 20px", borderRadius:"12px", textAlign:"left", border:form.typeRequete===t.id?`3px solid ${t.couleur}`:"1.5px solid var(--border)", background:form.typeRequete===t.id?"var(--green-pale)":"#fff", cursor:"pointer", position:"relative", transition:"all 0.3s ease" }}>
                              {form.typeRequete===t.id && <div style={{ position:"absolute", top:"10px", right:"12px", width:"18px", height:"18px", borderRadius:"50%", background:t.couleur, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", fontWeight:800 }}> </div>}
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                                <span style={{ fontWeight:800, fontSize:"15px", color:form.typeRequete===t.id?t.couleur:"var(--text-dark)" }}>{t.label}</span>
                                {t.prix ? <span style={{ marginLeft:"auto", fontSize:"11px", fontWeight:700, color:t.couleur }}>{t.id==="statistique"?`${t.prix.toLocaleString()} FCFA forfait`:`${t.prix.toLocaleString()} FCFA/${t.unite}`}</span>
                                  : <span style={{ marginLeft:"auto", fontSize:"11px", fontWeight:700, color:"#1E60CC" }}>Via messagerie</span>}
                              </div>
                              <p style={{ fontSize:"12px", color:"var(--text-muted)", lineHeight:1.5, margin:0 }}>{t.description}</p>
                              {!t.direct && <div style={{ marginTop:"8px", display:"inline-flex", alignItems:"center", gap:"4px", background:"rgba(30,96,204,0.08)", borderRadius:"100px", padding:"3px 10px", fontSize:"10px", color:"#1E60CC", fontWeight:600 }}> Redirigé vers la messagerie</div>}
                            </button>
                          ))}
                        </div>

                        {form.typeRequete && (
                          <div style={{ textAlign:"center", margin:"20px 0", fontSize:"32px" }} className="arrow-indicator">↓</div>
                        )}

                        {typeObj && typeObj.sousTypes.length>0 && (
                          <div style={{ marginBottom:"24px", padding:"20px", background:"rgba(0,144,76,0.04)", borderRadius:"12px", border:"2px solid rgba(0,144,76,0.15)" }}>
                            <label className="profil-label" style={{ display:"block", marginBottom:"10px" }}>
                              <span>② Objet précis</span>
                              <span className="required-badge">obligatoire</span>
                            </label>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
                              {typeObj.sousTypes.map(s=>{
                                const estStat = form.typeRequete==="statistique";
                                const selectionne = Array.isArray(form.sousType)?form.sousType.includes(s.value):form.sousType===s.value;
                                return (
                                  <button key={s.value} onClick={()=>{
                                    if (estStat) setForm(f=>({...f,sousType:Array.isArray(f.sousType)?(f.sousType.includes(s.value)?f.sousType.filter(v=>v!==s.value):[...f.sousType,s.value]):[s.value]}));
                                    else setForm(f=>({...f,sousType:[s.value]}));
                                  }} style={{ padding:"10px 18px", borderRadius:estStat?"10px":"100px", border:selectionne?"2px solid var(--green-light)":"1.5px solid var(--border)", background:selectionne?"var(--green-pale)":"#fff", color:selectionne?"var(--green-dark)":"var(--text-mid)", fontWeight:selectionne?700:500, fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"8px", transition:"all 0.3s ease" }}>
                                    <div style={{ width:"16px", height:"16px", flexShrink:0, borderRadius:estStat?"3px":"50%", border:selectionne?"2px solid var(--green-light)":"2px solid #ccc", background:selectionne?"var(--green-light)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#fff", fontWeight:800 }}>{selectionne?"":""}</div>
                                    {s.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {form.typeRequete && form.sousType.length > 0 && (
                          <div style={{ textAlign:"center", margin:"20px 0", fontSize:"32px" }} className="arrow-indicator">↓</div>
                        )}

                        {typeObj?.prix && isDirect && form.typeRequete!=="statistique" && (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"24px", padding:"20px", background:"rgba(77,201,122,0.04)", borderRadius:"12px", border:"2px solid rgba(77,201,122,0.15)" }}>
                            <div className="profil-field">
                              <label className="profil-label">
                                <span>③ Quantité ({typeObj.unite}s)</span>
                                <span className="required-badge">obligatoire</span>
                              </label>
                              <input type="number" min="1" className="profil-input" placeholder="ex: 100" value={form.quantite} onChange={e=>setForm(f=>({...f,quantite:e.target.value}))} style={{ borderColor:form.quantite?'var(--green-light)':'#e0ede6', borderWidth:'2px' }}/>
                            </div>
                            {montant && (
                              <div style={{ display:"flex", alignItems:"flex-end", paddingBottom:"2px" }}>
                                <div style={{ background:"var(--green-light)", color:"#fff", borderRadius:"12px", padding:"12px 18px", width:"100%", textAlign:"center" }}>
                                  <div style={{ fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:"4px", opacity:0.9 }}>Total à débiter</div>
                                  <div style={{ fontSize:"22px", fontWeight:800 }}>{formaterMontant(montant)}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {form.typeRequete==="statistique" && (
                          <div style={{ background:"var(--green-pale)", border:"2px solid rgba(34,160,82,0.3)", borderRadius:"12px", padding:"16px 20px", marginBottom:"24px", display:"flex", alignItems:"center", gap:"16px" }}>
                            <span style={{ fontSize:"24px" }}></span>
                            <div><div style={{ fontSize:"11px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:"4px" }}> Tarif forfaitaire</div>
                            <div style={{ fontSize:"22px", fontWeight:900, color:"var(--green-dark)" }}>5 000 FCFA</div></div>
                          </div>
                        )}

                        {typeObj && !isDirect && (
                          <div style={{ marginBottom:"24px", background:"rgba(30,96,204,0.06)", border:"2px solid rgba(30,96,204,0.18)", borderRadius:"12px", padding:"16px 20px", display:"flex", gap:"14px", alignItems:"flex-start" }}>
                            <span style={{ fontSize:"28px" }}></span>
                            <div>
                              <div style={{ fontWeight:700, fontSize:"13px", color:"#1E60CC", marginBottom:"4px" }}>Redirection vers la messagerie</div>
                              <div style={{ fontSize:"12px", color:"#6B9A7A", lineHeight:1.6 }}>Un message prédéfini avec vos coordonnées sera automatiquement placé dans la barre de saisie du chat.</div>
                            </div>
                          </div>
                        )}

                        {typeObj && !isDirect && (
                          <div className="profil-field" style={{ marginBottom:"24px" }}>
                            <label className="profil-label">
                              <span>③ Précisions</span>
                              <span className="optional-badge">optionnel</span>
                            </label>
                            <textarea className="profil-input" rows={3} placeholder="Ex: Nom de l'entreprise, secteur d'activité recherché..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ resize:"vertical" }}/>
                          </div>
                        )}

                        {(form.typeRequete && form.sousType.length > 0 && (isDirect && form.quantite || !isDirect)) && (
                          <div style={{ textAlign:"center", margin:"20px 0", fontSize:"32px" }} className="arrow-indicator">↓</div>
                        )}

                        <button className="btn-save" style={{ padding:"12px 28px", width:"100%", fontSize:"16px", fontWeight:700 }}
                          disabled={loading||!form.typeRequete||(typeObj?.sousTypes.length>0&&form.sousType.length===0)||((isDirect && form.typeRequete!=='statistique')&&!form.quantite)}
                          onClick={async()=>{ if (isChat) await redirecterVersChat(); else setEtape(2); }}>
                          {loading&&isChat?" Traitement...":<><span> Valider l'étape 1</span><span style={{marginLeft:'8px'}}>→</span></>}
                        </button>
                      </>
                    )}

                    {/* ── ÉTAPE 2 ── */}
                    {etape===2 && (
                      <>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
                          <div>
                            <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", margin:0 }}>② Remplissez les critères de sélection</h3>
                            <p style={{ color:"var(--text-muted)", fontSize:"13px", margin:"6px 0 0" }}>
                              <span style={{background:'rgba(232,85,85,0.1)', color:'#E85555', padding:'2px 8px', borderRadius:'4px', fontWeight:700, marginRight:'8px'}}>Requis</span>
                              <span style={{background:'rgba(176,195,176,0.2)', color:'#6B9A7A', padding:'2px 8px', borderRadius:'4px', marginRight:'8px'}}>Optionnel</span>
                              Sélection multiple autorisée.
                            </p>
                          </div>
                          {nbCriteres>0 && <span style={{ background:"var(--green-pale)", color:"var(--green-dark)", border:"1px solid rgba(34,160,82,0.2)", borderRadius:"100px", padding:"8px 16px", fontSize:"14px", fontWeight:700, display:"flex", alignItems:"center", gap:"8px" }}> {nbCriteres} critère{nbCriteres>1?"s":""}</span>}
                        </div>

                        <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
                          {/* Secteur */}
                          {((form.typeRequete==="liste"&&!estListeAssociation)||(form.typeRequete==="statistique"&&(estStatDouane||form.sousType.includes("stat_entreprises")))) && (
                            <div style={{ background:"var(--off-white)", borderRadius:"12px", border:"1px solid var(--border)", padding:"20px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
                                <span style={{ fontWeight:700, fontSize:"14px", color:"var(--text-dark)" }}> Secteur d'activité</span>
                                <span className="optional-badge">optionnel</span>
                              </div>
                              {(form.typeRequete==="statistique"?SECTEURS_DOUANE:SECTEURS).map(secteur=>(
                                <div key={secteur.code} style={{ marginBottom:"10px" }}>
                                  <button onClick={()=>setSecteurOuvert(o=>o===secteur.code?null:secteur.code)}
                                    style={{ width:"100%", padding:"10px 14px", borderRadius:"8px", border:form.sousCategories.some(sc=>sc.startsWith(secteur.code))?"2px solid var(--green-light)":"1.5px solid var(--border)", background:form.sousCategories.some(sc=>sc.startsWith(secteur.code))?"var(--green-pale)":"#fff", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontWeight:600, fontSize:"13px", color:form.sousCategories.some(sc=>sc.startsWith(secteur.code))?"var(--green-dark)":"var(--text-dark)", transition:"all 0.3s ease" }}>
                                    <span>{secteur.label}</span>
                                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                                      {form.sousCategories.filter(sc=>sc.startsWith(secteur.code)).length>0 && <span style={{ background:"var(--green-light)", color:"#fff", borderRadius:"100px", padding:"1px 8px", fontSize:"10px", fontWeight:700 }}>{form.sousCategories.filter(sc=>sc.startsWith(secteur.code)).length}</span>}
                                      <span style={{ fontSize:"14px", fontWeight:800, color:"var(--green-light)" }}>{secteurOuvert===secteur.code?"▼":"▶"}</span>
                                    </div>
                                  </button>
                                  {secteurOuvert===secteur.code && (
                                    <div style={{ marginTop:"8px", paddingLeft:"12px", display:"flex", flexWrap:"wrap", gap:"6px", paddingBottom:"8px", borderBottom:"2px solid rgba(77,201,122,0.2)" }}>
                                      {secteur.sousCategories.map(sc=>{
                                        const sel=form.sousCategories.includes(sc.code);
                                        return (
                                          <button key={sc.code} onClick={()=>setForm(f=>({...f,sousCategories:sel?f.sousCategories.filter(c=>c!==sc.code):[...f.sousCategories,sc.code]}))}
                                            style={{ padding:"6px 12px", borderRadius:"100px", fontSize:"11px", border:sel?"2px solid var(--green-light)":"1.5px solid var(--border)", background:sel?"var(--green-pale)":"#fff", color:sel?"var(--green-dark)":"var(--text-mid)", fontWeight:sel?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:"5px", transition:"all 0.2s ease" }}>
                                            <div style={{ width:"12px", height:"12px", borderRadius:"2px", flexShrink:0, border:sel?"2px solid var(--green-light)":"2px solid #ccc", background:sel?"var(--green-light)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"8px", color:"#fff", fontWeight:800 }}>{sel?"":""}</div>
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

                          {/* Critères import/export */}
                          {estStatDouane ? (
                            <>
                              <SectionCritere titre={<><span></span> Produit <span className="optional-badge" style={{display:'inline-block'}}>optionnel</span></> } sous={form.sousType.includes("stat_importations")&&form.sousType.includes("stat_exportations")?"(import ou export)":form.sousType.includes("stat_importations")?"(importé)":"(exporté)"}>
                                <select value={form.produitDouane} onChange={e=>setForm(f=>({...f,produitDouane:e.target.value}))} style={{ width:"100%", padding:"10px 14px", borderRadius:"10px", border:"2px solid var(--border)", fontSize:"13px", fontFamily:"inherit", outline:"none", color:"#0A2410", background:"#fff", transition:"border-color 0.3s ease" }}>
                                  <option value="">— Tous les produits —</option>
                                  {form.sousType.includes("stat_importations")&&!form.sousType.includes("stat_exportations")&&PRODUITS_IMPORT.map(p=><option key={p.code} value={p.code}>{p.label}</option>)}
                                  {form.sousType.includes("stat_exportations")&&!form.sousType.includes("stat_importations")&&PRODUITS_EXPORT.map(p=><option key={p.code} value={p.code}>{p.label}</option>)}
                                  {form.sousType.includes("stat_importations")&&form.sousType.includes("stat_exportations")&&(<><optgroup label="Importations">{PRODUITS_IMPORT.map(p=><option key={p.code} value={p.code}>{p.label}</option>)}</optgroup><optgroup label="Exportations">{PRODUITS_EXPORT.map(p=><option key={p.code} value={p.code}>{p.label}</option>)}</optgroup></>)}
                                </select>
                              </SectionCritere>
                              <SectionCritere titre={<><span></span> Province / Région <span className="optional-badge" style={{display:'inline-block'}}>optionnel</span></>}>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                                  {PROVINCES_DOUANE.map(p=>(
                                    <button key={p.value} onClick={()=>setForm(f=>({...f,provinceDouane:f.provinceDouane===p.value?"":p.value}))}
                                      style={{ padding:"10px 20px", borderRadius:"100px", fontSize:"13px", border:form.provinceDouane===p.value?"2px solid var(--green-light)":"1.5px solid var(--border)", background:form.provinceDouane===p.value?"var(--green-pale)":"#fff", color:form.provinceDouane===p.value?"var(--green-dark)":"var(--text-mid)", fontWeight:form.provinceDouane===p.value?700:500, cursor:"pointer", transition:"all 0.3s ease" }}>
                                      {form.provinceDouane===p.value?" ":""}{p.label}
                                    </button>
                                  ))}
                                </div>
                              </SectionCritere>
                            </>
                          ) : (
                            <SectionCritere titre={<><span></span> {estListeAssociation?"Région":"Ville / Région"} <span className="optional-badge" style={{display:'inline-block'}}>optionnel</span></>} sous={estListeAssociation?"(13 régions géographiques)":"(sélection multiple)"}>
                              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                                {(estListeAssociation||estStatAssociation?REGIONS_GEO:REGIONS_VILLES).map(r=>(
                                  <button key={r.value} onClick={()=>toggleArr("regions",r.value)}
                                    style={{ padding:"8px 14px", borderRadius:"100px", fontSize:"12px", border:form.regions.includes(r.value)?"2px solid var(--green-light)":"1.5px solid var(--border)", background:form.regions.includes(r.value)?"var(--green-pale)":"#fff", color:form.regions.includes(r.value)?"var(--green-dark)":"var(--text-mid)", fontWeight:form.regions.includes(r.value)?700:500, cursor:"pointer", transition:"all 0.2s ease" }}>
                                    {form.regions.includes(r.value)?" ":""}{r.label}
                                  </button>
                                ))}
                              </div>
                            </SectionCritere>
                          )}

                          {!estStatAssociation&&!estStatDouane&&!estListeAssociation&&(
                            <div className="profil-field">
                              <label className="profil-label">
                                <span> Ville / Commune</span>
                                <span className="optional-badge">optionnel</span>
                              </label>
                              <input type="text" className="profil-input" placeholder="ex: Ouagadougou..." value={form.villes} onChange={e=>setForm(f=>({...f,villes:e.target.value}))} style={{ borderColor:'var(--border)' }}/>
                            </div>
                          )}

                          {!estStatAssociation&&!estStatDouane&&!estListeAssociation&&(
                            <SectionCritere titre={<><span></span> Forme juridique <span className="optional-badge" style={{display:'inline-block'}}>optionnel</span></>} sous="(sélection multiple)">
                              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                                {FORMES_JURIDIQUES.map(fj=>(
                                  <button key={fj.value} onClick={()=>toggleArr("formesJuridiques",fj.value)}
                                    style={{ padding:"7px 14px", borderRadius:"100px", fontSize:"12px", border:form.formesJuridiques.includes(fj.value)?"2px solid var(--green-light)":"1.5px solid var(--border)", background:form.formesJuridiques.includes(fj.value)?"var(--green-pale)":"#fff", color:form.formesJuridiques.includes(fj.value)?"var(--green-dark)":"var(--text-mid)", fontWeight:form.formesJuridiques.includes(fj.value)?700:500, cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.2s ease" }}>
                                    <span style={{ width:"14px", height:"14px", borderRadius:"3px", flexShrink:0, border:form.formesJuridiques.includes(fj.value)?"2px solid var(--green-light)":"2px solid #ccc", background:form.formesJuridiques.includes(fj.value)?"var(--green-light)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:"#fff", fontWeight:800 }}>{form.formesJuridiques.includes(fj.value)?"":""}</span>
                                    {fj.label} <span style={{ fontSize:"10px", color:"#aaa" }}>({fj.nb?.toLocaleString("fr-FR")})</span>
                                  </button>
                                ))}
                              </div>
                            </SectionCritere>
                          )}

                          {!estStatAssociation&&!estStatDouane&&!estListeAssociation&&(
                            <SectionCritere titre={<><span></span> Tranche d'effectif <span className="optional-badge" style={{display:'inline-block'}}>optionnel</span></>}>
                              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                                {TRANCHES_EFFECTIF.map(t=>(
                                  <button key={t.value} onClick={()=>toggleArr("tranches",t.value)}
                                    style={{ padding:"11px 16px", borderRadius:"10px", textAlign:"left", border:form.tranches.includes(t.value)?"2px solid var(--green-light)":"1.5px solid var(--border)", background:form.tranches.includes(t.value)?"var(--green-pale)":"#fff", color:form.tranches.includes(t.value)?"var(--green-dark)":"var(--text-mid)", fontWeight:form.tranches.includes(t.value)?700:500, fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"10px", transition:"all 0.2s ease" }}>
                                    <div style={{ width:"18px", height:"18px", borderRadius:"50%", flexShrink:0, border:form.tranches.includes(t.value)?"2px solid var(--green-light)":"2px solid var(--border)", background:form.tranches.includes(t.value)?"var(--green-light)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#fff" }}>{form.tranches.includes(t.value)?"":""}</div>
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </SectionCritere>
                          )}

                          {/* Période statistique */}
                          {form.typeRequete==="statistique" && (
                            <div style={{ background:"rgba(232,85,85,0.04)", borderRadius:"12px", border:"2px solid #E85555", padding:"20px", boxShadow:"0 0 0 4px rgba(232,85,85,0.08)" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
                                <span style={{ fontSize:"18px" }}></span>
                                <span style={{ fontWeight:800, fontSize:"14px", color:"#E85555" }}>Période</span>
                                <span className="required-badge">obligatoire</span>
                              </div>
                              <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", marginBottom:"16px" }}>
                                {[{val:"annee_courante",label:"Année en cours"},{val:"annee_specifique",label:"Année spécifique"},{val:"intervalle",label:"Intervalle"}].map(opt=>(
                                  <button key={opt.val} onClick={()=>setPeriodeType(opt.val)} style={{ padding:"9px 18px", borderRadius:"100px", fontSize:"13px", border:periodeType===opt.val?"2px solid var(--green-light)":"1.5px solid var(--border)", background:periodeType===opt.val?"var(--green-pale)":"#fff", color:periodeType===opt.val?"var(--green-dark)":"var(--text-mid)", fontWeight:periodeType===opt.val?700:500, cursor:"pointer", transition:"all 0.2s ease" }}>{periodeType===opt.val?" ":""}{opt.label}</button>
                                ))}
                              </div>
                              {periodeType==="annee_courante" && <div style={{ background:"var(--green-pale)", borderRadius:"10px", padding:"12px 16px", fontSize:"14px", color:"var(--green-dark)", fontWeight:600 }}> Année {ANNEE_COURANTE}</div>}
                              {periodeType==="annee_specifique" && <input type="number" min="2000" max={ANNEE_COURANTE} className="profil-input" value={anneeSpecifique} onChange={e=>setAnneeSpecifique(e.target.value)} style={{ maxWidth:"200px" }}/>}
                              {periodeType==="intervalle" && (
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                                  <div className="profil-field"><label className="profil-label">Début</label><input type="number" min="2000" max={ANNEE_COURANTE} className="profil-input" value={anneeDebut} onChange={e=>setAnneeDebut(e.target.value)}/></div>
                                  <div className="profil-field"><label className="profil-label">Fin</label><input type="number" min="2000" max={ANNEE_COURANTE} className="profil-input" value={anneeFin} onChange={e=>setAnneeFin(e.target.value)}/></div>
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ textAlign:"center", margin:"24px 0", fontSize:"32px" }} className="arrow-indicator">↓</div>

                          <div style={{ padding:"20px", background:"rgba(0,144,76,0.05)", borderRadius:"12px", border:"2px solid rgba(0,144,76,0.15)" }}>
                            <h4 style={{ margin:"0 0 16px", fontSize:"15px", fontWeight:800, color:"var(--text-dark)", display:"flex", alignItems:"center", gap:"8px" }}>
                              <span> Informations de contact</span>
                              <span className="required-badge">obligatoire</span>
                            </h4>
                            <div className="profil-field" style={{ marginBottom:"14px" }}>
                              <label className="profil-label">Description complémentaire <span className="optional-badge" style={{display:'inline-block', marginLeft:'4px'}}>optionnel</span></label>
                              <textarea className="profil-input" rows={3} placeholder="Précisez vos besoins spécifiques..." value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ resize:"vertical" }}/>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                              <div className="profil-field">
                                <label className="profil-label">Email de contact <span className="required-badge">obligatoire</span></label>
                                <input type="email" className="profil-input" value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))} style={{ borderColor:form.contact?'var(--green-light)':'#e0ede6', borderWidth:'2px' }}/>
                              </div>
                              <div className="profil-field">
                                <label className="profil-label">Téléphone <span className="optional-badge" style={{display:'inline-block'}}>optionnel</span></label>
                                <input type="tel" className="profil-input" placeholder="+226 XX XX XX XX" value={form.telephone} onChange={e=>setForm(f=>({...f,telephone:e.target.value}))}/>
                              </div>
                            </div>
                          </div>

                          {(form.contact) && (
                            <div style={{ textAlign:"center", margin:"24px 0", fontSize:"32px" }} className="arrow-indicator">↓</div>
                          )}
                        </div>
                        <div style={{ display:"flex", gap:"10px", marginTop:"32px" }}>
                          <button className="btn-cancel" onClick={()=>setEtape(1)} style={{ padding:"12px 24px" }}>  Retour</button>
                          <button className="btn-save" style={{ padding:"12px 28px", flex:1, fontSize:"15px", fontWeight:700 }} disabled={!form.contact} onClick={()=>setEtape(3)}>
                             Vérifier ma demande <span style={{marginLeft:'8px'}}>→</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* ── ÉTAPE 3 ── */}
                    {etape===3 && (
                      <>
                        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"24px" }}>
                          <h3 style={{ fontSize:"20px", fontWeight:800, color:"var(--text-dark)", margin:0 }}> Vérification avant soumission</h3>
                          <span className="required-badge">dernière étape</span>
                        </div>
                        
                        <div style={{ background:"var(--off-white)", borderRadius:"16px", border:"2px solid var(--green-light)", padding:"24px", marginBottom:"20px", boxShadow:"0 2px 12px rgba(0,144,76,0.1)" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", paddingBottom:"20px", borderBottom:"2px solid var(--border)", marginBottom:"20px" }}>
                            <div>
                              <div style={{ fontWeight:800, fontSize:"18px", color:"var(--green-dark)", display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                                <span></span>
                                <span>{typeObj?.label}</span>
                              </div>
                              <div style={{ fontSize:"13px", color:"var(--text-muted)", marginTop:"4px" }}>
                                {Array.isArray(form.sousType)?form.sousType.map(st=>typeObj?.sousTypes.find(s=>s.value===st)?.label).filter(Boolean).join(" + "):typeObj?.sousTypes.find(s=>s.value===form.sousType)?.label||typeObj?.description}
                              </div>
                            </div>
                            <div style={{ textAlign:"right", background:"var(--green-pale)", borderRadius:"12px", padding:"14px 18px", border:"2px solid rgba(77,201,122,0.3)" }}>
                              <div style={{ fontSize:"11px", color:"var(--text-muted)", textTransform:"uppercase", fontWeight:700, marginBottom:"4px" }}>{form.typeRequete==="statistique"?"Forfait":" Total à débiter"}</div>
                              <div style={{ fontSize:"26px", fontWeight:900, color:"var(--green-dark)" }}>{form.typeRequete==="statistique"?"5 000":""}FCFA {form.typeRequete!=="statistique"?<span style={{fontSize:'20px'}}>{montant?formaterMontant(montant):"—"}</span>:""}</div>
                            </div>
                          </div>

                          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"16px", marginBottom:"20px" }}>
                            {form.regions.length>0 && (
                              <div style={{ background:"#fff", padding:"14px 16px", borderRadius:"10px", border:"1px solid rgba(0,144,76,0.15)" }}>
                                <div style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:"8px", display:"flex", alignItems:"center", gap:"4px" }}>
                                   Régions <span style={{background:'var(--green-light)', color:'#fff', borderRadius:'100px', padding:'0 6px', fontSize:'9px'}}>
                                    {form.regions.length}
                                  </span>
                                </div>
                                <div style={{ display:"flex", flexWrap:"wrap", gap:"4px" }}>
                                  {form.regions.slice(0,2).map(r=><span key={r} style={{fontSize:'11px', background:'rgba(77,201,122,0.1)', color:'var(--green-dark)', padding:'2px 8px', borderRadius:'4px', fontWeight:600}}>{r}</span>)}
                                  {form.regions.length>2 && <span style={{fontSize:'11px', color:'var(--text-muted)', padding:'2px 8px'}}>+{form.regions.length-2}</span>}
                                </div>
                              </div>
                            )}
                            {form.formesJuridiques.length>0 && (
                              <div style={{ background:"#fff", padding:"14px 16px", borderRadius:"10px", border:"1px solid rgba(0,144,76,0.15)" }}>
                                <div style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:"8px", display:"flex", alignItems:"center", gap:"4px" }}>
                                   Formes <span style={{background:'var(--green-light)', color:'#fff', borderRadius:'100px', padding:'0 6px', fontSize:'9px'}}>
                                    {form.formesJuridiques.length}
                                  </span>
                                </div>
                                <div style={{ fontSize:"11px", fontWeight:600, color:'var(--green-dark)' }}>
                                  {form.formesJuridiques.length} sélectionnée{form.formesJuridiques.length>1?"s":""}
                                </div>
                              </div>
                            )}
                            {form.sousCategories.length>0 && (
                              <div style={{ background:"#fff", padding:"14px 16px", borderRadius:"10px", border:"1px solid rgba(0,144,76,0.15)" }}>
                                <div style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:"8px", display:"flex", alignItems:"center", gap:"4px" }}>
                                   Secteurs <span style={{background:'var(--green-light)', color:'#fff', borderRadius:'100px', padding:'0 6px', fontSize:'9px'}}>
                                    {form.sousCategories.length}
                                  </span>
                                </div>
                                <div style={{ fontSize:"11px", fontWeight:600, color:'var(--green-dark)' }}>
                                  {form.sousCategories.length} sélectionné{form.sousCategories.length>1?"s":""}
                                </div>
                              </div>
                            )}
                            {form.typeRequete==="statistique" && (
                              <div style={{ background:"#fff", padding:"14px 16px", borderRadius:"10px", border:"1px solid rgba(0,144,76,0.15)" }}>
                                <div style={{ fontSize:"10px", fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", marginBottom:"8px", display:"flex", alignItems:"center", gap:"4px" }}>
                                   Période
                                </div>
                                <div style={{ fontSize:"11px", fontWeight:700, color:'var(--green-dark)' }}>
                                  {getPeriodeLabel()}
                                </div>
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop:"16px", paddingTop:"16px", borderTop:"1px solid rgba(0,144,76,0.15)" }}>
                            <div style={{ fontSize:"12px", color:"var(--text-muted)", lineHeight:1.6, display:"flex", alignItems:"flex-start", gap:"8px" }}>
                              <span style={{fontSize:'14px', marginTop:'-2px'}}></span>
                              <span>
                                <strong>À confirmer:</strong> Le montant sera débité instantanément de votre solde une fois que vous cliquerez sur le bouton ci-dessous. Assurez-vous que toutes les informations sont correctes.
                              </span>
                            </div>
                          </div>
                        </div>

                        {nbCriteres===0&&form.typeRequete!=="statistique"&&(
                          <div style={{background:'rgba(212,168,48,0.05)', border:'2px solid #D4A830', borderRadius:'12px', padding:'14px 16px', marginBottom:'20px', display:'flex', gap:'12px', alignItems:'flex-start'}}>
                            <span style={{fontSize:'18px', marginTop:'-2px'}}></span>
                            <div style={{fontSize:'13px', color:'#92700A', lineHeight:1.5}}>
                              <strong>Aucun critère spécifique</strong> — Toutes les données disponibles seront incluses dans votre requête.
                            </div>
                          </div>
                        )}

                        {erreur && <div style={{ background:"#FFF0F0", border:"2px solid #FFB3B3", borderRadius:"10px", padding:"14px 16px", marginBottom:"20px", color:"#CC3333", fontSize:"13px", display:"flex", gap:"10px", alignItems:"flex-start" }}>
                          <span style={{fontSize:'18px'}}> </span>
                          <div>{erreur}</div>
                        </div>}

                        <div style={{ textAlign:"center", margin:"24px 0", fontSize:"32px" }} className="arrow-indicator">↓</div>

                        <div style={{ display:"flex", gap:"12px", justifyContent:"center" }}>
                          <button className="btn-cancel" onClick={()=>setEtape(2)} style={{ padding:"12px 24px", fontSize:"14px" }}>
                             Modifier
                          </button>
                          <button className="btn-save" style={{ padding:"13px 36px", fontSize:"15px", fontWeight:800 }} disabled={loading} onClick={soumettre}>
                            {loading?<><span style={{marginRight:'8px'}}></span>Traitement en cours...</>:<><span> Obtenir les résultats</span><span style={{marginLeft:'10px'}}> </span></>}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              </div>

              {/* ── Colonne droite : historique ── */}
              <div className="historique-panel">
                <div className="historique-header">
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <span style={{ fontSize:"16px", fontWeight:800, color:"#0A2410" }}>
                      Historique
                    </span>
                    {demandes.length>0 && (
                      <span style={{ background:"#00904C", color:"#fff", borderRadius:"100px", padding:"2px 10px", fontSize:"11px", fontWeight:700 }}>
                        {demandes.length}
                      </span>
                    )}
                  </div>
                  <button onClick={chargerDemandes} style={{ padding:"5px 12px", borderRadius:"7px", background:"#E8F5EE", border:"none", color:"#00904C", fontSize:"11px", fontWeight:600, cursor:"pointer" }}>
                     Actualiser
                  </button>
                </div>

                <div style={{ padding:"0 16px 16px", maxHeight:"calc(100vh - 260px)", overflowY:"auto" }}>
                    {/* Filtres */}
                    <div style={{ display:"flex", gap:"8px", marginBottom:"16px", flexWrap:"wrap" }}>
                      {["tous","en_attente","en_cours","traite","rejete"].map(s=>{
                        const sc = STATUT_COLORS[s];
                        return (
                          <button key={s} onClick={()=>setFiltreStatut(s)}
                            style={{ padding:"5px 12px", borderRadius:"100px", fontSize:"11px", border:filtreStatut===s?`2px solid ${sc?.color||"var(--green-light)"}`:"1.5px solid var(--border)", background:filtreStatut===s?(sc?.bg||"var(--green-pale)"):"#fff", color:filtreStatut===s?(sc?.color||"var(--green-dark)"):"var(--text-mid)", fontWeight:filtreStatut===s?700:500, cursor:"pointer" }}>
                            {s==="tous"?"Toutes":sc?.label}
                            {s!=="tous"&&<span style={{ marginLeft:"4px", opacity:0.6 }}>({demandes.filter(d=>d.statut===s).length})</span>}
                          </button>
                        );
                      })}
                    </div>

                    {demandesLoading && <div style={{ textAlign:"center", padding:"24px", color:"var(--text-muted)" }}> Chargement...</div>}
                    {!demandesLoading && demandesErreur && <div style={{ background:"#FFF0F0", border:"1px solid #FFB3B3", borderRadius:"10px", padding:"14px", color:"#CC3333", fontSize:"13px" }}>{demandesErreur}</div>}
                    {!demandesLoading && !demandesErreur && demandes.length===0 && (
                      <div style={{ textAlign:"center", padding:"28px", color:"var(--text-muted)" }}>
                        <div style={{ fontSize:"32px", marginBottom:"8px" }}></div>
                        <p style={{ fontSize:"13px" }}>Aucune demande enregistrée.</p>
                      </div>
                    )}

                    {!demandesLoading && !demandesErreur && demandesFiltrees.length>0 && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                        {demandesFiltrees.map(d=>{
                          const sc  = STATUT_COLORS[d.statut]||STATUT_COLORS["en_attente"];
                          const typ = TYPES_REQUETES.find(t=>t.id===d.typeRequete);
                          return (
                            <div key={d._id} style={{ background:"#F8FBF8", borderRadius:"12px", border:"1px solid #E2EDE6", padding:"16px 18px" }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                                <div>
                                  <div style={{ fontWeight:700, fontSize:"14px", color:"#0A2410" }}>{typ?.label||d.typeRequete}</div>
                                  <div style={{ fontSize:"11px", color:"var(--text-muted)", marginTop:"2px" }}>
                                    {d.createdAt?new Date(d.createdAt).toLocaleDateString("fr-FR",{day:"2-digit",month:"long",year:"numeric"}):"—"}
                                    {" · "}Réf. <strong>{d._id?.slice(-6).toUpperCase()}</strong>
                                  </div>
                                </div>
                                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"4px" }}>
                                  <span style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}33`, borderRadius:"100px", padding:"3px 10px", fontSize:"11px", fontWeight:700 }}>{sc.label}</span>
                                  {d.montantEstime && <span style={{ fontSize:"12px", fontWeight:700, color:"var(--green-dark)" }}>{d.montantEstime.toLocaleString("fr-FR")} FCFA</span>}
                                </div>
                              </div>
                              {actionMessage.id===d._id&&actionMessage.texte&&(
                                <div style={{ padding:"7px 10px", borderRadius:"7px", fontSize:"11px", marginBottom:"8px", background:actionMessage.type==="succes"?"#E8F5EE":"#FFF0F0", color:actionMessage.type==="succes"?"#1A7A40":"#CC3333" }}>{actionMessage.texte}</div>
                              )}
                              <div style={{ display:"flex", gap:"8px" }}>
                                {d.statut==="en_attente"&&(
                                  <button onClick={()=>annulerDemande(d._id)} disabled={annulationId===d._id}
                                    style={{ padding:"6px 12px", borderRadius:"7px", fontSize:"11px", fontWeight:600, cursor:"pointer", background:"#FFF0F0", color:"#CC3333", border:"1px solid rgba(204,51,51,0.3)", opacity:annulationId===d._id?0.6:1 }}>
                                    {annulationId===d._id?"Annulation...":"Annuler"}
                                  </button>
                                )}
                                {typ&&!typ.direct&&(
                                  <button onClick={()=>navigate("/chat")} style={{ padding:"6px 12px", borderRadius:"7px", fontSize:"11px", fontWeight:600, cursor:"pointer", background:"rgba(30,96,204,0.08)", color:"#1E60CC", border:"1px solid rgba(30,96,204,0.2)" }}>
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
              </div>

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