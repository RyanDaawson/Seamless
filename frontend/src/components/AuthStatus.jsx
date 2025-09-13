import React, { useState, useEffect } from 'react';

const AuthStatus = () => {
  const [isConnected, setIsConnected] = useState(false);

  const checkConnection = () => {
    const token = localStorage.getItem('spotify_access_token');
    setIsConnected(!!token);
  };

  useEffect(() => {
    // Check for Spotify access token in localStorage on mount
    checkConnection();

    // Listen for storage changes (in case token is set in another tab)
    const handleStorageChange = () => {
      checkConnection();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event for same-tab token updates
    const handleTokenUpdate = () => {
      checkConnection();
    };
    
    window.addEventListener('spotifyTokenUpdate', handleTokenUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('spotifyTokenUpdate', handleTokenUpdate);
    };
  }, []);

  return (
    <div style={{
      padding: '10px',
      margin: '10px 0',
      borderRadius: '6px',
      backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
      color: isConnected ? '#155724' : '#721c24',
      border: `1px solid ${isConnected ? '#c3e6cb' : '#f5c6cb'}`,
      fontSize: '14px',
      fontWeight: '500'
    }}>
      {isConnected ? '✅ Connected to Spotify' : '❌ Not connected'}
    </div>
  );
};

export default AuthStatus;
