// 📁 server/routes/demandes.routes.js
// Remplace ton fichier routes/demandes.routes.js actuel par celui-ci

const express    = require('express');
const router     = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/demandeDocument.controller');

/* ══════════════════════════════════════════════
   ROUTES UTILISATEUR (proteger uniquement)
══════════════════════════════════════════════ */

// POST   /api/demandes
// Créer une demande
router.post('/', proteger, ctrl.creerDemande);

// POST   /api/demandes/special-notification
// Notification pour demandes spéciales (fiche / répertoire)
router.post('/special-notification', proteger, ctrl.specialNotification);

// GET    /api/demandes/mes-demandes
// Historique des demandes de l'utilisateur connecté
router.get('/mes-demandes', proteger, ctrl.mesDemandes);

/* ══════════════════════════════════════════════
   ROUTES ADMIN + MANAGER
   autoriser('admin', 'manager') = les deux ont accès
══════════════════════════════════════════════ */

// GET    /api/demandes/toutes
// Toutes les demandes (filtrables par statut, typeRequete)
router.get('/toutes', proteger, autoriser('admin', 'manager'), ctrl.getAllDemandes);

/* ══════════════════════════════════════════════
   ROUTES AVEC PARAMÈTRE :id
   (doivent être après les routes nommées /toutes, /mes-demandes etc.)
══════════════════════════════════════════════ */

// GET    /api/demandes/:id
// Détail d'une demande (propriétaire ou admin/manager)
router.get('/:id', proteger, ctrl.getDemandeById);

// PUT    /api/demandes/:id/annuler
// Annuler sa propre demande (utilisateur, statut en_attente uniquement)
router.put('/:id/annuler', proteger, ctrl.annulerDemande);

// POST   /api/demandes/:id/relancer
// Relancer une demande traitée ou rejetée (utilisateur)
router.post('/:id/relancer', proteger, ctrl.relancerDemande);

// PUT    /api/demandes/:id/statut
// Changer le statut d'une demande (admin + manager)
router.put('/:id/statut', proteger, autoriser('admin', 'manager'), ctrl.updateStatut);

// POST   /api/demandes/:id/note
// Ajouter une note interne (admin + manager)
router.post('/:id/note', proteger, autoriser('admin', 'manager'), ctrl.ajouterNote);

// ── Rétrocompatibilité routes admin existantes ──
// GET    /api/demandes/admin/toutes  → redirige vers /toutes
router.get('/admin/toutes', proteger, autoriser('admin', 'manager'), ctrl.getAllDemandes);
// PUT    /api/demandes/admin/:id/statut → redirige vers /:id/statut
router.put('/admin/:id/statut', proteger, autoriser('admin'), ctrl.updateStatutAdmin);

module.exports = router;