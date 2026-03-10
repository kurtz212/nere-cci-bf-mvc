import { useState } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Rechercher...' }) {
  const [q, setQ] = useState('');
  return (
    <div className="pub-search-bar">
      <span className="pub-search-icon">🔍</span>
      <input className="pub-search-input" placeholder={placeholder}
        value={q} onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSearch(q)} />
      {q && <span className="pub-search-clear" onClick={() => { setQ(''); onSearch(''); }}>✕</span>}
    </div>
  );
}
