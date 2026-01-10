// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
require("dotenv").config(); 

admin.initializeApp();

exports.exchangeFitbitToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    
    const { action } = req.body;
    const clientId = process.env.FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Fitbit environment variables");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const fitbitTokenUrl = "https://api.fitbit.com/oauth2/token";
    const headers = {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    // --- CASE 1: EXCHANGE CODE (Login) ---
    if (action === 'exchange_token') {
      const { code, redirect_uri } = req.body;
      try {
        const response = await axios.post(
          fitbitTokenUrl,
          new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            redirect_uri: redirect_uri,
            code: code,
          }).toString(),
          { headers }
        );
        return res.status(200).json(response.data);
      } catch (error) {
        return res.status(500).json({ error: error.message, details: error.response?.data });
      }
    }

    // --- CASE 2: REFRESH TOKEN (New Feature) ---
    if (action === 'refresh_token') {
      const { refresh_token } = req.body;
      try {
        const response = await axios.post(
          fitbitTokenUrl,
          new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refresh_token,
          }).toString(),
          { headers }
        );
        return res.status(200).json(response.data);
      } catch (error) {
        console.error("Refresh Error:", error.response?.data);
        // Return the specific status code (e.g., 400 or 401) so frontend knows it failed
        return res.status(error.response?.status || 500).json({ 
          error: "Failed to refresh token", 
          details: error.response?.data 
        });
      }
    }

    // --- CASE 3: FETCH DATA (Sync) ---
    if (action === 'fetch_data') {
      const { accessToken, endpoint } = req.body;
      if (!accessToken || !endpoint) return res.status(400).json({ error: "Missing params" });

      try {
        const response = await axios.get(endpoint, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json"
          }
        });
        return res.status(200).json(response.data);
      } catch (error) {
        // Pass the 401 error back to frontend so we know to refresh
        return res.status(error.response?.status || 500).json({ 
          error: "Failed to fetch data", 
          details: error.response?.data 
        });
      }
    }

    return res.status(400).json({ error: "Invalid action" });
  });
});