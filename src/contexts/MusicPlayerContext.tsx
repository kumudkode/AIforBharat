import React, { createContext, useContext, useState } from 'react';
import { Track, MultilingualTrack } from '../services/musicService';

interface MusicPlayerContextType {
  currentPlaylist: MultilingualTrack[];
  currentTrackIndex: number;
  isPlayerVisible: boolean;
  setPlaylist: (tracks: MultilingualTrack[], startIndex?: number) => void;
  setCurrentTrack: (index: number) => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  playTrack: (track: MultilingualTrack, playlist?: MultilingualTrack[]) => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentPlaylist, setCurrentPlaylist] = useState<MultilingualTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);

  const setPlaylist = (tracks: MultilingualTrack[], startIndex: number = 0) => {
    setCurrentPlaylist(tracks);
    setCurrentTrackIndex(startIndex);
    if (tracks.length > 0) {
      setIsPlayerVisible(true);
    }
  };

  const setCurrentTrack = (index: number) => {
    if (index >= 0 && index < currentPlaylist.length) {
      setCurrentTrackIndex(index);
    }
  };

  const showPlayer = () => {
    if (currentPlaylist.length > 0) {
      setIsPlayerVisible(true);
    }
  };

  const hidePlayer = () => {
    setIsPlayerVisible(false);
  };

  const playTrack = (track: MultilingualTrack, playlist?: MultilingualTrack[]) => {
    if (playlist) {
      const trackIndex = playlist.findIndex(t => t.name === track.name && t.artist === track.artist);
      setPlaylist(playlist, trackIndex >= 0 ? trackIndex : 0);
    } else {
      // If no playlist provided, create a single-track playlist
      setPlaylist([track], 0);
    }
  };

  return (
    <MusicPlayerContext.Provider value={{
      currentPlaylist,
      currentTrackIndex,
      isPlayerVisible,
      setPlaylist,
      setCurrentTrack,
      showPlayer,
      hidePlayer,
      playTrack
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
}