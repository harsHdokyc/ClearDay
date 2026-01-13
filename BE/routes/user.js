import express from 'express';
import User from '../models/User.js';
import Analytics from '../models/Analytics.js';

const router = express.Router();

router.post('/profile', async (req, res) => {
  try {
    const { clerkId, skinGoal, skinType } = req.body;
    
    let user = await User.findOne({ clerkId });
    
    if (user) {
      user.profile = { skinGoal, skinType };
      await user.save();
    } else {
      user = new User({
        clerkId,
        profile: { skinGoal, skinType }
      });
      await user.save();
      
      const analytics = new Analytics({
        userId: clerkId,
        baselineDate: new Date().toISOString().split('T')[0]
      });
      await analytics.save();
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile/:clerkId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
