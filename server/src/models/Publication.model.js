const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  contenu: {
    type: String,
    required: true
  },
  categorie: {
    type: String,
    enum: ['rapport', 'etude', 'classement', 'actualite', 'enquete'],
    required: true
  },
  tags: [String],
  accessLevel: {
    type: Number,
    default: 0
    // 0=public, 1=basic, 2=pro, 3=premium
  },
  auteurId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Publication', publicationSchema);
