import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { api } from '../utils/api';

const PlaylistInput = ({ onLoad, onError, loading }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const { accessToken } = useAuth();
  const { loadPlaylist, setRecommendations } = usePlayer();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    onError(null);
    onLoad(true);

    try {
      const data = await api.spotify.analyzePlaylist(accessToken, playlistUrl.trim());
      
      if (data.error) {
        throw new Error(data.error);
      }

      loadPlaylist(data.playlist, data.tracks);
      
      // Get initial recommendations for the first track
      if (data.tracks.length > 0) {
        const recommendations = await api.spotify.getRecommendations(
          accessToken, 
          data.tracks[0], 
          data.tracks.slice(1)
        );
        
        if (recommendations.recommendations) {
          setRecommendations(recommendations.recommendations);
        }
      }

      setPlaylistUrl('');
    } catch (error) {
      console.error('Error loading playlist:', error);
      onError(error.message || 'Failed to load playlist. Please check the URL and try again.');
    } finally {
      onLoad(false);
    }
  };

  return (
    <div className="bg-spotify-black/40 p-6 rounded-xl border border-spotify-gray/20">
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Load Spotify Playlist
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="playlist-url" className="block text-sm font-medium text-gray-300 mb-2">
            Paste your Spotify playlist URL
          </label>
          <input
            id="playlist-url"
            type="url"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            className="w-full px-4 py-3 bg-spotify-dark border border-spotify-gray/30 rounded-lg text-white placeholder-gray-500 focus:border-spotify-green focus:outline-none focus:ring-2 focus:ring-spotify-green/20"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !playlistUrl.trim()}
          className="w-full px-6 py-3 bg-spotify-green hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Analyzing Playlist...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>Load & Analyze</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-400">
        <p className="mb-2">Tips:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Make sure the playlist is public or you have access to it</li>
          <li>We'll analyze audio features like BPM, key, and energy for smart crossfading</li>
          <li>Larger playlists may take a moment to analyze</li>
        </ul>
      </div>
    </div>
  );
};

export default PlaylistInput;