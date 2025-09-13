import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";
import querystring from "querystring";
import crypto from "crypto";

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to allow frontend requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// CORS is globally enabled above. No need for explicit app.options() handling.

app.use(express.json());

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

// Validate environment variables at startup
if (!CLIENT_ID || CLIENT_ID === 'your_client_id_here') {
  console.error('❌ SPOTIFY_CLIENT_ID is missing or not set properly in .env file');
  process.exit(1);
}

if (!CLIENT_SECRET || CLIENT_SECRET === 'your_client_secret_here') {
  console.error('❌ SPOTIFY_CLIENT_SECRET is missing or not set properly in .env file');
  process.exit(1);
}

if (!REDIRECT_URI) {
  console.error('❌ SPOTIFY_REDIRECT_URI is missing in .env file');
  process.exit(1);
}

if (!SCOPE || SCOPE.length === 0) {
  console.error('❌ SCOPE is missing or empty');
  process.exit(1);
}

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
  console.log("🏠 Root endpoint hit from IP:", req.ip);
  res.json({ message: "Seamless backend is running 🚀" });
});

// GET /auth/login - Redirect to Spotify authorization page
app.get("/auth/login", (req, res) => {
  console.log("🔐 /auth/login endpoint triggered");
  console.log("📍 Request IP:", req.ip);
  console.log("🌐 User-Agent:", req.get('User-Agent'));
  console.log("✅ Environment variables check:");
  console.log("- CLIENT_ID:", CLIENT_ID ? "Present" : "Missing");
  console.log("- REDIRECT_URI:", REDIRECT_URI);
  console.log("- SCOPE:", SCOPE);
  
  try {
    // Generate PKCE code_verifier and code_challenge
    const code_verifier = generateRandomString(128);
    const code_challenge = base64URLEncode(sha256(code_verifier));
    
    // Store code_verifier in-memory by a random state
    const state = generateRandomString(16);
    codeVerifiers[state] = code_verifier;
    
    console.log("🎲 Generated state:", state);
    console.log("🔐 Generated code_challenge:", code_challenge);
    console.log("💾 Stored code_verifier in memory");

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
    console.log("✅ Successfully constructed Spotify authorize URL:");
    console.log("🚀 Redirecting to:", authUrl);
    
    res.redirect(authUrl);
  } catch (error) {
    console.error("💥 Error in /auth/login:", error);
    console.error("📊 Error stack:", error.stack);
    res.status(500).json({ 
      error: "OAuth login failed", 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET /auth/callback - Handle Spotify redirect and exchange code for tokens
app.get("/auth/callback", async (req, res) => {
  console.log("🔄 /auth/callback endpoint hit");
  console.log("📋 Query params:", req.query);
  
  const { code, state, error } = req.query;
  
  if (error) {
    console.error("❌ Spotify OAuth error:", error);
    return res.redirect(`http://localhost:5173/?error=${encodeURIComponent(error)}`);
  }
  
  if (!code || !state) {
    console.error("❌ Missing code or state in callback");
    return res.redirect("http://localhost:5173/?error=missing_parameters");
  }
  
  if (!codeVerifiers[state]) {
    console.error("❌ Invalid or expired state:", state);
    console.log("📋 Available states:", Object.keys(codeVerifiers));
    return res.redirect("http://localhost:5173/?error=invalid_state");
  }
  
  const code_verifier = codeVerifiers[state];
  // Clean up used code_verifier
  delete codeVerifiers[state];
  console.log("✅ Found and removed code_verifier for state:", state);

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
    
    console.log("🔄 Exchanging code for tokens...");
    const response = await axios.post(tokenUrl, data, { headers });
    const { access_token, refresh_token, expires_in } = response.data;
    
    console.log("✅ Successfully received tokens from Spotify");
    console.log("- Access token length:", access_token ? access_token.length : 0);
    console.log("- Refresh token present:", !!refresh_token);
    console.log("- Expires in:", expires_in, "seconds");
    
    // Redirect to frontend with tokens as URL parameters
    const frontendUrl = new URL("http://localhost:5173/");
    frontendUrl.searchParams.set("access_token", access_token);
    if (refresh_token) {
      frontendUrl.searchParams.set("refresh_token", refresh_token);
    }
    frontendUrl.searchParams.set("expires_in", expires_in);
    
    console.log("🚀 Redirecting to frontend with tokens");
    res.redirect(frontendUrl.toString());
  } catch (err) {
    console.error("💥 Error exchanging code for tokens:", err.response?.data || err.message);
    res.redirect("http://localhost:5173/?error=token_exchange_failed");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Seamless backend listening on port ${PORT}`);
  console.log("✅ Environment validation passed:");
  console.log("- CLIENT_ID:", CLIENT_ID ? "✓ Present" : "✗ Missing");
  console.log("- CLIENT_SECRET:", CLIENT_SECRET ? "✓ Present" : "✗ Missing");
  console.log("- REDIRECT_URI:", REDIRECT_URI || "✗ Missing");
  console.log("- SCOPE:", SCOPE ? "✓ Present" : "✗ Missing");
  console.log("🌐 CORS origins: http://localhost:5173, http://127.0.0.1:5173");
  console.log("📍 Test the auth flow:");
  console.log("   1. Visit: http://localhost:5000/auth/login");
  console.log("   2. Should redirect to Spotify login");
  console.log("   3. After login, should redirect back to frontend");
});