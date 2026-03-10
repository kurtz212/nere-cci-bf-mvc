const Payment = require('../models/Payment.model');
const axios   = require('axios');

exports.initierPaiement = async (req, res, next) => {
  try {
    const { packId, montant, methode } = req.body;
    const paiement = await Payment.create({
      userId: req.user.id, packId, montant, methode, statut: 'en_attente'
    });

    // TODO: Intégration CinetPay
    res.json({ success: true, data: paiement, paymentUrl: '#' });
  } catch (err) { next(err); }
};

exports.callbackPaiement = async (req, res, next) => {
  try {
    const { transaction_id, status } = req.body;
    const paiement = await Payment.findOneAndUpdate(
      { transactionId: transaction_id },
      { statut: status === 'ACCEPTED' ? 'reussi' : 'echoue' },
      { new: true }
    );
    res.json({ success: true, data: paiement });
  } catch (err) { next(err); }
};

exports.historiquesPaiements = async (req, res, next) => {
  try {
    const paiements = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: paiements });
  } catch (err) { next(err); }
};
