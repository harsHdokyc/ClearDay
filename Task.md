# ClearDay MVP PRD – Cursor-Ready Version

## Product Overview
**ClearDay** is a daily skincare habit-tracking app with AI-powered insights.  
It helps users stay consistent, understand progress, and evaluate skincare products.

**MVP Goal:**  
- Enable daily photo + routine tracking  
- Warn users about skipped days and dataset resets  
- Provide AI insights using Claude API  
- Use Clerk for authentication  
- Minimal functional UI (polish later)

---

## Tech Stack

**Frontend:**  
- React.js  
- Axios  
- TanStack Query  
- Redux Toolkit  
- Tailwind CSS  
- shadcn/ui  
- Clerk SDK  

**Backend:**  
- Node.js  
- Express.js  
- MongoDB + Mongoose  
- Multer (image uploads)  

**AI:**  
- Claude API integration  

---

## Features

### 1. Authentication (Clerk)
- Email/password + passwordless via Clerk  
- Frontend handles login/signup using Clerk SDK  
- Backend verifies Clerk JWT for all protected routes  

---

### 2. Daily Flow
- **Upload photo** (required)  
- **Routine completion toggle** (boolean)  
- **AI insights generated** (Claude API)  
- **Streak counter updated**  
- **Dataset continuity warning / reset**

---

### 3. AI Features (Claude API)

#### 3.1 Progress Analysis
- Input: photo URL, skin goal, skin type, previous 7 days metrics  
- Output: acneTrend, rednessTrend, insightMessage  
- Example:
```json
{
  "acneTrend": "decreasing",
  "rednessTrend": "mild",
  "insightMessage": "Your skin shows slight improvement over the last 5 days."
}
```
Store in Analytics.progressMetrics

### 3.2 Product Evaluation
- **Input:** product name, goal, skin type, sensitivity
- **Output:** fitScore, insightMessage

**Example:**
```json
{
  "fitScore": 75,
  "insightMessage": "Most users like you find this product effective. Mild dryness reported in 10% of cases."
}
```
Store in Analytics.productEvaluations

### 4. Dataset Continuity Rules

| Missed Days | Action |
|-------------|--------|
| 1 | Gentle reminder |
| 2 | Warning |
| 3 | Final warning |
| 4+ | Reset AI analytics + progress metrics (photos preserved) |

### 5. Database Models

#### User (Clerk-managed)
```js
{
  clerkId, // from Clerk
  profile: {
    skinGoal,
    skinType
  },
  createdAt
}
```

#### DailyLog
```js
{
  userId,
  date, // YYYY-MM-DD
  photoUrl,
  routineCompleted: Boolean,
  createdAt
}
```

#### Analytics
```js
{
  userId,
  baselineDate,
  totalDaysTracked,
  skippedDays,
  isReset,
  progressMetrics: [
    { date, acneTrend, rednessTrend, insightMessage }
  ],
  productEvaluations: [
    { date, productName, fitScore, insightMessage }
  ]
}
```

### 6. Backend Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /daily/upload-photo | POST | Upload daily photo (Multer) |
| /daily/complete-routine | POST | Mark routine as complete |
| /daily/status | GET | Return streak, skipped days, dataset warning |
| /daily/history | GET | Last 30 days of logs + AI insights |
| /ai/progress-analysis | POST | Call Claude API for daily progress insight |
| /ai/product-evaluation | POST | Call Claude API for product fit insight |

All routes protected via Clerk JWT middleware

### 7. Frontend Pages / Components

#### Login / Signup
- Clerk SDK integration

#### Onboarding
- Skin goal, skin type, consent

#### Dashboard
- Upload photo
- Routine toggle
- Streak counter
- Dataset warning
- AI insight card

#### History
- Last 30 days photos + AI insights

#### Product Evaluation
- Input product name + goal
- AI recommendation card

### 8. Frontend State Management

- **Redux Toolkit:** auth, user profile, streak, dataset warning, AI insights
- **TanStack Query:** fetch daily logs, analytics, product evaluation
- **Axios:** all API calls

### 9. UX Principles

- Calm, neutral, informational tone
- AI outputs are informational, not prescriptive
- Dataset reset messages educational, non-judgmental
- Minimal UI for MVP

### 10. Definition of Done (MVP)

- User logs in via Clerk
- Uploads daily photo
- Completes routine
- Streak counter updates
- Dataset warnings + reset functionality
- Claude AI provides progress insights
- Claude AI provides product evaluation
- Dashboard + History pages functional

## Cursor Scaffolding Prompt (Copy-Paste Ready)

You are a senior full-stack developer. Generate a complete MVP starter for a React + Node app called ClearDay with the following requirements:

Frontend:
- React.js + Tailwind CSS + shadcn/ui + Redux Toolkit + TanStack Query
- Clerk SDK for authentication
- Pages: Login, Onboarding, Dashboard, History, Product Evaluation
- Dashboard must allow photo upload, routine completion toggle, streak display, dataset warning, AI insight card
- History page shows last 30 days photos + AI insights
- Product Evaluation page allows user to input product and show AI recommendation
- Use Axios for API calls
- Redux manages auth, user profile, streak, dataset warning, AI insights
- TanStack Query manages fetching daily logs, analytics, product evaluations

Backend:
- Node.js + Express
- MongoDB + Mongoose
- Multer for photo uploads (limit 5MB, single file per day)
- Clerk JWT middleware to protect all routes
- Endpoints:
  - POST /daily/upload-photo
  - POST /daily/complete-routine
  - GET /daily/status
  - GET /daily/history
  - POST /ai/progress-analysis
  - POST /ai/product-evaluation
- AI endpoints integrate Claude API (send structured prompts, return JSON with acneTrend, rednessTrend, insightMessage for progress, and fitScore + insightMessage for product)
- Dataset reset logic: warn user after 1, 2, 3 skips; reset analytics after 4+ skips

Database:
- DailyLog: userId, date, photoUrl, routineCompleted, createdAt
- Analytics: userId, baselineDate, totalDaysTracked, skippedDays, isReset, progressMetrics [{date, acneTrend, rednessTrend, insightMessage}], productEvaluations [{date, productName, fitScore, insightMessage}]
- User: Clerk ID, profile {skinGoal, skinType}, createdAt

Other:
- Minimal functional UI (polish later)
- No social features or payments in MVP
- AI outputs are informational only
- Copy-paste ready for Cursor to scaffold frontend, backend, Mongo schemas, Multer, Clerk auth, Claude AI integration, Redux, and minimal UI

Generate all necessary folders, files, boilerplate code, React components, Express routes, Mongoose schemas, API integration, and sample state management.