import express from 'express';
import dailyController from '../controllers/dailyController.js';
import { validateRequest, asyncHandler } from '../middleware/errorHandler.js';
import { dailyLogSchema, routineCompletionSchema, routineStepsSchema } from '../middleware/validation.js';

const router = express.Router();

// Upload daily photo
router.post('/upload-photo', 
  dailyController.upload.single('photo'),
  asyncHandler(dailyController.uploadPhoto.bind(dailyController))
);

// Mark daily routine as completed
router.post('/complete-routine', 
  validateRequest(routineCompletionSchema),
  asyncHandler(dailyController.completeRoutine.bind(dailyController))
);

// Complete routine steps (partial completion)
router.post('/complete-steps', 
  validateRequest(routineStepsSchema),
  asyncHandler(dailyController.completeRoutineSteps.bind(dailyController))
);

// Get daily status and analytics
router.get('/status', 
  asyncHandler(dailyController.getDailyStatus.bind(dailyController))
);

// Get daily history (last 30 days)
router.get('/history', 
  asyncHandler(dailyController.getDailyHistory.bind(dailyController))
);

// Update daily log with additional data
router.put('/log', 
  validateRequest(dailyLogSchema),
  asyncHandler(dailyController.updateDailyLog.bind(dailyController))
);

export default router;
