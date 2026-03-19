const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/auth.controller');
const { proteger } = require('../middlewares/auth.middleware');

router.post('/inscription', ctrl.inscription);
router.post('/connexion',   ctrl.connexion);

if (ctrl.verifierEmail)    router.get('/verifier-email/:token',    ctrl.verifierEmail);
if (ctrl.motDePasseOublie) router.post('/mot-de-passe-oublie',     ctrl.motDePasseOublie);
if (ctrl.reinitialiserMdp) router.put('/reinitialiser-mdp/:token', ctrl.reinitialiserMdp);
if (ctrl.moi)              router.get('/moi', proteger,            ctrl.moi);

module.exports = router;
