const Subscription = require('../models/Subscription.model');
const Pack = require('../models/Pack.model');

exports.verifierQuota = async (req, res, next) => {
  try {
    // Trouver l'abonnement actif de l'utilisateur
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: 'active'
    }).populate('packId');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Aucun abonnement actif. Veuillez souscrire à une formule.'
      });
    }

    // Vérifier expiration
    if (new Date() > subscription.dateFin) {
      subscription.status = 'expired';
      await subscription.save();
      return res.status(403).json({
        success: false,
        message: 'Votre abonnement a expiré. Veuillez le renouveler.'
      });
    }

    const pack = subscription.packId;
    const limite = pack.searchesLimit;

    // -1 = illimité (Premium)
    if (limite !== -1 && subscription.searchesUsed >= limite) {
      return res.status(429).json({
        success: false,
        message: `Quota mensuel atteint (${limite} recherches). Passez à une formule supérieure.`,
        searchesUsed: subscription.searchesUsed,
        searchesLimit: limite
      });
    }

    // Alerte à 80%
    if (limite !== -1) {
      const pourcentage = (subscription.searchesUsed / limite) * 100;
      if (pourcentage >= 80) {
        res.set('X-Quota-Alert', `${subscription.searchesUsed}/${limite}`);
      }
    }

    // Attacher l'abonnement à la requête
    req.subscription = subscription;
    req.pack = pack;
    next();
  } catch (err) {
    next(err);
  }
};
