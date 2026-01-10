// src/services/fitbitService.js

const CLIENT_ID = import.meta.env.VITE_FITBIT_CLIENT_ID;
const CLOUD_FUNCTION_URL = "https://exchangefitbittoken-m5td6bw67a-uc.a.run.app"; 

const REDIRECT_URI = window.location.hostname === 'localhost' 
  ? 'http://localhost:5173/callback' 
  : 'https://fit-buddy-flame.vercel.app/callback';

const SCOPES = 'activity heartrate location nutrition profile sleep weight';

export const getFitbitAuthUrl = () => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    expires_in: '604800',
    prompt: 'login',
  });
  return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
};

// Generic helper for Cloud Function calls
const callCloudFunction = async (body) => {
  const response = await fetch(CLOUD_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // We throw the status so we can catch 401 specifically
    const err = new Error("Cloud Function Error");
    err.status = response.status; 
    throw err;
  }
  return await response.json();
};

export const exchangeCodeForToken = async (code) => {
  return callCloudFunction({
    action: 'exchange_token',
    code,
    redirect_uri: REDIRECT_URI,
  });
};

/**
 * NEW: Refresh the access token using the refresh token
 */
export const refreshFitbitToken = async (refreshToken) => {
  return callCloudFunction({
    action: 'refresh_token',
    refresh_token: refreshToken
  });
};

export const fetchFitbitDataForDate = async (accessToken, date) => {
  try {
    // 1. Activity
    const activityData = await callCloudFunction({
      action: 'fetch_data',
      accessToken,
      endpoint: `https://api.fitbit.com/1/user/-/activities/date/${date}.json`
    });
    
    // 2. Sleep
    const sleepData = await callCloudFunction({
      action: 'fetch_data',
      accessToken,
      endpoint: `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`
    });

    // 3. Heart Rate (Optional)
    let hrData = null;
    try {
        hrData = await callCloudFunction({
          action: 'fetch_data',
          accessToken,
          endpoint: `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/1d.json`
        });
    } catch (e) { /* Ignore HR errors */ }

    return { date, activity: activityData, sleep: sleepData, heart: hrData };

  } catch (error) {
    // If it's a 401, re-throw it so the UI knows to refresh
    if (error.status === 401) throw error;
    
    console.error(`Error fetching Fitbit data for ${date}:`, error);
    return null;
  }
};