import { motion } from 'framer-motion';
import type { ScenePhotos } from './types';

export function Scene1({ photos }: { photos: ScenePhotos }) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      initial={{ opacity: 0, clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
      animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      exit={{ opacity: 0, clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)', scale: 1.04 }}
      transition={{ duration: 1.15, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute left-[7%] top-[20%] h-[52%] w-[57%] overflow-hidden border border-[#f5f0e8]/25"
        initial={{ scale: 1.16, x: '-5%', rotate: -1.5 }}
        animate={{ scale: 1, x: 0, rotate: 0 }}
        exit={{ scale: 1.12, x: '8%', rotate: 2 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={photos.opener}
          alt=""
          className="h-full w-full object-cover object-center"
          initial={{ scale: 1.18, x: '3%' }}
          animate={{ scale: [1.18, 1.04], x: ['3%', '-1%'] }}
          exit={{ scale: 1.28, x: '5%' }}
          transition={{ duration: 4.4, ease: 'linear' }}
        />
        <div className="absolute inset-0 photo-vignette" />
        <div className="absolute inset-0 scanline-overlay opacity-35" />
      </motion.div>

      <div className="absolute left-[8%] top-[26%]">
        <motion.div
          className="mono-face mb-[1.5vw] text-[0.9vw] tracking-cinematic text-[#9bdae2]"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          FIELD RECORDING / 01
        </motion.div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '13vw' }}
          exit={{ width: 0 }}
          className="mb-[1.2vw] h-[0.18vw] bg-[#ff6a32]"
          transition={{ duration: 0.7, delay: 0.36 }}
        />
        <motion.h2
          className="display-face text-[8.6vw] leading-[0.82] uppercase text-[#f5f0e8]"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 1.03 }}
          transition={{ duration: 0.8, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          NBA
          <br />
          JOSH
        </motion.h2>
      </div>

      <motion.div
        className="absolute right-[8%] bottom-[22%] display-face text-[5.6vw] leading-[0.86] text-stroke"
        initial={{ opacity: 0, x: 38, rotate: 3 }}
        animate={{ opacity: 0.82, x: 0, rotate: 0 }}
        exit={{ opacity: 0, x: -28, rotate: -3 }}
        transition={{ duration: 0.9, delay: 0.75 }}
      >
        THE
        <br />
        ONE
      </motion.div>

      <motion.div
        className="absolute right-[8%] bottom-[14%] mono-face text-[0.82vw] tracking-[0.28em] text-[#f5f0e8]/70"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.5, delay: 1.05 }}
      >
        ONE VOICE / ONE CITY
      </motion.div>
    </motion.div>
  );
}
