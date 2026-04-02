const mongoose = require('mongoose');

const AbonnementSchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  pack:          { type:String, enum:['pack1','pack2','pack3'], required:true },
  montantInitial:{ type:Number, required:true },
  solde:         { type:Number, required:true },
  actif:         { type:Boolean, default:true },
  historique: [{
    type:        { type:String, enum:['credit','debit'] },
    montant:     Number,
    description: String,
    soldeApres:  Number,
    date:        { type:Date, default:Date.now },
  }],
}, { timestamps:true });

module.exports = mongoose.model('Abonnement', AbonnementSchema);