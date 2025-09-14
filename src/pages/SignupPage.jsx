// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const SignupPage = () => {
  // The form logic is the same as the old Signup.jsx
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // On successful signup, the onAuthStateChanged in App.jsx will handle the redirect
    } catch (error) {
      console.error("Error creating account:", error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Create Your Account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email and Password inputs are the same as before */}
        <div>
            <label className="mb-1 font-semibold text-gray-600">Email:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
            <label className="mb-1 font-semibold text-gray-600">Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">Sign Up</button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-green-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;