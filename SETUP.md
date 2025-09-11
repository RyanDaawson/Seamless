# SmoothMix Setup Guide

## Quick Setup for Testing

### 1. Prerequisites
- Node.js 16+ and npm
- A Spotify account (free or premium)

### 2. Get Spotify Credentials
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create app"
4. Fill in:
   - **App name**: SmoothMix Local Dev
   - **App description**: Local development for SmoothMix
   - **Redirect URI**: `http://localhost:5000/api/auth/callback`
   - **API/SDK**: Check "Web API"
5. Save your **Client ID**

### 3. Installation & Configuration
```bash
# Install dependencies
npm run install:all

# Set up backend environment
cp backend/.env.example backend/.env

# Edit backend/.env and add your Spotify Client ID:
# SPOTIFY_CLIENT_ID=your_client_id_here

# Set up frontend environment (optional)
cp frontend/.env.example frontend/.env
```

### 4. Run the Application
```bash
# Start both backend and frontend
npm run dev

# The app will be available at:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

### 5. Test the Features
1. Click "Login with Spotify" to authenticate
2. Paste a public Spotify playlist URL (try one of these examples):
   - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M (Today's Top Hits)
   - https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd (RapCaviar)
3. View audio analysis and smart recommendations
4. Test crossfade playback with 30-second previews

## Example Spotify Playlist URLs for Testing
- **Today's Top Hits**: `https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M`
- **RapCaviar**: `https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd`
- **Rock Classics**: `https://open.spotify.com/playlist/37i9dQZF1DWXRqgorJj26U`
- **Chill Pop**: `https://open.spotify.com/playlist/37i9dQZF1DWTvNyxOwkztu`

Note: Make sure the playlists are public or that you have access to them.

## Features to Test

### ✅ Authentication
- Spotify OAuth with PKCE flow
- User profile display

### ✅ Playlist Analysis
- URL validation and parsing
- Track metadata extraction
- Audio features analysis (BPM, key, energy, etc.)

### ✅ Smart Recommendations
- Similarity-based track suggestions
- BPM and key matching
- Energy level consistency

### ✅ Crossfade Player
- 30-second preview playback
- Adjustable crossfade duration (4-7 seconds)
- Volume control
- Smooth transitions between tracks

### ✅ UI/UX
- Responsive design
- Spotify-inspired theme
- Real-time audio feature visualization
- Interactive controls

## Troubleshooting

### Common Issues
1. **"Invalid Spotify playlist URL"** - Ensure the URL is from Spotify and the playlist is public
2. **"Failed to fetch user profile"** - Check your Spotify Client ID in backend/.env
3. **"CORS errors"** - Make sure both frontend and backend are running on the correct ports
4. **No audio playback** - Some tracks don't have 30-second previews; try different playlists