const express  = require('express');
const router   = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const ctrl = require('../controllers/chat.controller');

// ── Utilisateur connecté ──
// GET  /api/chat/messages
router.get('/messages', proteger, ctrl.getMessages);

// POST /api/chat/messages
router.post('/messages', proteger, ctrl.envoyerMessage);

// ── Admin ──
// GET  /api/chat/admin/conversations
router.get('/admin/conversations', proteger, autoriser('admin'), ctrl.getConversations);

// POST /api/chat/admin/:conversationId/repondre
router.post('/admin/:conversationId/repondre', proteger, autoriser('admin'), ctrl.repondreAdmin);

// GET /api/chat/diffusions — récupérer les annonces de diffusion pour l'utilisateur
router.get('/diffusions', proteger, async (req, res) => {
  try {
    const Message = require('../models/Message.model');
    const userId  = req.user.id;
    const msgs    = await Message.find({
      type: 'diffusion',
      $or: [
        { cibles: { $size: 0 } },       // diffusion à tous
        { cibles: userId },              // ciblé
      ]
    }).sort('-createdAt').limit(50);
    res.json({ success:true, data:msgs });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// POST /api/messages/alerte-blocage — Envoyer une alerte quand un gestionnaire bloqué essaie de rechercher
router.post('/alerte-blocage', proteger, async (req, res) => {
  try {
    const Message = require('../models/Message.model');
    const User    = require('../models/User.model');
    
    const { gestionnaire_id, gestionnaire_nom, gestionnaire_email, gestionnaire_telephone, type_recherche, criteres, timestamp } = req.body;
    
    // Trouver tous les administrateurs
    const admins = await User.find({ role: 'admin' }).select('_id id email');
    
    if (admins.length === 0) {
      return res.json({ success: true, message: 'Aucun admin trouvé' });
    }
    
    // Créer un message d'alerte pour chaque administrateur
    const alerteMessage = `️ ALERTE BLOCAGE - Gestionnaire refusé de recherche\n\n` +
      `Gestionnaire: ${gestionnaire_nom}\n` +
      `Email: ${gestionnaire_email}\n` +
      `Téléphone: ${gestionnaire_telephone}\n` +
      `Type de recherche: ${type_recherche}\n` +
      `Critères utilisés: ${JSON.stringify(criteres)}\n` +
      `Heure de la tentative: ${new Date(timestamp).toLocaleString('fr-FR')}\n\n` +
      `Ce gestionnaire a tenté d'effectuer une recherche alors qu'il n'était pas autorisé. ` +
      `Veuillez vérifier ses permissions.`;
    
    for (const admin of admins) {
      await Message.create({
        texte: alerteMessage,
        expediteurId: req.user.id || 'system',
        expediteurNom: 'Système',
        expediteurRole: 'system',
        destinataireId: admin.id || admin._id.toString(),
        type: 'individuel',
        lu: false,
      });
    }
    
    res.json({ success: true, message: 'Alerte envoyée aux administrateurs' });
  } catch (e) {
    console.error('Erreur alerte blocage:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;