import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setProfile as setUserProfile } from '../store/slices/userSlice.js';
import { userAPI } from '../services/api.js';

/**
 * Custom hook to check if user has completed onboarding
 * @param {Object} options - Configuration options
 * @param {boolean} options.redirectIfIncomplete - Redirect to onboarding if incomplete (default: false)
 * @param {boolean} options.redirectIfComplete - Redirect to dashboard if complete (default: false)
 * @returns {Object} - { isLoading, hasCompletedOnboarding, profile }
 */
export const useOnboardingCheck = ({ 
  redirectIfIncomplete = false, 
  redirectIfComplete = false 
} = {}) => {
  const { user } = useUser();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state) => state.user);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check Redux store first
        if (profile?.profile?.skinGoal && profile?.profile?.skinType) {
          setHasCompletedOnboarding(true);
          setIsLoading(false);
          
          if (redirectIfComplete) {
            navigate('/dashboard', { replace: true });
          }
          return;
        }

        // If not in store, check API
        const response = await userAPI.getProfile(user.id);
        const userData = response.data?.data;
        
        if (userData?.profile?.skinGoal && userData?.profile?.skinType) {
          // User has completed onboarding
          dispatch(setUserProfile(userData));
          setHasCompletedOnboarding(true);
          setIsLoading(false);
          
          if (redirectIfComplete) {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // User hasn't completed onboarding (profile exists but missing required fields)
          setHasCompletedOnboarding(false);
          setIsLoading(false);
          
          if (redirectIfIncomplete) {
            navigate('/onboarding', { replace: true });
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        
        // Only redirect to onboarding if profile doesn't exist (404)
        // For other errors (network, server errors, etc.), don't redirect
        // This prevents redirecting existing users on temporary errors
        if (err.response?.status === 404) {
          // Profile doesn't exist - user hasn't completed onboarding
          setHasCompletedOnboarding(false);
          setIsLoading(false);
          
          if (redirectIfIncomplete) {
            navigate('/onboarding', { replace: true });
          }
        } else {
          // For other errors (network, 500, timeout, etc.), don't assume incomplete
          // This prevents redirecting existing users on refresh if API temporarily fails
          console.warn('Non-404 error during onboarding check - not redirecting:', {
            status: err.response?.status,
            message: err.message,
            url: err.config?.url
          });
          
          // If we have profile data in Redux, trust it even if API call failed
          if (profile?.profile?.skinGoal && profile?.profile?.skinType) {
            setHasCompletedOnboarding(true);
          } else {
            // If no profile data and it's not a 404, assume incomplete but DON'T redirect
            // This allows the user to stay on their current page
            // The ProtectedRoute will handle showing loading/error states
            setHasCompletedOnboarding(false);
            // Important: Don't redirect on non-404 errors to avoid breaking existing users
          }
          setIsLoading(false);
        }
      }
    };

    checkOnboardingStatus();
  }, [user?.id, profile, dispatch, navigate, redirectIfIncomplete, redirectIfComplete]);

  return { isLoading, hasCompletedOnboarding, profile };
};
