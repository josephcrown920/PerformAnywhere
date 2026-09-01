export type Modality = "text" | "image" | "video" | "audio";

export type ProviderModel = {
  id: string;
  provider: string;
  model: string;
  label: string;
  free?: boolean;
  access?: "direct" | "workflow";
  note?: string;
};

export const CATALOG: Record<Modality, ProviderModel[]> = {
  text: [
    // Activated in the user's BytePlus ModelArk account (screenshot catalog).
    { id: "modelark/Dola-Seed-2.0-mini",    provider: "modelark", model: "Dola-Seed-2.0-mini",    label: "Dola-Seed-2.0-mini (ModelArk)", free: true, note: "ByteDance · activated free quota" },
    { id: "modelark/Dola-Seed-2.0-lite",    provider: "modelark", model: "Dola-Seed-2.0-lite",    label: "Dola-Seed-2.0-lite (ModelArk)", free: true, note: "ByteDance · activated free quota" },
    { id: "modelark/DeepSeek-V4-flash",    provider: "modelark", model: "DeepSeek-V4-flash",    label: "DeepSeek-V4-flash (ModelArk)", free: true, note: "DeepSeek · activated free quota" },
    { id: "modelark/DeepSeek-V4-pro",      provider: "modelark", model: "DeepSeek-V4-pro",      label: "DeepSeek-V4-pro (ModelArk)", free: true, note: "DeepSeek · activated free quota" },
    { id: "modelark/Dola-Seed-2.0-Code",   provider: "modelark", model: "Dola-Seed-2.0-Code",   label: "Dola-Seed-2.0-Code (ModelArk)", free: true, note: "ByteDance · activated free quota" },
    { id: "modelark/DeepSeek-V4-Pro-GA",   provider: "modelark", model: "DeepSeek-V4-Pro-GA",   label: "DeepSeek-V4-Pro-GA (ModelArk)", free: true, note: "DeepSeek · activated GA quota" },
    { id: "modelark/DeepSeek-V4-Flash-GA", provider: "modelark", model: "DeepSeek-V4-Flash-GA", label: "DeepSeek-V4-Flash-GA (ModelArk)", free: true, note: "DeepSeek · activated GA quota" },
    { id: "modelark/Dola-Seed-2.1-turbo",   provider: "modelark", model: "Dola-Seed-2.1-turbo",   label: "Dola-Seed-2.1-turbo (ModelArk)", free: true, note: "ByteDance · activated quota" },
    { id: "modelark/GLM-5.2",               provider: "modelark", model: "GLM-5.2",               label: "GLM-5.2 (ModelArk)", free: true, note: "Z.ai · activated free quota" },
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
    // InVideo model picker entries. InVideo exposes these through its
    // workflow/MCP product, not a public per-model generation API.
    ...[
      ["kling-image-o1", "Kling Image o1"],
      ["p-image", "P-Image"],
      ["p-image-edit", "P-Image Edit"],
      ["qwen-image-layered", "Qwen Image Layered"],
      ["grok-imagine-image-2.0", "Grok Imagine Image 2.0"],
      ["grok-imagine", "Grok Imagine"],
      ["flux-2-create", "Flux 2 Create"],
      ["flux-2-edit", "Flux 2 Edit"],
      ["magnific-skin-enhancer", "Magnific Skin Enhancer"],
      ["seedream-4", "SeeDream 4"],
      ["flux-2-lora-gallery", "Flux 2 Lora Gallery"],
      ["flux-2-flex", "Flux 2 Flex"],
      ["flux-2-max", "Flux 2 Max"],
      ["ideogram-3", "Ideogram 3"],
      ["ideogram-4", "Ideogram 4"],
      ["ideogram-4-remix", "Ideogram 4 Remix"],
      ["ideogram-remove-object", "Ideogram Remove Object"],
      ["phota", "Phota"],
      ["gpt-image-1", "GPT Image 1"],
      ["gpt-image-2", "GPT Image 2"],
      ["nano-banana-pro", "Nano Banana Pro"],
      ["reve-2.1", "Reve 2.1"],
      ["seedream-5.0-pro", "Seedream 5.0 Pro"],
      ["seedream-5.0-pro-layers", "Seedream 5.0 Pro Layers"],
      ["nano-banana-2", "Nano Banana 2"],
      ["nano-banana-2-lite", "Nano Banana 2 Lite"],
      ["kling-3.0-image", "Kling 3.0 Image"],
      ["seedream-5.0-lite", "Seedream 5.0 Lite"],
      ["mai-image-2.5", "MAI Image 2.5"],
      ["kling-v3-omni-image", "Kling V3 Omni Image"],
      ["flux-2-klein", "Flux 2 Klein"],
      ["gpt-image-1.5", "GPT Image 1.5"],
      ["recraft-4.1", "Recraft 4.1"],
      ["recraft-4", "Recraft 4"],
      ["krea-v2-large", "Krea v2 Large"],
      ["krea-v2-medium", "Krea v2 Medium"],
      ["qwen-image-2.0-pro", "Qwen Image 2.0 Pro"],
      ["luma-photon-uni-1", "Luma Photon (uni-1)"],
      ["luma-photon-uni-1-max", "Luma Photon (uni-1-max)"],
      ["qwen-image-2.0", "Qwen Image 2.0"],
      ["wan-2.7", "Wan 2.7"],
      ["qwen-edit-2511-multiple-angles", "Qwen Edit 2511 Multiple Angles"],
      ["flux-2-pro-create", "Flux 2 Pro Create"],
      ["flux-2-pro-edit", "Flux 2 Pro Edit"],
      ["flux-kontext-pro", "Flux Kontext Pro"],
      ["flux-kontext-max", "Flux Kontext Max"],
    ].map(([model, label]) => ({
      id: `invideo/${model}`,
      provider: "invideo",
      model,
      label: `${label} (InVideo workflow)`,
      access: "workflow" as const,
      note: "Available through InVideo's workflow/MCP surface",
    })),
    { id: "lovable/google/gemini-2.5-flash-image", provider: "lovable", model: "google/gemini-2.5-flash-image", label: "Gemini Image (Lovable AI)", free: true },
    { id: "pollinations/flux",                     provider: "pollinations", model: "flux",                     label: "FLUX (Pollinations, free)", free: true },
    { id: "pollinations/turbo",                    provider: "pollinations", model: "turbo",                    label: "Turbo (Pollinations, free)", free: true },
    { id: "huggingface/black-forest-labs/FLUX.1-schnell", provider: "huggingface", model: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 schnell (HF)" },
    { id: "huggingface/stabilityai/stable-diffusion-xl-base-1.0", provider: "huggingface", model: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL (HF)" },
    { id: "fal/fal-ai/flux/dev",                   provider: "fal",     model: "fal-ai/flux/dev",                label: "FLUX dev (Fal)" },
    { id: "replicate/black-forest-labs/flux-schnell", provider: "replicate", model: "black-forest-labs/flux-schnell", label: "FLUX schnell (Replicate)" },
  ],
  video: [
    ...[
      ["kling-3.0-turbo", "Kling 3.0 Turbo"],
      ["kling-v3-omni-video", "Kling V3 Omni Video"],
      ["seedance-2.0-fast", "Seedance 2.0 Fast"],
      ["seedance-2.0-mini", "Seedance 2.0 Mini"],
      ["kling-2.6", "Kling 2.6"],
      ["luma-ray-3.2", "Luma Ray 3.2"],
      ["flux-3", "Flux 3"],
      ["kling-avatar", "Kling Avatar"],
      ["happyhorse-1.0", "HappyHorse 1.0"],
      ["happyhorse-1.1", "HappyHorse 1.1"],
      ["runway-gen-4.5", "Runway Gen-4.5"],
      ["pixverse-5", "Pixverse 5"],
      ["pixverse-modify", "Pixverse Modify"],
      ["veo-3.1-lite", "VEO 3.1 Lite"],
      ["p-video", "P-Video"],
      ["p-video-animate", "P-Video Animate"],
      ["p-video-avatar", "P-Video Avatar"],
      ["grok-imagine-video-1.5", "Grok Imagine Video 1.5"],
      ["heygen-photo-avatar", "HeyGen Photo Avatar"],
      ["heygen-lipsync", "HeyGen Lipsync"],
      ["veed-lipsync-v2", "Veed Lipsync v2"],
      ["aleph-2", "Aleph 2"],
      ["wan-2.5-preview", "Wan 2.5 Preview"],
      ["grok-imagine-video-edit", "Grok Imagine Video Edit"],
      ["beeble-switchx", "Beeble SwitchX"],
    ].map(([model, label]) => ({
      id: `invideo/${model}`,
      provider: "invideo",
      model,
      label: `${label} (InVideo workflow)`,
      access: "workflow" as const,
      note: "Available through InVideo's workflow/MCP surface",
    })),
    { id: "kling/kling-v1-6-std",                           provider: "kling", model: "kling-v1-6-std",                            label: "Kling 1.6 Std (direct)" },
    { id: "kling/kling-v1-6-pro",                           provider: "kling", model: "kling-v1-6-pro",                            label: "Kling 1.6 Pro (direct)" },
    { id: "fal/fal-ai/kling-video/v1.6/pro/text-to-video",  provider: "fal", model: "fal-ai/kling-video/v1.6/pro/text-to-video",   label: "Kling 1.6 Pro T2V (Fal)" },
    { id: "fal/fal-ai/kling-video/v1.6/pro/image-to-video", provider: "fal", model: "fal-ai/kling-video/v1.6/pro/image-to-video",  label: "Kling 1.6 Pro I2V (Fal)" },
    { id: "replicate/minimax/video-01",                     provider: "replicate", model: "minimax/video-01",                      label: "MiniMax (Replicate)" },
  ],
  audio: [
    { id: "invideo/audio-separation", provider: "invideo", model: "audio-separation", label: "Audio Separation (InVideo workflow)", access: "workflow", note: "Split a mixed audio track into stems" },
    { id: "invideo/cleanvoice", provider: "invideo", model: "cleanvoice", label: "CleanVoice (InVideo workflow)", access: "workflow", note: "Denoise, remove fillers, normalize" },
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

const FREE_PROVIDER_IDS = new Set(["groq", "gemini", "cohere", "pollinations", "veo"]);

export function estimateCredits(modality: Modality, options: Record<string, unknown> = {}): number {
  // Free-tier providers cost 0 credits — pass { provider } to get accurate estimate
  const provider = options.provider as string | undefined;
  if (provider && FREE_PROVIDER_IDS.has(provider)) return 0;
  switch (modality) {
    case "text":  return PRICING.text.perRequest;
    case "image": return PRICING.image.perImage * Math.max(1, Number(options.n ?? 1));
    case "video": return PRICING.video.perSecond * Math.max(1, Number(options.duration ?? 5));
    case "audio": return PRICING.audio.perRequest;
  }
}

/** Returns true if the model entry is free (no credits needed) */
export function isModelFree(model: ProviderModel): boolean {
  return !!model.free || FREE_PROVIDER_IDS.has(model.provider);
}
