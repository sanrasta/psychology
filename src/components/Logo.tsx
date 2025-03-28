"use client";

import { motion } from "framer-motion";

export default function Logo() {
  return (
    <div className="flex flex-col items-center space-y-3 mt-24 sm:mt-0">
      <motion.div 
        className="flex items-center space-x-1"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Simplified animations with reduced frames */}
        <motion.div 
          className="w-5 h-5 bg-red-500 transform rounded-sm will-change-transform"
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.5, 1]
          }}
        />
        
        {/* Blue block with delayed wave - simplified */}
        <motion.div 
          className="w-5 h-5 bg-blue-500 transform rounded-sm will-change-transform"
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.25,
            times: [0, 0.5, 1]
          }}
        />
        
        {/* Green block with further delayed wave - simplified */}
        <motion.div 
          className="w-5 h-5 bg-green-500 transform rounded-sm will-change-transform"
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
            times: [0, 0.5, 1]
          }}
        />
        
        {/* Yellow block with the last wave in sequence - simplified */}
        <motion.div 
          className="w-5 h-5 bg-yellow-500 transform rounded-sm will-change-transform"
          initial={{ y: 0 }}
          animate={{ 
            y: [0, -8, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.75,
            times: [0, 0.5, 1]
          }}
        />
      </motion.div>
    </div>
  );
} 