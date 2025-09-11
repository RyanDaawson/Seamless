# SmoothMix

A React + Node.js web app that transforms your Spotify playlists into seamless crossfaded experiences with intelligent next-song recommendations.

## Features

- **Spotify Integration**: Paste any Spotify playlist URL to analyze tracks
- **Audio Analysis**: Fetches BPM, key, energy, and other audio features for each track
- **Smart Crossfading**: 4-7 second intelligent crossfades between tracks
- **AI Recommendations**: Get next track suggestions based on similarity scoring
- **Clean UI**: Modern interface built with Tailwind CSS and Spotify's design language
- **Real-time Player**: Play 30-second previews with crossfade controls

## Tech Stack

### Frontend
- **React** with Vite for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express
- **Spotify Web API** integration
- **OAuth PKCE** authentication flow
- **Audio feature analysis** and recommendation engine

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Spotify Developer Account

### 1. Spotify App Setup
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:5000/api/auth/callback`
4. Note your Client ID

### 2. Installation
```bash
# Clone and install dependencies
git clone <repository-url>
cd Seamless
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Add your Spotify Client ID to backend/.env
SPOTIFY_CLIENT_ID=your_client_id_here
```

### 3. Development
```bash
# Run both frontend and backend
npm run dev

# Or run separately:
npm run dev:backend  # Backend on http://localhost:5000
npm run dev:frontend # Frontend on http://localhost:5173
```

### 4. Production Build
```bash
npm run build
npm start
```

## How It Works

1. **Authentication**: Users authenticate with Spotify using OAuth PKCE flow
2. **Playlist Analysis**: Paste a Spotify playlist URL to fetch all tracks and their audio features
3. **Track Display**: View current track with detailed audio analysis (BPM, key, energy, etc.)
4. **Smart Recommendations**: AI algorithm suggests next tracks based on:
   - Tempo similarity (BPM matching)
   - Harmonic compatibility (key matching)
   - Energy level consistency
   - Danceability and valence scoring
5. **Crossfade Playback**: Smooth 4-7 second crossfades between track previews
6. **Interactive Controls**: Adjust crossfade duration, volume, and manual track selection

## API Endpoints

### Authentication
- `GET /api/auth/login` - Get Spotify authorization URL
- `GET /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/refresh` - Refresh access token

### Spotify Integration  
- `GET /api/spotify/me` - Get user profile
- `POST /api/spotify/playlist/analyze` - Analyze playlist tracks and audio features
- `POST /api/spotify/recommendations` - Get similar track recommendations

## Project Structure

```
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Spotify OAuth handling
│   │   └── spotify.js       # Spotify API integration
│   ├── utils/
│   │   └── crypto.js        # PKCE utilities
│   └── server.js            # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # React context providers
│   │   ├── pages/           # Route components
│   │   ├── utils/           # API utilities
│   │   └── App.jsx          # Main app component
│   ├── tailwind.config.js   # Tailwind configuration
│   └── vite.config.js       # Vite configuration
│
├── package.json             # Root package with scripts
└── README.md               # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Spotify Web API for music data
- Tailwind CSS for beautiful styling
- React and Vite for excellent developer experience
