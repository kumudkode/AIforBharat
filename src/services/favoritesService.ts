import { EnhancedTrack, MultilingualTrack } from './musicService';

export interface FavoritesStats {
  totalFavorites: number;
  mostFavoritedGenre: string;
  totalDuration: number;
  averageTrackDuration: number;
  recentlyAdded: number; // Count of favorites added in last 7 days
  languageDistribution: {
    hindi: number;
    english: number;
    mixed: number;
  };
}

class FavoritesService {
  private favorites: Map<string, MultilingualTrack> = new Map();
  private listeners: ((favorites: MultilingualTrack[]) => void)[] = [];
  private addListeners: ((track: MultilingualTrack) => void)[] = [];
  private removeListeners: ((trackId: string) => void)[] = [];
  private storageKey = 'music_dashboard_favorites';

  constructor() {
    this.loadFromStorage();
  }

  // Core favorites operations
  async addToFavorites(track: MultilingualTrack): Promise<void> {
    const trackId = this.generateTrackId(track);
    
    if (this.favorites.has(trackId)) {
      console.warn(`Track "${track.name}" by ${track.artist} is already in favorites`);
      return;
    }

    // Add timestamp for when it was favorited
    const favoritedTrack = {
      ...track,
      favoritedAt: new Date()
    };

    this.favorites.set(trackId, favoritedTrack);
    await this.saveToStorage();
    this.notifyListeners();
    this.notifyAddListeners(favoritedTrack);
    
    console.log(`❤️ Added "${track.name}" by ${track.artist} to favorites`);
  }

  async removeFromFavorites(trackId: string): Promise<void> {
    const track = this.favorites.get(trackId);
    if (!track) {
      console.warn(`Track with id ${trackId} not found in favorites`);
      return;
    }

    this.favorites.delete(trackId);
    await this.saveToStorage();
    this.notifyListeners();
    this.notifyRemoveListeners(trackId);
    
    console.log(`💔 Removed "${track.name}" by ${track.artist} from favorites`);
  }

  async removeFromFavoritesByTrack(track: EnhancedTrack): Promise<void> {
    const trackId = this.generateTrackId(track);
    await this.removeFromFavorites(trackId);
  }

  isFavorite(track: EnhancedTrack): boolean {
    const trackId = this.generateTrackId(track);
    return this.favorites.has(trackId);
  }

  isFavoriteById(trackId: string): boolean {
    return this.favorites.has(trackId);
  }

  async getFavorites(): Promise<EnhancedTrack[]> {
    return Array.from(this.favorites.values()).sort((a, b) => {
      const aTime = (a as any).favoritedAt?.getTime() || 0;
      const bTime = (b as any).favoritedAt?.getTime() || 0;
      return bTime - aTime; // Most recently favorited first
    });
  }

  async clearAllFavorites(): Promise<void> {
    const count = this.favorites.size;
    this.favorites.clear();
    await this.saveToStorage();
    this.notifyListeners();
    
    console.log(`🗑️ Cleared all ${count} favorites`);
  }

  // Organization and filtering
  async getFavoritesByGenre(): Promise<Map<string, EnhancedTrack[]>> {
    const favorites = await this.getFavorites();
    const genreMap = new Map<string, EnhancedTrack[]>();

    favorites.forEach(track => {
      // Extract genre from track metadata if available
      const genre = (track as any).genre || 'Unknown';
      
      if (!genreMap.has(genre)) {
        genreMap.set(genre, []);
      }
      genreMap.get(genre)!.push(track);
    });

    return genreMap;
  }

  async getFavoritesByMood(): Promise<Map<string, EnhancedTrack[]>> {
    const favorites = await this.getFavorites();
    const moodMap = new Map<string, EnhancedTrack[]>();

    favorites.forEach(track => {
      // Extract mood from track metadata if available
      const mood = (track as any).mood || 'Unknown';
      
      if (!moodMap.has(mood)) {
        moodMap.set(mood, []);
      }
      moodMap.get(mood)!.push(track);
    });

    return moodMap;
  }

  async getFavoritesByArtist(): Promise<Map<string, EnhancedTrack[]>> {
    const favorites = await this.getFavorites();
    const artistMap = new Map<string, EnhancedTrack[]>();

    favorites.forEach(track => {
      const artist = track.artist;
      
      if (!artistMap.has(artist)) {
        artistMap.set(artist, []);
      }
      artistMap.get(artist)!.push(track);
    });

    // Sort by number of tracks per artist (descending)
    return new Map([...artistMap.entries()].sort((a, b) => b[1].length - a[1].length));
  }

  async getRecentlyFavorited(limit: number = 10): Promise<EnhancedTrack[]> {
    const favorites = await this.getFavorites();
    return favorites.slice(0, limit); // Already sorted by most recent
  }

  async searchFavorites(query: string): Promise<EnhancedTrack[]> {
    const favorites = await this.getFavorites();
    const lowercaseQuery = query.toLowerCase();
    
    return favorites.filter(track => 
      track.name.toLowerCase().includes(lowercaseQuery) ||
      track.artist.toLowerCase().includes(lowercaseQuery) ||
      track.album?.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Statistics
  async getFavoritesStats(): Promise<FavoritesStats> {
    const favorites = await this.getFavorites();
    const totalDuration = favorites.reduce((sum, track) => sum + (track.duration || 0), 0);
    
    // Find most favorited genre
    const genreMap = await this.getFavoritesByGenre();
    const mostFavoritedGenre = Array.from(genreMap.entries())
      .sort((a, b) => b[1].length - a[1].length)[0]?.[0] || 'Unknown';

    // Count recently added (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyAdded = favorites.filter(track => {
      const favoritedAt = (track as any).favoritedAt;
      return favoritedAt && new Date(favoritedAt) > sevenDaysAgo;
    }).length;

    return {
      totalFavorites: favorites.length,
      mostFavoritedGenre,
      totalDuration,
      averageTrackDuration: favorites.length > 0 ? totalDuration / favorites.length : 0,
      recentlyAdded
    };
  }

  // Persistence
  async saveToStorage(): Promise<void> {
    try {
      const favoritesArray = Array.from(this.favorites.values());
      const data = {
        favorites: favoritesArray,
        timestamp: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      console.log(`💾 Saved ${favoritesArray.length} favorites to storage`);
    } catch (error) {
      console.error('Failed to save favorites to storage:', error);
    }
  }

  async loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      if (data.favorites && Array.isArray(data.favorites)) {
        this.favorites.clear();
        
        data.favorites.forEach((track: any) => {
          // Convert date strings back to Date objects
          if (track.favoritedAt) {
            track.favoritedAt = new Date(track.favoritedAt);
          }
          
          const trackId = this.generateTrackId(track);
          this.favorites.set(trackId, track);
        });
        
        console.log(`📋 Loaded ${data.favorites.length} favorites from storage`);
      }
    } catch (error) {
      console.error('Failed to load favorites from storage:', error);
    }
  }

  // Import/Export functionality
  async exportFavorites(): Promise<string> {
    const favorites = await this.getFavorites();
    const exportData = {
      favorites,
      exportedAt: new Date(),
      version: '1.0',
      stats: await this.getFavoritesStats()
    };

    return JSON.stringify(exportData, null, 2);
  }

  async importFavorites(data: string): Promise<void> {
    try {
      const importData = JSON.parse(data);
      
      if (!importData.favorites || !Array.isArray(importData.favorites)) {
        throw new Error('Invalid favorites data format');
      }

      let importedCount = 0;
      for (const track of importData.favorites) {
        const trackId = this.generateTrackId(track);
        if (!this.favorites.has(trackId)) {
          // Add timestamp for when it was imported
          const importedTrack = {
            ...track,
            favoritedAt: new Date()
          };
          
          this.favorites.set(trackId, importedTrack);
          importedCount++;
        }
      }

      await this.saveToStorage();
      this.notifyListeners();
      
      console.log(`✅ Imported ${importedCount} new favorites`);
    } catch (error) {
      throw new Error(`Failed to import favorites: ${error}`);
    }
  }

  // Event handling
  onFavoritesChanged(callback: (favorites: EnhancedTrack[]) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  onFavoriteAdded(callback: (track: EnhancedTrack) => void): () => void {
    this.addListeners.push(callback);
    
    return () => {
      const index = this.addListeners.indexOf(callback);
      if (index > -1) {
        this.addListeners.splice(index, 1);
      }
    };
  }

  onFavoriteRemoved(callback: (trackId: string) => void): () => void {
    this.removeListeners.push(callback);
    
    return () => {
      const index = this.removeListeners.indexOf(callback);
      if (index > -1) {
        this.removeListeners.splice(index, 1);
      }
    };
  }

  // Private helper methods
  private generateTrackId(track: EnhancedTrack): string {
    // Create a unique ID based on track name and artist
    return `${track.name.toLowerCase().replace(/\s+/g, '_')}_${track.artist.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private notifyListeners(): void {
    const favorites = Array.from(this.favorites.values());
    this.listeners.forEach(listener => listener(favorites));
  }

  private notifyAddListeners(track: EnhancedTrack): void {
    this.addListeners.forEach(listener => listener(track));
  }

  private notifyRemoveListeners(trackId: string): void {
    this.removeListeners.forEach(listener => listener(trackId));
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();

// Export types and service
export default favoritesService;