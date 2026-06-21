import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div 
      className="absolute inset-0 w-full h-full pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute left-[8%] bottom-[20%] max-w-[30vw]">
        <motion.div
          className="text-[4vw] font-display text-white uppercase leading-tight mix-blend-overlay"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 0.4 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          RUNNING
          <br/>
          NOWHERE
        </motion.div>
      </div>
    </motion.div>
  );
}
