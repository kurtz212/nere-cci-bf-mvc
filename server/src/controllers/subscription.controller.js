const Subscription = require('../models/Subscription.model');
const Pack         = require('../models/Pack.model');

exports.monAbonnement = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id, statut: 'actif' })
      .populate('packId');
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
};

exports.abonner = async (req, res, next) => {
  try {
    const { packId, transactionId } = req.body;
    const pack = await Pack.findById(packId);
    if (!pack) return res.status(404).json({ success: false, message: 'Pack introuvable.' });

    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + pack.dureeJours);

    const sub = await Subscription.create({
      userId: req.user.id, packId,
      dateDebut: new Date(), dateFin,
      transactionId, statut: 'actif'
    });
    res.status(201).json({ success: true, data: sub });
  } catch (err) { next(err); }
};
