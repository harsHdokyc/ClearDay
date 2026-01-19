import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setProfile as setUserProfile, setLoading, setError } from '../store/slices/userSlice.js';
import { userAPI } from '../services/api.js';
import { User, Mail, Target, Droplets, Settings, ArrowLeft, Edit2, Save, X, Sparkles, LogOut } from 'lucide-react';
import { useToast } from '../components/ui/use-toast.jsx';

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, loading } = useSelector((state) => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    skinGoal: '',
    skinType: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      dispatch(setLoading(true));
      try {
        const response = await userAPI.getProfile(user.id);
        if (response.data.success) {
          dispatch(setUserProfile(response.data.data));
          setEditForm({
            skinGoal: response.data.data.profile?.skinGoal || '',
            skinType: response.data.data.profile?.skinType || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        dispatch(setError('Failed to load profile'));
        toast({
          title: 'Error',
          description: 'Failed to load profile information',
          variant: 'destructive'
        });
      }
    };

    fetchProfile();
  }, [user?.id, dispatch, toast]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    dispatch(setLoading(true));
    try {
      const response = await userAPI.createProfile({
        clerkId: user.id,
        skinGoal: editForm.skinGoal,
        skinType: editForm.skinType
      });
      
      if (response.data.success) {
        dispatch(setUserProfile(response.data.data));
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      dispatch(setError('Failed to update profile'));
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditForm({
      skinGoal: profile?.profile?.skinGoal || '',
      skinType: profile?.profile?.skinType || ''
    });
    setIsEditing(false);
  };

  const getSkinGoalLabel = (goal) => {
    const labels = {
      'acne': 'Clear Acne',
      'glow': 'Achieve Glow',
      'healthy-skin': 'Healthy Skin'
    };
    return labels[goal] || goal;
  };

  const getSkinTypeLabel = (type) => {
    const labels = {
      'oily': 'Oily',
      'dry': 'Dry',
      'combination': 'Combination',
      'sensitive': 'Sensitive'
    };
    return labels[type] || type;
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-flex p-4 bg-blue-100 rounded-2xl mb-4 animate-pulse">
            <User className="w-12 h-12 text-blue-600" />
          </div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-violet-100 text-violet-900 rounded-xl hover:bg-violet-200 transition-colors font-semibold"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-semibold disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-blue-100 flex items-center justify-center mb-4 border-4 border-white shadow-lg">
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || 'User'}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-violet-600" />
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {user?.fullName || 'User'}
                </h2>
                <div className="flex items-center space-x-2 text-slate-600 mb-4">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user?.primaryEmailAddress?.emailAddress}</span>
                </div>
              </div>
              
              {/* Sign Out Button */}
              <div className="w-full pt-4 mt-4 border-t-2 border-slate-200">
                <button
                  onClick={() => signOut(() => navigate('/sign-in'))}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skin Profile Card */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Settings className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Skin Profile</h3>
              </div>

              <div className="space-y-4">
                {/* Skin Goal */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-2">
                    <Target className="w-4 h-4" />
                    <span>Skin Goal</span>
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.skinGoal}
                      onChange={(e) => setEditForm({ ...editForm, skinGoal: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                    >
                      <option value="">Select a goal</option>
                      <option value="acne">Clear Acne</option>
                      <option value="glow">Achieve Glow</option>
                      <option value="healthy-skin">Healthy Skin</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                      <span className="font-medium text-slate-900">
                        {profile?.profile?.skinGoal 
                          ? getSkinGoalLabel(profile.profile.skinGoal)
                          : 'Not set'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Skin Type */}
                <div>
                  <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 mb-2">
                    <Droplets className="w-4 h-4" />
                    <span>Skin Type</span>
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.skinType}
                      onChange={(e) => setEditForm({ ...editForm, skinType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                    >
                      <option value="">Select skin type</option>
                      <option value="oily">Oily</option>
                      <option value="dry">Dry</option>
                      <option value="combination">Combination</option>
                      <option value="sensitive">Sensitive</option>
                    </select>
                  ) : (
                    <div className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                      <span className="font-medium text-slate-900">
                        {profile?.profile?.skinType 
                          ? getSkinTypeLabel(profile.profile.skinType)
                          : 'Not set'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Routine Information */}
            {((profile?.routineOrder && profile.routineOrder.length > 0) || 
              (profile?.customRoutineSteps && profile.customRoutineSteps.length > 0)) && (
              <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Routine Order</h3>
                </div>
                <div className="space-y-2">
                  {/* Regular routine steps */}
                  {profile?.routineOrder && profile.routineOrder.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium text-slate-900 capitalize">
                        {step.replace(/-/g, ' ')}
                      </span>
                    </div>
                  ))}
                  
                  {/* Custom routine steps */}
                  {profile?.customRoutineSteps && profile.customRoutineSteps.map((step, index) => {
                    const baseIndex = profile?.routineOrder ? profile.routineOrder.length : 0;
                    return (
                      <div
                        key={`custom-${index}`}
                        className="flex items-center space-x-3 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                          {baseIndex + index + 1}
                        </div>
                        <span className="font-medium text-emerald-900 capitalize">
                          {step.replace(/-/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
