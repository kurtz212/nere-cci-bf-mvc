const express  = require('express');
const router   = express.Router();
const { proteger } = require('../middlewares/auth.middleware');
const SearchLog    = require('../models/SearchLog.model');

// POST /api/searchlogs — Enregistrer une recherche
router.post('/', proteger, async (req, res) => {
  try {
    const { description, criteres, nbResultats } = req.body;
    const log = await SearchLog.create({
      userId: req.user.id,
      description: description || 'Recherche sans titre',
      criteres, nbResultats,
    });
    res.status(201).json({ success:true, data:log });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// GET /api/searchlogs/mon-historique — Historique de l'utilisateur connecté
router.get('/mon-historique', proteger, async (req, res) => {
  try {
    const { forfait, page=1, limit=20 } = req.query;
    const filtre = { userId: req.user.id };
    if (forfait) filtre.forfait = forfait;

    const logs = await SearchLog.find(filtre)
      .sort('-createdAt')
      .skip((page-1)*limit)
      .limit(parseInt(limit));

    const total = await SearchLog.countDocuments(filtre);

    // Forfaits distincts utilisés
    const forfaits = await SearchLog.distinct('forfait', { userId: req.user.id });

    res.json({ success:true, count:logs.length, total, forfaits, data:logs });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

module.exports = router;