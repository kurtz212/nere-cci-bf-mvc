const User = require('../models/User.model');

// GET /api/users/profil
exports.getProfil = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// PUT /api/users/profil
exports.updateProfil = async (req, res, next) => {
  try {
    const { nom, prenom, telephone, ville, organisation } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { nom, prenom, telephone, ville, organisation },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// GET /api/users/historique
exports.getHistorique = async (req, res, next) => {
  try {
    const SearchLog = require('../models/SearchLog.model');
    const logs = await SearchLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};
