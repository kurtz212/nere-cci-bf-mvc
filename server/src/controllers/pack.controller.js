const Pack = require('../models/Pack.model');

exports.getAllPacks = async (req, res, next) => {
  try {
    const packs = await Pack.find({ isActive: true }).sort({ accessLevel: 1 });
    res.json({ success: true, data: packs });
  } catch (err) { next(err); }
};

exports.getPackById = async (req, res, next) => {
  try {
    const pack = await Pack.findById(req.params.id);
    if (!pack) return res.status(404).json({ success: false, message: 'Pack introuvable.' });
    res.json({ success: true, data: pack });
  } catch (err) { next(err); }
};
