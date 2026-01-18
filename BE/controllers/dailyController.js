import DailyLog from '../models/DailyLog.js';
import Analytics from '../models/Analytics.js';
import multer from 'multer';
import { calculateStreak, calculateSkippedDays } from '../utils/streakCalculator.js';

class DailyController {
  constructor() {
    // Configure multer for file uploads
    this.storage = multer.memoryStorage();
    this.upload = multer({ 
      storage: this.storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'));
        }
      }
    });
  }

  // Upload daily photo
  async uploadPhoto(req, res) {
    try {
      const { date } = req.body;
      const auth = req.auth();
      const userId = auth.userId;
      
      if (!date) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Date is required'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'No photo uploaded'
        });
      }
      
      const photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      
      // Check if daily log already exists for this date
      const existingLog = await DailyLog.findOne({ userId, date });
      if (existingLog && existingLog.photoUrl) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'You have already uploaded a photo for this date',
          code: 'PHOTO_ALREADY_EXISTS'
        });
      }
      
      // Update existing log or create new one
      const dailyLog = existingLog 
        ? await DailyLog.findOneAndUpdate(
            { userId, date },
            { photoUrl },
            { new: true }
          )
        : await DailyLog.create({
            userId,
            date,
            photoUrl
          });
      
      // Ensure analytics exists (don't increment here - that's done on routine completion)
      let analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        analytics = await Analytics.create({
          userId,
          baselineDate: date
        });
      }
      
      res.status(201).json({
        success: true,
        data: dailyLog,
        message: 'Photo uploaded successfully'
      });
    } catch (error) {
      // Handle duplicate key error specifically
      if (error.code === 11000 && error.keyPattern && error.keyPattern.userId && error.keyPattern.date) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'You have already uploaded a photo for this date',
          code: 'PHOTO_ALREADY_EXISTS'
        });
      }
      
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to upload photo',
        details: error.message
      });
    }
  }

  // Complete routine steps (partial completion support)
  async completeRoutineSteps(req, res) {
    try {
      const { date, steps, totalStepsCount, completedStepsCount } = req.body;
      const auth = req.auth();
      const userId = auth.userId;
      
      if (!date || !steps || totalStepsCount === undefined || completedStepsCount === undefined) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Date, steps, totalStepsCount, and completedStepsCount are required'
        });
      }
      
      // Check if this date was already marked as completed
      const existingLog = await DailyLog.findOne({ userId, date });
      const wasAlreadyCompleted = existingLog?.routineCompleted || false;
      
      const routineCompleted = completedStepsCount >= Math.ceil(totalStepsCount * 0.75);
      
      const dailyLog = await DailyLog.findOneAndUpdate(
        { userId, date },
        { 
          routineCompleted,
          routineSteps: steps,
          totalSteps: totalStepsCount,
          completedSteps: completedStepsCount,
          // Ensure photoUrl exists if log was created without photo
          ...(existingLog?.photoUrl ? {} : { photoUrl: existingLog?.photoUrl || '' })
        },
        { new: true, upsert: true }
      );
      
      // Update analytics only if routine is completed AND wasn't already completed
      if (routineCompleted && !wasAlreadyCompleted) {
        let analytics = await Analytics.findOne({ userId });
        if (!analytics) {
          analytics = await Analytics.create({
            userId,
            baselineDate: date
          });
        }
        // Don't increment here - totalDaysTracked is calculated from actual completed logs
        await analytics.save();
      }
      
      res.status(200).json({
        success: true,
        data: dailyLog,
        message: `Completed ${completedStepsCount} of ${totalStepsCount} steps`
      });
    } catch (error) {
      console.error('Error in completeRoutineSteps:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to complete routine steps'
      });
    }
  }

  // Legacy complete routine (for backward compatibility)
  async completeRoutine(req, res) {
    try {
      const { date } = req.body;
      const auth = req.auth();
      const userId = auth.userId;
      
      if (!date) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Date is required'
        });
      }
      
      const dailyLog = await DailyLog.findOneAndUpdate(
        { userId, date },
        { 
          routineCompleted: true,
          routineSteps: {
            cleanser: true,
            treatment: true,
            moisturizer: true,
            sunscreen: false,
            totalSteps: 3,
            completedSteps: 3
          },
          completedSteps: 3
        },
        { new: true, upsert: true }
      );
      
      res.status(200).json({
        success: true,
        data: dailyLog,
        message: 'Routine marked as completed'
      });
    } catch (error) {
      console.error('Error in completeRoutine:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to complete routine'
      });
    }
  }


  // Get daily status and analytics
  async getDailyStatus(req, res) {
    try {
      const auth = req.auth();
      const userId = auth.userId;
      const today = new Date().toISOString().split('T')[0];
      
      // Ensure analytics exists
      let analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        analytics = new Analytics({
          userId,
          baselineDate: today
        });
        await analytics.save();
      }
      
      const todayLog = await DailyLog.findOne({ userId, date: today });
      
      // Calculate actual streak and skipped days
      const streak = await calculateStreak(userId);
      const skippedDays = await calculateSkippedDays(userId);
      
      // Update analytics with calculated values
      analytics.skippedDays = skippedDays;
      // Update totalDaysTracked based on actual completed logs
      const completedLogs = await DailyLog.countDocuments({ 
        userId, 
        routineCompleted: true 
      });
      analytics.totalDaysTracked = completedLogs;
      
      let datasetWarning = null;
      
      // Check if we need to reset analytics (4+ days skipped)
      if (skippedDays >= 4 && !analytics.isReset) {
        // Reset analytics but preserve photos
        analytics.isReset = true;
        analytics.progressMetrics = []; // Clear AI metrics but keep photos
        analytics.baselineDate = today; // New baseline
        analytics.skippedDays = 0; // Reset skipped days counter
        analytics.totalDaysTracked = 0; // Reset tracking
        await analytics.save();
        
        datasetWarning = 'Analytics reset. Your photos are preserved, but insights start fresh.';
      } else if (skippedDays === 1) {
        datasetWarning = 'Gentle reminder: You missed yesterday. Try to stay consistent!';
      } else if (skippedDays === 2) {
        datasetWarning = 'Warning: You missed 2 days. Your progress insights may be less accurate.';
      } else if (skippedDays === 3) {
        datasetWarning = 'Final warning: One more missed day will reset your analytics.';
      }
      
      await analytics.save();
      
      res.status(200).json({
        success: true,
        data: {
          streak,
          skippedDays,
          datasetWarning,
          hasCompletedToday: !!todayLog?.routineCompleted,
          hasUploadedToday: !!todayLog?.photoUrl,
          todayLog: todayLog // Include the full todayLog data
        }
      });
    } catch (error) {
      console.error('Error in getDailyStatus:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch daily status'
      });
    }
  }

  // Get daily history (last 30 days)
  async getDailyHistory(req, res) {
    try {
      const auth = req.auth();
      const userId = auth.userId;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const logs = await DailyLog.find({ 
        userId,
        createdAt: { $gte: thirtyDaysAgo }
      }).sort({ date: -1 });
      
      const analytics = await Analytics.findOne({ userId });
      
      res.status(200).json({
        success: true,
        data: {
          logs,
          analytics
        }
      });
    } catch (error) {
      console.error('Error in getDailyHistory:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch daily history'
      });
    }
  }

  // Update daily log with additional data
  async updateDailyLog(req, res) {
    try {
      const { date, acneLevel, rednessLevel, notes } = req.body;
      const auth = req.auth();
      const userId = auth.userId;
      
      if (!date) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Date is required'
        });
      }
      
      const dailyLog = await DailyLog.findOneAndUpdate(
        { userId, date },
        { 
          ...(acneLevel !== undefined && { acneLevel }),
          ...(rednessLevel !== undefined && { rednessLevel }),
          ...(notes !== undefined && { notes })
        },
        { new: true, upsert: true }
      );
      
      res.status(200).json({
        success: true,
        data: dailyLog,
        message: 'Daily log updated successfully'
      });
    } catch (error) {
      console.error('Error in updateDailyLog:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to update daily log'
      });
    }
  }
}

export default new DailyController();
