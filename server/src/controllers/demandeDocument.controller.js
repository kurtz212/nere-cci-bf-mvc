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

// ── POST /api/demandes/special-notification — Notification spéciale admin ──
exports.specialNotification = async (req, res, next) => {
  try {
    const {
      typeRequete, sousType, quantite, description, contact, telephone, userInfo
    } = req.body;

    // Créer le contenu de l'email détaillé
    const emailContent = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <h2>🔔 Nouvelle demande spéciale — ${typeRequete === 'autre' ? 'Répertoire Thématique' : 'Fiche'}</h2>

        <div style="background:#f5f5f5;padding:20px;border-radius:8px;margin:20px 0;">
          <h3>Informations de la demande :</h3>
          <p><strong>Type :</strong> ${typeRequete === 'autre' ? 'Répertoire Thématique' : 'Fiche entreprise'}</p>
          ${sousType ? `<p><strong>Sous-type :</strong> ${sousType}</p>` : ''}
          ${quantite ? `<p><strong>Quantité :</strong> ${quantite}</p>` : ''}
          ${description ? `<p><strong>Description :</strong> ${description}</p>` : ''}
        </div>

        <div style="background:#e8f5e8;padding:20px;border-radius:8px;margin:20px 0;">
          <h3>Coordonnées du client :</h3>
          <p><strong>Nom :</strong> ${userInfo.prenom} ${userInfo.nom}</p>
          <p><strong>Email principal :</strong> ${userInfo.email}</p>
          <p><strong>Email de contact :</strong> ${contact}</p>
          ${telephone ? `<p><strong>Téléphone :</strong> ${telephone}</p>` : ''}
          <p><strong>Rôle :</strong> ${userInfo.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</p>
        </div>

        <div style="background:#fff3cd;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #ffc107;">
          <h3>💰 Crédit débité :</h3>
          <p><strong>Montant :</strong> ${req.body.montantEstime ? req.body.montantEstime.toLocaleString('fr-FR') : (typeRequete === 'autre' ? '5,000' : '1,000')} FCFA</p>
          <p><em>Un agent doit contacter le client pour établir le devis final et organiser le paiement.</em></p>
        </div>

        <p style="color:#666;font-size:12px;margin-top:30px;">
          Cette notification a été générée automatiquement le ${new Date().toLocaleString('fr-FR')}.
        </p>
      </div>
    `;

    // Envoyer l'email à l'admin
    await emailService.envoyerEmail({
      to: process.env.SMTP_USER, // Email de l'admin
      subject: `🔔 Demande spéciale — ${userInfo.prenom} ${userInfo.nom}`,
      html: emailContent,
    });

    res.status(200).json({ success: true, message: 'Notification envoyée à l\'administrateur' });
  } catch (err) {
    console.error('Erreur notification spéciale:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de la notification' });
  }
};