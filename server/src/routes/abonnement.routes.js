const express    = require('express');
const router     = express.Router();
const Abonnement = require('../models/Abonnement.model');
const { proteger } = require('../middlewares/auth.middleware');

/* ══════════════════════════════════════════
   COÛTS PAR TYPE DE REQUÊTE
══════════════════════════════════════════ */
const COUTS = {
  liste:       250,   // par adresse
  Tableaux:    500,   // par tableau
  statistique: 5000,  // forfait par demande
  fiche:       1000,  // par fiche
  autre:       2000,  // répertoire thématique
};

/* ══════════════════════════════════════════
   PACKS — basés sur le solde réel

   Pack Essentiel     : solde = 5 000 FCFA
   Pack Professionnel : 5 001 – 14 999 FCFA
   Pack Entreprise    : ≥ 15 000 FCFA (montant flexible)
══════════════════════════════════════════ */
const PACKS = {
  pack1: { label:'Pack Essentiel',     montant:5000,  montantMin:5000,  montantMax:5000,  flexible:false },
  pack2: { label:'Pack Professionnel', montant:10000, montantMin:5001,  montantMax:14999, flexible:true  },
  pack3: { label:'Pack Entreprise',    montant:15000, montantMin:15000, montantMax:null,  flexible:true  },
};

/* Helper : nom du pack selon le solde */
function getNomPack(solde) {
  if (solde >= 15000) return { id:'pack3', label:'Pack Entreprise' };
  if (solde >= 5001)  return { id:'pack2', label:'Pack Professionnel' };
  if (solde >= 5000)  return { id:'pack1', label:'Pack Essentiel' };
  return { id:null, label:'Aucun pack actif' };
}

/* ──────────────────────────────────────────
   GET /api/abonnements/mon-solde
──────────────────────────────────────────── */
router.get('/mon-solde', proteger, async (req, res) => {
  try {
    const abo = await Abonnement.findOne({ userId:req.user.id, actif:true })
      .sort('-createdAt');
    if (!abo) return res.json({ success:true, data:null, message:'Aucun abonnement actif' });

    const packInfo = getNomPack(abo.solde);
    res.json({ success:true, data:{
      pack:           packInfo.id,
      packLabel:      packInfo.label,
      montantInitial: abo.montantInitial,
      solde:          abo.solde,
      actif:          abo.actif,
      id:             abo._id,
    }});
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

/* ──────────────────────────────────────────
   POST /api/abonnements/souscrire
   Première souscription (compte sans abonnement)
──────────────────────────────────────────── */
router.post('/souscrire', proteger, async (req, res) => {
  try {
    const { pack, montantCustom } = req.body;
    if (!PACKS[pack]) return res.status(400).json({ success:false, message:'Pack invalide' });

    const packConfig = PACKS[pack];
    let montant;

    if (packConfig.flexible && montantCustom) {
      /* : utiliser le montant saisi, pas le montant minimum */
      montant = Math.max(packConfig.montantMin, parseInt(montantCustom) || packConfig.montantMin);
      /* Vérifier le plafond si applicable */
      if (packConfig.montantMax && montant > packConfig.montantMax) {
        return res.status(400).json({
          success: false,
          message: `Montant trop élevé pour ce pack. Maximum : ${packConfig.montantMax.toLocaleString('fr-FR')} FCFA.`,
        });
      }
    } else {
      montant = packConfig.montant;
    }

    /* Désactiver l'ancien abonnement */
    await Abonnement.updateMany({ userId:req.user.id, actif:true }, { actif:false });

    const packInfo = getNomPack(montant);
    const abo = await Abonnement.create({
      userId:         req.user.id,
      pack:           packInfo.id || pack,
      montantInitial: montant,
      solde:          montant,
      historique: [{
        type:        'credit',
        montant,
        description: `Souscription ${packInfo.label}`,
        soldeApres:  montant,
        packLabel:   packInfo.label,
      }],
    });

    res.status(201).json({ success:true, data:{
      pack:           packInfo.id,
      packLabel:      packInfo.label,
      montantInitial: abo.montantInitial,
      solde:          abo.solde,
    }});
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

/* ──────────────────────────────────────────
   POST /api/abonnements/recharger
   Ajouter du crédit au solde existant

    le montant s'additionne
   au solde existant — pas de nouveau document
──────────────────────────────────────────── */
router.post('/recharger', proteger, async (req, res) => {
  try {
    const { montant, montantCustom, nouveauPack } = req.body;

    /* Récupérer l'abonnement actif */
    let abo = await Abonnement.findOne({ userId:req.user.id, actif:true }).sort('-createdAt');

    /* ── Cas 1 : recharge simple (ajout au solde existant) ── */
    if (!nouveauPack) {
      const ajout = parseInt(montantCustom || montant) || 0;
      if (ajout <= 0) {
        return res.status(400).json({ success:false, message:'Montant invalide.' });
      }

      if (!abo) {
        /* Pas d'abonnement — en créer un */
        const packInfo = getNomPack(ajout);
        abo = await Abonnement.create({
          userId:         req.user.id,
          pack:           packInfo.id || 'pack1',
          montantInitial: ajout,
          solde:          ajout,
          historique: [{
            type:'credit', montant:ajout,
            description:`Premier crédit de ${ajout.toLocaleString('fr-FR')} FCFA`,
            soldeApres:ajout, packLabel:packInfo.label,
          }],
        });
        return res.json({ success:true, data:{ solde:abo.solde, pack:packInfo.id, packLabel:packInfo.label }});
      }

      /*  Additionner au solde existant */
      const nouveauSolde = abo.solde + ajout;
      const packInfo     = getNomPack(nouveauSolde);

      abo.solde          = nouveauSolde;
      abo.pack           = packInfo.id || abo.pack;
      abo.historique.push({
        type:        'credit',
        montant:     ajout,
        description: `Recharge de ${ajout.toLocaleString('fr-FR')} FCFA`,
        soldeApres:  nouveauSolde,
        packLabel:   packInfo.label,
      });
      await abo.save();

      return res.json({ success:true, data:{
        solde:    nouveauSolde,
        pack:     packInfo.id,
        packLabel:packInfo.label,
        ajout,
        message: `${ajout.toLocaleString('fr-FR')} FCFA ajoutés. Nouveau solde : ${nouveauSolde.toLocaleString('fr-FR')} FCFA`,
      }});
    }

    /* ── Cas 2 : upgrade vers un pack (avec montantCustom si pack3) ── */
    if (nouveauPack) {
      const packConfig = PACKS[nouveauPack];
      if (!packConfig) {
        return res.status(400).json({ success:false, message:'Pack invalide.' });
      }

      /*  utiliser le montant saisi pour pack flexible */
      let montantNouv;
      if (packConfig.flexible && (montantCustom || montant)) {
        montantNouv = Math.max(
          packConfig.montantMin,
          parseInt(montantCustom || montant) || packConfig.montantMin
        );
        if (packConfig.montantMax && montantNouv > packConfig.montantMax) {
          return res.status(400).json({
            success:false,
            message:`Montant trop élevé. Maximum pour ce pack : ${packConfig.montantMax.toLocaleString('fr-FR')} FCFA.`,
          });
        }
      } else {
        montantNouv = packConfig.montant;
      }

      /*  Additionner au solde existant  */
      const soldePrecedent = abo ? abo.solde : 0;
      const nouveauSolde   = soldePrecedent + montantNouv;
      const packInfo       = getNomPack(nouveauSolde);

      if (abo) {
        abo.solde = nouveauSolde;
        abo.pack  = packInfo.id || nouveauPack;
        abo.historique.push({
          type:        'credit',
          montant:     montantNouv,
          description: `Upgrade ${packInfo.label} (+${montantNouv.toLocaleString('fr-FR')} FCFA)`,
          soldeApres:  nouveauSolde,
          packLabel:   packInfo.label,
        });
        await abo.save();
      } else {
        /* Créer un nouvel abonnement si aucun existant */
        abo = await Abonnement.create({
          userId:         req.user.id,
          pack:           packInfo.id || nouveauPack,
          montantInitial: montantNouv,
          solde:          montantNouv,
          historique: [{
            type:'credit', montant:montantNouv,
            description:`Souscription ${packInfo.label}`,
            soldeApres:montantNouv, packLabel:packInfo.label,
          }],
        });
      }

      return res.json({ success:true, data:{
        solde:         nouveauSolde,
        soldePrecedent,
        ajout:         montantNouv,
        pack:          packInfo.id,
        packLabel:     packInfo.label,
        message: `${montantNouv.toLocaleString('fr-FR')} FCFA ajoutés. Nouveau solde : ${nouveauSolde.toLocaleString('fr-FR')} FCFA`,
      }});
    }

  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

/* ──────────────────────────────────────────
   POST /api/abonnements/deduire
   Déduire le coût d'une requête du solde
──────────────────────────────────────────── */
router.post('/deduire', proteger, async (req, res) => {
  try {
    const { typeRequete, quantite, description } = req.body;
    const cout = (COUTS[typeRequete] || 500) * Math.max(1, parseInt(quantite) || 1);

    const abo = await Abonnement.findOne({ userId:req.user.id, actif:true });
    if (!abo) return res.status(400).json({
      success:false, message:'Aucun abonnement actif', code:'NO_ABO',
    });

    if (abo.solde < cout) return res.status(400).json({
      success:  false,
      message:  `Solde insuffisant. Coût : ${cout.toLocaleString('fr-FR')} FCFA. Solde : ${abo.solde.toLocaleString('fr-FR')} FCFA`,
      code:     'SOLDE_INSUFFISANT',
      cout,
      solde:    abo.solde,
      manque:   cout - abo.solde,
    });

    const nouveauSolde = abo.solde - cout;
    const packInfo     = getNomPack(nouveauSolde);

    abo.solde = nouveauSolde;
    abo.pack  = packInfo.id || abo.pack;
    abo.historique.push({
      type:        'debit',
      montant:     cout,
      description: description || `Requête ${typeRequete}`,
      soldeApres:  nouveauSolde,
      packLabel:   packInfo.label,
    });
    await abo.save();

    res.json({ success:true, data:{
      cout,
      solde:    nouveauSolde,
      pack:     packInfo.id,
      packLabel:packInfo.label,
      message:  `${cout.toLocaleString('fr-FR')} FCFA déduits. Solde restant : ${nouveauSolde.toLocaleString('fr-FR')} FCFA`,
    }});
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

/* ──────────────────────────────────────────
   GET /api/abonnements/historique
──────────────────────────────────────────── */
router.get('/historique', proteger, async (req, res) => {
  try {
    const abo = await Abonnement.findOne({ userId:req.user.id, actif:true });
    if (!abo) return res.json({ success:true, data:[] });
    res.json({ success:true, data: abo.historique.slice().reverse() });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;