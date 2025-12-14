import { TrafficData } from './trafficService';

export interface MusicRecommendation {
  type: string;
  emoji: string;
  description: string;
  confidence: number;
  reasoning: string;
  genres: string[];
  energy: 'Low' | 'Medium' | 'High';
}

export interface CorrelationInsight {
  traffic: TrafficData;
  musicMood: string;
  recommendation: MusicRecommendation;
  correlationStrength: number; // 0-1
  timestamp: Date;
}

// Enhanced recommendation logic based on traffic conditions
export function generateMusicRecommendation(
  traffic: TrafficData,
  currentMusicMood: string,
  topGenres: string[] = []
): MusicRecommendation {
  
  const recommendations: Record<string, MusicRecommendation> = {
    'High': {
      type: 'Calm & Relaxing',
      emoji: '🧘‍♀️',
      description: 'Soothing music to reduce stress during heavy traffic',
      confidence: 85,
      reasoning: 'High traffic stress calls for calming influences',
      genres: ['ambient', 'classical', 'jazz', 'acoustic'],
      energy: 'Low'
    },
    'Moderate': {
      type: 'Focus & Concentration',
      emoji: '🎯',
      description: 'Instrumental beats to maintain focus while driving',
      confidence: 75,
      reasoning: 'Moderate traffic requires sustained attention',
      genres: ['instrumental', 'lo-fi', 'post-rock', 'minimal'],
      energy: 'Medium'
    },
    'Low': {
      type: 'Energetic & Uplifting',
      emoji: '🚀',
      description: 'Upbeat music to enjoy the smooth ride',
      confidence: 90,
      reasoning: 'Clear roads allow for more engaging music',
      genres: ['pop', 'rock', 'electronic', 'hip-hop'],
      energy: 'High'
    }
  };

  const baseRecommendation = recommendations[traffic.level];
  
  // Adjust confidence based on current music trends
  let adjustedConfidence = baseRecommendation.confidence;
  
  if (topGenres.length > 0) {
    const genreMatch = topGenres.some(genre => 
      baseRecommendation.genres.some(recGenre => 
        genre.toLowerCase().includes(recGenre) || recGenre.includes(genre.toLowerCase())
      )
    );
    
    if (genreMatch) {
      adjustedConfidence += 10;
    }
  }
  
  // Time-based adjustments
  const hour = new Date().getHours();
  if (hour >= 22 || hour <= 6) {
    // Night time - prefer calmer music regardless of traffic
    if (traffic.level !== 'High') {
      return {
        ...recommendations['High'],
        type: 'Night Vibes',
        emoji: '🌙',
        description: 'Mellow tunes perfect for night driving',
        reasoning: 'Late night calls for relaxed atmosphere',
        confidence: adjustedConfidence
      };
    }
  }
  
  return {
    ...baseRecommendation,
    confidence: Math.min(100, adjustedConfidence)
  };
}

// Calculate correlation strength between music mood and traffic
export function calculateCorrelation(
  musicMood: string,
  traffic: TrafficData
): number {
  const correlationMatrix: Record<string, Record<string, number>> = {
    'Energetic': {
      'Low': 0.8,      // High correlation - energetic music fits low traffic
      'Moderate': 0.4,  // Medium correlation
      'High': 0.2      // Low correlation - energetic music doesn't fit heavy traffic
    },
    'Chill': {
      'Low': 0.6,      // Medium correlation
      'Moderate': 0.7,  // Good correlation
      'High': 0.9      // High correlation - chill music perfect for heavy traffic
    },
    'Focus': {
      'Low': 0.3,      // Low correlation - focus music not needed in light traffic
      'Moderate': 0.8,  // High correlation - focus music great for moderate traffic
      'High': 0.7      // Good correlation - focus helps in heavy traffic
    }
  };

  return correlationMatrix[musicMood]?.[traffic.level] || 0.5;
}

// Generate correlation insights
export function generateCorrelationInsight(
  traffic: TrafficData,
  musicMood: string,
  topGenres: string[] = []
): CorrelationInsight {
  const recommendation = generateMusicRecommendation(traffic, musicMood, topGenres);
  const correlationStrength = calculateCorrelation(musicMood, traffic);
  
  return {
    traffic,
    musicMood,
    recommendation,
    correlationStrength,
    timestamp: new Date()
  };
}

// Generate historical correlation data for charts
export async function getHistoricalCorrelations(hours: number = 24): Promise<CorrelationInsight[]> {
  const insights: CorrelationInsight[] = [];
  const now = new Date();
  
  const musicMoods = ['Energetic', 'Chill', 'Focus'];
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Generate traffic data
    let baseScore = 25;
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
      baseScore += 35;
    }
    if (hour >= 22 || hour <= 6) {
      baseScore -= 15;
    }
    baseScore += Math.random() * 15 - 7.5;
    const congestionScore = Math.max(0, Math.min(100, baseScore));
    
    let level: 'Low' | 'Moderate' | 'High';
    if (congestionScore < 30) level = 'Low';
    else if (congestionScore < 70) level = 'Moderate';
    else level = 'High';
    
    const traffic: TrafficData = {
      level,
      congestionScore: Math.round(congestionScore),
      averageSpeed: level === 'Low' ? 60 : level === 'Moderate' ? 35 : 20,
      incidents: Math.floor(Math.random() * 3),
      location: 'Historical',
      timestamp
    };
    
    // Select music mood based on time and some randomness
    let musicMood: string;
    if (hour >= 22 || hour <= 6) {
      musicMood = Math.random() > 0.3 ? 'Chill' : 'Focus';
    } else if (hour >= 9 && hour <= 17) {
      musicMood = musicMoods[Math.floor(Math.random() * musicMoods.length)];
    } else {
      musicMood = Math.random() > 0.4 ? 'Energetic' : 'Chill';
    }
    
    const insight = generateCorrelationInsight(traffic, musicMood);
    insight.timestamp = timestamp;
    
    insights.push(insight);
  }
  
  return insights;
}