// Masque les données sensibles pour les visiteurs non connectés
exports.masquer = (texte) =>
  typeof texte === 'string' ? texte.replace(/[^\s]/g, 'X') : texte;

exports.masquerPartiel = (texte, nbMotsVisibles = 2) => {
  if (typeof texte !== 'string') return texte;
  return texte.split(' ')
    .map((mot, i) => i < nbMotsVisibles ? mot : mot.replace(/[^\s]/g, 'X'))
    .join(' ');
};
