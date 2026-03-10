const { getPool, sql } = require('../config/sqlserver');

// ── RECHERCHE D'ENTREPRISES ──
exports.rechercher = async (req, res) => {
  try {
    const {
      denomination, secteur, ville, region,
      rccm, ifu, caMin, caMax,
      employesMin, employesMax,
      accessLevel = 1,
      page = 1, limit = 20
    } = req.query;

    const pool = getPool();
    const request = pool.request();

    let query = `SELECT * FROM (
      SELECT
        rccm, ifu, denomination, secteur, ville, region,
        date_creation, statut,
        ${parseInt(accessLevel) >= 2 ? 'chiffre_affaires,' : 'NULL AS chiffre_affaires,'}
        ${parseInt(accessLevel) >= 2 ? 'nombre_employes,' : 'NULL AS nombre_employes,'}
        ROW_NUMBER() OVER (ORDER BY denomination) AS RowNum
      FROM entreprises
      WHERE 1=1`;

    if (denomination) {
      request.input('denomination', sql.NVarChar, `%${denomination}%`);
      query += ` AND denomination LIKE @denomination`;
    }
    if (secteur) {
      request.input('secteur', sql.NVarChar, secteur);
      query += ` AND secteur = @secteur`;
    }
    if (ville) {
      request.input('ville', sql.NVarChar, `%${ville}%`);
      query += ` AND ville LIKE @ville`;
    }
    if (region) {
      request.input('region', sql.NVarChar, region);
      query += ` AND region = @region`;
    }
    if (rccm) {
      request.input('rccm', sql.NVarChar, rccm);
      query += ` AND rccm = @rccm`;
    }
    if (ifu) {
      request.input('ifu', sql.NVarChar, ifu);
      query += ` AND ifu = @ifu`;
    }
    if (caMin && parseInt(accessLevel) >= 2) {
      request.input('caMin', sql.BigInt, parseInt(caMin));
      query += ` AND chiffre_affaires >= @caMin`;
    }
    if (caMax && parseInt(accessLevel) >= 2) {
      request.input('caMax', sql.BigInt, parseInt(caMax));
      query += ` AND chiffre_affaires <= @caMax`;
    }
    if (employesMin && parseInt(accessLevel) >= 2) {
      request.input('employesMin', sql.Int, parseInt(employesMin));
      query += ` AND nombre_employes >= @employesMin`;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const end = offset + parseInt(limit);

    query += `) AS paged WHERE RowNum > ${offset} AND RowNum <= ${end}`;

    const result = await request.query(query);

    res.json({
      success: true,
      total: result.recordset.length,
      page: parseInt(page),
      data: result.recordset
    });
  } catch (err) {
    console.error('Erreur recherche NERE :', err.message);
    res.status(500).json({ success: false, message: 'Erreur lors de la recherche.' });
  }
};

// ── DÉTAIL D'UNE ENTREPRISE PAR RCCM ──
exports.getEntrepriseById = async (req, res) => {
  try {
    const pool = getPool();
    const request = pool.request();
    request.input('rccm', sql.NVarChar, req.params.rccm);

    const result = await request.query(
      'SELECT * FROM entreprises WHERE rccm = @rccm'
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Entreprise introuvable.' });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération.' });
  }
};
