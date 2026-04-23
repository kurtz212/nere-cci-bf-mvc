// server/src/controllers/publication.controller.js
const Publication = require('../models/Publication.model');

exports.getPublications = async (req, res, next) => {
  try {
    const { categorie, q, limit = 100, page = 1, all } = req.query;

    // Niveau d'accès selon l'utilisateur connecté
    const packLevel = req.user
      ? (req.user.role === 'admin' || req.user.role === 'manager' ? 99 : (req.user.packLevel || 1))
      : 0; // visiteur → voit accessLevel 0

    const filtre = {
      isPublished: true,
      accessLevel: { $lte: packLevel },
    };

    if (categorie) filtre.categorie = categorie;
    if (q) filtre.$or = [
      { titre:   { $regex: q, $options: 'i' } },
      { extrait: { $regex: q, $options: 'i' } },
    ];

    const total = await Publication.countDocuments(filtre);
    const publications = await Publication
      .find(filtre)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v');

    res.json({
      success:     true,
      count:       publications.length,
      total,
      page:        parseInt(page),
      niveauAcces: packLevel,
      data:        publications,
    });
  } catch (err) { next(err); }
};

exports.getPublicationById = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ success:false, message:'Publication introuvable.' });

    const packLevel = req.user
      ? (req.user.role === 'admin' || req.user.role === 'manager' ? 99 : (req.user.packLevel || 1))
      : 0;

    if (pub.accessLevel > packLevel)
      return res.status(403).json({ success:false, message:'Abonnement requis pour accéder à cette publication.' });

    // Incrémenter les vues
    await Publication.findByIdAndUpdate(req.params.id, { $inc: { vues: 1 } });

    res.json({ success:true, data: pub });
  } catch (err) { next(err); }
};

exports.createPublication = async (req, res, next) => {
  try {
    const { titre, extrait, contenu, categorie, accessLevel, tags } = req.body;
    const pub = await Publication.create({
      titre,
      extrait,
      contenu,
      categorie:   categorie   || 'Rapport',
      accessLevel: accessLevel !== undefined ? parseInt(accessLevel) : 0,
      tags:        tags        || [],
      isPublished: true,
      auteur:      req.user?.id,
    });
    res.status(201).json({ success:true, data: pub });
  } catch (err) { next(err); }
};

exports.updatePublication = async (req, res, next) => {
  try {
    const pub = await Publication.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!pub) return res.status(404).json({ success:false, message:'Publication introuvable.' });
    res.json({ success:true, data: pub });
  } catch (err) { next(err); }
};

exports.deletePublication = async (req, res, next) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Publication supprimée.' });
  } catch (err) { next(err); }
};