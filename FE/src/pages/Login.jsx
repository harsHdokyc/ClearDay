import React, { useEffect } from 'react';
import { SignIn, useAuth } from '@clerk/clerk-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // If there's a redirect location from protected route, use it; otherwise go to dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate, location]);

  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Sign in to ClearDay
          </h1>
          <p className="text-lg text-slate-600">
            Track your skincare journey with AI-powered insights
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn 
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-in"
            forceRedirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
            appearance={{
              layout: {
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'iconButton',
                termsPageUrl: 'https://clerk.com/terms'
              },
              variables: {
                colorPrimary: '#2563eb',
                colorBackground: '#ffffff',
                colorInputBackground: '#ffffff',
                colorInputText: '#0f172a',
                colorText: '#475569',
                colorTextOnPrimaryBackground: '#ffffff',
                colorTextSecondary: '#64748b',
                colorDanger: '#ef4444',
                fontFamily: 'inherit',
                fontFamilyButtons: 'inherit',
                fontSize: '1rem',
                borderRadius: '0.75rem',
              },
              elements: {
                rootBox: 'w-full',
                card: 'bg-white shadow-sm border-2 border-slate-200 rounded-2xl p-8',
                headerTitle: 'text-2xl font-bold text-slate-900 hidden',
                headerSubtitle: 'text-slate-600 hidden',
                socialButtonsBlockButton: 'bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl py-3 transition-all duration-200 shadow-none hover:shadow-sm',
                socialButtonsBlockButtonText: 'font-semibold text-slate-700',
                socialButtonsIconButton: 'bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl w-12 h-12 transition-all duration-200',
                dividerRow: 'my-8',
                dividerText: 'text-slate-500 text-sm font-medium uppercase tracking-wide',
                dividerLine: 'bg-slate-200 h-px',
                formFieldLabel: 'text-sm font-bold text-slate-900 uppercase tracking-wide mb-2 block',
                formFieldInput: 'w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white',
                formFieldInputShowPasswordButton: 'text-slate-500 hover:text-slate-700',
                formButtonPrimary: 'w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md mt-6',
                footerActionText: 'text-slate-600 text-center mt-6',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold transition-colors ml-1',
                identityPreviewText: 'text-slate-700 font-medium',
                identityPreviewEditButton: 'text-blue-600 hover:text-blue-700 font-medium ml-2',
                formFieldSuccessText: 'text-emerald-600 text-sm mt-1',
                formFieldErrorText: 'text-rose-600 text-sm mt-1',
                formFieldWarningText: 'text-amber-600 text-sm mt-1',
                formFieldAction: 'text-blue-600 hover:text-blue-700 font-medium text-sm',
                otpCodeFieldInput: 'border-2 border-slate-200 rounded-xl text-center text-lg font-semibold',
                formResendCodeLink: 'text-blue-600 hover:text-blue-700 font-medium',
                footer: 'hidden',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;