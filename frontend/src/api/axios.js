import axios from 'axios';

// Use empty baseURL - components will specify full paths like /api/users/login
// In production, Nginx proxies /api to backend container
// In dev, Vite proxies /api to localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
