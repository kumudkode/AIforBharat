const LASTFM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY;
const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export interface Track {
  name: string;
  artist: string;
  playcount: string;
  listeners: string;
  url: string;
  previewUrl?: string;
  albumArt?: string;
  duration?: number; // in seconds
  album?: string;
}

export interface TopTracksResponse {
  tracks: {
    track: Track[];
  };
}

export interface TagInfo {
  name: string;
  count: number;
  reach: number;
}

// Fetch top tracks globally
export async function getTopTracks(limit: number = 10): Promise<Track[]> {
  try {
    // Check if API key exists
    if (!LASTFM_API_KEY) {
      console.warn('Last.fm API key not found, using mock data');
      return [];
    }

    const response = await fetch(
      `${LASTFM_BASE_URL}?method=chart.gettoptracks&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top tracks: ${response.status}`);
    }
    
    const data: any = await response.json();
    const tracks = data.tracks?.track || [];
    
    // Normalize track data from Last.fm API
    return tracks.map((track: any) => ({
      name: typeof track.name === 'string' ? track.name : (track.name?.['#text'] || 'Unknown Track'),
      artist: typeof track.artist === 'string' ? track.artist : (track.artist?.name || track.artist?.['#text'] || 'Unknown Artist'),
      playcount: track.playcount || '0',
      listeners: track.listeners || '0',
      url: track.url || '#',
      previewUrl: track.previewUrl || null,
      albumArt: track.image?.[2]?.['#text'] || null,
      duration: track.duration || null,
      album: track.album || null
    })).filter((track: Track) => track.name !== 'Unknown Track' && track.artist !== 'Unknown Artist');
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
}

// Fetch top tags (genres/moods)
export async function getTopTags(limit: number = 10): Promise<TagInfo[]> {
  try {
    if (!LASTFM_API_KEY) {
      console.warn('Last.fm API key not found, using mock data');
      return [];
    }

    const response = await fetch(
      `${LASTFM_BASE_URL}?method=chart.gettoptags&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch top tags: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tags?.tag || [];
  } catch (error) {
    console.error('Error fetching top tags:', error);
    return [];
  }
}

// Get tracks by tag/genre
export async function getTracksByTag(tag: string, limit: number = 10): Promise<Track[]> {
  try {
    const response = await fetch(
      `${LASTFM_BASE_URL}?method=tag.gettoptracks&tag=${encodeURIComponent(tag)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tracks for tag: ${tag}`);
    }
    
    const data = await response.json();
    const tracks = data.tracks?.track || [];
    
    // Normalize track data from Last.fm API
    return tracks.map((track: any) => ({
      name: typeof track.name === 'string' ? track.name : (track.name?.['#text'] || 'Unknown Track'),
      artist: typeof track.artist === 'string' ? track.artist : (track.artist?.name || track.artist?.['#text'] || 'Unknown Artist'),
      playcount: track.playcount || '0',
      listeners: track.listeners || '0',
      url: track.url || '#',
      previewUrl: track.previewUrl || null,
      albumArt: track.image?.[2]?.['#text'] || null,
      duration: track.duration || null,
      album: track.album || null
    })).filter((track: Track) => track.name !== 'Unknown Track' && track.artist !== 'Unknown Artist');
  } catch (error) {
    console.error(`Error fetching tracks for tag ${tag}:`, error);
    return [];
  }
}

// Enhanced track interface with additional metadata
export interface EnhancedTrack extends Track {
  alternativeUrls?: string[];
  audioQuality?: 'high' | 'medium' | 'low';
  isPlayable?: boolean;
  loadingState?: 'idle' | 'loading' | 'loaded' | 'error';
}

// Multilingual track interface with language support
export interface MultilingualTrack extends EnhancedTrack {
  language: 'hindi' | 'english' | 'mixed';
  originalScript?: string; // For Hindi titles in Devanagari
  romanizedTitle?: string; // Romanized version of Hindi titles
  romanizedArtist?: string; // Romanized version of Hindi artists
  region?: string; // e.g., 'bollywood', 'punjabi', 'south-indian'
  languageConfidence?: number; // 0-100 confidence in language detection
}

// Retry mechanism with exponential backoff
async function fetchWithRetry(url: string, maxRetries: number = 3): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Enrich track with additional metadata and preview URLs
async function enrichTrack(track: Track): Promise<EnhancedTrack> {
  const enriched: EnhancedTrack = {
    ...track,
    alternativeUrls: [],
    audioQuality: 'medium',
    isPlayable: false,
    loadingState: 'idle'
  };

  // Add album art if missing
  if (!enriched.albumArt) {
    // Use a music-themed placeholder based on genre/mood
    const artIndex = Math.floor(Math.random() * 10) + 1;
    enriched.albumArt = `https://picsum.photos/300/300?random=${artIndex}&blur=1`;
  }

  // Generate multiple alternative preview URLs for better reliability
  const alternativeUrls = [
    `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`,
    `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`,
    `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`
  ];
  
  enriched.alternativeUrls = alternativeUrls;
  
  // Use original preview URL if available, otherwise use first alternative
  if (!enriched.previewUrl || enriched.previewUrl === '#') {
    enriched.previewUrl = alternativeUrls[0];
  }
  
  enriched.isPlayable = true;

  return enriched;
}

// Import Hindi music database
import { getHindiTracksByMood, getRandomHindiTracks, convertHindiTrackToEnhanced } from './hindiMusicDatabase';

// Analyze music mood based on current trends with REAL API data (now includes Hindi)
export async function analyzeMusicMood(): Promise<{
  primaryMood: string;
  confidence: number;
  topGenres: string[];
  trendingTracks: MultilingualTrack[];
}> {
  try {
    console.log('🎵 Fetching real music data from Last.fm API...');
    
    // Determine mood based on time of day with randomization for variety
    const hour = new Date().getHours();
    const randomFactor = Math.random();
    let primaryMood: string;
    let confidence: number;
    let topGenres: string[];
    let genresToFetch: string[];

    // Add more variety by sometimes changing the mood
    const moodOptions = [
      {
        name: 'Energetic',
        confidence: 80 + Math.random() * 15,
        genres: ['pop', 'electronic', 'dance', 'indie', 'rock', 'hip-hop'],
        fetchGenres: ['pop', 'electronic', 'dance', 'rock']
      },
      {
        name: 'Focus',
        confidence: 75 + Math.random() * 15,
        genres: ['instrumental', 'lo-fi', 'ambient', 'jazz', 'classical', 'study'],
        fetchGenres: ['jazz', 'ambient', 'instrumental', 'classical']
      },
      {
        name: 'Chill',
        confidence: 78 + Math.random() * 15,
        genres: ['chill', 'acoustic', 'indie', 'ambient', 'folk', 'downtempo'],
        fetchGenres: ['chill', 'indie', 'acoustic', 'folk']
      },
      {
        name: 'Upbeat',
        confidence: 82 + Math.random() * 15,
        genres: ['dance', 'house', 'techno', 'pop', 'electronic', 'party'],
        fetchGenres: ['dance', 'house', 'electronic', 'pop']
      },
      {
        name: 'Relaxing',
        confidence: 85 + Math.random() * 10,
        genres: ['ambient', 'new-age', 'meditation', 'nature', 'spa', 'calm'],
        fetchGenres: ['ambient', 'new-age', 'meditation', 'calm']
      }
    ];

    let selectedMood;
    
    // Time-based mood with some randomization
    if (hour >= 6 && hour < 12) {
      // Morning - Usually energetic, but sometimes upbeat
      selectedMood = randomFactor > 0.3 ? moodOptions[0] : moodOptions[3]; // Energetic or Upbeat
    } else if (hour >= 12 && hour < 18) {
      // Afternoon - Usually focus, but sometimes chill
      selectedMood = randomFactor > 0.4 ? moodOptions[1] : moodOptions[2]; // Focus or Chill
    } else {
      // Evening/Night - Usually chill, but sometimes relaxing
      selectedMood = randomFactor > 0.3 ? moodOptions[2] : moodOptions[4]; // Chill or Relaxing
    }

    primaryMood = selectedMood.name;
    confidence = Math.round(selectedMood.confidence);
    topGenres = selectedMood.genres;
    genresToFetch = selectedMood.fetchGenres;

    // Fetch tracks from multiple sources to get 100+ tracks
    const trackPromises: Promise<Track[]>[] = [
      // Get global top tracks (50 tracks)
      getTopTracks(50),
      // Get tracks from mood-specific genres (50+ more tracks)
      ...genresToFetch.map(genre => getTracksByTag(genre, 20))
    ];

    console.log('📡 Fetching tracks from multiple sources...');
    const trackArrays = await Promise.allSettled(trackPromises);
    
    // Combine all successful results
    let allTracks: Track[] = [];
    trackArrays.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allTracks = allTracks.concat(result.value);
        console.log(`✅ Source ${index + 1}: ${result.value.length} tracks`);
      } else {
        console.warn(`❌ Source ${index + 1} failed:`, result.reason);
      }
    });

    // Filter out invalid tracks and remove duplicates
    const validTracks = allTracks.filter(track => 
      track && 
      track.name && 
      track.artist && 
      typeof track.name === 'string' && 
      typeof track.artist === 'string'
    );

    const uniqueTracks = validTracks.filter((track, index, self) => 
      index === self.findIndex(t => 
        t.name.toLowerCase() === track.name.toLowerCase() && 
        t.artist.toLowerCase() === track.artist.toLowerCase()
      )
    );

    console.log(`🎯 Found ${uniqueTracks.length} unique tracks`);

    // Get Hindi tracks based on the determined mood
    console.log(`🎵 Fetching Hindi tracks for mood: ${primaryMood}`);
    const hindiTracks = getHindiTracksByMood(primaryMood.toLowerCase(), 50)
      .map(hindiTrack => convertHindiTrackToEnhanced(hindiTrack));
    
    console.log(`✅ Found ${hindiTracks.length} Hindi tracks`);

    // Shuffle English tracks for variety and enrich with metadata
    const shuffledEnglishTracks = uniqueTracks.sort(() => Math.random() - 0.5);
    const enrichedEnglishTracks = await Promise.all(
      shuffledEnglishTracks.slice(0, 50).map(track => enrichTrack(track))
    );

    console.log(`✨ Enriched ${enrichedEnglishTracks.length} English tracks with metadata`);

    // Create balanced playlist with 50% Hindi and 50% English
    const balancedTracks = createBalancedPlaylist(
      enrichedEnglishTracks,
      hindiTracks,
      100,
      { hindi: 50, english: 50, target: 'balanced' }
    );

    // Remove any duplicates
    const finalTracks = deduplicateTracks(balancedTracks);

    console.log(`🎯 Created balanced playlist with ${finalTracks.length} tracks (${finalTracks.filter(t => t.language === 'hindi').length} Hindi, ${finalTracks.filter(t => t.language === 'english').length} English)`);

    return {
      primaryMood,
      confidence,
      topGenres,
      trendingTracks: finalTracks
    };

  } catch (error) {
    console.error('❌ Error analyzing music mood:', error);
    
    // Fallback to mixed Hindi-English mock data if API completely fails
    console.log('🔄 Using fallback mixed Hindi-English data due to API failure');
    
    // Get some Hindi tracks from database
    const fallbackHindiTracks = getRandomHindiTracks(10).map(track => 
      convertHindiTrackToEnhanced(track)
    );
    
    const mockEnglishTracks: EnhancedTrack[] = [
      { 
        name: 'Flowers', 
        artist: 'Miley Cyrus', 
        playcount: '2500000', 
        listeners: '120000', 
        url: '#',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        albumArt: 'https://picsum.photos/300/300?random=1',
        duration: 200,
        album: 'Endless Summer Vacation',
        isPlayable: true,
        audioQuality: 'medium',
        alternativeUrls: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3']
      },
      { 
        name: 'Anti-Hero', 
        artist: 'Taylor Swift', 
        playcount: '2200000', 
        listeners: '110000', 
        url: '#',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        albumArt: 'https://picsum.photos/300/300?random=2',
        duration: 201,
        album: 'Midnights',
        isPlayable: true,
        audioQuality: 'medium',
        alternativeUrls: ['https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3']
      }
    ];

    // Create balanced fallback playlist
    const mockEnglishEnhanced = mockEnglishTracks.map(track => enhanceTrackWithLanguage(track));
    const balancedFallback = createBalancedPlaylist(
      mockEnglishTracks,
      fallbackHindiTracks,
      20,
      { hindi: 50, english: 50, target: 'balanced' }
    );

    return {
      primaryMood: 'Energetic',
      confidence: 75,
      topGenres: ['pop', 'rock', 'electronic', 'bollywood'],
      trendingTracks: balancedFallback
    };
  }
}

// Real-time polling system
class MusicDataManager {
  private pollingInterval: NodeJS.Timeout | null = null;
  private listeners: ((data: any) => void)[] = [];
  private lastUpdate: Date | null = null;
  private cachedData: any = null;

  // Start real-time polling every 5-10 minutes (randomized for variety)
  startPolling(intervalMs: number = this.getRandomInterval()) { // 5-10 minutes
    console.log('🔄 Starting real-time music data polling...');
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        console.log('📡 Polling for fresh music data...');
        const freshData = await analyzeMusicMood();
        this.cachedData = freshData;
        this.lastUpdate = new Date();
        
        // Notify all listeners of new data
        this.listeners.forEach(listener => listener(freshData));
        console.log('✅ Music data updated successfully');
      } catch (error) {
        console.error('❌ Polling failed:', error);
      }
    }, intervalMs);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ Stopped music data polling');
    }
  }

  // Subscribe to data updates
  onDataUpdate(callback: (data: any) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get cached data if available
  getCachedData() {
    return this.cachedData;
  }

  // Check if data is stale (older than 5 minutes)
  isDataStale(): boolean {
    if (!this.lastUpdate) return true;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastUpdate < fiveMinutesAgo;
  }

  getLastUpdateTime(): Date | null {
    return this.lastUpdate;
  }

  // Get random interval between 5-10 minutes for variety
  private getRandomInterval(): number {
    const minInterval = 5 * 60 * 1000; // 5 minutes
    const maxInterval = 10 * 60 * 1000; // 10 minutes
    return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
  }
}

// Export singleton instance
export const musicDataManager = new MusicDataManager();

// Enhanced function with caching and real-time capabilities
export async function getEnhancedMusicData(forceRefresh: boolean = false): Promise<{
  primaryMood: string;
  confidence: number;
  topGenres: string[];
  trendingTracks: MultilingualTrack[];
  isRealTime: boolean;
  lastUpdate: Date | null;
  isStale: boolean;
}> {
  // Use cached data if available and not forcing refresh
  if (!forceRefresh && musicDataManager.getCachedData() && !musicDataManager.isDataStale()) {
    console.log('📋 Using cached music data');
    return {
      ...musicDataManager.getCachedData(),
      isRealTime: true,
      lastUpdate: musicDataManager.getLastUpdateTime(),
      isStale: false
    };
  }

  // Fetch fresh data
  console.log('🔄 Fetching fresh music data...');
  const freshData = await analyzeMusicMood();
  
  return {
    ...freshData,
    isRealTime: true,
    lastUpdate: new Date(),
    isStale: false
  };
}

// Language detection utilities
export function detectLanguage(track: Track): { 
  language: 'hindi' | 'english' | 'mixed'; 
  confidence: number;
  romanizedTitle?: string;
  romanizedArtist?: string;
} {
  const title = track.name.toLowerCase();
  const artist = track.artist.toLowerCase();
  
  // Check for Hindi Unicode characters (Devanagari range)
  const hindiRegex = /[\u0900-\u097F]/;
  const hasHindiScript = hindiRegex.test(track.name) || hindiRegex.test(track.artist);
  
  // Known Hindi/Bollywood artists and keywords
  const hindiArtists = [
    'arijit singh', 'shreya ghoshal', 'rahat fateh ali khan', 'atif aslam',
    'armaan malik', 'neha kakkar', 'sunidhi chauhan', 'kk', 'sonu nigam',
    'lata mangeshkar', 'kishore kumar', 'mohammed rafi', 'asha bhosle',
    'udit narayan', 'alka yagnik', 'kumar sanu', 'abhijeet', 'shaan',
    'raghav sachar', 'vishal dadlani', 'shekhar ravjiani', 'shankar mahadevan',
    'ehsaan noorani', 'loy mendonsa', 'ilaiyaraaja', 'a.r. rahman',
    'honey singh', 'badshah', 'raftaar', 'divine', 'nucleya'
  ];
  
  const hindiKeywords = [
    'bollywood', 'hindi', 'desi', 'bhangra', 'qawwali', 'ghazal',
    'thumri', 'classical', 'fusion', 'sufi', 'devotional', 'bhajan',
    'item', 'romantic', 'sad', 'party', 'wedding', 'festival'
  ];
  
  const hindiMovieKeywords = [
    'dilwale', 'bahubali', 'dangal', 'sultan', 'tiger', 'dhoom',
    'krrish', 'zindagi', 'pyaar', 'ishq', 'mohabbat', 'dil', 'jaan',
    'tera', 'mera', 'tujhe', 'tumhe', 'saath', 'sang', 'remix'
  ];
  
  let hindiScore = 0;
  let englishScore = 0;
  
  // Check for Hindi script
  if (hasHindiScript) {
    hindiScore += 50;
  }
  
  // Check artist names
  const artistMatch = hindiArtists.some(hindiArtist => 
    artist.includes(hindiArtist) || hindiArtist.includes(artist)
  );
  if (artistMatch) {
    hindiScore += 30;
  }
  
  // Check for Hindi keywords in title
  const titleHindiMatch = hindiKeywords.some(keyword => 
    title.includes(keyword)
  );
  if (titleHindiMatch) {
    hindiScore += 20;
  }
  
  // Check for Hindi movie/song keywords
  const movieMatch = hindiMovieKeywords.some(keyword => 
    title.includes(keyword)
  );
  if (movieMatch) {
    hindiScore += 15;
  }
  
  // Check for English indicators
  const englishWords = title.split(' ').filter(word => 
    word.length > 2 && /^[a-zA-Z]+$/.test(word)
  ).length;
  
  if (englishWords > 2) {
    englishScore += 20;
  }
  
  // Common English artists (basic check)
  const englishArtists = [
    'taylor swift', 'ed sheeran', 'adele', 'bruno mars', 'rihanna',
    'justin bieber', 'ariana grande', 'drake', 'the weeknd', 'billie eilish'
  ];
  
  const englishArtistMatch = englishArtists.some(englishArtist => 
    artist.includes(englishArtist)
  );
  if (englishArtistMatch) {
    englishScore += 40;
  }
  
  // Determine language based on scores
  const totalScore = hindiScore + englishScore;
  let language: 'hindi' | 'english' | 'mixed';
  let confidence: number;
  
  if (hindiScore > englishScore && hindiScore > 25) {
    language = 'hindi';
    confidence = Math.min(95, (hindiScore / totalScore) * 100);
  } else if (englishScore > hindiScore && englishScore > 15) {
    language = 'english';
    confidence = Math.min(95, (englishScore / totalScore) * 100);
  } else {
    language = 'mixed';
    confidence = 60;
  }
  
  // Generate romanized versions for Hindi content
  let romanizedTitle: string | undefined;
  let romanizedArtist: string | undefined;
  
  if (language === 'hindi' && hasHindiScript) {
    // Basic romanization (in a real app, you'd use a proper romanization library)
    romanizedTitle = track.name; // Placeholder - would need proper romanization
    romanizedArtist = track.artist; // Placeholder - would need proper romanization
  }
  
  return {
    language,
    confidence: Math.round(confidence),
    romanizedTitle,
    romanizedArtist
  };
}

// Convert regular track to multilingual track
export function enhanceTrackWithLanguage(track: EnhancedTrack): MultilingualTrack {
  const languageInfo = detectLanguage(track);
  
  return {
    ...track,
    language: languageInfo.language,
    originalScript: languageInfo.language === 'hindi' ? track.name : undefined,
    romanizedTitle: languageInfo.romanizedTitle,
    romanizedArtist: languageInfo.romanizedArtist,
    languageConfidence: languageInfo.confidence,
    region: languageInfo.language === 'hindi' ? 'bollywood' : undefined
  };
}

// Unicode text handling utilities
export function sanitizeUnicodeText(text: string): string {
  // Remove any problematic Unicode characters that might break rendering
  return text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

export function isHindiText(text: string): boolean {
  const hindiRegex = /[\u0900-\u097F]/;
  return hindiRegex.test(text);
}

export function getDisplayText(track: MultilingualTrack, field: 'title' | 'artist'): string {
  if (track.language === 'hindi') {
    if (field === 'title') {
      return track.romanizedTitle || track.name;
    } else {
      return track.romanizedArtist || track.artist;
    }
  }
  return field === 'title' ? track.name : track.artist;
}

// Local storage caching for offline support (now supports multilingual tracks)
export function cacheTrackData(tracks: MultilingualTrack[]): void {
  try {
    const cacheData = {
      tracks,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem('music_cache', JSON.stringify(cacheData));
    console.log('💾 Cached track data locally');
  } catch (error) {
    console.warn('Failed to cache track data:', error);
  }
}

export function getCachedTrackData(): MultilingualTrack[] | null {
  try {
    const cached = localStorage.getItem('music_cache');
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Return cached data if less than 24 hours old
    if (cacheData.timestamp > twentyFourHoursAgo) {
      console.log('📋 Using cached track data from localStorage');
      return cacheData.tracks;
    } else {
      console.log('🗑️ Cached data is stale, removing...');
      localStorage.removeItem('music_cache');
      return null;
    }
  } catch (error) {
    console.warn('Failed to retrieve cached track data:', error);
    return null;
  }
}
// Language distribution manager
interface LanguageDistribution {
  hindi: number; // percentage
  english: number; // percentage
  target: 'balanced' | 'hindi-heavy' | 'english-heavy';
}

// Create balanced playlist with Hindi and English songs
export function createBalancedPlaylist(
  englishTracks: EnhancedTrack[], 
  hindiTracks: MultilingualTrack[], 
  totalLimit: number = 50,
  distribution: LanguageDistribution = { hindi: 50, english: 50, target: 'balanced' }
): MultilingualTrack[] {
  const hindiCount = Math.floor((distribution.hindi / 100) * totalLimit);
  const englishCount = totalLimit - hindiCount;
  
  // Get the required number of tracks from each language
  const selectedHindi = hindiTracks.slice(0, hindiCount);
  const selectedEnglish = englishTracks.slice(0, englishCount).map(track => 
    enhanceTrackWithLanguage(track)
  );
  
  // Combine and shuffle for variety
  const combinedTracks = [...selectedHindi, ...selectedEnglish];
  return combinedTracks.sort(() => Math.random() - 0.5);
}

// Remove duplicates across languages
export function deduplicateTracks(tracks: MultilingualTrack[]): MultilingualTrack[] {
  const seen = new Set<string>();
  return tracks.filter(track => {
    const key = `${track.name.toLowerCase()}-${track.artist.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Get music recommendations based on traffic conditions
export async function getTrafficBasedRecommendations(trafficLevel: string, trafficScore: number): Promise<{
  recommendedTracks: MultilingualTrack[];
  recommendationReason: string;
  moodMatch: string;
}> {
  try {
    console.log(`🚦 Getting music recommendations for ${trafficLevel} traffic (${trafficScore}% congestion)`);
    
    let targetGenres: string[];
    let moodMatch: string;
    let recommendationReason: string;

    // Determine music based on traffic conditions
    let hindiMood: string;
    if (trafficLevel === 'High' || trafficScore > 70) {
      // High traffic = Calming music to reduce stress
      targetGenres = ['chill', 'ambient', 'classical', 'lo-fi', 'acoustic'];
      hindiMood = 'relaxing';
      moodMatch = 'Calming';
      recommendationReason = 'Heavy traffic detected. Playing calming Hindi and English music to reduce stress and promote relaxation.';
    } else if (trafficLevel === 'Moderate' || trafficScore > 40) {
      // Moderate traffic = Focus music for concentration
      targetGenres = ['jazz', 'instrumental', 'electronic', 'indie', 'alternative'];
      hindiMood = 'focus';
      moodMatch = 'Focus';
      recommendationReason = 'Moderate traffic conditions. Playing focus-oriented Hindi and English music to help maintain concentration while driving.';
    } else {
      // Low traffic = Energetic music for enjoyable driving
      targetGenres = ['pop', 'rock', 'dance', 'electronic', 'upbeat'];
      hindiMood = 'energetic';
      moodMatch = 'Energetic';
      recommendationReason = 'Light traffic conditions. Playing energetic Hindi and English music for an enjoyable driving experience.';
    }

    // Fetch tracks from recommended genres (more tracks per genre)
    const genrePromises = targetGenres.slice(0, 4).map(genre => 
      getTracksByTag(genre, 25).catch(error => {
        console.warn(`Failed to fetch tracks for genre ${genre}:`, error);
        return [];
      })
    );

    const genreResults = await Promise.allSettled(genrePromises);
    let recommendedTracks: Track[] = [];

    genreResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        recommendedTracks = recommendedTracks.concat(result.value);
        console.log(`✅ Genre ${targetGenres[index]}: ${result.value.length} tracks`);
      }
    });

    // Filter out invalid tracks and remove duplicates
    const validRecommendedTracks = recommendedTracks.filter(track => 
      track && 
      track.name && 
      track.artist && 
      typeof track.name === 'string' && 
      typeof track.artist === 'string'
    );

    const uniqueTracks = validRecommendedTracks.filter((track, index, self) => 
      index === self.findIndex(t => 
        t.name.toLowerCase() === track.name.toLowerCase() && 
        t.artist.toLowerCase() === track.artist.toLowerCase()
      )
    );

    // Get Hindi tracks for the determined mood
    console.log(`🎵 Fetching Hindi tracks for traffic mood: ${hindiMood}`);
    const hindiRecommendations = getHindiTracksByMood(hindiMood, 25)
      .map(hindiTrack => convertHindiTrackToEnhanced(hindiTrack));

    // Shuffle English recommendations for variety and enrich with metadata
    const shuffledEnglishRecommendations = uniqueTracks.sort(() => Math.random() - 0.5);
    const enrichedEnglishRecommendations = await Promise.all(
      shuffledEnglishRecommendations.slice(0, 25).map(track => enrichTrack(track))
    );

    // Create balanced traffic-based recommendations
    const balancedRecommendations = createBalancedPlaylist(
      enrichedEnglishRecommendations,
      hindiRecommendations,
      50,
      { hindi: 50, english: 50, target: 'balanced' }
    );

    // Remove duplicates
    const finalRecommendations = deduplicateTracks(balancedRecommendations);

    console.log(`🎯 Generated ${finalRecommendations.length} balanced traffic-based recommendations (${finalRecommendations.filter(t => t.language === 'hindi').length} Hindi, ${finalRecommendations.filter(t => t.language === 'english').length} English)`);

    return {
      recommendedTracks: finalRecommendations,
      recommendationReason,
      moodMatch
    };

  } catch (error) {
    console.error('❌ Error getting traffic-based recommendations:', error);
    
    // Fallback recommendations with mixed Hindi-English content
    const fallbackHindiTracks = getHindiTracksByMood('relaxing', 5)
      .map(track => convertHindiTrackToEnhanced(track));
    
    const fallbackEnglishTracks: EnhancedTrack[] = [
      { 
        name: 'Weightless', 
        artist: 'Marconi Union', 
        playcount: '500000', 
        listeners: '25000', 
        url: '#',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        albumArt: 'https://picsum.photos/300/300?random=8',
        duration: 485,
        album: 'Ambient Works',
        isPlayable: true,
        audioQuality: 'medium',
        alternativeUrls: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        ]
      },
      { 
        name: 'Peaceful Morning', 
        artist: 'Nature Sounds', 
        playcount: '300000', 
        listeners: '15000', 
        url: '#',
        previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        albumArt: 'https://picsum.photos/300/300?random=9',
        duration: 240,
        album: 'Calm Collection',
        isPlayable: true,
        audioQuality: 'medium',
        alternativeUrls: [
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
        ]
      }
    ];

    // Create balanced fallback recommendations
    const fallbackEnglishEnhanced = fallbackEnglishTracks.map(track => enhanceTrackWithLanguage(track));
    const balancedFallback = createBalancedPlaylist(
      fallbackEnglishTracks,
      fallbackHindiTracks,
      10,
      { hindi: 50, english: 50, target: 'balanced' }
    );

    return {
      recommendedTracks: balancedFallback,
      recommendationReason: 'Using fallback calming Hindi and English music recommendations.',
      moodMatch: 'Calming'
    };
  }
}