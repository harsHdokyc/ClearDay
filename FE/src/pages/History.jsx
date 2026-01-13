import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHistory, setLoading } from '../store/slices/dailySlice.js';
import { dailyAPI } from '../services/api.js';

const History = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.daily);

  // Demo data for display when no real history exists
  const demoHistory = [
    {
      _id: 'demo1',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
      photoUrl: 'https://images.unsplash.com/photo-1620916566398-39f2967c8e30?w=400&h=300&fit=crop',
      routineCompleted: true,
      acneLevel: 3,
      rednessLevel: 2,
      notes: 'Skin looking clearer today, continuing with current routine'
    },
    {
      _id: 'demo2',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
      photoUrl: 'https://images.unsplash.com/photo-1556229368-7a47666c0e6e?w=400&h=300&fit=crop',
      routineCompleted: true,
      acneLevel: 4,
      rednessLevel: 3,
      notes: 'Some breakouts appearing, might be stress-related'
    },
    {
      _id: 'demo3',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
      photoUrl: 'https://images.unsplash.com/photo-1570220580742-56d8b860d8d8?w=400&h=300&fit=crop',
      routineCompleted: false,
      acneLevel: 3,
      rednessLevel: 2,
      notes: 'Forgot evening routine, skin seems okay though'
    },
    {
      _id: 'demo4',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
      photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop',
      routineCompleted: true,
      acneLevel: 2,
      rednessLevel: 1,
      notes: 'Great improvement! Redness reduced significantly'
    },
    {
      _id: 'demo5',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
      photoUrl: 'https://images.unsplash.com/photo-1598448051033-55d93c41183c?w=400&h=300&fit=crop',
      routineCompleted: true,
      acneLevel: 2,
      rednessLevel: 2,
      notes: 'Maintaining progress, feeling confident with current products'
    }
  ];

  const displayHistory = history.length > 0 ? history : demoHistory;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      dispatch(setLoading(true));
      const response = await dailyAPI.getHistory();
      dispatch(setHistory(response.data.logs));
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Skincare Journey</h1>
          <p className="mt-2 text-gray-600">View your progress over the last 30 days</p>
          {history.length === 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Demo Data:</strong> Showing sample history. Start tracking your daily photos and routine to see your real progress here.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayHistory.map((log) => (
            <div key={log._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                {log.photoUrl ? (
                  <img
                    src={log.photoUrl}
                    alt={`Skincare on ${log.date}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {formatDate(log.date)}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {log.photoUrl && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Photo
                      </span>
                    )}
                    {log.routineCompleted && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Routine
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Completed routine: {log.routineCompleted ? 'Yes' : 'No'}</p>
                  <p>Photo uploaded: {log.photoUrl ? 'Yes' : 'No'}</p>
                  {log.acneLevel && (
                    <div className="flex items-center space-x-2">
                      <span>Acne Level:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= log.acneLevel ? 'bg-red-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {log.rednessLevel && (
                    <div className="flex items-center space-x-2">
                      <span>Redness Level:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`w-2 h-2 rounded-full ${
                              level <= log.rednessLevel ? 'bg-orange-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {log.notes && (
                    <p className="text-gray-700 italic mt-2">"{log.notes}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default History;
