import React, { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const RecommendationList = ({ recommendations }) => {
  const { setCurrentTrack, setRecommendations, currentTrack, tracks } = usePlayer();
  const { accessToken } = useAuth();

  const handleTrackSelect = async (track) => {
    setCurrentTrack(track);
    
    // Get new recommendations for the selected track
    try {
      const newRecommendations = await api.spotify.getRecommendations(
        accessToken,
        track,
        tracks.filter(t => t.id !== track.id)
      );
      
      if (newRecommendations.recommendations) {
        setRecommendations(newRecommendations.recommendations);
      }
    } catch (error) {
      console.error('Error getting new recommendations:', error);
    }
  };

  const formatSimilarity = (similarity) => {
    return Math.round(similarity * 100);
  };

  const getSimilarityColor = (similarity) => {
    if (similarity > 0.8) return 'text-green-400';
    if (similarity > 0.6) return 'text-yellow-400';
    if (similarity > 0.4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSimilarityBg = (similarity) => {
    if (similarity > 0.8) return 'bg-green-400/10 border-green-400/20';
    if (similarity > 0.6) return 'bg-yellow-400/10 border-yellow-400/20';
    if (similarity > 0.4) return 'bg-orange-400/10 border-orange-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-spotify-black/40 p-6 rounded-xl border border-spotify-gray/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Smooth Recommendations
        </h3>
        <p className="text-gray-400 text-sm">
          Load a playlist and select a track to see AI-powered recommendations for smooth transitions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-spotify-black/40 p-6 rounded-xl border border-spotify-gray/20 sticky top-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        Next Up - Smooth Transitions
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recommendations.map((track, index) => (
          <div
            key={track.id}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${getSimilarityBg(track.similarity)}`}
            onClick={() => handleTrackSelect(track)}
          >
            <div className="flex items-center space-x-3">
              {/* Track Number & Similarity */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-400 font-medium">
                  #{index + 1}
                </div>
                <div className={`text-xs font-bold ${getSimilarityColor(track.similarity)}`}>
                  {formatSimilarity(track.similarity)}%
                </div>
              </div>

              {/* Album Art */}
              {track.image && (
                <img
                  src={track.image}
                  alt={track.album}
                  className="w-12 h-12 rounded shadow-md"
                />
              )}

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate text-sm">
                  {track.name}
                </h4>
                <p className="text-gray-400 text-xs truncate">
                  {track.artist}
                </p>
                {track.audio_features && (
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {Math.round(track.audio_features.tempo)} BPM
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-500">
                      {Math.round(track.audio_features.energy * 100)}% Energy
                    </span>
                  </div>
                )}
              </div>

              {/* Play Button */}
              <button className="p-2 rounded-full bg-spotify-green/20 hover:bg-spotify-green/30 transition-colors">
                <svg className="w-4 h-4 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>

            {/* Match Reasons */}
            <div className="mt-2 flex flex-wrap gap-1">
              {track.audio_features && currentTrack?.audio_features && (
                <>
                  {Math.abs(track.audio_features.tempo - currentTrack.audio_features.tempo) < 10 && (
                    <span className="text-xs bg-green-400/20 text-green-300 px-2 py-1 rounded-full">
                      Similar BPM
                    </span>
                  )}
                  {track.audio_features.key === currentTrack.audio_features.key && (
                    <span className="text-xs bg-blue-400/20 text-blue-300 px-2 py-1 rounded-full">
                      Same Key
                    </span>
                  )}
                  {Math.abs(track.audio_features.energy - currentTrack.audio_features.energy) < 0.2 && (
                    <span className="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full">
                      Similar Energy
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-spotify-gray/20">
        <p className="text-xs text-gray-400">
          Recommendations are ranked by similarity in tempo, key, energy, and danceability for the smoothest transitions.
        </p>
      </div>
    </div>
  );
};

export default RecommendationList;