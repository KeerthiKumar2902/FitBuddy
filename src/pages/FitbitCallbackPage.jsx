// src/pages/FitbitCallbackPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken } from '../services/fitbitService';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const FitbitCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');
  const code = searchParams.get('code');
  
  // Ref to prevent double-firing in React Strict Mode
  const hasFetched = useRef(false);

  useEffect(() => {
    const processLogin = async () => {
      // 1. Basic Validation
      if (!code) {
        setStatus('Error: No authorization code found in URL.');
        return;
      }
      
      // 2. Prevent Double Execution
      if (hasFetched.current) return;
      hasFetched.current = true;

      // 3. Ensure User is Logged In
      if (!auth.currentUser) {
        setStatus('Error: You must be logged in to FitBuddy first.');
        return;
      }

      try {
        setStatus('Connecting to Fitbit...');
        
        // 4. Call the Service (which calls Cloud Function)
        const tokenData = await exchangeCodeForToken(code);
        
        console.log("Tokens received successfully!");

        // 5. Save Tokens to Firestore
        const tokenRef = doc(db, 'users', auth.currentUser.uid, 'private', 'fitbit_tokens');
        
        await setDoc(tokenRef, {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in,
          userId: tokenData.user_id,
          scope: tokenData.scope,
          updatedAt: serverTimestamp(),
        });

        setStatus('Success! Redirecting...');
        setTimeout(() => navigate('/wellness-tracker'), 1500);

      } catch (error) {
        console.error("Callback Error:", error);
        setStatus(`Connection Failed: ${error.message}`);
      }
    };

    processLogin();
  }, [code, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Fitbit Connection</h2>
        
        <div className="flex justify-center mb-6">
           {status.includes('Error') || status.includes('Failed') ? (
             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-3xl">
               ⚠️
             </div>
           ) : status.includes('Success') ? (
             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-3xl">
               ✓
             </div>
           ) : (
             <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
           )}
        </div>
        
        <p className={`text-lg ${status.includes('Error') || status.includes('Failed') ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
          {status}
        </p>

        {(status.includes('Error') || status.includes('Failed')) && (
           <button 
             onClick={() => navigate('/wellness-tracker')}
             className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
           >
             Return to Tracker
           </button>
        )}
      </div>
    </div>
  );
};

export default FitbitCallbackPage;