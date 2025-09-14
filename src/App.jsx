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
      {/* 2. Add the new route for the BMI calculator */}
      <Route 
        path="/bmi-calculator" 
        element={ <ProtectedRoute user={user}><BMICalculatorPage user={user} /></ProtectedRoute> } 
      />
      {/** Daily Wellness Tracker */}
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
    </Routes>
  );
}

export default App;