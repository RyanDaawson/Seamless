import React from 'react';

const Callback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-spotify-green border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl text-white mb-2">Connecting to Spotify...</h2>
        <p className="text-spotify-gray">Please wait while we set up your account.</p>
      </div>
    </div>
  );
};

export default Callback;