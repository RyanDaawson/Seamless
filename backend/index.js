import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import querystring from "querystring";
import crypto from "crypto";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Spotify OAuth config
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

// Scopes required for Seamless
const SCOPE = [
  "user-read-private",
  "user-read-email",
  "playlist-read-private",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state"
].join(" ");

// Helper: Generate random string for PKCE code_verifier
function generateRandomString(length) {
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Helper: Base64URL encode
function base64URLEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Helper: SHA256 hash for PKCE code_challenge
function sha256(str) {
  return crypto.createHash("sha256").update(str).digest();
}

// In-memory store for code_verifier (for demo; use session/cookie in prod)
const codeVerifiers = {};

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Seamless backend is running 🚀" });
});

// GET /auth/login - Redirect to Spotify authorization page
app.get("/auth/login", (req, res) => {
  // Generate PKCE code_verifier and code_challenge
  const code_verifier = generateRandomString(128);
  const code_challenge = base64URLEncode(sha256(code_verifier));
  // Store code_verifier in-memory by a random state
  const state = generateRandomString(16);
  codeVerifiers[state] = code_verifier;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: SCOPE,
    state,
    code_challenge,
    code_challenge_method: "S256"
  });
  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  res.redirect(authUrl);
});

// GET /auth/callback - Handle Spotify redirect and exchange code for tokens
app.get("/auth/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || !codeVerifiers[state]) {
    return res.status(400).json({ error: "invalid_token" });
  }
  const code_verifier = codeVerifiers[state];
  // Clean up used code_verifier
  delete codeVerifiers[state];

  try {
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const data = querystring.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier
    });
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
    // PKCE: No client_secret in body or header
    const response = await axios.post(tokenUrl, data, { headers });
    const { access_token, refresh_token, expires_in } = response.data;
    res.json({ access_token, refresh_token, expires_in });
  } catch (err) {
    res.status(400).json({ error: "invalid_token" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Seamless backend listening on port ${PORT}`);
});