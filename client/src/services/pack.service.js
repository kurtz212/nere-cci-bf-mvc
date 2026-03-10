import api from './api';

export const getAllPacks = ()   => api.get('/packs');
export const getPackById = (id) => api.get(`/packs/${id}`);
