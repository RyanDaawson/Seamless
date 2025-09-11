import express from 'express';
import axios from 'axios';

const router = express.Router();

// Middleware to validate Spotify access token
const validateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  req.accessToken = authHeader.split(' ')[1];
  next();
};

// Get user profile
router.get('/me', validateToken, async (req, res) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${req.accessToken}` }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch user profile' });
  }
});

// Extract playlist ID from Spotify URL
function extractPlaylistId(url) {
  const regex = /spotify\.com\/playlist\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Get playlist tracks and audio features
router.post('/playlist/analyze', validateToken, async (req, res) => {
  const { playlistUrl } = req.body;
  
  if (!playlistUrl) {
    return res.status(400).json({ error: 'Playlist URL is required' });
  }
  
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId) {
    return res.status(400).json({ error: 'Invalid Spotify playlist URL' });
  }
  
  try {
    // Get playlist details
    const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${req.accessToken}` }
    });
    
    // Get all tracks (handle pagination)
    let tracks = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;
    
    while (nextUrl) {
      const response = await axios.get(nextUrl, {
        headers: { Authorization: `Bearer ${req.accessToken}` }
      });
      
      tracks = tracks.concat(response.data.items);
      nextUrl = response.data.next;
    }
    
    // Filter out non-track items (podcasts, etc.) and extract track IDs
    const validTracks = tracks.filter(item => item.track && item.track.type === 'track');
    const trackIds = validTracks.map(item => item.track.id);
    
    // Get audio features for all tracks (in batches of 100)
    let allAudioFeatures = [];
    for (let i = 0; i < trackIds.length; i += 100) {
      const batch = trackIds.slice(i, i + 100);
      const featuresResponse = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${batch.join(',')}`, {
        headers: { Authorization: `Bearer ${req.accessToken}` }
      });
      allAudioFeatures = allAudioFeatures.concat(featuresResponse.data.audio_features);
    }
    
    // Combine track info with audio features
    const analyzedTracks = validTracks.map((item, index) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map(a => a.name).join(', '),
      album: item.track.album.name,
      duration_ms: item.track.duration_ms,
      preview_url: item.track.preview_url,
      external_urls: item.track.external_urls,
      image: item.track.album.images[0]?.url,
      audio_features: allAudioFeatures[index]
    }));
    
    res.json({
      playlist: {
        id: playlistResponse.data.id,
        name: playlistResponse.data.name,
        description: playlistResponse.data.description,
        owner: playlistResponse.data.owner.display_name,
        total_tracks: analyzedTracks.length,
        image: playlistResponse.data.images[0]?.url
      },
      tracks: analyzedTracks
    });
    
  } catch (error) {
    console.error('Error analyzing playlist:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to analyze playlist' });
  }
});

// Get recommendations based on audio features
router.post('/recommendations', validateToken, async (req, res) => {
  const { currentTrack, trackPool, count = 5 } = req.body;
  
  if (!currentTrack || !currentTrack.audio_features) {
    return res.status(400).json({ error: 'Current track with audio features required' });
  }
  
  try {
    // Calculate similarity scores for all tracks in pool
    const recommendations = trackPool
      .filter(track => track.id !== currentTrack.id && track.audio_features)
      .map(track => {
        const features = track.audio_features;
        const currentFeatures = currentTrack.audio_features;
        
        // Calculate similarity based on key musical features
        const tempoSimilarity = 1 - Math.abs(features.tempo - currentFeatures.tempo) / 200;
        const keySimilarity = features.key === currentFeatures.key ? 1 : 0.5;
        const energySimilarity = 1 - Math.abs(features.energy - currentFeatures.energy);
        const valenceSimilarity = 1 - Math.abs(features.valence - currentFeatures.valence);
        const danceabilitySimilarity = 1 - Math.abs(features.danceability - currentFeatures.danceability);
        
        // Weighted similarity score
        const similarity = (
          tempoSimilarity * 0.3 +
          keySimilarity * 0.2 +
          energySimilarity * 0.2 +
          valenceSimilarity * 0.15 +
          danceabilitySimilarity * 0.15
        );
        
        return { ...track, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);
    
    res.json({ recommendations });
    
  } catch (error) {
    console.error('Error generating recommendations:', error.message);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;