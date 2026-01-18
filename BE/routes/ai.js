import express from 'express';
import aiController from '../controllers/aiController.js';
import { validateRequest, asyncHandler } from '../middleware/errorHandler.js';
import { progressAnalysisSchema, productEvaluationSchema } from '../middleware/validation.js';

const router = express.Router();

// Store progress analysis from frontend AI processing
router.post('/progress-analysis', 
  validateRequest(progressAnalysisSchema),
  asyncHandler(aiController.storeProgressAnalysis.bind(aiController))
);

// Store product evaluation from frontend AI processing
router.post('/product-evaluation', 
  validateRequest(productEvaluationSchema),
  asyncHandler(aiController.storeProductEvaluation.bind(aiController))
);

// Get user data for frontend AI processing
router.get('/user-data', 
  asyncHandler(aiController.getUserDataForAI.bind(aiController))
);

// Get user's progress metrics
router.get('/progress-metrics', 
  asyncHandler(aiController.getProgressMetrics.bind(aiController))
);

// Get user's product evaluations
router.get('/product-evaluations', 
  asyncHandler(aiController.getProductEvaluations.bind(aiController))
);

// Delete progress metric
router.delete('/progress-metrics/:metricId', 
  asyncHandler(aiController.deleteProgressMetric.bind(aiController))
);

export default router;
