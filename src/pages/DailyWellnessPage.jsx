// src/pages/DailyWellnessPage.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// Default goals for new users or if none are set
const DEFAULT_GOALS = {
  waterIntake: { label: 'Water Intake', target: 8, unit: 'glasses' },
  activityMinutes: { label: 'Activity', target: 30, unit: 'minutes' },
  sleepHours: { label: 'Sleep', target: 8, unit: 'hours' },
  mindfulnessMinutes: { label: 'Mindfulness', target: 10, unit: 'minutes' },
  screenTimeHours: { label: 'Screen Time', target: 2, unit: 'hours' },
};
const MOODS = ['😊', '🙂', '😐', '😔', '😫'];

const DailyWellnessPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [progress, setProgress] = useState({
    waterIntake: 0, activityMinutes: 0, sleepHours: 0, 
    mindfulnessMinutes: 0, screenTimeHours: 0,
    mood: '', journal: '',
  });

  const [goalTargets, setGoalTargets] = useState(DEFAULT_GOALS);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  
  const formattedDate = selectedDate.toISOString().split('T')[0];
  const user = auth.currentUser;

  // Effect to fetch custom goals
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().goalTargets) {
          setGoalTargets(prev => ({ ...DEFAULT_GOALS, ...docSnap.data().goalTargets }));
        } else {
          setGoalTargets(DEFAULT_GOALS);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);
  
  // Effect to fetch daily progress
  useEffect(() => {
    if (user) {
      const docRef = doc(db, "users", user.uid, "dailyProgress", formattedDate);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        const initialProgress = {
          waterIntake: 0, activityMinutes: 0, sleepHours: 0,
          mindfulnessMinutes: 0, screenTimeHours: 0,
          mood: '', journal: '',
        };
        if (docSnap.exists()) {
          setProgress({ ...initialProgress, ...docSnap.data() });
        } else {
          setProgress(initialProgress);
        }
      });
      return () => unsubscribe();
    }
  }, [user, formattedDate]);

  const updateProgress = async (field, value) => {
    setProgress(prev => ({ ...prev, [field]: value }));
    const docRef = doc(db, "users", user.uid, "dailyProgress", formattedDate);
    await setDoc(docRef, { [field]: value, timestamp: serverTimestamp() }, { merge: true });
  };
  
  const handleSaveGoals = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, { goalTargets });
        setIsEditingGoals(false);
        console.log("Goals updated successfully!");
      } catch (error) {
        console.error("Error updating goals:", error);
      }
    }
  };

  const changeDay = (amount) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + amount);
    setSelectedDate(newDate);
  };

  const completedGoals = Object.keys(goalTargets).filter(key => progress[key] >= goalTargets[key].target).length;
  const totalGoals = Object.keys(goalTargets).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
        
        {/* Date Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => changeDay(-1)} className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100">&larr;</button>
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <button onClick={() => changeDay(1)} disabled={selectedDate.toDateString() === new Date().toDateString()} className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-50">&rarr;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Core Trackers */}
          <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Core Trackers ({completedGoals}/{totalGoals} done)</h3>
              {isEditingGoals ? (
                <div className="flex gap-2">
                  <button onClick={handleSaveGoals} className="px-3 py-1 text-sm font-semibold text-white bg-green-500 rounded-full">Save</button>
                  <button onClick={() => setIsEditingGoals(false)} className="px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingGoals(true)} className="px-3 py-1 text-sm font-semibold text-green-600 bg-green-100 rounded-full">Edit Goals</button>
              )}
            </div>
            {/* Water Tracker */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">💧 Water</span>
              <div className="flex items-center gap-2">
                <button onClick={() => updateProgress('waterIntake', Math.max(0, progress.waterIntake - 1))} className="w-10 h-10 rounded-lg bg-gray-100 text-xl font-bold">-</button>
                <span className="text-lg w-16 text-center">{progress.waterIntake} / 
                  {isEditingGoals ? 
                    <input type="number" value={goalTargets.waterIntake.target} onChange={(e) => setGoalTargets({...goalTargets, waterIntake: {...goalTargets.waterIntake, target: parseInt(e.target.value) || 0}})} className="w-10 text-center border rounded-md"/> :
                    goalTargets.waterIntake.target
                  }
                </span>
                <button onClick={() => updateProgress('waterIntake', progress.waterIntake + 1)} className="w-10 h-10 rounded-lg bg-gray-100 text-xl font-bold">+</button>
              </div>
            </div>
            {/* All other trackers are now generated dynamically */}
            {['activityMinutes', 'sleepHours', 'mindfulnessMinutes', 'screenTimeHours'].map(key => {
              const icon = { activityMinutes: '🏃‍♂️', sleepHours: '😴', mindfulnessMinutes: '🧘‍♀️', screenTimeHours: '💻' }[key];
              const currentGoal = goalTargets[key] || DEFAULT_GOALS[key]; // Fallback just in case
              return (
                <div key={key} className="flex items-center justify-between">
                  <label className="font-semibold text-lg" htmlFor={key}>{icon} {currentGoal.label}</label>
                  <div className="flex items-center gap-2">
                    <input id={key} type="number" value={progress[key]} onChange={(e) => updateProgress(key, parseInt(e.target.value) || 0)} className="w-20 px-3 py-2 text-center border rounded-lg"/>
                    {isEditingGoals ? (
                      <input type="number" value={currentGoal.target} onChange={(e) => setGoalTargets({...goalTargets, [key]: {...currentGoal, target: parseInt(e.target.value) || 0}})} className="w-16 text-center border-2 border-green-400 rounded-md"/>
                    ) : (
                      <span className="w-16 text-left text-sm text-gray-500">/ {currentGoal.target} {currentGoal.unit}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* --- THIS SECTION HAS BEEN RESTORED --- */}
          <div className="space-y-8">
            {/* Mood Tracker */}
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">How are you feeling?</h3>
              <div className="flex justify-around">
                {MOODS.map(mood => (
                  <button key={mood} onClick={() => updateProgress('mood', mood)} className={`text-4xl p-2 rounded-full transition-transform duration-200 ${progress.mood === mood ? 'bg-green-100 scale-125' : 'hover:scale-110'}`}>
                    {mood}
                  </button>
                ))}
              </div>
            </div>
            {/* Daily Journal */}
            <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Journal</h3>
              <textarea 
                value={progress.journal}
                onChange={(e) => updateProgress('journal', e.target.value)}
                placeholder="What's on your mind? Any wins today?"
                className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          {/* --- END OF RESTORED SECTION --- */}
        </div>
      </div>
    </div>
  );
};

export default DailyWellnessPage;