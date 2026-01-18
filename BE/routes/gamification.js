import express from 'express';
import gamificationController from '../controllers/gamificationController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Update and check milestones
router.post('/milestones', 
  asyncHandler(gamificationController.updateMilestones.bind(gamificationController))
);

// Get gamification status
router.get('/status', 
  asyncHandler(gamificationController.getGamificationStatus.bind(gamificationController))
);

// Complete real-world gesture
router.post('/complete-gesture', 
  asyncHandler(gamificationController.completeGesture.bind(gamificationController))
);

export default router;
