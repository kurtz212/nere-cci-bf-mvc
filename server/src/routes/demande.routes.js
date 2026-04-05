const express  = require('express');
const router   = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');

let ctrl;
try {
  ctrl = require('../controllers/demandeDocument.controller');
} catch(e) {
  console.warn('⚠️  demandeDocument.controller manquant:', e.message);
  module.exports = router;
  return;
}

router.post('/',            proteger, ctrl.creerDemande);
router.post('/special-notification', proteger, ctrl.specialNotification);
router.get('/mes-demandes', proteger, ctrl.mesDemandes);
router.get('/:id',          proteger, ctrl.getDemandeById);

if (ctrl.getAllDemandes)    router.get('/admin/toutes',      proteger, autoriser('admin'), ctrl.getAllDemandes);
if (ctrl.updateStatutAdmin) router.put('/admin/:id/statut', proteger, autoriser('admin'), ctrl.updateStatutAdmin);

module.exports = router;
