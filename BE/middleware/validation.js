// Request validation schemas
import Joi from 'joi';

// User profile validation
const userProfileSchema = Joi.object({
  clerkId: Joi.string().required(),
  skinGoal: Joi.string().valid('acne', 'glow', 'healthy-skin').optional(),
  skinType: Joi.string().valid('oily', 'dry', 'combination', 'sensitive').optional()
});

// Daily log validation
const dailyLogSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  acneLevel: Joi.number().min(0).max(10).optional(),
  rednessLevel: Joi.number().min(0).max(10).optional(),
  notes: Joi.string().max(500).optional()
});

// Routine completion validation
const routineCompletionSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
});

// Routine steps validation (partial completion)
const routineStepsSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  steps: Joi.object({
    cleanser: Joi.boolean().required(),
    treatment: Joi.boolean().required(),
    moisturizer: Joi.boolean().required(),
    sunscreen: Joi.boolean().optional()
  }).required()
});

// AI analysis storage validation
const progressAnalysisSchema = Joi.object({
  analysis: Joi.object().required()
});

const productEvaluationSchema = Joi.object({
  evaluation: Joi.object().required(),
  productName: Joi.string().required()
});

export {
  userProfileSchema,
  dailyLogSchema,
  routineCompletionSchema,
  routineStepsSchema,
  progressAnalysisSchema,
  productEvaluationSchema
};
