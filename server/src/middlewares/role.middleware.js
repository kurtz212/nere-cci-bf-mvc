// 📁 server/middlewares/role.middleware.js
// Remplace ton fichier middlewares/role.middleware.js actuel

/**
 * Middleware d'autorisation par rôle(s)
 *
 * Usage :
 *   autoriser('admin')              → admin uniquement
 *   autoriser('admin', 'manager')   → admin OU manager
 *   autoriser('admin', 'manager', 'subscriber') → les trois
 *
 * Doit être utilisé APRÈS le middleware proteger (qui pose req.user)
 */
exports.autoriser = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}. Votre rôle : ${req.user.role}.`,
      });
    }

    next();
  };
};