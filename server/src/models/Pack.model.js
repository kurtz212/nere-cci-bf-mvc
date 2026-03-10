const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  nom: {
    type: String,
    enum: ['basic', 'pro', 'premium'],
    required: true,
    unique: true
  },
  prix: {
    type: Number,
    required: true
  },
  dureeJours: {
    type: Number,
    default: 365
  },
  searchesLimit: {
    type: Number,
    required: true
    // -1 = illimité (Premium)
  },
  canExport: {
    type: Boolean,
    default: false
  },
  canAdvancedSearch: {
    type: Boolean,
    default: false
  },
  accessLevel: {
    type: Number,
    required: true
    // 1=basic, 2=pro, 3=premium
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Pack', packSchema);
