const Publication = require('../models/Publication.model');

exports.getPublications = async (req, res, next) => {
  try {
    const packLevel = req.user ? (req.user.packLevel || 0) : 0;
    const { categorie, q } = req.query;
    const filtre = { isPublished: true, accessLevel: { $lte: packLevel } };
    if (categorie) filtre.categorie = categorie.toUpperCase();
    if (q) filtre.$text = { $search: q };

    const publications = await Publication.find(filtre).sort({ createdAt: -1 });
    res.json({ success: true, data: publications });
  } catch (err) { next(err); }
};

exports.getPublicationById = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ success: false, message: 'Publication introuvable.' });
    const packLevel = req.user ? (req.user.packLevel || 0) : 0;
    if (pub.accessLevel > packLevel)
      return res.status(403).json({ success: false, message: 'Abonnement requis.' });
    res.json({ success: true, data: pub });
  } catch (err) { next(err); }
};
