import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AuthStatus from './components/AuthStatus'
import LoginButton from './components/LoginButton'
import LogoutButton from './components/LogoutButton'
import SpotifyCallback from './components/SpotifyCallback'

function App() {
  const [count, setCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check if user is already connected
    const token = localStorage.getItem('spotify_access_token');
    setIsConnected(!!token);
  }, []);

  const handleTokenReceived = (tokenData) => {
    setIsConnected(true);
    console.log('Spotify tokens received:', tokenData);
  };

  const handleLogout = () => {
    setIsConnected(false);
    console.log('User disconnected from Spotify');
  };

  return (
    <>
      <SpotifyCallback onTokenReceived={handleTokenReceived} />
      
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1>Seamless</h1>
      
      {/* Always show auth status */}
      <AuthStatus />
      
      {/* Show login button if not connected, logout button if connected */}
      <div style={{ margin: '20px 0' }}>
        {!isConnected ? (
          <LoginButton />
        ) : (
          <LogoutButton onLogout={handleLogout} />
        )}
      </div>
      
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
