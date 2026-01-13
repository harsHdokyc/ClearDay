import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import userSlice from './slices/userSlice.js';
import dailySlice from './slices/dailySlice.js';
import aiSlice from './slices/aiSlice.js';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    daily: dailySlice,
    ai: aiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;
