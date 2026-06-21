export type Modality = "text" | "image" | "video" | "audio";

export type ProviderModel = {
  id: string;
  provider: string;
  model: string;
  label: string;
  free?: boolean;
};

export const CATALOG: Record<Modality, ProviderModel[]> = {
  text: [
    { id: "lovable/google/gemini-2.5-flash", provider: "lovable", model: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Lovable AI)", free: true },
    { id: "lovable/google/gemini-2.5-pro",   provider: "lovable", model: "google/gemini-2.5-pro",   label: "Gemini 2.5 Pro (Lovable AI)" },
    { id: "lovable/openai/gpt-5-mini",       provider: "lovable", model: "openai/gpt-5-mini",       label: "GPT-5 mini (Lovable AI)" },
    { id: "gemini/gemini-2.0-flash",         provider: "gemini",  model: "gemini-2.0-flash",        label: "Gemini 2.0 Flash (direct)", free: true },
    { id: "gemini/gemini-2.5-flash",         provider: "gemini",  model: "gemini-2.5-flash",        label: "Gemini 2.5 Flash (direct)", free: true },
    { id: "pollinations/openai",             provider: "pollinations", model: "openai",             label: "Pollinations (free)", free: true },
    { id: "huggingface/meta-llama/Llama-3.1-8B-Instruct", provider: "huggingface", model: "meta-llama/Llama-3.1-8B-Instruct", label: "Llama 3.1 8B (HF)" },
    { id: "groq/llama-3.3-70b-versatile",    provider: "groq",    model: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)", free: true },
    { id: "mistral/mistral-large-latest",    provider: "mistral", model: "mistral-large-latest",    label: "Mistral Large" },
    { id: "openai/gpt-4o-mini",              provider: "openai",  model: "gpt-4o-mini",             label: "GPT-4o mini" },
    { id: "cohere/command-r-plus",           provider: "cohere",  model: "command-r-plus",          label: "Cohere Command R+" },
  ],
  image: [
    { id: "lovable/google/gemini-2.5-flash-image", provider: "lovable", model: "google/gemini-2.5-flash-image", label: "Gemini Image (Lovable AI)", free: true },
    { id: "pollinations/flux",                     provider: "pollinations", model: "flux",                     label: "FLUX (Pollinations, free)", free: true },
    { id: "pollinations/turbo",                    provider: "pollinations", model: "turbo",                    label: "Turbo (Pollinations, free)", free: true },
    { id: "huggingface/black-forest-labs/FLUX.1-schnell", provider: "huggingface", model: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 schnell (HF)" },
    { id: "huggingface/stabilityai/stable-diffusion-xl-base-1.0", provider: "huggingface", model: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL (HF)" },
    { id: "fal/fal-ai/flux/dev",                   provider: "fal",     model: "fal-ai/flux/dev",                label: "FLUX dev (Fal)" },
    { id: "replicate/black-forest-labs/flux-schnell", provider: "replicate", model: "black-forest-labs/flux-schnell", label: "FLUX schnell (Replicate)" },
  ],
  video: [
    { id: "kling/kling-v1-6-std",                           provider: "kling", model: "kling-v1-6-std",                            label: "Kling 1.6 Std (direct)" },
    { id: "kling/kling-v1-6-pro",                           provider: "kling", model: "kling-v1-6-pro",                            label: "Kling 1.6 Pro (direct)" },
    { id: "fal/fal-ai/kling-video/v1.6/pro/text-to-video",  provider: "fal", model: "fal-ai/kling-video/v1.6/pro/text-to-video",   label: "Kling 1.6 Pro T2V (Fal)" },
    { id: "fal/fal-ai/kling-video/v1.6/pro/image-to-video", provider: "fal", model: "fal-ai/kling-video/v1.6/pro/image-to-video",  label: "Kling 1.6 Pro I2V (Fal)" },
    { id: "replicate/minimax/video-01",                     provider: "replicate", model: "minimax/video-01",                      label: "MiniMax (Replicate)" },
  ],
  audio: [
    { id: "elevenlabs/eleven_multilingual_v2",   provider: "elevenlabs", model: "eleven_multilingual_v2",  label: "ElevenLabs Multilingual v2" },
    { id: "replicate/meta/musicgen",             provider: "replicate",  model: "meta/musicgen",           label: "MusicGen (Replicate)" },
  ],
};

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
