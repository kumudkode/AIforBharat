// Simple test script to verify playlist and favorites functionality
import { playlistService } from './services/playlistService';
import { favoritesService } from './services/favoritesService';
import { EnhancedTrack } from './services/musicService';

// Test data
const testTrack: EnhancedTrack = {
  name: 'Test Song',
  artist: 'Test Artist',
  playcount: '1000',
  listeners: '500',
  url: '#',
  previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  albumArt: 'https://picsum.photos/300/300?random=1',
  duration: 180,
  album: 'Test Album',
  isPlayable: true,
  audioQuality: 'medium',
  alternativeUrls: []
};

export async function testPlaylistFunctionality() {
  console.log('🧪 Testing Playlist Functionality...');
  
  try {
    // Test playlist creation
    const playlist = await playlistService.createPlaylist('Test Playlist', 'A test playlist');
    console.log('✅ Created playlist:', playlist.name);
    
    // Test adding track to playlist
    await playlistService.addTrackToPlaylist(playlist.id, testTrack);
    console.log('✅ Added track to playlist');
    
    // Test getting playlists
    const playlists = await playlistService.getPlaylists();
    console.log('✅ Retrieved playlists:', playlists.length);
    
    // Test playlist stats
    const stats = await playlistService.getPlaylistStats();
    console.log('✅ Playlist stats:', stats);
    
    return true;
  } catch (error) {
    console.error('❌ Playlist test failed:', error);
    return false;
  }
}

export async function testFavoritesFunctionality() {
  console.log('🧪 Testing Favorites Functionality...');
  
  try {
    // Test adding to favorites
    await favoritesService.addToFavorites(testTrack);
    console.log('✅ Added track to favorites');
    
    // Test checking if favorite
    const isFavorite = favoritesService.isFavorite(testTrack);
    console.log('✅ Is favorite:', isFavorite);
    
    // Test getting favorites
    const favorites = await favoritesService.getFavorites();
    console.log('✅ Retrieved favorites:', favorites.length);
    
    // Test favorites stats
    const stats = await favoritesService.getFavoritesStats();
    console.log('✅ Favorites stats:', stats);
    
    return true;
  } catch (error) {
    console.error('❌ Favorites test failed:', error);
    return false;
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  console.log('🚀 Running Playlist and Favorites Tests...');
  
  Promise.all([
    testPlaylistFunctionality(),
    testFavoritesFunctionality()
  ]).then(([playlistResult, favoritesResult]) => {
    if (playlistResult && favoritesResult) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️ Some tests failed');
    }
  });
}