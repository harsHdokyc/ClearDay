import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

/**
 * AuthRoute - Ensures user is authenticated before accessing route
 * Redirects to /sign-in if not authenticated
 */
const AuthRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4 animate-pulse">
            <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

export default AuthRoute;
