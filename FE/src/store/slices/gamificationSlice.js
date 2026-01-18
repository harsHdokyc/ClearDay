import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStreak: 0,
  longestStreak: 0,
  milestones: {
    proofBuilder: { unlocked: false, unlockedAt: null },
    consistencyMode: { unlocked: false, unlockedAt: null },
    identityLock: { unlocked: false, unlockedAt: null },
    ritualMaster: { unlocked: false, unlockedAt: null }
  },
  realWorldGestures: [],
  totalGesturesCompleted: 0,
  nextMilestone: null,
  newlyUnlocked: [],
  loading: false,
  error: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setGamificationStatus: (state, action) => {
      const { milestone, currentStreak, nextMilestone, totalGesturesCompleted } = action.payload;
      state.currentStreak = currentStreak;
      state.longestStreak = milestone?.longestStreak || 0; // Handle undefined milestone
      state.milestones = milestone?.milestones || {}; // Handle undefined milestone
      state.realWorldGestures = milestone?.realWorldGestures || []; // Handle undefined milestone
      state.totalGesturesCompleted = totalGesturesCompleted;
      state.nextMilestone = nextMilestone;
      state.loading = false;
      state.error = null;
    },
    updateMilestones: (state, action) => {
      const { milestone, newlyUnlocked, streakIncreased } = action.payload;
      state.currentStreak = milestone?.currentStreak || 0; // Handle undefined milestone
      state.longestStreak = milestone?.longestStreak || 0; // Handle undefined milestone
      state.milestones = milestone?.milestones || {}; // Handle undefined milestone
      state.newlyUnlocked = newlyUnlocked;
      state.loading = false;
      state.error = null;
    },
    completeGesture: (state, action) => {
      const { gesture, totalGesturesCompleted, message } = action.payload;
      state.realWorldGestures.push(gesture);
      state.totalGesturesCompleted = totalGesturesCompleted;
      state.loading = false;
      state.error = null;
    },
    clearNewlyUnlocked: (state) => {
      state.newlyUnlocked = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setLoading, 
  setError, 
  setGamificationStatus, 
  updateMilestones, 
  completeGesture,
  clearNewlyUnlocked,
  clearError 
} = gamificationSlice.actions;

export default gamificationSlice.reducer;
