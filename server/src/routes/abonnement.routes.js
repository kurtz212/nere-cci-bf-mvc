// server/src/routes/abonnement.routes.js
const express      = require('express');
const router       = express.Router();
const { proteger } = require('../middlewares/auth.middleware');
const Abonnement   = require('../models/Abonnement.model');

const ROLES_PRIVILEGES = ['admin'];

const TARIFS = {
  liste:        250,
  statistique:  5000,
  fiche:        1000,
  detail:       1000,
  autre:        5000,
  recharge:     0,
};

/* POST /api/abonnements/deduire */
router.post('/deduire', proteger, async (req, res) => {
  try {
    const { typeRequete, quantite = 1, description } = req.body;
    const role = req.user?.role || 'abonne';

    /* ── Bypass immédiat pour admin uniquement ── */
    if (ROLES_PRIVILEGES.includes(role)) {
      return res.json({
        success:  true,
        bypasse:  true,
        message:  'Accès privilégié — aucune déduction.',
        data:     { solde: null },
      });
    }

    /* ── Abonné : vérifier et déduire ── */
    const prixUnitaire = TARIFS[typeRequete] ?? 250;
    const montant      = prixUnitaire * Math.max(1, parseInt(quantite) || 1);

    let abo = await Abonnement.findOne({ userId: req.user._id, actif: true }).sort('-createdAt');

    /* Fallback sans filtre actif */
    if (!abo) {
      const aboAny = await Abonnement.findOne({ userId: req.user._id }).sort('-createdAt');
      if (aboAny && aboAny.solde > 0) {
        aboAny.actif = true;
        await aboAny.save();
        abo = aboAny;
      }
    }

    if (!abo) {
      return res.status(403).json({
        success: false,
        code:    'NO_ABO',
        message: 'Aucun abonnement actif.',
      });
    }

    if (abo.solde < montant) {
      return res.status(402).json({
        success:      false,
        code:         'SOLDE_INSUFFISANT',
        cout:         montant,
        solde_actuel: abo.solde,
        manque:       montant - abo.solde,
        message:      `Solde insuffisant. Requis : ${montant.toLocaleString('fr-FR')} FCFA. Disponible : ${abo.solde.toLocaleString('fr-FR')} FCFA.`,
      });
    }

    const resultat = await abo.deduire(
      montant,
      typeRequete,
      description || `Requête ${typeRequete}`,
      role
    );

    return res.json({
      success: true,
      bypasse: false,
      data:    { solde: resultat.solde },
    });

  } catch (err) {
    console.error(' /abonnements/deduire :', err.message);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
});

/* GET /api/abonnements/mon-solde */
router.get('/mon-solde', proteger, async (req, res) => {
  try {
    const role = req.user?.role || 'abonne';

    if (ROLES_PRIVILEGES.includes(role)) {
      return res.json({
        success: true,
        data:    { solde: null, illimite: true, role },
      });
    }

    const abo = await Abonnement.findOne({ userId: req.user._id, actif: true }).sort('-createdAt');
    if (!abo) return res.status(404).json({ success: false, message: 'Aucun abonnement.' });

    return res.json({
      success: true,
      data:    {
        solde:          abo.solde,
        pack:           abo.pack,
        packLabel:      abo.packLabel,
        totalDepense:   abo.totalDepense,
        nbRequetes:     abo.nbRequetes,
        illimite:       false,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;