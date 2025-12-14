// Fallback Hindi music database with popular Bollywood and indie Hindi tracks
export interface HindiTrack {
  name: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  mood: string;
  playcount: string;
  listeners: string;
  duration: number; // in seconds
  language: 'hindi';
  region: 'bollywood' | 'punjabi' | 'indie-hindi' | 'classical-indian';
}

// Curated list of popular Hindi songs across different moods and genres
export const HINDI_MUSIC_DATABASE: HindiTrack[] = [
  // Energetic/Upbeat Hindi Songs
  {
    name: "Jai Ho",
    artist: "A.R. Rahman",
    album: "Slumdog Millionaire",
    year: 2008,
    genre: "bollywood",
    mood: "energetic",
    playcount: "5000000",
    listeners: "250000",
    duration: 212,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Nagada Sang Dhol",
    artist: "Shreya Ghoshal, Osman Mir",
    album: "Goliyon Ki Raasleela Ram-Leela",
    year: 2013,
    genre: "bollywood",
    mood: "energetic",
    playcount: "3500000",
    listeners: "180000",
    duration: 245,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Malhari",
    artist: "Vishal Dadlani",
    album: "Bajirao Mastani",
    year: 2015,
    genre: "bollywood",
    mood: "energetic",
    playcount: "4200000",
    listeners: "220000",
    duration: 267,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Tattad Tattad",
    artist: "Arijit Singh",
    album: "Goliyon Ki Raasleela Ram-Leela",
    year: 2013,
    genre: "bollywood",
    mood: "energetic",
    playcount: "2800000",
    listeners: "150000",
    duration: 198,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Gallan Goodiyaan",
    artist: "Yashita Sharma, Manish Kumar Tipu, Farhan Akhtar",
    album: "Dil Dhadakne Do",
    year: 2015,
    genre: "bollywood",
    mood: "energetic",
    playcount: "3100000",
    listeners: "165000",
    duration: 223,
    language: "hindi",
    region: "bollywood"
  },

  // Chill/Romantic Hindi Songs
  {
    name: "Tum Hi Ho",
    artist: "Arijit Singh",
    album: "Aashiqui 2",
    year: 2013,
    genre: "bollywood",
    mood: "chill",
    playcount: "8500000",
    listeners: "420000",
    duration: 262,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Raabta",
    artist: "Arijit Singh",
    album: "Agent Vinod",
    year: 2012,
    genre: "bollywood",
    mood: "chill",
    playcount: "4800000",
    listeners: "240000",
    duration: 245,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Channa Mereya",
    artist: "Arijit Singh",
    album: "Ae Dil Hai Mushkil",
    year: 2016,
    genre: "bollywood",
    mood: "chill",
    playcount: "6200000",
    listeners: "310000",
    duration: 298,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Ae Watan",
    artist: "Rahat Fateh Ali Khan",
    album: "Raazi",
    year: 2018,
    genre: "bollywood",
    mood: "chill",
    playcount: "3700000",
    listeners: "185000",
    duration: 267,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Kabira",
    artist: "Tochi Raina, Rekha Bhardwaj",
    album: "Yeh Jawaani Hai Deewani",
    year: 2013,
    genre: "bollywood",
    mood: "chill",
    playcount: "4100000",
    listeners: "205000",
    duration: 234,
    language: "hindi",
    region: "bollywood"
  },

  // Focus/Instrumental Hindi Songs
  {
    name: "Raga Yaman",
    artist: "Pandit Ravi Shankar",
    album: "Classical Ragas",
    year: 1995,
    genre: "classical-indian",
    mood: "focus",
    playcount: "1200000",
    listeners: "60000",
    duration: 432,
    language: "hindi",
    region: "classical-indian"
  },
  {
    name: "Vande Mataram",
    artist: "A.R. Rahman",
    album: "Vande Mataram",
    year: 1997,
    genre: "patriotic",
    mood: "focus",
    playcount: "2800000",
    listeners: "140000",
    duration: 356,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Maa Tujhhe Salaam",
    artist: "A.R. Rahman",
    album: "Vande Mataram",
    year: 1997,
    genre: "patriotic",
    mood: "focus",
    playcount: "3200000",
    listeners: "160000",
    duration: 398,
    language: "hindi",
    region: "bollywood"
  },

  // Upbeat/Party Hindi Songs
  {
    name: "Lungi Dance",
    artist: "Honey Singh, Shreya Ghoshal",
    album: "Chennai Express",
    year: 2013,
    genre: "bollywood",
    mood: "upbeat",
    playcount: "5500000",
    listeners: "275000",
    duration: 198,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Nagada Sang Dhol",
    artist: "Shreya Ghoshal, Osman Mir",
    album: "Goliyon Ki Raasleela Ram-Leela",
    year: 2013,
    genre: "bollywood",
    mood: "upbeat",
    playcount: "3500000",
    listeners: "180000",
    duration: 245,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Dil Diyan Gallan",
    artist: "Atif Aslam",
    album: "Tiger Zinda Hai",
    year: 2017,
    genre: "bollywood",
    mood: "upbeat",
    playcount: "4600000",
    listeners: "230000",
    duration: 267,
    language: "hindi",
    region: "bollywood"
  },

  // Relaxing/Sufi Hindi Songs
  {
    name: "Kun Faya Kun",
    artist: "A.R. Rahman, Javed Ali, Mohit Chauhan",
    album: "Rockstar",
    year: 2011,
    genre: "sufi",
    mood: "relaxing",
    playcount: "4800000",
    listeners: "240000",
    duration: 456,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Ishq Sufiyana",
    artist: "Kamal Khan",
    album: "The Dirty Picture",
    year: 2011,
    genre: "sufi",
    mood: "relaxing",
    playcount: "2100000",
    listeners: "105000",
    duration: 298,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Allah Ke Bande",
    artist: "Kailash Kher",
    album: "Waisa Bhi Hota Hai Part II",
    year: 2003,
    genre: "sufi",
    mood: "relaxing",
    playcount: "3400000",
    listeners: "170000",
    duration: 334,
    language: "hindi",
    region: "bollywood"
  },

  // Modern Hindi/Indie Songs
  {
    name: "Khairiyat",
    artist: "Arijit Singh",
    album: "Chhichhore",
    year: 2019,
    genre: "bollywood",
    mood: "chill",
    playcount: "5200000",
    listeners: "260000",
    duration: 278,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Bekhayali",
    artist: "Sachet Tandon",
    album: "Kabir Singh",
    year: 2019,
    genre: "bollywood",
    mood: "chill",
    playcount: "7800000",
    listeners: "390000",
    duration: 321,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Vaaste",
    artist: "Dhvani Bhanushali, Nikhil D'Souza",
    album: "Single",
    year: 2019,
    genre: "indie-hindi",
    mood: "chill",
    playcount: "6500000",
    listeners: "325000",
    duration: 198,
    language: "hindi",
    region: "indie-hindi"
  },

  // Punjabi/Regional Hindi Songs
  {
    name: "Gur Naal Ishq Mitha",
    artist: "Yo Yo Honey Singh",
    album: "Single",
    year: 2012,
    genre: "punjabi",
    mood: "energetic",
    playcount: "4200000",
    listeners: "210000",
    duration: 234,
    language: "hindi",
    region: "punjabi"
  },
  {
    name: "Dil Chori",
    artist: "Yo Yo Honey Singh, Simar Kaur, Ishers",
    album: "Sonu Ke Titu Ki Sweety",
    year: 2018,
    genre: "punjabi",
    mood: "upbeat",
    playcount: "3800000",
    listeners: "190000",
    duration: 212,
    language: "hindi",
    region: "punjabi"
  },

  // Classic Bollywood
  {
    name: "Lag Jaa Gale",
    artist: "Lata Mangeshkar",
    album: "Woh Kaun Thi",
    year: 1964,
    genre: "classic-bollywood",
    mood: "chill",
    playcount: "2800000",
    listeners: "140000",
    duration: 198,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Pyar Deewana Hota Hai",
    artist: "Kishore Kumar",
    album: "Kati Patang",
    year: 1971,
    genre: "classic-bollywood",
    mood: "upbeat",
    playcount: "2200000",
    listeners: "110000",
    duration: 234,
    language: "hindi",
    region: "bollywood"
  },
  {
    name: "Chura Liya Hai Tumne Jo Dil Ko",
    artist: "Asha Bhosle, Mohammed Rafi",
    album: "Yaadon Ki Baaraat",
    year: 1973,
    genre: "classic-bollywood",
    mood: "chill",
    playcount: "1900000",
    listeners: "95000",
    duration: 267,
    language: "hindi",
    region: "bollywood"
  }
];

// Get Hindi tracks by mood
export function getHindiTracksByMood(mood: string, limit: number = 20): HindiTrack[] {
  const moodMap: { [key: string]: string[] } = {
    'energetic': ['energetic', 'upbeat'],
    'chill': ['chill', 'relaxing'],
    'focus': ['focus', 'relaxing'],
    'upbeat': ['upbeat', 'energetic'],
    'relaxing': ['relaxing', 'chill']
  };
  
  const targetMoods = moodMap[mood.toLowerCase()] || [mood.toLowerCase()];
  
  const filteredTracks = HINDI_MUSIC_DATABASE.filter(track => 
    targetMoods.includes(track.mood)
  );
  
  // Shuffle and return limited results
  const shuffled = filteredTracks.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

// Get random Hindi tracks
export function getRandomHindiTracks(limit: number = 50): HindiTrack[] {
  const shuffled = [...HINDI_MUSIC_DATABASE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

// Get Hindi tracks by genre/region
export function getHindiTracksByRegion(region: string, limit: number = 20): HindiTrack[] {
  const filteredTracks = HINDI_MUSIC_DATABASE.filter(track => 
    track.region === region || track.genre === region
  );
  
  const shuffled = filteredTracks.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit);
}

// Convert Hindi database track to EnhancedTrack format
export function convertHindiTrackToEnhanced(hindiTrack: HindiTrack): import('./musicService').MultilingualTrack {
  return {
    name: hindiTrack.name,
    artist: hindiTrack.artist,
    album: hindiTrack.album,
    playcount: hindiTrack.playcount,
    listeners: hindiTrack.listeners,
    url: '#',
    duration: hindiTrack.duration,
    previewUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`,
    albumArt: `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 100) + 1}`,
    alternativeUrls: [
      `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`,
      `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 16) + 1}.mp3`
    ],
    audioQuality: 'medium',
    isPlayable: true,
    loadingState: 'idle',
    language: 'hindi',
    region: hindiTrack.region,
    languageConfidence: 95,
    originalScript: hindiTrack.name,
    romanizedTitle: hindiTrack.name,
    romanizedArtist: hindiTrack.artist
  };
}