// api-nere/src/routes/entreprises.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/entreprises.controller');

/* ── References (sans cout) ── */
router.get('/refs/regions',                ctrl.getRegions);
router.get('/refs/formes-juridiques',      ctrl.getFormesJuridiques);
router.get('/refs/sous-categories',        ctrl.getSousCategories);
router.get('/refs/categories-association', ctrl.getCategoriesAssociation);
router.get('/refs/tables',                 ctrl.getTables);

/* ── Statistiques globales ── */
router.get('/stats',                ctrl.getStats);
router.get('/stats/associations',   ctrl.getStatsAssociations);
router.get('/stats/importations',   ctrl.getStatsImportations);
router.get('/stats/exportations',   ctrl.getStatsExportations);

/* ── Recherche globale (entreprises + associations) ── */
router.get('/recherche-globale', ctrl.rechercheGlobale);

/* ── Associations ── */
router.get('/nere/associations',   ctrl.rechercherAssociations);
router.get('/nere/importations',   ctrl.rechercherImportations);
router.get('/nere/exportations',   ctrl.rechercherExportations);
router.get('/associations/:code',  ctrl.getAssociationById);

/* ── Entreprises multicritere ── */
router.get('/multicritere', ctrl.rechercherMulticritere);

/* ── Recherche simple entreprises ── */
router.get('/', ctrl.rechercher);

/* ── Detail entreprise par RCCM — EN DERNIER (route param generique) ── */
router.get('/:rccm', ctrl.getEntrepriseById);

module.exports = router;