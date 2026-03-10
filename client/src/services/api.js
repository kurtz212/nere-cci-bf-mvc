import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL });

// Injecter le token JWT automatiquement
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Rediriger vers /connexion si 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
    return Promise.reject(err);
  }
);

export default api;
