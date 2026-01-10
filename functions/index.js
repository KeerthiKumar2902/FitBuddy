require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.exchangeFitbitToken = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {

    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const { code, redirect_uri } = req.body;

    if (!code || !redirect_uri) {
      return res.status(400).json({ error: "Missing code or redirect_uri" });
    }

    const clientId = process.env.FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Missing Fitbit environment variables");
      return res.status(500).json({ error: "Server misconfiguration" });
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    try {
      const response = await axios.post(
        "https://api.fitbit.com/oauth2/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          redirect_uri,
          code
        }).toString(),
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return res.status(200).json(response.data);

    } catch (error) {
      console.error("Fitbit Token Exchange Error:", error.response?.data || error.message);
      return res.status(500).json({
        error: "Failed to exchange token",
        details: error.response?.data || error.message
      });
    }
  });
});
