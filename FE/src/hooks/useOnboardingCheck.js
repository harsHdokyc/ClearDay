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
          
          if (redirectIfComplete) {
            navigate('/dashboard', { replace: true });
          }
        } else {
          // User hasn't completed onboarding
          setHasCompletedOnboarding(false);
          
          if (redirectIfIncomplete) {
            navigate('/onboarding', { replace: true });
          }
        }
      } catch (err) {
        // If profile doesn't exist (404), user hasn't completed onboarding
        if (err.response?.status === 404) {
          setHasCompletedOnboarding(false);
          
          if (redirectIfIncomplete) {
            navigate('/onboarding', { replace: true });
          }
        } else {
          console.error('Error checking onboarding status:', err);
          // On error, assume incomplete to be safe
          setHasCompletedOnboarding(false);
          
          if (redirectIfIncomplete) {
            navigate('/onboarding', { replace: true });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user?.id, profile, dispatch, navigate, redirectIfIncomplete, redirectIfComplete]);

  return { isLoading, hasCompletedOnboarding, profile };
};
