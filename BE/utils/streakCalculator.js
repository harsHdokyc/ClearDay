import DailyLog from '../models/DailyLog.js';

/**
 * Calculate consecutive streak from DailyLog entries
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Current streak count
 */
export async function calculateStreak(userId) {
  try {
    const logs = await DailyLog.find({ 
      userId,
      routineCompleted: true 
    }).sort({ date: -1 }).limit(100);
    
    if (logs.length === 0) return 0;
    
    // Get the most recent log date (accounting for timezone differences)
    const mostRecentLog = logs[0];
    const mostRecentDate = new Date(mostRecentLog.date);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Calculate today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate days difference between most recent log and today
    const daysDiffFromToday = Math.floor((today - mostRecentDate) / (1000 * 60 * 60 * 24));
    
    // Only count streak if the most recent log is within ±1 day (to account for timezone differences)
    if (daysDiffFromToday < -1 || daysDiffFromToday > 1) {
      return 0;
    }
    
    let streak = 0;
    let expectedDate = new Date(mostRecentLog.date);
    expectedDate.setHours(0, 0, 0, 0);
    
    // Count consecutive days backwards from the most recent log
    for (const log of logs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((expectedDate - logDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (daysDiff > 0) {
        // Gap found, streak broken
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

/**
 * Calculate skipped days (consecutive days without completion)
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of skipped days
 */
export async function calculateSkippedDays(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Get the most recent completed log
    const lastCompleted = await DailyLog.findOne({ 
      userId,
      routineCompleted: true 
    }).sort({ date: -1 });
    
    if (!lastCompleted) {
      // No completion history, check if user has any logs
      const anyLog = await DailyLog.findOne({ userId }).sort({ date: -1 });
      if (!anyLog) return 0; // New user, no skipped days
      
      // User has logs but none completed - count days since first log
      const firstLogDate = new Date(anyLog.date);
      const daysSince = Math.floor((today - firstLogDate) / (1000 * 60 * 60 * 24));
      return Math.max(0, daysSince);
    }
    
    const lastDate = new Date(lastCompleted.date);
    lastDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    
    // If today is completed, no skipped days
    if (lastCompleted.date === todayStr && lastCompleted.routineCompleted) {
      return 0;
    }
    
    // Count days since last completion (excluding today if not completed)
    return Math.max(0, daysDiff - (lastCompleted.date === todayStr ? 0 : 1));
  } catch (error) {
    console.error('Error calculating skipped days:', error);
    return 0;
  }
}
