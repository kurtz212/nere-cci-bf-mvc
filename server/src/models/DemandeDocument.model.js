const mongoose = require('mongoose');

const demandeDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nomEntreprise: {
    type: String,
    required: [true, "Le nom de l'entreprise est obligatoire"],
    trim: true
  },
  rccm: {
    type: String,
    trim: true,
    default: null
  },
  typeDocument: {
    type: String,
    required: [true, 'Le type de document est obligatoire'],
    enum: [
      'RCCM (Registre du Commerce)',
      'Carte de commerçant',
      'IFU (Identifiant Financier Unique)',
      'Statuts de société',
      "PV d'Assemblée Générale",
      'Attestation de régularité fiscale',
      'Extrait du registre',
      'Autre document (préciser ci-dessous)'
    ]
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true
  },
  contact: {
    type: String,
    required: [true, "L'email de contact est obligatoire"]
  },
  telephone: {
    type: String,
    trim: true,
    default: null
  },
  statut: {
    type: String,
    enum: ['en_attente', 'en_cours', 'traite', 'rejete'],
    default: 'en_attente'
  },
  noteAdmin: {
    type: String,
    default: null
  },
  traitePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  dateTraitement: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('DemandeDocument', demandeDocumentSchema);
