const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  description: {
    type: String,
    default: 'Recherche enregistrée'
  },
  criteres: {
    denomination: String,
    secteur: String,
    ville: String,
    region: String,
    rccm: String,
    ifu: String,
    caMin: Number,
    caMax: Number,
    employesMin: Number,
    employesMax: Number
  },
  resultatCount: {
    type: Number,
    default: 0
  },
  forfait: String,
  lastConsultedAt: {
    type: Date,
    default: null
  },
  isBilled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('SearchLog', searchLogSchema);
