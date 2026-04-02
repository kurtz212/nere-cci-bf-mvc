const express     = require('express');
const router      = express.Router();
const Abonnement  = require('../models/Abonnement.model');
const { proteger } = require('../middlewares/auth.middleware');

// Coûts par type de requête
const COUTS = {
  liste:       250,   // par adresse
  Tableaux:    500,   // par tableau
  statistique: 5000,  // par statistique
  fiche:       1000,  // par fiche
  autre:       2000,  // répertoire thématique
};

const PACKS = {
  pack1: { label:'Pack 1', montant:5000  },
  pack2: { label:'Pack 2', montant:10000 },
  pack3: { label:'Pack 3', montant:15000, flexible:true },
};

// GET /api/abonnements/mon-solde
router.get('/mon-solde', proteger, async (req, res) => {
  try {
    const abo = await Abonnement.findOne({ userId:req.user.id, actif:true })
      .sort('-createdAt');
    if (!abo) return res.json({ success:true, data:null, message:'Aucun abonnement actif' });
    res.json({ success:true, data:{
      pack:           abo.pack,
      packLabel:      PACKS[abo.pack]?.label,
      montantInitial: abo.montantInitial,
      solde:          abo.solde,
      actif:          abo.actif,
      id:             abo._id,
    }});
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/abonnements/souscrire
router.post('/souscrire', proteger, async (req, res) => {
  try {
    const { pack, montantCustom } = req.body;
    if (!PACKS[pack]) return res.status(400).json({ success:false, message:'Pack invalide' });

    const montant = pack === 'pack3' && montantCustom
      ? Math.max(15000, parseInt(montantCustom))
      : PACKS[pack].montant;

    // Désactiver l'ancien abonnement
    await Abonnement.updateMany({ userId:req.user.id, actif:true }, { actif:false });

    const abo = await Abonnement.create({
      userId:         req.user.id,
      pack,
      montantInitial: montant,
      solde:          montant,
      historique: [{
        type:        'credit',
        montant,
        description: `Souscription ${PACKS[pack].label}`,
        soldeApres:  montant,
      }],
    });

    res.status(201).json({ success:true, data:{
      pack:           abo.pack,
      packLabel:      PACKS[pack].label,
      montantInitial: abo.montantInitial,
      solde:          abo.solde,
    }});
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/abonnements/deduire — déduire le coût d'une requête
router.post('/deduire', proteger, async (req, res) => {
  try {
    const { typeRequete, quantite, description } = req.body;
    const cout = (COUTS[typeRequete] || 500) * Math.max(1, parseInt(quantite) || 1);

    const abo = await Abonnement.findOne({ userId:req.user.id, actif:true });
    if (!abo) return res.status(400).json({
      success:false, message:'Aucun abonnement actif', code:'NO_ABO'
    });

    if (abo.solde < cout) return res.status(400).json({
      success:false,
      message:`Solde insuffisant. Coût: ${cout.toLocaleString()} FCFA. Solde: ${abo.solde.toLocaleString()} FCFA`,
      code:    'SOLDE_INSUFFISANT',
      cout,
      solde:   abo.solde,
      manque:  cout - abo.solde,
    });

    const nouveauSolde = abo.solde - cout;
    abo.solde = nouveauSolde;
    abo.historique.push({
      type:        'debit',
      montant:     cout,
      description: description || `Requête ${typeRequete}`,
      soldeApres:  nouveauSolde,
    });
    await abo.save();

    res.json({ success:true, data:{
      cout, solde:nouveauSolde,
      message:`${cout.toLocaleString()} FCFA déduits. Solde restant: ${nouveauSolde.toLocaleString()} FCFA`,
    }});
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// POST /api/abonnements/recharger — recharger ou upgrader
router.post('/recharger', proteger, async (req, res) => {
  try {
    const { montant, nouveauPack } = req.body;
    const abo = await Abonnement.findOne({ userId:req.user.id, actif:true });

    if (nouveauPack) {
      // Upgrade vers un pack supérieur
      const montantNouv = PACKS[nouveauPack]?.montant || parseInt(montant) || 0;
      await Abonnement.updateMany({ userId:req.user.id, actif:true }, { actif:false });
      const newAbo = await Abonnement.create({
        userId:req.user.id, pack:nouveauPack,
        montantInitial:montantNouv, solde:montantNouv,
        historique:[{
          type:'credit', montant:montantNouv,
          description:`Upgrade vers ${PACKS[nouveauPack]?.label}`,
          soldeApres:montantNouv,
        }],
      });
      return res.json({ success:true, data:{ solde:newAbo.solde, pack:nouveauPack }});
    }

    if (!abo) return res.status(400).json({ success:false, message:'Aucun abonnement actif' });
    const ajout = parseInt(montant) || 0;
    const nouveauSolde = abo.solde + ajout;
    abo.solde = nouveauSolde;
    abo.historique.push({
      type:'credit', montant:ajout,
      description:`Recharge de ${ajout.toLocaleString()} FCFA`,
      soldeApres:nouveauSolde,
    });
    await abo.save();
    res.json({ success:true, data:{ solde:nouveauSolde }});
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

// GET /api/abonnements/historique
router.get('/historique', proteger, async (req, res) => {
  try {
    const abo = await Abonnement.findOne({ userId:req.user.id, actif:true });
    if (!abo) return res.json({ success:true, data:[] });
    res.json({ success:true, data: abo.historique.slice().reverse() });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
});

module.exports = router;