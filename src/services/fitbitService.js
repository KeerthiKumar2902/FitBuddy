// src/services/fitbitService.js

const CLIENT_ID = import.meta.env.VITE_FITBIT_CLIENT_ID;


const CLOUD_FUNCTION_URL = "https://exchangefitbittoken-m5td6bw67a-uc.a.run.app"; 

const REDIRECT_URI = window.location.hostname === 'localhost' 
  ? 'http://localhost:5173/callback' 
  : 'https://fit-buddy-flame.vercel.app/callback';

const SCOPES = 'activity heartrate location nutrition profile sleep weight';

/**
 * Generates the Fitbit Authorization URL for the user to login.
 */
export const getFitbitAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    expires_in: '604800', // 1 week
  });

  return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
};

/**
 * Calls your Firebase Cloud Function to exchange the auth code for tokens.
 */
export const exchangeCodeForToken = async (code) => {
  try {
    console.log("Sending code to Cloud Function:", CLOUD_FUNCTION_URL);
    
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      // Try to parse the error message from the backend
      const errorData = await response.json().catch(() => ({})); 
      console.error("Cloud Function Error Response:", errorData);
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    return data; // Returns { access_token, refresh_token, ... }
  } catch (error) {
    console.error("Token Exchange Failed:", error);
    throw error;
  }
};