const DemandeDocument = require('../models/DemandeDocument.model');
const emailService    = require('../services/email.service');

// ── POST /api/demandes — Créer une demande ──
exports.creerDemande = async (req, res, next) => {
  try {
    const {
      typeRequete, sousType, quantite, montantEstime,
      regions, villes, activites, formesJuridiques, tranches,
      description, contact, telephone,
      periodType, periodYear, periodStart, periodEnd,
    } = req.body;

    const demande = await DemandeDocument.create({
      userId: req.user?.id || null,
      typeRequete, sousType, quantite, montantEstime,
      regions, villes, activites, formesJuridiques, tranches,
      description, contact, telephone,
      periodType, periodYear, periodStart, periodEnd,
    });

    // Email — ignorer si SMTP non configuré
    try {
      await emailService.notifierNouvelleDemandeAdmin(demande);
    } catch(e) {
      console.warn('⚠️ Email admin non envoyé:', e.message);
    }

    res.status(201).json({ success: true, data: demande });
  } catch (err) { next(err); }
};

// ── GET /api/demandes/mes-demandes — Demandes de l'utilisateur connecté ──
exports.mesDemandes = async (req, res, next) => {
  try {
    const demandes = await DemandeDocument.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: demandes });
  } catch (err) { next(err); }
};

// ── GET /api/demandes/:id — Détail d'une demande ──
exports.getDemandeById = async (req, res, next) => {
  try {
    const demande = await DemandeDocument.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!demande)
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });
    res.json({ success: true, data: demande });
  } catch (err) { next(err); }
};

// ── PUT /api/admin/demandes/:id — Admin : mettre à jour le statut ──
exports.updateStatutAdmin = async (req, res, next) => {
  try {
    const { statut, noteAdmin } = req.body;
    const demande = await DemandeDocument.findByIdAndUpdate(
      req.params.id,
      {
        statut,
        noteAdmin,
        traitePar: req.user.id,
        dateTraitement: statut === 'traite' ? new Date() : null
      },
      { new: true }
    ).populate('userId', 'nom prenom email');

    if (!demande)
      return res.status(404).json({ success: false, message: 'Demande introuvable.' });

    // Notifier l'utilisateur du changement de statut
    if (statut === 'traite' || statut === 'rejete') {
      await emailService.notifierStatutDemande(demande.userId, demande);
    }

    res.json({ success: true, data: demande });
  } catch (err) { next(err); }
};

// ── GET /api/admin/demandes — Admin : toutes les demandes ──
exports.getAllDemandes = async (req, res, next) => {
  try {
    const { statut } = req.query;
    const filtre = statut ? { statut } : {};
    const demandes = await DemandeDocument.find(filtre)
      .populate('userId', 'nom prenom email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: demandes });
  } catch (err) { next(err); }
};