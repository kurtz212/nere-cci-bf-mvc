const axios     = require('axios');
const SearchLog = require('../models/SearchLog.model');
const User      = require('../models/User.model');

exports.rechercherEntreprises = async (req, res, next) => {
  try {
    const { nom, rccm, secteur, region, ville } = req.query;
    const params = { nom, rccm, secteur, region, ville };

    // Vérifier si l'utilisateur est un gestionnaire (manager)
    if (req.user) {
      const user = await User.findById(req.user.id);
      
      // Si c'est un gestionnaire et qu'il fait une recherche multicritère
      if (user && user.role === 'manager') {
        // Compter le nombre de critères
        const criteresFournis = [nom, rccm, secteur, region, ville].filter(c => c).length;
        
        // Si plus d'un critère, vérifier la permission
        if (criteresFournis > 1 && !user.canSearchMultiCriteria) {
          return res.status(403).json({
            success: false,
            message: 'Vous n\'êtes pas autorisé à effectuer des recherches multicritères. Veuillez contacter l\'administrateur pour demander l\'autorisation.',
            requiresPermission: true
          });
        }
      }
    }

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
