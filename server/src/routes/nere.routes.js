// server/src/routes/nere.routes.js
const express      = require('express');
const router       = express.Router();
const { proteger } = require('../middlewares/auth.middleware');
const Abonnement   = require('../models/Abonnement.model');

const NERE_BASE_URL = process.env.NERE_API_URL || 'http://localhost:5001';
console.log('>>> NERE_BASE_URL =', NERE_BASE_URL);

/* ── Rôle exempté de déduction ── */
const ROLES_PRIVILEGES = ['admin'];

const COUTS = {
  recherche:    250,
  multicritere: 250,
  liste:        250,
  statistique:  5000,
  fiche:        1000,
  association:  250,
  globale:      250,
};

const TYPE_ENUM_MAP = {
  recherche:    'liste',
  multicritere: 'liste',
  liste:        'liste',
  statistique:  'statistique',
  fiche:        'fiche',
  association:  'liste',
  globale:      'liste',
};

/* ══ Appel vers l'API NERE interne ══ */
async function appelNere(path) {
  const url        = `${NERE_BASE_URL}${path}`;
  console.log('→ Appel NERE :', url);
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 15000);
  try {
    const res  = await fetch(url, { signal: controller.signal });
    const text = await res.text();
    console.log('← Réponse NERE :', text.substring(0, 200));
    try   { return JSON.parse(text); }
    catch { throw new Error(`Réponse non-JSON : ${text.substring(0, 100)}`); }
  } finally {
    clearTimeout(timeout);
  }
}

/* ══ Déduire le solde — bypass si admin ou manager autorisé ══ */
async function deduireSolde(userId, typeRequete, quantite = 1, role = 'abonne', isManagerAuthorized = false) {
  const cout = (COUTS[typeRequete] || 250) * Math.max(1, parseInt(quantite) || 1);

  /* ── Accès illimité pour admin ET manager autorisé ── */
  if (ROLES_PRIVILEGES.includes(role) || (role === 'manager' && isManagerAuthorized)) {
    console.log(` Accès privilégié (${role}${isManagerAuthorized ? ' autorisé' : ''}) — aucune déduction`);
    return { ok: true, cout: 0, solde_restant: null, bypasse: true };
  }

  console.log('→ userId :', userId, '| cout :', cout);

  /* 1. Chercher abonnement actif */
  let abo = await Abonnement.findOne({ userId, actif: true }).sort('-createdAt');

  /* 2. Fallback sans filtre actif */
  if (!abo) {
    const aboAny = await Abonnement.findOne({ userId }).sort('-createdAt');
    if (aboAny && aboAny.solde > 0) {
      aboAny.actif = true;
      await aboAny.save();
      abo = aboAny;
    } else {
      return { ok: false, code: 'NO_ABO', message: 'Aucun abonnement actif.', cout };
    }
  }

  /* 3. Vérifier solde */
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

  /* 4. Déduire */
  const typeEnum  = TYPE_ENUM_MAP[typeRequete] || 'autre';
  const resultat  = await abo.deduire(
    cout,
    typeEnum,
    `Requête ${typeRequete} — ${cout.toLocaleString('fr-FR')} FCFA`,
    role
  );

  console.log('→ Nouveau solde :', resultat.solde);
  return { ok: true, cout, solde_restant: resultat.solde, bypasse: false };
}

/* ══════════════════════════════════════════════════
   ROUTES
══════════════════════════════════════════════════ */

/* GET /api/nere/recherche — 250 FCFA */
router.get('/recherche', proteger, async (req, res) => {
  try {
    const { rccm, ifu, denomination, limit = 20, page = 1 } = req.query;

    if (!rccm && !ifu && !denomination) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un critère requis : rccm, ifu ou denomination.',
      });
    }

    const deduction = await deduireSolde(req.user.id, 'recherche', 1, req.user.role, req.user.canSearchMultiCriteria);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const params = new URLSearchParams({ limit, page });
    if (rccm)         params.append('rccm',        rccm);
    if (ifu)          params.append('ifu',          ifu);
    if (denomination) params.append('denomination', denomination);

    const nereRes = await appelNere(`/entreprises?${params}`);

    return res.json({
      success:       true,
      data:          nereRes.data || nereRes.entreprises || [],
      total:         nereRes.total || 0,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /recherche :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/multicritere — 250 FCFA × quantité */
router.get('/multicritere', proteger, async (req, res) => {
  try {
    const { limit = 50, page = 1, ...criteres } = req.query;
    const quantite = Math.max(1, parseInt(limit) || 50);

    const deduction = await deduireSolde(req.user.id, 'multicritere', quantite, req.user.role, req.user.canSearchMultiCriteria);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const params  = new URLSearchParams({ limit, page, ...criteres });
    const nereRes = await appelNere(`/api/entreprises/multicritere?${params}`);

    return res.json({
      success:       true,
      data:          nereRes.data || [],
      total:         nereRes.total || 0,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /multicritere :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/associations — 250 FCFA */
router.get('/associations', proteger, async (req, res) => {
  try {
    const { limit = 20, page = 1, ...criteres } = req.query;

    const deduction = await deduireSolde(req.user.id, 'association', 1, req.user.role, req.user.canSearchMultiCriteria);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const params  = new URLSearchParams({ limit, page, ...criteres });
    const nereRes = await appelNere(`/api/nere/associations?${params}`);

    return res.json({
      success:       true,
      data:          nereRes.data || [],
      total:         nereRes.total || 0,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /associations :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/associations/:code — 1 000 FCFA */
router.get('/associations/:code', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'fiche', 1, req.user.role);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const nereRes = await appelNere(
      `/api/nere/associations/${encodeURIComponent(req.params.code)}`
    );

    return res.json({
      success:       true,
      data:          nereRes.data || nereRes,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /associations/:code :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/recherche-globale — 250 FCFA */
router.get('/recherche-globale', proteger, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Paramètre q requis.' });

    const deduction = await deduireSolde(req.user.id, 'globale', 1, req.user.role);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const params  = new URLSearchParams({ q, limit });
    const nereRes = await appelNere(`/api/entreprises/recherche-globale?${params}`);

    return res.json({
      success:       true,
      data:          nereRes.data || {},
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /recherche-globale :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/statistiques — 5 000 FCFA */
router.get('/statistiques', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1, req.user.role);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const nereRes = await appelNere('/api/entreprises/stats');

    return res.json({
      success:       true,
      data:          nereRes.data || nereRes,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /statistiques :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/statistiques/associations — 5 000 FCFA */
router.get('/statistiques/associations', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1, req.user.role);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const nereRes = await appelNere('/api/nere/associations/statistiques');

    return res.json({
      success:       true,
      data:          nereRes.data || nereRes,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /statistiques/associations :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/statistiques/importations — 5 000 FCFA */
router.get('/statistiques/importations', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1, req.user.role);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const nereRes = await appelNere('/api/douane/importations/statistiques');

    return res.json({
      success:       true,
      data:          nereRes.data || nereRes,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /statistiques/importations :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/statistiques/exportations — 5 000 FCFA */
router.get('/statistiques/exportations', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'statistique', 1, req.user.role);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const nereRes = await appelNere('/api/douane/exportations/stats');

    return res.json({
      success:       true,
      data:          nereRes.data || nereRes,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /statistiques/exportations :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/entreprise/:rccm — 1 000 FCFA */
router.get('/entreprise/:rccm', proteger, async (req, res) => {
  try {
    const deduction = await deduireSolde(req.user.id, 'fiche', 1, req.user.role);
    if (!deduction.ok) return res.status(400).json({ success: false, ...deduction });

    const nereRes = await appelNere(
      `/api/entreprises/${encodeURIComponent(req.params.rccm)}`
    );

    return res.json({
      success:       true,
      data:          nereRes.data || nereRes,
      solde_restant: deduction.solde_restant,
      cout_requete:  deduction.cout,
    });
  } catch (err) {
    console.error(' /entreprise/:rccm :', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* GET /api/nere/refs/:type — SANS coût, SANS authentification */
router.get('/refs/:type', async (req, res) => {
  try {
    const map = {
      'regions':                '/api/entreprises/refs/regions',
      'formes-juridiques':      '/api/entreprises/refs/formes-juridiques',
      'sous-categories':        '/api/entreprises/refs/sous-categories',
      'categories-association': '/api/entreprises/refs/categories-association',
    };
    const path = map[req.params.type];
    if (!path) return res.status(404).json({ success: false, message: 'Référence inconnue.' });

    const nereRes = await appelNere(path);
    res.json({ success: true, data: nereRes.data || nereRes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;