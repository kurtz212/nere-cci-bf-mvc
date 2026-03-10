const User         = require('../models/User.model');
const Publication  = require('../models/Publication.model');
const Subscription = require('../models/Subscription.model');

exports.getStats = async (req, res, next) => {
  try {
    const [nbUsers, nbSubs, nbPubs] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ statut: 'actif' }),
      Publication.countDocuments({ isPublished: true }),
    ]);
    res.json({ success: true, data: { nbUsers, nbSubs, nbPubs } });
  } catch (err) { next(err); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

exports.creerPublication = async (req, res, next) => {
  try {
    const pub = await Publication.create({ ...req.body, auteur: req.user.id });
    res.status(201).json({ success: true, data: pub });
  } catch (err) { next(err); }
};

exports.updatePublication = async (req, res, next) => {
  try {
    const pub = await Publication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: pub });
  } catch (err) { next(err); }
};

exports.deletePublication = async (req, res, next) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Publication supprimée.' });
  } catch (err) { next(err); }
};
