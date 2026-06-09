// server/src/controllers/payment.controller.js
// Monapai API — Burkina Faso — Orange Money BF + Moov Money BF
// + Simulateur OTP démo (soutenance)
const axios = require('axios');

const MONAPAI_KEY_ID = process.env.MONAPAI_KEY_ID;
const MONAPAI_SECRET = process.env.MONAPAI_SECRET;
const MONAPAI_BASE   = 'https://monapai.com/api/v1';
const CLIENT_URL     = process.env.CLIENT_URL || 'https://localhost:3000';
const SERVER_URL     = process.env.SERVER_URL || 'http://localhost:5000';

// ══════════════════════════════════════════════
// Headers Monapai
// ══════════════════════════════════════════════
function monapaiHeaders() {
  return {
    'Authorization': `Bearer ${MONAPAI_KEY_ID}.${MONAPAI_SECRET}`,
    'Content-Type':  'application/json',
    'Accept':        'application/json',
  };
}

// ══════════════════════════════════════════════
// Initier un encaissement Mobile Money (Monapai réel)
// ══════════════════════════════════════════════
exports.initierPaiement = async ({
  montant, transactionId, description,
  userId, nomPack, telephone, email, prenom, nom
}) => {
  const telNettoye = (telephone || '')
    .replace(/[\s\-().+]/g, '')
    .replace(/^00226/, '')
    .replace(/^226/,   '')
    .replace(/^0/,     '');
  const telComplet = `226${telNettoye || '70000000'}`;

  const body = {
    amount:       montant,
    currency:     'XOF',
    phone:        telComplet,
    country:      'BF',
    description:  description || `Abonnement NERE CCI-BF — ${nomPack}`,
    reference:    transactionId,
    callback_url: `${SERVER_URL}/api/paiements/notify`,
    return_url:   `${CLIENT_URL}/paiement/retour?ref=${transactionId}&status=success`,
    cancel_url:   `${CLIENT_URL}/paiement/retour?ref=${transactionId}&status=cancelled`,
    customer: {
      name:  `${prenom || 'Client'} ${nom || 'NERE'}`,
      email: email || 'client@nere.bf',
      phone: telComplet,
    },
    metadata: {
      userId:    String(userId),
      reference: transactionId,
      montant:   String(montant),
      nomPack:   nomPack || 'Recharge',
    },
  };

  console.log('Monapai body:', JSON.stringify(body));
  const { data } = await axios.post(`${MONAPAI_BASE}/collect`, body, {
    headers: monapaiHeaders(),
    timeout: 30000,
  });
  console.log('Monapai réponse:', JSON.stringify(data));

  if (data.status === 'success' || data.payment_url || data.url || data.checkout_url) {
    return {
      success:    true,
      reference:  transactionId,
      paymentUrl: data.payment_url || data.url || data.checkout_url,
      token:      data.id || data.transaction_id || transactionId,
      message:    'Redirection vers Monapai Mobile Money',
    };
  }
  throw new Error(data.message || `Erreur Monapai: ${JSON.stringify(data)}`);
};

// ══════════════════════════════════════════════
// Vérifier le statut d'une transaction (Monapai réel)
// ══════════════════════════════════════════════
exports.verifierPaiement = async (transactionId) => {
  try {
    const { data } = await axios.get(`${MONAPAI_BASE}/collect/${transactionId}`, {
      headers: monapaiHeaders(),
      timeout: 15000,
    });
    console.log('Monapai vérification:', JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Erreur vérification Monapai:', err.message);
    return null;
  }
};

// ══════════════════════════════════════════════
// SIMULATEUR DÉMO — OTP Mobile Money fictif
// Utilisé quand les clés Monapai ne sont pas configurées
// ══════════════════════════════════════════════

// Stockage en mémoire : référence → { otp, montant, userId, nomPack, telephone, expire }
const otpStore = new Map();

exports.initierPaiementDemo = ({ montant, transactionId, userId, nomPack, telephone }) => {
  // Générer un OTP à 6 chiffres
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  otpStore.set(transactionId, {
    otp,
    montant,
    userId,
    nomPack,
    telephone,
    expire: Date.now() + 5 * 60 * 1000, // expire dans 5 minutes
  });

  // Affichage dans la console serveur (à montrer pendant la soutenance)
  console.log('\n ========= OTP DÉMO =========');
  console.log(` Numéro  : +226${telephone}`);
  console.log(` Montant : ${montant.toLocaleString('fr-FR')} FCFA`);
  console.log(` Pack    : ${nomPack}`);
  console.log(` OTP     : \x1b[32m\x1b[1m${otp}\x1b[0m`);  // affiché en vert gras
  console.log(` Réf     : ${transactionId}`);
  console.log('==============================\n');

  return { success: true, reference: transactionId, otpEnvoye: true };
};

exports.validerOtpDemo = (transactionId, otpSaisi) => {
  const tx = otpStore.get(transactionId);

  if (!tx) {
    return { success: false, message: 'Transaction introuvable ou expirée.' };
  }
  if (Date.now() > tx.expire) {
    otpStore.delete(transactionId);
    return { success: false, message: 'Code OTP expiré. Veuillez recommencer.' };
  }
  if (tx.otp !== String(otpSaisi)) {
    return { success: false, message: 'Code OTP incorrect.' };
  }

  // OTP validé — supprimer de la map
  otpStore.delete(transactionId);
  return { success: true, ...tx };
};