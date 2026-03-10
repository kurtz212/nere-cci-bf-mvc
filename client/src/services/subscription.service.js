import api from './api';

export const getMonAbonnement = ()     => api.get('/abonnements/mon-abonnement');
export const abonner          = (data) => api.post('/abonnements/abonner', data);
