const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'suspended'],
    default: 'pending'
  },
  dateDebut: Date,
  dateFin: Date,
  searchesUsed: {
    type: Number,
    default: 0
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// ── Méthode : vérifier si l'abonnement est actif ──
subscriptionSchema.methods.isActive = function () {
  return this.status === 'active' && new Date() < this.dateFin;
};

// ── Méthode : vérifier le quota ──
subscriptionSchema.methods.quotaDisponible = function (limit) {
  if (limit === -1) return true; // illimité
  return this.searchesUsed < limit;
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
