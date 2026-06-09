// server/src/routes/payment.routes.js
// Monapai — Orange Money BF + Moov Money BF
// + Routes démo OTP simulateur (soutenance)
const express      = require('express');
const router       = express.Router();
const { proteger } = require('../middlewares/auth.middleware');
const Abonnement   = require('../models/Abonnement.model');
const payCtrl      = require('../controllers/payment.controller');

// Stockage temporaire des transactions en attente de webhook
const transactionsEnCours = new Map();

// ════════════════════════════════════════════════
// POST /api/paiements/initier
// Initiation paiement Monapai réel
// ════════════════════════════════════════════════
router.post('/initier', proteger, async (req, res) => {
  try {
    const { packNom, montant, periode, modePaiement } = req.body;
    const reference = `NERE-${Date.now().toString(36).toUpperCase()}-${req.user.id.toString().slice(-4).toUpperCase()}`;

    // ── Paiement en agence ──
    if (modePaiement === 'agence') {
      return res.json({
        success:  true,
        reference,
        agence:   true,
        message:  `Présentez la référence ${reference} à l'agence CCI-BF.`,
      });
    }

    // ── Vérifier clés Monapai ──
    if (!process.env.MONAPAI_KEY_ID || !process.env.MONAPAI_SECRET) {
      return res.json({
        success:  true,
        reference,
        demo:     true,
        message:  'Monapai non configuré — mode démonstration',
      });
    }

    const result = await payCtrl.initierPaiement({
      montant,
      transactionId: reference,
      description:   `Abonnement NERE CCI-BF — ${packNom} (${periode})`,
      userId:        req.user.id,
      nomPack:       packNom,
      telephone:     req.user.telephone || '',
      email:         req.user.email     || '',
      prenom:        req.user.prenom    || '',
      nom:           req.user.nom       || '',
    });

    transactionsEnCours.set(reference, {
      userId:  req.user.id,
      montant,
      token:   result.token,
    });

    return res.json({
      success:    true,
      reference,
      paymentUrl: result.paymentUrl,
      token:      result.token,
      message:    'Redirection vers Monapai Mobile Money',
    });

  } catch (err) {
    console.error('Erreur initier Monapai:', err.message);
    const reference = `NERE-${Date.now().toString(36).toUpperCase()}-DEMO`;
    return res.json({
      success:   true,
      reference,
      demo:      true,
      message:   `Monapai: ${err.message} — mode démonstration`,
    });
  }
});

// ════════════════════════════════════════════════
// POST /api/paiements/demo/initier
// Simulateur OTP — envoie un OTP fictif (console serveur)
// ════════════════════════════════════════════════
router.post('/demo/initier', proteger, async (req, res) => {
  try {
    const { packNom, montant, telephone } = req.body;

    if (!telephone) {
      return res.status(400).json({ success: false, message: 'Numéro de téléphone requis.' });
    }
    if (!montant || montant <= 0) {
      return res.status(400).json({ success: false, message: 'Montant invalide.' });
    }

    // Nettoyer le numéro
    const telNettoye = String(telephone)
      .replace(/[\s\-().+]/g, '')
      .replace(/^00226/, '')
      .replace(/^226/,   '')
      .replace(/^0/,     '');

    const reference = `NERE-${Date.now().toString(36).toUpperCase()}-DEMO`;

    payCtrl.initierPaiementDemo({
      montant,
      transactionId: reference,
      userId:        req.user.id,
      nomPack:       packNom || 'Recharge',
      telephone:     telNettoye,
    });

    // Stocker pour la validation
    transactionsEnCours.set(reference, {
      userId:  req.user.id,
      montant,
      nomPack: packNom || 'Recharge',
    });

    return res.json({
      success:   true,
      reference,
      telephone: telNettoye,
      message:   `Code OTP envoyé au +226${telNettoye}. Valable 5 minutes.`,
    });

  } catch (err) {
    console.error('Erreur demo/initier:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════
// POST /api/paiements/demo/valider
// Simulateur OTP — valide le code et active l'abonnement
// ════════════════════════════════════════════════
router.post('/demo/valider', proteger, async (req, res) => {
  try {
    const { reference, otp } = req.body;

    if (!reference || !otp) {
      return res.status(400).json({ success: false, message: 'Référence et OTP requis.' });
    }

    // Valider l'OTP
    const validation = payCtrl.validerOtpDemo(reference, String(otp));
    if (!validation.success) {
      return res.status(400).json(validation);
    }

    const { montant, userId, nomPack } = validation;

    // Créditer l'abonnement
    let abo = await Abonnement.findOne({ userId });
    if (!abo) {
      abo = new Abonnement({
        userId,
        pack:           montant >= 15000 ? 'pack3' : montant >= 10000 ? 'pack2' : 'pack1',
        montantInitial: montant,
        solde:          0,
        actif:          true,
      });
    }

    await abo.recharger(montant, `Paiement Mobile Money DÉMO — Réf: ${reference}`);
    abo.pack = abo.solde >= 15000 ? 'pack3' : abo.solde >= 10000 ? 'pack2' : 'pack1';
    await abo.save();

    transactionsEnCours.delete(reference);

    console.log(` Abonnement crédité (démo) : +${montant} FCFA → solde ${abo.solde} FCFA — userId: ${userId}`);

    return res.json({
      success: true,
      message: `Paiement confirmé ! ${montant.toLocaleString('fr-FR')} FCFA crédités.`,
      data: {
        reference,
        montant,
        solde:   abo.solde,
        pack:    abo.pack,
        nomPack,
      },
    });

  } catch (err) {
    console.error('Erreur demo/valider:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════
// POST /api/paiements/notify
// Webhook Monapai — confirmation automatique
// ════════════════════════════════════════════════
router.post('/notify', async (req, res) => {
  try {
    console.log(' Webhook Monapai reçu:', JSON.stringify(req.body));

    const { status, amount, metadata, reference, id } = req.body;

    const estReussi = ['success', 'successful', 'approved', 'completed'].includes(
      String(status).toLowerCase()
    );

    if (!estReussi) {
      console.warn(` Paiement non réussi: ${status}`);
      return res.status(200).json({ success: false });
    }

    let userId          = null;
    let refTransaction  = reference || id;
    let montantConfirme = parseInt(amount) || 5000;

    if (metadata) {
      try {
        const meta = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
        userId          = meta.userId;
        refTransaction  = meta.reference || refTransaction;
        montantConfirme = parseInt(meta.montant) || montantConfirme;
      } catch (e) {
        console.warn('Erreur parsing metadata:', e.message);
      }
    }

    if (!userId && refTransaction && transactionsEnCours.has(refTransaction)) {
      const tx        = transactionsEnCours.get(refTransaction);
      userId          = tx.userId;
      montantConfirme = tx.montant || montantConfirme;
      transactionsEnCours.delete(refTransaction);
    }

    if (!userId) {
      console.warn(' userId introuvable pour:', refTransaction);
      return res.status(200).json({ success: false });
    }

    let abo = await Abonnement.findOne({ userId });
    if (!abo) {
      abo = new Abonnement({
        userId,
        pack:           montantConfirme >= 15000 ? 'pack3' : montantConfirme >= 10000 ? 'pack2' : 'pack1',
        montantInitial: montantConfirme,
        solde:          0,
        actif:          true,
      });
    }

    await abo.recharger(montantConfirme, `Paiement Monapai confirmé — Réf: ${refTransaction}`);
    abo.pack = abo.solde >= 15000 ? 'pack3' : abo.solde >= 10000 ? 'pack2' : 'pack1';
    await abo.save();

    console.log(` Solde rechargé (webhook): +${montantConfirme} FCFA → ${abo.solde} FCFA`);
    res.status(200).json({ success: true });

  } catch (err) {
    console.error('Erreur webhook Monapai:', err.message);
    res.status(200).json({ success: false });
  }
});

// ════════════════════════════════════════════════
// POST /api/paiements/activer-agence
// Activation manuelle par admin/manager
// ════════════════════════════════════════════════
router.post('/activer-agence', proteger, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    const { userId, montant, reference } = req.body;
    let abo = await Abonnement.findOne({ userId });

    if (!abo) {
      abo = new Abonnement({
        userId,
        pack:           montant >= 15000 ? 'pack3' : montant >= 10000 ? 'pack2' : 'pack1',
        montantInitial: montant,
        solde:          0,
        actif:          true,
      });
    }

    await abo.recharger(montant, `Paiement agence CCI-BF — Réf: ${reference}`);
    abo.pack = abo.solde >= 15000 ? 'pack3' : abo.solde >= 10000 ? 'pack2' : 'pack1';
    await abo.save();

    res.json({
      success: true,
      message: ` Abonnement activé : +${montant.toLocaleString('fr-FR')} FCFA`,
      data:    { solde: abo.solde },
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════
// GET /api/paiements/historique
// ════════════════════════════════════════════════
router.get('/historique', proteger, async (req, res) => {
  try {
    const abo = await Abonnement.findOne({ userId: req.user.id });
    if (!abo) return res.json({ success: true, data: [] });

    const historique = abo.historique
      .filter(h => ['credit', 'debit'].includes(h.type))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: historique });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;