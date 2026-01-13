import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, setProfile, updateProfile, clearError } = userSlice.actions;
export default userSlice.reducer;
