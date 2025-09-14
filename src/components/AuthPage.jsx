// src/components/AuthPage.jsx
import React from 'react';

// Import all the necessary components and functions
import Signup from './Signup';
import Login from './Login';
import { auth, db } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthPage = () => {
  // This is the exact same function we had in App.jsx
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp()
        });
        console.log("Created Firestore document for new Google user.");
      }
      console.log("Google Sign-In successful!");
    } catch (error) {
      console.error("Error during Google Sign-In:", error.message);
    }
  };

  return (
    <div className="auth-container">
      <Signup />
      <hr />
      <Login />
      <hr />
      <div className="google-signin">
        <p>Or</p>
        <button onClick={handleGoogleSignIn}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default AuthPage;