const Message = require('../models/Message.model');

// ── GET /api/chat/messages — Messages de la conversation de l'utilisateur ──
exports.getMessages = async (req, res, next) => {
  try {
    const conversationId = `user_${req.user.id}`;
    const messages = await Message.find({ conversationId })
      .populate('expediteur', 'nom prenom role')
      .sort({ createdAt: 1 });

    // Marquer les messages admin comme lus
    await Message.updateMany(
      { conversationId, role: 'admin', lu: false },
      { lu: true, dateLecture: new Date() }
    );

    res.json({ success: true, data: messages });
  } catch (err) { next(err); }
};

// ── POST /api/chat/messages — Envoyer un message (user → admin) ──
exports.envoyerMessage = async (req, res, next) => {
  try {
    const { texte } = req.body;
    if (!texte?.trim())
      return res.status(400).json({ success: false, message: 'Message vide.' });

    const conversationId = `user_${req.user.id}`;
    const message = await Message.create({
      conversationId,
      expediteur: req.user.id,
      role: 'user',
      texte: texte.trim()
    });

    // Émettre via WebSocket si admin connecté (voir socket.js)
    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('nouveau_message', {
        conversationId,
        message: { ...message.toObject(), expediteur: req.user }
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
};

// ── POST /api/admin/chat/:conversationId/repondre — Admin → user ──
exports.repondreAdmin = async (req, res, next) => {
  try {
    const { texte } = req.body;
    const { conversationId } = req.params;

    const message = await Message.create({
      conversationId,
      expediteur: req.user.id,
      role: 'admin',
      texte: texte.trim()
    });

    // Émettre au user concerné via WebSocket
    const io = req.app.get('io');
    if (io) {
      const userId = conversationId.replace('user_', '');
      io.to(`user_${userId}`).emit('nouveau_message_admin', {
        message: { ...message.toObject(), expediteur: { nom:'Agent', prenom:'CCI-BF' } }
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (err) { next(err); }
};

// ── GET /api/admin/chat/conversations — Admin : liste de toutes les conversations ──
exports.getConversations = async (req, res, next) => {
  try {
    // Dernier message de chaque conversation
    const conversations = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$conversationId', dernierMessage: { $first: '$$ROOT' } } },
      { $lookup: { from:'users', localField:'dernierMessage.expediteur',
        foreignField:'_id', as:'user' } },
      { $project: { conversationId:'$_id', dernierMessage:1,
        nonLus: { $sum: { $cond: [{ $eq:['$dernierMessage.lu', false] }, 1, 0] } } } },
      { $sort: { 'dernierMessage.createdAt': -1 } }
    ]);
    res.json({ success: true, data: conversations });
  } catch (err) { next(err); }
};