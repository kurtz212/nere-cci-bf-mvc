const express  = require('express');
const router   = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const Publication   = require('../models/Publication.model');

// GET /api/publications  — publiques (liste)
router.get('/', async (req, res) => {
  try {
    const { categorie, page=1, limit=10 } = req.query;
    const filtre = { statut:'publié' };
    if (categorie) filtre.categorie = categorie;
    const pubs = await Publication.find(filtre)
      .sort('-createdAt')
      .skip((page-1)*limit)
      .limit(parseInt(limit));
    const total = await Publication.countDocuments(filtre);
    res.json({ success:true, count:pubs.length, total, data:pubs });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// GET /api/publications/:id
router.get('/:id', async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ success:false, message:'Publication introuvable' });
    // Incrémenter les vues
    pub.vues = (pub.vues || 0) + 1;
    await pub.save();
    res.json({ success:true, data:pub });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/publications  (admin)
router.post('/', proteger, autoriser('admin'), async (req, res) => {
  try {
    const pub = await Publication.create({ ...req.body, auteur: req.user.id });
    res.status(201).json({ success:true, data:pub });
  } catch(err) { res.status(400).json({ success:false, message:err.message }); }
});

// PUT /api/publications/:id  (admin)
router.put('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!pub) return res.status(404).json({ success:false, message:'Publication introuvable' });
    res.json({ success:true, data:pub });
  } catch(err) { res.status(400).json({ success:false, message:err.message }); }
});

// DELETE /api/publications/:id  (admin)
router.delete('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Publication supprimée' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;