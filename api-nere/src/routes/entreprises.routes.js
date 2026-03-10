const express = require('express');
const router = express.Router();
const { rechercher, getEntrepriseById } = require('../controllers/entreprises.controller');

// GET /api/entreprises?denomination=&secteur=&ville=&region=&rccm=&ifu=
router.get('/', rechercher);

// GET /api/entreprises/:rccm
router.get('/:rccm', getEntrepriseById);

module.exports = router;
