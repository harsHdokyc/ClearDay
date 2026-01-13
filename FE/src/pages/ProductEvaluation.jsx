import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setProductEvaluation, setLoading } from '../store/slices/aiSlice.js';
import { aiAPI } from '../services/api.js';
import puterAI from '../services/puterAI.js';

const ProductEvaluation = () => {
  const dispatch = useDispatch();
  const { productEvaluation, loading } = useSelector((state) => state.ai);
  const { profile } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    productName: '',
    goal: profile?.skinGoal || '',
    skinType: profile?.skinType || '',
    sensitivity: 'normal'
  });

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
    if (!formData.productName) return;

    dispatch(setLoading(true));
    
    try {
      // Use Puter.js for AI processing
      const evaluation = await puterAI.evaluateProduct(
        formData.productName,
        formData.goal,
        formData.skinType,
        formData.sensitivity
      );
      
      dispatch(setProductEvaluation(evaluation));
      
      // Store result in backend
      await aiAPI.getProductEvaluation({
        evaluation,
        productName: formData.productName
      });
    } catch (error) {
      console.error('Failed to evaluate product:', error);
      // No fallback - let the error propagate
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 60) return 'Good Fit';
    if (score >= 40) return 'Moderate Fit';
    return 'Poor Fit';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Evaluation</h1>
          <p className="mt-2 text-gray-600">Get AI-powered insights on skincare products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Evaluate a Product</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CeraVe Foaming Cleanser"
                  required
                />
              </div>

              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Skin Goal
                </label>
                <select
                  id="goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select goal</option>
                  {goals.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="skinType" className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Type
                </label>
                <select
                  id="skinType"
                  value={formData.skinType}
                  onChange={(e) => setFormData({ ...formData, skinType: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select skin type</option>
                  {skinTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sensitivity" className="block text-sm font-medium text-gray-700 mb-2">
                  Sensitivity Level
                </label>
                <select
                  id="sensitivity"
                  value={formData.sensitivity}
                  onChange={(e) => setFormData({ ...formData, sensitivity: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {sensitivityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.productName}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Evaluate Product'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Evaluation Results</h2>
            
            {!productEvaluation ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="text-gray-600">Enter a product name and click "Evaluate Product" to see AI-powered insights.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreColor(productEvaluation.fitScore)}`}>
                    <span className="text-2xl font-bold">{productEvaluation.fitScore}</span>
                  </div>
                  <p className="mt-2 text-lg font-medium text-gray-900">
                    {getScoreLabel(productEvaluation.fitScore)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {productEvaluation.insightMessage}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500">
                    <strong>Disclaimer:</strong> This evaluation is based on AI analysis and should not replace professional dermatological advice. Results may vary based on individual factors.
                  </p>
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
