import React, { createContext, useContext, useReducer, useRef } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

const initialState = {
  playlist: null,
  tracks: [],
  currentTrack: null,
  nextTrack: null,
  recommendations: [],
  isPlaying: false,
  crossfadeDuration: 5000, // 5 seconds
  volume: 0.7,
  currentTime: 0,
  duration: 0
};

const playerReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_PLAYLIST':
      return {
        ...state,
        playlist: action.payload.playlist,
        tracks: action.payload.tracks,
        currentTrack: action.payload.tracks[0] || null
      };
    
    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload
      };
    
    case 'SET_NEXT_TRACK':
      return {
        ...state,
        nextTrack: action.payload
      };
    
    case 'SET_RECOMMENDATIONS':
      return {
        ...state,
        recommendations: action.payload
      };
    
    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload
      };
    
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload
      };
    
    case 'SET_TIME':
      return {
        ...state,
        currentTime: action.payload.currentTime,
        duration: action.payload.duration || state.duration
      };
    
    case 'SET_CROSSFADE_DURATION':
      return {
        ...state,
        crossfadeDuration: action.payload
      };
    
    default:
      return state;
  }
};

export const PlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const currentAudioRef = useRef(null);
  const nextAudioRef = useRef(null);
  const crossfadeTimeoutRef = useRef(null);

  const loadPlaylist = (playlist, tracks) => {
    dispatch({
      type: 'LOAD_PLAYLIST',
      payload: { playlist, tracks }
    });
  };

  const setCurrentTrack = (track) => {
    dispatch({ type: 'SET_CURRENT_TRACK', payload: track });
  };

  const setNextTrack = (track) => {
    dispatch({ type: 'SET_NEXT_TRACK', payload: track });
  };

  const setRecommendations = (recommendations) => {
    dispatch({ type: 'SET_RECOMMENDATIONS', payload: recommendations });
  };

  const play = () => {
    if (currentAudioRef.current && state.currentTrack?.preview_url) {
      currentAudioRef.current.play().catch(console.error);
      dispatch({ type: 'SET_PLAYING', payload: true });
    }
  };

  const pause = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  };

  const setVolume = (volume) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = volume;
    }
    if (nextAudioRef.current) {
      nextAudioRef.current.volume = volume;
    }
  };

  const setCrossfadeDuration = (duration) => {
    dispatch({ type: 'SET_CROSSFADE_DURATION', payload: duration });
  };

  const startCrossfade = (nextTrack) => {
    if (!nextTrack?.preview_url || !currentAudioRef.current) return;

    // Clear any existing crossfade
    if (crossfadeTimeoutRef.current) {
      clearTimeout(crossfadeTimeoutRef.current);
    }

    // Start playing next track at low volume
    if (nextAudioRef.current) {
      nextAudioRef.current.src = nextTrack.preview_url;
      nextAudioRef.current.volume = 0;
      nextAudioRef.current.play().catch(console.error);
    }

    // Crossfade duration
    const crossfadeDuration = state.crossfadeDuration;
    const steps = 50; // Number of volume adjustment steps
    const stepDuration = crossfadeDuration / steps;
    const volumeStep = state.volume / steps;

    let step = 0;
    const crossfadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;

      // Fade out current track
      if (currentAudioRef.current) {
        currentAudioRef.current.volume = state.volume * (1 - progress);
      }

      // Fade in next track
      if (nextAudioRef.current) {
        nextAudioRef.current.volume = state.volume * progress;
      }

      if (step >= steps) {
        clearInterval(crossfadeInterval);
        
        // Switch references
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        
        // Swap audio refs
        const temp = currentAudioRef.current;
        currentAudioRef.current = nextAudioRef.current;
        nextAudioRef.current = temp;

        // Update current track
        setCurrentTrack(nextTrack);
      }
    }, stepDuration);
  };

  const value = {
    ...state,
    loadPlaylist,
    setCurrentTrack,
    setNextTrack,
    setRecommendations,
    play,
    pause,
    setVolume,
    setCrossfadeDuration,
    startCrossfade,
    currentAudioRef,
    nextAudioRef
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};