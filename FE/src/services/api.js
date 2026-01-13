import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('clerk-db-jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const userAPI = {
  createProfile: (userData) => api.post('/user/profile', userData),
  getProfile: (clerkId) => api.get(`/user/profile/${clerkId}`),
};

export const dailyAPI = {
  uploadPhoto: (formData) => api.post('/daily/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  completeRoutine: (date) => api.post('/daily/complete-routine', { date }),
  getStatus: () => api.get('/daily/status'),
  getHistory: () => api.get('/daily/history'),
};

export const aiAPI = {
  getProgressAnalysis: (data) => api.post('/ai/progress-analysis', data),
  getProductEvaluation: (data) => api.post('/ai/product-evaluation', data),
  getUserData: () => api.get('/ai/user-data'),
};

export default api;
