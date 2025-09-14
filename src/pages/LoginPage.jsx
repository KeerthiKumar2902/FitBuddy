// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // 2. Initialize useNavigate

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.jsx will handle navigation
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to get a password reset link.");
      setMessage('');
      return;
    }
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent! Check your inbox.");
    } catch (error) {
      setError("Failed to send reset email. Please check the address.");
    }
  };

  // --- 3. THIS IS THE COMPLETE AND CORRECTED FUNCTION ---
  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if this is a new user by looking for their document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        // This is a brand new user, create their profile document
        await setDoc(userDocRef, {
          name: user.displayName || 'New User',
          email: user.email,
          createdAt: serverTimestamp(),
          // Initialize other fields to ensure profile is "incomplete"
          age: '',
          gender: '',
          height: '',
          weight: '',
          activityLevel: ''
        });
        // For a new user, it's good UX to send them to the profile page first
        navigate('/profile');
      } else {
        // For an existing user, onAuthStateChanged will handle navigation to dashboard
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error.message);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {message && <p className="text-center text-sm font-medium text-green-600">{message}</p>}
        {error && <p className="text-center text-sm font-medium text-red-600">{error}</p>}

        <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="text-sm text-right">
            <button
              type="button"
              onClick={handlePasswordReset}
              className="font-medium text-green-600 hover:text-green-500"
            >
              Forgot your password?
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.9 0 7.3 5.4 3 13.2l8.4 6.5C13.2 13.5 18.2 9.5 24 9.5z"></path><path fill="#34A853" d="M46.4 24.5c0-1.6-.1-3.1-.4-4.6H24v8.9h12.6c-.5 2.9-2.2 5.4-4.7 7.1l7.3 5.7c4.2-3.9 6.6-9.6 6.6-16.1z"></path><path fill="#FBBC05" d="M11.4 28.2c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8l-8.4-6.5C1.1 18.1 0 21 0 24.4c0 3.4 1.1 6.3 3 8.8l8.4-5z"></path><path fill="#EA4335" d="M24 48.8c6.5 0 11.9-2.1 15.9-5.7l-7.3-5.7c-2.1 1.4-4.8 2.3-7.6 2.3-5.8 0-10.8-4-12.6-9.7l-8.4 6.5C7.3 43.4 14.9 48.8 24 48.8z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            Sign in with Google
          </button>
        </div>
        
        <p className="mt-2 text-center text-sm text-gray-600">
          Not a member?{' '}
          <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
            Start your journey
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;