// ════════════════════════════════════════════
// server/src/models/Pack.model.js — MIS À JOUR
// ════════════════════════════════════════════
const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
  nom: {
    type: String,
    enum: ['basic', 'pro', 'premium'],
    required: true,
    unique: true
  },

  // ── Tarification ──
  prixMensuel: { type: Number, required: true },
  prixAnnuel:  { type: Number, required: true },

  // ── Accès aux types de requêtes ──
  // Basic=1 : Listes seulement
  // Pro=2   : Listes + Détails + Fiches
  // Premium=3: Tout (stats incluses)
  accessLevel: {
    type: Number,
    required: true,
    enum: [1, 2, 3]
  },

  // ── Quotas annuels (-1 = illimité) ──
  quotaListes: { type: Number, default: 0 },   // nb adresses/an
  quotaFiches: { type: Number, default: 0 },   // nb fiches/an
  quotaStats:  { type: Number, default: 0 },   // nb statistiques/an

  // ── Fonctionnalités booléennes ──
  canRechercheMulticriteres: { type: Boolean, default: false },
  canExportCSV:              { type: Boolean, default: false },
  canExportPDF:              { type: Boolean, default: false },
  canChat:                   { type: Boolean, default: false },
  canDemandeDocuments:       { type: Boolean, default: false },

  description: String,
  accroche:    String,
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Pack', packSchema);

/*
══════════════════════════════════════════════
DONNÉES INITIALES À INSÉRER (seed)
Fichier : server/src/config/seed.js
══════════════════════════════════════════════

const Pack = require('../models/Pack.model');

const packs = [
  {
    nom: 'basic',
    prixMensuel: 5000,
    prixAnnuel:  50000,
    accessLevel: 1,
    quotaListes: 500,
    quotaFiches: 0,
    quotaStats:  0,
    canRechercheMulticriteres: false,
    canExportCSV: false,
    canExportPDF: false,
    canChat: false,
    canDemandeDocuments: true,
    description: "Idéal pour les petites structures souhaitant accéder aux listes.",
    accroche: "Pour démarrer"
  },
  {
    nom: 'pro',
    prixMensuel: 15000,
    prixAnnuel:  150000,
    accessLevel: 2,
    quotaListes: 2000,
    quotaFiches: 50,
    quotaStats:  0,
    canRechercheMulticriteres: true,
    canExportCSV: true,
    canExportPDF: false,
    canChat: true,
    canDemandeDocuments: true,
    description: "Pour les professionnels ayant besoin de données détaillées.",
    accroche: "Le plus populaire"
  },
  {
    nom: 'premium',
    prixMensuel: 35000,
    prixAnnuel:  350000,
    accessLevel: 3,
    quotaListes: -1,
    quotaFiches: -1,
    quotaStats:  -1,
    canRechercheMulticriteres: true,
    canExportCSV: true,
    canExportPDF: true,
    canChat: true,
    canDemandeDocuments: true,
    description: "Accès complet à toute la base NERE + statistiques import/export.",
    accroche: "Accès illimité"
  }
];

Pack.insertMany(packs)
  .then(() => console.log('✅ Packs insérés'))
  .catch(err => console.error('❌ Seed packs:', err));
*/