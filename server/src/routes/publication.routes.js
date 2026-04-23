// server/src/routes/publication.routes.js
const express    = require('express');
const router     = express.Router();
const { proteger }  = require('../middlewares/auth.middleware');
const { autoriser } = require('../middlewares/role.middleware');
const Publication   = require('../models/Publication.model');
const Abonnement    = require('../models/Abonnement.model');
const jwt           = require('jsonwebtoken');

// Niveaux d'accès par catégorie
const CATEGORIES_PAR_NIVEAU = {
  0: ['Communiqué'],
  1: ['Communiqué', 'Note technique', 'Classement'],
  2: ['Communiqué', 'Note technique', 'Classement', 'Rapport', 'Étude'],
};

// Middleware optionnel — charge le niveau d'accès sans bloquer les visiteurs
async function chargerSolde(req, res, next) {
  req.soldeUtilisateur   = 0;
  req.niveauPublications = -1;
  req.isAdminOrManager   = false;

  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  try {
    const token   = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userIdFromToken = decoded.id;

    // Charger l'utilisateur pour vérifier le rôle
    const User = require('../models/User.model');
    const user = await User.findById(decoded.id).select('role');

    if (user && (user.role === 'admin' || user.role === 'manager')) {
      req.isAdminOrManager   = true;
      req.niveauPublications = 99; // accès total
      return next();
    }

    // Utilisateur normal → vérifier l'abonnement
    const abo = await Abonnement.findOne({ userId: decoded.id, actif: true }).sort('-createdAt');

    if (abo && abo.solde > 0) {
      req.soldeUtilisateur = abo.solde;
      // Calculer le niveau selon le solde
      if (abo.solde >= 15000)      req.niveauPublications = 2;
      else if (abo.solde >= 5001)  req.niveauPublications = 1;
      else if (abo.solde >= 1)     req.niveauPublications = 0;
      else                         req.niveauPublications = -1;
    }
  } catch {
    // Token invalide → visiteur
  }

  next();
}

// ── GET /api/publications ──
router.get('/', chargerSolde, async (req, res) => {
  try {
    const { categorie, page=1, limit=20, all } = req.query;
    const filtre = {};

    // Admin/Manager avec all=true → tout voir sans filtre
    if (all === 'true' && req.isAdminOrManager) {
      // Pas de filtre statut
    } else {
      filtre.statut = { $in: ['publie', 'published'] };

      const niveau = req.niveauPublications;

      // Admin/Manager → tout voir
      if (niveau === 99) {
        if (categorie) filtre.categorie = categorie;
      } else if (niveau === -1) {
        // Visiteur non connecté ou solde épuisé → aucune publication
        return res.json({ success:true, count:0, total:0, data:[], niveauAcces:-1 });
      } else {
        const categoriesAutorisees = CATEGORIES_PAR_NIVEAU[niveau] || CATEGORIES_PAR_NIVEAU[0];
        if (categorie) {
          if (!categoriesAutorisees.includes(categorie)) {
            return res.json({ success:true, count:0, total:0, data:[], niveauAcces:niveau,
              message:`Cette catégorie nécessite un pack supérieur.` });
          }
          filtre.categorie = categorie;
        } else {
          filtre.categorie = { $in: categoriesAutorisees };
        }
      }
    }

    const total = await Publication.countDocuments(filtre);
    const pubs  = await Publication.find(filtre)
      .sort('-createdAt')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success:true, count:pubs.length, total, data:pubs, niveauAcces:req.niveauPublications });

  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// ── GET /api/publications/:id ──
router.get('/:id', chargerSolde, async (req, res) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ success:false, message:'Publication introuvable' });

    const niveau = req.niveauPublications;

    if (niveau !== 99) {
      const categoriesAutorisees = CATEGORIES_PAR_NIVEAU[niveau] || [];
      if (niveau === -1 || !categoriesAutorisees.includes(pub.categorie)) {
        return res.status(403).json({ success:false,
          message:`Cette publication nécessite un pack supérieur.`, niveauAcces:niveau });
      }
    }

    pub.vues = (pub.vues || 0) + 1;
    await pub.save();

    res.json({ success:true, data:pub, niveauAcces:niveau });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

// ── POST /api/publications ──
router.post('/', proteger, autoriser('admin','manager'), async (req, res) => {
  try {
    const pub = await Publication.create({ ...req.body, auteur:req.user.id });
    res.status(201).json({ success:true, data:pub });
  } catch(err) {
    res.status(400).json({ success:false, message:err.message });
  }
});

// ── PUT /api/publications/:id ──
router.put('/:id', proteger, autoriser('admin','manager'), async (req, res) => {
  try {
    const pub = await Publication.findByIdAndUpdate(req.params.id, req.body, { new:true });
    if (!pub) return res.status(404).json({ success:false, message:'Publication introuvable' });
    res.json({ success:true, data:pub });
  } catch(err) {
    res.status(400).json({ success:false, message:err.message });
  }
});

// ── DELETE /api/publications/:id ──
router.delete('/:id', proteger, autoriser('admin'), async (req, res) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ success:true, message:'Publication supprimée' });
  } catch(err) {
    res.status(500).json({ success:false, message:err.message });
  }
});

module.exports = router;