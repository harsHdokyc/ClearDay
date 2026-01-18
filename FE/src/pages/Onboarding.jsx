import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setProfile as setUserProfile } from '../store/slices/userSlice.js';
import { userAPI } from '../services/api.js';
import { Sparkles, Target, Droplets, ChevronRight, AlertCircle, Plus, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component for Onboarding
const SortableOnboardingItem = ({ id, step, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="p-2 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing transition-colors"
        title="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
        <span className="font-semibold capitalize text-slate-700">{step.replace(/-/g, ' ')}</span>
        <button
          onClick={onRemove}
          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Onboarding = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [profileForm, setProfileForm] = useState({
    skinGoal: '',
    skinType: ''
  });
  const [customRoutineSteps, setCustomRoutineSteps] = useState([]);
  const [newCustomStep, setNewCustomStep] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const skinGoals = [
    { value: 'acne', label: 'Clear Acne', icon: '✨' },
    { value: 'glow', label: 'Achieve Glow', icon: '🌟' },
    { value: 'healthy-skin', label: 'Maintain Healthy Skin', icon: '💚' }
  ];

  const skinTypes = [
    { value: 'oily', label: 'Oily', icon: '💧' },
    { value: 'dry', label: 'Dry', icon: '🏜️' },
    { value: 'combination', label: 'Combination', icon: '⚖️' },
    { value: 'sensitive', label: 'Sensitive', icon: '🌸' }
  ];

  const handleAddCustomStep = () => {
    if (!newCustomStep.trim()) {
      return;
    }

    const stepKey = newCustomStep.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check if step already exists
    const defaultSteps = ['cleanser', 'treatment', 'moisturizer', 'sunscreen'];
    if (defaultSteps.includes(stepKey) || customRoutineSteps.includes(stepKey)) {
      setError('This step already exists');
      return;
    }

    setCustomRoutineSteps([...customRoutineSteps, stepKey]);
    setNewCustomStep('');
    setError('');
  };

  const handleRemoveCustomStep = (stepKey) => {
    setCustomRoutineSteps(customRoutineSteps.filter(s => s !== stepKey));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setCustomRoutineSteps((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.skinGoal || !profileForm.skinType) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create profile first
      const response = await userAPI.createProfile({
        clerkId: user.id,
        ...profileForm
      });
      
      const apiResponse = response.data;
      const userData = apiResponse?.data;
      
      if (userData) {
        // Save custom routine steps and order if any
        if (customRoutineSteps.length > 0) {
          const defaultSteps = ['cleanser', 'treatment', 'moisturizer', 'sunscreen'];
          const routineOrder = [...defaultSteps, ...customRoutineSteps];
          await userAPI.updateCustomRoutineSteps(customRoutineSteps, routineOrder);
        }
        
        dispatch(setUserProfile(userData));
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('No user data received from server');
      }
    } catch (err) {
      console.error('Profile creation error:', err);
      setError(`Failed to save profile: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-violet-100 rounded-2xl mb-4">
            <Sparkles className="w-12 h-12 text-violet-600" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Welcome to ClearDay
          </h1>
          <p className="text-lg text-slate-600">
            Tell us about your skin to personalize your experience
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-sm">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <p className="text-sm font-medium text-rose-800">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {/* Skin Goal Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-slate-600" />
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide">
                  What's your skin goal?
                </label>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {skinGoals.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, skinGoal: goal.value })}
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                      profileForm.skinGoal === goal.value
                        ? 'bg-violet-50 border-violet-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-violet-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{goal.icon}</span>
                    <span className={`text-base font-semibold ${
                      profileForm.skinGoal === goal.value ? 'text-violet-900' : 'text-slate-700'
                    }`}>
                      {goal.label}
                    </span>
                    {profileForm.skinGoal === goal.value && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Type Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Droplets className="w-5 h-5 text-slate-600" />
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide">
                  What's your skin type?
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {skinTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, skinType: type.value })}
                    className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                      profileForm.skinType === type.value
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-2xl">{type.icon}</span>
                    <span className={`text-base font-semibold ${
                      profileForm.skinType === type.value ? 'text-emerald-900' : 'text-slate-700'
                    }`}>
                      {type.label}
                    </span>
                    {profileForm.skinType === type.value && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Routine Steps Section (Optional) */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-slate-600" />
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Custom Routine Steps (Optional)
                </label>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Add any additional steps to your daily routine beyond the default ones
              </p>
              
              {/* Custom Steps List */}
              {customRoutineSteps.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={customRoutineSteps}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mb-4">
                      {customRoutineSteps.map((step) => (
                        <SortableOnboardingItem
                          key={step}
                          id={step}
                          step={step}
                          onRemove={() => handleRemoveCustomStep(step)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Add Custom Step Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCustomStep}
                  onChange={(e) => setNewCustomStep(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomStep()}
                  placeholder="e.g., serum, eye cream..."
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                />
                <button
                  onClick={handleAddCustomStep}
                  className="p-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                  title="Add step"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !profileForm.skinGoal || !profileForm.skinType}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>Continue to Dashboard</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            You can always update these preferences later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;