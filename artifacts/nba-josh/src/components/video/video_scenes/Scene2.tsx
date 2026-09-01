import { motion } from 'framer-motion';
import type { ScenePhotos } from './types';

export function Scene2({ photos }: { photos: ScenePhotos }) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      initial={{ opacity: 0, clipPath: 'circle(0% at 76% 48%)', scale: 0.98 }}
      animate={{ opacity: 1, clipPath: 'circle(100% at 76% 48%)', scale: 1 }}
      exit={{ opacity: 0, clipPath: 'circle(0% at 18% 50%)', scale: 1.03 }}
      transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute right-[7%] top-[17%] h-[69%] w-[37%] overflow-hidden border border-[#9bdae2]/40"
        initial={{ x: '13%', rotate: 4, scale: 1.08 }}
        animate={{ x: 0, rotate: 1.5, scale: 1 }}
        exit={{ x: '-10%', rotate: -4, scale: 1.12 }}
        transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={photos.profile}
          alt=""
          className="h-full w-full object-cover object-center"
          initial={{ scale: 1.18, y: '2%' }}
          animate={{ scale: [1.18, 1.04], y: ['2%', '-2%'] }}
          exit={{ scale: 1.28, y: '4%' }}
          transition={{ duration: 5.2, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,18,24,0.1),rgba(7,18,24,0.75))]" />
        <div className="absolute inset-0 scanline-overlay opacity-30" />
      </motion.div>

      <div className="absolute left-[8%] bottom-[21%]">
        <motion.div
          className="mono-face mb-[1.3vw] text-[0.9vw] tracking-cinematic text-[#ff6a32]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          SIGNAL / 02 — LOCKED IN
        </motion.div>
        <motion.div
          className="display-face text-[9.8vw] uppercase leading-[0.8] text-[#f5f0e8]"
          initial={{ opacity: 0, x: -60, skewX: -8 }}
          animate={{ opacity: 1, x: 0, skewX: 0 }}
          exit={{ opacity: 0, x: 50, skewX: 8 }}
          transition={{ duration: 0.85, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          THE
          <br />
          ONE
        </motion.div>
        <motion.div
          className="mt-[1.3vw] mono-face max-w-[25vw] text-[0.86vw] leading-[1.7] tracking-[0.11em] text-[#f5f0e8]/62"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.02 }}
        >
          NO DISTRACTION.
          <br />
          JUST THE TAKE.
        </motion.div>
      </div>
    </motion.div>
  );
}
