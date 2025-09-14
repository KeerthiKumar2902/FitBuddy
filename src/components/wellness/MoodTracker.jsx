import React from 'react';

const MOODS = ['😊', '🙂', '😐', '😔', '😫'];

const MoodTracker = ({ currentMood, updateProgress }) => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">How are you feeling?</h3>
      <div className="flex justify-around">
        {MOODS.map(mood => (
          <button 
            key={mood} 
            onClick={() => updateProgress('mood', mood)} 
            className={`text-4xl p-2 rounded-full transition-transform duration-200 ${currentMood === mood ? 'bg-green-100 scale-125' : 'hover:scale-110'}`}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodTracker;
