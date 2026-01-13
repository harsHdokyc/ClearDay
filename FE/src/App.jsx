import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import store from './store/index.js';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';
import ProductEvaluation from './pages/ProductEvaluation.jsx';
import Navigation from './components/Navigation.jsx';

const queryClient = new QueryClient();

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_your-clerk-key-here';

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <SignedIn>
                <Navigation />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/product-evaluation" element={<ProductEvaluation />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </SignedIn>
              
              <SignedOut>
                <Routes>
                  <Route path="/sign-in" element={<Login />} />
                  <Route path="/sign-in/*" element={<Login />} />
                  <Route path="/" element={<Navigate to="/sign-in" replace />} />
                </Routes>
              </SignedOut>
            </div>
          </Router>
        </QueryClientProvider>
      </Provider>
    </ClerkProvider>
  );
}

export default App;
