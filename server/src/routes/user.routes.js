// 📁 server/routes/users.routes.js
// Remplace ton fichier routes/users.routes.js actuel

const express  = require('express');
const router   = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');

/* ══════════════════════════════════════════════
   ROUTES UTILISATEUR CONNECTÉ
══════════════════════════════════════════════ */

// GET  /api/users/profil
router.get('/profil', proteger, async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT  /api/users/profil
router.put('/profil', proteger, async (req, res) => {
  try {
    const User = require('../models/User.model');
    const champs = ['nom','prenom','fonction','telephone','siteWeb'];
    const update = {};
    champs.forEach(c => { if (req.body[c] !== undefined) update[c] = req.body[c]; });
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   ROUTES ADMIN + MANAGER (lecture)
══════════════════════════════════════════════ */

// GET  /api/users
// Liste tous les utilisateurs — admin ET manager (lecture seule pour manager)
router.get('/', proteger, autoriser('admin', 'manager'), async (req, res) => {
  try {
    const User = require('../models/User.model');

    // Le manager ne voit pas les admins
    const filtre = req.user.role === 'manager' ? { role: { $ne: 'admin' } } : {};

    const users = await User.find(filtre).select('-password').sort('-createdAt');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ══════════════════════════════════════════════
   ROUTES ADMIN UNIQUEMENT
══════════════════════════════════════════════ */

// POST /api/users — Créer un gestionnaire / utilisateur
router.post('/', proteger, autoriser('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const { nom, prenom, email, telephone, fonction, typeCompte, password, role, isActive } = req.body;

    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nom, prénom, email et mot de passe sont requis.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    const user = await User.create({
      nom, prenom, email, telephone, fonction,
      typeCompte:    typeCompte || 'administration',
      password,
      role:          role      || 'manager',
      isActive:      typeof isActive === 'boolean' ? isActive : true,
      emailVerified: true,
    });

    res.status(201).json({ success: true, data: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT  /api/users/:id/role — Changer le rôle
router.put('/:id/role', proteger, autoriser('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const { role } = req.body;
    if (!['visitor','subscriber','manager','admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Rôle invalide.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT  /api/users/:id/activate — Activer / Suspendre
router.put('/:id/activate', proteger, autoriser('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive === true },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT  /api/users/:id/statut — Alias activer/suspendre
router.put('/:id/statut', proteger, autoriser('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const isActive = req.body.statut === 'actif';
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id — Supprimer un utilisateur
router.delete('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;