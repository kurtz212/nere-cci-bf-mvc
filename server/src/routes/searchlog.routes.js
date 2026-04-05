const express  = require('express');
const axios    = require('axios');
const router   = express.Router();
const { proteger, autoriser } = require('../middlewares/auth.middleware');
const SearchLog    = require('../models/SearchLog.model');

const buildNereQuery = (criteres = {}) => {
  const params = {};
  if (criteres.nom) params.nom = criteres.nom;
  if (criteres.rccm) params.rccm = criteres.rccm;
  if (criteres.secteur) params.secteur = criteres.secteur;
  if (criteres.region) params.region = criteres.region;
  if (criteres.ville) params.ville = criteres.ville;
  if (criteres.ifu) params.ifu = criteres.ifu;
  if (criteres.raisonSociale) params.nom = criteres.raisonSociale;
  return params;
};

const fetchCurrentSearchResults = async (criteres = {}) => {
  if (!process.env.NERE_API_URL) {
    return { count: 0, data: [] };
  }
  const params = buildNereQuery(criteres);
  const response = await axios.get(`${process.env.NERE_API_URL}/entreprises`, {
    params,
    timeout: 15000,
  });
  return {
    count: response.data.data?.length || 0,
    data: response.data.data || [],
  };
};

// POST /api/searchlogs — Enregistrer une recherche
router.post('/', proteger, async (req, res) => {
  try {
    const { description, criteres, resultatCount, nbResultats } = req.body;
    const log = await SearchLog.create({
      userId: req.user.id,
      description: description || 'Recherche sans titre',
      criteres,
      resultatCount: resultatCount ?? nbResultats ?? 0,
    });
    res.status(201).json({ success:true, data:log });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// GET /api/searchlogs/recent — Activité récente pour les administrateurs
router.get('/recent', proteger, autoriser('admin'), async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || 8), 20);
    const logs = await SearchLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'nom prenom')
      .lean();

    const formatted = logs.map(log => ({
      id: log._id,
      user: log.userId ? `${log.userId.prenom || ''} ${log.userId.nom || ''}`.trim() : 'Utilisateur inconnu',
      description: log.description || '',
      criteres: log.criteres || {},
      resultatCount: log.resultatCount || 0,
      createdAt: log.createdAt,
    }));

    res.json({ success:true, count:formatted.length, data:formatted });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// POST /api/searchlogs/:id/replay — Relancer une recherche sauvegardée et vérifier les changements
router.post('/:id/replay', proteger, async (req, res) => {
  try {
    const log = await SearchLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success:false, message:'Recherche non trouvée.' });
    }
    if (log.userId.toString() !== req.user.id) {
      return res.status(403).json({ success:false, message:'Accès refusé à cette recherche.' });
    }

    const oldCount = log.resultatCount ?? log.nbResultats ?? 0;
    const current = await fetchCurrentSearchResults(log.criteres);
    const changed = current.count !== oldCount;

    log.lastConsultedAt = new Date();
    await log.save();

    if (!changed) {
      return res.json({
        success: true,
        updated: false,
        billed: false,
        message: 'Aucune mise à jour détectée depuis la dernière consultation.',
        currentCount: current.count,
        data: current.data,
      });
    }

    const newLog = await SearchLog.create({
      userId: req.user.id,
      description: `${log.description || 'Recherche enregistrée'} (reprise)`,
      criteres: log.criteres,
      resultatCount: current.count,
      forfait: log.forfait,
      lastConsultedAt: new Date(),
    });

    res.json({
      success: true,
      updated: true,
      billed: true,
      message: 'Des modifications ont été détectées : la recherche est traitée comme une nouvelle requête.',
      currentCount: current.count,
      data: current.data,
      newLog,
    });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// GET /api/searchlogs/mon-historique — Historique de l'utilisateur connecté
router.get('/mon-historique', proteger, async (req, res) => {
  try {
    const { forfait, page=1, limit=20 } = req.query;
    const filtre = { userId: req.user.id };
    if (forfait) filtre.forfait = forfait;

    const logs = await SearchLog.find(filtre)
      .sort('-createdAt')
      .skip((page-1)*limit)
      .limit(parseInt(limit))
      .lean();

    const total = await SearchLog.countDocuments(filtre);

    // Forfaits distincts utilisés
    const forfaits = await SearchLog.distinct('forfait', { userId: req.user.id });

    const formatted = logs.map(log => ({
      ...log,
      nbResultats: log.nbResultats ?? log.resultatCount ?? 0,
      resultatCount: log.resultatCount ?? log.nbResultats ?? 0,
    }));

    res.json({ success:true, count:formatted.length, total, forfaits, data:formatted });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

module.exports = router;