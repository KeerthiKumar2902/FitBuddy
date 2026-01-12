import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { getFitbitAuthUrl, fetchFitbitDataForDate, refreshFitbitToken } from '../services/fitbitService';

// Import Components
import DateNavigator from '../components/wellness/DateNavigator';
import CoreTrackers from '../components/wellness/CoreTrackers';
import MoodTracker from '../components/wellness/MoodTracker';
import DailyJournal from '../components/wellness/DailyJournal';
import SyncHeader from '../components/wellness/SyncHeader';
import ActivityRings from '../components/wellness/ActivityRings';
import SleepStagesCard from '../components/wellness/SleepStagesCard';
import HeartRateCard from '../components/wellness/HeartRateCard';

const BIO_GOALS = {
  steps: { label: 'Steps', target: 10000, unit: 'steps', increment: 500 },
  calories: { label: 'Calories', target: 2500, unit: 'kcal', increment: 50 },
  activeMinutes: { label: 'Active Mins', target: 30, unit: 'mins', increment: 10 },
  sleepHours: { label: 'Sleep', target: 8, unit: 'hrs', increment: 0.5 },
};

const HABIT_GOALS = {
  waterIntake: { label: 'Water', target: 8, unit: 'glasses', increment: 1 },
  mindfulnessMinutes: { label: 'Mindfulness', target: 10, unit: 'minutes', increment: 5 },
  screenTimeHours: { label: 'Screen Time', target: 2, unit: 'hours', increment: 0.5 },
};

const DEFAULT_GOALS = { ...BIO_GOALS, ...HABIT_GOALS };

const DailyWellnessPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFitbitConnected, setIsFitbitConnected] = useState(false);

  // State
  const [progress, setProgress] = useState({
    steps: 0, stepsSource: 'manual',
    calories: 0, caloriesSource: 'manual',
    activeMinutes: 0, activeSource: 'manual',
    sleepHours: 0, sleepSource: 'manual',
    sleepStages: { deep: 0, light: 0, rem: 0, awake: 0 },
    restingHeartRate: 0, heartRateSource: 'manual',
    distanceKm: 0, elevation: 0, sedentaryMinutes: 0, lightlyActiveMinutes: 0, fairlyActiveMinutes: 0, veryActiveMinutes: 0,
    waterIntake: 0, mindfulnessMinutes: 0, screenTimeHours: 0,
    mood: '', journal: '',
    syncStatus: { lastSynced: null }
  });

  const [goalTargets, setGoalTargets] = useState(DEFAULT_GOALS);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null);

  const formattedDate = selectedDate.toISOString().split('T')[0];
  const user = auth.currentUser;

  // 1. Check Fitbit
  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid, 'private', 'fitbit_tokens')).then(snap => {
        if (snap.exists()) setIsFitbitConnected(true);
      });
    }
  }, [user]);

  // 2. Fetch Goals
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

  // 3. Fetch Progress
  useEffect(() => {
    if (user) {
      setLoading(true);
      const unsub = onSnapshot(doc(db, "users", user.uid, "dailyProgress", formattedDate), (docSnap) => {
        const initialProgress = {
          steps: 0, calories: 0, activeMinutes: 0, 
          sleepHours: 0, sleepStages: { deep: 0, light: 0, rem: 0, awake: 0 },
          restingHeartRate: 0,
          distanceKm: 0, elevation: 0, sedentaryMinutes: 0, lightlyActiveMinutes: 0, fairlyActiveMinutes: 0, veryActiveMinutes: 0,
          waterIntake: 0, mindfulnessMinutes: 0, screenTimeHours: 0,
          mood: '', journal: '',
          syncStatus: { lastSynced: null }
        };
        if (docSnap.exists()) setProgress(prev => ({ ...initialProgress, ...docSnap.data() }));
        else setProgress(initialProgress);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user, formattedDate]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // --- FIXED: Correct Source Keys for Smart Sync ---
  const updateProgress = async (field, value) => {
    const newValue = typeof value === 'string' ? value : Math.max(0, value);
    
    // MAP FIELD NAMES TO THE CORRECT SOURCE KEYS
    let sourceKey = `${field}Source`; 
    if (field === 'sleepHours') sourceKey = 'sleepSource';       // Fixed!
    if (field === 'activeMinutes') sourceKey = 'activeSource';   // Fixed!
    if (field === 'restingHeartRate') sourceKey = 'heartRateSource'; // Fixed!

    setProgress(prev => ({ ...prev, [field]: newValue, [sourceKey]: 'manual' }));
    
    // Alert user about the lock
    showToast(`Updated! ${field} is now locked from sync.`);

    const docRef = doc(db, "users", user.uid, "dailyProgress", formattedDate);
    await setDoc(docRef, { 
      [field]: newValue, 
      [sourceKey]: 'manual', // Use the corrected source key
      timestamp: serverTimestamp() 
    }, { merge: true });
  };
  
  const handleSaveGoals = async () => {
    if (user) {
      await updateDoc(doc(db, "users", user.uid), { goalTargets });
      setIsEditingGoals(false);
      showToast("All goals updated successfully!");
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

  const handleConnectFitbit = () => window.location.href = getFitbitAuthUrl();

  // --- SMART SYNC LOGIC ---
  const performSmartSync = async (datesToSync) => {
    setIsSyncing(true);
    try {
      const tokenRef = doc(db, 'users', user.uid, 'private', 'fitbit_tokens');
      const tokenSnap = await getDoc(tokenRef);

      if (!tokenSnap.exists()) {
        showToast("No Fitbit connection found.");
        setIsFitbitConnected(false);
        setIsSyncing(false);
        return;
      }

      let { accessToken, refreshToken } = tokenSnap.data();

      const processDate = async (token, date) => {
        const fitbitData = await fetchFitbitDataForDate(token, date);
        
        if (fitbitData && fitbitData.activity && fitbitData.sleep) {
          // 1. Check current data for locks
          const dailyRef = doc(db, "users", user.uid, "dailyProgress", date);
          const dailySnap = await getDoc(dailyRef);
          const currentData = dailySnap.exists() ? dailySnap.data() : {};

          const summary = fitbitData.activity.summary;
          const mainSleep = fitbitData.sleep.sleep?.[0];
          
          let sleepStages = { deep: 0, light: 0, rem: 0, awake: 0 };
          if (mainSleep?.levels?.summary) {
            sleepStages = {
              deep: mainSleep.levels.summary.deep?.minutes || 0,
              light: mainSleep.levels.summary.light?.minutes || 0,
              rem: mainSleep.levels.summary.rem?.minutes || 0,
              awake: mainSleep.levels.summary.wake?.minutes || 0
            };
          }

          // 2. Prepare Updates (Respecting Manual Locks)
          const updates = {
            syncStatus: { isConnected: true, lastSynced: new Date().toISOString() },
            timestamp: serverTimestamp()
          };

          if (currentData.stepsSource !== 'manual') {
            updates.steps = summary.steps || 0;
            updates.stepsSource = 'fitbit';
            updates.distanceKm = summary.distances?.find(d => d.activity === 'total')?.distance || 0;
            updates.elevation = summary.elevation || 0;
            updates.sedentaryMinutes = summary.sedentaryMinutes || 0;
            updates.lightlyActiveMinutes = summary.lightlyActiveMinutes || 0;
          }

          if (currentData.caloriesSource !== 'manual') {
            updates.calories = summary.caloriesOut || 0;
            updates.caloriesSource = 'fitbit';
          }

          if (currentData.activeSource !== 'manual') {
            updates.activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);
            updates.activeSource = 'fitbit';
          }

          if (currentData.sleepSource !== 'manual') {
            updates.sleepHours = mainSleep ? (mainSleep.duration / (1000 * 60 * 60)).toFixed(1) : 0;
            updates.sleepStages = sleepStages;
            updates.sleepSource = 'fitbit';
          }

          if (currentData.heartRateSource !== 'manual') {
            updates.restingHeartRate = fitbitData.heart?.['activities-heart']?.[0]?.value?.restingHeartRate || 0;
            updates.heartRateSource = 'fitbit';
          }

          await setDoc(dailyRef, updates, { merge: true });
          console.log(`Synced data for ${date}`);
        }
      };

      for (const date of datesToSync) {
        try {
          await processDate(accessToken, date);
        } catch (error) {
          if (error.message.includes('401') || error.status === 401) {
            try {
              const newTokens = await refreshFitbitToken(refreshToken);
              await setDoc(tokenRef, {
                accessToken: newTokens.access_token,
                refreshToken: newTokens.refresh_token,
                expiresIn: newTokens.expires_in,
                updatedAt: serverTimestamp()
              }, { merge: true });
              
              accessToken = newTokens.access_token;
              refreshToken = newTokens.refresh_token;
              await processDate(accessToken, date);
            } catch (refreshError) {
              showToast("Connection expired. Please reconnect.");
              setIsFitbitConnected(false);
              return; 
            }
          }
        }
      }
      showToast("Sync complete!");
    } catch (error) {
      console.error("Sync Error:", error);
      showToast("Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncCurrentView = () => performSmartSync([selectedDate.toISOString().split('T')[0]]);
  const handleSyncHistory = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    performSmartSync(dates);
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

        <div className="flex justify-between items-center mb-6">
            <Link to="/" className="text-green-600 hover:underline font-medium">&larr; Back to Dashboard</Link>
            
            <div className="flex gap-2">
                {isEditingGoals ? (
                    <>
                        <button onClick={handleSaveGoals} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-lg shadow hover:bg-green-700 transition-all">Save Goals</button>
                        <button onClick={() => setIsEditingGoals(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-300 transition-all">Cancel</button>
                    </>
                ) : (
                    <button onClick={() => setIsEditingGoals(true)} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 text-sm font-bold rounded-lg border border-gray-200 hover:bg-gray-50 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        Edit Goals
                    </button>
                )}
            </div>
        </div>
        
        <DateNavigator selectedDate={selectedDate} changeDay={changeDay} />

        <SyncHeader 
          isConnected={isFitbitConnected} 
          lastSynced={progress.syncStatus?.lastSynced ? new Date(progress.syncStatus.lastSynced).toLocaleTimeString() : null}
          onConnect={handleConnectFitbit}
          onSyncCurrentView={handleSyncCurrentView}
          onSyncHistory={handleSyncHistory}
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
                  isEditingGoals={isEditingGoals}
                  sleepGoal={goalTargets.sleepHours?.target || 8}
                  setGoalTargets={setGoalTargets}
                  onEditValue={() => {
                      const val = prompt("Enter Sleep Hours:", progress.sleepHours);
                      if (val !== null) updateProgress('sleepHours', parseFloat(val) || 0);
                  }}
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