const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');

// Schéma Pack (simple)
const PackSchema = new mongoose.Schema({
  nom:             String,
  niveau:          Number,
  description:     String,
  prix:            { mensuel: Number, annuel: Number },
  quotas:          { listes: Number, fiches: Number, statistiques: Number },
  fonctionnalites: [String],
  nonInclus:       [String],
  recommande:      { type: Boolean, default: false },
  actif:           { type: Boolean, default: true },
}, { timestamps: true });

const Pack = mongoose.models.Pack || mongoose.model('Pack', PackSchema);

// GET /api/packs — tous les packs actifs
router.get('/', async (req, res) => {
  try {
    const packs = await Pack.find({ actif: true }).sort('niveau');
    res.json({ success: true, count: packs.length, data: packs });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/packs/:id
router.get('/:id', async (req, res) => {
  try {
    const pack = await Pack.findById(req.params.id);
    if (!pack) return res.status(404).json({ success: false, message: 'Pack introuvable' });
    res.json({ success: true, data: pack });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;