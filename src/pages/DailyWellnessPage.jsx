import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// Import the new, smaller components
import DateNavigator from '../components/wellness/DateNavigator';
import CoreTrackers from '../components/wellness/CoreTrackers';
import MoodTracker from '../components/wellness/MoodTracker';
import DailyJournal from '../components/wellness/DailyJournal';

const DEFAULT_GOALS = {
  waterIntake: { label: 'Water Intake', target: 8, unit: 'glasses', increment: 1 },
  activityMinutes: { label: 'Activity', target: 30, unit: 'minutes', increment: 15 },
  sleepHours: { label: 'Sleep', target: 8, unit: 'hours', increment: 0.5 },
  mindfulnessMinutes: { label: 'Mindfulness', target: 10, unit: 'minutes', increment: 5 },
  screenTimeHours: { label: 'Screen Time', target: 2, unit: 'hours', increment: 0.5 },
};

const DailyWellnessPage = () => {
  // All state and logic is managed in this top-level component
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

  // Effect for fetching custom goals
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

  // Effect for fetching daily progress
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
  
  // --- LOGIC RESTORED ---
  const updateProgress = async (field, value) => {
    const newValue = typeof value === 'string' ? value : Math.max(0, value);
    setProgress(prev => ({ ...prev, [field]: newValue }));
    const docRef = doc(db, "users", user.uid, "dailyProgress", formattedDate);
    await setDoc(docRef, { [field]: newValue, timestamp: serverTimestamp() }, { merge: true });
  };
  
  const handleSaveGoals = async () => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        await updateDoc(userDocRef, { goalTargets });
        setIsEditingGoals(false);
      } catch (error) {
        console.error("Error updating goals:", error);
      }
    }
  };

  const changeDay = (amount) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + amount);
      return newDate;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-green-600 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
        
        <DateNavigator selectedDate={selectedDate} changeDay={changeDay} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CoreTrackers 
            progress={progress}
            goalTargets={goalTargets}
            setGoalTargets={setGoalTargets}
            updateProgress={updateProgress}
            isEditingGoals={isEditingGoals}
            setIsEditingGoals={setIsEditingGoals}
            handleSaveGoals={handleSaveGoals}
            DEFAULT_GOALS={DEFAULT_GOALS}
          />

          <div className="space-y-8">
            <MoodTracker 
              currentMood={progress.mood} 
              updateProgress={updateProgress} 
            />
            <DailyJournal 
              journalText={progress.journal}
              updateProgress={updateProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyWellnessPage;