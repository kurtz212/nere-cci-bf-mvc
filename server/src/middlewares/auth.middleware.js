const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// ── Vérifier le token JWT ──
exports.proteger = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Veuillez vous connecter.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte introuvable ou désactivé.'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré.'
    });
  }
};

// ── Vérifier le rôle ──
exports.autoriser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Rôle "${req.user.role}" non autorisé pour cette action.`
      });
    }
    next();
  };
};

// ── Vérifier une permission admin spécifique ──
exports.verifierPermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs.' });
    }
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ success: false, message: `Permission "${permission}" requise.` });
    }
    next();
  };
};
