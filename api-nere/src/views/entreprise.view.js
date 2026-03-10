// Formateur de réponse : données brutes SQL → JSON API
exports.formatEntreprise = (row) => ({
  rccm:         row.RCCM        || null,
  ifu:          row.IFU         || null,
  nom:          row.NOM_ENTREPRISE || null,
  secteur:      row.SECTEUR     || null,
  region:       row.REGION      || null,
  ville:        row.VILLE       || null,
  ca:           row.CHIFFRE_AFFAIRES || null,
  effectif:     row.EFFECTIF    || null,
  dateCreation: row.DATE_CREATION || null,
  statut:       row.STATUT      || null,
});

exports.formatListe = (rows) => rows.map(exports.formatEntreprise);
