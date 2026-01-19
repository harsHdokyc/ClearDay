import User from '../models/User.js';
import Analytics from '../models/Analytics.js';
import logger from '../utils/logger.js';

class UserController {
  // Create or update user profile
  async createOrUpdateProfile(req, res) {
    try {
      const { clerkId, skinGoal, skinType } = req.body;
      
      // Validate required fields
      if (!clerkId) {
        logger.warn('[CREATE_OR_UPDATE_PROFILE] Missing clerkId', {});
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'clerkId is required'
        });
      }
      
      let user = await User.findOne({ clerkId });
      
      if (user) {
        // Update existing user
        logger.debug('[CREATE_OR_UPDATE_PROFILE] Updating existing user', { clerkId });
        user.profile = { skinGoal, skinType };
        await user.save();
        
        // Ensure analytics exists for existing user (in case it was deleted or never created)
        // Use findOneAndUpdate with upsert to handle race conditions atomically
        const existingAnalytics = await Analytics.findOne({ userId: clerkId });
        if (!existingAnalytics) {
          const baselineDate = new Date().toISOString().split('T')[0];
          try {
            await Analytics.findOneAndUpdate(
              { userId: clerkId },
              { userId: clerkId, baselineDate },
              { upsert: true, new: true }
            );
            logger.info('[CREATE_OR_UPDATE_PROFILE] Analytics created for existing user', { clerkId, baselineDate });
          } catch (analyticsError) {
            // If analytics creation fails due to duplicate key (race condition), ignore it
            if (analyticsError.code === 11000) {
              logger.warn('[CREATE_OR_UPDATE_PROFILE] Analytics already exists (race condition)', { clerkId });
            } else {
              throw analyticsError;
            }
          }
        }
        
        logger.info('[CREATE_OR_UPDATE_PROFILE] Profile updated successfully', { clerkId, skinGoal, skinType });
      } else {
        // Create new user
        logger.debug('[CREATE_OR_UPDATE_PROFILE] Creating new user', { clerkId });
        user = new User({
          clerkId,
          profile: { skinGoal, skinType }
        });
        await user.save();
        
        // Create analytics for new user (use findOneAndUpdate with upsert to handle race conditions)
        const baselineDate = new Date().toISOString().split('T')[0];
        try {
          await Analytics.findOneAndUpdate(
            { userId: clerkId },
            { userId: clerkId, baselineDate },
            { upsert: true, new: true }
          );
          logger.info('[CREATE_OR_UPDATE_PROFILE] New user and analytics created', { 
            clerkId, 
            skinGoal, 
            skinType,
            baselineDate 
          });
        } catch (analyticsError) {
          // If analytics creation fails due to duplicate key (race condition), log and continue
          if (analyticsError.code === 11000) {
            logger.warn('[CREATE_OR_UPDATE_PROFILE] Analytics already exists (race condition)', { clerkId });
          } else {
            throw analyticsError;
          }
        }
      }
      
      res.status(200).json({
        success: true,
        data: user,
        message: user ? 'Profile updated successfully' : 'Profile created successfully'
      });
    } catch (error) {
      logger.error('[CREATE_OR_UPDATE_PROFILE] Failed to create or update profile', error, { 
        clerkId: req.body.clerkId 
      });
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
        logger.warn('[GET_PROFILE] Missing clerkId parameter', {});
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'clerkId is required'
        });
      }
      
      const user = await User.findOne({ clerkId });
      
      if (!user) {
        logger.warn('[GET_PROFILE] User not found', { clerkId });
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      logger.info('[GET_PROFILE] Profile retrieved successfully', { 
        clerkId,
        hasProfile: !!user.profile,
        hasCustomSteps: !!user.customRoutineSteps?.length 
      });
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('[GET_PROFILE] Failed to fetch user profile', error, { 
        clerkId: req.params.clerkId 
      });
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch user profile'
      });
    }
  }

  // Update custom routine steps and order
  async updateCustomRoutineSteps(req, res) {
    const auth = req.auth();
    const clerkId = auth.userId;
    
    try {
      const { customRoutineSteps, routineOrder } = req.body;
      
      if (!clerkId) {
        logger.warn('[UPDATE_CUSTOM_ROUTINE_STEPS] Unauthorized - missing userId', {});
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      if (customRoutineSteps && !Array.isArray(customRoutineSteps)) {
        logger.warn('[UPDATE_CUSTOM_ROUTINE_STEPS] Invalid customRoutineSteps format', { clerkId });
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'customRoutineSteps must be an array'
        });
      }
      
      if (routineOrder && !Array.isArray(routineOrder)) {
        logger.warn('[UPDATE_CUSTOM_ROUTINE_STEPS] Invalid routineOrder format', { clerkId });
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'routineOrder must be an array'
        });
      }
      
      // Use findOneAndUpdate to avoid VersionError (atomic operation)
      const updateData = {};
      if (customRoutineSteps !== undefined) {
        updateData.customRoutineSteps = customRoutineSteps;
      }
      if (routineOrder !== undefined) {
        updateData.routineOrder = routineOrder;
      }
      
      const user = await User.findOneAndUpdate(
        { clerkId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        logger.warn('[UPDATE_CUSTOM_ROUTINE_STEPS] User not found', { clerkId });
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      logger.info('[UPDATE_CUSTOM_ROUTINE_STEPS] Routine steps updated successfully', { 
        clerkId,
        customStepsCount: user.customRoutineSteps?.length || 0,
        routineOrderCount: user.routineOrder?.length || 0 
      });
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'Routine steps updated successfully'
      });
    } catch (error) {
      logger.error('[UPDATE_CUSTOM_ROUTINE_STEPS] Failed to update routine steps', error, { clerkId });
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
        logger.warn('[DELETE_PROFILE] Missing clerkId parameter', {});
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'clerkId is required'
        });
      }
      
      const user = await User.findOneAndDelete({ clerkId });
      
      if (!user) {
        logger.warn('[DELETE_PROFILE] User not found', { clerkId });
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      // Also delete user's analytics
      const analyticsResult = await Analytics.findOneAndDelete({ userId: clerkId });
      
      logger.info('[DELETE_PROFILE] User profile and analytics deleted successfully', { 
        clerkId,
        analyticsDeleted: !!analyticsResult 
      });
      
      res.status(200).json({
        success: true,
        message: 'User profile deleted successfully'
      });
    } catch (error) {
      logger.error('[DELETE_PROFILE] Failed to delete user profile', error, { 
        clerkId: req.params.clerkId 
      });
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to delete user profile'
      });
    }
  }
}

export default new UserController();
