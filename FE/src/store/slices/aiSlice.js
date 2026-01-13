import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  progressAnalysis: null,
  productEvaluation: null,
  loading: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setProgressAnalysis: (state, action) => {
      state.progressAnalysis = action.payload;
      state.loading = false;
      state.error = null;
    },
    setProductEvaluation: (state, action) => {
      state.productEvaluation = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setProgressAnalysis, 
  setProductEvaluation, 
  clearError 
} = aiSlice.actions;

export default aiSlice.reducer;
