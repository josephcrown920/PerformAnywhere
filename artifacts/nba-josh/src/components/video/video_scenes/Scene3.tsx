import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-[12vw] font-display text-[#e63b2e] mix-blend-overlay uppercase tracking-tighter opacity-20 glitch"
        animate={{ 
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 0.1, repeat: Infinity }}
      >
        SYSTEM ERROR
      </motion.div>
    </motion.div>
  );
}
