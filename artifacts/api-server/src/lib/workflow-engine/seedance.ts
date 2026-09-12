export interface SeedanceProfile {
  id: string;
  label: string;
  capabilities: string[];
  maxDurationSeconds: number;
  supportsReferenceImage: boolean;
  supportsImageToVideo: boolean;
  supportsVideoToVideo: boolean;
}

/** Model capability registry. Invocation remains behind the existing provider boundary. */
export const SEEDANCE_PROFILES: SeedanceProfile[] = [
  { id: "seedance-2.5", label: "Seedance 2.5", capabilities: ["image-to-video", "video-to-video", "motion-control", "camera-control", "reference-image", "performance-transfer"], maxDurationSeconds: 60, supportsReferenceImage: true, supportsImageToVideo: true, supportsVideoToVideo: true },
  { id: "seedance-2.5-pro", label: "Seedance 2.5 Pro", capabilities: ["image-to-video", "video-to-video", "motion-control", "camera-control", "reference-image", "performance-transfer", "high-fidelity"], maxDurationSeconds: 60, supportsReferenceImage: true, supportsImageToVideo: true, supportsVideoToVideo: true },
  { id: "seedance-2.5-fast", label: "Seedance 2.5 Fast", capabilities: ["image-to-video", "video-to-video", "motion-control", "reference-image", "performance-transfer", "fast-generation"], maxDurationSeconds: 30, supportsReferenceImage: true, supportsImageToVideo: true, supportsVideoToVideo: true },
];

export function getSeedanceProfile(id: string): SeedanceProfile | undefined { return SEEDANCE_PROFILES.find((p) => p.id === id); }
