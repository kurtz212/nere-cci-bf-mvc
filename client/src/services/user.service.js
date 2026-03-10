import api from './api';

export const getProfil    = ()     => api.get('/users/profil');
export const updateProfil = (data) => api.put('/users/profil', data);
export const getHistorique = ()    => api.get('/users/historique');
