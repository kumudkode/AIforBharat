import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { playlistService, UserPlaylist, PlaylistStats } from '../../services/playlistService';
import { EnhancedTrack } from '../../services/musicService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

interface PlaylistManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export function PlaylistManager({ isVisible, onClose }: PlaylistManagerProps) {
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<UserPlaylist | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [stats, setStats] = useState<PlaylistStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { playTrack } = useMusicPlayer();

  useEffect(() => {
    if (isVisible) {
      loadPlaylists();
      loadStats();
    }
  }, [isVisible]);

  useEffect(() => {
    const unsubscribe = playlistService.onPlaylistsChanged((updatedPlaylists) => {
      setPlaylists(updatedPlaylists);
      loadStats();
    });

    return unsubscribe;
  }, []);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      const loadedPlaylists = await playlistService.getPlaylists();
      setPlaylists(loadedPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const playlistStats = await playlistService.getPlaylistStats();
      setStats(playlistStats);
    } catch (error) {
      console.error('Failed to load playlist stats:', error);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    try {
      const playlist = await playlistService.createPlaylist(
        newPlaylistName,
        newPlaylistDescription || undefined
      );
      
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setIsCreating(false);
      setSelectedPlaylist(playlist);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    if (!confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await playlistService.deletePlaylist(playlistId);
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  };

  const handlePlayPlaylist = (playlist: UserPlaylist) => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleRemoveTrackFromPlaylist = async (trackIndex: number) => {
    if (!selectedPlaylist) return;

    try {
      await playlistService.removeTrackFromPlaylist(selectedPlaylist.id, trackIndex);
      // Refresh selected playlist
      const updated = await playlistService.getPlaylist(selectedPlaylist.id);
      setSelectedPlaylist(updated);
    } catch (error) {
      console.error('Failed to remove track from playlist:', error);
    }
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    playlist.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎵</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Playlists
                </h2>
                {stats && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.totalPlaylists} playlists • {stats.totalTracks} tracks • {formatDuration(stats.totalDuration)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Playlist
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="text-gray-600 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar - Playlist List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              {/* Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search playlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Playlist List */}
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : filteredPlaylists.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No playlists found' : 'No playlists yet'}
                  </div>
                ) : (
                  filteredPlaylists.map((playlist) => (
                    <motion.div
                      key={playlist.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlaylist(playlist)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedPlaylist?.id === playlist.id
                          ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {playlist.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {playlist.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {playlist.trackCount} tracks • {formatDuration(playlist.duration)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedPlaylist ? (
                <div className="p-6">
                  {/* Playlist Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                        {selectedPlaylist.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {selectedPlaylist.name}
                        </h1>
                        {selectedPlaylist.description && (
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {selectedPlaylist.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {selectedPlaylist.trackCount} tracks • {formatDuration(selectedPlaylist.duration)} • Created {selectedPlaylist.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handlePlayPlaylist(selectedPlaylist)}
                        disabled={selectedPlaylist.tracks.length === 0}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Play All
                      </Button>
                      <Button
                        onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* Track List */}
                  <div className="space-y-2">
                    {selectedPlaylist.tracks.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-4">🎵</div>
                        <p className="text-lg mb-2">This playlist is empty</p>
                        <p className="text-sm">Add tracks from the main dashboard to get started</p>
                      </div>
                    ) : (
                      selectedPlaylist.tracks.map((track, index) => (
                        <motion.div
                          key={`${track.name}-${track.artist}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group"
                        >
                          <div className="text-sm text-gray-500 dark:text-gray-400 w-8">
                            {index + 1}
                          </div>
                          <img
                            src={track.albumArt || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=48&h=48&fit=crop'}
                            alt={track.album}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                              {track.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {track.artist}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            {track.duration && formatDuration(track.duration)}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                            <Button
                              onClick={() => playTrack(track, selectedPlaylist.tracks)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </Button>
                            <Button
                              onClick={() => handleRemoveTrackFromPlaylist(index)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎵</div>
                    <p className="text-xl mb-2">Select a playlist to view details</p>
                    <p className="text-sm">Or create a new playlist to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Create Playlist Modal */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setIsCreating(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Create New Playlist
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Playlist Name *
                    </label>
                    <input
                      type="text"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="My Awesome Playlist"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="A collection of my favorite tracks..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    onClick={() => setIsCreating(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Create Playlist
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}