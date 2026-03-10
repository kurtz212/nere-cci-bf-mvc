import { useState, useCallback } from 'react';
import { rechercherEntreprises } from '../services/nere.service';

export function useSearchNERE() {
  const [resultats, setResultats] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const rechercher = useCallback(async (criteres) => {
    setLoading(true); setError(null);
    try {
      const res = await rechercherEntreprises(criteres);
      setResultats(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de recherche');
    } finally { setLoading(false); }
  }, []);

  return { resultats, loading, error, rechercher };
}
