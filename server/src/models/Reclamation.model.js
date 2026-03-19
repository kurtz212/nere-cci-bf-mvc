const mongoose = require('mongoose');

const ReclamationSchema = new mongoose.Schema({
  auteur:       { type: mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  nom:          { type:String, required:true, trim:true },
  prenom:       { type:String, required:true, trim:true },
  email:        { type:String, trim:true, lowercase:true },
  telephone:    { type:String, trim:true },
  type:         {
    type:String,
    enum:['donnees_incorrectes','acces_refuse','paiement','compte','delai','autre'],
    default:'autre',
  },
  sujet:        { type:String, required:true, trim:true },
  description:  { type:String, required:true },
  statut:       {
    type:String,
    enum:['nouveau','en_cours','résolu'],
    default:'nouveau',
  },
  reponseAdmin: { type:String, default:'' },
}, { timestamps:true });

module.exports = mongoose.model('Reclamation', ReclamationSchema);