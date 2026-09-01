import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, type ComponentType } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import type { ScenePhotos } from './video_scenes/types';

import openerImg from '@assets/IMG_4240_1788231391518.jpeg';
import profileImg from '@assets/IMG_3850_1788231391518.png';
import crowdImg from '@assets/IMG_3851_1788231391518.png';
import tiltImg from '@assets/IMG_3849_1788231391518.png';
import hookAudio from '@assets/The_one_hook2_1782053088995.mp3';

export const SCENE_DURATIONS: Record<string, number> = {
  opening: 3000,
  build: 5000,
  tension: 4000,
  exit: 3000,
};

const SCENE_COMPONENTS: Record<string, ComponentType<{ photos: ScenePhotos }>> = {
  opening: Scene1,
  build: Scene2,
  tension: Scene3,
  exit: Scene4,
};

const PHOTOS: ScenePhotos = {
  opener: openerImg,
  profile: profileImg,
  crowd: crowdImg,
  tilt: tiltImg,
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

  return (
    <div className="video-shell w-full h-[100dvh] overflow-hidden relative">
      {/* A persistent camera bed keeps the four stills in one continuous world. */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -inset-[10%] opacity-45"
          animate={{
            x: sceneIndex === 0 ? '-2%' : sceneIndex === 1 ? '4%' : sceneIndex === 2 ? '-4%' : '2%',
            y: sceneIndex === 0 ? '2%' : sceneIndex === 1 ? '-3%' : sceneIndex === 2 ? '4%' : '-1%',
            scale: sceneIndex === 2 ? 1.08 : 1.02,
            rotate: sceneIndex === 3 ? -1.5 : 0,
          }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={PHOTOS[sceneIndex === 0 ? 'opener' : sceneIndex === 1 ? 'profile' : sceneIndex === 2 ? 'crowd' : 'tilt']}
            alt=""
            className="w-full h-full object-cover saturate-[0.8] contrast-[1.12]"
          />
        </motion.div>
        <motion.div
          className="absolute left-[54%] top-[-14%] h-[128%] w-[34%] overflow-hidden border border-[#9bdae2]/18 opacity-60"
          animate={{
            x: sceneIndex === 0 ? '0%' : sceneIndex === 1 ? '-12%' : sceneIndex === 2 ? '8%' : '-5%',
            rotate: sceneIndex === 0 ? 3 : sceneIndex === 1 ? -1 : sceneIndex === 2 ? 2 : -4,
            scale: sceneIndex === 1 ? 1.12 : 1,
          }}
          transition={{ duration: 2.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={PHOTOS.profile}
            alt=""
            className="w-full h-full object-cover object-center mix-blend-screen opacity-40"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(255,106,50,0.28),transparent_25%),linear-gradient(120deg,rgba(7,18,24,0.94),rgba(7,18,24,0.4)_52%,rgba(7,18,24,0.8))]" />
        <div className="absolute inset-0 scanline-overlay opacity-25" />
      </div>

      {/* Persistent color signal: it travels instead of resetting with each scene. */}
      <motion.div
        className="absolute z-30 left-0 top-[18%] h-[1px] bg-[#ff6a32]"
        animate={{
          width: sceneIndex === 0 ? '22%' : sceneIndex === 1 ? '48%' : sceneIndex === 2 ? '74%' : '34%',
          x: sceneIndex === 2 ? '18%' : sceneIndex === 3 ? '55%' : '0%',
          opacity: [0.55, 1, 0.55],
        }}
        transition={{ width: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }, x: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
      />

      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.img
          src={PHOTOS.opener}
          alt=""
          className="w-full h-full object-cover opacity-[0.08] mix-blend-screen"
          animate={{ scale: [1.03, 1.07, 1.03], x: ['0%', '-2%', '0%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Persistent lockup and capture marks */}
      <div className="absolute top-[10.5%] left-[7%] z-40 flex items-center gap-[1.2vw] pointer-events-none">
        <div className="h-[0.65vw] w-[0.65vw] rounded-full bg-[#ff6a32]" />
        <span className="mono-face text-[1.05vw] tracking-cinematic text-[#f5f0e8]/78">NBA JOSH</span>
        <span className="mono-face text-[0.82vw] tracking-[0.22em] text-[#9bdae2]/60">THE ONE / 001</span>
      </div>
      <div className="absolute top-[10.5%] right-[7%] z-40 text-right pointer-events-none">
        <div className="mono-face text-[0.8vw] tracking-[0.26em] text-[#9bdae2]/65">NIGHT SIGNAL</div>
        <div className="mono-face mt-[0.45vw] text-[0.8vw] tracking-[0.18em] text-[#f5f0e8]/45">15 SEC / LOOP</div>
      </div>

      {/* Letterbox */}
      <div className="absolute top-0 left-0 w-full h-[7%] bg-[#071218]/95 z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-[7%] bg-[#071218]/95 z-40 pointer-events-none" />

      {/* REC Indicator */}
      <div className="absolute bottom-[10.5%] left-[7%] z-40 flex items-center gap-[0.7vw] mono-face text-[0.82vw] tracking-[0.22em] text-[#ff6a32] pointer-events-none">
        <motion.div
          className="h-[0.55vw] w-[0.55vw] rounded-full bg-[#ff6a32]"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        REC
      </div>

      {/* Timecode */}
      <div className="absolute bottom-[10.5%] right-[7%] z-40 mono-face text-[0.82vw] tracking-[0.18em] text-[#f5f0e8]/48 pointer-events-none">
        TC: 00:00:{String(Math.max(0, Math.floor(currentScene * 3.75))).padStart(2, '0')}
      </div>

      {/* Scene content */}
      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} photos={PHOTOS} />}
      </AnimatePresence>

      <div className="absolute inset-0 film-grain z-50" />

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
