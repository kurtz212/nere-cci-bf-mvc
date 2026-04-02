const express  = require('express');
const router   = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const Partenaire    = require('../models/Partenaire.model');

// GET /api/partenaires — tous les partenaires actifs (public)
router.get('/', async (req, res) => {
  try {
    const partenaires = await Partenaire.find({ actif:true }).sort('ordre');
    res.json({ success:true, count:partenaires.length, data:partenaires });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// GET /api/partenaires/admin/tous — tous (admin)
router.get('/admin/tous', proteger, autoriser('admin'), async (req, res) => {
  try {
    const partenaires = await Partenaire.find().sort('ordre');
    res.json({ success:true, count:partenaires.length, data:partenaires });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/partenaires — créer (admin)
router.post('/', proteger, autoriser('admin'), async (req, res) => {
  try {
    const p = await Partenaire.create(req.body);
    res.status(201).json({ success:true, data:p });
  } catch(err) { res.status(400).json({ success:false, message:err.message }); }
});

// PUT /api/partenaires/:id — modifier (admin)
router.put('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    const p = await Partenaire.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!p) return res.status(404).json({ success:false, message:'Partenaire introuvable' });
    res.json({ success:true, data:p });
  } catch(err) { res.status(400).json({ success:false, message:err.message }); }
});

// DELETE /api/partenaires/:id — supprimer (admin)
router.delete('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    await Partenaire.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Partenaire supprimé' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;