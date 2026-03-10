const express    = require('express');
const router     = express.Router();
const { proteger } = require('../middlewares/auth.middleware');
const { getProfil, updateProfil, getHistorique } = require('../controllers/user.controller');

router.get('/profil',     proteger, getProfil);
router.put('/profil',     proteger, updateProfil);
router.get('/historique', proteger, getHistorique);

module.exports = router;
