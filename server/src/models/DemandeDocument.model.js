const mongoose = require('mongoose');

const demandeDocumentSchema = new mongoose.Schema({
  userId: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'User',
    default: null,
  },
  // Type de requête NERE
  typeRequete: {
    type:    String,
    enum:    ['liste', 'detail', 'fiche', 'statistique'],
    default: 'liste',
  },
  sousType:         { type:String, default:'' },
  quantite:         { type:String, default:'' },
  montantEstime:    { type:Number, default:0  },

  // Critères de sélection
  regions:          [{ type:String }],
  villes:           { type:String, default:'' },
  activites:        [{ type:String }],
  formesJuridiques: [{ type:String }],
  tranches:         [{ type:String }],

  // Période pour statistiques
  periodType:  { type:String, enum:['current','specific','range'], default:'' },
  periodYear:  { type:String, default:'' },
  periodStart: { type:String, default:'' },
  periodEnd:   { type:String, default:'' },

  // Description libre
  description: { type:String, default:'' },

  // Contact
  contact:   { type:String, default:'' },
  telephone: { type:String, default:'' },

  // Gestion admin
  statut: {
    type:    String,
    enum:    ['en_attente','en_cours','traite','rejete'],
    default: 'en_attente',
  },
  noteAdmin:      { type:String, default:'' },
  traitePar:      { type:mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  dateTraitement: { type:Date, default:null },

}, { timestamps:true });

module.exports = mongoose.model('DemandeDocument', demandeDocumentSchema);