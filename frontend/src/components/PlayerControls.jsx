import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

const PlayerControls = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    crossfadeDuration,
    play,
    pause,
    setVolume,
    setCrossfadeDuration,
    startCrossfade,
    currentAudioRef,
    nextAudioRef,
    recommendations
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const audio = currentAudioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleLoadedData = () => setIsLoading(false);
    const handleEnded = () => {
      // Auto-play next recommended track with crossfade
      if (recommendations.length > 0) {
        startCrossfade(recommendations[0]);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, recommendations, startCrossfade]);

  useEffect(() => {
    // Set up audio elements when current track changes
    if (currentTrack?.preview_url && currentAudioRef.current) {
      currentAudioRef.current.src = currentTrack.preview_url;
      currentAudioRef.current.volume = volume;
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentTrack, volume]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const audio = currentAudioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleCrossfadeToNext = () => {
    if (recommendations.length > 0) {
      startCrossfade(recommendations[0]);
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="bg-spotify-black/60 p-6 rounded-xl border border-spotify-gray/20 backdrop-blur-sm">
      {/* Hidden audio elements */}
      <audio ref={currentAudioRef} preload="auto" />
      <audio ref={nextAudioRef} preload="auto" />

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <div 
          className="w-full h-2 bg-spotify-gray/30 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div 
            className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-100 relative"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between mb-6">
        {/* Play/Pause Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={isPlaying ? pause : play}
            disabled={!currentTrack?.preview_url || isLoading}
            className="w-12 h-12 bg-spotify-green hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : isPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Crossfade to Next */}
          {recommendations.length > 0 && (
            <button
              onClick={handleCrossfadeToNext}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
              <span>Crossfade Next</span>
            </button>
          )}
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-3">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-spotify-gray/30 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </div>

      {/* Crossfade Settings */}
      <div className="border-t border-spotify-gray/20 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-white">
              Crossfade Duration
            </label>
            <p className="text-xs text-gray-400">
              Smooth transition time between tracks
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">
              {(crossfadeDuration / 1000).toFixed(1)}s
            </span>
            <input
              type="range"
              min="2000"
              max="7000"
              step="500"
              value={crossfadeDuration}
              onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
              className="w-24 h-1 bg-spotify-gray/30 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

      {/* Track Preview Notice */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {currentTrack?.preview_url ? (
          'Playing 30-second preview • Full playback available in Spotify'
        ) : (
          'No preview available for this track'
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1DB954;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #1DB954;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};

export default PlayerControls;