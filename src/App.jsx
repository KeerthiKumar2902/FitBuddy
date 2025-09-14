// src/App.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import auth
import { onAuthStateChanged } from 'firebase/auth'; // Import the listener

import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // State to hold the current user
  const [loading, setLoading] = useState(true); // State to handle initial load

  useEffect(() => {
    // onAuthStateChanged returns an "unsubscribe" function
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Set user to the logged-in user, or null if logged out
      setLoading(false); // We've checked for auth, so we can stop loading
    });

    // Cleanup subscription on component unmount
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  // Display a loading message while Firebase checks authentication status
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      {user ? (
        // If a user is logged in, show the Dashboard
        <Dashboard user={user} />
      ) : (
        // If no user is logged in, show Signup and Login forms
        <>
          <Signup />
          <hr />
          <Login />
        </>
      )}
    </div>
  );
}

export default App;