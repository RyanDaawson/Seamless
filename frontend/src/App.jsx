import { useState, useEffect } from 'react';
import './App.css';
import UserProfile from './components/UserProfile';

const BACKEND_URL = 'http://localhost:8080';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check for token in URL (from OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      // Exchange code for token via backend
      exchangeCodeForToken(code, state);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Check if we already have a token stored
      const storedToken = localStorage.getItem('spotify_access_token');
      if (storedToken) {
        setIsConnected(true);
        fetchProfile(storedToken);
      }
    }
  }, []);

  const exchangeCodeForToken = async (code, state) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/auth/callback?code=${code}&state=${state}`);
      const data = await response.json();
      
      if (response.ok && data.access_token) {
        localStorage.setItem('spotify_access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        setIsConnected(true);
        await fetchProfile(data.access_token);
      } else {
        setError('Failed to authenticate with Spotify');
      }
    } catch (err) {
      setError('Network error during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      } else if (response.status === 401) {
        // Token expired or invalid
        handleLogout();
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (err) {
      setError('Network error while fetching profile');
    }
  };

  const handleLogin = () => {
    window.location.href = `${BACKEND_URL}/auth/login`;
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    setIsConnected(false);
    setProfile(null);
    setError(null);
  };

  const AuthStatus = () => {
    if (isLoading) {
      return <div className="auth-status loading">Connecting to Spotify...</div>;
    }

    if (isConnected) {
      return (
        <div className="auth-status connected">
          <span>✅ Connected to Spotify</span>
          <button onClick={handleLogout} className="logout-btn">Disconnect</button>
        </div>
      );
    }

    return (
      <div className="auth-status disconnected">
        <span>❌ Not connected to Spotify</span>
        <button onClick={handleLogin} className="login-btn">Connect with Spotify</button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎵 Seamless</h1>
        <p>Your unified music streaming experience</p>
      </header>

      <main className="app-main">
        <AuthStatus />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isConnected && profile && <UserProfile profile={profile} />}
      </main>
    </div>
  );
}

export default App;
