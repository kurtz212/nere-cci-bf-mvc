export default function PackCard({ pack, featured, onChoisir }) {
  return (
    <div className={`pack-card-home ${featured ? 'featured' : ''}`}>
      <div className="pack-card-name">{pack.nom.toUpperCase()}</div>
      <div className="pack-card-price">{pack.prix.toLocaleString()} <span>FCFA / an</span></div>
      <button onClick={() => onChoisir(pack)}>Choisir {pack.nom}</button>
    </div>
  );
}
