import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, loading, login, logout } = useAuth();

  return (
    <header className="bg-spotify-black/50 backdrop-blur-sm border-b border-spotify-gray/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-spotify-green to-green-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
              SmoothMix
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse bg-gray-700 h-8 w-20 rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {user.images && user.images[0] && (
                    <img
                      src={user.images[0].url}
                      alt={user.display_name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-white hidden sm:block">
                    {user.display_name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm bg-spotify-gray/20 hover:bg-spotify-gray/30 text-white rounded-full transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-6 py-2 bg-spotify-green hover:bg-green-500 text-white font-semibold rounded-full transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 14.5c-.203 0-.402-.096-.527-.27-.78-.926-1.927-1.457-3.182-1.472-1.579-.02-3.193.375-4.291 1.053a.75.75 0 0 1-.84-1.244c1.378-.926 3.348-1.375 5.131-1.35 1.631.025 3.199.729 4.236 1.896a.75.75 0 0 1-.527 1.287zm.75-3.75c-.266 0-.527-.12-.703-.33-1.33-1.426-3.422-1.97-5.547-1.97-1.578 0-3.117.375-4.398 1.074a.75.75 0 0 1-.703-1.322c1.542-.84 3.398-1.252 5.101-1.252 2.578 0 4.969.67 6.75 2.227a.75.75 0 0 1-.5 1.313v.26zm1.125-3.75c-.328 0-.637-.148-.844-.406-1.969-2.453-5.063-2.844-7.781-2.844-2.016 0-4.047.422-5.766 1.219a.75.75 0 0 1-.609-1.371c2.016-1.125 4.453-1.598 6.375-1.598 3.328 0 7.109.516 9.656 3.516a.75.75 0 0 1-.875 1.234l-.156.25z"/>
                </svg>
                <span>Login with Spotify</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;