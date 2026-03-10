const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User.model');
const emailService = require('../services/email.service');

// ── Générer un token JWT ──
const genererToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ── INSCRIPTION ──
exports.inscription = async (req, res, next) => {
  try {
    const { nom, prenom, email, password, telephone, ville, organisation } = req.body;

    // Vérifier si email existe déjà
    const existant = await User.findOne({ email });
    if (existant) {
      return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
    }

    // Générer le token de vérification email
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenHash = crypto.createHash('sha256').update(verifyToken).digest('hex');

    const user = await User.create({
      nom, prenom, email, password,
      telephone, ville, organisation,
      emailVerifyToken: verifyTokenHash,
      emailVerifyExpire: Date.now() + 24 * 60 * 60 * 1000 // 24h
    });

    // Envoyer email de vérification
    const lienVerification = `${process.env.CLIENT_URL}/verifier-email/${verifyToken}`;
    await emailService.envoyerEmailVerification(user, lienVerification);

    res.status(201).json({
      success: true,
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
      userId: user._id
    });
  } catch (err) {
    next(err);
  }
};

// ── VÉRIFICATION EMAIL ──
exports.verifierEmail = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerifyToken: tokenHash,
      emailVerifyExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré.' });
    }

    user.emailVerified = true;
    user.role = 'subscriber';
    user.emailVerifyToken = undefined;
    user.emailVerifyExpire = undefined;
    await user.save();

    const token = genererToken(user._id);

    res.json({ success: true, message: 'Email vérifié avec succès !', token });
  } catch (err) {
    next(err);
  }
};

// ── CONNEXION ──
exports.connexion = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.verifierMotDePasse(password))) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    if (!user.emailVerified) {
      return res.status(401).json({ success: false, message: 'Veuillez vérifier votre email avant de vous connecter.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Compte suspendu. Contactez la CCI-BF.' });
    }

    // Mettre à jour la dernière connexion
    user.derniereConnexion = new Date();
    await user.save();

    const token = genererToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

// ── MOT DE PASSE OUBLIÉ ──
exports.motDePasseOublie = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Aucun compte avec cet email.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();

    const lienReset = `${process.env.CLIENT_URL}/reinitialiser-mdp/${resetToken}`;
    await emailService.envoyerEmailResetPassword(user, lienReset);

    res.json({ success: true, message: 'Email de réinitialisation envoyé.' });
  } catch (err) {
    next(err);
  }
};

// ── RÉINITIALISER MOT DE PASSE ──
exports.reinitialiserMotDePasse = async (req, res, next) => {
  try {
    const tokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré.' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    next(err);
  }
};
