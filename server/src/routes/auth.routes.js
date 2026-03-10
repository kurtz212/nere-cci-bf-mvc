const express = require('express');
const router = express.Router();
const {
  inscription,
  verifierEmail,
  connexion,
  motDePasseOublie,
  reinitialiserMotDePasse
} = require('../controllers/auth.controller');

// POST /api/auth/inscription
router.post('/inscription', inscription);

// GET /api/auth/verifier-email/:token
router.get('/verifier-email/:token', verifierEmail);

// POST /api/auth/connexion
router.post('/connexion', connexion);

// POST /api/auth/mot-de-passe-oublie
router.post('/mot-de-passe-oublie', motDePasseOublie);

// PUT /api/auth/reinitialiser-mdp/:token
router.put('/reinitialiser-mdp/:token', reinitialiserMotDePasse);

module.exports = router;
