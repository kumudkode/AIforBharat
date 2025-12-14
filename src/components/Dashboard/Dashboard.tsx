import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ResponsiveGrid } from '../Layout/ResponsiveGrid';
import { ThemeToggle } from '../ThemeToggle';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { MusicIndicator } from '../MusicIndicator/MusicIndicator';
import { analyzeMusicMood, Track, getEnhancedMusicData, musicDataManager, EnhancedTrack, MultilingualTrack, getTrafficBasedRecommendations, getDisplayText } from '../../services/musicService';
import { getCurrentTraffic, TrafficData, getNextCityTraffic } from '../../services/trafficService';
import { generateCorrelationInsight, CorrelationInsight } from '../../services/correlationService';
import { playlistService } from '../../services/playlistService';
import { favoritesService } from '../../services/favoritesService';
import { PlaylistManager } from '../Playlist/PlaylistManager';
import { FavoritesView } from '../Favorites/FavoritesView';
import { TrafficVisualization } from '../Traffic/TrafficVisualization';
import { TrafficChart } from '../Traffic/TrafficChart';


export function Dashboard() {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [musicAnalysis, setMusicAnalysis] = useState<{
    primaryMood: string;
    confidence: number;
    topGenres: string[];
    trendingTracks: MultilingualTrack[];
    isRealTime: boolean;
    lastUpdate: Date | null;
    isStale: boolean;
  } | null>(null);
  const [correlationInsight, setCorrelationInsight] = useState<CorrelationInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [trafficRecommendations, setTrafficRecommendations] = useState<{
    recommendedTracks: MultilingualTrack[];
    recommendationReason: string;
    moodMatch: string;
  } | null>(null);
  const [showPlaylistManager, setShowPlaylistManager] = useState(false);
  const [showFavoritesView, setShowFavoritesView] = useState(false);
  const [selectedPlaylistForAdd, setSelectedPlaylistForAdd] = useState<string | null>(null);

  
  const { playTrack, showPlayer, isPlayerVisible } = useMusicPlayer();

  // Helper function to get language badge
  const getLanguageBadge = (track: MultilingualTrack) => {
    const languageColors = {
      hindi: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      english: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      mixed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    
    const languageLabels = {
      hindi: 'HI',
      english: 'EN',
      mixed: 'MX'
    };
    
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${languageColors[track.language]}`}>
        {languageLabels[track.language]}
      </span>
    );
  };

  // Helper functions for playlist and favorites
  const handleToggleFavorite = async (track: MultilingualTrack) => {
    try {
      console.log('Toggling favorite for track:', track.name);
      if (favoritesService.isFavorite(track)) {
        await favoritesService.removeFromFavoritesByTrack(track);
        console.log('Removed from favorites:', track.name);
      } else {
        await favoritesService.addToFavorites(track);
        console.log('Added to favorites:', track.name);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleAddToPlaylist = async (track: MultilingualTrack, playlistId: string) => {
    try {
      console.log('Adding track to playlist:', track.name, playlistId);
      await playlistService.addTrackToPlaylist(playlistId, track);
      setSelectedPlaylistForAdd(null);
      console.log('Successfully added to playlist');
    } catch (error) {
      console.error('Failed to add track to playlist:', error);
    }
  };



  const loadDashboard = async (forceRefresh: boolean = false) => {
    console.log('🔄 Loading dashboard data...');
    setIsLoading(true);
    if (forceRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      console.log('📡 Fetching music and traffic data...');
      const [musicData, trafficInfo] = await Promise.all([
        getEnhancedMusicData(forceRefresh),
        forceRefresh ? getNextCityTraffic() : getCurrentTraffic() // Use next city when refreshing
      ]);

      console.log('✅ Data fetched successfully:', { 
        musicTracks: musicData.trendingTracks.length,
        isRealTime: musicData.isRealTime,
        lastUpdate: musicData.lastUpdate,
        trafficInfo 
      });
      
      setMusicAnalysis(musicData);
      setTrafficData(trafficInfo);
      setLastRefreshTime(new Date());
      
      // Generate correlation insight
      const insight = generateCorrelationInsight(
        trafficInfo,
        musicData.primaryMood,
        musicData.topGenres
      );
      setCorrelationInsight(insight);
      
      // Get traffic-based music recommendations
      console.log('🎵 Generating traffic-based music recommendations...');
      const recommendations = await getTrafficBasedRecommendations(
        trafficInfo.level,
        trafficInfo.congestionScore
      );
      setTrafficRecommendations(recommendations);
      
      console.log('🎯 Dashboard loaded successfully');
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      const fallbackTraffic = {
        level: 'Moderate' as const,
        congestionScore: 60,
        averageSpeed: 35,
        incidents: 1,
        location: 'Current Area',
        timestamp: new Date()
      };
      
      const fallbackMusic = {
        primaryMood: 'Energetic',
        confidence: 75,
        topGenres: ['pop', 'rock', 'bollywood'],
        trendingTracks: [] as MultilingualTrack[],
        isRealTime: false,
        lastUpdate: null,
        isStale: true
      };
      
      setTrafficData(fallbackTraffic);
      setMusicAnalysis(fallbackMusic);
      setLastRefreshTime(new Date());
      
      const insight = generateCorrelationInsight(
        fallbackTraffic,
        fallbackMusic.primaryMood,
        fallbackMusic.topGenres
      );
      setCorrelationInsight(insight);
    } finally {
      setIsLoading(false);
      if (forceRefresh) {
        // Add a small delay to show the refresh animation
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };



  useEffect(() => {
    // Load initial data immediately
    loadDashboard();
    
    // Start real-time polling for music data (every 5-10 minutes for fresh content)
    musicDataManager.startPolling();
    
    // Subscribe to real-time updates
    const unsubscribe = musicDataManager.onDataUpdate((freshMusicData) => {
      console.log('🔄 Received real-time music update');
      setMusicAnalysis(prev => ({
        ...freshMusicData,
        isRealTime: true,
        lastUpdate: new Date(),
        isStale: false
      }));
      
      // Update correlation insight with fresh data
      if (trafficData) {
        const insight = generateCorrelationInsight(
          trafficData,
          freshMusicData.primaryMood,
          freshMusicData.topGenres
        );
        setCorrelationInsight(insight);
      }
    });
    
    // Set up auto-refresh for all data every 30 minutes
    const autoRefreshInterval = setInterval(async () => {
      try {
        console.log('🔄 Auto-refreshing all dashboard data (30min interval)...');
        await loadDashboard(true);
      } catch (error) {
        console.error('❌ Error during auto-refresh:', error);
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    // Cleanup on unmount
    return () => {
      musicDataManager.stopPolling();
      unsubscribe();
      clearInterval(autoRefreshInterval);
    };
  }, []);

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-600 dark:text-green-400';
      case 'Moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'Chill': return '😌';
      case 'Energetic': return '⚡';
      case 'Focus': return '🎯';
      default: return '🎵';
    }
  };

  const getTrafficIcon = (level: string) => {
    switch (level) {
      case 'Low': return '🟢';
      case 'Moderate': return '🟡';
      case 'High': return '🔴';
      default: return '🚦';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎵 Music × 🚦 Traffic Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {/* Playlist and Favorites Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowPlaylistManager(true)}
                  size="sm"
                  variant="outline"
                  className="text-purple-600 dark:text-purple-400 border-purple-300 hover:border-purple-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Playlists
                </Button>
                <Button
                  onClick={() => setShowFavoritesView(true)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 dark:text-red-400 border-red-300 hover:border-red-400"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Favorites
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3">
                  {musicAnalysis?.isRealTime && (
                    <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Music (5-10min) • Traffic (30min auto)
                    </div>
                  )}
                  {lastRefreshTime && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last refresh: {lastRefreshTime.toLocaleTimeString()}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={() => loadDashboard(true)} 
                  disabled={isLoading}
                  size="sm"
                  className={`${isRefreshing ? 'bg-blue-500 hover:bg-blue-600' : ''} transition-colors duration-300`}
                >
                  <div className="flex items-center gap-2">
                    <motion.svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                    {isLoading ? 'Refreshing...' : 'Refresh Data'}
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Traffic Data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={`dashboard-${lastRefreshTime?.getTime()}`} // Key changes to trigger animation on refresh
          className="mb-8"
        >
          <div className="flex justify-center">
            {/* Traffic Status Card - Modern Visualization */}
            <motion.div
              animate={isRefreshing ? { 
                boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.7)", "0 0 0 10px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"] 
              } : {}}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl"
            >
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    🚦 Live Traffic Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {trafficData ? (
                    <TrafficVisualization trafficData={trafficData} />
                  ) : (
                    <div className="p-6 text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
                      />
                      <p className="text-gray-500 dark:text-gray-400">Loading traffic data...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Trending Tracks Section */}
        {musicAnalysis && musicAnalysis.trendingTracks.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center justify-between">
                    <span>🔥 Trending Tracks</span>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>{musicAnalysis.trendingTracks.length} tracks</span>
                      <span className="text-xs">
                        ({musicAnalysis.trendingTracks.filter(t => t.language === 'hindi').length} Hindi, {musicAnalysis.trendingTracks.filter(t => t.language === 'english').length} English)
                      </span>
                      {musicAnalysis.lastUpdate && (
                        <span className="text-xs">
                          Updated {new Date(musicAnalysis.lastUpdate).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </CardTitle>
                  <Button
                    onClick={() => playTrack(musicAnalysis.trendingTracks[0], musicAnalysis.trendingTracks)}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {musicAnalysis.trendingTracks.slice(0, 20).map((track, index) => (
                    <motion.div
                      key={`${track.name}-${track.artist}-${lastRefreshTime?.getTime()}-${index}`} // Key changes to trigger animation on refresh
                      className="group relative p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => playTrack(track, musicAnalysis.trendingTracks)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={track.albumArt || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=48&h=48&fit=crop'}
                            alt={track.album}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {getDisplayText(track, 'title')}
                            </div>
                            {getLanguageBadge(track)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            by {getDisplayText(track, 'artist')}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {parseInt(track.playcount).toLocaleString()} plays
                            </div>
                            {track.duration && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(track);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              favoritesService.isFavorite(track)
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-100 hover:text-red-500'
                            }`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Show playlist selection dropdown
                              console.log('Add to playlist:', track.name);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-6 h-6 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-purple-100 hover:text-purple-500 rounded-full flex items-center justify-center transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Music Mood and Smart Recommendation Section */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ResponsiveGrid 
            columns={{ mobile: 1, tablet: 2, desktop: 2 }}
            gap="lg"
          >
            {/* Music Mood Card */}
            <motion.div
              animate={isRefreshing ? { 
                boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 10px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"] 
              } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎵 Trending Music Mood
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl mb-2">
                      {musicAnalysis ? getMoodEmoji(musicAnalysis.primaryMood) : '⏳'}
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {musicAnalysis ? musicAnalysis.primaryMood : 'Loading...'}
                    </div>
                    {musicAnalysis && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Confidence: {musicAnalysis.confidence}%
                        </p>
                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          {musicAnalysis.topGenres.slice(0, 3).map((genre, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Smart Recommendation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎧 Smart Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {correlationInsight ? (
                    <>
                      <div className="text-3xl mb-2">
                        {correlationInsight.recommendation.emoji}
                      </div>
                      <div className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                        {correlationInsight.recommendation.type}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {correlationInsight.recommendation.description}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {correlationInsight.recommendation.confidence}%
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {correlationInsight.recommendation.reasoning}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400">Loading recommendation...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ResponsiveGrid>
        </motion.div>

        {/* Traffic-Based Music Recommendations Section */}
        {trafficRecommendations && trafficRecommendations.recommendedTracks.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            key={`recommendations-${lastRefreshTime?.getTime()}`} // Key changes to trigger animation on refresh
          >
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🚦🎵</span>
                    <div>
                      <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        Traffic-Based Recommendations
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-normal">
                        {trafficRecommendations.moodMatch} Hindi & English music for {trafficData?.level.toLowerCase()} traffic
                        <span className="ml-2 text-xs">
                          ({trafficRecommendations.recommendedTracks.filter(t => t.language === 'hindi').length} Hindi, {trafficRecommendations.recommendedTracks.filter(t => t.language === 'english').length} English)
                        </span>
                      </div>
                    </div>
                  </CardTitle>
                  <Button
                    onClick={() => playTrack(trafficRecommendations.recommendedTracks[0], trafficRecommendations.recommendedTracks)}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play Recommended
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {trafficRecommendations.recommendationReason}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trafficRecommendations.recommendedTracks.slice(0, 16).map((track, index) => (
                    <motion.div
                      key={`${track.name}-${track.artist}-${index}`}
                      className="group relative p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer border border-blue-100 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg"
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => playTrack(track, trafficRecommendations.recommendedTracks)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={track.albumArt || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=48&h=48&fit=crop'}
                            alt={track.album}
                            className="w-12 h-12 rounded-md object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                              {getDisplayText(track, 'title')}
                            </div>
                            {getLanguageBadge(track)}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            by {getDisplayText(track, 'artist')}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {parseInt(track.playcount).toLocaleString()} plays
                            </div>
                            {track.duration && (
                              <div className="text-xs text-gray-500 dark:text-gray-500">
                                {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(track);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              favoritesService.isFavorite(track)
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-red-100 hover:text-red-500'
                            }`}
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Show playlist selection dropdown
                              console.log('Add to playlist:', track.name);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-6 h-6 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-purple-100 hover:text-purple-500 rounded-full flex items-center justify-center transition-colors"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics and Correlation Section */}
        {correlationInsight && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Correlation Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>🔗 Music × Traffic Correlation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Current Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Traffic Level:</span>
                          <span className={`font-semibold ${getTrafficColor(correlationInsight.traffic.level)}`}>
                            {correlationInsight.traffic.level}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Music Mood:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {correlationInsight.musicMood}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Correlation Strength:</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {Math.round(correlationInsight.correlationStrength * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">How It Works</h4>
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>🚦 <strong>Traffic Analysis:</strong> Real-time traffic conditions and congestion levels</p>
                        <p>🎵 <strong>Music Trends:</strong> Live data from Last.fm API showing current popular moods</p>
                        <p>🧠 <strong>Smart Correlation:</strong> AI-powered matching of music to traffic stress levels</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Traffic Analytics</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TrafficChart />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>

      {/* Floating Music Indicator */}
      <MusicIndicator
        isVisible={Boolean(musicAnalysis && musicAnalysis.trendingTracks.length > 0 && !isPlayerVisible)}
        onClick={() => {
          if (musicAnalysis && musicAnalysis.trendingTracks.length > 0) {
            playTrack(musicAnalysis.trendingTracks[0], musicAnalysis.trendingTracks);
          }
        }}
      />

      {/* Playlist Manager Modal */}
      <PlaylistManager
        isVisible={showPlaylistManager}
        onClose={() => setShowPlaylistManager(false)}
      />

      {/* Favorites View Modal */}
      <FavoritesView
        isVisible={showFavoritesView}
        onClose={() => setShowFavoritesView(false)}
      />
    </div>
  );
}