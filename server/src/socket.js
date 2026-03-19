module.exports = (io) => {

  io.on('connection', (socket) => {
    const userId   = socket.handshake.auth?.userId   || 'anonyme';
    const userRole = socket.handshake.auth?.userRole || 'visitor';

    console.log(`🔌 Socket connecté: ${userId} (${userRole})`);

    // Rejoindre salle personnelle
    socket.join(`user_${userId}`);

    // Admins rejoignent salle "admins"
    if (userRole === 'admin') {
      socket.join('admins');
      console.log(`👨‍💼 Admin rejoint la salle admins`);
    }

    // ── User envoie un message ──
    socket.on('envoyer_message', async ({ texte }) => {
      if (!texte?.trim()) return;
      try {
        const Message = require('./models/Message.model');
        const msg = await Message.create({
          conversationId: `user_${userId}`,
          expediteur:     userId,
          role:           userRole === 'admin' ? 'admin' : 'user',
          texte:          texte.trim(),
        });
        io.to('admins').emit('nouveau_message', {
          conversationId: `user_${userId}`, message: msg
        });
        socket.emit('message_envoye', { message: msg });
      } catch(e) {
        console.error('❌ Message:', e.message);
      }
    });

    // ── Admin répond ──
    socket.on('repondre_user', async ({ conversationId, texte }) => {
      if (userRole !== 'admin' || !texte?.trim() || !conversationId) return;
      try {
        const Message = require('./models/Message.model');
        const msg = await Message.create({
          conversationId, expediteur: userId, role: 'admin', texte: texte.trim()
        });
        io.to(conversationId).emit('nouveau_message_admin', { message: msg });
        socket.emit('message_envoye', { message: msg });
      } catch(e) {
        console.error('❌ Réponse admin:', e.message);
      }
    });

    // ── Typing ──
    socket.on('typing', ({ conversationId }) => {
      if (userRole === 'admin') io.to(conversationId).emit('admin_typing');
      else io.to('admins').emit('user_typing', { conversationId: `user_${userId}` });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      if (userRole === 'admin') io.to(conversationId).emit('admin_stop_typing');
      else io.to('admins').emit('user_stop_typing', { conversationId: `user_${userId}` });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket déconnecté: ${userId}`);
    });
  });
};
