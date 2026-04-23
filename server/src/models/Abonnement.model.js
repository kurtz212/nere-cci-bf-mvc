const mongoose = require('mongoose');

const AbonnementSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  pack:           { type:String, enum:['pack1','pack2','pack3'], required:true },
  packLabel:      { type:String, default:'' },
  montantInitial: { type:Number, required:true },
  solde:          { type:Number, required:true },
  actif:          { type:Boolean, default:true },

  // Statistiques d'usage
  totalDepense:   { type:Number, default:0 },
  nbRequetes:     { type:Number, default:0 },

  // Historique des transactions
  historique: [{
    type:          { type:String, enum:['credit','debit'] },
    typeRequete:   { type:String, enum:['liste','statistique','fiche','detail','autre','recharge'] },
    montant:       Number,
    description:   String,
    soldeAvant:    Number,
    soldeApres:    Number,
    date:          { type:Date, default:Date.now },
  }],
}, { timestamps:true });

// Méthode pour déduire avec historique
AbonnementSchema.methods.deduire = async function(montant, typeRequete, description) {
  if (this.solde < montant) {
    throw new Error(`SOLDE_INSUFFISANT:${montant}:${this.solde}`);
  }
  const soldeAvant  = this.solde;
  this.solde       -= montant;
  this.totalDepense = (this.totalDepense || 0) + montant;
  this.nbRequetes   = (this.nbRequetes   || 0) + 1;
  this.historique.push({
    type:        'debit',
    typeRequete,
    montant,
    description,
    soldeAvant,
    soldeApres:  this.solde,
  });
  await this.save();
  return this.solde;
};

// Méthode pour recharger
AbonnementSchema.methods.recharger = async function(montant, description) {
  const soldeAvant  = this.solde;
  this.solde       += montant;
  this.montantInitial = montant;
  this.historique.push({
    type:        'credit',
    typeRequete: 'recharge',
    montant,
    description: description || 'Recharge compte',
    soldeAvant,
    soldeApres:  this.solde,
  });
  await this.save();
  return this.solde;
};

module.exports = mongoose.model('Abonnement', AbonnementSchema);