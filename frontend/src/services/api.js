import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
};

export const locationsAPI = {
  getAll: (search) => api.get('/locations', { params: search ? { search } : {} }),
  getById: (id) => api.get(`/locations/${id}`),
  getSafety: (id) => api.get(`/locations/${id}/safety`),
  getTopRated: () => api.get('/locations/top-rated'),
  create: (data) => api.post('/locations', data),
};

export const routesAPI = {
  analyze: (startLocationId, endLocationId) =>
    api.post('/routes/analyze', { startLocationId, endLocationId }),
};

export const reviewsAPI = {
  getAll: () => api.get('/reviews'),
  create: (data) => api.post('/reviews', data),
  getByLocation: (locationId) => api.get(`/reviews/location/${locationId}`),
};

export const crimeReportsAPI = {
  getAll: (search) => api.get('/crime-reports', { params: search ? { search } : {} }),
};

export const safeZonesAPI = {
  getAll: () => api.get('/safe-zones'),
  getByCategory: (category) => api.get(`/safe-zones/category/${encodeURIComponent(category)}`),
  getNearby: (lat, lng, radius = 5) =>
    api.get('/safe-zones/nearby', { params: { latitude: lat, longitude: lng, radius } }),
};

export const mlAPI = {
  analyze: (locationId) => api.post('/ml/analyze', { locationId }),
  getModelInfo: () => api.get('/ml/model-info'),
};

export const metroAPI = {
  getStations: (search) => api.get('/metro/stations', { params: search ? { search } : {} }),
  getNearby: (lat, lng, radiusKm = 5) =>
    api.get('/metro/nearby', { params: { latitude: lat, longitude: lng, radius: radiusKm } }),
};

export const recommendationsAPI = {
  getNearby: (params) => api.get('/recommendations/nearby', { params }),
  getPOIs: (lat, lng, radius = 1000) =>
    api.get('/recommendations/pois', { params: { latitude: lat, longitude: lng, radius } }),
};

export default api;
