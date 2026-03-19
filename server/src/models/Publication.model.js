const mongoose = require('mongoose');

const PublicationSchema = new mongoose.Schema({
  titre:     { type:String, required:true, trim:true },
  contenu:   { type:String, default:'' },
  extrait:   { type:String, default:'' },
  categorie: {
    type:String,
    enum:['Rapport','Étude','Classement','Note technique','Communiqué'],
    default:'Rapport',
  },
  statut:    { type:String, enum:['brouillon','publie','publié'], default:'brouillon' },
  auteur:    { type:mongoose.Schema.Types.ObjectId, ref:'User' },
  vues:      { type:Number, default:0 },
  accesPack: { type:Number, default:1 }, // 1=Basic, 2=Pro, 3=Premium
}, { timestamps:true });

module.exports = mongoose.model('Publication', PublicationSchema);