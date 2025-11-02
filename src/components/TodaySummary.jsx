// src/components/TodaySummary.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// A small, reusable component for the progress bars
const GoalProgress = ({ label, icon, current, target }) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="flex items-center gap-2 font-semibold text-gray-700">
          <span>{icon}</span> {label}
        </span>
        <span className="text-sm font-medium text-gray-500">{current} / {target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-green-500 h-2.5 rounded-full" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

// The main summary component
const TodaySummary = () => {
  const [goals, setGoals] = useState(null);
  const [progress, setProgress] = useState(null);
  const user = auth.currentUser;
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch the user's custom goal targets
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsub = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().goalTargets) {
          setGoals(docSnap.data().goalTargets);
        } else {
          // Fallback to defaults if none are set
          setGoals({
            waterIntake: { target: 8 },
            activityMinutes: { target: 30 },
            sleepHours: { target: 8 },
          });
        }
      });
      return () => unsub();
    }
  }, [user]);

  // 2. Fetch today's progress
  useEffect(() => {
    if (user) {
      const progressDocRef = doc(db, "users", user.uid, "dailyProgress", today);
      const unsub = onSnapshot(progressDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProgress(docSnap.data());
        } else {
          setProgress({ waterIntake: 0, activityMinutes: 0, sleepHours: 0 });
        }
      });
      return () => unsub();
    }
  }, [user, today]);

  // 3. Memoize the goal data to prevent re-renders
  const goalData = useMemo(() => {
    if (!goals || !progress) return [];
    return [
      { id: 'water', label: 'Water', icon: '💧', current: progress.waterIntake, target: goals.waterIntake?.target || 8 },
      { id: 'activity', label: 'Activity', icon: '🏃‍♂️', current: progress.activityMinutes, target: goals.activityMinutes?.target || 30 },
      { id: 'sleep', label: 'Sleep', icon: '😴', current: progress.sleepHours, target: goals.sleepHours?.target || 8 },
    ];
  }, [goals, progress]);

  if (!goals || !progress) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="h-40 animate-pulse bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">Today's Summary</h3>
        <Link to="/wellness-tracker" className="text-sm font-semibold text-green-600 hover:underline">
          Go to Tracker &rarr;
        </Link>
      </div>
      <div className="space-y-5">
        {goalData.map(goal => (
          <GoalProgress 
            key={goal.id}
            label={goal.label}
            icon={goal.icon}
            current={goal.current}
            target={goal.target}
          />
        ))}
      </div>
    </div>
  );
};

export default TodaySummary;