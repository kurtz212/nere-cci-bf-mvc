// server/src/routes/nere.proxy.routes.js
const express      = require('express');
const router       = express.Router();
const { proteger } = require('../middlewares/auth.middleware');
const Abonnement   = require('../models/Abonnement.model');

/* ── URL de base de l'API NERE ── */
// ✅ CORRECTION : déclaration AVANT le console.log
const NERE_BASE_URL = process.env.NERE_API_URL || 'http://localhost:5001';
console.log('>>> NERE_BASE_URL =', NERE_BASE_URL);

/* ── Chemins vers l'API NERE (à ajuster selon les vraies routes de l'API) ──
   Si une route retourne 404, vérifier les routes disponibles avec :
   GET http://localhost:5001/api  ou  grep router.get dans les fichiers de l'API NERE
*/
/* Routes confirmées depuis api-nere/src/routes/entreprises.routes.js
   Toutes montées sur /api/entreprises dans le app.js de l'API NERE :
     GET /                     → ctrl.rechercher
     GET /multicritere         → ctrl.rechercherMulticritere
     GET /nere/associations    → ctrl.rechercherAssociations  (liste)
     GET /associations/:code   → ctrl.getAssociationById     (fiche)
     GET /stats                → ctrl.getStats
     GET /recherche-globale    → ctrl.rechercheGlobale
     GET /:rccm                → ctrl.getEntrepriseById
*/
const NERE_PATHS = {
  entreprises:      '/api/entreprises',
  associations:     '/api/entreprises/nere/associations',   // ✅ confirmé
  associationFiche: '/api/entreprises/associations',        // ✅ confirmé /:code
  importations:     '/api/entreprises/nere/importations',   // ✅ ajouté au controller
  exportations:     '/api/entreprises/nere/exportations',   // ✅ ajouté au controller
  stats:            '/api/entreprises/stats',
  multicritere:     '/api/entreprises/multicritere',
  rechercheGlobale: '/api/entreprises/recherche-globale',
};
console.log('>>> NERE_PATHS =', NERE_PATHS);

/* ── Coûts par type ── */
const COUTS = {
  recherche:    250,
  multicritere: 250,
  liste:        250,
  statistique:  5000,
  fiche:        1000,
  association:  250,
  importation:  250,
  exportation:  250,
  globale:      250,
  autre:        5000,
};

/* ── Mapper vers l'enum du modèle Abonnement ──
   enum autorisé : ['liste','statistique','fiche','detail','autre','recharge'] */
const TYPE_ENUM_MAP = {
  recherche:    'liste',
  multicritere: 'liste',
  liste:        'liste',
  statistique:  'statistique',
  fiche:        'fiche',
  association:  'liste',
  importation:  'liste',
  exportation:  'liste',
  globale:      'liste',
  autre:        'autre',
};

/* ── Appel HTTP vers l'API NERE avec fetch natif ── */
async function appelNere(path) {
  const url        = `${NERE_BASE_URL}${path}`;
  console.log(' Appel NERE :', url);
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 15000);
  try {
    const res  = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    console.log(' Réponse NERE :', text.substring(0, 300));
    try { return JSON.parse(text); }
    catch { throw new Error(`Réponse non-JSON : ${text.substring(0, 100)}`); }
  } finally {
    clearTimeout(timeout);
  }
}

/* ── Déduire le solde via la méthode .deduire() du modèle ── */
async function deduireSolde(userId, typeRequete, quantite = 1) {
  const cout = (COUTS[typeRequete] || 250) * Math.max(1, parseInt(quantite) || 1);

  console.log(' userId  :', userId);
  console.log(' cout    :', cout, 'FCFA');

  /* Chercher abonnement actif */
  let abo = await Abonnement.findOne({ userId, actif: true }).sort('-createdAt');
  console.log(' abo actif:', abo ? `solde=${abo.solde} FCFA` : 'NULL');

  /* Si pas trouvé avec actif:true → chercher sans filtre */
  if (!abo) {
    const aboAny = await Abonnement.findOne({ userId }).sort('-createdAt');
    console.log(' abo any  :', aboAny
      ? `solde=${aboAny.solde} actif=${aboAny.actif}`
      : 'AUCUN EN BD');

    if (aboAny && aboAny.solde > 0) {
      /* Réactiver automatiquement si solde positif */
      console.log('  Réactivation automatique de l\'abonnement');
      aboAny.actif = true;
      await aboAny.save();
      abo = aboAny;
    } else {
      return { ok:false, code:'NO_ABO', message:'Aucun abonnement actif.', cout };
    }
  }

  /* Vérifier solde suffisant */
  if (abo.solde < cout) {
    return {
      ok:           false,
      code:         'SOLDE_INSUFFISANT',
      message:      `Solde insuffisant. Coût : ${cout.toLocaleString('fr-FR')} FCFA. Solde : ${abo.solde.toLocaleString('fr-FR')} FCFA.`,
      cout,
      solde_actuel: abo.solde,
      manque:       cout - abo.solde,
    };
  }

  /* Déduire via la méthode .deduire() du modèle */
  const typeEnum     = TYPE_ENUM_MAP[typeRequete] || 'autre';
  const nouveauSolde = await abo.deduire(
    cout,
    typeEnum,
    `Requête ${typeRequete} — ${cout.toLocaleString('fr-FR')} FCFA`
  );

  console.log(' Déduction OK. Nouveau solde :', nouveauSolde, 'FCFA');
  return { ok:true, cout, solde_restant:nouveauSolde };
}

/* ══════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════ */

/* ──────────────────────────────────────
   GET /api/nere/recherche — 250 FCFA
   Recherche entreprise par RCCM, IFU ou dénomination
────────────────────────────────────── */
router.get('/recherche', proteger, async (req, res) => {
  try {
    const { rccm, ifu, denomination, limit=20, page=1 } = req.query;

    if (!rccm && !ifu && !denomination) {
      return res.status(400).json({
        success:false,
        message:'Au moins un critère requis : rccm, ifu ou denomination.',
      });
    }

    const deduction = await deduireSolde(req.user.id, 'recherche', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const params = new URLSearchParams({ limit, page });
    if (rccm)         params.append('rccm',        rccm);
    if (ifu)          params.append('ifu',          ifu);
    if (denomination) params.append('denomination', denomination);

    const nereRes = await appelNere(`${NERE_PATHS.entreprises}?${params}`);

    return res.json({
      success:      true,
      data:         nereRes.data || nereRes.entreprises || [],
      total:        nereRes.total || 0,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /recherche :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/multicritere — 250 FCFA × quantité
   Recherche multicritère entreprises
────────────────────────────────────── */
router.get('/multicritere', proteger, async (req, res) => {
  try {
    const { limit=50, page=1, ...criteres } = req.query;
    const quantite = Math.max(1, parseInt(limit) || 50);

    const deduction = await deduireSolde(req.user.id, 'multicritere', quantite);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const params  = new URLSearchParams({ limit, page, ...criteres });
    const nereRes = await appelNere(`${NERE_PATHS.multicritere}?${params}`);

    return res.json({
      success:      true,
      data:         nereRes.data || [],
      total:        nereRes.total || 0,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /multicritere :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/associations — 250 FCFA
   Recherche associations par nom, région, catégorie...
   ✅ CORRECTION : suppression du préfixe /nere/ en double
────────────────────────────────────── */
router.get('/associations', proteger, async (req, res) => {
  try {
    const { limit=20, page=1, ...criteres } = req.query;

    const deduction = await deduireSolde(req.user.id, 'association', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const params  = new URLSearchParams({ limit, page, ...criteres });
    const nereRes = await appelNere(`${NERE_PATHS.associations}?${params}`);

    return res.json({
      success:      true,
      data:         nereRes.data || [],
      total:        nereRes.total || 0,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /associations :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/associations/:code — 1 000 FCFA
   Fiche complète association avec dirigeants
   ✅ CORRECTION : suppression du préfixe /nere/ en double
────────────────────────────────────── */
router.get('/associations/:code', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'fiche', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const nereRes = await appelNere(
      `${NERE_PATHS.associationFiche}/${encodeURIComponent(req.params.code)}`
    );

    return res.json({
      success:      true,
      data:         nereRes.data || nereRes,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /associations/:code :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/importations — 250 FCFA
   Route vers ctrl.rechercherImportations (ajouté au controller)
────────────────────────────────────── */
router.get('/importations', proteger, async (req, res) => {
  try {
    const { limit=20, page=1, ...criteres } = req.query;

    const deduction = await deduireSolde(req.user.id, 'importation', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const params  = new URLSearchParams({ limit, page, ...criteres });
    const nereRes = await appelNere(`${NERE_PATHS.importations}?${params}`);

    /* Si la table n'existe pas dans dbNERE, renvoyer le message sans erreur 500 */
    if (nereRes.code === 'TABLE_INEXISTANTE') {
      return res.status(404).json({ success:false, ...nereRes });
    }

    return res.json({
      success:      true,
      data:         nereRes.data || [],
      total:        nereRes.total || 0,
      table:        nereRes.table,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /importations :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/exportations — 250 FCFA
   Route vers ctrl.rechercherExportations (ajouté au controller)
────────────────────────────────────── */
router.get('/exportations', proteger, async (req, res) => {
  try {
    const { limit=20, page=1, ...criteres } = req.query;

    const deduction = await deduireSolde(req.user.id, 'exportation', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const params  = new URLSearchParams({ limit, page, ...criteres });
    const nereRes = await appelNere(`${NERE_PATHS.exportations}?${params}`);

    if (nereRes.code === 'TABLE_INEXISTANTE') {
      return res.status(404).json({ success:false, ...nereRes });
    }

    return res.json({
      success:      true,
      data:         nereRes.data || [],
      total:        nereRes.total || 0,
      table:        nereRes.table,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /exportations :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/recherche-globale?q=... — 250 FCFA
   Recherche combinée entreprises + associations
────────────────────────────────────── */
router.get('/recherche-globale', proteger, async (req, res) => {
  try {
    const { q, limit=10 } = req.query;
    if (!q) return res.status(400).json({ success:false, message:'Paramètre q requis.' });

    const deduction = await deduireSolde(req.user.id, 'globale', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const params  = new URLSearchParams({ q, limit });
    const nereRes = await appelNere(`${NERE_PATHS.rechercheGlobale}?${params}`);

    return res.json({
      success:      true,
      data:         nereRes.data || {},
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /recherche-globale :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/statistiques — 5 000 FCFA
   Statistiques globales entreprises + associations
────────────────────────────────────── */
router.get('/statistiques', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const nereRes = await appelNere(NERE_PATHS.stats);

    return res.json({
      success:      true,
      data:         nereRes.data || nereRes,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /statistiques :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/statistiques/associations — 5 000 FCFA
────────────────────────────────────── */
router.get('/statistiques/associations', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });
    const nereRes = await appelNere('/api/entreprises/stats/associations');
    return res.json({ success:true, data: nereRes.data || nereRes,
      solde_restant:deduction.solde_restant, cout_requete:deduction.cout });
  } catch (err) {
    console.error(' /statistiques/associations :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/statistiques/importations — 5 000 FCFA
────────────────────────────────────── */
router.get('/statistiques/importations', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });
    const nereRes = await appelNere('/api/entreprises/stats/importations');
    return res.json({ success:true, data: nereRes.data || nereRes,
      solde_restant:deduction.solde_restant, cout_requete:deduction.cout });
  } catch (err) {
    console.error(' /statistiques/importations :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/statistiques/exportations — 5 000 FCFA
────────────────────────────────────── */
router.get('/statistiques/exportations', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });
    const nereRes = await appelNere('/api/entreprises/stats/exportations');
    return res.json({ success:true, data: nereRes.data || nereRes,
      solde_restant:deduction.solde_restant, cout_requete:deduction.cout });
  } catch (err) {
    console.error(' /statistiques/exportations :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/entreprise/:rccm — 1 000 FCFA
   Fiche complète entreprise par RCCM
────────────────────────────────────── */
router.get('/entreprise/:rccm', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'fiche', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const nereRes = await appelNere(
      `${NERE_PATHS.entreprises}/${encodeURIComponent(req.params.rccm)}`
    );

    return res.json({
      success:      true,
      data:         nereRes.data || nereRes,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /entreprise/:rccm :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/fiche/:rccm — 1 000 FCFA
   Compatibilité ancienne route
────────────────────────────────────── */
router.get('/fiche/:rccm', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'fiche', 1);
    if (!deduction.ok) return res.status(400).json({ success:false, ...deduction });

    const nereRes = await appelNere(
      `${NERE_PATHS.entreprises}/${encodeURIComponent(req.params.rccm)}`
    );

    return res.json({
      success:      true,
      data:         nereRes.data || nereRes,
      solde_restant:deduction.solde_restant,
      cout_requete: deduction.cout,
    });
  } catch (err) {
    console.error(' /fiche/:rccm :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
});

/* ──────────────────────────────────────
   GET /api/nere/refs/* — SANS coût
────────────────────────────────────── */
router.get('/refs/regions', async (req, res) => {
  try {
    const nereRes = await appelNere('/api/entreprises/refs/regions');
    res.json({ success:true, data: nereRes.data || nereRes });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

router.get('/refs/formes-juridiques', async (req, res) => {
  try {
    const nereRes = await appelNere('/api/entreprises/refs/formes-juridiques');
    res.json({ success:true, data: nereRes.data || nereRes });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

router.get('/refs/sous-categories', async (req, res) => {
  try {
    const nereRes = await appelNere('/api/entreprises/refs/sous-categories');
    res.json({ success:true, data: nereRes.data || nereRes });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

router.get('/refs/categories-association', async (req, res) => {
  try {
    const nereRes = await appelNere('/api/entreprises/refs/categories-association');
    res.json({ success:true, data: nereRes.data || nereRes });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
});

/* Route générique refs (compatibilité) */
router.get('/refs/:type', async (req, res) => {
  try {
    const map = {
      'regions':               '/api/entreprises/refs/regions',
      'formes-juridiques':     '/api/entreprises/refs/formes-juridiques',
      'sous-categories':       '/api/entreprises/refs/sous-categories',
      'categories-association':'/api/entreprises/refs/categories-association',
    };
    const path = map[req.params.type];
    if (!path) return res.status(404).json({ success:false, message:'Référence inconnue.' });
    const nereRes = await appelNere(path);
    res.json({ success:true, data: nereRes.data || nereRes });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
});

module.exports = router;