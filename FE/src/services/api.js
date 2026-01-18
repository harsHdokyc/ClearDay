import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Clerk auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    // Get the current user's session token from Clerk
    if (window.Clerk && window.Clerk.session) {
      const token = await window.Clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
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
  updateCustomRoutineSteps: (customRoutineSteps, routineOrder) => api.put('/user/profile/routine-steps', { customRoutineSteps, routineOrder }),
};

export const dailyAPI = {
  uploadPhoto: (formData) => api.post('/daily/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  completeRoutine: (date) => api.post('/daily/complete-routine', { date }),
  completeRoutineSteps: (date, steps) => api.post('/daily/complete-steps', { date, steps }),
  getStatus: () => api.get('/daily/status'),
  getHistory: () => api.get('/daily/history'),
};

export const gamificationAPI = {
  updateMilestones: () => api.post('/gamification/milestones'),
  getStatus: () => api.get('/gamification/status'),
  completeGesture: (gestureType, milestoneTriggered) => api.post('/gamification/complete-gesture', {
    gestureType,
    milestoneTriggered
  }),
};

export const aiAPI = {
  getProgressAnalysis: (data) => api.post('/ai/progress-analysis', data),
  getProductEvaluation: (data) => api.post('/ai/product-evaluation', data),
  getUserData: () => api.get('/ai/user-data'),
};

export default api;
