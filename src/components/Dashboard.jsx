// src/components/Dashboard.jsx
import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';
import DailyTip from './DailyTip'; // 1. Import the new component

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
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl text-center">
      <h2 className="text-3xl font-bold text-green-600 mb-4">
        Welcome, {user.email}!
      </h2>
      <p className="text-gray-700 mb-8">
        This is your personal health dashboard.
      </p>

      {/* 2. Render the DailyTip component here */}
      <DailyTip />

      <nav className="mb-8 border-t border-b border-gray-200 py-4">
        <Link 
          to="/bmi-calculator" 
          className="text-green-600 font-semibold hover:underline"
        >
          BMI Calculator & Tracker
        </Link>
        {/* We will add more links here later */}
      </nav>

      <button 
        onClick={handleLogout}
        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;