const Subscription = require('../models/Subscription.model');
const UsageLog     = require('../models/UsageLog.model');

// ── Correspondance type de requête → champ quota ──
const QUOTA_MAP = {
  liste:       { field: 'quotaListes', accessLevel: 1 },
  detail:      { field: null,          accessLevel: 2 },  // Pas de quota fixe, juste accès
  fiche:       { field: 'quotaFiches', accessLevel: 2 },
  statistique: { field: 'quotaStats',  accessLevel: 3 },
};

// ── Middleware principal : vérifier le quota avant toute requête payante ──
exports.verifierQuota = (typeRequete) => async (req, res, next) => {
  try {
    // 1. Récupérer l'abonnement actif de l'utilisateur
    const abonnement = await Subscription.findOne({
      userId: req.user.id,
      statut: 'actif',
      dateFin: { $gte: new Date() }
    }).populate('packId');

    if (!abonnement) {
      return res.status(403).json({
        success: false,
        code: 'NO_SUBSCRIPTION',
        message: 'Vous n\'avez pas d\'abonnement actif.',
        action: 'redirect_formules'
      });
    }

    const pack = abonnement.packId;
    const regle = QUOTA_MAP[typeRequete];

    if (!regle) {
      return res.status(400).json({ success: false, message: 'Type de requête inconnu.' });
    }

    // 2. Vérifier le niveau d'accès
    if (pack.accessLevel < regle.accessLevel) {
      return res.status(403).json({
        success: false,
        code: 'INSUFFICIENT_PACK',
        message: `Ce type de données nécessite le pack ${
          regle.accessLevel === 2 ? 'Pro' : 'Premium'
        } ou supérieur.`,
        packActuel: pack.nom,
        packRequis: regle.accessLevel === 2 ? 'pro' : 'premium',
        action: 'upgrade_pack'
      });
    }

    // 3. Vérifier le quota si applicable
    if (regle.field && pack[regle.field] !== -1) {
      // Compter l'usage depuis le début de la période
      const debutPeriode = abonnement.dateDebut;
      const usage = await UsageLog.aggregate([
        {
          $match: {
            userId: req.user.id,
            typeRequete,
            createdAt: { $gte: debutPeriode }
          }
        },
        { $group: { _id: null, total: { $sum: '$quantite' } } }
      ]);

      const totalConsomme = usage[0]?.total || 0;
      const quotaMax      = pack[regle.field];
      const restant       = quotaMax - totalConsomme;

      if (restant <= 0) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_DEPASSE',
          message: `Quota épuisé pour ce cycle. Votre quota de ${quotaMax.toLocaleString()} ${
            typeRequete === 'liste' ? 'adresses' : typeRequete + 's'
          } est atteint.`,
          quotaMax,
          quotaConsomme: totalConsomme,
          dateRenouvellement: abonnement.dateFin,
          action: 'attendre_renouvellement'
        });
      }

      // Attacher les infos quota à la requête pour usage en aval
      req.quota = { restant, quotaMax, totalConsomme, typeRequete };
    }

    // 4. Attacher l'abonnement à la requête
    req.abonnement = abonnement;
    req.pack       = pack;
    next();

  } catch (err) {
    next(err);
  }
};

// ── Middleware : logger l'usage après une requête réussie ──
exports.loggerUsage = (typeRequete, quantiteField = 'quantite') =>
  async (req, res, next) => {
    // S'exécute après la réponse
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.abonnement) {
        try {
          const quantite = req.body?.[quantiteField] || req.query?.[quantiteField] || 1;
          await UsageLog.create({
            userId:       req.user.id,
            abonnementId: req.abonnement._id,
            packId:       req.pack._id,
            typeRequete,
            quantite:     parseInt(quantite) || 1,
          });
        } catch (e) {
          console.error('⚠️ Erreur log usage:', e.message);
        }
      }
    });
    next();
  };


// ════════════════════════════════════════════════════════
// server/src/models/UsageLog.model.js  (NOUVEAU FICHIER)
// ════════════════════════════════════════════════════════
/*
const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  abonnementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  packId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pack',
    required: true
  },
  typeRequete: {
    type: String,
    enum: ['liste', 'detail', 'fiche', 'statistique'],
    required: true
  },
  quantite: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

// Index pour calculer l'usage rapidement
usageLogSchema.index({ userId: 1, typeRequete: 1, createdAt: 1 });

module.exports = mongoose.model('UsageLog', usageLogSchema);
*/


// ════════════════════════════════════════════════════════
// EXEMPLE D'UTILISATION dans une route
// server/src/routes/demande.routes.js
// ════════════════════════════════════════════════════════
/*
const { verifierQuota, loggerUsage } = require('../middlewares/quota.middleware');

// Avant de traiter une demande de liste → vérifier quota + logger
router.post('/liste',
  proteger,
  verifierQuota('liste'),       // ← Bloque si quota atteint
  loggerUsage('liste'),         // ← Enregistre l'usage
  ctrl.creerDemandeListe
);

router.post('/fiche',
  proteger,
  verifierQuota('fiche'),
  loggerUsage('fiche'),
  ctrl.creerDemandeFiche
);

router.post('/statistique',
  proteger,
  verifierQuota('statistique'),
  loggerUsage('statistique'),
  ctrl.creerDemandeStatistique
);
*/