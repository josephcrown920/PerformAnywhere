import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';

import joshMicImg from '@assets/IMG_8712_1782053075069.jpg';
import joshFaceImg from '@assets/IMG_8707_1782053075069.jpg';
import hookAudio from '@assets/The_one_hook2_1782053088995.mp3';

export const SCENE_DURATIONS: Record<string, number> = {
  opening: 3000,
  build: 5000,
  tension: 4000,
  exit: 3000,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  opening: Scene1,
  build: Scene2,
  tension: Scene3,
  exit: Scene4,
};

const SCENE_START_SEC: Record<string, number> = (() => {
  const out: Record<string, number> = {};
  let cumulativeMs = 0;
  for (const [key, ms] of Object.entries(SCENE_DURATIONS)) {
    out[key] = cumulativeMs / 1000;
    cumulativeMs += ms;
  }
  return out;
})();

const AUDIO_SEEK_EPSILON_SEC = 0.18;

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  muted = false,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  muted?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.85;
    const targetTime = SCENE_START_SEC[baseSceneKey] ?? 0;
    if (Math.abs(audio.currentTime - targetTime) > AUDIO_SEEK_EPSILON_SEC) {
      audio.currentTime = targetTime;
    }
    audio.play().catch(() => {});
  }, [currentSceneKey, baseSceneKey, muted]);

  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  const isExitScene = baseSceneKey === 'exit';
  const joshImg = isExitScene ? joshFaceImg : joshMicImg;

  return (
    <div className="w-full h-screen overflow-hidden relative bg-[#080808]">
      {/* Background layer */}
      <div className="absolute inset-0">
        <motion.img
          src={`${import.meta.env.BASE_URL}images/bg-street.png`}
          className="w-full h-full object-cover opacity-60"
          animate={{ scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      </div>

      {/* Officers Loop (Top Left) */}
      <div className="absolute top-[5%] left-[5%] w-[38%] h-[45%] overflow-hidden border border-[#1e4a70]/30 shadow-[0_0_20px_rgba(30,74,112,0.2)]">
        <motion.div className="absolute inset-0 bg-[#1e4a70]/20 mix-blend-color-burn z-10" />
        <div className="absolute inset-0 scanline-overlay z-20 opacity-50" />
        <motion.img
          src={`${import.meta.env.BASE_URL}images/officers.png`}
          className="w-[120%] h-[120%] object-cover object-center glitch"
          style={{ filter: 'contrast(1.2) sepia(0.5) hue-rotate(180deg) saturate(200%) brightness(0.8)' }}
          animate={{ x: [0, -10, 5, -5, 0], y: [0, 5, -5, 10, 0] }}
          transition={{ duration: 0.2, repeat: Infinity }}
        />
      </div>

      {/* NBA Josh (Bottom Right) */}
      <motion.div
        className="absolute bottom-[5%] right-[5%] w-[40%] h-[60%] overflow-hidden border border-[#e63b2e]/20"
        animate={{
          x: sceneIndex === 3 ? '100vw' : 0,
          opacity: sceneIndex === 3 ? [1, 1, 0] : 1,
        }}
        transition={{ duration: 2, ease: 'easeInOut', delay: sceneIndex === 3 ? 1 : 0 }}
      >
        <motion.div className="absolute inset-0 bg-gradient-to-tr from-[#e63b2e]/20 to-transparent mix-blend-overlay z-10" />
        <motion.img
          src={joshImg}
          className="w-full h-full object-cover object-top"
          animate={{ scale: sceneIndex === 3 ? [1, 1.2] : [1, 1.05] }}
          transition={{
            duration: SCENE_DURATIONS[baseSceneKey] / 1000,
            ease: 'linear',
          }}
        />
      </motion.div>

      {/* Film grain */}
      <div className="absolute inset-0 film-grain z-50 pointer-events-none" />

      {/* Letterbox */}
      <div className="absolute top-0 left-0 w-full h-[8%] bg-black z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[8%] bg-black z-40 pointer-events-none" />

      {/* REC Indicator */}
      <div className="absolute top-[10%] left-[8%] z-40 flex items-center gap-2 font-mono text-[1.5vw] text-[#e63b2e] pointer-events-none">
        <motion.div
          className="w-3 h-3 rounded-full bg-[#e63b2e]"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        REC
      </div>

      {/* Timecode */}
      <div className="absolute top-[10%] right-[5%] z-40 font-mono text-[1.5vw] text-white/50 pointer-events-none">
        TC: 01:23:45:00
      </div>

      {/* Scene content */}
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>

      {/* Audio */}
      <audio
        ref={audioRef}
        src={hookAudio}
        preload="auto"
        autoPlay
        muted={muted}
      />
    </div>
  );
}
