import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  streak: 0,
  skippedDays: 0,
  datasetWarning: null,
  hasCompletedToday: false,
  hasUploadedToday: false,
  todayLog: null,
  history: [],
  analytics: null, // Store analytics data including baselineDate and isReset
  loading: false,
  error: null,
};

const dailySlice = createSlice({
  name: 'daily',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setStatus: (state, action) => {
      state.streak = action.payload.streak;
      state.skippedDays = action.payload.skippedDays;
      state.datasetWarning = action.payload.datasetWarning;
      state.hasCompletedToday = action.payload.hasCompletedToday;
      state.hasUploadedToday = action.payload.hasUploadedToday;
      state.todayLog = action.payload.todayLog; // Include todayLog data
      state.loading = false;
      state.error = null;
    },
    setTodayLog: (state, action) => {
      state.todayLog = action.payload;
      // Update completion status based on routineCompleted flag
      state.hasCompletedToday = !!action.payload?.routineCompleted;
      // Update upload status based on photoUrl
      state.hasUploadedToday = !!action.payload?.photoUrl;
    },
    setHistory: (state, action) => {
      state.history = action.payload.logs || action.payload;
      if (action.payload.analytics) {
        state.analytics = action.payload.analytics;
      }
      state.loading = false;
      state.error = null;
    },
    updateStreak: (state, action) => {
      state.streak = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setStatus, 
  setTodayLog, 
  setHistory, 
  updateStreak, 
  clearError 
} = dailySlice.actions;

export default dailySlice.reducer;
