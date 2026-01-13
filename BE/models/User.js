import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  profile: {
    skinGoal: {
      type: String,
      enum: ['acne', 'glow', 'healthy-skin'],
      required: true
    },
    skinType: {
      type: String,
      enum: ['oily', 'dry', 'combination', 'sensitive'],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
