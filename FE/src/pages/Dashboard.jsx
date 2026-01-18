import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { setStatus, setTodayLog, setLoading } from '../store/slices/dailySlice.js';
import { setProgressAnalysis, clearError } from '../store/slices/aiSlice.js';
import { setGamificationStatus, updateMilestones, completeGesture, clearNewlyUnlocked } from '../store/slices/gamificationSlice.js';
import { setProfile as setUserProfile } from '../store/slices/userSlice.js';
import { dailyAPI, aiAPI, gamificationAPI, userAPI } from '../services/api.js';
import puterAI from '../services/puterAI.js';
import MilestoneCelebration from '../components/MilestoneCelebration.jsx';
import { Camera, CheckCircle, Circle, Sparkles, TrendingUp, Calendar, Target, Award, Flame, ChevronRight, Upload, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '../components/ui/use-toast.jsx';
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

// Sortable Item Component
const SortableRoutineItem = ({ id, step, isCompleted, isDefault, onToggle, onRemove }) => {
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
      <button
        onClick={onToggle}
        className={`flex-1 flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
          isCompleted
            ? 'bg-emerald-50 border-emerald-500' 
            : 'bg-white border-slate-200 hover:border-purple-500 hover:bg-purple-50'
        }`}
      >
        <div className="flex items-center space-x-3">
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          ) : (
            <Circle className="w-6 h-6 text-slate-400" />
          )}
          <span className={`font-semibold capitalize ${isCompleted ? 'text-emerald-900' : 'text-slate-700'}`}>
            {step.replace(/-/g, ' ')}
          </span>
        </div>
        {isCompleted && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            Done
          </span>
        )}
      </button>
      <button
        onClick={onRemove}
        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
        title={isDefault ? "Remove from routine" : "Delete step"}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useUser();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { streak, skippedDays, datasetWarning, hasCompletedToday, hasUploadedToday, todayLog } = useSelector((state) => state.daily);
  const { progressAnalysis } = useSelector((state) => state.ai);
  const { profile } = useSelector((state) => state.user);
  const { 
    currentStreak, 
    milestones, 
    nextMilestone, 
    newlyUnlocked, 
    totalGesturesCompleted,
    loading: gamificationLoading 
  } = useSelector((state) => state.gamification);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Default routine steps
  const defaultSteps = ['cleanser', 'treatment', 'moisturizer', 'sunscreen'];
  const [customSteps, setCustomSteps] = useState([]);
  const [routineOrder, setRoutineOrder] = useState([]);
  const [newCustomStep, setNewCustomStep] = useState('');
  const [routineSteps, setRoutineSteps] = useState({});
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  
  // Multi-photo upload states
  const [frontView, setFrontView] = useState(null);
  const [rightView, setRightView] = useState(null);
  const [leftView, setLeftView] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [rightPreview, setRightPreview] = useState('');
  const [leftPreview, setLeftPreview] = useState('');

  useEffect(() => {
    fetchDailyStatus();
    fetchGamificationStatus();
    loadCustomRoutineSteps();
  }, []);

  // Initialize routine steps when order is loaded
  useEffect(() => {
    if (routineOrder.length > 0) {
      setRoutineSteps(prev => {
        const newSteps = { ...prev };
        // Add any new steps from order that don't exist yet
        routineOrder.forEach(step => {
          if (!newSteps.hasOwnProperty(step)) {
            newSteps[step] = false;
          }
        });
        return newSteps;
      });
    }
  }, [routineOrder]);

  const loadCustomRoutineSteps = async () => {
    if (!user?.id) return;
    
    try {
      const response = await userAPI.getProfile(user.id);
      const userData = response.data?.data;
      if (userData?.customRoutineSteps) {
        setCustomSteps(userData.customRoutineSteps);
      }
      // Load routine order if available, otherwise use default order
      if (userData?.routineOrder && userData.routineOrder.length > 0) {
        setRoutineOrder(userData.routineOrder);
      } else {
        // Initialize with default order + custom steps
        setRoutineOrder([...defaultSteps, ...(userData?.customRoutineSteps || [])]);
      }
    } catch (error) {
      console.error('Failed to load custom routine steps:', error);
      // Fallback to default order
      setRoutineOrder([...defaultSteps]);
    }
  };

  const saveCustomRoutineSteps = async (steps, order) => {
    try {
      const response = await userAPI.updateCustomRoutineSteps(steps, order);
      dispatch(setUserProfile(response.data.data));
      toast({
        title: 'Success',
        description: 'Routine steps saved',
        variant: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to save routine steps:', error);
      toast({
        title: 'Error',
        description: 'Failed to save routine steps',
        variant: 'destructive',
        duration: 3000
      });
    }
  };

  const handleAddCustomStep = () => {
    if (!newCustomStep.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a step name',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    const stepKey = newCustomStep.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check if step already exists
    if (defaultSteps.includes(stepKey) || customSteps.includes(stepKey)) {
      toast({
        title: 'Validation Error',
        description: 'This step already exists',
        variant: 'destructive',
        duration: 3000
      });
      return;
    }

    const updatedCustomSteps = [...customSteps, stepKey];
    const updatedOrder = [...routineOrder, stepKey];
    setCustomSteps(updatedCustomSteps);
    setRoutineOrder(updatedOrder);
    setRoutineSteps(prev => ({ ...prev, [stepKey]: false }));
    setNewCustomStep('');
    saveCustomRoutineSteps(updatedCustomSteps, updatedOrder);
  };

  const handleRemoveCustomStep = (stepKey) => {
    const updatedCustomSteps = customSteps.filter(s => s !== stepKey);
    const updatedOrder = routineOrder.filter(s => s !== stepKey);
    setCustomSteps(updatedCustomSteps);
    setRoutineOrder(updatedOrder);
    setRoutineSteps(prev => {
      const newSteps = { ...prev };
      delete newSteps[stepKey];
      return newSteps;
    });
    saveCustomRoutineSteps(updatedCustomSteps, updatedOrder);
  };

  const handleRemoveStep = (stepKey) => {
    // Check if it's a default step or custom step
    if (defaultSteps.includes(stepKey)) {
      // Remove from order but keep in customSteps (it's a default)
      const updatedOrder = routineOrder.filter(s => s !== stepKey);
      setRoutineOrder(updatedOrder);
      setRoutineSteps(prev => {
        const newSteps = { ...prev };
        delete newSteps[stepKey];
        return newSteps;
      });
      saveCustomRoutineSteps(customSteps, updatedOrder);
    } else {
      // It's a custom step, remove it permanently
      handleRemoveCustomStep(stepKey);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setRoutineOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        // Save the new order
        saveCustomRoutineSteps(customSteps, newOrder);
        return newOrder;
      });
    }
  };

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setCurrentMilestone(newlyUnlocked[0]);
      setShowMilestoneCelebration(true);
    }
  }, [newlyUnlocked]);

  const fetchDailyStatus = async () => {
    try {
      dispatch(setLoading(true));
      const response = await dailyAPI.getStatus();
      dispatch(setStatus(response.data.data));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch daily status. Please refresh the page.',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchGamificationStatus = async () => {
    try {
      const response = await gamificationAPI.getStatus();
      dispatch(setGamificationStatus(response.data.data));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch gamification status. Please refresh the page.',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const handleFileSelect = (event, view) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (view === 'front') {
          setFrontView(file);
          setFrontPreview(reader.result);
        } else if (view === 'right') {
          setRightView(file);
          setRightPreview(reader.result);
        } else if (view === 'left') {
          setLeftView(file);
          setLeftPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultiPhotoUpload = async () => {
    if (!frontView || !rightView || !leftView) {
      toast({
        title: 'Validation Error',
        description: 'All 3 photos (front, right, and left views) are required!',
        variant: 'destructive',
        duration: 5000
      });
      return;
    }

    setUploading(true);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upload photos one by one to handle individual failures
      const uploadResults = [];
      let frontResponse, rightResponse, leftResponse;
      
      if (frontView) {
        try {
          const frontFormData = new FormData();
          frontFormData.append('photo', frontView);
          frontFormData.append('date', today);
          frontResponse = await dailyAPI.uploadPhoto(frontFormData);
          uploadResults.push({ view: 'front', success: true, response: frontResponse });
        } catch (error) {
          uploadResults.push({ view: 'front', success: false, error });
        }
      }
      
      if (rightView) {
        try {
          const rightFormData = new FormData();
          rightFormData.append('photo', rightView);
          rightFormData.append('date', today);
          rightResponse = await dailyAPI.uploadPhoto(rightFormData);
          uploadResults.push({ view: 'right', success: true, response: rightResponse });
        } catch (error) {
          uploadResults.push({ view: 'right', success: false, error });
        }
      }
      
      if (leftView) {
        try {
          const leftFormData = new FormData();
          leftFormData.append('photo', leftView);
          leftFormData.append('date', today);
          leftResponse = await dailyAPI.uploadPhoto(leftFormData);
          uploadResults.push({ view: 'left', success: true, response: leftResponse });
        } catch (error) {
          uploadResults.push({ view: 'left', success: false, error });
        }
      }
      
      // Check for duplicate photo errors
      const duplicateErrors = uploadResults.filter(result => 
        !result.success && 
        result.error?.response?.status === 409 && 
        result.error?.response?.data?.code === 'PHOTO_ALREADY_EXISTS'
      );
      
      if (duplicateErrors.length > 0) {
        const duplicateViews = duplicateErrors.map(err => err.view).join(', ');
        toast({
          title: 'Duplicate Photos',
          description: `Photos for ${duplicateViews} view(s) already exist for this date. Please select a different date or check your existing photos.`,
          variant: 'destructive',
          duration: 5000
        });
        return;
      }
      
      // Check if any uploads failed (other than duplicates)
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        toast({
          title: 'Upload Failed',
          description: 'Some photos failed to upload. Please try again.',
          variant: 'destructive',
          duration: 5000
        });
        return;
      }
      
      // Use the first successful response for dispatch
      const successfulResponse = uploadResults.find(result => result.success)?.response;
      if (successfulResponse) {
        dispatch(setTodayLog(successfulResponse.data.data));
        
        if (profile) {
          await generateProgressAnalysis(successfulResponse.data.data.photoUrl);
        }
        
        toast({
          title: 'Success',
          description: 'Photos uploaded successfully!',
          variant: 'success',
          duration: 3000
        });
      }
      
      setFrontView(null);
      setRightView(null);
      setLeftView(null);
      setFrontPreview('');
      setRightPreview('');
      setLeftPreview('');
      
      fetchDailyStatus();
      await checkMilestones();
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload photos. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRoutineStepToggle = (step) => {
    setRoutineSteps(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const handleRoutineComplete = async () => {
    const completedStepsCount = Object.values(routineSteps).filter(Boolean).length;
    
    if (completedStepsCount === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please complete at least one step!',
        variant: 'destructive',
        duration: 5000
      });
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await dailyAPI.completeRoutineSteps(today, routineSteps);
      dispatch(setTodayLog(response.data.data));
      fetchDailyStatus();
      await checkMilestones();
      
      // Reset all routine steps (only the ones currently in routineSteps)
      const resetSteps = {};
      Object.keys(routineSteps).forEach(step => {
        resetSteps[step] = false;
      });
      setRoutineSteps(resetSteps);
      
      toast({
        title: 'Success',
        description: 'Routine completed successfully!',
        variant: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete routine. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const generateProgressAnalysis = async (photoUrl) => {
    try {
      const userDataResponse = await aiAPI.getUserData();
      const { userProfile, recentLogs } = userDataResponse.data;
      
      const analysis = await puterAI.analyzeProgress(
        userProfile,
        recentLogs,
        photoUrl
      );
      
      dispatch(setProgressAnalysis(analysis));
      await aiAPI.getProgressAnalysis({ analysis });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate progress analysis. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
      dispatch(clearError());
    }
  };

  const checkMilestones = async () => {
    try {
      const response = await gamificationAPI.updateMilestones();
      dispatch(updateMilestones(response.data.data));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check milestones. Please refresh the page.',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const handleGestureComplete = async (gestureType, milestoneName) => {
    try {
      const response = await gamificationAPI.completeGesture(gestureType, milestoneName);
      dispatch(completeGesture(response.data.data));
      setShowMilestoneCelebration(false);
      setCurrentMilestone(null);
      dispatch(clearNewlyUnlocked());
      
      toast({
        title: 'Success',
        description: 'Gesture completed successfully!',
        variant: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete gesture. Please try again.',
        variant: 'destructive',
        duration: 5000
      });
    }
  };

  const clearAllPhotos = () => {
    setFrontView(null);
    setRightView(null);
    setLeftView(null);
    setFrontPreview('');
    setRightPreview('');
    setLeftPreview('');
  };

  const completedStepsCount = Object.values(routineSteps).filter(Boolean).length;
  const photosSelected = [frontView, rightView, leftView].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600 text-lg">Track your skincare journey with precision</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Streak */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-violet-500 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-violet-100 rounded-xl">
                <Flame className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-sm font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">Active</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Current Streak</p>
              <p className="text-4xl font-bold text-slate-900">{currentStreak}</p>
              <p className="text-sm text-slate-500">days in a row</p>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-emerald-500 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Record</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Longest Streak</p>
              <p className="text-4xl font-bold text-slate-900">{milestones?.longestStreak || 0}</p>
              <p className="text-sm text-slate-500">personal best</p>
            </div>
          </div>

          {/* Impact Score */}
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-amber-500 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Impact</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Gestures Completed</p>
              <p className="text-4xl font-bold text-slate-900">{totalGesturesCompleted}</p>
              <p className="text-sm text-slate-500">real-world actions</p>
            </div>
          </div>
        </div>

        {/* Next Milestone Card */}
        {nextMilestone && (
          <div className="bg-white rounded-2xl p-6 mb-8 border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Next Milestone</p>
                  <p className="text-xl font-bold text-slate-900">{nextMilestone.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-600">{nextMilestone.days - currentStreak}</p>
                <p className="text-sm text-slate-500">days to go</p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-3 bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${nextMilestone.progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 text-right">{Math.round(nextMilestone.progress)}% complete</p>
            </div>
          </div>
        )}

        {/* Dataset Warning */}
        {datasetWarning && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-8">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-medium">{datasetWarning}</span>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Photos Section */}
          <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Camera className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Daily Photos</h2>
                  <p className="text-sm text-slate-500">All 3 views required</p>
                </div>
              </div>
              {!hasUploadedToday && photosSelected > 0 && (
                <button
                  onClick={clearAllPhotos}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              )}
            </div>

            {hasUploadedToday ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 bg-emerald-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Photos uploaded successfully!</p>
                  <p className="text-sm text-slate-500">All 3 views captured for today</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {/* Front View */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Front</label>
                    <label htmlFor="front-upload" className="block cursor-pointer">
                      <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Camera className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload</span>
                      </div>
                      <input
                        id="front-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'front')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Right View */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Right</label>
                    <label htmlFor="right-upload" className="block cursor-pointer">
                      <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Camera className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload</span>
                      </div>
                      <input
                        id="right-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'right')}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Left View */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">Left</label>
                    <label htmlFor="left-upload" className="block cursor-pointer">
                      <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Camera className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload</span>
                      </div>
                      <input
                        id="left-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'left')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Upload Progress - Only show if not uploaded today */}
                {!hasUploadedToday && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Upload Progress</span>
                      <span className="text-sm font-bold text-slate-900">{photosSelected}/3</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className={`flex-1 h-2 rounded-full ${frontView ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 h-2 rounded-full ${rightView ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className={`flex-1 h-2 rounded-full ${leftView ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                  </div>
                )}

                {/* Upload Button - Only show if not uploaded today */}
                {!hasUploadedToday && (
                  <button
                    onClick={handleMultiPhotoUpload}
                    disabled={!frontView || !rightView || !leftView || uploading}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {uploading ? (
                      <span>Uploading...</span>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Upload All Photos</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Routine Section */}
          <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Today's Routine</h2>
                <p className="text-sm text-slate-500">Complete your skincare steps</p>
              </div>
            </div>

            {!hasCompletedToday ? (
              <div className="space-y-6">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={routineOrder.filter(step => routineSteps.hasOwnProperty(step))}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {/* All Steps (Default + Custom) - Ordered */}
                      {routineOrder
                        .filter(step => routineSteps.hasOwnProperty(step))
                        .map((step) => {
                          const isDefault = defaultSteps.includes(step);
                          return (
                            <SortableRoutineItem
                              key={step}
                              id={step}
                              step={step}
                              isCompleted={routineSteps[step]}
                              isDefault={isDefault}
                              onToggle={() => handleRoutineStepToggle(step)}
                              onRemove={() => handleRemoveStep(step)}
                            />
                          );
                        })}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Add Custom Step */}
                <div className="flex items-center gap-2 pt-2 border-t-2 border-slate-200">
                  <input
                    type="text"
                    value={newCustomStep}
                    onChange={(e) => setNewCustomStep(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomStep()}
                    placeholder="Add custom step..."
                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                  <button
                    onClick={handleAddCustomStep}
                    className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    title="Add step"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Summary */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Steps Completed</span>
                    <span className="text-lg font-bold text-slate-900">{completedStepsCount}/{Object.keys(routineSteps).length}</span>
                  </div>
                  <div className="mt-3 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                      style={{ width: `${Object.keys(routineSteps).length > 0 ? (completedStepsCount / Object.keys(routineSteps).length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Complete Button */}
                <button
                  onClick={handleRoutineComplete}
                  disabled={completedStepsCount === 0}
                  className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Complete Routine</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-4 bg-emerald-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-semibold text-slate-900">Routine completed!</p>
                  <p className="text-sm text-slate-500">Great job staying consistent</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights - Full Width */}
        {progressAnalysis && (
          <div className="mt-8 bg-white rounded-2xl p-8 border-2 border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">AI-Powered Insights</h3>
                <p className="text-sm text-slate-500">Your personalized skin analysis</p>
              </div>
            </div>
            
            <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200 mb-6">
              <p className="text-slate-800 text-lg leading-relaxed">
                {progressAnalysis.insightMessage}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Acne Trend</span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 capitalize">{progressAnalysis.acneTrend}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Redness</span>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900 capitalize">{progressAnalysis.rednessTrend}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Milestone Celebration Modal */}
      {showMilestoneCelebration && currentMilestone && (
        <MilestoneCelebration
          milestone={currentMilestone}
          onClose={() => {
            setShowMilestoneCelebration(false);
            setCurrentMilestone(null);
            dispatch(clearNewlyUnlocked());
          }}
          onCompleteGesture={handleGestureComplete}
        />
      )}
    </div>
  );
};

export default Dashboard;