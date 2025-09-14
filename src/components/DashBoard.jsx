// src/components/Dashboard.jsx
import React from 'react';
// 1. Remove the CSS module import
// import styles from './Dashboard.module.css'; 
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

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
    // 2. Apply Tailwind classes directly in the JSX
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl text-center">
      <h2 className="text-3xl font-bold text-green-600 mb-4">
        Welcome, {user.email}!
      </h2>
      <p className="text-gray-700 mb-8">
        You have successfully logged into FitBuddy.
      </p>
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