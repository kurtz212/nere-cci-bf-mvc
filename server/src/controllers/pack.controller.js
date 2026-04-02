const Pack = require('../models/Pack.model');

exports.getAllPacks = async (req, res, next) => {
  try {
    const pack = await Pack.findOne({ nom: 'Standard', isActive: true });
    if (!pack) return res.status(404).json({ success: false, message: 'Pack non disponible.' });
    
    // Retourner les options du pack
    res.json({ success: true, data: pack.options });
  } catch (err) { next(err); }
};

exports.getPackById = async (req, res, next) => {
  try {
    const pack = await Pack.findOne({ nom: 'Standard' });
    if (!pack) return res.status(404).json({ success: false, message: 'Pack introuvable.' });
    
    const option = pack.options.find(opt => opt.niveau === parseInt(req.params.id));
    if (!option) return res.status(404).json({ success: false, message: 'Option de pack introuvable.' });
    
    res.json({ success: true, data: option });
  } catch (err) { next(err); }
};
