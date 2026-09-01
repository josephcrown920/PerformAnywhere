import { motion } from 'framer-motion';
import type { ScenePhotos } from './types';

export function Scene4({ photos }: { photos: ScenePhotos }) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      initial={{ opacity: 0, clipPath: 'polygon(0 100%, 0 100%, 24% 100%, 24% 100%)' }}
      animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', scale: 1.06 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute inset-[10%] overflow-hidden border border-[#f5f0e8]/35"
        initial={{ scale: 1.15, rotate: -4, x: '-2%' }}
        animate={{ scale: 1, rotate: -1.2, x: 0 }}
        exit={{ scale: 1.12, rotate: 2, x: '3%' }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={photos.tilt}
          alt=""
          className="h-full w-full object-cover object-center"
          initial={{ scale: 1.22, x: '-2%' }}
          animate={{ scale: [1.22, 1.06], x: ['-2%', '2%'] }}
          exit={{ scale: 1.3, x: '-3%' }}
          transition={{ duration: 3.1, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,24,0.8),rgba(7,18,24,0.1)_50%,rgba(7,18,24,0.58))]" />
        <div className="absolute inset-0 scanline-overlay opacity-25" />
      </motion.div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          className="mono-face mb-[1.4vw] text-[0.92vw] tracking-cinematic text-[#9bdae2]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.55, delay: 0.44 }}
        >
          NBA JOSH / THE ONE / 04
        </motion.div>
        <motion.div
          className="display-face text-[5.7vw] leading-[0.9] tracking-[0.015em] text-[#f5f0e8]"
          initial={{ opacity: 0, y: 42, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -38, scale: 1.07 }}
          transition={{ duration: 0.9, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          STREAM 'THE ONE' NOW.
        </motion.div>
        <motion.div
          className="mt-[1.5vw] h-[0.18vw] w-[17vw] bg-[#ff6a32]"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '17vw', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.75, delay: 1.05 }}
        />
        <motion.div
          className="mt-[1.15vw] mono-face text-[0.82vw] tracking-[0.25em] text-[#f5f0e8]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 1.28 }}
        >
          ONE TAKE. ALL NIGHT.
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-[16%] left-[8%] mono-face text-[0.78vw] tracking-[0.2em] text-[#ff6a32]"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.45, delay: 1.05 }}
      >
        REC / FINAL TAKE
      </motion.div>
    </motion.div>
  );
}
