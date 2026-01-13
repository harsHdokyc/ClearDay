import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import dailyRoutes from './routes/daily.js';
import aiRoutes from './routes/ai.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Clerk middleware configuration
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clearday')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/user', userRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ClearDay API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
