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
  text:  ["modelark", "groq", "gemini", "cohere", "lovable", "mistral", "pollinations", "huggingface", "openai"],
  image: ["fal", "lovable", "pollinations", "huggingface", "runware"],
  video: ["fal", "kling", "wan", "veo", "sora", "huggingface"],
  audio: ["elevenlabs"],
};

// Providers that cost 0 credits (free-tier / key-based, no billing)
export const FREE_PROVIDERS = new Set(["modelark", "groq", "gemini", "cohere", "huggingface", "pollinations", "veo"]);

// Specific model IDs that are free even though their provider also offers paid models.
// Must stay in sync with the `free: true` entries in the client catalog
// (artifacts/perform-anywhere/src/lib/catalog.ts).
export const FREE_MODELS = new Set([
  "lovable/google/gemini-2.5-flash",
  "lovable/google/gemini-2.5-flash-image",
  "gemini/gemini-2.0-flash",
  "gemini/gemini-2.5-flash",
  "pollinations/openai",
  "pollinations/flux",
  "pollinations/turbo",
  "groq/llama-3.3-70b-versatile",
  "modelark/Dola-Seed-2.0-mini",
  "modelark/Dola-Seed-2.0-lite",
  "modelark/DeepSeek-V4-flash",
  "modelark/DeepSeek-V4-pro",
  "modelark/Dola-Seed-2.0-Code",
  "modelark/DeepSeek-V4-Pro-GA",
  "modelark/DeepSeek-V4-Flash-GA",
  "modelark/Dola-Seed-2.1-turbo",
  "modelark/GLM-5.2",
]);

/** True when a generation should cost 0 credits — free provider or explicitly free model. */
export function isModelFree(modelId: string): boolean {
  const provider = modelId.split("/")[0];
  return FREE_PROVIDERS.has(provider) || FREE_MODELS.has(modelId);
}

// When falling back to a *different* provider, we must pass that provider a model
// name it actually understands — not the provider id. These are sensible defaults
// per provider/modality used only during automatic fallback.
export const FALLBACK_MODELS: Record<Modality, Record<string, string>> = {
  text: {
    lovable: "google/gemini-2.5-flash",
    groq: "llama-3.3-70b-versatile",
    gemini: "gemini-2.0-flash",
    cohere: "command-r-plus",
    mistral: "mistral-large-latest",
    huggingface: "meta-llama/Llama-3.1-8B-Instruct",
    openai: "gpt-4o-mini",
    pollinations: "openai",
    modelark: "DeepSeek-V4-flash",
  },
  image: {
    lovable: "google/gemini-2.5-flash-image",
    pollinations: "flux",
    huggingface: "black-forest-labs/FLUX.1-schnell",
    fal: "fal-ai/flux/dev",
    runware: "runware:100@1",
  },
  video: {
    kling: "kling-v1-6-std",
    fal: "fal-ai/kling-video/v1.6/pro/text-to-video",
  },
  audio: {
    elevenlabs: "eleven_multilingual_v2",
  },
};
