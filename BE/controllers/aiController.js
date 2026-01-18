import Analytics from '../models/Analytics.js';
import DailyLog from '../models/DailyLog.js';
import User from '../models/User.js';

class AIController {
  // Store progress analysis from frontend AI processing
  async storeProgressAnalysis(req, res) {
    try {
      const { analysis } = req.body;
      const auth = req.auth();
      const userId = auth.userId;
      
      if (!analysis) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Analysis data is required'
        });
      }
      
      const analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User analytics not found'
        });
      }
      
      analytics.progressMetrics.push({
        date: new Date().toISOString().split('T')[0],
        ...analysis
      });
      await analytics.save();
      
      res.status(201).json({
        success: true,
        message: 'Progress analysis stored successfully'
      });
    } catch (error) {
      console.error('Error in storeProgressAnalysis:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to store progress analysis'
      });
    }
  }

  // Store product evaluation from frontend AI processing
  async storeProductEvaluation(req, res) {
    try {
      const { evaluation, productName } = req.body;
      const auth = req.auth();
      const userId = auth.userId;
      
      if (!evaluation || !productName) {
        return res.status(400).json({ 
          error: 'Bad Request',
          message: 'Evaluation data and product name are required'
        });
      }
      
      const analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User analytics not found'
        });
      }
      
      analytics.productEvaluations.push({
        date: new Date().toISOString().split('T')[0],
        productName,
        ...evaluation
      });
      await analytics.save();
      
      res.status(201).json({
        success: true,
        message: 'Product evaluation stored successfully'
      });
    } catch (error) {
      console.error('Error in storeProductEvaluation:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to store product evaluation'
      });
    }
  }

  // Get user data for frontend AI processing
  async getUserDataForAI(req, res) {
    try {
      const auth = req.auth();
      const userId = auth.userId;
      
      const user = await User.findOne({ clerkId: userId });
      const analytics = await Analytics.findOne({ userId });
      const recentLogs = await DailyLog.find({ userId })
        .sort({ date: -1 })
        .limit(7);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          userProfile: {
            skinGoal: user?.profile?.skinGoal,
            skinType: user?.profile?.skinType,
            totalDaysTracked: analytics?.totalDaysTracked || 0
          },
          recentLogs: recentLogs.map(log => ({
            date: log.date,
            acneLevel: log.acneLevel,
            rednessLevel: log.rednessLevel,
            notes: log.notes,
            hasPhoto: !!log.photoUrl
          }))
        }
      });
    } catch (error) {
      console.error('Error in getUserDataForAI:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch user data for AI processing'
      });
    }
  }

  // Get user's progress metrics
  async getProgressMetrics(req, res) {
    try {
      const auth = req.auth();
      const userId = auth.userId;
      
      const analytics = await Analytics.findOne({ userId });
      
      if (!analytics) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User analytics not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          progressMetrics: analytics.progressMetrics,
          totalDaysTracked: analytics.totalDaysTracked,
          skippedDays: analytics.skippedDays,
          baselineDate: analytics.baselineDate
        }
      });
    } catch (error) {
      console.error('Error in getProgressMetrics:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch progress metrics'
      });
    }
  }

  // Get user's product evaluations
  async getProductEvaluations(req, res) {
    try {
      const auth = req.auth();
      const userId = auth.userId;
      
      const analytics = await Analytics.findOne({ userId });
      
      if (!analytics) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User analytics not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: {
          productEvaluations: analytics.productEvaluations
        }
      });
    } catch (error) {
      console.error('Error in getProductEvaluations:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to fetch product evaluations'
      });
    }
  }

  // Delete progress metric
  async deleteProgressMetric(req, res) {
    try {
      const { metricId } = req.params;
      const auth = req.auth();
      const userId = auth.userId;
      
      const analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'User analytics not found'
        });
      }
      
      analytics.progressMetrics = analytics.progressMetrics.filter(
        metric => metric._id.toString() !== metricId
      );
      await analytics.save();
      
      res.status(200).json({
        success: true,
        message: 'Progress metric deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteProgressMetric:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to delete progress metric'
      });
    }
  }
}

export default new AIController();
