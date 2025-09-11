import React from 'react';

const NowPlaying = ({ track }) => {
  if (!track) return null;

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getKeyNotation = (key, mode) => {
    const keys = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
    const keyName = keys[key] || 'Unknown';
    const modeName = mode === 1 ? 'Major' : 'Minor';
    return `${keyName} ${modeName}`;
  };

  const getEnergyLevel = (energy) => {
    if (energy > 0.8) return { text: 'High Energy', color: 'text-red-400' };
    if (energy > 0.6) return { text: 'Medium-High', color: 'text-orange-400' };
    if (energy > 0.4) return { text: 'Medium', color: 'text-yellow-400' };
    if (energy > 0.2) return { text: 'Low-Medium', color: 'text-blue-400' };
    return { text: 'Low Energy', color: 'text-green-400' };
  };

  const audioFeatures = track.audio_features;
  const energyLevel = audioFeatures ? getEnergyLevel(audioFeatures.energy) : null;

  return (
    <div className="bg-gradient-to-br from-spotify-black/60 to-spotify-dark/60 p-6 rounded-xl border border-spotify-gray/20 backdrop-blur-sm">
      <div className="flex items-start space-x-4">
        {/* Album Art */}
        {track.image && (
          <div className="relative">
            <img
              src={track.image}
              alt={track.album}
              className="w-24 h-24 rounded-lg shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
          </div>
        )}

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <h3 className="text-xl font-bold text-white truncate mb-1">
              {track.name}
            </h3>
            <p className="text-spotify-gray truncate">
              by {track.artist}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {track.album} • {formatTime(track.duration_ms)}
            </p>
          </div>

          {/* Audio Features */}
          {audioFeatures && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-spotify-dark/40 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">BPM</div>
                <div className="text-lg font-bold text-white">
                  {Math.round(audioFeatures.tempo)}
                </div>
              </div>

              <div className="bg-spotify-dark/40 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Key</div>
                <div className="text-sm font-semibold text-white">
                  {getKeyNotation(audioFeatures.key, audioFeatures.mode)}
                </div>
              </div>

              <div className="bg-spotify-dark/40 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Energy</div>
                <div className={`text-sm font-semibold ${energyLevel.color}`}>
                  {energyLevel.text}
                </div>
              </div>

              <div className="bg-spotify-dark/40 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Dance</div>
                <div className="text-lg font-bold text-white">
                  {Math.round(audioFeatures.danceability * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Features Bar */}
      {audioFeatures && (
        <div className="mt-4 pt-4 border-t border-spotify-gray/20">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Valence:</span>
              <span className="text-white font-medium">
                {Math.round(audioFeatures.valence * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Acoustics:</span>
              <span className="text-white font-medium">
                {Math.round(audioFeatures.acousticness * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Loudness:</span>
              <span className="text-white font-medium">
                {Math.round(audioFeatures.loudness)} dB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Spotify Link */}
      {track.external_urls?.spotify && (
        <div className="mt-4 pt-4 border-t border-spotify-gray/20">
          <a
            href={track.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-spotify-green hover:text-green-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5c-.203 0-.402-.096-.527-.27-.78-.926-1.927-1.457-3.182-1.472-1.579-.02-3.193.375-4.291 1.053a.75.75 0 0 1-.84-1.244c1.378-.926 3.348-1.375 5.131-1.35 1.631.025 3.199.729 4.236 1.896a.75.75 0 0 1-.527 1.287z"/>
            </svg>
            <span>Open in Spotify</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default NowPlaying;