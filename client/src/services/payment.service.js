import api from './api';

export const initierPaiement     = (data) => api.post('/paiements/initier', data);
export const getHistoriquePaiements = ()   => api.get('/paiements/historique');
