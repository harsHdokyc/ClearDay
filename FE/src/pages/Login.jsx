import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to ClearDay
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Track your skincare journey with AI-powered insights
          </p>
        </div>
        <div className="mt-8">
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            forceRedirectUrl="/onboarding"
            afterSignInUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
