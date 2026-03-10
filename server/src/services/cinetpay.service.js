const axios = require('axios');

exports.initierPaiement = async ({ montant, transactionId, description, userId }) => {
  const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', {
    apikey:         process.env.CINETPAY_API_KEY,
    site_id:        process.env.CINETPAY_SITE_ID,
    transaction_id: transactionId,
    amount:         montant,
    currency:       'XOF',
    description,
    customer_id:    userId,
    notify_url:     `${process.env.SERVER_URL}/api/paiements/callback`,
    return_url:     `${process.env.CLIENT_URL}/paiement/retour`,
  });
  return response.data;
};
