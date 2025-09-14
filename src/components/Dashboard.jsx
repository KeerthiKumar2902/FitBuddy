// src/components/Dashboard.jsx
import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import DailyTip from './DailyTip';

const Dashboard = ({ user }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    // Main container for the dashboard page with a subtle background
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            Welcome, {user.email}!
          </h2>
          <p className="text-lg text-gray-700">
            Here's your wellness snapshot for today, Sunday, September 14th.
          </p>
        </div>

        {/* Since we only have one widget now, we'll center it */}
        <div className="max-w-lg mx-auto">
          <DailyTip />
        </div>

        {/* Footer Section for Navigation and Logout */}
        <div className="mt-12 text-center">
          {/* The <nav> section now includes the link to the new page */}
          <nav className="mb-8 border-t border-b border-gray-200 py-4 flex justify-center items-center gap-x-8">
            <Link 
              to="/wellness-tracker" 
              className="text-lg text-green-600 font-semibold hover:underline"
            >
              Daily Wellness Tracker
            </Link>
            <Link 
              to="/bmi-calculator" 
              className="text-lg text-green-600 font-semibold hover:underline"
            >
              BMI Calculator & Tracker
            </Link>
          </nav>

          <button 
            onClick={handleLogout}
            className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;