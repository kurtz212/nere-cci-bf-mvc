const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
    // Format : "user_{userId}" — une conversation par utilisateur avec l'admin
  },
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  texte: {
    type: String,
    required: [true, 'Le message ne peut pas être vide'],
    trim: true,
    maxlength: [2000, 'Message trop long (max 2000 caractères)']
  },
  lu: {
    type: Boolean,
    default: false
  },
  dateLecture: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Index pour récupérer rapidement les messages d'une conversation
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);