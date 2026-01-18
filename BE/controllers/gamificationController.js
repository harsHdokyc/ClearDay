import Milestone from '../models/Milestone.js';
import Analytics from '../models/Analytics.js';
import { calculateStreak } from '../utils/streakCalculator.js';

class GamificationController {
  // Check and update milestones based on streak
  async updateMilestones(req, res) {
    try {
      const auth = req.auth();
      if (!auth || !auth.userId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }
      
      const userId = auth.userId;
      
      // Get current analytics
      const analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User analytics not found'
        });
      }
      
      // Calculate actual streak from DailyLog entries
      const currentStreak = await calculateStreak(userId);
      
      // Get or create milestone record
      let milestone = await Milestone.findOne({ userId });
      if (!milestone) {
        milestone = new Milestone({ userId });
      }
      
      const previousStreak = milestone.currentStreak;
      milestone.currentStreak = currentStreak;
      
      // Update longest streak
      if (currentStreak > milestone.longestStreak) {
        milestone.longestStreak = currentStreak;
      }
      
      // Check milestone unlocks
      const newlyUnlocked = [];
      
      // 3 days - Proof Builder
      if (currentStreak >= 3 && !milestone.milestones.proofBuilder.unlocked) {
        milestone.milestones.proofBuilder.unlocked = true;
        milestone.milestones.proofBuilder.unlockedAt = new Date();
        newlyUnlocked.push({
          name: 'Proof Builder',
          days: 3,
          message: 'You\'ve built proof of commitment! Your consistency is showing.'
        });
      }
      
      // 7 days - Consistency Mode
      if (currentStreak >= 7 && !milestone.milestones.consistencyMode.unlocked) {
        milestone.milestones.consistencyMode.unlocked = true;
        milestone.milestones.consistencyMode.unlockedAt = new Date();
        newlyUnlocked.push({
          name: 'Consistency Mode',
          days: 7,
          message: 'One week of dedication! You\'re in consistency mode.'
        });
      }
      
      // 14 days - Identity Lock
      if (currentStreak >= 14 && !milestone.milestones.identityLock.unlocked) {
        milestone.milestones.identityLock.unlocked = true;
        milestone.milestones.identityLock.unlockedAt = new Date();
        newlyUnlocked.push({
          name: 'Identity Lock',
          days: 14,
          message: 'Two weeks! Skincare is now part of your identity.'
        });
      }
      
      // 30 days - Ritual Master
      if (currentStreak >= 30 && !milestone.milestones.ritualMaster.unlocked) {
        milestone.milestones.ritualMaster.unlocked = true;
        milestone.milestones.ritualMaster.unlockedAt = new Date();
        newlyUnlocked.push({
          name: 'Ritual Master',
          days: 30,
          message: 'One month complete! You\'re a true ritual master.'
        });
      }
      
      await milestone.save();
      
      res.status(200).json({
        success: true,
        data: {
          milestone,
          newlyUnlocked,
          streakIncreased: currentStreak > previousStreak
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to update milestones'
      });
    }
  }

  // Get user's gamification status
  async getGamificationStatus(req, res) {
    try {
      const auth = req.auth();
      if (!auth || !auth.userId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }
      
      const userId = auth.userId;
      
      const milestone = await Milestone.findOne({ userId });
      
      if (!milestone) {
        // Create initial milestone record
        const newMilestone = new Milestone({ userId });
        await newMilestone.save();
        
        return res.status(200).json({
          success: true,
          data: {
            milestone: newMilestone,
            currentStreak: 0,
            nextMilestone: {
              name: 'Proof Builder',
              days: 3,
              progress: 0
            }
          }
        });
      }
      
      const analytics = await Analytics.findOne({ userId });
      
      // Calculate actual streak from DailyLog entries
      const currentStreak = await calculateStreak(userId);
      
      // Determine next milestone
      let nextMilestone = null;
      if (!milestone.milestones.proofBuilder.unlocked) {
        nextMilestone = {
          name: 'Proof Builder',
          days: 3,
          progress: Math.min((currentStreak / 3) * 100, 100)
        };
      } else if (!milestone.milestones.consistencyMode.unlocked) {
        nextMilestone = {
          name: 'Consistency Mode',
          days: 7,
          progress: Math.min((currentStreak / 7) * 100, 100)
        };
      } else if (!milestone.milestones.identityLock.unlocked) {
        nextMilestone = {
          name: 'Identity Lock',
          days: 14,
          progress: Math.min((currentStreak / 14) * 100, 100)
        };
      } else if (!milestone.milestones.ritualMaster.unlocked) {
        nextMilestone = {
          name: 'Ritual Master',
          days: 30,
          progress: Math.min((currentStreak / 30) * 100, 100)
        };
      }
      
      res.status(200).json({
        success: true,
        data: {
          milestone,
          currentStreak,
          nextMilestone,
          totalGesturesCompleted: milestone.totalGesturesCompleted
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch gamification status'
      });
    }
  }

  // Complete a real-world gesture
  async completeGesture(req, res) {
    try {
      const { gestureType, milestoneTriggered } = req.body;
      const auth = req.auth();
      if (!auth || !auth.userId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'User authentication required'
        });
      }
      
      const userId = auth.userId;
      
      if (!gestureType || !milestoneTriggered) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Gesture type and milestone triggered are required'
        });
      }
      
      const milestone = await Milestone.findOne({ userId });
      if (!milestone) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Milestone record not found'
        });
      }
      
      // Check if this gesture was already completed
      const existingGesture = milestone.realWorldGestures.find(
        g => g.type === gestureType && g.milestoneTriggered === milestoneTriggered
      );
      
      if (existingGesture && existingGesture.completed) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'This gesture has already been completed'
        });
      }
      
      // Add or update gesture
      if (existingGesture) {
        existingGesture.completed = true;
        existingGesture.completedAt = new Date();
      } else {
        milestone.realWorldGestures.push({
          type: gestureType,
          completed: true,
          completedAt: new Date(),
          milestoneTriggered
        });
      }
      
      milestone.totalGesturesCompleted += 1;
      await milestone.save();
      
      // Generate impact URL (in real implementation, this would integrate with actual APIs)
      const impactUrl = this.generateImpactUrl(gestureType);
      
      res.status(200).json({
        success: true,
        data: {
          gesture: {
            type: gestureType,
            milestoneTriggered,
            completed: true,
            impactUrl
          },
          totalGesturesCompleted: milestone.totalGesturesCompleted,
          message: this.getGestureMessage(gestureType)
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to complete gesture'
      });
    }
  }

  // Helper method to generate impact URLs
  generateImpactUrl(gestureType) {
    const urls = {
      donate_meal: 'https://www.foodbanking.org/donate/',
      plant_tree: 'https://www.onetreeplanted.org/',
      blanket_donation: 'https://www.salvationarmyusa.org/usn/donate/'
    };
    return urls[gestureType] || '#';
  }

  // Helper method to get gesture completion messages
  getGestureMessage(gestureType) {
    const messages = {
      donate_meal: 'Thank you! Your gesture will help provide a meal to someone in need.',
      plant_tree: 'Amazing! A tree will be planted thanks to your consistency.',
      blanket_donation: 'Wonderful! Your gesture will provide warmth to someone in need.'
    };
    return messages[gestureType] || 'Thank you for making a positive impact!';
  }
}

export default new GamificationController();
