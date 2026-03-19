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

module.exports = router;