// src/services/fitbitService.js

const CLIENT_ID = import.meta.env.VITE_FITBIT_CLIENT_ID;

// Your deployed Cloud Function URL
const CLOUD_FUNCTION_URL = "https://exchangefitbittoken-m5td6bw67a-uc.a.run.app"; 

const REDIRECT_URI = window.location.hostname === 'localhost' 
  ? 'http://localhost:5173/callback' 
  : 'https://fit-buddy-flame.vercel.app/callback';

const SCOPES = 'activity heartrate location nutrition profile sleep weight';

/**
 * Generates the Fitbit Authorization URL for the user to login.
 * Adds 'prompt: login' to force re-authentication for multiple users.
 */
export const getFitbitAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    expires_in: '604800',
    prompt: 'login', // <--- This forces the login screen every time
  });
  return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
};

/**
 * Calls your Firebase Cloud Function to exchange the auth code for tokens.
 */
export const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'exchange_token', // Tell backend to exchange code
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Token Exchange Failed:", error);
    throw error;
  }
};

/**
 * Proxy the data fetch through the Cloud Function to avoid CORS
 */
export const fetchFitbitDataForDate = async (accessToken, date) => {
  try {
    // Helper to call our Cloud Function proxy
    const proxyFetch = async (endpoint) => {
      const res = await fetch(CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch_data', // Tell backend to fetch data
          accessToken: accessToken,
          endpoint: endpoint
        })
      });
      if (!res.ok) throw new Error("Proxy fetch failed");
      return await res.json();
    };

    // 1. Fetch Activity Summary
    const activityData = await proxyFetch(`https://api.fitbit.com/1/user/-/activities/date/${date}.json`);
    
    // 2. Fetch Sleep Data
    const sleepData = await proxyFetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`);

    // 3. Fetch Heart Rate Data
    // Note: Heart rate requires 'personal' app access. If this fails, we catch it.
    let hrData = null;
    try {
        hrData = await proxyFetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`);
    } catch (e) {
        console.warn("Heart rate fetch failed (likely permission scope), skipping.");
    }

    return { date, activity: activityData, sleep: sleepData, heart: hrData };

  } catch (error) {
    console.error(`Error fetching Fitbit data via proxy for ${date}:`, error);
    return null;
  }
};