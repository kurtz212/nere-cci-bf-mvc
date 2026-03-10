import api from './api';

export const rechercherEntreprises = (params) => api.get('/recherche', { params });
