import express from 'express';
import userController from '../controllers/userController.js';
import { validateRequest, asyncHandler } from '../middleware/errorHandler.js';
import { userProfileSchema } from '../middleware/validation.js';

const router = express.Router();

// Create or update user profile
router.post('/profile', 
  validateRequest(userProfileSchema),
  asyncHandler(userController.createOrUpdateProfile.bind(userController))
);

// Get user profile
router.get('/profile/:clerkId', 
  asyncHandler(userController.getProfile.bind(userController))
);

// Update custom routine steps
router.put('/profile/routine-steps', 
  asyncHandler(userController.updateCustomRoutineSteps.bind(userController))
);

// Delete user profile
router.delete('/profile/:clerkId', 
  asyncHandler(userController.deleteProfile.bind(userController))
);

export default router;
