// src/pages/WeeklySummaryPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- 1. ADDED THIS CONSTANT ---
const DEFAULT_GOALS = {
  waterIntake: { label: 'Water Intake', target: 8 },
  activityMinutes: { label: 'Activity', target: 30 },
  sleepHours: { label: 'Sleep', target: 8 },
  mindfulnessMinutes: { label: 'Mindfulness', target: 10 },
  screenTimeHours: { label: 'Screen Time', target: 2 },
};

// --- 2. FULL SPINNER COMPONENT ---
const Spinner = () => (
  <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// --- 3. FULL STATCARD COMPONENT ---
const StatCard = ({ title, value, icon, unit }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">
        {value}
        {unit && <span className="text-lg font-normal ml-1">{unit}</span>}
      </p>
    </div>
  </div>
);

const WeeklySummaryPage = () => {
  const [goalTargets, setGoalTargets] = useState(DEFAULT_GOALS);
  const [weekProgress, setWeekProgress] = useState([]);
  const [bmiHistory, setBmiHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    
    const goalRef = doc(db, "users", user.uid);
    const unsubGoals = onSnapshot(goalRef, (docSnap) => {
      const savedGoals = docSnap.data()?.goalTargets;
      if (savedGoals) {
        setGoalTargets(prevDefaults => ({ ...prevDefaults, ...savedGoals }));
      } else {
        setGoalTargets(DEFAULT_GOALS);
      }
    });

    const today = new Date();
    const sevenDaysAgo = new Date(new Date().setDate(today.getDate() - 7));
    const progressRef = collection(db, "users", user.uid, "dailyProgress");
    const qProgress = query(progressRef, where("timestamp", ">=", sevenDaysAgo));
    
    const bmiRef = collection(db, "users", user.uid, "bmiHistory");
    const qBmi = query(bmiRef, orderBy("timestamp", "desc"), where("timestamp", ">=", sevenDaysAgo));

    Promise.all([
      getDocs(qProgress),
      getDocs(qBmi)
    ]).then(([progressSnap, bmiSnap]) => {
      const progressData = progressSnap.docs.map(d => d.data());
      const bmiData = bmiSnap.docs.map(d => d.data());
      
      setWeekProgress(progressData);
      setBmiHistory(bmiData.reverse());
      setLoading(false);
    });

    return () => unsubGoals();
  }, [user]);

  const summaryData = useMemo(() => {
    if (weekProgress.length === 0) {
      return null;
    }
    
    let totalGoalsMet = 0;
    let totalActivity = 0;
    let totalSleep = 0;
    let totalWater = 0;
    let journalEntries = 0;
    const moodCounts = {};
    const goalAdherence = {
      waterIntake: 0,
      activityMinutes: 0,
      sleepHours: 0,
      mindfulnessMinutes: 0,
      screenTimeHours: 0,
    };

    weekProgress.forEach(day => {
      if (day.waterIntake >= (goalTargets.waterIntake?.target || 0)) goalAdherence.waterIntake++;
      if (day.activityMinutes >= (goalTargets.activityMinutes?.target || 0)) goalAdherence.activityMinutes++;
      if (day.sleepHours >= (goalTargets.sleepHours?.target || 0)) goalAdherence.sleepHours++;
      if (day.mindfulnessMinutes >= (goalTargets.mindfulnessMinutes?.target || 0)) goalAdherence.mindfulnessMinutes++;
      if (day.screenTimeHours <= (goalTargets.screenTimeHours?.target || 0)) goalAdherence.screenTimeHours++;
      
      totalActivity += day.activityMinutes || 0;
      totalSleep += day.sleepHours || 0;
      totalWater += day.waterIntake || 0;
      if (day.journal) journalEntries++;
      if (day.mood) moodCounts[day.mood] = (moodCounts[day.mood] || 0) + 1;
    });
    
    totalGoalsMet = Object.values(goalAdherence).reduce((a, b) => a + b, 0);
    
    const dominantMood = Object.keys(moodCounts).length > 0
      ? Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
      : null;
      
    const moodChartData = Object.entries(moodCounts).map(([name, value]) => ({ name, value }));
    
    return {
      totalGoalsMet,
      avgActivity: (totalActivity / Math.max(weekProgress.length, 1)).toFixed(0),
      avgSleep: (totalSleep / Math.max(weekProgress.length, 1)).toFixed(1),
      avgWater: (totalWater / Math.max(weekProgress.length, 1)).toFixed(1),
      journalEntries,
      dominantMood,
      moodChartData,
      goalAdherence,
    };
  }, [weekProgress, goalTargets]);

  const bmiChartData = useMemo(() => {
    return bmiHistory.map(entry => ({
      date: entry.timestamp?.toDate().toLocaleDateString() || 'N/A',
      bmi: entry.bmi
    }));
  }, [bmiHistory]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (!summaryData) {
    return (
      <div className="text-center p-10 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Not Enough Data Yet</h2>
        <p className="mb-6">Start tracking your daily habits in the "Daily Wellness Tracker" to see your weekly summary here!</p>
        <Link to="/wellness-tracker" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
          Start Tracking
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
        <div className="text-left mb-10">
          <h1 className="text-4xl font-bold text-gray-800">Your Weekly Summary</h1>
          <p className="text-lg text-gray-600">Here's how you did over the past 7 days. Keep it up!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Goals Met" value={summaryData.totalGoalsMet} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Avg. Activity" value={summaryData.avgActivity} unit="mins" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
          <StatCard title="Avg. Sleep" value={summaryData.avgSleep} unit="hrs" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Goal Consistency</h3>
            <div className="space-y-4">
              {Object.keys(DEFAULT_GOALS).map(key => { // Use DEFAULT_GOALS to ensure all are rendered
                const goal = DEFAULT_GOALS[key];
                const achieved = summaryData.goalAdherence[key] || 0;
                const percentage = (achieved / 7) * 100;
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700">{goal.label}</span>
                      <span className="text-sm font-medium text-gray-500">{achieved} of 7 days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Mood Report</h3>
              {summaryData.dominantMood ? (
                <div className="text-center">
                  <p className="text-gray-600">Your dominant mood was:</p>
                  <p className="text-7xl my-2">{summaryData.dominantMood[0]}</p>
                  <p className="font-semibold text-gray-700">Logged {summaryData.dominantMood[1]} time(s)</p>
                </div>
              ) : <p className="text-gray-500">No mood data logged this week.</p>}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Journal Entries</h3>
              <p className="text-5xl font-bold text-green-600">{summaryData.journalEntries}</p>
              <p className="text-gray-600">days logged</p>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Weight & BMI Trend</h3>
            {bmiChartData.length > 1 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bmiChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="bmi" stroke="#4CAF50" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-gray-500">Not enough weight data logged this week to show a trend. Keep tracking!</p>}
          </div>

        </div>
      </div>
    </div>
  );
};

export default WeeklySummaryPage;