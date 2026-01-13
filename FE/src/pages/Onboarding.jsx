import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setProfile } from '../store/slices/userSlice.js';
import { userAPI } from '../services/api.js';

const Onboarding = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [profile, setProfile] = useState({
    skinGoal: '',
    skinType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const skinGoals = [
    { value: 'acne', label: 'Clear Acne' },
    { value: 'glow', label: 'Achieve Glow' },
    { value: 'healthy-skin', label: 'Maintain Healthy Skin' }
  ];

  const skinTypes = [
    { value: 'oily', label: 'Oily' },
    { value: 'dry', label: 'Dry' },
    { value: 'combination', label: 'Combination' },
    { value: 'sensitive', label: 'Sensitive' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile.skinGoal || !profile.skinType) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await userAPI.createProfile({
        clerkId: user.id,
        ...profile
      });
      
      dispatch(setProfile(response.data));
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to ClearDay
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Tell us about your skin to personalize your experience
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="skinGoal" className="block text-sm font-medium text-gray-700">
              What's your skin goal?
            </label>
            <select
              id="skinGoal"
              value={profile.skinGoal}
              onChange={(e) => setProfile({ ...profile, skinGoal: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select your goal</option>
              {skinGoals.map((goal) => (
                <option key={goal.value} value={goal.value}>
                  {goal.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="skinType" className="block text-sm font-medium text-gray-700">
              What's your skin type?
            </label>
            <select
              id="skinType"
              value={profile.skinType}
              onChange={(e) => setProfile({ ...profile, skinType: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              required
            >
              <option value="">Select your skin type</option>
              {skinTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Continue to Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
