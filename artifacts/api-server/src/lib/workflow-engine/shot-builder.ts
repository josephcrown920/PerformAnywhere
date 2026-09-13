export interface ShotSpec {
  scene?: string; subject?: string; camera?: string; motion?: string; lighting?: string; style?: string; durationSeconds?: number; aspectRatio?: string;
}

export function shotToPrompt(shot: ShotSpec): string {
  return [
    shot.scene && `Scene: ${shot.scene}`,
    shot.subject && `Subject: ${shot.subject}`,
    shot.camera && `Camera: ${shot.camera}`,
    shot.motion && `Motion: ${shot.motion}`,
    shot.lighting && `Lighting: ${shot.lighting}`,
    shot.style && `Style: ${shot.style}`,
    shot.durationSeconds && `Duration: ${shot.durationSeconds}s`,
    shot.aspectRatio && `Aspect ratio: ${shot.aspectRatio}`,
  ].filter(Boolean).join(". ");
}

export interface VariantMatrix { hooks: string[]; cameras: string[]; environments: string[]; compositions: string[]; }
export function expandVariants(matrix: VariantMatrix): ShotSpec[] {
  const result: ShotSpec[] = [];
  for (const hook of matrix.hooks) for (const camera of matrix.cameras) for (const environment of matrix.environments) for (const composition of matrix.compositions) {
    result.push({ subject: hook, camera, scene: environment, style: composition });
  }
  return result;
}
