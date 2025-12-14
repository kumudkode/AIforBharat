import React from 'react';
import { motion } from 'framer-motion';
import { TrafficData } from '../../services/trafficService';

interface TrafficVisualizationProps {
  trafficData: TrafficData;
  className?: string;
}

export function TrafficVisualization({ trafficData, className = '' }: TrafficVisualizationProps) {
  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'Low': return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-500' };
      case 'Moderate': return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'ring-yellow-500' };
      case 'High': return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-500' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-600', ring: 'ring-gray-500' };
    }
  };

  const getSpeedColor = (speed: number) => {
    if (speed > 40) return 'text-green-500';
    if (speed > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case 'Clear': return '☀️';
      case 'Cloudy': return '☁️';
      case 'Light Rain': return '🌦️';
      case 'Heavy Rain': return '🌧️';
      case 'Snow': return '❄️';
      case 'Fog': return '🌫️';
      default: return '🌤️';
    }
  };

  const colors = getTrafficColor(trafficData.level);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-6">
        {/* Header with Location */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-4 h-4 rounded-full ${colors.bg} shadow-lg`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {trafficData.location}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{getWeatherIcon(trafficData.weatherCondition)} {trafficData.weatherCondition}</span>
                <span>•</span>
                <span className={trafficData.dataSource === 'real' ? 'text-green-600' : 'text-blue-600'}>
                  {trafficData.dataSource === 'real' ? '🔴 Live' : '📊 Simulated'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last Updated
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {trafficData.timestamp.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Traffic Level Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Traffic Level</span>
            <span className={`text-sm font-bold ${colors.text}`}>{trafficData.level}</span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                className={`h-3 rounded-full ${colors.bg} shadow-sm`}
                initial={{ width: 0 }}
                animate={{ width: `${trafficData.congestionScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0%</span>
              <span className="font-medium">{trafficData.congestionScore}% Congestion</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Average Speed */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Avg Speed</div>
                <div className={`text-lg font-bold ${getSpeedColor(trafficData.averageSpeed)}`}>
                  {trafficData.averageSpeed} km/h
                </div>
              </div>
            </div>
          </div>

          {/* Incidents */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Incidents</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {trafficData.incidents}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Road Condition */}
        {trafficData.roadCondition && (
          <div className="bg-white/30 dark:bg-gray-800/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Road Condition: <span className="font-medium">{trafficData.roadCondition}</span>
              </span>
            </div>
          </div>
        )}

        {/* Coordinates (for debugging/info) */}
        {trafficData.coordinates && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            📍 {trafficData.coordinates.lat.toFixed(4)}, {trafficData.coordinates.lng.toFixed(4)}
          </div>
        )}
      </div>

      {/* Animated Background Elements */}
      <div className="absolute top-4 right-4 opacity-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-500">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}