export type ModelModality = "text" | "image" | "video" | "audio";
export type ModelAccess = "direct" | "workflow";

export type ModelRegistryEntry = {
  /** Stable Aurora identifier: provider/slug. */
  id: string;
  /** Adapter key used by the API orchestrator. */
  provider: string;
  /** Exact model identifier sent to the provider API. */
  apiModel: string;
  label: string;
  modality: ModelModality;
  free?: boolean;
  mcpCapable?: boolean;
  access?: ModelAccess;
  note?: string;
  /** Use this model when its provider is reached through automatic fallback. */
  fallback?: boolean;
};

/**
 * Single source of truth for directly callable Aurora models.
 *
 * Adding a ModelArk chat model is one line:
 * { id: "modelark/my-model", provider: "modelark", apiModel: "provider-model-id",
 *   label: "My Model", modality: "text", free: true }
 */
export const MODEL_REGISTRY: readonly ModelRegistryEntry[] = [
  { id: "modelark/Dola-Seed-2.1-turbo", provider: "modelark", apiModel: "dola-seed-2-1-turbo-260628", label: "Dola-Seed 2.1 Turbo (ModelArk)", modality: "text", free: true, mcpCapable: true, note: "ByteDance · activated quota · MCP agent capable" },
  { id: "modelark/Dola-Seed-2.0-mini", provider: "modelark", apiModel: "Dola-Seed-2.0-mini", label: "Dola-Seed-2.0-mini (ModelArk)", modality: "text", free: true, note: "ByteDance · activated free quota" },
  { id: "modelark/Dola-Seed-2.0-lite", provider: "modelark", apiModel: "Dola-Seed-2.0-lite", label: "Dola-Seed-2.0-lite (ModelArk)", modality: "text", free: true, note: "ByteDance · activated free quota" },
  { id: "modelark/DeepSeek-V4-flash", provider: "modelark", apiModel: "DeepSeek-V4-flash", label: "DeepSeek-V4-flash (ModelArk)", modality: "text", free: true, fallback: true, note: "DeepSeek · activated free quota" },
  { id: "modelark/DeepSeek-V4-pro", provider: "modelark", apiModel: "DeepSeek-V4-pro", label: "DeepSeek-V4-pro (ModelArk)", modality: "text", free: true, note: "DeepSeek · activated free quota" },
  { id: "modelark/Dola-Seed-2.0-Code", provider: "modelark", apiModel: "Dola-Seed-2.0-Code", label: "Dola-Seed-2.0-Code (ModelArk)", modality: "text", free: true, note: "ByteDance · activated free quota" },
  { id: "modelark/DeepSeek-V4-Pro-GA", provider: "modelark", apiModel: "DeepSeek-V4-Pro-GA", label: "DeepSeek-V4-Pro-GA (ModelArk)", modality: "text", free: true, note: "DeepSeek · activated GA quota" },
  { id: "modelark/DeepSeek-V4-Flash-GA", provider: "modelark", apiModel: "DeepSeek-V4-Flash-GA", label: "DeepSeek-V4-Flash-GA (ModelArk)", modality: "text", free: true, note: "DeepSeek · activated GA quota" },
  { id: "modelark/GLM-5.2", provider: "modelark", apiModel: "GLM-5.2", label: "GLM-5.2 (ModelArk)", modality: "text", free: true, note: "Z.ai · activated free quota" },

  { id: "lovable/google/gemini-2.5-flash", provider: "lovable", apiModel: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (Lovable AI)", modality: "text", free: true, fallback: true },
  { id: "lovable/google/gemini-2.5-pro", provider: "lovable", apiModel: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro (Lovable AI)", modality: "text" },
  { id: "lovable/openai/gpt-5-mini", provider: "lovable", apiModel: "openai/gpt-5-mini", label: "GPT-5 mini (Lovable AI)", modality: "text" },
  { id: "gemini/gemini-2.0-flash", provider: "gemini", apiModel: "gemini-2.0-flash", label: "Gemini 2.0 Flash (direct)", modality: "text", free: true, fallback: true },
  { id: "gemini/gemini-2.5-flash", provider: "gemini", apiModel: "gemini-2.5-flash", label: "Gemini 2.5 Flash (direct)", modality: "text", free: true },
  { id: "pollinations/openai", provider: "pollinations", apiModel: "openai", label: "Pollinations (free)", modality: "text", free: true, fallback: true },
  { id: "huggingface/meta-llama/Llama-3.1-8B-Instruct", provider: "huggingface", apiModel: "meta-llama/Llama-3.1-8B-Instruct", label: "Llama 3.1 8B (HF)", modality: "text", fallback: true },
  { id: "groq/llama-3.3-70b-versatile", provider: "groq", apiModel: "llama-3.3-70b-versatile", label: "Llama 3.3 70B (Groq)", modality: "text", free: true, fallback: true },
  { id: "mistral/mistral-large-latest", provider: "mistral", apiModel: "mistral-large-latest", label: "Mistral Large", modality: "text", fallback: true },
  { id: "openai/gpt-4o-mini", provider: "openai", apiModel: "gpt-4o-mini", label: "GPT-4o mini", modality: "text", fallback: true },
  { id: "cohere/command-r-plus", provider: "cohere", apiModel: "command-r-plus", label: "Cohere Command R+", modality: "text", free: true, fallback: true },

  { id: "lovable/google/gemini-2.5-flash-image", provider: "lovable", apiModel: "google/gemini-2.5-flash-image", label: "Gemini Image (Lovable AI)", modality: "image", free: true, fallback: true },
  { id: "pollinations/flux", provider: "pollinations", apiModel: "flux", label: "FLUX (Pollinations, free)", modality: "image", free: true, fallback: true },
  { id: "pollinations/turbo", provider: "pollinations", apiModel: "turbo", label: "Turbo (Pollinations, free)", modality: "image", free: true },
  { id: "huggingface/black-forest-labs/FLUX.1-schnell", provider: "huggingface", apiModel: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 schnell (HF)", modality: "image", fallback: true },
  { id: "huggingface/stabilityai/stable-diffusion-xl-base-1.0", provider: "huggingface", apiModel: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL (HF)", modality: "image" },
  { id: "fal/fal-ai/flux/dev", provider: "fal", apiModel: "fal-ai/flux/dev", label: "FLUX dev (Fal)", modality: "image", fallback: true },
  { id: "fal/fal-ai/bytedance/seedream/v4/text-to-image", provider: "fal", apiModel: "fal-ai/bytedance/seedream/v4/text-to-image", label: "Seedream 4 (Fal)", modality: "image" },
  { id: "replicate/black-forest-labs/flux-schnell", provider: "replicate", apiModel: "black-forest-labs/flux-schnell", label: "FLUX schnell (Replicate)", modality: "image" },
  // Model Ark media is provider-paid and requires Aurora credits at
  // confirmation time. It is intentionally not marked free and is not part
  // of automatic fallback.
  { id: "modelark/seedream-4-5", provider: "modelark", apiModel: "seedream-4-5-251128", label: "Seedream 4.5 (ModelArk)", modality: "image", note: "ByteDance · provider-paid direct generation · Aurora credits required" },

  // Model Ark video models — ByteDance Seedance accessible via the same MODEL_ARK_API_KEY.
  // Both models support T2V and I2V (pass imageUrl/videoUrl/audioUrl as reference inputs).
  // Activate these model IDs in your Ark console (console.volcengine.com/ark) before use.
  { id: "modelark/seedance-2-5", provider: "modelark", apiModel: "dreamina-seedance-2-5-260628", label: "Seedance 2.5 (ModelArk)", modality: "video", note: "ByteDance · provider-paid direct generation · T2V + I2V + audio · activate in Ark console" },
  { id: "modelark/seedance-2-0", provider: "modelark", apiModel: "dreamina-seedance-2-0-260128", label: "Seedance 2.0 (ModelArk)", modality: "video", note: "ByteDance · provider-paid direct generation · T2V + I2V + audio · activate in Ark console" },
  { id: "modelark/seedance-2-0-fast", provider: "modelark", apiModel: "dreamina-seedance-2-0-fast-260128", label: "Seedance 2.0 Fast (ModelArk)", modality: "video", note: "ByteDance · provider-paid direct generation · Aurora credits required" },

  { id: "kling/kling-v1-6-std", provider: "kling", apiModel: "kling-v1-6-std", label: "Kling 1.6 Std (direct)", modality: "video", fallback: true },
  { id: "kling/kling-v1-6-pro", provider: "kling", apiModel: "kling-v1-6-pro", label: "Kling 1.6 Pro (direct)", modality: "video" },
  { id: "fal/fal-ai/kling-video/v1.6/pro/text-to-video", provider: "fal", apiModel: "fal-ai/kling-video/v1.6/pro/text-to-video", label: "Kling 1.6 Pro T2V (Fal)", modality: "video", fallback: true },
  { id: "fal/fal-ai/kling-video/v1.6/pro/image-to-video", provider: "fal", apiModel: "fal-ai/kling-video/v1.6/pro/image-to-video", label: "Kling 1.6 Pro I2V (Fal)", modality: "video" },
  { id: "fal/fal-ai/wan-t2v", provider: "fal", apiModel: "fal-ai/wan-t2v", label: "Wan 2.1 T2V (Fal)", modality: "video" },
  { id: "fal/bytedance/seedance-2.0/text-to-video", provider: "fal", apiModel: "bytedance/seedance-2.0/text-to-video", label: "Seedance 2 T2V (Fal)", modality: "video" },
  { id: "fal/fal-ai/bytedance/omnihuman", provider: "fal", apiModel: "fal-ai/bytedance/omnihuman", label: "OmniHuman (Fal)", modality: "video" },
  { id: "fal/fal-ai/kling-video/lipsync/audio-to-video", provider: "fal", apiModel: "fal-ai/kling-video/lipsync/audio-to-video", label: "Kling LipSync (Fal)", modality: "video" },
  { id: "replicate/minimax/video-01", provider: "replicate", apiModel: "minimax/video-01", label: "MiniMax (Replicate)", modality: "video" },

  { id: "elevenlabs/eleven_multilingual_v2", provider: "elevenlabs", apiModel: "eleven_multilingual_v2", label: "ElevenLabs Multilingual v2", modality: "audio", fallback: true },
  { id: "replicate/meta/musicgen", provider: "replicate", apiModel: "meta/musicgen", label: "MusicGen (Replicate)", modality: "audio" },
];

export function modelsForModality(modality: ModelModality): ModelRegistryEntry[] {
  return MODEL_REGISTRY.filter((model) => model.modality === modality);
}

export function modelById(id: string): ModelRegistryEntry | undefined {
  return MODEL_REGISTRY.find((model) => model.id === id);
}

export function freeModelIds(): string[] {
  return MODEL_REGISTRY.filter((model) => model.free).map((model) => model.id);
}

export function fallbackModels(): Record<ModelModality, Record<string, string>> {
  const result: Record<ModelModality, Record<string, string>> = {
    text: {},
    image: {},
    video: {},
    audio: {},
  };

  for (const model of MODEL_REGISTRY) {
    if (model.fallback && !result[model.modality][model.provider]) {
      result[model.modality][model.provider] = model.apiModel;
    }
  }
  return result;
}