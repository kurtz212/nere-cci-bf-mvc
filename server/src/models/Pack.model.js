const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  nom: {
    type: String,
    default: 'Standard',
    unique: true
  },
  options: [{
    niveau: {
      type: Number,
      enum: [1, 2, 3]
    },
    label: String,
    prix: Number,
    dureeJours: {
      type: Number,
      default: 365
    },
    searchesLimit: Number,
    canExport: Boolean,
    canAdvancedSearch: Boolean,
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Pack', packSchema);
