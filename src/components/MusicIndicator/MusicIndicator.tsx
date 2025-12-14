import React from 'react';
import { motion } from 'framer-motion';

interface MusicIndicatorProps {
  isVisible: boolean;
  onClick: () => void;
}

export function MusicIndicator({ isVisible, onClick }: MusicIndicatorProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <motion.button
        onClick={onClick}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.svg
          className="w-6 h-6"
          fill="currentColor"
          viewBox="0 0 20 20"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path fillRule="evenodd" d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" clipRule="evenodd" />
        </motion.svg>
      </motion.button>
      
      {/* Floating music notes */}
      <motion.div
        className="absolute -top-2 -right-2"
        animate={{
          y: [-20, -40, -20],
          x: [0, 10, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <span className="text-green-500 text-lg">♪</span>
      </motion.div>
      
      <motion.div
        className="absolute -top-4 -left-2"
        animate={{
          y: [-15, -35, -15],
          x: [0, -8, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <span className="text-green-400 text-sm">♫</span>
      </motion.div>
    </motion.div>
  );
}