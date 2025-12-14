import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHistoricalTraffic, TrafficData } from '../../services/trafficService';

interface TrafficChartProps {
  className?: string;
}

export function TrafficChart({ className = '' }: TrafficChartProps) {
  const [historicalData, setHistoricalData] = useState<TrafficData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    try {
      setIsLoading(true);
      const data = await getHistoricalTraffic(12); // Last 12 hours
      setHistoricalData(data);
    } catch (error) {
      console.error('Failed to load historical traffic data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxCongestion = Math.max(...historicalData.map(d => d.congestionScore), 100);
  const chartHeight = 120;

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${className}`}>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Traffic Trends (Last 12 Hours)
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Congestion levels throughout the day
        </p>
      </div>

      <div className="relative" style={{ height: chartHeight }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0">
            <div className="absolute top-0 w-full h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute top-1/2 w-full h-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="absolute bottom-0 w-full h-px bg-gray-200 dark:bg-gray-700"></div>
          </div>

          {/* Chart bars */}
          <div className="flex items-end justify-between h-full gap-1">
            {historicalData.map((data, index) => {
              const height = (data.congestionScore / maxCongestion) * chartHeight;
              const color = data.congestionScore < 35 
                ? 'bg-green-500' 
                : data.congestionScore < 70 
                ? 'bg-yellow-500' 
                : 'bg-red-500';

              return (
                <motion.div
                  key={index}
                  className={`${color} rounded-t-sm min-w-[8px] flex-1 relative group cursor-pointer`}
                  style={{ height: `${height}px` }}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}px` }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                      <div className="font-semibold">{data.congestionScore}% congestion</div>
                      <div>{data.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      <div>{data.averageSpeed} km/h avg speed</div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{historicalData[0]?.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span>Now</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">Moderate</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600 dark:text-gray-400">High</span>
        </div>
      </div>
    </div>
  );
}