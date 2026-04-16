const express   = require('express');
const router    = express.Router();
const bcrypt    = require('bcryptjs');
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const User = require('../models/User.model');

// ─────────────────────────────────────────────
//  Routes statiques EN PREMIER (avant /:id)
// ─────────────────────────────────────────────

// GET /api/users/profil
router.get('/profil', proteger, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'Utilisateur introuvable' });
    res.json({ success:true, data: user });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// PUT /api/users/profil
router.put('/profil', proteger, async (req, res) => {
  try {
    const champs = ['nom','prenom','fonction','telephone','siteWeb'];
    const update = {};
    champs.forEach(c => { if (req.body[c] !== undefined) update[c] = req.body[c]; });
    const user = await User.findByIdAndUpdate(req.user.id, update, { new:true }).select('-password');
    res.json({ success:true, data: user });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// PUT /api/users/changer-mot-de-passe
router.put('/changer-mot-de-passe', proteger, async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success:false, message:'Utilisateur introuvable' });

    const valide = await bcrypt.compare(ancienMotDePasse, user.password);
    if (!valide) return res.status(400).json({ success:false, message:'Mot de passe actuel incorrect' });

    user.password = await bcrypt.hash(nouveauMotDePasse, 12);
    await user.save();
    res.json({ success:true, message:'Mot de passe modifié avec succès' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// ─────────────────────────────────────────────
//  Routes collection
// ─────────────────────────────────────────────

// GET /api/users  — liste tous les utilisateurs (admin ou manager)
router.get('/', proteger, autoriser('admin','manager'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success:true, count:users.length, data:users });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/users  — créer un utilisateur (admin)
router.post('/', proteger, autoriser('admin'), async (req, res) => {
  try {
    const { nom, prenom, email, password, role, telephone, fonction, typeCompte, isActive } = req.body;
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ success:false, message:'Champs obligatoires manquants' });
    }
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ success:false, message:'Cet email est déjà utilisé' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      nom, prenom, email,
      password:    hash,
      role:        role        || 'manager',
      telephone:   telephone   || '',
      fonction:    fonction    || '',
      typeCompte:  typeCompte  || 'administration',
      isActive:    isActive !== undefined ? isActive : true,
      emailVerified: true,
    });
    res.status(201).json({ success:true, data: user });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// ─────────────────────────────────────────────
//  Routes paramétrées /:id
// ─────────────────────────────────────────────

// GET /api/users/:id
router.get('/:id', proteger, autoriser('admin','manager'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'Utilisateur non trouvé' });
    res.json({ success:true, data:user });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// PUT /api/users/:id/role  — attribuer/retirer le rôle gestionnaire (admin)
router.put('/:id/role', proteger, autoriser('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ success:false, message:'Rôle manquant' });

    const ROLES_VALIDES = ['admin','manager','subscriber','visitor'];
    if (!ROLES_VALIDES.includes(role)) {
      return res.status(400).json({ success:false, message:`Rôle invalide. Valeurs acceptées : ${ROLES_VALIDES.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new:true }
    ).select('-password');

    if (!user) return res.status(404).json({ success:false, message:'Utilisateur non trouvé' });
    res.json({ success:true, data:user });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// PUT /api/users/:id/activate  — activer / suspendre (admin ou manager)
router.put('/:id/activate', proteger, autoriser('admin','manager'), async (req, res) => {
  try {
    const { isActive, suspendJusquau, raisonSuspension } = req.body;
    const update = { isActive };

    if (isActive) {
      // Réactivation → effacer la suspension
      update.suspendJusquau   = null;
      update.raisonSuspension = '';
    } else {
      // Suspension → enregistrer durée + raison
      if (suspendJusquau    !== undefined) update.suspendJusquau   = suspendJusquau;
      if (raisonSuspension  !== undefined) update.raisonSuspension = raisonSuspension;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new:true }).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'Utilisateur non trouvé' });
    res.json({ success:true, data:user });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// PUT /api/users/:id  — mise à jour générale (admin)
router.put('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    const champs = ['nom','prenom','email','telephone','fonction','role','isActive'];
    const update = {};
    champs.forEach(c => { if (req.body[c] !== undefined) update[c] = req.body[c]; });
    const user = await User.findByIdAndUpdate(req.params.id, update, { new:true }).select('-password');
    if (!user) return res.status(404).json({ success:false, message:'Utilisateur non trouvé' });
    res.json({ success:true, data:user });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;