import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { favoritesService, FavoritesStats } from '../../services/favoritesService';
import { EnhancedTrack } from '../../services/musicService';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';

interface FavoritesViewProps {
  isVisible: boolean;
  onClose: () => void;
}

type SortOption = 'recent' | 'name' | 'artist' | 'duration';
type ViewMode = 'grid' | 'list';

export function FavoritesView({ isVisible, onClose }: FavoritesViewProps) {
  const [favorites, setFavorites] = useState<EnhancedTrack[]>([]);
  const [stats, setStats] = useState<FavoritesStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [genreMap, setGenreMap] = useState<Map<string, EnhancedTrack[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  const { playTrack } = useMusicPlayer();

  useEffect(() => {
    if (isVisible) {
      loadFavorites();
      loadStats();
      loadGenreMap();
    }
  }, [isVisible]);

  useEffect(() => {
    const unsubscribe = favoritesService.onFavoritesChanged((updatedFavorites) => {
      setFavorites(updatedFavorites);
      loadStats();
      loadGenreMap();
    });

    return unsubscribe;
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const loadedFavorites = await favoritesService.getFavorites();
      setFavorites(loadedFavorites);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const favoritesStats = await favoritesService.getFavoritesStats();
      setStats(favoritesStats);
    } catch (error) {
      console.error('Failed to load favorites stats:', error);
    }
  };

  const loadGenreMap = async () => {
    try {
      const genres = await favoritesService.getFavoritesByGenre();
      setGenreMap(genres);
    } catch (error) {
      console.error('Failed to load genre map:', error);
    }
  };

  const handleRemoveFromFavorites = async (track: EnhancedTrack) => {
    try {
      await favoritesService.removeFromFavoritesByTrack(track);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const handlePlayAllFavorites = () => {
    if (filteredAndSortedFavorites.length > 0) {
      playTrack(filteredAndSortedFavorites[0], filteredAndSortedFavorites);
    }
  };

  const handleShuffleFavorites = () => {
    if (filteredAndSortedFavorites.length > 0) {
      const shuffled = [...filteredAndSortedFavorites].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const handleClearAllFavorites = async () => {
    if (!confirm('Are you sure you want to remove all favorites? This action cannot be undone.')) {
      return;
    }

    try {
      await favoritesService.clearAllFavorites();
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  };

  // Filter and sort favorites
  const filteredFavorites = favorites.filter(track => {
    const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.album?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedGenre === 'all') return matchesSearch;
    
    const trackGenre = (track as any).genre || 'Unknown';
    return matchesSearch && trackGenre === selectedGenre;
  });

  const filteredAndSortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        const aTime = (a as any).favoritedAt?.getTime() || 0;
        const bTime = (b as any).favoritedAt?.getTime() || 0;
        return bTime - aTime;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'artist':
        return a.artist.localeCompare(b.artist);
      case 'duration':
        return (b.duration || 0) - (a.duration || 0);
      default:
        return 0;
    }
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (seconds: number) => {
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
              <div className="text-2xl">❤️</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Favorites
                </h2>
                {stats && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.totalFavorites} tracks • {formatTotalDuration(stats.totalDuration)} • {stats.recentlyAdded} added this week
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePlayAllFavorites}
                disabled={filteredAndSortedFavorites.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Play All
              </Button>
              <Button
                onClick={handleShuffleFavorites}
                disabled={filteredAndSortedFavorites.length === 0}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 7a1 1 0 000 2h1.5L9 5.5 12.5 9H14a1 1 0 100-2h-1.5L9 10.5 5.5 7H4zM4 13a1 1 0 100 2h1.5L9 11.5 12.5 15H14a1 1 0 100-2h-1.5L9 16.5 5.5 13H4z" />
                </svg>
                Shuffle
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

          {/* Controls */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>

              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Genres</option>
                {Array.from(genreMap.keys()).map(genre => (
                  <option key={genre} value={genre}>
                    {genre} ({genreMap.get(genre)?.length})
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Recently Added</option>
                <option value="name">Song Name</option>
                <option value="artist">Artist</option>
                <option value="duration">Duration</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Clear All */}
              {favorites.length > 0 && (
                <Button
                  onClick={handleClearAllFavorites}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                />
              </div>
            ) : filteredAndSortedFavorites.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">❤️</div>
                {searchQuery || selectedGenre !== 'all' ? (
                  <>
                    <p className="text-xl mb-2">No favorites found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl mb-2">No favorites yet</p>
                    <p className="text-sm">Click the heart icon on any track to add it to your favorites</p>
                  </>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAndSortedFavorites.map((track, index) => (
                  <motion.div
                    key={`${track.name}-${track.artist}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => playTrack(track, filteredAndSortedFavorites)}
                  >
                    <div className="relative mb-3">
                      <img
                        src={track.albumArt || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop'}
                        alt={track.album}
                        className="w-full aspect-square rounded-md object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites(track);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-1">
                      {track.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {track.artist}
                    </p>
                    {track.duration && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDuration(track.duration)}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedFavorites.map((track, index) => (
                  <motion.div
                    key={`${track.name}-${track.artist}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 group cursor-pointer"
                    onClick={() => playTrack(track, filteredAndSortedFavorites)}
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
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites(track);
                        }}
                        className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}