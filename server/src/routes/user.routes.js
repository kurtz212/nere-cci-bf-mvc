const express  = require('express');
const router   = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');

// GET  /api/users/profil
router.get('/profil', proteger, async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'Utilisateur introuvable' });
    res.json({ success:true, data: user });
  } catch(err) { res.status(500).json({ success:false, message: err.message }); }
});

// PUT  /api/users/profil
router.put('/profil', proteger, async (req, res) => {
  try {
    const User = require('../models/User.model');
    const champs = ['nom','prenom','fonction','telephone','siteWeb'];
    const update = {};
    champs.forEach(c => { if (req.body[c] !== undefined) update[c] = req.body[c]; });
    const user = await User.findByIdAndUpdate(req.user.id, update, { new:true }).select('-password');
    res.json({ success:true, data: user });
  } catch(err) { res.status(500).json({ success:false, message: err.message }); }
});

// GET  /api/users  (admin)
router.get('/', proteger, autoriser('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success:true, count: users.length, data: users });
  } catch(err) { res.status(500).json({ success:false, message: err.message }); }
});

// PUT  /api/users/:id/statut  (admin)
router.put('/:id/statut', proteger, autoriser('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { statut: req.body.statut },
      { new:true }
    ).select('-password');
    res.json({ success:true, data: user });
  } catch(err) { res.status(500).json({ success:false, message: err.message }); }
});

module.exports = router;