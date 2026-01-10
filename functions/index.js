// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
// 1. Load environment variables
require("dotenv").config(); 

admin.initializeApp();

exports.exchangeFitbitToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    
    // We expect an "action" field to decide what to do
    // action: 'exchange_token' OR 'fetch_data'
    const { action } = req.body;

    // --- CASE 1: EXCHANGE TOKEN (Login) ---
    if (action === 'exchange_token') {
      const { code, redirect_uri } = req.body;
      
      // 2. Use process.env to access the secrets
      // Make sure these match the variable names in your functions/.env file
      const clientId = process.env.FITBIT_CLIENT_ID;
      const clientSecret = process.env.FITBIT_CLIENT_SECRET;

      // Safety check to ensure keys are loaded
      if (!clientId || !clientSecret) {
        console.error("Missing Fitbit environment variables");
        return res.status(500).json({ error: "Server misconfiguration" });
      }

      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      try {
        const response = await axios.post(
          "https://api.fitbit.com/oauth2/token",
          new URLSearchParams({
            client_id: clientId,
            grant_type: "authorization_code",
            redirect_uri: redirect_uri,
            code: code,
          }).toString(),
          {
            headers: {
              "Authorization": `Basic ${credentials}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        return res.status(200).json(response.data);
      } catch (error) {
        return res.status(500).json({ 
          error: error.message, 
          details: error.response?.data 
        });
      }
    }

    // --- CASE 2: FETCH DATA (Sync) ---
    // This proxies the request to Fitbit on behalf of the user
    if (action === 'fetch_data') {
      const { accessToken, endpoint } = req.body;

      if (!accessToken || !endpoint) {
        return res.status(400).json({ error: "Missing accessToken or endpoint" });
      }

      try {
        // We make the call from the server, avoiding CORS
        const response = await axios.get(endpoint, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json"
          }
        });
        return res.status(200).json(response.data);
      } catch (error) {
        console.error("Data Fetch Error:", error.response?.data);
        return res.status(error.response?.status || 500).json({ 
          error: "Failed to fetch data", 
          details: error.response?.data 
        });
      }
    }

    return res.status(400).json({ error: "Invalid action" });
  });
});