// api-nere/src/controllers/entreprises.controller.js
const { getPool, sql } = require('../config/sqlserver');

/* ══════════════════════════════════════════════════
   HELPER — WHERE pour entreprises
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
    where += ` AND e.adrsiege_ent LIKE @region`;
  }
  if (commune) {
    params.commune = { type: sql.NVarChar, value: `%${commune}%` };
    where += ` AND e.adrsiege_ent LIKE @commune`;
  }
  if (quartier) {
    params.quartier = { type: sql.NVarChar, value: `%${quartier}%` };
    where += ` AND e.quartier_ent LIKE @quartier`;
  }
  if (forme_juridique) {
    // Recherche exacte ou partielle selon la valeur
    params.forme_juridique = { type: sql.NVarChar, value: forme_juridique.trim() };
    where += ` AND e.code_fj IN (SELECT code_fj FROM PFormeJ WHERE lib_fj = @forme_juridique OR lib_fj LIKE @forme_juridique)`;
  }
  if (sous_categorie) {
    // Si c'est un code direct (ex: C01, I04) on filtre par code
    // Sinon on cherche par libellé
    const estCode = /^[A-Z][0-9]{2}$/.test(sous_categorie.trim());
    if (estCode) {
      params.sous_categorie = { type: sql.NVarChar, value: sous_categorie.trim() };
      where += ` AND e.code_scat = @sous_categorie`;
    } else {
      params.sous_categorie = { type: sql.NVarChar, value: `%${sous_categorie}%` };
      where += ` AND e.code_scat IN (SELECT code_scat FROM PScategorie WHERE lib_scat LIKE @sous_categorie)`;
    }
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
    where += ` AND a.code_ville IN (SELECT code_com FROM PCommune WHERE code_prv IN (SELECT code_prv FROM PProvince WHERE code_reg IN (SELECT code_reg FROM PRegion WHERE lib_reg LIKE @region)))`;
  }
  if (commune) {
    params.commune = { type: sql.NVarChar, value: `%${commune}%` };
    where += ` AND a.code_ville IN (SELECT code_com FROM PCommune WHERE lib_com LIKE @commune)`;
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

/* ══════════════════════════════════════════════════
   HELPER — WHERE pour XDOUANE (import + export)
   type_ie : 'I' = Importation, 'E' = Exportation
══════════════════════════════════════════════════ */
function buildParamsDouane(query, typeIE) {
  const params = {};
  const {
    denomination, rccm, ifu,
    produit, chapitre, sous_chapitre,
    province, commune,
    date_debut, date_fin,
    valide,
  } = query;

  params.type_ie = { type: sql.Char, value: typeIE };
  let where = 'WHERE d.type_ie = @type_ie';

  if (denomination) {
    params.denomination = { type: sql.NVarChar, value: `%${denomination}%` };
    where += ` AND (d.denom_ent LIKE @denomination OR d.nomcom_ent LIKE @denomination OR d.sigle_ent LIKE @denomination)`;
  }
  if (rccm) {
    params.rccm = { type: sql.NVarChar, value: rccm.trim() };
    where += ` AND d.NRCCM_ent = @rccm`;
  }
  if (ifu) {
    params.ifu = { type: sql.NVarChar, value: ifu.trim() };
    where += ` AND d.NIMPOT_ent = @ifu`;
  }
  if (produit) {
    params.produit = { type: sql.NVarChar, value: `%${produit}%` };
    where += ` AND (d.lib_prd LIKE @produit OR d.code_prd LIKE @produit)`;
  }
  if (chapitre) {
    params.chapitre = { type: sql.NVarChar, value: `%${chapitre}%` };
    where += ` AND (d.lib_ch LIKE @chapitre OR d.code_ch LIKE @chapitre)`;
  }
  if (sous_chapitre) {
    params.sous_chapitre = { type: sql.NVarChar, value: `%${sous_chapitre}%` };
    where += ` AND (d.lib_sch LIKE @sous_chapitre OR d.code_sch LIKE @sous_chapitre)`;
  }
  if (province) {
    params.province = { type: sql.NVarChar, value: `%${province}%` };
    where += ` AND d.province_ent LIKE @province`;
  }
  if (commune) {
    params.commune = { type: sql.NVarChar, value: `%${commune}%` };
    where += ` AND d.commune_ent LIKE @commune`;
  }
  if (date_debut) {
    params.date_debut = { type: sql.Date, value: new Date(date_debut) };
    where += ` AND d.debutp >= @date_debut`;
  }
  if (date_fin) {
    params.date_fin = { type: sql.Date, value: new Date(date_fin) };
    where += ` AND d.finp <= @date_fin`;
  }
  if (valide) {
    params.valide = { type: sql.NChar, value: valide };
    where += ` AND d.valide = @valide`;
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
  e.denom_ent        AS denomination,
  e.nomcom_ent       AS nom_commercial,
  e.enseigne_ent     AS enseigne,
  e.sigle_ent        AS sigle,
  e.slogan_ent       AS slogan,
  e.NRCCM_ent        AS rccm,
  e.DateRCCM_ent     AS date_rccm,
  e.NIMPOT_ent       AS ifu,
  e.NSECU_ent        AS cnss,
  e.NIDNAT_ent       AS identifiant_national,
  e.NFPRO_ent        AS numero_pro,
  e.email_ent        AS email,
  e.telfixe_ent      AS telephone_fixe,
  e.telmob_ent       AS telephone_mobile,
  e.fax_ent          AS fax,
  e.siteweb_ent      AS site_web,
  e.bp_ent           AS boite_postale,
  e.cp_ent           AS code_postal,
  e.adrsiege_ent     AS adresse_siege,
  e.rue_ent          AS rue,
  e.parcelle_ent     AS parcelle,
  e.porte_ent        AS porte,
  e.lot_ent          AS lot,
  e.section_ent      AS section,
  e.commune_ent      AS commune,
  e.quartier_ent     AS quartier,
  e.debutact_ent     AS date_debut_activite,
  e.DateCreation     AS date_creation,
  e.etat_ent         AS etat,
  e.capital_ent      AS capital,
  e.capitalnat_ent   AS capital_national,
  e.effperm_ent      AS effectif_permanent,
  e.efftemp_ent      AS effectif_temporaire,
  e.effnat_ent       AS effectif_national,
  e.effetrang_ent    AS effectif_etranger,
  e.ca_ent           AS chiffre_affaires,
  e.activite_ent     AS activite,
  e.obs_ent          AS observations,
  CASE
    WHEN e.adrsiege_ent LIKE '%OUAGADOUGOU%'  THEN 'Ouagadougou'
    WHEN e.adrsiege_ent LIKE '%BOBO-DIOULASSO%' THEN 'Bobo-Dioulasso'
    WHEN e.adrsiege_ent LIKE '%KOUDOUGOU%'    THEN 'Koudougou'
    WHEN e.adrsiege_ent LIKE '%BANFORA%'      THEN 'Banfora'
    WHEN e.adrsiege_ent LIKE '%OUAHIGOUYA%'   THEN 'Ouahigouya'
    WHEN e.adrsiege_ent LIKE '%KAYA%'         THEN 'Kaya'
    WHEN e.adrsiege_ent LIKE '%FADA%'         THEN 'Fada N''Gourma'
    WHEN e.adrsiege_ent LIKE '%DEDOUGOU%'     THEN 'Dédougou'
    WHEN e.adrsiege_ent LIKE '%TENKODOGO%'    THEN 'Tenkodogo'
    WHEN e.adrsiege_ent LIKE '%ZINIARE%'      THEN 'Ziniaré'
    WHEN e.adrsiege_ent LIKE '%MANGA%'        THEN 'Manga'
    WHEN e.adrsiege_ent LIKE '%DORI%'         THEN 'Dori'
    WHEN e.adrsiege_ent LIKE '%GAOUA%'        THEN 'Gaoua'
    WHEN e.adrsiege_ent LIKE '%NOUNA%'        THEN 'Nouna'
    WHEN e.adrsiege_ent IS NOT NULL AND e.adrsiege_ent != '' THEN 'Autre ville'
    ELSE NULL
  END AS region,
  fj.lib_fj          AS forme_juridique,
  sc.lib_scat        AS sous_categorie,
  'entreprise'       AS type_entite
`;

const JOINS_ENT = `
  LEFT JOIN PFormeJ     fj ON e.code_fj   = fj.code_fj
  LEFT JOIN PScategorie sc ON e.code_scat = sc.code_scat
`;

/* ── Colonnes SELECT associations ── */
const SELECT_ASS = `
  a.code_ass,
  a.nom_ass           AS nom,
  a.sigle_ass         AS sigle,
  a.email_ass         AS email,
  a.siteweb_ass       AS site_web,
  a.datecrea_ass      AS date_creation,
  a.recepisse_ass     AS recepisse,
  a.daterecepisse_ass AS date_recepisse,
  a.datevalidite_ass  AS date_validite,
  a.vailde_ass        AS statut_validite,
  a.contact_ass       AS contact,
  a.telmob_ass        AS telephone_mobile,
  a.telfixe_ass       AS telephone_fixe,
  a.fax_ass           AS fax,
  a.adr_ass           AS adresse,
  a.ifu_ass           AS ifu,
  a.dateifu_ass       AS date_ifu,
  a.eff_membre        AS effectif_membres,
  a.objectif          AS objectif,
  ca.lib_cata         AS categorie,
  c.lib_com           AS commune,
  rg.lib_reg          AS region,
  'association'       AS type_entite
`;

const JOINS_ASS = `
  LEFT JOIN PCategorieAss ca ON a.code_cata  = ca.code_cata
  LEFT JOIN PCommune      c  ON a.code_ville  = c.code_com
  LEFT JOIN PProvince     pv ON c.code_prv    = pv.code_prv
  LEFT JOIN PRegion       rg ON pv.code_reg   = rg.code_reg
`;

/* ── Colonnes SELECT XDOUANE ── */
const SELECT_DOUANE = `
  d.Numero,
  d.code,
  d.debutp              AS date_debut,
  d.finp                AS date_fin,
  d.valide,
  d.NRCCM_ent           AS rccm,
  d.NIMPOT_ent          AS ifu,
  d.NSECU_ent           AS cnss,
  d.code_prd            AS code_produit,
  d.lib_prd             AS libelle_produit,
  d.code_ch             AS code_chapitre,
  d.lib_ch              AS libelle_chapitre,
  d.code_sch            AS code_sous_chapitre,
  d.lib_sch             AS libelle_sous_chapitre,
  d.type_ie             AS type,
  d.valeur_ie           AS valeur,
  d.poids_ie            AS poids,
  d.mtassu_ie           AS montant_assurance,
  d.mtdouane_ie         AS montant_douane,
  d.mtmercu_ie          AS montant_mercuriale,
  d.mttaxees_ie         AS montant_taxes,
  d.denom_ent           AS denomination,
  d.nomcom_ent          AS nom_commercial,
  d.sigle_ent           AS sigle,
  d.email_ent           AS email,
  d.telfixe_ent         AS telephone_fixe,
  d.telmob_ent          AS telephone_mobile,
  d.commune_ent         AS commune,
  d.province_ent        AS province,
  d.district_ent        AS district,
  d.NomDirigeant_ent    AS nom_dirigeant,
  d.FonctDirigeant_ent  AS fonction_dirigeant,
  d.TelMobDirigeant_ent AS tel_dirigeant
`;

/* ══════════════════════════════════════════════════
   RECHERCHE SIMPLE ENTREPRISES
   GET /api/entreprises
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
    const countQuery = `SELECT COUNT(*) AS total FROM EEntreprise e ${JOINS_ENT} ${where}`;

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
    console.error(' rechercher :', err.message);
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

    console.log('Multicritere WHERE :', where);

    const selectQuery = `
      SELECT * FROM (
        SELECT ${SELECT_ENT},
          ROW_NUMBER() OVER (ORDER BY e.denom_ent) AS RowNum
        FROM EEntreprise e ${JOINS_ENT} ${where}
      ) AS paged
      WHERE RowNum > ${offset} AND RowNum <= ${fin}
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM EEntreprise e ${JOINS_ENT} ${where}`;

    const [result, countResult] = await Promise.all([
      createRequest(pool, params).query(selectQuery),
      createRequest(pool, params).query(countQuery),
    ]);

    console.log('Multicritere : ' + (countResult.recordset[0]?.total) + ' resultats');

    res.json({
      success: true,
      total:   countResult.recordset[0]?.total || 0,
      page, limit,
      data:    result.recordset,
    });
  } catch (err) {
    console.error(' rechercherMulticritere :', err.message);
    res.status(500).json({ success:false, message:'Erreur multicritere.', detail: err.message });
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
    console.error(' getEntrepriseById :', err.message);
    res.status(500).json({ success:false, message:'Erreur recuperation.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RECHERCHE ASSOCIATIONS
   GET /api/entreprises/nere/associations
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
    const countQuery = `SELECT COUNT(*) AS total FROM AAssociation a ${JOINS_ASS} ${where}`;

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
    console.error(' rechercherAssociations :', err.message);
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

    const [assResult, dirigResult] = await Promise.all([
      request.query(`
        SELECT ${SELECT_ASS}
        FROM AAssociation a ${JOINS_ASS}
        WHERE a.code_ass = @code
      `),
      pool.request().input('code2', sql.NVarChar, req.params.code).query(`
        SELECT
          d.nom_direass        AS nom,
          d.raison_sociale     AS raison_sociale,
          d.sexe_direass       AS sexe,
          d.email_direass      AS email,
          d.tel_direass        AS telephone,
          d.adr_direass        AS adresse,
          f.lib_fon            AS fonction
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
    console.error(' getAssociationById :', err.message);
    res.status(500).json({ success:false, message:'Erreur recuperation association.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RECHERCHE IMPORTATIONS
   GET /api/entreprises/nere/importations
   Table XDOUANE — type_ie = 'I'
══════════════════════════════════════════════════ */
exports.rechercherImportations = async (req, res) => {
  try {
    const pool   = getPool();
    const page   = Math.max(1, parseInt(req.query.page  || 1));
    const limit  = Math.min(200, parseInt(req.query.limit || 20));
    const offset = (page - 1) * limit;
    const fin    = offset + limit;

    const { where, params } = buildParamsDouane(req.query, 'I');

    const selectQuery = `
      SELECT * FROM (
        SELECT ${SELECT_DOUANE},
          ROW_NUMBER() OVER (ORDER BY d.denom_ent) AS RowNum
        FROM XDOUANE d ${where}
      ) AS paged
      WHERE RowNum > ${offset} AND RowNum <= ${fin}
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM XDOUANE d ${where}`;

    const [result, countResult] = await Promise.all([
      createRequest(pool, params).query(selectQuery),
      createRequest(pool, params).query(countQuery),
    ]);

    console.log('Importations : ' + (countResult.recordset[0]?.total) + ' resultats');

    res.json({
      success: true,
      total:   countResult.recordset[0]?.total || 0,
      page, limit,
      type:    'importation',
      data:    result.recordset,
    });
  } catch (err) {
    console.error(' rechercherImportations :', err.message);
    res.status(500).json({ success:false, message:'Erreur importations.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RECHERCHE EXPORTATIONS
   GET /api/entreprises/nere/exportations
   Table XDOUANE — type_ie = 'E'
══════════════════════════════════════════════════ */
exports.rechercherExportations = async (req, res) => {
  try {
    const pool   = getPool();
    const page   = Math.max(1, parseInt(req.query.page  || 1));
    const limit  = Math.min(200, parseInt(req.query.limit || 20));
    const offset = (page - 1) * limit;
    const fin    = offset + limit;

    const { where, params } = buildParamsDouane(req.query, 'E');

    const selectQuery = `
      SELECT * FROM (
        SELECT ${SELECT_DOUANE},
          ROW_NUMBER() OVER (ORDER BY d.denom_ent) AS RowNum
        FROM XDOUANE d ${where}
      ) AS paged
      WHERE RowNum > ${offset} AND RowNum <= ${fin}
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM XDOUANE d ${where}`;

    const [result, countResult] = await Promise.all([
      createRequest(pool, params).query(selectQuery),
      createRequest(pool, params).query(countQuery),
    ]);

    console.log('Exportations : ' + (countResult.recordset[0]?.total) + ' resultats');

    res.json({
      success: true,
      total:   countResult.recordset[0]?.total || 0,
      page, limit,
      type:    'exportation',
      data:    result.recordset,
    });
  } catch (err) {
    console.error(' rechercherExportations :', err.message);
    res.status(500).json({ success:false, message:'Erreur exportations.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   STATISTIQUES GLOBALES
   GET /api/entreprises/stats
══════════════════════════════════════════════════ */
exports.getStats = async (req, res) => {
  try {
    const pool = getPool();
    const [total, parRegion, parFJ, totalAss] = await Promise.all([
      pool.request().query(`SELECT COUNT(*) AS total FROM EEntreprise`),
      pool.request().query(`
        SELECT 
          CASE
            WHEN adrsiege_ent LIKE '%OUAGADOUGOU%' THEN 'Ouagadougou'
            WHEN adrsiege_ent LIKE '%BOBO%'        THEN 'Bobo-Dioulasso'
            WHEN adrsiege_ent LIKE '%KOUDOUGOU%'   THEN 'Koudougou'
            WHEN adrsiege_ent LIKE '%BANFORA%'     THEN 'Banfora'
            WHEN adrsiege_ent LIKE '%OUAHIGOUYA%'  THEN 'Ouahigouya'
            WHEN adrsiege_ent LIKE '%KAYA%'        THEN 'Kaya'
            WHEN adrsiege_ent LIKE '%FADA%'        THEN 'Fada N''Gourma'
            WHEN adrsiege_ent LIKE '%DEDOUGOU%'    THEN 'Dédougou'
            WHEN adrsiege_ent LIKE '%TENKODOGO%'   THEN 'Tenkodogo'
            WHEN adrsiege_ent LIKE '%ZINIGMA%' OR adrsiege_ent LIKE '%ZINIARE%' THEN 'Ziniaré'
            WHEN adrsiege_ent IS NOT NULL AND adrsiege_ent != '' THEN 'Autres villes'
            ELSE 'Non renseigné'
          END AS region,
          COUNT(*) AS nb
        FROM EEntreprise
        GROUP BY
          CASE
            WHEN adrsiege_ent LIKE '%OUAGADOUGOU%' THEN 'Ouagadougou'
            WHEN adrsiege_ent LIKE '%BOBO%'        THEN 'Bobo-Dioulasso'
            WHEN adrsiege_ent LIKE '%KOUDOUGOU%'   THEN 'Koudougou'
            WHEN adrsiege_ent LIKE '%BANFORA%'     THEN 'Banfora'
            WHEN adrsiege_ent LIKE '%OUAHIGOUYA%'  THEN 'Ouahigouya'
            WHEN adrsiege_ent LIKE '%KAYA%'        THEN 'Kaya'
            WHEN adrsiege_ent LIKE '%FADA%'        THEN 'Fada N''Gourma'
            WHEN adrsiege_ent LIKE '%DEDOUGOU%'    THEN 'Dédougou'
            WHEN adrsiege_ent LIKE '%TENKODOGO%'   THEN 'Tenkodogo'
            WHEN adrsiege_ent LIKE '%ZINIGMA%' OR adrsiege_ent LIKE '%ZINIARE%' THEN 'Ziniaré'
            WHEN adrsiege_ent IS NOT NULL AND adrsiege_ent != '' THEN 'Autres villes'
            ELSE 'Non renseigné'
          END
        ORDER BY nb DESC
      `),
      pool.request().query(`
        SELECT fj.lib_fj AS forme_juridique, COUNT(*) AS nb
        FROM EEntreprise e
        LEFT JOIN PFormeJ fj ON e.code_fj = fj.code_fj
        GROUP BY fj.lib_fj ORDER BY nb DESC
      `),
      pool.request().query(`SELECT COUNT(*) AS total FROM AAssociation`),
    ]);
    res.json({
      success: true,
      data: {
        total:               total.recordset[0].total,
        total_associations:  totalAss.recordset[0].total,
        par_region:          parRegion.recordset,
        par_forme_juridique: parFJ.recordset,
      }
    });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   STATISTIQUES ASSOCIATIONS
   GET /api/entreprises/stats/associations
══════════════════════════════════════════════════ */
exports.getStatsAssociations = async (req, res) => {
  try {
    const pool = getPool();
    const { region } = req.query;

    // Filtre région optionnel
    let whereRegion = '';
    const reqTotal   = pool.request();
    const reqRegion  = pool.request();
    const reqCateg   = pool.request();

    if (region) {
      reqTotal.input('region',  sql.NVarChar, `%${region}%`);
      reqRegion.input('region', sql.NVarChar, `%${region}%`);
      reqCateg.input('region',  sql.NVarChar, `%${region}%`);
      whereRegion = `WHERE rg.lib_reg LIKE @region`;
    }

    const joinAss = `
      FROM AAssociation a
      LEFT JOIN PCommune  c  ON a.code_ville = c.code_com
      LEFT JOIN PProvince pv ON c.code_prv   = pv.code_prv
      LEFT JOIN PRegion   rg ON pv.code_reg  = rg.code_reg
    `;

    const [total, parRegion, parCategorie] = await Promise.all([
      reqTotal.query(`SELECT COUNT(*) AS total ${joinAss} ${whereRegion.replace('rg.lib_reg','rg.lib_reg')}`),
      reqRegion.query(`
        SELECT rg.lib_reg AS region, COUNT(*) AS nb
        ${joinAss} ${whereRegion}
        GROUP BY rg.lib_reg ORDER BY nb DESC
      `),
      reqCateg.query(`
        SELECT ca.lib_cata AS categorie, COUNT(*) AS nb
        ${joinAss}
        LEFT JOIN PCategorieAss ca ON a.code_cata = ca.code_cata
        ${whereRegion}
        GROUP BY ca.lib_cata ORDER BY nb DESC
      `),
    ]);

    res.json({
      success: true,
      data: {
        total:         total.recordset[0].total,
        filtre_region: region || null,
        par_region:    parRegion.recordset,
        par_categorie: parCategorie.recordset,
      }
    });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   STATISTIQUES IMPORTATIONS
   GET /api/entreprises/stats/importations
   Table XDOUANE — type_ie = 'I'
══════════════════════════════════════════════════ */
exports.getStatsImportations = async (req, res) => {
  try {
    const pool = getPool();
    const { region, sous_categorie, annee, annee_debut, annee_fin } = req.query;

    // Construction du WHERE dynamique
    let where = `WHERE type_ie = 'I'`;
    const buildReq = () => {
      const r = pool.request();
      if (region)        { r.input('region',        sql.NVarChar, `%${region}%`);        }
      if (sous_categorie){ r.input('sous_categorie', sql.NVarChar, sous_categorie.trim()); }
      if (annee)         { r.input('annee',          sql.Int,      parseInt(annee));       }
      if (annee_debut)   { r.input('annee_debut',    sql.Int,      parseInt(annee_debut)); }
      if (annee_fin)     { r.input('annee_fin',      sql.Int,      parseInt(annee_fin));   }
      return r;
    };

    let whereExtra = '';
    if (region)         whereExtra += ` AND (commune_ent LIKE @region OR province_ent LIKE @region)`;
    if (annee)          whereExtra += ` AND YEAR(debutp) = @annee`;
    if (annee_debut && annee_fin) whereExtra += ` AND YEAR(debutp) BETWEEN @annee_debut AND @annee_fin`;
    else if (annee_debut) whereExtra += ` AND YEAR(debutp) >= @annee_debut`;
    else if (annee_fin)   whereExtra += ` AND YEAR(debutp) <= @annee_fin`;

    const fullWhere = where + whereExtra;

    const [total, parProduit, parProvince, totalValeur] = await Promise.all([
      buildReq().query(`SELECT COUNT(*) AS total FROM XDOUANE ${fullWhere}`),
      buildReq().query(`
        SELECT TOP 10 lib_prd AS produit, COUNT(*) AS nb,
          SUM(valeur_ie) AS valeur_totale
        FROM XDOUANE ${fullWhere}
        GROUP BY lib_prd ORDER BY valeur_totale DESC
      `),
      buildReq().query(`
        SELECT TOP 10 province_ent AS province, COUNT(*) AS nb,
          SUM(valeur_ie) AS valeur_totale
        FROM XDOUANE ${fullWhere} AND province_ent IS NOT NULL
        GROUP BY province_ent ORDER BY valeur_totale DESC
      `),
      buildReq().query(`
        SELECT SUM(valeur_ie)    AS valeur_totale,
               SUM(poids_ie)     AS poids_total,
               SUM(mttaxees_ie)  AS taxes_totales,
               SUM(mtdouane_ie)  AS droits_douane
        FROM XDOUANE ${fullWhere}
      `),
    ]);

    res.json({
      success: true,
      type: 'importation',
      filtres: { region: region||null, sous_categorie: sous_categorie||null, annee: annee||null },
      data: {
        total:         total.recordset[0].total,
        valeur_totale: totalValeur.recordset[0].valeur_totale,
        poids_total:   totalValeur.recordset[0].poids_total,
        taxes_totales: totalValeur.recordset[0].taxes_totales,
        droits_douane: totalValeur.recordset[0].droits_douane,
        par_produit:   parProduit.recordset,
        par_province:  parProvince.recordset,
      }
    });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   STATISTIQUES EXPORTATIONS
   GET /api/entreprises/stats/exportations
   Table XDOUANE — type_ie = 'E'
══════════════════════════════════════════════════ */
exports.getStatsExportations = async (req, res) => {
  try {
    const pool = getPool();
    const { region, sous_categorie, annee, annee_debut, annee_fin } = req.query;

    const buildReq = () => {
      const r = pool.request();
      if (region)        { r.input('region',        sql.NVarChar, `%${region}%`);        }
      if (sous_categorie){ r.input('sous_categorie', sql.NVarChar, sous_categorie.trim()); }
      if (annee)         { r.input('annee',          sql.Int,      parseInt(annee));       }
      if (annee_debut)   { r.input('annee_debut',    sql.Int,      parseInt(annee_debut)); }
      if (annee_fin)     { r.input('annee_fin',      sql.Int,      parseInt(annee_fin));   }
      return r;
    };

    let whereExtra = '';
    if (region)           whereExtra += ` AND (commune_ent LIKE @region OR province_ent LIKE @region)`;
    if (annee)            whereExtra += ` AND YEAR(debutp) = @annee`;
    if (annee_debut && annee_fin) whereExtra += ` AND YEAR(debutp) BETWEEN @annee_debut AND @annee_fin`;
    else if (annee_debut) whereExtra += ` AND YEAR(debutp) >= @annee_debut`;
    else if (annee_fin)   whereExtra += ` AND YEAR(debutp) <= @annee_fin`;

    const fullWhere = `WHERE type_ie = 'E'` + whereExtra;

    const [total, parProduit, parProvince, totalValeur] = await Promise.all([
      buildReq().query(`SELECT COUNT(*) AS total FROM XDOUANE ${fullWhere}`),
      buildReq().query(`
        SELECT TOP 10 lib_prd AS produit, COUNT(*) AS nb,
          SUM(valeur_ie) AS valeur_totale
        FROM XDOUANE ${fullWhere}
        GROUP BY lib_prd ORDER BY valeur_totale DESC
      `),
      buildReq().query(`
        SELECT TOP 10 province_ent AS province, COUNT(*) AS nb,
          SUM(valeur_ie) AS valeur_totale
        FROM XDOUANE ${fullWhere} AND province_ent IS NOT NULL
        GROUP BY province_ent ORDER BY valeur_totale DESC
      `),
      buildReq().query(`
        SELECT SUM(valeur_ie)   AS valeur_totale,
               SUM(poids_ie)    AS poids_total,
               SUM(mttaxees_ie) AS taxes_totales,
               SUM(mtdouane_ie) AS droits_douane
        FROM XDOUANE ${fullWhere}
      `),
    ]);

    res.json({
      success: true,
      type: 'exportation',
      filtres: { region: region||null, sous_categorie: sous_categorie||null, annee: annee||null },
      data: {
        total:         total.recordset[0].total,
        valeur_totale: totalValeur.recordset[0].valeur_totale,
        poids_total:   totalValeur.recordset[0].poids_total,
        taxes_totales: totalValeur.recordset[0].taxes_totales,
        droits_douane: totalValeur.recordset[0].droits_douane,
        par_produit:   parProduit.recordset,
        par_province:  parProvince.recordset,
      }
    });
  } catch (err) {
    res.status(500).json({ success:false, message: err.message });
  }
};

/* ══════════════════════════════════════════════════
   RECHERCHE COMBINEE (entreprises + associations)
   GET /api/entreprises/recherche-globale?q=...
══════════════════════════════════════════════════ */
exports.rechercheGlobale = async (req, res) => {
  try {
    const pool  = getPool();
    const q     = req.query.q || '';
    const limit = Math.min(20, parseInt(req.query.limit || 10));

    if (!q) return res.status(400).json({ success:false, message:'Parametre q requis.' });

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
          e.adrsiege_ent AS commune, e.adrsiege_ent AS region,
          e.etat_ent AS etat, 'entreprise' AS type_entite
        FROM EEntreprise e
        WHERE e.denom_ent LIKE @q OR e.nomcom_ent LIKE @q
          OR e.sigle_ent LIKE @q OR e.NRCCM_ent LIKE @q OR e.NIMPOT_ent LIKE @q
      `),
      reqAss.query(`
        SELECT TOP ${limit}
          a.code_ass AS code, a.nom_ass AS nom, a.sigle_ass AS nom_commercial,
          a.recepisse_ass AS rccm, a.ifu_ass AS ifu,
          a.telmob_ass AS telephone, a.email_ass AS email,
          c.lib_com AS commune, rg.lib_reg AS region,
          a.vailde_ass AS etat, 'association' AS type_entite
        FROM AAssociation a
        LEFT JOIN PCommune  c  ON a.code_ville = c.code_com
        LEFT JOIN PProvince pv ON c.code_prv  = pv.code_prv
        LEFT JOIN PRegion   rg ON pv.code_reg  = rg.code_reg
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
    console.error('rechercheGlobale :', err.message);
    res.status(500).json({ success:false, message:'Erreur recherche globale.', detail: err.message });
  }
};

/* ══════════════════════════════════════════════════
   REFERENCES
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

/* ══════════════════════════════════════════════════
   LISTER TOUTES LES TABLES DE dbNERE (diagnostic)
   GET /api/entreprises/refs/tables
══════════════════════════════════════════════════ */
exports.getTables = async (req, res) => {
  try {
    const result = await getPool().request().query(`
      SELECT TABLE_NAME, TABLE_TYPE
      FROM INFORMATION_SCHEMA.TABLES
      ORDER BY TABLE_NAME
    `);
    res.json({ success:true, data: result.recordset });
  } catch (err) { res.status(500).json({ success:false, message: err.message }); }
};