// Exécuter : node seed-partenaires.js (depuis server/)
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const PARTENAIRES = [
  { nom:"Ministère du Commerce",                type:"Institution d'État",       contribution:"Fournit les données officielles d'immatriculation et de registre du commerce du Burkina Faso.", badge:"Données certifiées",     icone:"🏛️", ordre:1 },
  { nom:"DGI — Direction Générale des Impôts",  type:"Administration fiscale",   contribution:"Certifie les numéros IFU et la régularité fiscale des entreprises enregistrées.",               badge:"IFU vérifié",            icone:"🏦", ordre:2 },
  { nom:"INSD — Institut National de la Statistique", type:"Organisme statistique", contribution:"Fournit les données statistiques sectorielles et les indicateurs économiques nationaux.",   badge:"Statistiques officielles",icone:"📊", ordre:3 },
  { nom:"UEMOA",                                type:"Organisation régionale",   contribution:"Harmonise les normes comptables et les données financières des entreprises de l'espace UEMOA.", badge:"Normes UEMOA",           icone:"🌍", ordre:4 },
  { nom:"ANPE Burkina Faso",                    type:"Agence nationale",         contribution:"Certifie les données d'effectifs et d'emploi des entreprises inscrites au registre.",            badge:"Emploi certifié",        icone:"🏢", ordre:5 },
  { nom:"CCIB — Chambre de Commerce",           type:"Institution consulaire",   contribution:"Partenaire principal assurant la collecte et la mise à jour des données du fichier NERE.",      badge:"Partenaire principal",   icone:"💼", ordre:6 },
  { nom:"Direction Générale des Douanes",       type:"Administration douanière", contribution:"Fournit les données d'import/export et certifie les activités commerciales transfrontalières.", badge:"Commerce certifié",      icone:"🛃", ordre:7 },
  { nom:"CNSS — Caisse Nationale de Sécurité Sociale", type:"Sécurité sociale", contribution:"Certifie les données d'effectifs et la couverture sociale des employés des entreprises.",       badge:"Emploi vérifié",         icone:"🛡️", ordre:8 },
  { nom:"Ministère de la Justice",              type:"Institution judiciaire",   contribution:"Valide les statuts juridiques, les actes notariaux et la conformité légale des entreprises.",   badge:"Conformité légale",      icone:"⚖️", ordre:9 },
];

async function seed() {
  const Partenaire = mongoose.model('Partenaire', new mongoose.Schema({
    nom:String, type:String, contribution:String, badge:String,
    icone:String, logoUrl:{type:String,default:''}, actif:{type:Boolean,default:true}, ordre:Number
  },{ timestamps:true }));

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nere-cci-bf');
  console.log('✅ MongoDB connecté');
  await Partenaire.deleteMany({});
  const inserted = await Partenaire.insertMany(PARTENAIRES);
  console.log(`✅ ${inserted.length} partenaires insérés`);
  await mongoose.disconnect();
  process.exit(0);
}
seed().catch(e => { console.error(e); process.exit(1); });