// src/pages/SignupPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 1. --- Re-using the robust Google Sign-In logic ---
  const handleGoogleSignIn = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName || 'New User',
          email: user.email,
          createdAt: serverTimestamp(),
          age: '', gender: '', height: '', weight: '', activityLevel: ''
        });
        navigate('/profile'); // Send new user to complete profile
      } else {
        navigate('/'); // Existing user goes to dashboard
      }
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  // 2. --- Upgraded handleSubmit with validation and Firestore doc creation ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear previous errors

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create their profile document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: email.split('@')[0], // Use email prefix as a default name
        email: user.email,
        createdAt: serverTimestamp(),
        age: '',
        gender: 'female',
        height: '',
        weight: '',
        activityLevel: 'sedentary',
        photoURL: '',
      });

      // Send the new user to their profile page to complete it
      navigate('/profile');

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Must be at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    // 3. --- NEW: Modern Split-Screen Layout ---
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="relative flex flex-col w-full max-w-4xl bg-white shadow-2xl rounded-2xl md:flex-row">
        
        {/* Left Side: Image and Branding */}
        <div className="relative md:w-1/2">
          <img
            src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Person doing a push-up"
            className="w-full h-64 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-10 text-white rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
            <h2 className="text-4xl font-extrabold mb-2">FitBuddy</h2>
            <p className="text-lg">Your new wellness journey starts here. Let's get going.</p>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14">
          <h2 className="font-bold text-3xl text-gray-800">Create Account</h2>
          <p className="text-sm font-normal text-gray-600 mb-8">Join us and start tracking your goals today.</p>
          
          {error && <p className="mb-4 text-center text-sm font-medium text-red-600">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              placeholder="Password (6+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
              Sign Up
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
          </div>

          <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center gap-3 py-3 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.9 0 7.3 5.4 3 13.2l8.4 6.5C13.2 13.5 18.2 9.5 24 9.5z"></path><path fill="#34A853" d="M46.4 24.5c0-1.6-.1-3.1-.4-4.6H24v8.9h12.6c-.5 2.9-2.2 5.4-4.7 7.1l7.3 5.7c4.2-3.9 6.6-9.6 6.6-16.1z"></path><path fill="#FBBC05" d="M11.4 28.2c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8l-8.4-6.5C1.1 18.1 0 21 0 24.4c0 3.4 1.1 6.3 3 8.8l8.4-5z"></path><path fill="#EA4335" d="M24 48.8c6.5 0 11.9-2.1 15.9-5.7l-7.3-5.7c-2.1 1.4-4.8 2.3-7.6 2.3-5.8 0-10.8-4-12.6-9.7l-8.4 6.5C7.3 43.4 14.9 48.8 24 48.8z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            <span className="font-semibold text-gray-600">Sign up with Google</span>
          </button>
          
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;