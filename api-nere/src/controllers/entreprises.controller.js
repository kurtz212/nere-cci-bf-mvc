// api-nere/src/controllers/entreprises.controller.js
const { getPool, sql } = require('../config/sqlserver');

/* ══════════════════════════════════════════════════
   HELPER — WHERE pour entreprises
   Filtre par libellé (région, forme juridique, sous-catégorie)
   via sous-requêtes sur les tables de référence
══════════════════════════════════════════════════ */
function buildParamsEntreprise(query) {
  const params = {};
  const {
    denomination, rccm, ifu,
    region, commune, quartier,
    forme_juridique, sous_categorie,
    ca_min, ca_max,
    effectif_min, effectif_max,
    etat,
  } = query;

  let where = 'WHERE 1=1';

  if (denomination) {
    params.denomination = { type: sql.NVarChar, value: `%${denomination}%` };
    where += ` AND (e.denom_ent LIKE @denomination OR e.nomcom_ent LIKE @denomination OR e.sigle_ent LIKE @denomination)`;
  }
  if (rccm) {
    params.rccm = { type: sql.NVarChar, value: rccm.trim() };
    where += ` AND e.NRCCM_ent = @rccm`;
  }
  if (ifu) {
    params.ifu = { type: sql.NVarChar, value: ifu.trim() };
    where += ` AND e.NIMPOT_ent = @ifu`;
  }
  if (region) {
    params.region = { type: sql.NVarChar, value: `%${region}%` };
    where += ` AND e.code_reg IN (SELECT code_reg FROM PRegion WHERE lib_reg LIKE @region)`;
  }
  if (commune) {
    params.commune = { type: sql.NVarChar, value: `%${commune}%` };
    where += ` AND e.commune_ent LIKE @commune`;
  }
  if (quartier) {
    params.quartier = { type: sql.NVarChar, value: `%${quartier}%` };
    where += ` AND e.quartier_ent LIKE @quartier`;
  }
  if (forme_juridique) {
    params.forme_juridique = { type: sql.NVarChar, value: `%${forme_juridique}%` };
    where += ` AND e.code_fj IN (SELECT code_fj FROM PFormeJ WHERE lib_fj LIKE @forme_juridique)`;
  }
  if (sous_categorie) {
    params.sous_categorie = { type: sql.NVarChar, value: `%${sous_categorie}%` };
    where += ` AND e.code_scat IN (SELECT code_scat FROM PScategorie WHERE lib_scat LIKE @sous_categorie)`;
  }
  if (ca_min) {
    params.ca_min = { type: sql.BigInt, value: parseInt(ca_min) };
    where += ` AND e.ca_ent >= @ca_min`;
  }
  if (ca_max) {
    params.ca_max = { type: sql.BigInt, value: parseInt(ca_max) };
    where += ` AND e.ca_ent <= @ca_max`;
  }
  if (effectif_min) {
    params.effectif_min = { type: sql.Int, value: parseInt(effectif_min) };
    where += ` AND e.effperm_ent >= @effectif_min`;
  }
  if (effectif_max) {
    params.effectif_max = { type: sql.Int, value: parseInt(effectif_max) };
    where += ` AND e.effperm_ent <= @effectif_max`;
  }
  if (etat) {
    params.etat = { type: sql.NVarChar, value: etat };
    where += ` AND e.etat_ent = @etat`;
  }

  return { where, params };
}

/* ══════════════════════════════════════════════════
   HELPER — WHERE pour associations
══════════════════════════════════════════════════ */
function buildParamsAssociation(query) {
  const params = {};
  const {
    nom, sigle, ifu, recepisse,
    region, commune, categorie,
    effectif_min, effectif_max,
    valide,
  } = query;

  let where = 'WHERE 1=1';

  if (nom) {
    params.nom = { type: sql.NVarChar, value: `%${nom}%` };
    where += ` AND (a.nom_ass LIKE @nom OR a.sigle_ass LIKE @nom)`;
  }
  if (sigle) {
    params.sigle = { type: sql.NVarChar, value: `%${sigle}%` };
    where += ` AND a.sigle_ass LIKE @sigle`;
  }
  if (ifu) {
    params.ifu = { type: sql.NVarChar, value: ifu.trim() };
    where += ` AND a.ifu_ass = @ifu`;
  }
  if (recepisse) {
    params.recepisse = { type: sql.NVarChar, value: `%${recepisse}%` };
    where += ` AND a.recepisse_ass LIKE @recepisse`;
  }
  if (region) {
    params.region = { type: sql.NVarChar, value: `%${region}%` };
    where += ` AND a.code_ville IN (
      SELECT code_ville FROM PCommune WHERE code_reg IN (
        SELECT code_reg FROM PRegion WHERE lib_reg LIKE @region
      )
    )`;
  }
  if (commune) {
    params.commune = { type: sql.NVarChar, value: `%${commune}%` };
    where += ` AND a.code_ville IN (SELECT code_ville FROM PCommune WHERE lib_commune LIKE @commune)`;
  }
  if (categorie) {
    params.categorie = { type: sql.NVarChar, value: `%${categorie}%` };
    where += ` AND a.code_cata IN (SELECT code_cata FROM PCategorieAss WHERE lib_cata LIKE @categorie)`;
  }
  if (effectif_min) {
    params.effectif_min = { type: sql.Int, value: parseInt(effectif_min) };
    where += ` AND CAST(LTRIM(RTRIM(a.eff_membre)) AS INT) >= @effectif_min`;
  }
  if (effectif_max) {
    params.effectif_max = { type: sql.Int, value: parseInt(effectif_max) };
    where += ` AND CAST(LTRIM(RTRIM(a.eff_membre)) AS INT) <= @effectif_max`;
  }
  if (valide) {
    params.valide = { type: sql.Char, value: valide };
    where += ` AND a.vailde_ass = @valide`;
  }

  return { where, params };
}

/* ── Crée un request mssql avec tous les paramètres ── */
function createRequest(pool, params) {
  const request = pool.request();
  for (const [key, { type, value }] of Object.entries(params)) {
    request.input(key, type, value);
  }
  return request;
}

/* ── Colonnes SELECT entreprises ── */
const SELECT_ENT = `
  e.code_ent,
  e.denom_ent      AS denomination,
  e.nomcom_ent     AS nom_commercial,
  e.sigle_ent      AS sigle,
  e.NRCCM_ent      AS rccm,
  e.NIMPOT_ent     AS ifu,
  e.NSECU_ent      AS cnss,
  e.email_ent      AS email,
  e.telfixe_ent    AS telephone_fixe,
  e.telmob_ent     AS telephone_mobile,
  e.siteweb_ent    AS site_web,
  e.commune_ent    AS commune,
  e.quartier_ent   AS quartier,
  e.adrsiege_ent   AS adresse,
  e.debutact_ent   AS date_debut_activite,
  e.DateCreation   AS date_creation,
  e.etat_ent       AS etat,
  e.capital_ent    AS capital,
  e.effperm_ent    AS effectif_permanent,
  e.efftemp_ent    AS effectif_temporaire,
  e.ca_ent         AS chiffre_affaires,
  r.lib_reg        AS region,
  fj.lib_fj        AS forme_juridique,
  sc.lib_scat      AS sous_categorie,
  'entreprise'     AS type_entite
`;

const JOINS_ENT = `
  LEFT JOIN PRegion     r  ON e.code_reg  = r.code_reg
  LEFT JOIN PFormeJ     fj ON e.code_fj   = fj.code_fj
  LEFT JOIN PScategorie sc ON e.code_scat = sc.code_scat
`;

/* ── Colonnes SELECT associations ── */
const SELECT_ASS = `
  a.code_ass,
  a.nom_ass        AS nom,
  a.sigle_ass      AS sigle,
  a.email_ass      AS email,
  a.siteweb_ass    AS site_web,
  a.datecrea_ass   AS date_creation,
  a.recepisse_ass  AS recepisse,
  a.daterecepisse_ass AS date_recepisse,
  a.datevalidite_ass  AS date_validite,
  a.vailde_ass     AS statut_validite,
  a.contact_ass    AS contact,
  a.telmob_ass     AS telephone_mobile,
  a.telfixe_ass    AS telephone_fixe,
  a.fax_ass        AS fax,
  a.adr_ass        AS adresse,
  a.ifu_ass        AS ifu,
  a.eff_membre     AS effectif_membres,
  a.objectif       AS objectif,
  ca.lib_cata      AS categorie,
  c.lib_commune    AS commune,
  rg.lib_reg       AS region,
  'association'    AS type_entite
`;

const JOINS_ASS = `
  LEFT JOIN PCategorieAss ca ON a.code_cata  = ca.code_cata
  LEFT JOIN PCommune      c  ON a.code_ville  = c.code_ville
  LEFT JOIN PRegion       rg ON c.code_reg    = rg.code_reg
`;

/* ══════════════════════════════════════════════════
   RECHERCHE SIMPLE ENTREPRISES
   GET /api/entreprises?rccm=...&ifu=...&denomination=...
══════════════════════════════════════════════════ */
exports.rechercher = async (req, res) => {
  try {
    const pool   = getPool();
    const page   = Math.max(1, parseInt(req.query.page  || 1));
    const limit  = Math.min(100, parseInt(req.query.limit || 20));
    const offset = (page - 1) * limit;
    const fin    = offset + limit;

    const { where, params } = buildParamsEntreprise(req.query);

    const selectQuery = `
      SELECT * FROM (
        SELECT ${SELECT_ENT},
          ROW_NUMBER() OVER (ORDER BY e.denom_ent) AS RowNum
        FROM EEntreprise e ${JOINS_ENT} ${where}
      ) AS paged
      WHERE RowNum > ${offset} AND RowNum <= ${fin}
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM EEntreprise e ${JOINS_ENT} ${where}
    `;

    const [result, countResult] = await Promise.all([
      createRequest(pool, params).query(selectQuery),
      createRequest(pool, params).query(countQuery),
    ]);

    res.json({
      success: true,
      total:   countResult.recordset[0]?.total || 0,
      page, limit,
      data:    result.recordset,
    });
  } catch (err) {
    console.error('❌ rechercher :', err.message);
    res.status(500).json({ success:false, message:'Erreur recherche.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RECHERCHE MULTICRITERE ENTREPRISES
   GET /api/entreprises/multicritere
══════════════════════════════════════════════════ */
exports.rechercherMulticritere = async (req, res) => {
  try {
    const pool   = getPool();
    const page   = Math.max(1, parseInt(req.query.page  || 1));
    const limit  = Math.min(200, parseInt(req.query.limit || 50));
    const offset = (page - 1) * limit;
    const fin    = offset + limit;

    const { where, params } = buildParamsEntreprise(req.query);

    console.log('🔍 Multicritère WHERE :', where);

    const selectQuery = `
      SELECT * FROM (
        SELECT ${SELECT_ENT},
          ROW_NUMBER() OVER (ORDER BY e.denom_ent) AS RowNum
        FROM EEntreprise e ${JOINS_ENT} ${where}
      ) AS paged
      WHERE RowNum > ${offset} AND RowNum <= ${fin}
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM EEntreprise e ${JOINS_ENT} ${where}
    `;

    const [result, countResult] = await Promise.all([
      createRequest(pool, params).query(selectQuery),
      createRequest(pool, params).query(countQuery),
    ]);

    console.log(`✅ Multicritère : ${countResult.recordset[0]?.total} résultats`);

    res.json({
      success: true,
      total:   countResult.recordset[0]?.total || 0,
      page, limit,
      data:    result.recordset,
    });
  } catch (err) {
    console.error('❌ rechercherMulticritere :', err.message);
    res.status(500).json({ success:false, message:'Erreur multicritère.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   DETAIL ENTREPRISE PAR RCCM
   GET /api/entreprises/:rccm
══════════════════════════════════════════════════ */
exports.getEntrepriseById = async (req, res) => {
  try {
    const pool    = getPool();
    const request = pool.request();
    request.input('rccm', sql.NVarChar, req.params.rccm);

    const result = await request.query(`
      SELECT ${SELECT_ENT},
        e.NSECU_ent AS cnss_detail,
        e.capital_ent AS capital_detail
      FROM EEntreprise e ${JOINS_ENT}
      WHERE e.NRCCM_ent = @rccm
    `);

    if (result.recordset.length === 0)
      return res.status(404).json({ success:false, message:'Entreprise introuvable.' });

    res.json({ success:true, data: result.recordset[0] });
  } catch (err) {
    console.error('❌ getEntrepriseById :', err.message);
    res.status(500).json({ success:false, message:'Erreur récupération.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RECHERCHE ASSOCIATIONS
   GET /api/entreprises/associations?nom=...&region=...
══════════════════════════════════════════════════ */
exports.rechercherAssociations = async (req, res) => {
  try {
    const pool   = getPool();
    const page   = Math.max(1, parseInt(req.query.page  || 1));
    const limit  = Math.min(100, parseInt(req.query.limit || 20));
    const offset = (page - 1) * limit;
    const fin    = offset + limit;

    const { where, params } = buildParamsAssociation(req.query);

    const selectQuery = `
      SELECT * FROM (
        SELECT ${SELECT_ASS},
          ROW_NUMBER() OVER (ORDER BY a.nom_ass) AS RowNum
        FROM AAssociation a ${JOINS_ASS} ${where}
      ) AS paged
      WHERE RowNum > ${offset} AND RowNum <= ${fin}
    `;
    const countQuery = `
      SELECT COUNT(*) AS total FROM AAssociation a ${JOINS_ASS} ${where}
    `;

    const [result, countResult] = await Promise.all([
      createRequest(pool, params).query(selectQuery),
      createRequest(pool, params).query(countQuery),
    ]);

    res.json({
      success: true,
      total:   countResult.recordset[0]?.total || 0,
      page, limit,
      data:    result.recordset,
    });
  } catch (err) {
    console.error('❌ rechercherAssociations :', err.message);
    res.status(500).json({ success:false, message:'Erreur recherche associations.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   DETAIL ASSOCIATION PAR CODE
   GET /api/entreprises/associations/:code
══════════════════════════════════════════════════ */
exports.getAssociationById = async (req, res) => {
  try {
    const pool    = getPool();
    const request = pool.request();
    request.input('code', sql.NVarChar, req.params.code);

    /* Récupérer l'association + ses dirigeants */
    const [assResult, dirigResult] = await Promise.all([
      request.query(`
        SELECT ${SELECT_ASS}
        FROM AAssociation a ${JOINS_ASS}
        WHERE a.code_ass = @code
      `),
      pool.request().input('code2', sql.NVarChar, req.params.code).query(`
        SELECT
          d.nom_direass       AS nom,
          d.raison_sociale    AS raison_sociale,
          d.sexe_direass      AS sexe,
          d.email_direass     AS email,
          d.tel_direass       AS telephone,
          d.adr_direass       AS adresse,
          f.lib_fon           AS fonction
        FROM ADirigeantAsso d
        LEFT JOIN PFonction f ON d.code_fon = f.code_fon
        WHERE d.code_ass = @code2
      `),
    ]);

    if (assResult.recordset.length === 0)
      return res.status(404).json({ success:false, message:'Association introuvable.' });

    res.json({
      success: true,
      data: {
        ...assResult.recordset[0],
        dirigeants: dirigResult.recordset,
      },
    });
  } catch (err) {
    console.error('❌ getAssociationById :', err.message);
    res.status(500).json({ success:false, message:'Erreur récupération association.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RECHERCHE COMBINÉE (entreprises + associations)
   GET /api/entreprises/recherche-globale?q=...
══════════════════════════════════════════════════ */
exports.rechercheGlobale = async (req, res) => {
  try {
    const pool  = getPool();
    const q     = req.query.q || '';
    const limit = Math.min(20, parseInt(req.query.limit || 10));

    if (!q) return res.status(400).json({ success:false, message:'Paramètre q requis.' });

    const reqEnt = pool.request();
    reqEnt.input('q', sql.NVarChar, `%${q}%`);

    const reqAss = pool.request();
    reqAss.input('q2', sql.NVarChar, `%${q}%`);

    const [entResult, assResult] = await Promise.all([
      reqEnt.query(`
        SELECT TOP ${limit}
          e.code_ent AS code, e.denom_ent AS nom, e.nomcom_ent AS nom_commercial,
          e.NRCCM_ent AS rccm, e.NIMPOT_ent AS ifu,
          e.telmob_ent AS telephone, e.email_ent AS email,
          e.commune_ent AS commune, r.lib_reg AS region,
          e.etat_ent AS etat, 'entreprise' AS type_entite
        FROM EEntreprise e
        LEFT JOIN PRegion r ON e.code_reg = r.code_reg
        WHERE e.denom_ent LIKE @q OR e.nomcom_ent LIKE @q
          OR e.sigle_ent LIKE @q OR e.NRCCM_ent LIKE @q OR e.NIMPOT_ent LIKE @q
      `),
      reqAss.query(`
        SELECT TOP ${limit}
          a.code_ass AS code, a.nom_ass AS nom, a.sigle_ass AS nom_commercial,
          a.recepisse_ass AS rccm, a.ifu_ass AS ifu,
          a.telmob_ass AS telephone, a.email_ass AS email,
          c.lib_commune AS commune, rg.lib_reg AS region,
          a.vailde_ass AS etat, 'association' AS type_entite
        FROM AAssociation a
        LEFT JOIN PCommune c  ON a.code_ville = c.code_ville
        LEFT JOIN PRegion  rg ON c.code_reg   = rg.code_reg
        WHERE a.nom_ass LIKE @q2 OR a.sigle_ass LIKE @q2
          OR a.recepisse_ass LIKE @q2 OR a.ifu_ass LIKE @q2
      `),
    ]);

    res.json({
      success: true,
      data: {
        entreprises:  entResult.recordset,
        associations: assResult.recordset,
        total: entResult.recordset.length + assResult.recordset.length,
      },
    });
  } catch (err) {
    console.error('❌ rechercheGlobale :', err.message);
    res.status(500).json({ success:false, message:'Erreur recherche globale.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   STATISTIQUES GLOBALES
   GET /api/entreprises/stats
══════════════════════════════════════════════════ */
exports.getStats = async (req, res) => {
  try {
    const pool = getPool();

    const [
      totalEnt, totalAss,
      parRegionEnt, parRegionAss,
      parFJ, parEtat,
      parCategorieAss,
    ] = await Promise.all([
      pool.request().query(`SELECT COUNT(*) AS total FROM EEntreprise`),
      pool.request().query(`SELECT COUNT(*) AS total FROM AAssociation`),
      pool.request().query(`
        SELECT r.lib_reg AS region, COUNT(*) AS nb
        FROM EEntreprise e
        LEFT JOIN PRegion r ON e.code_reg = r.code_reg
        GROUP BY r.lib_reg ORDER BY nb DESC
      `),
      pool.request().query(`
        SELECT rg.lib_reg AS region, COUNT(*) AS nb
        FROM AAssociation a
        LEFT JOIN PCommune c  ON a.code_ville = c.code_ville
        LEFT JOIN PRegion  rg ON c.code_reg   = rg.code_reg
        GROUP BY rg.lib_reg ORDER BY nb DESC
      `),
      pool.request().query(`
        SELECT fj.lib_fj AS forme_juridique, COUNT(*) AS nb
        FROM EEntreprise e
        LEFT JOIN PFormeJ fj ON e.code_fj = fj.code_fj
        GROUP BY fj.lib_fj ORDER BY nb DESC
      `),
      pool.request().query(`
        SELECT etat_ent AS etat, COUNT(*) AS nb
        FROM EEntreprise GROUP BY etat_ent ORDER BY nb DESC
      `),
      pool.request().query(`
        SELECT ca.lib_cata AS categorie, COUNT(*) AS nb
        FROM AAssociation a
        LEFT JOIN PCategorieAss ca ON a.code_cata = ca.code_cata
        GROUP BY ca.lib_cata ORDER BY nb DESC
      `),
    ]);

    res.json({
      success: true,
      data: {
        entreprises: {
          total:               totalEnt.recordset[0].total,
          par_region:          parRegionEnt.recordset,
          par_forme_juridique: parFJ.recordset,
          par_etat:            parEtat.recordset,
        },
        associations: {
          total:        totalAss.recordset[0].total,
          par_region:   parRegionAss.recordset,
          par_categorie:parCategorieAss.recordset,
        },
        total_general: totalEnt.recordset[0].total + totalAss.recordset[0].total,
      },
    });
  } catch (err) {
    console.error('❌ getStats :', err.message);
    res.status(500).json({ success:false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RÉFÉRENCES
══════════════════════════════════════════════════ */
exports.getRegions = async (req, res) => {
  try {
    const result = await getPool().request().query(
      `SELECT code_reg AS code, lib_reg AS libelle FROM PRegion ORDER BY lib_reg`
    );
    res.json({ success:true, data: result.recordset });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.getFormesJuridiques = async (req, res) => {
  try {
    const result = await getPool().request().query(
      `SELECT code_fj AS code, lib_fj AS libelle FROM PFormeJ ORDER BY lib_fj`
    );
    res.json({ success:true, data: result.recordset });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.getSousCategories = async (req, res) => {
  try {
    const result = await getPool().request().query(
      `SELECT code_scat AS code, lib_scat AS libelle FROM PScategorie ORDER BY lib_scat`
    );
    res.json({ success:true, data: result.recordset });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};

exports.getCategoriesAssociation = async (req, res) => {
  try {
    const result = await getPool().request().query(
      `SELECT code_cata AS code, lib_cata AS libelle FROM PCategorieAss ORDER BY lib_cata`
    );
    res.json({ success:true, data: result.recordset });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};