import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh_token'));
  const [loading, setLoading] = useState(true);

  const login = async () => {
    try {
      const { authUrl } = await api.auth.login();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) return false;
    
    try {
      const response = await api.auth.refresh(refreshToken);
      
      if (response.access_token) {
        setAccessToken(response.access_token);
        localStorage.setItem('access_token', response.access_token);
        
        if (response.refresh_token) {
          setRefreshToken(response.refresh_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
    
    return false;
  };

  const fetchUserProfile = async (token) => {
    try {
      const profile = await api.spotify.getProfile(token);
      if (profile.error) {
        throw new Error(profile.error);
      }
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.message.includes('401') && refreshToken) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          fetchUserProfile(accessToken);
        }
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Check URL for auth callback tokens
      const urlParams = new URLSearchParams(window.location.search);
      const urlAccessToken = urlParams.get('access_token');
      const urlRefreshToken = urlParams.get('refresh_token');
      
      if (urlAccessToken) {
        setAccessToken(urlAccessToken);
        localStorage.setItem('access_token', urlAccessToken);
        
        if (urlRefreshToken) {
          setRefreshToken(urlRefreshToken);
          localStorage.setItem('refresh_token', urlRefreshToken);
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, '/');
      }
      
      if (accessToken) {
        await fetchUserProfile(accessToken);
      }
      
      setLoading(false);
    };

    initAuth();
  }, [accessToken]);

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    refreshAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};