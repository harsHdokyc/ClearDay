import React from 'react';
import { X, Trophy, Sparkles } from 'lucide-react';

const MilestoneCelebration = ({ milestone, onClose, onCompleteGesture }) => {
  const getGestureOptions = (milestoneName) => {
    const gestures = {
      'Proof Builder': [
        { type: 'donate_meal', label: 'Donate a Meal', description: 'Provide a meal to someone in need' },
        { type: 'plant_tree', label: 'Plant a Tree', description: 'Contribute to reforestation' }
      ],
      'Consistency Mode': [
        { type: 'donate_meal', label: 'Donate a Meal', description: 'Your consistency feeds others' },
        { type: 'blanket_donation', label: 'Donate a Blanket', description: 'Provide warmth to someone' }
      ],
      'Identity Lock': [
        { type: 'plant_tree', label: 'Plant a Tree', description: 'Grow with your skincare journey' },
        { type: 'blanket_donation', label: 'Donate a Blanket', description: 'Share your comfort' }
      ],
      'Ritual Master': [
        { type: 'donate_meal', label: 'Donate a Meal', description: 'Celebrate with generosity' },
        { type: 'plant_tree', label: 'Plant a Tree', description: 'Mark your achievement' },
        { type: 'blanket_donation', label: 'Donate a Blanket', description: 'Master of comfort' }
      ]
    };
    return gestures[milestoneName] || gestures['Proof Builder'];
  };

  const gestures = getGestureOptions(milestone.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {milestone.name} Unlocked!
          </h2>

          <p className="text-gray-600 mb-6">
            {milestone.message}
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-semibold text-purple-900">
                Pass Your Progress Forward
              </span>
            </div>
            <p className="text-xs text-purple-700">
              You showed up for yourself. Want to pass that forward?
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700 text-center">
              Choose a real-world gesture:
            </p>
            
            {gestures.map((gesture) => (
              <button
                key={gesture.type}
                onClick={() => onCompleteGesture(gesture.type, milestone.name)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{gesture.label}</div>
                <div className="text-sm text-gray-500">{gesture.description}</div>
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneCelebration;
