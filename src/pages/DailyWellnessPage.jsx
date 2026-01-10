// src/pages/DailyWellnessPage.jsx
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { getFitbitAuthUrl } from '../services/fitbitService'; // Import the service

// Import Components (Ensure these exist in your components folder)
import DateNavigator from '../components/wellness/DateNavigator';
import CoreTrackers from '../components/wellness/CoreTrackers';
import MoodTracker from '../components/wellness/MoodTracker';
import DailyJournal from '../components/wellness/DailyJournal';
import SyncHeader from '../components/wellness/SyncHeader';
import ActivityRings from '../components/wellness/ActivityRings';
import SleepStagesCard from '../components/wellness/SleepStagesCard';
import HeartRateCard from '../components/wellness/HeartRateCard';
import MetricCard from '../components/wellness/MetricCard';

// Goal Definitions
const BIO_GOALS = {
  steps: { label: 'Steps', target: 10000, unit: 'steps', increment: 500 },
  calories: { label: 'Calories', target: 2500, unit: 'kcal', increment: 50 },
  activeMinutes: { label: 'Active Mins', target: 30, unit: 'mins', increment: 10 },
};

const HABIT_GOALS = {
  waterIntake: { label: 'Water', target: 8, unit: 'glasses', increment: 1 },
  mindfulnessMinutes: { label: 'Mindfulness', target: 10, unit: 'minutes', increment: 5 },
  screenTimeHours: { label: 'Screen Time', target: 2, unit: 'hours', increment: 0.5 },
};

const DEFAULT_GOALS = { ...BIO_GOALS, ...HABIT_GOALS };

const DailyWellnessPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Expanded State
  const [progress, setProgress] = useState({
    steps: 0, stepsSource: 'manual',
    calories: 0, caloriesSource: 'manual',
    activeMinutes: 0, activeSource: 'manual',
    sleepHours: 0, sleepSource: 'manual',
    sleepStages: { deep: 0, light: 0, rem: 0, awake: 0 },
    restingHeartRate: 0, heartRateSource: 'manual',
    waterIntake: 0, mindfulnessMinutes: 0, screenTimeHours: 0,
    mood: '', journal: '',
    syncStatus: { isConnected: false, lastSynced: null }
  });

  const [goalTargets, setGoalTargets] = useState(DEFAULT_GOALS);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const formattedDate = selectedDate.toISOString().split('T')[0];
  const user = auth.currentUser;

  // 1. Fetch Custom Goals
  useEffect(() => {
    if (user) {
      const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
        if (docSnap.exists() && docSnap.data().goalTargets) {
          setGoalTargets(prev => ({ ...DEFAULT_GOALS, ...docSnap.data().goalTargets }));
        } else {
          setGoalTargets(DEFAULT_GOALS);
        }
      });
      return () => unsub();
    }
  }, [user]);

  // 2. Fetch Daily Progress
  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsub = onSnapshot(doc(db, "users", user.uid, "dailyProgress", formattedDate), (docSnap) => {
        const initialProgress = {
          steps: 0, calories: 0, activeMinutes: 0, 
          sleepHours: 0, sleepStages: { deep: 0, light: 0, rem: 0, awake: 0 },
          restingHeartRate: 0,
          waterIntake: 0, mindfulnessMinutes: 0, screenTimeHours: 0,
          mood: '', journal: '',
          syncStatus: { isConnected: false, lastSynced: null }
        };

        if (docSnap.exists()) {
          setProgress(prev => ({ ...initialProgress, ...docSnap.data() }));
        } else {
          setProgress(initialProgress);
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user, formattedDate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const updateProgress = async (field, value) => {
    const newValue = typeof value === 'string' ? value : Math.max(0, value);
    setProgress(prev => ({ ...prev, [field]: newValue, [`${field}Source`]: 'manual' }));
    
    if (progress[`${field}Source`] === 'fitbit') {
      showToast("Manual edit saved. Value locked from sync.");
    }

    const docRef = doc(db, "users", user.uid, "dailyProgress", formattedDate);
    await setDoc(docRef, { 
      [field]: newValue, 
      [`${field}Source`]: 'manual',
      timestamp: serverTimestamp() 
    }, { merge: true });
  };
  
  const handleSaveGoals = async () => {
    if (user) {
      await updateDoc(doc(db, "users", user.uid), { goalTargets });
      setIsEditingGoals(false);
    }
  };

  const changeDay = (amount) => {
    setLoading(true);
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + amount);
      return d;
    });
  };

  // --- CONNECT HANDLER ---
  const handleConnectFitbit = () => {
    // This generates the URL using the service function
    const authUrl = getFitbitAuthUrl();
    // Redirect the user to Fitbit
    window.location.href = authUrl;
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast("Sync logic coming soon!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-bounce">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
            {toast}
          </div>
        )}

        <Link to="/" className="text-green-600 hover:underline mb-6 block font-medium">&larr; Back to Dashboard</Link>
        
        <DateNavigator selectedDate={selectedDate} changeDay={changeDay} />

        <SyncHeader 
          isConnected={progress.syncStatus?.isConnected} 
          lastSynced={progress.syncStatus?.lastSynced}
          onConnect={handleConnectFitbit}
          onSync={handleSyncNow}
          isSyncing={isSyncing}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ActivityRings 
              steps={progress.steps} stepGoal={goalTargets.steps?.target || 10000}
              activeMinutes={progress.activeMinutes} activeGoal={goalTargets.activeMinutes?.target || 30}
              calories={progress.calories} calorieGoal={goalTargets.calories?.target || 2500}
              loading={loading}
              updateProgress={updateProgress}
              isEditingGoals={isEditingGoals}
              setGoalTargets={setGoalTargets}
              goalTargets={goalTargets}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <SleepStagesCard 
                  totalHours={progress.sleepHours} 
                  stages={progress.sleepStages}
                  source={progress.sleepSource}
                  isLoading={loading}
               />
               <HeartRateCard 
                  value={progress.restingHeartRate} 
                  source={progress.heartRateSource}
                  isLoading={loading}
               />
            </div>
            
            <CoreTrackers 
              progress={progress}
              goalTargets={goalTargets}
              setGoalTargets={setGoalTargets}
              updateProgress={updateProgress}
              isEditingGoals={isEditingGoals}
              setIsEditingGoals={setIsEditingGoals}
              handleSaveGoals={handleSaveGoals}
              HABIT_GOALS={HABIT_GOALS} 
            />
          </div>

          <div className="space-y-8">
            <MoodTracker currentMood={progress.mood} updateProgress={updateProgress} />
            <DailyJournal journalText={progress.journal} updateProgress={updateProgress} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyWellnessPage;