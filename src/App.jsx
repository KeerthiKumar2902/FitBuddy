import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// --- PAGES ---
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './components/Dashboard';
import BMICalculatorPage from './pages/BMICalculatorPage';
import DailyWellnessPage from './pages/DailyWellnessPage';
import WeeklyMealPlannerPage from './pages/WeeklyMealPlannerPage';
import ProfilePage from './pages/ProfilePage';
import NutritionHubPage from './pages/NutritionHubPage';
import WeeklySummaryPage from './pages/WeeklySummaryPage';
import FitbitCallbackPage from './pages/FitbitCallbackPage';

// --- NEW MODULAR EXERCISE PLANNER ---
// We removed 'ExercisePlansPage' and replaced it with these:
import PlansDashboard from './pages/ExercisePlanner/PlansDashboard';
import PlanEditor from './pages/ExercisePlanner/PlanEditor';
import PlanViewer from './pages/ExercisePlanner/PlanViewer';
import ActiveWorkout from './pages/ExercisePlanner/ActiveWorkout';
import WorkoutHistoryPage from './pages/WorkoutHistoryPage';

const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute user={user}><Dashboard user={user} /></ProtectedRoute>} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
      
      {/* Feature Routes */}
      <Route path="/profile" element={<ProtectedRoute user={user}><ProfilePage /></ProtectedRoute>} />
      <Route path="/bmi-calculator" element={ <ProtectedRoute user={user}><BMICalculatorPage user={user} /></ProtectedRoute> } />
      <Route path="/wellness-tracker" element={ <ProtectedRoute user={user}><DailyWellnessPage /></ProtectedRoute> } />
      <Route path="/weekly-planner" element={ <ProtectedRoute user={user}><WeeklyMealPlannerPage /></ProtectedRoute> } />
      <Route path="/nutrition-hub" element={ <ProtectedRoute user={user}><NutritionHubPage /></ProtectedRoute> } />
      <Route path="/weekly-summary" element={ <ProtectedRoute user={user}><WeeklySummaryPage /></ProtectedRoute> } />
      <Route path="/callback" element={ <ProtectedRoute user={user}><FitbitCallbackPage /></ProtectedRoute> } />

      {/* --- NEW EXERCISE PLANNER ROUTES --- */}
      {/* This Dashboard replaces the old ExercisePlansPage */}
      <Route path="/exercise-plans" element={<ProtectedRoute user={user}><PlansDashboard /></ProtectedRoute>} />
      
      {/* Create & Edit Routes */}
      <Route path="/exercise-plans/create" element={<ProtectedRoute user={user}><PlanEditor /></ProtectedRoute>} />
      <Route path="/exercise-plans/:id/edit" element={<ProtectedRoute user={user}><PlanEditor /></ProtectedRoute>} />
      
      {/* View & Active Workout Routes */}
      <Route path="/exercise-plans/:id" element={<ProtectedRoute user={user}><PlanViewer /></ProtectedRoute>} />
      <Route path="/exercise-plans/:id/active" element={<ProtectedRoute user={user}><ActiveWorkout /></ProtectedRoute>} />
      <Route path="/workout-history" element={<ProtectedRoute user={user}><WorkoutHistoryPage /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;