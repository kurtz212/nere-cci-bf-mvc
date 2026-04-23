// api-nere/src/routes/entreprises.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/entreprises.controller');

/* ── Références (sans coût) ── */
router.get('/refs/regions',              ctrl.getRegions);
router.get('/refs/formes-juridiques',    ctrl.getFormesJuridiques);
router.get('/refs/sous-categories',      ctrl.getSousCategories);
router.get('/refs/categories-association', ctrl.getCategoriesAssociation);

/* ── Statistiques globales ── */
router.get('/stats', ctrl.getStats);

/* ── Recherche globale (entreprises + associations) ── */
router.get('/recherche-globale', ctrl.rechercheGlobale);

/* ── Associations ── */
router.get('/associations',       ctrl.rechercherAssociations);
router.get('/associations/:code', ctrl.getAssociationById);

/* ── Entreprises multicritère ── */
router.get('/multicritere', ctrl.rechercherMulticritere);

/* ── Recherche simple entreprises ── */
router.get('/', ctrl.rechercher);

/* ── Détail entreprise par RCCM — EN DERNIER ── */
router.get('/:rccm', ctrl.getEntrepriseById);

module.exports = router;