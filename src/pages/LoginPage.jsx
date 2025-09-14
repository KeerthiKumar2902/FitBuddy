// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Logic from the old Login.jsx component
  const handleEmailLogin = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully!");
    } catch (error) {
      console.error("Error logging in:", error.message);
    }
  };

  // Logic from the old AuthPage.jsx
  const handleGoogleSignIn = async () => {
    // ... (This function remains exactly the same as before)
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, { name: user.displayName, email: user.email, createdAt: serverTimestamp() });
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Login</h2>
      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        {/* Email and Password inputs are the same as before */}
        <div>
          <label className="mb-1 font-semibold text-gray-600">Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <div>
          <label className="mb-1 font-semibold text-gray-600">Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button type="submit" className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700">Login</button>
      </form>
      <div className="text-center mt-6">
        <p className="text-gray-500 mb-4">Or</p>
        <button onClick={handleGoogleSignIn} className="w-full flex justify-center items-center gap-2 py-2 px-4 border rounded-full hover:bg-gray-50">
          {/* Google SVG */}
          <svg className="w-5 h-5" viewBox="0 0 48 48">...</svg> Sign in with Google
        </button>
        <p className="mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-green-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;