import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { MusicPlayerProvider, useMusicPlayer } from './contexts/MusicPlayerContext';
import { Dashboard } from './components/Dashboard/Dashboard';
import { MusicPlayer } from './components/MusicPlayer/MusicPlayer';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function AppContent() {
  const { currentPlaylist, currentTrackIndex, isPlayerVisible, setCurrentTrack, hidePlayer } = useMusicPlayer();

  return (
    <>
      <Dashboard />
      <MusicPlayer
        tracks={currentPlaylist}
        currentTrackIndex={currentTrackIndex}
        onTrackChange={setCurrentTrack}
        isVisible={isPlayerVisible}
        onClose={hidePlayer}
      />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <MusicPlayerProvider>
          <AppContent />
        </MusicPlayerProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;