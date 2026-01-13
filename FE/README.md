# ClearDay Frontend

A React.js frontend for the ClearDay skincare habit tracking application.

## Features

- **Authentication**: Clerk integration for secure user authentication
- **Dashboard**: Daily photo upload, routine tracking, streak display
- **History**: View last 30 days of skincare progress
- **Product Evaluation**: AI-powered product recommendations
- **State Management**: Redux Toolkit for global state
- **API Integration**: TanStack Query for server state management

## Tech Stack

- React.js with Vite
- Tailwind CSS for styling
- Redux Toolkit for state management
- TanStack Query for server state
- Clerk for authentication
- Axios for API calls
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

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
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

### Running the App

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/             # Page components
├── store/             # Redux store and slices
├── services/          # API service layer
├── App.jsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## Environment Variables

- `VITE_API_URL`: Backend API URL
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk publishable key for authentication

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
