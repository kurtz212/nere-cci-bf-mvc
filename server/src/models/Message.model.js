const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  texte:          { type:String, required:true },
  expediteurId:   { type:String, default:'' },
  expediteurNom:  { type:String, default:'Anonyme' },
  expediteurRole: { type:String, default:'user' },
  destinataireId: { type:String, default:null },
  type:           { type:String, enum:['individuel','diffusion'], default:'individuel' },
  cibles:         [{ type:String }], // userId[] pour diffusion ciblée
  lu:             { type:Boolean, default:false },
}, { timestamps:true });

module.exports = mongoose.model('Message', MessageSchema);