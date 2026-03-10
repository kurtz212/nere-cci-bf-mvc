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
  isBilled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('SearchLog', searchLogSchema);
