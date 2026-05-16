// server/src/routes/payment.routes.js
// LigdiCash API — Burkina Faso (Orange Money, Moov Money, Wallet LigdiCash)
const express      = require('express');
const router       = express.Router();
const { proteger } = require('../middlewares/auth.middleware');
const Abonnement   = require('../models/Abonnement.model');

const LIGDI_APIKEY = process.env.LIGDICASH_API_KEY || process.env.LIGDICASH_APIKEY;
const LIGDI_TOKEN  = process.env.LIGDICASH_TOKEN;
const LIGDI_BASE   = 'https://app.ligdicash.com';
const CLIENT_URL   = process.env.CLIENT_URL || 'http://localhost:3000';
const SERVER_URL   = process.env.SERVER_URL || 'http://localhost:5000';

function ligdiHeaders() {
  return {
    'Apikey':        LIGDI_APIKEY,
    'Authorization': `Bearer ${LIGDI_TOKEN}`,
    'Accept':        'application/json',
    'Content-Type':  'application/json',
  };
}

// Stocker les références en mémoire le temps du paiement
const transactionsEnCours = new Map();

// ════════════════════════════════════════════════
// POST /api/paiements/initier
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

    // ── Mode démo si clés manquantes ──
    if (!LIGDI_APIKEY || !LIGDI_TOKEN) {
      return res.json({
        success:    true,
        reference,
        demo:       true,
        paymentUrl: null,
        message:    'LigdiCash non configuré — mode démonstration',
      });
    }

    // Numéro de téléphone formaté sans +
    const telephone = req.user.telephone
      ? req.user.telephone.replace(/^\+/, '').replace(/^00/, '')
      : '22670000000';
    const telFormate = telephone.startsWith('226') ? telephone : `226${telephone.replace(/^0/, '')}`;

    const body = {
      commande: {
        invoice: {
          items: [{
            name:        `Abonnement NERE CCI-BF`,
            description: `Pack ${packNom} — ${periode}`,
            quantity:    1,
            unit_price:  montant,
            total_price: montant,
          }],
          total_amount:       montant,
          devise:             'XOF',
          description:        `Abonnement NERE CCI-BF — Pack ${packNom} (${periode})`,
          customer:           telFormate,
          customer_firstname: req.user.prenom || 'Client',
          customer_lastname:  req.user.nom    || 'NERE',
          customer_email:     req.user.email  || 'client@nere.bf',
          external_id:        '',
          custom_data: [
            { userId:    String(req.user.id) },
            { montant:   String(montant)     },
            { reference: reference           },
          ],
        },
        store: {
          name:        'NERE CCI-BF',
          website_url: CLIENT_URL,
        },
        actions: {
          cancel_url:   `${CLIENT_URL}/paiement/retour?ref=${reference}&status=cancelled`,
          return_url:   `${CLIENT_URL}/paiement/retour?ref=${reference}&status=success`,
          callback_url: `${SERVER_URL}/api/paiements/notify`,
        },
      },
    };

    const response = await fetch(`${LIGDI_BASE}/pay/v01/straight/checkout-invoice/create`, {
      method:  'POST',
      headers: ligdiHeaders(),
      body:    JSON.stringify(body),
    });

    const data = await response.json();
    console.log('LigdiCash réponse:', JSON.stringify(data));

    if (data.response_code === '00' && data.token) {
      // Stocker en mémoire pour le callback
      transactionsEnCours.set(data.token, {
        userId:    req.user.id,
        montant,
        reference,
      });

      return res.json({
        success:    true,
        reference,
        token:      data.token,
        paymentUrl: `${LIGDI_BASE}/pay/checkout/direct/${data.token}`,
        message:    'Redirection vers LigdiCash Mobile Money',
      });
    }

    console.error(' LigdiCash erreur:', data);
    return res.json({
      success:  true,
      reference,
      demo:     true,
      message:  data.response_text || 'Erreur LigdiCash — mode démonstration',
    });

  } catch(err) {
    console.error('Erreur initier paiement:', err.message);
    res.status(500).json({ success:false, message:err.message });
  }
});

// ════════════════════════════════════════════════
// POST /api/paiements/notify
// Callback LigdiCash — confirmation automatique
// ════════════════════════════════════════════════
router.post('/notify', async (req, res) => {
  try {
    console.log('Callback LigdiCash:', JSON.stringify(req.body));

    const { token, status, montant, amount, custom_data } = req.body;

    if (status !== 'completed') {
      console.warn(`Statut: ${status}`);
      return res.json({ status:'success' });
    }

    // Récupérer userId et montant
    let userId    = null;
    let reference = null;
    let montantConfirme = parseInt(montant || amount) || 5000;

    // Depuis custom_data
    if (Array.isArray(custom_data)) {
      custom_data.forEach(item => {
        if (item.userId)    userId    = item.userId;
        if (item.reference) reference = item.reference;
        if (item.montant)   montantConfirme = parseInt(item.montant) || montantConfirme;
      });
    }

    // Depuis la Map en mémoire
    if (!userId && token && transactionsEnCours.has(token)) {
      const tx  = transactionsEnCours.get(token);
      userId    = tx.userId;
      reference = tx.reference;
      montantConfirme = tx.montant || montantConfirme;
      transactionsEnCours.delete(token);
    }

    if (!userId) {
      console.warn(' userId introuvable pour token:', token);
      return res.json({ status:'success' });
    }

    // Trouver ou créer l'abonnement
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

    // Utiliser la méthode recharger du modèle
    const nouveauSolde = await abo.recharger(
      montantConfirme,
      `Paiement LigdiCash confirmé — Réf: ${reference || token}`
    );

    // Mettre à jour le pack selon le nouveau solde
    abo.pack = abo.solde >= 15000 ? 'pack3' : abo.solde >= 10000 ? 'pack2' : 'pack1';
    await abo.save();

    console.log(` Solde rechargé: +${montantConfirme} FCFA → ${nouveauSolde} FCFA`);
    res.json({ status:'success' });

  } catch(err) {
    console.error('Erreur callback:', err.message);
    res.json({ status:'error' });
  }
});

// ════════════════════════════════════════════════
// POST /api/paiements/activer-agence
// Activation manuelle admin après paiement agence
// ════════════════════════════════════════════════
router.post('/activer-agence', proteger, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ success:false, message:'Accès refusé.' });
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

    await abo.recharger(montant, `Paiement agence CCI-BF validé — Réf: ${reference}`);
    abo.pack = abo.solde >= 15000 ? 'pack3' : abo.solde >= 10000 ? 'pack2' : 'pack1';
    await abo.save();

    res.json({
      success: true,
      message: ` Abonnement activé : +${montant.toLocaleString('fr-FR')} FCFA`,
      data:    { solde: abo.solde },
    });

  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// ════════════════════════════════════════════════
// GET /api/paiements/historique
// ════════════════════════════════════════════════
router.get('/historique', proteger, async (req, res) => {
  try {
    const abo = await Abonnement.findOne({ userId: req.user.id });
    if (!abo) return res.json({ success:true, data:[] });

    const historique = abo.historique
      .filter(h => ['credit','debit'].includes(h.type))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success:true, data:historique });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

module.exports = router;