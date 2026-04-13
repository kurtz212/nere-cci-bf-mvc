// server/src/socket.js
const Message = require('./models/Message.model');

module.exports = (io) => {

  const adminsEnLigne = new Set();

  io.on('connection', (socket) => {
    const { userId, role, prenom, nom } = socket.handshake.query;
    console.log(`🔌 Connecté: ${prenom} ${nom} (${role})`);

    if (userId) socket.join(`user_${userId}`);

    if (role === 'admin' || role === 'manager') {
      socket.join('admins');
      adminsEnLigne.add(socket.id);
      io.emit('admin_statut', { enLigne: true });
    }

    // ── Utilisateur : charger SA conversation ──
    socket.on('charger_historique', async ({ userId: uid, role: r }) => {
      try {
        let messages;
        if (r === 'admin' || r === 'manager') {
          // Admin : tous les messages groupés par utilisateur
          messages = await Message.find({}).sort('createdAt').limit(200);
        } else {
          // Utilisateur : seulement ses messages
          messages = await Message.find({
            $or: [{ expediteurId: uid }, { destinataireId: uid }]
          }).sort('createdAt').limit(50);
        }

        socket.emit('historique', messages.map(m => ({
          id:           m._id,
          texte:        m.texte,
          role:         m.expediteurRole,
          expediteurId: m.expediteurId,
          expediteurNom:m.expediteurNom,
          destinataireId: m.destinataireId,
          heure: new Date(m.createdAt).toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}),
          date:  new Date(m.createdAt).toLocaleDateString('fr-FR'),
          lu:    m.lu,
        })));
      } catch(e) { console.error('historique:', e.message); }
    });

    // ── Envoyer un message ──
    socket.on('message_envoyer', async (data) => {
      try {
        const { texte, expediteurId, expediteurNom, role: expRole, destinataireId } = data;

        const msg = await Message.create({
          texte, expediteurId, expediteurNom,
          expediteurRole: expRole,
          destinataireId: destinataireId || null,
          lu: false,
        });

        const msgFormate = {
          id:           msg._id,
          texte:        msg.texte,
          role:         expRole,
          expediteurId,
          expediteurNom,
          destinataireId: destinataireId || null,
          heure: new Date().toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'}),
          date:  'Aujourd\'hui',
          lu:    false,
        };

        if (expRole !== 'admin' && expRole !== 'manager') {
          // Message utilisateur → envoyer aux admins
          io.to('admins').emit('message_recu', msgFormate);
          socket.emit('message_envoye', msgFormate);
        } else {
          // Message admin → envoyer uniquement à l'utilisateur destinataire
          if (destinataireId) {
            io.to(`user_${destinataireId}`).emit('message_recu', msgFormate);
          }
          io.to('admins').emit('message_envoye', msgFormate);
        }
      } catch(e) { console.error('message:', e.message); }
    });

    // ── Indicateurs "en train d'écrire" ──
    socket.on('ecrit', ({ role: r, userId: uid, nom: n }) => {
      if (r === 'admin' || r === 'manager') {
        if (uid) io.to(`user_${uid}`).emit('admin_ecrit', { ecrit: true });
      } else {
        io.to('admins').emit('user_ecrit', { ecrit: true, userId: uid, nom: n });
      }
    });

    socket.on('stop_ecrit', ({ role: r, userId: uid }) => {
      if (r === 'admin' || r === 'manager') {
        if (uid) io.to(`user_${uid}`).emit('admin_ecrit', { ecrit: false });
      } else {
        io.to('admins').emit('user_ecrit', { ecrit: false, userId: uid });
      }
    });

    socket.on('disconnect', () => {
      adminsEnLigne.delete(socket.id);
      if (adminsEnLigne.size === 0) io.emit('admin_statut', { enLigne: false });
    });
  });
};