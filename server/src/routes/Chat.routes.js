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

module.exports = router;