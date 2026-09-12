export type Workflow = {
  id: string;
  provider: "invideo";
  label: string;
  description: string;
  promptPrefix: string;
  modelHints: string[];
};

export const WORKFLOWS: Workflow[] = [
  {
    id: "invideo-text-to-video",
    provider: "invideo",
    label: "Text to video",
    description: "Turn a topic into a finished video with script, stock, voiceover, captions, and music.",
    promptPrefix: "Create a complete narrated video from this idea. Write the script, choose suitable stock or generated clips, add voiceover, music, captions, and a polished edit.",
    modelHints: ["P-Video", "VEO 3.1 Lite", "Luma Ray 3.2"],
  },
  {
    id: "invideo-youtube-shorts",
    provider: "invideo",
    label: "YouTube Short",
    description: "Build a vertical short with a strong hook, fast pacing, captions, and a clear ending.",
    promptPrefix: "Create a vertical YouTube Short from this idea. Open with a strong hook, keep the pacing tight, add burned-in captions, voiceover, music, and a concise closing.",
    modelHints: ["P-Video", "Grok Imagine Video 1.5", "HeyGen Photo Avatar"],
  },
  {
    id: "invideo-instagram-reel",
    provider: "invideo",
    label: "Instagram Reel",
    description: "Create a social-first reel with visual rhythm, captions, and an audience-friendly CTA.",
    promptPrefix: "Create an Instagram Reel from this idea. Use a visually rhythmic edit, vertical framing, on-screen captions, music, and a natural call to action.",
    modelHints: ["Kling 3.0 Turbo", "Pixverse 5", "Veed Lipsync v2"],
  },
  {
    id: "invideo-storyboard",
    provider: "invideo",
    label: "Boards",
    description: "Generate a storyboard grid and extract the individual shots before editing.",
    promptPrefix: "Create a storyboard board for this idea. Break it into numbered shots with framing, action, subject, setting, lighting, and transition notes.",
    modelHints: ["Boards"],
  },
  {
    id: "invideo-camera-angles",
    provider: "invideo",
    label: "Angles",
    description: "Explore alternate camera angles and coverage from one scene.",
    promptPrefix: "Generate alternate camera-angle coverage for this scene. Include wide, medium, close, over-the-shoulder, and detail shots while preserving continuity.",
    modelHints: ["Angles"],
  },
  {
    id: "invideo-clean-audio",
    provider: "invideo",
    label: "CleanVoice",
    description: "Clean dialogue, remove filler, denoise, and normalize a recording.",
    promptPrefix: "Clean and polish the supplied voice recording: reduce noise, remove filler words and long pauses, preserve the speaker's natural tone, and normalize the final level.",
    modelHints: ["CleanVoice", "Audio Separation"],
  },
  {
    id: "invideo-audio-separation",
    provider: "invideo",
    label: "Audio Separation",
    description: "Split a mixed track into dialogue, music, effects, and other stems.",
    promptPrefix: "Separate the supplied mixed audio into clean stems. Preserve timing and quality, and return dialogue, music, effects, and any other identifiable sources as separate tracks.",
    modelHints: ["Audio Separation"],
  },
  {
    id: "invideo-background-removal",
    provider: "invideo",
    label: "Video Background Removal",
    description: "Remove a video background while preserving the subject and optional audio.",
    promptPrefix: "Remove the background from the supplied video. Preserve the subject edges and motion, keep the original audio when available, and return a transparent video export.",
    modelHints: ["Bria Video Background Removal", "BEN v2 Video Background Removal"],
  },
  {
    id: "invideo-video-segmentation",
    provider: "invideo",
    label: "Video Segmentation",
    description: "Track and segment objects in a video using open-vocabulary prompts.",
    promptPrefix: "Segment and track the requested objects throughout the supplied video. Maintain masks across motion, occlusion, and scene changes, and label each tracked object clearly.",
    modelHints: ["SAM 3.1 Video Segmentation"],
  },
  {
    id: "invideo-video-upscale",
    provider: "invideo",
    label: "Video Upscale",
    description: "Improve resolution, clarity, dynamic range, or remove a clean plate.",
    promptPrefix: "Enhance the supplied video while preserving natural detail and motion. Choose the appropriate operation: upscale, HDR conversion, or clean-plate removal, and avoid introducing halos or invented artifacts.",
    modelHints: ["LTX Video SDR to HDR Upscale", "LTX 2.3 Clean Plate", "Clarity Upscaler"],
  },
  {
    id: "invideo-image-upscale",
    provider: "invideo",
    label: "Image Upscale",
    description: "Upscale still images with a choice of faithful or style-enhanced results.",
    promptPrefix: "Upscale the supplied image to the requested target resolution. Preserve faces, text, and fine edges; use faithful detail unless a creative enhancement is explicitly requested.",
    modelHints: ["P-Image Upscale", "BytePlus Ultra HD", "Magnific Upscaler Precision"],
  },
  {
    id: "invideo-image-enhance",
    provider: "invideo",
    label: "Image Enhance",
    description: "Apply a controlled creative or detail-focused finish to an image.",
    promptPrefix: "Enhance the supplied image with a controlled finishing pass. Improve clarity and texture while preserving identity, composition, and important text; do not change the subject's features.",
    modelHints: ["Magnific Upscaler Creative", "Magnific Skin Enhancer"],
  },
  {
    id: "get-ready-with-me",
    provider: "invideo",
    label: "Get Ready With Me",
    description: "Turn a real getting-ready video into a cinematic GRWM using reference photos, reference clips, and a new outfit reference while preserving the user's actions and pacing.",
    promptPrefix: "Create a cinematic Get Ready With Me video from the supplied self-recorded getting-ready video. Preserve the original person's identity, actions, gestures, timing, and natural performance. Use the supplied reference photos to lock identity, styling, environment, and visual continuity; use the supplied reference videos as motion, framing, and transition references; apply the supplied new outfit reference consistently across the sequence. Keep the result recognizably the same person and same performance, but transform the wardrobe and requested scene/look. Do not invent a different person, change the performance beats, or introduce unrelated subjects.",
    modelHints: ["Seedance 2.5", "Kling V3 Omni Video", "P-Video Animate"],
  },
];

export function getWorkflow(id: string | null | undefined): Workflow | undefined {
  return WORKFLOWS.find((workflow) => workflow.id === id);
}
