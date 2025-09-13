import React, { useEffect } from 'react';

const SpotifyCallback = ({ onTokenReceived }) => {
  useEffect(() => {
    // Check if we're on the callback page and have token data
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const expiresIn = urlParams.get('expires_in');
    const error = urlParams.get('error');

    if (error) {
      console.error('Spotify OAuth error:', error);
      return;
    }

    if (accessToken) {
      // Store tokens in localStorage
      localStorage.setItem('spotify_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('spotify_refresh_token', refreshToken);
      }
      if (expiresIn) {
        const expirationTime = Date.now() + (parseInt(expiresIn) * 1000);
        localStorage.setItem('spotify_token_expires_at', expirationTime.toString());
      }

      // Dispatch custom event to notify components about token update
      window.dispatchEvent(new CustomEvent('spotifyTokenUpdate'));

      // Notify parent component that token was received
      if (onTokenReceived) {
        onTokenReceived({
          accessToken,
          refreshToken,
          expiresIn: parseInt(expiresIn)
        });
      }

      // Clean up URL by removing token parameters
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [onTokenReceived]);

  return null; // This component doesn't render anything
};

export default SpotifyCallback;
