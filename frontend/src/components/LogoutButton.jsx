import React from 'react';

const LogoutButton = ({ onLogout }) => {
  const handleLogout = () => {
    // Clear all Spotify-related data from localStorage
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_token_expires_at');
    
    // Dispatch custom event to notify components about logout
    window.dispatchEvent(new CustomEvent('spotifyTokenUpdate'));
    
    // Notify parent component
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <button 
      onClick={handleLogout}
      style={{
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
    >
      Disconnect
    </button>
  );
};

export default LogoutButton;
