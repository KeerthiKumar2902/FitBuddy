// src/components/Dashboard.jsx
import React from 'react';
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
    <div>
      <h2>Welcome, {user.email}!</h2>
      <p>You have successfully logged into FitBuddy.</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;