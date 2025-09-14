// src/components/Signup.jsx
import React, { useState } from 'react';
import { auth } from '../firebase'; // 1. Import auth from your firebase.js
import { createUserWithEmailAndPassword } from 'firebase/auth'; // 2. Import the function

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. Create the handleSubmit function
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevents the page from refreshing
    try {
      // 4. Call the Firebase function
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Account created successfully!");
      console.log(userCredential); // You can inspect the user object here
      // You can redirect the user or clear the form here
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error("Error creating account:", error.message);
      // You can display the error message to the user here
    }
  };

  return (
    <div>
      <h2>Create Your Account</h2>
      {/* 5. Attach the handler to the form's onSubmit event */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required // Add basic validation
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // Add basic validation
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;