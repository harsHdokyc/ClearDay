import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/
  },
  photoUrl: {
    type: String,
    required: true
  },
  routineCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyLog', dailyLogSchema);
