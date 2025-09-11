const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  auth: {
    login: () => fetch(`${API_BASE_URL}/auth/login`).then(res => res.json()),
    refresh: (refreshToken) => 
      fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      }).then(res => res.json())
  },
  spotify: {
    getProfile: (token) =>
      fetch(`${API_BASE_URL}/spotify/me`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json()),
    analyzePlaylist: (token, playlistUrl) =>
      fetch(`${API_BASE_URL}/spotify/playlist/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ playlistUrl })
      }).then(res => res.json()),
    getRecommendations: (token, currentTrack, trackPool, count = 5) =>
      fetch(`${API_BASE_URL}/spotify/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentTrack, trackPool, count })
      }).then(res => res.json())
  }
};