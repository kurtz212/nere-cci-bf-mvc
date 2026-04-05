const axios     = require('axios');
const SearchLog = require('../models/SearchLog.model');

exports.rechercherEntreprises = async (req, res, next) => {
  try {
    const { nom, rccm, secteur, region, ville } = req.query;
    const params = { nom, rccm, secteur, region, ville };

    const response = await axios.get(`${process.env.NERE_API_URL}/entreprises`, { params });

    // Logger la recherche
    await SearchLog.create({
      userId: req.user.id,
      criteres: params,
      resultatCount: response.data.data?.length || 0
    });

    res.json({ success: true, data: response.data.data });
  } catch (err) { next(err); }
};
