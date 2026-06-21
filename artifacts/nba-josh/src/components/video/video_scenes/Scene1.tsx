import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center top-[-10%]">
        <motion.div
          className="overflow-hidden"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h1 
            className="text-[6vw] font-display text-white tracking-[0.2em] uppercase leading-none mix-blend-overlay"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            NBA JOSH
          </motion.h1>
        </motion.div>
        
        <motion.div
          className="h-[2px] bg-[#e63b2e] mt-2"
          initial={{ width: 0 }}
          animate={phase >= 1 ? { width: '20vw' } : { width: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />

        <motion.h2
          className="text-[2vw] font-mono text-[#f0c040] tracking-widest mt-4 uppercase"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={phase >= 2 ? { opacity: 0.8, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 0.8 }}
        >
          Looping Officers
        </motion.h2>
      </div>
    </motion.div>
  );
}
