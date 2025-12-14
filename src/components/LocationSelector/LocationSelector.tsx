import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Location {
  name: string;
  country: string;
  flag: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const FEATURED_LOCATIONS: Location[] = [
  {
    name: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    name: 'New Delhi',
    country: 'India', 
    flag: '🇮🇳',
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  {
    name: 'Bangalore',
    country: 'India',
    flag: '🇮🇳',
    coordinates: { lat: 12.9716, lng: 77.5946 }
  }
];

interface LocationSelectorProps {
  onLocationChange?: (location: Location) => void;
  className?: string;
}

export const LocationSelector = React.memo(function LocationSelector({ onLocationChange, className = '' }: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location>(FEATURED_LOCATIONS[0]);

  // Remove the problematic useEffect - initial location will be set by parent component

  const handleLocationSelect = (location: Location) => {
    if (selectedLocation.name !== location.name) {
      console.log('🌍 Switching to location:', location.name);
      setSelectedLocation(location);
      onLocationChange?.(location);
    } else {
      console.log('🔄 Location already selected:', location.name);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
              📍 Featured Locations:
            </span>
            {FEATURED_LOCATIONS.map((location, index) => (
              <motion.button
                key={location.name}
                onClick={() => handleLocationSelect(location)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedLocation.name === location.name
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{location.flag}</span>
                <span>{location.name}</span>
                {selectedLocation.name === location.name && (
                  <motion.div
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});