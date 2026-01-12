// functions/index.js
const functions = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https"); // New Import for AI
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const { GoogleGenerativeAI } = require("@google/generative-ai"); // New Import for AI
require("dotenv").config(); 

admin.initializeApp();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==========================================
// 1. EXISTING FITBIT INTEGRATION
// ==========================================
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
        return res.status(error.response?.status || 500).json({ 
          error: "Failed to fetch data", 
          details: error.response?.data 
        });
      }
    }

    return res.status(400).json({ error: "Invalid action" });
  });
});

// ==========================================
// 2. NEW AI WORKOUT GENERATOR
// ==========================================
exports.generateWorkoutPlan = onCall(async (request) => {
  // 1. Extract Data from Frontend
  const { goal, equipment, duration, availableExercises } = request.data;

  if (!goal || !availableExercises) {
    throw new HttpsError('invalid-argument', 'Goal and Exercise List are required.');
  }

  try {
    // 2. Prepare the Prompt
    const exerciseNames = availableExercises.map(e => e.name).join(", ");

    const prompt = `
      Act as an expert fitness trainer. Create a ${duration}-minute workout plan for a user.
      
      User Goal: "${goal}"
      Equipment Available: "${equipment || 'Bodyweight'}"
      
      CRITICAL INSTRUCTIONS:
      1. You must ONLY select exercises from this specific list: [${exerciseNames}]. Do not invent new exercises.
      2. Return the response PURELY as a JSON array. Do not add markdown formatting (like \`\`\`json).
      3. Structure the JSON exactly like this:
      [
        { "exerciseName": "Exact Name From List", "sets": 3, "reps": 12, "notes": "Focus on form" },
        ...
      ]
    `;

    // 3. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Clean and Parse JSON
    // Remove potential markdown blocks AI might add
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const workoutPlan = JSON.parse(jsonString);

    return { workoutPlan };

  } catch (error) {
    console.error("AI Generation Error", error);
    throw new HttpsError('internal', 'Failed to generate workout plan.');
  }
});