import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// --- VISUAL CONSTANTS ---
const METRICS_CONFIG = {
  steps: { label: 'Steps', unit: '', color: 'bg-emerald-500', bg: 'bg-emerald-100', icon: '👣' },
  activeMinutes: { label: 'Active', unit: 'min', color: 'bg-orange-500', bg: 'bg-orange-100', icon: '⚡' },
  calories: { label: 'Cals', unit: 'kcal', color: 'bg-red-500', bg: 'bg-red-100', icon: '🔥' },
  sleepHours: { label: 'Sleep', unit: 'hr', color: 'bg-indigo-500', bg: 'bg-indigo-100', icon: '😴' },
  waterIntake: { label: 'Water', unit: 'gls', color: 'bg-blue-500', bg: 'bg-blue-100', icon: '💧' },
};

// Reusable Mini Card Component
const MetricItem = ({ type, current, target }) => {
  const config = METRICS_CONFIG[type] || METRICS_CONFIG.steps;
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <span className="text-sm font-semibold text-gray-600">{config.label}</span>
        </div>
        <div className="text-xs font-bold text-gray-800">
          {current} <span className="text-gray-400 font-normal">/ {target} {config.unit}</span>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className={`w-full h-2 rounded-full ${config.bg}`}>
        <div 
          className={`h-2 rounded-full ${config.color} transition-all duration-500 ease-out shadow-sm`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const TodaySummary = () => {
  const [goals, setGoals] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;

    // 1. Listen to Goals
    const unsubGoals = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      const data = docSnap.data();
      setGoals(data?.goalTargets || {}); 
    });

    // 2. Listen to Today's Progress
    const unsubProgress = onSnapshot(doc(db, "users", user.uid, "dailyProgress", today), (docSnap) => {
      setProgress(docSnap.exists() ? docSnap.data() : {});
      setLoading(false);
    });

    return () => {
      unsubGoals();
      unsubProgress();
    };
  }, [user, today]);

  // Safe Accessor Helper
  const getValue = (data, key) => data?.[key] || 0;
  const getTarget = (data, key, fallback) => data?.[key]?.target || fallback;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-64 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Daily Wellness</h3>
          <p className="text-xs text-gray-500 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link 
          to="/wellness-tracker" 
          className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
          title="Go to detailed tracker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>

      {/* Grid of Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        <MetricItem 
          type="steps" 
          current={getValue(progress, 'steps')} 
          target={getTarget(goals, 'steps', 10000)} 
        />
        <MetricItem 
          type="activeMinutes" 
          current={getValue(progress, 'activeMinutes')} 
          target={getTarget(goals, 'activeMinutes', 30)} 
        />
        <MetricItem 
          type="calories" 
          current={getValue(progress, 'calories')} 
          target={getTarget(goals, 'calories', 2500)} 
        />
        <MetricItem 
          type="sleepHours" 
          current={getValue(progress, 'sleepHours')} 
          target={getTarget(goals, 'sleepHours', 8)} 
        />
      </div>

      {/* Footer Habit Snapshot */}
      <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
        <span>Hydration: <b className="text-blue-500">{getValue(progress, 'waterIntake')}</b> / {getTarget(goals, 'waterIntake', 8)} gls</span>
        
        <Link to="/wellness-tracker" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Log Mood & Journal &rarr;
        </Link>
      </div>

    </div>
  );
};

export default TodaySummary;