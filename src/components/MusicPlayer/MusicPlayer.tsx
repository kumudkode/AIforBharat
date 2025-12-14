import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Track, MultilingualTrack, getDisplayText } from '../../services/musicService';

interface MusicPlayerProps {
  tracks: MultilingualTrack[];
  currentTrackIndex: number;
  onTrackChange: (index: number) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function MusicPlayer({ tracks, currentTrackIndex, onTrackChange, isVisible, onClose }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.previewUrl) return;

    // Reset states when track changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setIsLoading(true);

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next track
      if (currentTrackIndex < tracks.length - 1) {
        onTrackChange(currentTrackIndex + 1);
      }
    };
    const handleError = () => {
      console.error('Audio failed to load:', currentTrack.previewUrl);
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Try alternative URL if available
      const track = currentTrack as any;
      if (track.alternativeUrls && track.alternativeUrls.length > 0) {
        console.log('Trying alternative URL...');
        audio.src = track.alternativeUrls[0];
        audio.load();
      }
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrack, currentTrackIndex, tracks.length, onTrackChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Playback failed:', error);
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
      
      // Try alternative URL if available
      const track = currentTrack as any;
      if (track.alternativeUrls && track.alternativeUrls.length > 0) {
        console.log('Trying alternative URL for playback...');
        audio.src = track.alternativeUrls[0];
        audio.load();
        try {
          await audio.play();
          setIsPlaying(true);
          setHasError(false);
        } catch (altError) {
          console.error('Alternative URL also failed:', altError);
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      onTrackChange(currentTrackIndex - 1);
    }
  };

  const playNext = () => {
    if (currentTrackIndex < tracks.length - 1) {
      onTrackChange(currentTrackIndex + 1);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible || !currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-50"
      >
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={currentTrack.previewUrl}
          onLoadStart={() => setCurrentTime(0)}
        />

        {/* Main Player */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Track Info */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <motion.img
                src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop'}
                alt={currentTrack.album}
                className="w-14 h-14 rounded-lg object-cover shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {currentTrack.name}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {currentTrack.artist}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  {currentTrack.album}
                </p>
                {isLoading && (
                  <p className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1">
                    <motion.div 
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    Loading audio...
                  </p>
                )}
                {hasError && (
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Audio unavailable
                  </p>
                )}
              </div>
            </div>

            {/* Player Controls */}
            <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
              {/* Control Buttons */}
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={playPrevious}
                  disabled={currentTrackIndex === 0}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={togglePlay}
                  disabled={isLoading || hasError}
                  className={`p-3 rounded-full shadow-lg ${
                    hasError 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                  whileHover={{ scale: hasError ? 1 : 1.05 }}
                  whileTap={{ scale: hasError ? 1 : 0.95 }}
                >
                  {isLoading ? (
                    <motion.svg 
                      className="w-6 h-6" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </motion.svg>
                  ) : hasError ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>

                <motion.button
                  onClick={playNext}
                  disabled={currentTrackIndex === tracks.length - 1}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center space-x-2 w-full">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={duration ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Volume and Close */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={toggleMute}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM12.22 6.22a1 1 0 011.56 1.28l-1.44 1.44 1.44 1.44a1 1 0 01-1.56 1.28L10.78 10l1.44-1.44z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zM12 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </motion.button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume * 100}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Track Queue (Optional - can be toggled) */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2">
          <div className="flex items-center space-x-2 max-w-7xl mx-auto">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentTrackIndex + 1} of {tracks.length}
            </span>
            <div className="flex-1 flex space-x-1 overflow-x-auto">
              {tracks.map((track, index) => (
                <motion.button
                  key={index}
                  onClick={() => onTrackChange(index)}
                  className={`flex-shrink-0 px-2 py-1 text-xs rounded-full transition-colors ${
                    index === currentTrackIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {track.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}