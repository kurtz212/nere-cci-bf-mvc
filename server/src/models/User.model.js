const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({

  // ── Identité ──
  nom:    { type: String, required: [true, 'Le nom est obligatoire'],    trim: true },
  prenom: { type: String, required: [true, 'Le prénom est obligatoire'], trim: true },

  // ── Type de compte (NOUVEAU) ──
  typeCompte: {
    type: String,
    enum: ['etudiant', 'entreprise', 'administration', 'autre'],
    required: false,
    default: 'autre',
  },

  // ── Coordonnées ──
  email: {
    type:      String,
    required:  false,     // facultatif pour les tests
    unique:    true,
    sparse:    true,      // permet plusieurs docs sans email
    lowercase: true,
    trim:      true,
    match:     [/^\S+@\S+\.\S+$/, 'Email invalide'],
  },
  telephone: { type: String, trim: true },
  siteWeb:   { type: String, trim: true },   // NOUVEAU — facultatif

  // ── Profil professionnel ──
  fonction:     { type: String, trim: true },   // NOUVEAU — ex: "Directeur commercial"
  organisation: { type: String, trim: true },   // Gardé pour compatibilité

  // ── Authentification ──
  password: {
    type:      String,
    required:  [true, 'Le mot de passe est obligatoire'],
    minlength: 8,
    select:    false,
  },

  // ── Rôle & statut ──
  role: {
    type:    String,
    enum:    ['visitor', 'subscriber', 'manager', 'admin'],
    default: 'visitor',
  },
  isActive: { type: Boolean, default: true },

  // ── Vérification email ──
  emailVerified:    { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpire: Date,

  // ── Reset mot de passe ──
  resetPasswordToken:  String,
  resetPasswordExpire: Date,

  // ── Activité ──
  derniereConnexion: Date,

  // ── Champs admin uniquement ──
  matricule:   String,
  service:     String,
  poste:       String,
  niveauAcces: {
    type:    String,
    enum:    ['superadmin', 'admin', 'moderateur', null],
    default: null,
  },
  permissions: { type: [String], default: [] },
  creePar: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'User',
    default: null,
  },

}, { timestamps: true });

// ── Hash du mot de passe avant sauvegarde ──
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Vérifier le mot de passe ──
userSchema.methods.verifierMotDePasse = async function (motDePasse) {
  return await bcrypt.compare(motDePasse, this.password);
};

// ── Vérifier une permission ──
userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('User', userSchema);