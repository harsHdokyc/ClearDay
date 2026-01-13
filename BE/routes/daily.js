import express from 'express';
import multer from 'multer';
import DailyLog from '../models/DailyLog.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  try {
    const { date } = req.body;
    const auth = req.auth();
    const userId = auth.userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }
    
    const photoUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    const dailyLog = new DailyLog({
      userId,
      date,
      photoUrl
    });
    
    await dailyLog.save();
    
    let analytics = await Analytics.findOne({ userId });
    if (analytics) {
      analytics.totalDaysTracked += 1;
      await analytics.save();
    }
    
    res.json({ success: true, dailyLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/complete-routine', async (req, res) => {
  try {
    const { date } = req.body;
    const auth = req.auth();
    const userId = auth.userId;
    
    const dailyLog = await DailyLog.findOneAndUpdate(
      { userId, date },
      { routineCompleted: true },
      { new: true, upsert: true }
    );
    
    res.json({ success: true, dailyLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const auth = req.auth();
    const userId = auth.userId;
    const today = new Date().toISOString().split('T')[0];
    
    const analytics = await Analytics.findOne({ userId });
    const todayLog = await DailyLog.findOne({ userId, date: today });
    
    let streak = 0;
    let skippedDays = 0;
    let datasetWarning = null;
    
    if (analytics) {
      streak = analytics.totalDaysTracked - analytics.skippedDays;
      skippedDays = analytics.skippedDays;
      
      if (skippedDays === 1) {
        datasetWarning = 'Gentle reminder: You missed yesterday. Try to stay consistent!';
      } else if (skippedDays === 2) {
        datasetWarning = 'Warning: You missed 2 days. Your progress insights may be less accurate.';
      } else if (skippedDays === 3) {
        datasetWarning = 'Final warning: One more missed day will reset your analytics.';
      } else if (skippedDays >= 4) {
        datasetWarning = 'Analytics reset. Your photos are preserved, but insights start fresh.';
      }
    }
    
    res.json({
      streak,
      skippedDays,
      datasetWarning,
      hasCompletedToday: !!todayLog?.routineCompleted,
      hasUploadedToday: !!todayLog?.photoUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', async (req, res) => {
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
    
    res.json({ logs, analytics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
