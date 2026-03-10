import api from './api';

export const inscription   = (data)  => api.post('/auth/inscription', data);
export const connexion     = (data)  => api.post('/auth/connexion', data);
export const motDePasseOublie = (email) => api.post('/auth/mot-de-passe-oublie', { email });
export const reinitialiserMDP = (token, password) =>
  api.put(`/auth/reinitialiser-mdp/${token}`, { password });
