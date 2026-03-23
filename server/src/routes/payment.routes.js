const express  = require('express');
const router   = express.Router();
const { proteger } = require('../middlewares/auth.middleware');

// POST /api/paiements/initier
router.post('/initier', proteger, async (req, res) => {
  try {
    const { packNom, montant, periode, modePaiement } = req.body;

    // Générer une référence unique
    const reference = `NERE-${Date.now().toString(36).toUpperCase()}-${req.user.id.toString().slice(-4).toUpperCase()}`;

    if (modePaiement === 'cinetpay') {
      // ── CinetPay ──
      const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
      const CINETPAY_SECRET  = process.env.CINETPAY_SECRET;

      if (CINETPAY_API_KEY && CINETPAY_SECRET && CINETPAY_API_KEY !== 'your_key') {
        try {
          const cinetpayRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apikey:           CINETPAY_API_KEY,
              site_id:          CINETPAY_SECRET,
              transaction_id:   reference,
              amount:           montant,
              currency:         'XOF',
              description:      `Abonnement NERE CCI-BF — Pack ${packNom} (${periode})`,
              return_url:       `${process.env.CLIENT_URL}/paiement?status=success&ref=${reference}`,
              notify_url:       `${process.env.CLIENT_URL}/api/paiements/notify`,
              customer_name:    req.user.nom,
              customer_surname: req.user.prenom,
              customer_email:   req.user.email || '',
              customer_phone_number: req.user.telephone || '',
              customer_address: 'Ouagadougou',
              customer_city:    'Ouagadougou',
              customer_country: 'BF',
              customer_state:   'BF',
              customer_zip_code:'00000',
              channels:         'ALL',
              lang:             'fr',
            }),
          });
          const cinetpayData = await cinetpayRes.json();

          if (cinetpayData.code === '201') {
            return res.json({
              success:    true,
              reference,
              paymentUrl: cinetpayData.data?.payment_url,
              message:    'Redirection vers CinetPay',
            });
          }
        } catch(e) {
          console.warn('⚠️ CinetPay indisponible:', e.message);
        }
      }

      // Fallback si CinetPay non configuré
      return res.json({
        success:   true,
        reference,
        message:   'CinetPay non configuré — référence générée',
        demo:      true,
      });

    } else {
      // ── Paiement en agence ──
      return res.json({
        success:   true,
        reference,
        message:   `Présentez la référence ${reference} à l'agence CCI-BF`,
        agence:    true,
      });
    }

  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/paiements/notify — webhook CinetPay
router.post('/notify', async (req, res) => {
  try {
    const { transaction_id, status } = req.body;
    console.log(`💳 Notification CinetPay: ${transaction_id} → ${status}`);
    // TODO: mettre à jour l'abonnement de l'utilisateur
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;