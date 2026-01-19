import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { setProductEvaluation, setLoading } from '../store/slices/aiSlice.js';
import { setProfile as setUserProfile, setLoading as setUserLoading } from '../store/slices/userSlice.js';
import { aiAPI, userAPI } from '../services/api.js';
import puterAI from '../services/puterAI.js';
import { Sparkles, Target, Droplets, AlertCircle, ChevronRight, Award, Link2, Type } from 'lucide-react';

const ProductEvaluation = () => {
  const { user } = useUser();
  const dispatch = useDispatch();
  const { productEvaluation, loading } = useSelector((state) => state.ai);
  const { profile } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    productName: '',
    productUrl: '',
    inputType: 'name', // 'name' or 'url'
    goal: '',
    skinType: '',
    sensitivity: 'normal'
  });

  // Fetch profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      
      // Check if profile is already in Redux store
      if (profile?.profile?.skinGoal && profile?.profile?.skinType) {
        setFormData(prev => ({
          ...prev,
          goal: profile.profile.skinGoal,
          skinType: profile.profile.skinType
        }));
        return;
      }

      // Fetch profile from API
      dispatch(setUserLoading(true));
      try {
        const response = await userAPI.getProfile(user.id);
        if (response.data.success) {
          const userData = response.data.data;
          dispatch(setUserProfile(userData));
          
          // Update form data with fetched profile
          if (userData?.profile?.skinGoal && userData?.profile?.skinType) {
            setFormData(prev => ({
              ...prev,
              goal: userData.profile.skinGoal,
              skinType: userData.profile.skinType
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Profile might not exist yet, that's okay
      } finally {
        dispatch(setUserLoading(false));
      }
    };

    fetchProfile();
  }, [user?.id, dispatch]);

  // Update form data when profile changes in Redux store
  useEffect(() => {
    if (profile?.profile?.skinGoal && profile?.profile?.skinType) {
      setFormData(prev => ({
        ...prev,
        goal: profile.profile.skinGoal,
        skinType: profile.profile.skinType
      }));
    }
  }, [profile]);

  const goals = [
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

  const sensitivityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productInput = formData.inputType === 'url' ? formData.productUrl : formData.productName;
    if (!productInput) return;

    dispatch(setLoading(true));
    
    try {
      // Pass URL or name to the AI evaluation
      const productIdentifier = formData.inputType === 'url' 
        ? `Product URL: ${formData.productUrl}` 
        : formData.productName;
      
      const evaluation = await puterAI.evaluateProduct(
        productIdentifier,
        formData.goal,
        formData.skinType,
        formData.sensitivity
      );
      
      dispatch(setProductEvaluation(evaluation));
      
      await aiAPI.getProductEvaluation({
        evaluation,
        productName: formData.inputType === 'url' ? formData.productUrl : formData.productName
      });
    } catch (error) {
      console.error('Failed to evaluate product:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-500' };
    if (score >= 60) return { bg: 'bg-amber-100', text: 'text-amber-600', bar: 'bg-amber-500' };
    return { bg: 'bg-rose-100', text: 'text-rose-600', bar: 'bg-rose-500' };
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 60) return 'Good Fit';
    if (score >= 40) return 'Moderate Fit';
    return 'Poor Fit';
  };

  const scoreColor = productEvaluation ? getScoreColor(productEvaluation.fitScore) : { bg: 'bg-slate-100', text: 'text-slate-600', bar: 'bg-slate-500' };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Product Evaluation</h1>
          </div>
          <p className="text-slate-600 text-lg">Get AI-powered insights on skincare products tailored to your needs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Evaluation Form */}
          <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Evaluate a Product</h2>
            </div>
            
            <div className="space-y-6">
              {/* Input Type Toggle */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">
                  Input Type *
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, inputType: 'name', productUrl: '' })}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all font-semibold ${
                      formData.inputType === 'name'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Product Name</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, inputType: 'url', productName: '' })}
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl border-2 transition-all font-semibold ${
                      formData.inputType === 'url'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Link2 className="w-4 h-4" />
                    <span>Product URL</span>
                  </button>
                </div>
              </div>

              {/* Product Name or URL Input */}
              {formData.inputType === 'name' ? (
                <div>
                  <label htmlFor="productName" className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., CeraVe Foaming Cleanser"
                  />
                </div>
              ) : (
                <div>
                  <label htmlFor="productUrl" className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                    Product URL *
                  </label>
                  <input
                    type="url"
                    id="productUrl"
                    value={formData.productUrl}
                    onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                    className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="e.g., https://www.sephora.com/product/..."
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Paste the product page URL from Sephora, Ulta, Amazon, or brand website for better AI analysis
                  </p>
                </div>
              )}

              {/* Skin Goal - Read Only */}
              {formData.goal && (
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                    Your Skin Goal
                  </label>
                  <div className="block w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900">
                    {goals.find(g => g.value === formData.goal)?.label || formData.goal}
                  </div>
                </div>
              )}

              {/* Skin Type - Read Only */}
              {formData.skinType && (
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                    Skin Type
                  </label>
                  <div className="block w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900">
                    {skinTypes.find(t => t.value === formData.skinType)?.label || formData.skinType}
                  </div>
                </div>
              )}

              {/* Sensitivity Level */}
              <div>
                <label htmlFor="sensitivity" className="block text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                  Sensitivity Level
                </label>
                <select
                  id="sensitivity"
                  value={formData.sensitivity}
                  onChange={(e) => setFormData({ ...formData, sensitivity: e.target.value })}
                  className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                >
                  {sensitivityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading || (formData.inputType === 'name' ? !formData.productName : !formData.productUrl)}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>Analyzing...</span>
                ) : (
                  <>
                    <span>Evaluate Product</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl p-8 border-2 border-slate-200">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Award className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Evaluation Results</h2>
            </div>
            
            {!productEvaluation ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                  <Sparkles className="w-12 h-12 text-slate-400" />
                </div>
                <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Enter a product name and click "Evaluate Product" to see AI-powered insights.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${scoreColor.bg} mb-3`}>
                    <span className={`text-3xl font-bold ${scoreColor.text}`}>
                      {productEvaluation.fitScore}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold text-slate-900">
                      {getScoreLabel(productEvaluation.fitScore)}
                    </p>
                    <p className="text-sm text-slate-500">Compatibility Score</p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Score Breakdown</span>
                    <span className="text-sm font-bold text-slate-900">{productEvaluation.fitScore}/100</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-3 ${scoreColor.bar} rounded-full transition-all duration-500`}
                      style={{ width: `${productEvaluation.fitScore}%` }}
                    />
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="bg-cyan-50 rounded-xl p-5 border-2 border-cyan-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1.5 bg-cyan-200 rounded-lg flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-cyan-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-cyan-900 mb-2 uppercase tracking-wide">AI Analysis</h3>
                      <div className="text-sm text-cyan-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {productEvaluation.insightMessage}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900 mb-1 uppercase tracking-wide">Disclaimer</p>
                      <p className="text-sm text-amber-800 leading-relaxed">
                        This evaluation is based on AI analysis and should not replace professional dermatological advice. Results may vary based on individual factors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEvaluation;