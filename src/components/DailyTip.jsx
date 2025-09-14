// src/components/DailyTip.jsx
import React from 'react';
import tips from '../data/tips.json'; // Import the tips data

const DailyTip = () => {
  // This logic calculates the Tip of the Day
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const tipIndex = dayOfYear % tips.length;
  const dailyTip = tips[tipIndex];

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-green-400 to-cyan-500 text-white rounded-2xl shadow-lg">
      <h3 className="text-xl font-bold mb-2">💡 Tip of the Day</h3>
      <p className="text-lg italic">"{dailyTip.tip}"</p>
    </div>
  );
};

export default DailyTip;