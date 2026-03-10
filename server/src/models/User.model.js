const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: 8,
    select: false
  },
  telephone: {
    type: String,
    trim: true
  },
  ville: {
    type: String,
    trim: true
  },
  organisation: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['visitor', 'subscriber', 'admin'],
    default: 'visitor'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifyToken: String,
  emailVerifyExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  derniereConnexion: Date,

  // Champs spécifiques Administrateur
  matricule: String,
  service: String,
  poste: String,
  niveauAcces: {
    type: String,
    enum: ['superadmin', 'admin', 'moderateur'],
    default: null
  },
  permissions: {
    type: [String],
    default: []
  },
  creePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// ── Hash du mot de passe avant sauvegarde ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Méthode : vérifier le mot de passe ──
userSchema.methods.verifierMotDePasse = async function (motDePasse) {
  return await bcrypt.compare(motDePasse, this.password);
};

// ── Méthode : vérifier une permission ──
userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('User', userSchema);
