const mongoose = require('mongoose');

const SearchLogSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  description: { type:String, default:'Recherche sans titre' },

  // Critères utilisés
  criteres: {
    typeAffichage: { type:String, default:'' },
    region:        { type:String, default:'' },
    ville:         { type:String, default:'' },
    categorie:     { type:String, default:'' },
    sousCat:       { type:String, default:'' },
    nombre:        { type:Number, default:1  },
    modeAnnee:     { type:String, default:'' },
    annee:         { type:String, default:'' },
  },

  // Résultat
  nbResultats: { type:Number, default:0 },

}, { timestamps:true });

module.exports = mongoose.model('SearchLog', SearchLogSchema);