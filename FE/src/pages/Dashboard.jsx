import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { setStatus, setTodayLog, setLoading } from '../store/slices/dailySlice.js';
import { setProgressAnalysis } from '../store/slices/aiSlice.js';
import { dailyAPI, aiAPI } from '../services/api.js';
import puterAI from '../services/puterAI.js';

const Dashboard = () => {
  const { user } = useUser();
  const dispatch = useDispatch();
  const { streak, skippedDays, datasetWarning, hasCompletedToday, hasUploadedToday, todayLog } = useSelector((state) => state.daily);
  const { progressAnalysis } = useSelector((state) => state.ai);
  const { profile } = useSelector((state) => state.user);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDailyStatus();
  }, []);

  const fetchDailyStatus = async () => {
    try {
      dispatch(setLoading(true));
      const response = await dailyAPI.getStatus();
      dispatch(setStatus(response.data));
    } catch (error) {
      console.error('Failed to fetch daily status:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('date', new Date().toISOString().split('T')[0]);

    try {
      const response = await dailyAPI.uploadPhoto(formData);
      dispatch(setTodayLog(response.data.dailyLog));
      
      if (profile) {
        await generateProgressAnalysis(response.data.dailyLog.photoUrl);
      }
      
      setSelectedFile(null);
      setPreviewUrl('');
      fetchDailyStatus();
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRoutineComplete = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await dailyAPI.completeRoutine(today);
      dispatch(setTodayLog(response.data.dailyLog));
      fetchDailyStatus();
    } catch (error) {
      console.error('Failed to complete routine:', error);
    }
  };

  const generateProgressAnalysis = async (photoUrl) => {
    try {
      // Get user data from backend
      const userDataResponse = await aiAPI.getUserData();
      const { userProfile, recentLogs } = userDataResponse.data;
      
      // Use Puter.js for AI processing
      const analysis = await puterAI.analyzeProgress(
        userProfile,
        recentLogs,
        photoUrl
      );
      
      dispatch(setProgressAnalysis(analysis));
      
      // Store result in backend
      await aiAPI.getProgressAnalysis({ analysis });
    } catch (error) {
      console.error('Failed to generate progress analysis:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
          <p className="mt-2 text-gray-600">Track your skincare journey today</p>
        </div>

        {datasetWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">{datasetWarning}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{streak} days</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Skipped Days</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{skippedDays}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Today's Progress</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                Photo: {hasUploadedToday ? '✅ Uploaded' : '⏳ Pending'}
              </p>
              <p className="text-sm">
                Routine: {hasCompletedToday ? '✅ Completed' : '⏳ Pending'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Photo</h2>
            
            {previewUrl && (
              <div className="mb-4">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload today's photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={hasUploadedToday}
                />
              </div>
              
              {selectedFile && (
                <button
                  onClick={handlePhotoUpload}
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Routine Completion</h2>
            <p className="text-gray-600 mb-4">Mark today's skincare routine as complete</p>
            
            <button
              onClick={handleRoutineComplete}
              disabled={hasCompletedToday}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-400"
            >
              {hasCompletedToday ? '✅ Routine Completed' : 'Mark Routine Complete'}
            </button>
          </div>
        </div>

        {progressAnalysis && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Progress Insight</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Acne Trend:</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {progressAnalysis.acneTrend}
                </span>
              </div>
              <div>
                <span className="font-medium">Redness Trend:</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  {progressAnalysis.rednessTrend}
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-gray-700">{progressAnalysis.insightMessage}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
