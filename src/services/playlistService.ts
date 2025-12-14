import { EnhancedTrack, MultilingualTrack } from './musicService';

export interface UserPlaylist {
  id: string;
  name: string;
  description?: string;
  tracks: MultilingualTrack[];
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string; // Generated from track album arts
  duration: number; // Total playlist duration in seconds
  trackCount: number;
  languageDistribution?: {
    hindi: number;
    english: number;
    mixed: number;
  };
}

export interface PlaylistStats {
  totalPlaylists: number;
  totalTracks: number;
  totalDuration: number;
  mostPopularGenre: string;
  averagePlaylistSize: number;
}

class PlaylistService {
  private playlists: Map<string, UserPlaylist> = new Map();
  private listeners: ((playlists: UserPlaylist[]) => void)[] = [];
  private storageKey = 'music_dashboard_playlists';

  constructor() {
    this.loadFromStorage();
  }

  // Playlist CRUD operations
  async createPlaylist(name: string, description?: string): Promise<UserPlaylist> {
    const id = this.generateId();
    const now = new Date();
    
    const playlist: UserPlaylist = {
      id,
      name: name.trim(),
      description: description?.trim(),
      tracks: [],
      createdAt: now,
      updatedAt: now,
      duration: 0,
      trackCount: 0
    };

    this.playlists.set(id, playlist);
    await this.saveToStorage();
    this.notifyListeners();
    
    console.log(`✅ Created playlist: ${name}`);
    return playlist;
  }

  async getPlaylists(): Promise<UserPlaylist[]> {
    return Array.from(this.playlists.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getPlaylist(id: string): Promise<UserPlaylist | null> {
    return this.playlists.get(id) || null;
  }

  async updatePlaylist(id: string, updates: Partial<UserPlaylist>): Promise<void> {
    const playlist = this.playlists.get(id);
    if (!playlist) {
      throw new Error(`Playlist with id ${id} not found`);
    }

    const updatedPlaylist: UserPlaylist = {
      ...playlist,
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date()
    };

    // Recalculate derived fields
    updatedPlaylist.trackCount = updatedPlaylist.tracks.length;
    updatedPlaylist.duration = this.calculateTotalDuration(updatedPlaylist.tracks);
    updatedPlaylist.thumbnail = this.generateThumbnail(updatedPlaylist.tracks);

    this.playlists.set(id, updatedPlaylist);
    await this.saveToStorage();
    this.notifyListeners();
    
    console.log(`✅ Updated playlist: ${updatedPlaylist.name}`);
  }

  async deletePlaylist(id: string): Promise<void> {
    const playlist = this.playlists.get(id);
    if (!playlist) {
      throw new Error(`Playlist with id ${id} not found`);
    }

    this.playlists.delete(id);
    await this.saveToStorage();
    this.notifyListeners();
    
    console.log(`✅ Deleted playlist: ${playlist.name}`);
  }

  // Track management
  async addTrackToPlaylist(playlistId: string, track: EnhancedTrack): Promise<void> {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      throw new Error(`Playlist with id ${playlistId} not found`);
    }

    // Check if track already exists in playlist
    const existingTrackIndex = playlist.tracks.findIndex(t => 
      t.name === track.name && t.artist === track.artist
    );

    if (existingTrackIndex !== -1) {
      console.warn(`Track "${track.name}" by ${track.artist} already exists in playlist "${playlist.name}"`);
      return;
    }

    playlist.tracks.push(track);
    await this.updatePlaylist(playlistId, { tracks: playlist.tracks });
    
    console.log(`✅ Added "${track.name}" to playlist "${playlist.name}"`);
  }

  async removeTrackFromPlaylist(playlistId: string, trackIndex: number): Promise<void> {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      throw new Error(`Playlist with id ${playlistId} not found`);
    }

    if (trackIndex < 0 || trackIndex >= playlist.tracks.length) {
      throw new Error(`Invalid track index: ${trackIndex}`);
    }

    const removedTrack = playlist.tracks[trackIndex];
    playlist.tracks.splice(trackIndex, 1);
    await this.updatePlaylist(playlistId, { tracks: playlist.tracks });
    
    console.log(`✅ Removed "${removedTrack.name}" from playlist "${playlist.name}"`);
  }

  async reorderPlaylistTracks(playlistId: string, fromIndex: number, toIndex: number): Promise<void> {
    const playlist = this.playlists.get(playlistId);
    if (!playlist) {
      throw new Error(`Playlist with id ${playlistId} not found`);
    }

    if (fromIndex < 0 || fromIndex >= playlist.tracks.length ||
        toIndex < 0 || toIndex >= playlist.tracks.length) {
      throw new Error(`Invalid track indices: ${fromIndex} -> ${toIndex}`);
    }

    const tracks = [...playlist.tracks];
    const [movedTrack] = tracks.splice(fromIndex, 1);
    tracks.splice(toIndex, 0, movedTrack);

    await this.updatePlaylist(playlistId, { tracks });
    
    console.log(`✅ Reordered tracks in playlist "${playlist.name}"`);
  }

  // Utility methods
  async getPlaylistStats(): Promise<PlaylistStats> {
    const playlists = await this.getPlaylists();
    const totalTracks = playlists.reduce((sum, p) => sum + p.trackCount, 0);
    const totalDuration = playlists.reduce((sum, p) => sum + p.duration, 0);
    
    // Find most popular genre
    const genreCounts = new Map<string, number>();
    playlists.forEach(playlist => {
      playlist.tracks.forEach(track => {
        // Extract genre from track metadata if available
        const genre = (track as any).genre || 'Unknown';
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      });
    });

    const mostPopularGenre = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    return {
      totalPlaylists: playlists.length,
      totalTracks,
      totalDuration,
      mostPopularGenre,
      averagePlaylistSize: playlists.length > 0 ? totalTracks / playlists.length : 0
    };
  }

  async searchPlaylists(query: string): Promise<UserPlaylist[]> {
    const playlists = await this.getPlaylists();
    const lowercaseQuery = query.toLowerCase();
    
    return playlists.filter(playlist => 
      playlist.name.toLowerCase().includes(lowercaseQuery) ||
      playlist.description?.toLowerCase().includes(lowercaseQuery) ||
      playlist.tracks.some(track => 
        track.name.toLowerCase().includes(lowercaseQuery) ||
        track.artist.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  // Persistence
  async saveToStorage(): Promise<void> {
    try {
      const playlistsArray = Array.from(this.playlists.values());
      const data = {
        playlists: playlistsArray,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log(`💾 Saved ${playlistsArray.length} playlists to storage`);
    } catch (error) {
      console.error('Failed to save playlists to storage:', error);
    }
  }

  async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      if (data.playlists && Array.isArray(data.playlists)) {
        this.playlists.clear();
        
        data.playlists.forEach((playlist: any) => {
          // Convert date strings back to Date objects
          playlist.createdAt = new Date(playlist.createdAt);
          playlist.updatedAt = new Date(playlist.updatedAt);
          
          this.playlists.set(playlist.id, playlist);
        });
        
        console.log(`📋 Loaded ${data.playlists.length} playlists from storage`);
      }
    } catch (error) {
      console.error('Failed to load playlists from storage:', error);
    }
  }

  // Import/Export functionality
  async exportPlaylist(id: string): Promise<string> {
    const playlist = await this.getPlaylist(id);
    if (!playlist) {
      throw new Error(`Playlist with id ${id} not found`);
    }

    const exportData = {
      ...playlist,
      exportedAt: new Date(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importPlaylist(data: string): Promise<UserPlaylist> {
    try {
      const importData = JSON.parse(data);
      
      // Generate new ID to avoid conflicts
      const newId = this.generateId();
      const now = new Date();
      
      const playlist: UserPlaylist = {
        ...importData,
        id: newId,
        createdAt: now,
        updatedAt: now,
        name: `${importData.name} (Imported)`
      };

      // Recalculate derived fields
      playlist.trackCount = playlist.tracks.length;
      playlist.duration = this.calculateTotalDuration(playlist.tracks);
      playlist.thumbnail = this.generateThumbnail(playlist.tracks);

      this.playlists.set(newId, playlist);
      await this.saveToStorage();
      this.notifyListeners();
      
      console.log(`✅ Imported playlist: ${playlist.name}`);
      return playlist;
    } catch (error) {
      throw new Error(`Failed to import playlist: ${error}`);
    }
  }

  // Event handling
  onPlaylistsChanged(callback: (playlists: UserPlaylist[]) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Private helper methods
  private generateId(): string {
    return `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTotalDuration(tracks: EnhancedTrack[]): number {
    return tracks.reduce((total, track) => total + (track.duration || 0), 0);
  }

  private generateThumbnail(tracks: EnhancedTrack[]): string | undefined {
    // Use the first track's album art as thumbnail
    return tracks[0]?.albumArt;
  }

  private notifyListeners(): void {
    const playlists = Array.from(this.playlists.values());
    this.listeners.forEach(listener => listener(playlists));
  }
}

// Export singleton instance
export const playlistService = new PlaylistService();

// Export types and service
export default playlistService;