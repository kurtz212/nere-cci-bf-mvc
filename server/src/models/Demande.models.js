

const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  auteur:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  texte:     { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const DemandeSchema = new mongoose.Schema({
  // ── Utilisateur demandeur ──
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },

  // ── Type de demande ──
  typeRequete: {
    type:     String,
    enum:     ['liste','detail','statistique','fiche','autre'],
    required: true,
  },
  sousType: { type: String, default: '' },

  // ── Critères de sélection ──
  quantite:         { type: Number, default: null },
  regions:          [{ type: String }],
  villes:           { type: String, default: '' },
  activites:        [{ type: String }],
  formesJuridiques: [{ type: String }],
  tranches:         [{ type: String }],

  // ── Informations complémentaires ──
  description: { type: String, default: '' },
  contact:     { type: String, default: '' },
  telephone:   { type: String, default: '' },

  // ── Finances ──
  montantEstime: { type: Number, default: null },

  // ── Statut de traitement ──
  statut: {
    type:    String,
    enum:    ['en_attente','en_cours','traite','rejete','annule'],
    default: 'en_attente',
  },

  // ── Gestionnaire assigné ──
  gestionnaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null,
  },

  // ── Notes internes (gestionnaire/admin) ──
  notes: [NoteSchema],

  // ── Historique des statuts ──
  historiqueStatuts: [{
    statut:    String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date:      { type: Date, default: Date.now },
  }],

  // ── Relances ──
  nbRelances:     { type: Number, default: 0 },
  derniereRelance:{ type: Date,   default: null },

}, { timestamps: true });

// Index pour accélerer les requêtes fréquentes
DemandeSchema.index({ user: 1, createdAt: -1 });
DemandeSchema.index({ statut: 1, createdAt: -1 });
DemandeSchema.index({ gestionnaire: 1 });

module.exports = mongoose.model('Demande', DemandeSchema);