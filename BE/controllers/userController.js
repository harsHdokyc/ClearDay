import User from '../models/User.js';
import Analytics from '../models/Analytics.js';

class UserController {
  // Create or update user profile
  async createOrUpdateProfile(req, res) {
    try {
      const { clerkId, skinGoal, skinType } = req.body;
      
      // Validate required fields
      if (!clerkId) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'clerkId is required'
        });
      }
      
      let user = await User.findOne({ clerkId });
      
      if (user) {
        // Update existing user
        user.profile = { skinGoal, skinType };
        await user.save();
      } else {
        // Create new user
        user = new User({
          clerkId,
          profile: { skinGoal, skinType }
        });
        await user.save();
        
        // Create analytics for new user
        const analytics = new Analytics({
          userId: clerkId,
          baselineDate: new Date().toISOString().split('T')[0]
        });
        await analytics.save();
      }
      
      res.status(200).json({
        success: true,
        data: user,
        message: user ? 'Profile updated successfully' : 'Profile created successfully'
      });
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to create or update profile'
      });
    }
  }

  // Get user profile by clerkId
  async getProfile(req, res) {
    try {
      const { clerkId } = req.params;
      
      if (!clerkId) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'clerkId is required'
        });
      }
      
      const user = await User.findOne({ clerkId });
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error in getProfile:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch user profile'
      });
    }
  }

  // Update custom routine steps and order
  async updateCustomRoutineSteps(req, res) {
    try {
      const { customRoutineSteps, routineOrder } = req.body;
      const auth = req.auth();
      const clerkId = auth.userId;
      
      if (!clerkId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      if (customRoutineSteps && !Array.isArray(customRoutineSteps)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'customRoutineSteps must be an array'
        });
      }
      
      if (routineOrder && !Array.isArray(routineOrder)) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'routineOrder must be an array'
        });
      }
      
      const user = await User.findOne({ clerkId });
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      if (customRoutineSteps !== undefined) {
        user.customRoutineSteps = customRoutineSteps;
      }
      
      if (routineOrder !== undefined) {
        user.routineOrder = routineOrder;
      }
      
      await user.save();
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'Routine steps updated successfully'
      });
    } catch (error) {
      console.error('Error in updateCustomRoutineSteps:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to update routine steps'
      });
    }
  }

  // Delete user profile
  async deleteProfile(req, res) {
    try {
      const { clerkId } = req.params;
      
      if (!clerkId) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'clerkId is required'
        });
      }
      
      const user = await User.findOneAndDelete({ clerkId });
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      // Also delete user's analytics
      await Analytics.findOneAndDelete({ userId: clerkId });
      
      res.status(200).json({
        success: true,
        message: 'User profile deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteProfile:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to delete user profile'
      });
    }
  }
}

export default new UserController();
