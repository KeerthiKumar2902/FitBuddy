// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
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

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');
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
        navigate('/profile');
      }
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="relative flex flex-col m-6 space-y-8 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0">
        
        {/* Left Side: Image and Branding */}
        <div className="relative md:w-1/2 h-96 md:h-auto">
          <img
            src="https://images.pexels.com/photos/4752861/pexels-photo-4752861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
            alt="Man holding a kettlebell in a gym"
            className="w-full h-64 md:h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-start p-10 text-white rounded-l-2xl">
            <h2 className="text-4xl font-extrabold mb-2">FitBuddy</h2>
            <p className="text-lg">Your daily partner in achieving wellness. Welcome back!</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14">
          <h2 className="font-bold text-3xl text-gray-800">Sign In</h2>
          <p className="text-sm font-normal text-gray-600 mb-8">Ready to continue your journey?</p>
          
          {message && <p className="mb-4 text-center text-sm font-medium text-green-600">{message}</p>}
          {error && <p className="mb-4 text-center text-sm font-medium text-red-600">{error}</p>}

          <form onSubmit={handleEmailLogin} className="space-y-4">
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-md placeholder:font-light focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-end text-sm">
              <button type="button" onClick={handlePasswordReset} className="font-medium text-green-600 hover:text-green-500">
                Forgot your password?
              </button>
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">
              Sign in
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or</span></div>
          </div>

          <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center gap-3 py-3 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50">
            <svg className="w-6 h-6" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.6 9 3.6l6.8-6.8C35.9 2.5 30.5 0 24 0 14.9 0 7.3 5.4 3 13.2l8.4 6.5C13.2 13.5 18.2 9.5 24 9.5z"></path><path fill="#34A853" d="M46.4 24.5c0-1.6-.1-3.1-.4-4.6H24v8.9h12.6c-.5 2.9-2.2 5.4-4.7 7.1l7.3 5.7c4.2-3.9 6.6-9.6 6.6-16.1z"></path><path fill="#FBBC05" d="M11.4 28.2c-.4-1.2-.6-2.5-.6-3.8s.2-2.6.6-3.8l-8.4-6.5C1.1 18.1 0 21 0 24.4c0 3.4 1.1 6.3 3 8.8l8.4-5z"></path><path fill="#EA4335" d="M24 48.8c6.5 0 11.9-2.1 15.9-5.7l-7.3-5.7c-2.1 1.4-4.8 2.3-7.6 2.3-5.8 0-10.8-4-12.6-9.7l-8.4 6.5C7.3 43.4 14.9 48.8 24 48.8z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
            <span className="font-semibold text-gray-600">Sign in with Google</span>
          </button>
          
          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
