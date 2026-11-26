import axios from 'axios';

// In production the API is served from the same origin (/api).
// For a separately hosted API, set VITE_API_URL at build time,
// e.g. VITE_API_URL=https://api.carepoint.example.com
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('carepoint_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;
