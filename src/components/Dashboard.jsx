// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import DailyTip from './DailyTip';
import TodaySummary from './TodaySummary';

// A reusable component for the feature cards (unchanged)
const FeatureCard = ({ to, title, description, icon }) => (
  <Link to={to} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
    <div className="flex-shrink-0 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 flex-grow">{description}</p>
    <div className="mt-4 text-right font-semibold text-green-600">
      Go &rarr;
    </div>
  </Link>
);

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({ photoURL: null, name: user.email });

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  const firstName = profileData.name ? profileData.name.split(' ')[0] : (user.email.split('@')[0]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* --- 1. NAVBAR --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* --- 2. THIS IS THE UPDATED LOGO --- */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                {/* Image placed from your /public folder */}
                <img 
                  className="h-8 w-auto" 
                  src="/fitbuddy-transparent.png" 
                  alt="FitBuddy Logo" 
                />
              </Link>
            </div>
            
            {/* --- Right Side Layout (Unchanged) --- */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-700 hidden lg:block">
                {firstName}
              </span>
              
              {profileData.photoURL ? (
                <img src={profileData.photoURL} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                </div>
              )}

              <Link to="/profile" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span className="font-medium hidden sm:block">My Profile</span>
              </Link>
              
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-600 hover:text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="font-medium hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Page Content (Unchanged) --- */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              {getGreeting()}, {firstName}!
            </h2>
            <p className="text-lg text-gray-600">
              Here is your wellness dashboard for today.
            </p>
          </div>

          {/* New 3-Column Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2">
              <TodaySummary />
            </div>
            <div className="lg:col-span-1">
              <DailyTip />
            </div>
          </div>

          {/* Grid of Feature Cards (All your links) */}
          <h3 className="text-2xl font-bold text-gray-800 mb-4">All Your Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              to="/wellness-tracker"
              title="Daily Wellness Tracker"
              description="Log your daily water, activity, sleep, mood, and journal entries."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
            />
            <FeatureCard 
              to="/bmi-calculator"
              title="BMI Calculator & Tracker"
              description="Calculate your BMI, see your progress over time, and get helpful insights."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            />
            <FeatureCard 
              to="/weekly-planner"
              title="Weekly Meal Planner"
              description="Generate a smart, personalized 7-day meal plan based on your goals."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <FeatureCard 
              to="/exercise-plans"
              title="Exercise Plans"
              description="Discover workout plans tailored to your fitness level and BMI category."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-9.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>}
            />
            <FeatureCard 
              to="/nutrition-hub"
              title="Nutrition Hub"
              description="Look up nutritional information for fruits, vegetables, pulses, and more."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.477zM11.428 2.572a2 2 0 00-1.022.547l-2.387.477a6 6 0 00-3.86-.517l-.318-.158a6 6 0 01-3.86-.517L.05 5.21a2 2 0 00-1.806-.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.477z" /></svg>}
            />
            <FeatureCard 
              to="/weekly-summary"
              title="Weekly Progress Summary"
              description="See a full report of your past week's habits, trends, and achievements."
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h11a2 2 0 012 2v11a2 2 0 01-2 2z" /></svg>}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;