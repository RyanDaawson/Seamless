import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { api } from '../utils/api';
import PlaylistInput from '../components/PlaylistInput';
import NowPlaying from '../components/NowPlaying';
import RecommendationList from '../components/RecommendationList';
import PlayerControls from '../components/PlayerControls';

const Home = () => {
  const { user, accessToken } = useAuth();
  const { playlist, currentTrack, recommendations } = usePlayer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
              Welcome to SmoothMix
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Transform your Spotify playlists into seamless crossfaded experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-spotify-black/40 p-6 rounded-xl border border-spotify-gray/20">
              <div className="w-12 h-12 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Crossfading</h3>
              <p className="text-gray-400 text-sm">
                Intelligent 4-7 second crossfades based on BPM and audio features
              </p>
            </div>

            <div className="bg-spotify-black/40 p-6 rounded-xl border border-spotify-gray/20">
              <div className="w-12 h-12 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l-3.5 3.5 1.41 1.41L9.83 14H15v-2H9.83l-2.92-2.92L5.5 10.5 9 12zm6-6L12.17 10H7v2h5.17l2.92 2.92L16.5 13.5 13 12l3.5-3.5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Recommendations</h3>
              <p className="text-gray-400 text-sm">
                Get next track suggestions based on energy, key, and tempo matching
              </p>
            </div>

            <div className="bg-spotify-black/40 p-6 rounded-xl border border-spotify-gray/20">
              <div className="w-12 h-12 bg-spotify-green/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Seamless Flow</h3>
              <p className="text-gray-400 text-sm">
                Create uninterrupted listening experiences with perfect transitions
              </p>
            </div>
          </div>

          <div className="bg-spotify-black/40 p-8 rounded-xl border border-spotify-gray/20">
            <h3 className="text-xl font-semibold text-white mb-4">Get Started</h3>
            <p className="text-gray-400 mb-6">
              Connect your Spotify account to analyze playlists and create smooth mixes
            </p>
            <p className="text-sm text-gray-500">
              We'll need permission to read your playlists and control playback
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Playlist Input and Current Track */}
        <div className="lg:col-span-2 space-y-6">
          <PlaylistInput 
            onLoad={setLoading} 
            onError={setError}
            loading={loading}
          />

          {currentTrack && (
            <NowPlaying track={currentTrack} />
          )}

          {currentTrack && (
            <PlayerControls />
          )}
        </div>

        {/* Right Column - Recommendations */}
        <div>
          {recommendations.length > 0 && (
            <RecommendationList recommendations={recommendations} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;