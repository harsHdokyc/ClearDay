import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  streak: 0,
  skippedDays: 0,
  datasetWarning: null,
  hasCompletedToday: false,
  hasUploadedToday: false,
  todayLog: null,
  history: [],
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
      state.loading = false;
      state.error = null;
    },
    setTodayLog: (state, action) => {
      state.todayLog = action.payload;
      if (action.payload?.routineCompleted) {
        state.hasCompletedToday = true;
      }
      if (action.payload?.photoUrl) {
        state.hasUploadedToday = true;
      }
    },
    setHistory: (state, action) => {
      state.history = action.payload;
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
