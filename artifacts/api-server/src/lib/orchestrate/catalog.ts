export type Modality = "text" | "image" | "video" | "audio";

export const PRICING = {
  text:  { perRequest: 1 },
  image: { perImage: 50 },
  video: { perSecond: 200 },
  audio: { perRequest: 75 },
} as const;

export function estimateCredits(modality: Modality, options: Record<string, unknown> = {}): number {
  switch (modality) {
    case "text":  return PRICING.text.perRequest;
    case "image": return PRICING.image.perImage * Math.max(1, Number(options.n ?? 1));
    case "video": return PRICING.video.perSecond * Math.max(1, Number(options.duration ?? 5));
    case "audio": return PRICING.audio.perRequest;
  }
}

export const CATALOG_DEFAULT_FALLBACKS: Record<Modality, string[]> = {
  text:  ["groq", "gemini", "cohere", "lovable", "mistral", "pollinations", "huggingface", "openai"],
  image: ["lovable", "pollinations", "huggingface", "fal", "replicate", "runware"],
  video: ["kling", "wan", "veo", "sora", "huggingface", "replicate", "fal"],
  audio: ["elevenlabs", "replicate"],
};

// Providers that cost 0 credits (free-tier / key-based, no billing)
export const FREE_PROVIDERS = new Set(["groq", "gemini", "cohere", "huggingface", "pollinations", "veo"]);
