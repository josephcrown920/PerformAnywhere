export type WorkflowCategory =
  | "cinematic-video"
  | "music-video"
  | "product-ad"
  | "ugc-ad"
  | "anime"
  | "fashion"
  | "portrait"
  | "character-consistency"
  | "image-to-video"
  | "video-to-video"
  | "upscale-restoration"
  | "social";

export type QualityTier = "fast" | "balanced" | "quality";
export type Modality = "image" | "video" | "audio" | "text";

export interface WorkflowRequirement {
  id: string;
  kind: "model" | "custom-node" | "vae" | "lora" | "controlnet" | "gpu";
  required: boolean;
  minVramGb?: number;
  providers?: string[];
}

export interface WorkflowDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  modalities: Modality[];
  supportedAspectRatios: string[];
  durationSeconds?: { min: number; max: number };
  tiers: Record<QualityTier, { provider: string; model: string; estimatedSeconds: number; estimatedCredits: number }>;
  requirements: WorkflowRequirement[];
  capabilities: string[];
  tags: string[];
  source: "official" | "community" | "private";
}

export interface WorkflowRequest {
  category?: WorkflowCategory;
  task: string;
  modality: Modality;
  aspectRatio?: string;
  durationSeconds?: number;
  quality?: QualityTier;
  preferredProvider?: string;
  freeOnly?: boolean;
  minVramGb?: number;
  capabilities?: string[];
}

export interface WorkflowPlan {
  workflow: WorkflowDefinition;
  provider: string;
  model: string;
  quality: QualityTier;
  score: number;
  reasons: string[];
  fallbackProviders: string[];
}

export interface GpuCandidate {
  id: string;
  provider: string;
  gpu: string;
  vramGb: number;
  queueSeconds: number;
  estimatedCostPerMinute: number;
  available: boolean;
  endpoint?: string;
}
