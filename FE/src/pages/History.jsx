import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setHistory, setLoading } from '../store/slices/dailySlice.js';
import { dailyAPI } from '../services/api.js';
import { Calendar, CheckCircle, XCircle, TrendingUp, TrendingDown, Minus, Image, FileText, Activity, Sparkles } from 'lucide-react';

const History = () => {
  const dispatch = useDispatch();
  const { history, loading } = useSelector((state) => state.daily);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      dispatch(setLoading(true));
      const response = await dailyAPI.getHistory();
      dispatch(setHistory(response.data.data.logs));
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

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-rose-600" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-emerald-600" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const getTrendBadge = (trend) => {
    if (trend === 'increasing') return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full">
        <TrendingUp className="w-3 h-3" />
        <span>Increasing</span>
      </span>
    );
    if (trend === 'decreasing') return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
        <TrendingDown className="w-3 h-3" />
        <span>Improving</span>
      </span>
    );
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
        <Minus className="w-3 h-3" />
        <span>Stable</span>
      </span>
    );
  };

  const getRoutineStepIcon = (completed) => {
    return completed ? 
      <CheckCircle className="w-4 h-4 text-emerald-600" /> : 
      <XCircle className="w-4 h-4 text-slate-400" />;
  };

  const getSeverityColor = (level) => {
    if (level <= 3) return 'emerald';
    if (level <= 6) return 'amber';
    return 'rose';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-violet-600 mx-auto"></div>
          <p className="mt-6 text-slate-600 font-medium">Loading your journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Your Skincare Journey</h1>
          </div>
          <p className="text-slate-600 text-lg">Track your progress and celebrate your wins</p>
        </div>

        {/* Stats Overview */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Logs</span>
                <Image className="w-5 h-5 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{history.length}</p>
              <p className="text-sm text-slate-500 mt-1">days recorded</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Completion Rate</span>
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {Math.round((history.filter(h => h.routineCompleted).length / history.length) * 100)}%
              </p>
              <p className="text-sm text-slate-500 mt-1">routines completed</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Avg Progress</span>
                <TrendingDown className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">Improving</p>
              <p className="text-sm text-slate-500 mt-1">skin condition trend</p>
            </div>
          </div>
        )}

        {/* Timeline */}
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-12 text-center">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No history yet</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Start tracking your daily photos and routine to see your amazing progress here!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((day, index) => (
              <div key={day._id} className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:border-violet-500 transition-all duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                  {/* Photo Section */}
                  <div className="lg:col-span-1">
                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 aspect-square">
                      <img 
                        src={day.photoUrl} 
                        alt={`Skin on ${formatDate(day.date)}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        {day.routineCompleted ? (
                          <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            <span>Complete</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-600 text-white text-xs font-semibold rounded-full">
                            <XCircle className="w-3 h-3" />
                            <span>Incomplete</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          {formatDate(day.date)}
                        </h3>
                        <span className="text-sm font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                          Day {history.length - index}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        {history.length - index === 1 ? 'Your first step' : `${history.length - index} days into your journey`}
                      </p>
                    </div>

                    {/* Routine Steps */}
                    {day.routineSteps && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Activity className="w-4 h-4 text-slate-600" />
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Routine Steps</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          {Object.entries(day.routineSteps)
                            .filter(([key]) => key !== 'totalSteps' && key !== 'completedSteps')
                            .map(([step, completed]) => (
                              <div 
                                key={step}
                                className={`flex items-center space-x-2 p-3 rounded-xl border-2 ${
                                  completed 
                                    ? 'bg-emerald-50 border-emerald-200' 
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                {getRoutineStepIcon(completed)}
                                <span className={`text-sm font-semibold capitalize ${
                                  completed ? 'text-emerald-900' : 'text-slate-500'
                                }`}>
                                  {step}
                                </span>
                              </div>
                            ))}
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Progress</span>
                            <span className="text-sm font-bold text-slate-900">
                              {day.routineSteps.completedSteps}/{day.routineSteps.totalSteps}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-2 bg-violet-600 rounded-full transition-all duration-300"
                              style={{ width: `${(day.routineSteps.completedSteps / day.routineSteps.totalSteps) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skin Analysis */}
                    {(day.acneLevel !== null || day.rednessLevel !== null) && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="w-4 h-4 text-slate-600" />
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Skin Analysis</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {day.acneLevel !== null && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-700">Acne Level</span>
                                <span className={`text-lg font-bold text-${getSeverityColor(day.acneLevel)}-600`}>
                                  {day.acneLevel}/10
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-2.5 bg-${getSeverityColor(day.acneLevel)}-500 rounded-full transition-all duration-300`}
                                  style={{ width: `${(day.acneLevel / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {day.rednessLevel !== null && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-700">Redness Level</span>
                                <span className={`text-lg font-bold text-${getSeverityColor(day.rednessLevel)}-600`}>
                                  {day.rednessLevel}/10
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-2.5 bg-${getSeverityColor(day.rednessLevel)}-500 rounded-full transition-all duration-300`}
                                  style={{ width: `${(day.rednessLevel / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Insights */}
                    {day.progressMetrics && day.progressMetrics.length > 0 && (
                      <div className="bg-cyan-50 rounded-xl p-5 border-2 border-cyan-200">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="p-1.5 bg-cyan-200 rounded-lg">
                            <Sparkles className="w-4 h-4 text-cyan-700" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-cyan-900 mb-1 uppercase tracking-wide">AI Insight</h4>
                            <p className="text-sm text-cyan-800 leading-relaxed">
                              {day.progressMetrics[day.progressMetrics.length - 1].insightMessage}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-cyan-700">Acne:</span>
                            {getTrendBadge(day.progressMetrics[day.progressMetrics.length - 1].acneTrend)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-cyan-700">Redness:</span>
                            {getTrendBadge(day.progressMetrics[day.progressMetrics.length - 1].rednessTrend)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {day.notes && (
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <FileText className="w-4 h-4 text-slate-600" />
                          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Notes</h4>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <p className="text-sm text-slate-700 leading-relaxed">{day.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;