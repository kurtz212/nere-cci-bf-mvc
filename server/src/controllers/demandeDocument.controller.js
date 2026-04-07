// 📁 server/controllers/demandeDocument.controller.js

const Demande = require('../models/Demande.models');

/* ══════════════════════════════════════════════
   UTILISATEUR
══════════════════════════════════════════════ */

// POST /api/demandes
// Créer une nouvelle demande
exports.creerDemande = async (req, res) => {
  try {
    const {
      typeRequete, sousType, quantite,
      regions, villes, activites, formesJuridiques, tranches,
      description, contact, telephone, montantEstime,
    } = req.body;

    if (!typeRequete) {
      return res.status(400).json({ success: false, message: 'Le type de requête est obligatoire.' });
    }

    const demande = await Demande.create({
      user:             req.user.id,
      typeRequete,
      sousType:         sousType         || '',
      quantite:         quantite         || null,
      regions:          regions          || [],
      villes:           villes           || '',
      activites:        activites        || [],
      formesJuridiques: formesJuridiques || [],
      tranches:         tranches         || [],
      description:      description      || '',
      contact:          contact          || req.user.email || '',
      telephone:        telephone        || '',
      montantEstime:    montantEstime     || null,
      historiqueStatuts: [{
        statut:    'en_attente',
        changedBy: req.user.id,
      }],
    });

    res.status(201).json({ success: true, data: demande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/demandes/mes-demandes
// Historique des demandes de l'utilisateur connecté
exports.mesDemandes = async (req, res) => {
  try {
    const demandes = await Demande.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(100)
      .populate('gestionnaire', 'nom prenom');

    res.json({ success: true, count: demandes.length, data: demandes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/demandes/:id
// Détail d'une demande (propriétaire ou admin/manager)
exports.getDemandeById = async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id)
      .populate('user',        'nom prenom email telephone')
      .populate('gestionnaire','nom prenom email')
      .populate('notes.auteur','nom prenom');

    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }

    // Autoriser : propriétaire OU admin OU manager
    const isOwner   = demande.user._id.toString() === req.user.id;
    const isPriv    = ['admin','manager'].includes(req.user.role);
    if (!isOwner && !isPriv) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    res.json({ success: true, data: demande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/demandes/:id/annuler
// Annuler sa propre demande (seulement si en_attente)
exports.annulerDemande = async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);

    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }
    if (demande.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Vous ne pouvez annuler que vos propres demandes.' });
    }
    if (demande.statut !== 'en_attente') {
      return res.status(400).json({ success: false, message: 'Seules les demandes en attente peuvent être annulées.' });
    }

    demande.statut = 'annule';
    demande.historiqueStatuts.push({ statut: 'annule', changedBy: req.user.id });
    await demande.save();

    res.json({ success: true, data: demande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/demandes/:id/relancer
// Relancer une demande traitée ou rejetée
exports.relancerDemande = async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id);

    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }
    if (demande.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }
    if (!['traite','rejete'].includes(demande.statut)) {
      return res.status(400).json({ success: false, message: 'Seules les demandes traitées ou rejetées peuvent être relancées.' });
    }

    demande.statut          = 'en_attente';
    demande.nbRelances      = (demande.nbRelances || 0) + 1;
    demande.derniereRelance = new Date();
    demande.historiqueStatuts.push({ statut: 'en_attente', changedBy: req.user.id });
    await demande.save();

    res.json({ success: true, data: demande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/demandes/special-notification
// Notification admin pour demandes spéciales (fiche / répertoire)
exports.specialNotification = async (req, res) => {
  try {
    // Ici tu peux brancher nodemailer pour envoyer un email à l'admin
    // Pour l'instant on log et on retourne succès
    console.log('[NOTIFICATION SPÉCIALE]', {
      user:        req.user.id,
      typeRequete: req.body.typeRequete,
      contact:     req.body.contact,
      telephone:   req.body.telephone,
    });

    // TODO: envoyer email avec nodemailer
    // await sendMailAdmin({ ...req.body, userInfo: req.user });

    res.json({ success: true, message: 'Notification envoyée.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ══════════════════════════════════════════════
   GESTIONNAIRE (manager)
══════════════════════════════════════════════ */

// GET /api/demandes/toutes
// Toutes les demandes — accessible admin ET manager
exports.getAllDemandes = async (req, res) => {
  try {
    const filtre = {};

    // Filtres optionnels via query params
    if (req.query.statut && req.query.statut !== 'tous') {
      filtre.statut = req.query.statut;
    }
    if (req.query.typeRequete) {
      filtre.typeRequete = req.query.typeRequete;
    }

    const demandes = await Demande.find(filtre)
      .sort('-createdAt')
      .limit(200)
      .populate('user',        'nom prenom email telephone')
      .populate('gestionnaire','nom prenom');

    res.json({ success: true, count: demandes.length, data: demandes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/demandes/:id/statut
// Changer le statut d'une demande — admin ET manager
exports.updateStatut = async (req, res) => {
  try {
    const { statut } = req.body;
    const statutsValides = ['en_attente','en_cours','traite','rejete'];

    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ success: false, message: 'Statut invalide.' });
    }

    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }

    demande.statut = statut;
    demande.historiqueStatuts.push({ statut, changedBy: req.user.id });

    // Assigner automatiquement le gestionnaire si prise en charge
    if (statut === 'en_cours' && !demande.gestionnaire) {
      demande.gestionnaire = req.user.id;
    }

    await demande.save();

    res.json({ success: true, data: demande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Alias pour la route admin existante (rétrocompatibilité)
exports.updateStatutAdmin = exports.updateStatut;

// POST /api/demandes/:id/note
// Ajouter une note interne — admin ET manager
exports.ajouterNote = async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'La note ne peut pas être vide.' });
    }

    const demande = await Demande.findById(req.params.id);
    if (!demande) {
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    }

    demande.notes.push({ auteur: req.user.id, texte: note.trim() });
    await demande.save();

    // Retourner la demande avec les notes peuplées
    await demande.populate('notes.auteur', 'nom prenom');

    res.json({ success: true, data: demande });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};