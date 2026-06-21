import { Router } from "express";
import { runOrchestrated } from "../lib/orchestrate/run.js";

const router = Router();

// POST /api/prompt/enhance
router.post("/enhance", async (req, res) => {
  const { scenePrompt, stylePrompt, hasOutfit, hasScene, hasIdentity } = req.body as {
    scenePrompt?: string;
    stylePrompt?: string;
    hasOutfit?: boolean;
    hasScene?: boolean;
    hasIdentity?: boolean;
  };

  const contextLines = [
    hasIdentity ? "An identity reference image is provided — the subject's facial likeness must be preserved." : null,
    hasOutfit ? "An outfit reference image is provided — match clothing, colors, and style." : null,
    hasScene ? "A scene reference image is provided — incorporate its environmental aesthetics." : null,
    scenePrompt ? `Scene direction: "${scenePrompt}"` : null,
    stylePrompt ? `Visual style: "${stylePrompt}"` : null,
  ].filter(Boolean);

  if (!contextLines.length) return res.status(400).json({ error: "No inputs provided" });

  const systemPrompt = `You are a cinematic prompt engineer specialising in AI video-to-video models (Kling, Runway, Hailuo).
Your task: write ONE dense, vivid prompt (120-200 words) for a performance transfer render.
Rules:
- Begin with "A cinematic performance of a {person description}".
- Weave in every provided visual direction: identity fidelity, costume/outfit details, environment/scene aesthetics, and cinematography style.
- Use specific, evocative language: lens type, colour grading, lighting quality, atmosphere, texture.
- Avoid generic filler such as "stunning", "amazing", or "beautiful".
- Output ONLY the prompt text — no preamble, no quotes, no markdown.`;

  const userContent = `Generate a render prompt using these inputs:\n${contextLines.join("\n")}`;

  try {
    const result = await runOrchestrated({
      modality: "text",
      modelId: "lovable/google/gemini-2.5-flash",
      prompt: userContent,
      options: { systemPrompt },
    });
    return res.json({ prompt: result.output_text?.trim() ?? userContent });
  } catch {
    // If all providers fail, return a basic prompt
    const basic = [scenePrompt, stylePrompt].filter(Boolean).join(". ");
    return res.json({ prompt: basic || userContent });
  }
});

export default router;
