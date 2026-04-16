// server/src/socket.js
const Message = require('./models/Message.model');

module.exports = (io) => {
  const adminsEnLigne = new Set();
  const usersConnectes = new Map(); // userId → { socketId, nom, prenom }

  io.on('connection', (socket) => {
    const { userId, role, prenom, nom } = socket.handshake.query;
    console.log(`🔌 Connecté: ${prenom} ${nom} (${role}) — ${socket.id}`);

    // Rejoindre room personnelle
    if (userId) {
      socket.join(`user_${userId}`);
      if (role !== 'admin' && role !== 'manager') {
        usersConnectes.set(userId, { socketId: socket.id, nom, prenom });
        // Notifier les admins qu'un user est connecté
        io.to('admins').emit('user_connecte', { userId, nom, prenom });
      }
    }

    if (role === 'admin' || role === 'manager') {
      socket.join('admins');
      adminsEnLigne.add(socket.id);
      io.emit('admin_statut', { enLigne: true });
      // Envoyer la liste des users connectés à l'admin
      socket.emit('users_connectes', Array.from(usersConnectes.entries()).map(([uid, u]) => ({
        userId: uid, nom: u.nom, prenom: u.prenom
      })));
    }

    // ── Charger historique ──
    socket.on('charger_historique', async ({ userId: uid, role: r }) => {
      try {
        let messages;
        if (r === 'admin' || r === 'manager') {
          messages = await Message.find({ type: { $ne: 'diffusion' } }).sort('createdAt').limit(500);
        } else {
          messages = await Message.find({
            type: { $ne: 'diffusion' },
            $or: [{ expediteurId: uid }, { destinataireId: uid }]
          }).sort('createdAt').limit(100);
        }
        socket.emit('historique', messages.map(m => formatMsg(m)));
      } catch(e) { console.error('historique:', e.message); }
    });

    // ── Charger diffusions ──
    socket.on('charger_diffusions', async () => {
      try {
        const msgs = await Message.find({ type: 'diffusion' }).sort('-createdAt').limit(50);
        socket.emit('historique_diffusions', msgs.map(m => formatMsg(m)));
      } catch(e) {}
    });

    // ── Envoyer message individuel ──
    socket.on('message_envoyer', async (data) => {
      try {
        const { texte, expediteurId, expediteurNom, role: expRole, destinataireId } = data;
        const msg = await Message.create({
          texte, expediteurId, expediteurNom,
          expediteurRole: expRole,
          destinataireId: destinataireId || null,
          type: 'individuel', lu: false,
        });
        const formatted = formatMsg(msg);

        if (expRole !== 'admin' && expRole !== 'manager') {
          // User → Admin
          io.to('admins').emit('message_recu', formatted);
          socket.emit('message_envoye', formatted);
        } else {
          // Admin → User ciblé
          if (destinataireId) {
            io.to(`user_${destinataireId}`).emit('message_recu', formatted);
          }
          io.to('admins').emit('message_envoye_admin', formatted);
        }
      } catch(e) { console.error('message:', e.message); }
    });

    // ── Diffusion ──
    socket.on('diffusion_envoyer', async (data) => {
      try {
        const { texte, expediteurId, expediteurNom, cibles } = data;
        // cibles: [] = tous, [userId1, userId2] = ciblés
        const msg = await Message.create({
          texte, expediteurId, expediteurNom,
          expediteurRole: 'admin',
          destinataireId: null,
          type: 'diffusion',
          cibles: cibles || [],
          lu: false,
        });
        const formatted = formatMsg(msg);

        if (!cibles || cibles.length === 0) {
          // Envoyer à tous les users connectés
          io.emit('diffusion_recue', formatted);
        } else {
          // Envoyer aux users ciblés
          cibles.forEach(uid => {
            io.to(`user_${uid}`).emit('diffusion_recue', formatted);
          });
          socket.emit('diffusion_recue', formatted); // confirmation admin
        }
        io.to('admins').emit('diffusion_envoyee', formatted);
      } catch(e) { console.error('diffusion:', e.message); }
    });

    // ── Indicateurs d'écriture ──
    socket.on('ecrit', ({ role: r, userId: uid, nom: n, destinataireId }) => {
      if (r === 'admin' || r === 'manager') {
        if (destinataireId) io.to(`user_${destinataireId}`).emit('admin_ecrit', { ecrit: true });
      } else {
        io.to('admins').emit('user_ecrit', { ecrit: true, userId: uid, nom: n });
      }
    });

    socket.on('stop_ecrit', ({ role: r, userId: uid, destinataireId }) => {
      if (r === 'admin' || r === 'manager') {
        if (destinataireId) io.to(`user_${destinataireId}`).emit('admin_ecrit', { ecrit: false });
      } else {
        io.to('admins').emit('user_ecrit', { ecrit: false, userId: uid });
      }
    });

    // ── Marquer comme lu ──
    socket.on('marquer_lu', async ({ conversationUserId }) => {
      try {
        await Message.updateMany(
          { expediteurId: conversationUserId, lu: false },
          { lu: true }
        );
      } catch(e) {}
    });

    // ── Déconnexion ──
    socket.on('disconnect', () => {
      adminsEnLigne.delete(socket.id);
      if (userId && role !== 'admin' && role !== 'manager') {
        usersConnectes.delete(userId);
        io.to('admins').emit('user_deconnecte', { userId });
      }
      if (adminsEnLigne.size === 0) io.emit('admin_statut', { enLigne: false });
    });
  });

  function formatMsg(m) {
    return {
      id:           m._id?.toString(),
      texte:        m.texte,
      role:         m.expediteurRole,
      expediteurId: m.expediteurId,
      expediteurNom:m.expediteurNom,
      destinataireId: m.destinataireId,
      type:         m.type || 'individuel',
      cibles:       m.cibles || [],
      heure: new Date(m.createdAt).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}),
      date:  new Date(m.createdAt).toLocaleDateString('fr-FR'),
      lu:    m.lu,
    };
  }
};