import axios from 'axios';

// In development: Vite proxy forwards /api → localhost:5000
// In production (Vercel): VITE_API_URL is set to the Railway backend URL
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL });

export const getApiBase = () => BASE_URL;

// ── Weather ──────────────────────────────────────────────────────────────────
export const getCurrentWeather = (location) => api.get('/weather/current', { params: { location } });
export const getForecast = (location) => api.get('/weather/forecast', { params: { location } });

// ── Records (CRUD) ────────────────────────────────────────────────────────────
export const createRecord = (data) => api.post('/records', data);
export const getAllRecords = () => api.get('/records');
export const getRecord = (id) => api.get(`/records/${id}`);
export const updateRecord = (id, data) => api.put(`/records/${id}`, data);
export const deleteRecord = (id) => api.delete(`/records/${id}`);

// ── Map ───────────────────────────────────────────────────────────────────────
export const getMapData = (location) => api.get('/map', { params: { location } });

// ── YouTube ───────────────────────────────────────────────────────────────────
export const getYoutubeVideos = (location, maxResults = 6) =>
  api.get('/youtube', { params: { location, maxResults } });

// ── Export ────────────────────────────────────────────────────────────────────
export const getExportUrl = (format) => `${BASE_URL}/export?format=${format}`;

export default api;
