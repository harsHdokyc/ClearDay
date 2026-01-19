import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './store/index.js';
import Login from './pages/Login.jsx';
import Landing from './pages/Landing.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import ProductEvaluation from './pages/ProductEvaluation.jsx';
import Profile from './pages/Profile.jsx';
import Navigation from './components/Navigation.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import OnboardingRoute from './components/OnboardingRoute.jsx';
import { Toaster } from './components/ui/use-toast.jsx';

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_your-clerk-key-here';

// Component to conditionally render Navigation only for authenticated users
const ConditionalNavigation = () => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <Navigation /> : null;
};

function App() {
  // Validate Clerk key
  if (!clerkPubKey || clerkPubKey === 'pk_test_your-clerk-key-here') {
    console.error('Clerk publishable key is not set. Please set VITE_CLERK_PUBLISHABLE_KEY environment variable.');
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <ConditionalNavigation />
              <Routes>
                {/* Public routes */}
                <Route path="/sign-in" element={<Login />} />
                <Route path="/sign-in/*" element={<Login />} />
                <Route path="/" element={<Landing />} />
                
                {/* Protected routes - check auth and onboarding internally */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/history" 
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/product-evaluation" 
                  element={
                    <ProtectedRoute>
                      <ProductEvaluation />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Onboarding route - requires auth, redirects if already completed */}
                <Route 
                  path="/onboarding" 
                  element={
                    <OnboardingRoute>
                      <Onboarding />
                    </OnboardingRoute>
                  } 
                />
                
                {/* Catch-all: redirect to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </QueryClientProvider>
      </Provider>
    </ClerkProvider>
  );
}

export default App;
