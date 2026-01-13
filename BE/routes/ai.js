import express from 'express';
import Analytics from '../models/Analytics.js';
import DailyLog from '../models/DailyLog.js';
import User from '../models/User.js';

const router = express.Router();

// Updated routes - AI processing now happens in frontend using Puter.js
// These routes handle data storage and retrieval only

router.post('/progress-analysis', async (req, res) => {
  try {
    const { analysis } = req.body; // Analysis now comes from frontend
    const auth = req.auth();
    const userId = auth.userId;
    
    if (!analysis) {
      return res.status(400).json({ error: 'Analysis data required' });
    }
    
    const analytics = await Analytics.findOne({ userId });
    if (analytics) {
      analytics.progressMetrics.push({
        date: new Date().toISOString().split('T')[0],
        ...analysis
      });
      await analytics.save();
    }
    
    res.json({ success: true, stored: true });
  } catch (error) {
    console.error('Progress Analysis Storage Error:', error);
    res.status(500).json({ 
      error: 'Failed to store analysis'
    });
  }
});

router.post('/product-evaluation', async (req, res) => {
  try {
    const { evaluation, productName } = req.body; // Evaluation now comes from frontend
    const auth = req.auth();
    const userId = auth.userId;
    
    if (!evaluation || !productName) {
      return res.status(400).json({ error: 'Evaluation data and product name required' });
    }
    
    const analytics = await Analytics.findOne({ userId });
    if (analytics) {
      analytics.productEvaluations.push({
        date: new Date().toISOString().split('T')[0],
        productName,
        ...evaluation
      });
      await analytics.save();
    }
    
    res.json({ success: true, stored: true });
  } catch (error) {
    console.error('Product Evaluation Storage Error:', error);
    res.status(500).json({ 
      error: 'Failed to store evaluation'
    });
  }
});

// Helper route to get user data for frontend AI processing
router.get('/user-data', async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;
    
    const user = await User.findOne({ clerkId: userId });
    const analytics = await Analytics.findOne({ userId });
    const recentLogs = await DailyLog.find({ userId })
      .sort({ date: -1 })
      .limit(7);
    
    res.json({
      userProfile: {
        skinGoal: user?.profile?.skinGoal,
        skinType: user?.profile?.skinType,
        totalDaysTracked: analytics?.totalDaysTracked || 0
      },
      recentLogs: recentLogs.map(log => ({
        date: log.date,
        acneLevel: log.acneLevel,
        rednessLevel: log.rednessLevel,
        notes: log.notes
      }))
    });
  } catch (error) {
    console.error('User Data Fetch Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user data'
    });
  }
});

export default router;
