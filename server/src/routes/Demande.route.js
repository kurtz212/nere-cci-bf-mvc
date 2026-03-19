const express  = require('express');
const router   = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/demandeDocument.controller');

// ── Utilisateur ──
// POST   /api/demandes
router.post('/', proteger, ctrl.creerDemande);

// GET    /api/demandes/mes-demandes
router.get('/mes-demandes', proteger, ctrl.mesDemandes);

// GET    /api/demandes/:id
router.get('/:id', proteger, ctrl.getDemandeById);

// ── Admin ──
// GET    /api/demandes/admin/toutes
router.get('/admin/toutes', proteger, autoriser('admin'), ctrl.getAllDemandes);

// PUT    /api/demandes/admin/:id/statut
router.put('/admin/:id/statut', proteger, autoriser('admin'), ctrl.updateStatutAdmin);

module.exports = router;