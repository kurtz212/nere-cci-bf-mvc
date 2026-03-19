const express = require('express');
const router  = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const Reclamation   = require('../models/Reclamation.model');

// POST /api/reclamations  — soumettre une réclamation (sans auth requise)
router.post('/', async (req, res) => {
  try {
    const { type, sujet, description, nom, prenom, email, telephone } = req.body;
    if (!sujet || !description || !nom || !prenom)
      return res.status(400).json({ success:false, message:'Champs obligatoires manquants' });
    const rec = await Reclamation.create({
      type, sujet, description, nom, prenom, email, telephone,
      auteur: req.user?.id || null,
    });
    res.status(201).json({ success:true, message:'Réclamation enregistrée', data:rec });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// GET /api/reclamations/admin/toutes  (admin)
router.get('/admin/toutes', proteger, autoriser('admin'), async (req, res) => {
  try {
    const recs = await Reclamation.find().sort('-createdAt').populate('auteur','nom prenom email');
    res.json({ success:true, count:recs.length, data:recs });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// PUT /api/reclamations/admin/:id/statut  (admin)
router.put('/admin/:id/statut', proteger, autoriser('admin'), async (req, res) => {
  try {
    const rec = await Reclamation.findByIdAndUpdate(
      req.params.id,
      { statut: req.body.statut, reponseAdmin: req.body.reponse },
      { new:true }
    );
    res.json({ success:true, data:rec });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;