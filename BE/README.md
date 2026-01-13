# ClearDay Backend

A Node.js + Express backend API for the ClearDay skincare habit tracking application.

## Features

- **Authentication**: Clerk JWT middleware for protected routes
- **File Upload**: Multer for photo uploads (5MB limit)
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Claude API for skincare insights
- **RESTful API**: Clean endpoints for frontend consumption

## Tech Stack

- Node.js with ES6 modules
- Express.js framework
- MongoDB + Mongoose
- Multer for file uploads
- Clerk backend SDK
- Claude AI API integration
- CORS for cross-origin requests

## API Endpoints

### User Routes
- `POST /api/user/profile` - Create/update user profile
- `GET /api/user/profile/:clerkId` - Get user profile

### Daily Routes (Protected)
- `POST /api/daily/upload-photo` - Upload daily photo
- `POST /api/daily/complete-routine` - Mark routine complete
- `GET /api/daily/status` - Get daily status (streak, warnings)
- `GET /api/daily/history` - Get last 30 days history

### AI Routes (Protected)
- `POST /api/ai/progress-analysis` - Get AI progress insights
- `POST /api/ai/product-evaluation` - Evaluate skincare products

## Database Models

### User
```javascript
{
  clerkId: String,
  profile: {
    skinGoal: String, // 'acne', 'glow', 'healthy-skin'
    skinType: String  // 'oily', 'dry', 'combination', 'sensitive'
  },
  createdAt: Date
}
```

### DailyLog
```javascript
{
  userId: String,
  date: String, // YYYY-MM-DD
  photoUrl: String,
  routineCompleted: Boolean,
  createdAt: Date
}
```

### Analytics
```javascript
{
  userId: String,
  baselineDate: String,
  totalDaysTracked: Number,
  skippedDays: Number,
  isReset: Boolean,
  progressMetrics: [{
    date: String,
    acneTrend: String,
    rednessTrend: String,
    insightMessage: String
  }],
  productEvaluations: [{
    date: String,
    productName: String,
    fitScore: Number,
    insightMessage: String
  }]
}
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Claude API key
- Clerk application setup

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your actual values:
```
MONGODB_URI=mongodb://localhost:27017/clearday
CLERK_PEM_PUBLIC_KEY=your_clerk_public_key_here
PORT=5000
CLAUDE_API_KEY=your_claude_api_key_here
```

### Running the Server

1. Start MongoDB server
2. Run the application:
```bash
npm run dev
```

For production:
```bash
npm start
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `CLERK_PEM_PUBLIC_KEY`: Clerk public key for JWT verification
- `PORT`: Server port (default: 5000)
- `CLAUDE_API_KEY`: Claude API key for AI features

## Dataset Continuity Logic

The system implements a dataset continuity system to maintain AI accuracy:

- **Day 1 missed**: Gentle reminder
- **Day 2 missed**: Warning message
- **Day 3 missed**: Final warning
- **Day 4+ missed**: Analytics reset (photos preserved)

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)

## Project Structure

```
├── models/             # Mongoose models
├── routes/             # Express route handlers
├── server.js           # Main server file
├── .env.example        # Environment variables template
└── package.json        # Dependencies and scripts
```
