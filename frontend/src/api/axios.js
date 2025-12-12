import axios from 'axios';

// Prefer env-configured API base in production. Fallback to same-origin '/api'.
const BASE_URL = 'http://4.240.89.33:5000' || '/api';

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
