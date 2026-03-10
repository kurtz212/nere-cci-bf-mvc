// Carte publication avec gestion du masquage visiteur
export default function PublicationCard({ pub, isVisiteur, onLire, onInscrire }) {
  const masquer = (txt) => txt?.replace(/[^\s]/g, 'X') || '';
  const masquerPartiel = (txt) => txt?.split(' ')
    .map((m, i) => i < 2 ? m : m.replace(/[^\s]/g, 'X')).join(' ') || '';

  return (
    <div className={`pub-page-card ${isVisiteur ? 'locked' : ''}`}
      onClick={() => !isVisiteur && onLire(pub)}>
      <div className="pub-card-cat">{pub.categorie}</div>
      <div className="pub-card-date">{isVisiteur ? masquer(pub.date) : pub.date}</div>
      <div className="pub-card-title">{isVisiteur ? masquerPartiel(pub.titre) : pub.titre}</div>
      <div className="pub-card-extrait" style={isVisiteur ? { fontFamily: 'monospace' } : {}}>
        {isVisiteur ? masquer(pub.extrait) : pub.extrait}
      </div>
    </div>
  );
}
