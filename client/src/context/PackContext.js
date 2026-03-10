import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getMonAbonnement } from '../services/subscription.service';

const PackContext = createContext(null);

export function PackProvider({ children }) {
  const { token } = useAuth();
  const [pack, setPack] = useState(null);
  const [packLevel, setPackLevel] = useState(0);

  useEffect(() => {
    if (token) {
      getMonAbonnement().then(res => {
        if (res.data) { setPack(res.data); setPackLevel(res.data.packId?.accessLevel || 0); }
      }).catch(() => {});
    } else { setPack(null); setPackLevel(0); }
  }, [token]);

  return (
    <PackContext.Provider value={{ pack, packLevel }}>
      {children}
    </PackContext.Provider>
  );
}

export const usePack = () => useContext(PackContext);
