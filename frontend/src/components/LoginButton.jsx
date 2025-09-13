import React from 'react';

const LoginButton = () => {
  const handleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:5000/auth/login';
  };

  return (
    <button 
      onClick={handleLogin}
      style={{
        backgroundColor: '#1db954',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease'
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = '#1ed760'}
      onMouseOut={(e) => e.target.style.backgroundColor = '#1db954'}
    >
      Connect with Spotify
    </button>
  );
};

export default LoginButton;
