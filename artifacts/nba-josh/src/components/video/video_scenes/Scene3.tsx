import { motion } from 'framer-motion';
import type { ScenePhotos } from './types';

export function Scene3({ photos }: { photos: ScenePhotos }) {
  return (
    <motion.div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      initial={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 72% 100%)' }}
      animate={{ opacity: 1, clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 0 0)' }}
      exit={{ opacity: 0, clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 78%)' }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="absolute left-[7%] top-[16%] h-[70%] w-[37%] overflow-hidden border border-[#ff6a32]/45"
        initial={{ x: '-9%', rotate: -4, scale: 1.1 }}
        animate={{ x: 0, rotate: -1.5, scale: 1 }}
        exit={{ x: '8%', rotate: 3, scale: 1.14 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={photos.crowd}
          alt=""
          className="h-full w-full object-cover object-center"
          initial={{ scale: 1.18, x: '2%' }}
          animate={{ scale: [1.18, 1.04], x: ['2%', '-2%'] }}
          exit={{ scale: 1.3, x: '4%' }}
          transition={{ duration: 4.1, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,18,24,0.25),rgba(7,18,24,0.82))]" />
      </motion.div>

      <motion.div
        className="absolute right-[8%] top-[22%] display-face text-[13.5vw] uppercase leading-[0.75] text-[#ff6a32]/90"
        initial={{ opacity: 0, x: 60, scale: 0.88 }}
        animate={{ opacity: 0.9, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -45, scale: 1.08 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        THE
        <br />
        ONE
      </motion.div>

      <motion.div
        className="absolute right-[9%] bottom-[19%] flex items-end gap-[1.1vw]"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -25 }}
        transition={{ duration: 0.55, delay: 0.8 }}
      >
        <div className="h-[8vw] w-[0.18vw] bg-[#9bdae2]" />
        <div>
          <div className="mono-face text-[0.85vw] tracking-[0.27em] text-[#9bdae2]">CROWD CONTROL / 03</div>
          <div className="mt-[0.8vw] display-face text-[2.8vw] leading-none text-[#f5f0e8]">NO REPEAT.</div>
        </div>
      </motion.div>
    </motion.div>
  );
}
