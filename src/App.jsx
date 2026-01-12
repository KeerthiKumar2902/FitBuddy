// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Dashboard from './components/Dashboard';
import BMICalculatorPage from './pages/BMICalculatorPage';
import DailyWellnessPage from './pages/DailyWellnessPage';
import WeeklyMealPlannerPage from './pages/WeeklyMealPlannerPage';
import ProfilePage from './pages/ProfilePage';
import ExercisePlansPage from './pages/ExercisePlansPage';
import NutritionHubPage from './pages/NutritionHubPage';
import WeeklySummaryPage from './pages/WeeklySummaryPage';
import FitbitCallbackPage from './pages/FitbitCallbackPage'; // 1. Import the new page
import PlansDashboard from './pages/ExercisePlanner/PlansDashboard';
import PlanEditor from './pages/ExercisePlanner/PlanEditor';
import PlanViewer from './pages/ExercisePlanner/PlanViewer';

// A custom component to protect routes that require authentication
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    // If no user is logged in, redirect to the login page
    return <Navigate to="/login" replace />;
  }
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bmi-calculator" 
        element={ <ProtectedRoute user={user}><BMICalculatorPage user={user} /></ProtectedRoute> } 
      />
      <Route 
        path="/wellness-tracker" 
        element={ <ProtectedRoute user={user}><DailyWellnessPage /></ProtectedRoute> } 
      />
      <Route 
        path="/weekly-planner" 
        element={ <ProtectedRoute user={user}><WeeklyMealPlannerPage /></ProtectedRoute> } 
      />
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/profile" 
        element={<ProtectedRoute user={user}><ProfilePage /></ProtectedRoute>} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/" replace /> : <SignupPage />} 
      />
      <Route 
        path="/exercise-plans" 
        element={ <ProtectedRoute user={user}><ExercisePlansPage /></ProtectedRoute> } 
      />
      <Route 
        path="/nutrition-hub" 
        element={ <ProtectedRoute user={user}><NutritionHubPage /></ProtectedRoute> } 
      />
      <Route 
        path="/weekly-summary" 
        element={ <ProtectedRoute user={user}><WeeklySummaryPage /></ProtectedRoute> } 
      />
      {/* 2. Add the route for the Fitbit Callback */}
      <Route 
        path="/callback" 
        element={ <ProtectedRoute user={user}><FitbitCallbackPage /></ProtectedRoute> } 
      />
      {/* Exercise Planner Routes */}
      <Route path="/exercise-plans" element={<ProtectedRoute user={user}><PlansDashboard /></ProtectedRoute>} />
      <Route path="/exercise-plans/create" element={<ProtectedRoute user={user}><PlanEditor /></ProtectedRoute>} />
      <Route path="/exercise-plans/:id/edit" element={<ProtectedRoute user={user}><PlanEditor /></ProtectedRoute>} />
      <Route path="/exercise-plans/:id" element={<ProtectedRoute user={user}><PlanViewer /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;