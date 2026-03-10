import api from './api';

export const getPublications   = (params) => api.get('/publications', { params });
export const getPublicationById = (id)    => api.get(`/publications/${id}`);
