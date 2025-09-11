import express from 'express';
import axios from 'axios';
import { generateCodeChallenge, generateRandomState } from '../utils/crypto.js';

const router = express.Router();

// Store for temporary data (in production, use Redis or database)
const tempStorage = new Map();

// Spotify OAuth configuration
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5000/api/auth/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Generate authorization URL
router.get('/login', (req, res) => {
  const { codeVerifier, codeChallenge } = generateCodeChallenge();
  const state = generateRandomState();
  
  // Store code verifier and state temporarily
  tempStorage.set(state, { codeVerifier, timestamp: Date.now() });
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: 'user-read-private playlist-read-private playlist-read-collaborative user-modify-playback-state user-read-playback-state streaming',
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  
  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  res.json({ authUrl });
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  
  if (error) {
    return res.redirect(`${FRONTEND_URL}?error=${error}`);
  }
  
  const storedData = tempStorage.get(state);
  if (!storedData) {
    return res.redirect(`${FRONTEND_URL}?error=invalid_state`);
  }
  
  // Clean up expired entries (older than 10 minutes)
  const now = Date.now();
  for (const [key, value] of tempStorage.entries()) {
    if (now - value.timestamp > 600000) {
      tempStorage.delete(key);
    }
  }
  
  try {
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: storedData.codeVerifier
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Clean up temporary storage
    tempStorage.delete(state);
    
    // Redirect to frontend with tokens
    res.redirect(`${FRONTEND_URL}?access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.redirect(`${FRONTEND_URL}?error=token_exchange_failed`);
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }
  
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
      client_id: CLIENT_ID
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
});

export default router;