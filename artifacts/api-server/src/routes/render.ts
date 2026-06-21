import { Router } from "express";
import { createAnonClient, assertClientId } from "../lib/supabase.js";

const router = Router();

const RENDER_BUCKET = "renders";
const ASSET_BUCKET = "uploads";

// POST /api/render/start
router.post("/start", async (req, res) => {
  const { clientId: rawCid, projectId } = req.body as { clientId: unknown; projectId: string };
  let clientId: string;
  try { clientId = assertClientId(rawCid); } catch { return res.status(400).json({ error: "invalid_client_id" }); }
  if (!projectId) return res.status(400).json({ error: "projectId required" });

  const sb = createAnonClient();

  const { data: project, error } = await sb
    .from("projects")
    .select("id,status,enhanced_prompt,scene_prompt,style_prompt")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .single();
  if (error || !project) return res.status(404).json({ error: "project_not_found" });

  const { data: assets } = await sb
    .from("project_assets")
    .select("kind,storage_path")
    .eq("project_id", projectId);

  const performance = assets?.find((a) => a.kind === "performance");
  if (!performance) return res.status(400).json({ error: "performance_video_required" });

  await sb.from("projects").update({ status: "queued", error_message: null }).eq("id", projectId);

  const { data: render } = await sb.from("project_renders").insert({
    project_id: projectId,
    client_id: clientId,
    provider: "kling",
    status: "queued",
    prompt: (project as { enhanced_prompt?: string; scene_prompt?: string }).enhanced_prompt
      || (project as { scene_prompt?: string }).scene_prompt
      || "realistic video",
  }).select("id").single();

  // Fire-and-forget render job (in the background)
  startRenderJob({
    projectId,
    clientId,
    renderId: (render as { id?: string })?.id,
    prompt: (project as { enhanced_prompt?: string; scene_prompt?: string; style_prompt?: string }).enhanced_prompt
      || [(project as { scene_prompt?: string }).scene_prompt, (project as { style_prompt?: string }).style_prompt].filter(Boolean).join(". ")
      || "realistic performance video",
    assets: assets ?? [],
    sb,
  }).catch((err) => {
    console.error("[render] background job error", err);
  });

  return res.json({ ok: true, provider: "kling", jobId: (render as { id?: string })?.id ?? "" });
});

type Asset = { kind: string; storage_path: string };

async function startRenderJob(opts: {
  projectId: string;
  clientId: string;
  renderId: string | undefined;
  prompt: string;
  assets: Asset[];
  sb: ReturnType<typeof createAnonClient>;
}) {
  const { projectId, clientId, renderId, prompt, assets, sb } = opts;

  const update = (status: string, extra: Record<string, unknown> = {}) =>
    Promise.all([
      sb.from("projects").update({ status, ...extra }).eq("id", projectId),
      renderId ? sb.from("project_renders").update({ status }).eq("id", renderId) : Promise.resolve(),
    ]);

  try {
    await update("running");

    const performanceAsset = assets.find((a) => a.kind === "performance");
    if (!performanceAsset) throw new Error("no_performance_asset");

    const { data: signedData } = await sb.storage.from(ASSET_BUCKET).createSignedUrl(performanceAsset.storage_path, 3600);
    const signedUrl = signedData?.signedUrl;
    if (!signedUrl) throw new Error("Could not sign performance video URL");

    const { videoAdapters } = await import("../lib/orchestrate/providers.js");
    const adapter = videoAdapters.kling;
    if (!adapter) throw new Error("kling adapter not available");

    const result = await adapter({
      model: "kling-v1-6-std",
      prompt,
      options: { imageUrl: signedUrl, duration: 5 },
    });

    const outputPath = `${clientId}/${projectId}/render.mp4`;
    if (result.output_url) {
      const videoResp = await fetch(result.output_url);
      if (!videoResp.ok) throw new Error(`Download render failed: ${videoResp.status}`);
      const buf = await videoResp.arrayBuffer();
      await sb.storage.from(RENDER_BUCKET).upload(outputPath, Buffer.from(buf), {
        contentType: "video/mp4",
        upsert: true,
      });
    }

    await update("succeeded", { output_path: outputPath });
    if (renderId) {
      await sb.from("project_renders").update({
        status: "succeeded",
        output_path: outputPath,
        provider_task_id: result.raw ? JSON.stringify(result.raw).slice(0, 200) : null,
      }).eq("id", renderId);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await update("failed", { error_message: msg });
    if (renderId) await sb.from("project_renders").update({ status: "failed", error_message: msg }).eq("id", renderId);
  }
}

// POST /api/render/poll
router.post("/poll", async (req, res) => {
  const { clientId: rawCid, projectId } = req.body as { clientId: unknown; projectId: string };
  let clientId: string;
  try { clientId = assertClientId(rawCid); } catch { return res.status(400).json({ error: "invalid_client_id" }); }

  const sb = createAnonClient();
  const { data, error } = await sb
    .from("projects")
    .select("status,output_path,error_message")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .single();
  if (error || !data) return res.status(404).json({ error: "not_found" });

  const { status, error_message } = data as { status: string; output_path?: string; error_message?: string };
  const output_path = (data as { output_path?: string }).output_path;

  const STATUS_MAP: Record<string, string> = {
    draft: "queued", queued: "queued", running: "running",
    succeeded: "succeeded", failed: "failed",
  };
  return res.json({
    status: STATUS_MAP[status] ?? "queued",
    outputPath: output_path ?? undefined,
    error: error_message ?? undefined,
  });
});

// POST /api/render/retry
router.post("/retry", async (req, res) => {
  const { clientId: rawCid, projectId, provider } = req.body as { clientId: unknown; projectId: string; provider: string };
  let clientId: string;
  try { clientId = assertClientId(rawCid); } catch { return res.status(400).json({ error: "invalid_client_id" }); }

  const ALLOWED_PROVIDERS = ["kling", "runway", "hailuo"];
  if (!ALLOWED_PROVIDERS.includes(provider)) return res.status(400).json({ error: "invalid_provider" });

  const sb = createAnonClient();
  await sb.from("projects").update({ status: "draft", provider, error_message: null }).eq("id", projectId).eq("client_id", clientId);
  return res.json({ ok: true });
});

// POST /api/render/signed-url/render
router.post("/signed-url/render", async (req, res) => {
  const { path } = req.body as { path: string };
  if (!path || typeof path !== "string") return res.status(400).json({ error: "path required" });

  const sb = createAnonClient();
  const { data, error } = await sb.storage.from(RENDER_BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return res.status(500).json({ error: error?.message ?? "sign_failed" });
  return res.json({ url: data.signedUrl });
});

// POST /api/render/signed-url/asset
router.post("/signed-url/asset", async (req, res) => {
  const { path } = req.body as { path: string };
  if (!path || typeof path !== "string") return res.status(400).json({ error: "path required" });

  const sb = createAnonClient();
  const { data, error } = await sb.storage.from(ASSET_BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return res.status(500).json({ error: error?.message ?? "sign_failed" });
  return res.json({ url: data.signedUrl });
});

// GET /api/render/providers
router.get("/providers", (_req, res) => {
  const PROVIDERS = [
    { id: "KLING_ACCESS_KEY", label: "Kling AI", configKey: "KLING_ACCESS_KEY" },
    { id: "RUNWAY_API_KEY", label: "Runway ML", configKey: "RUNWAY_API_KEY" },
    { id: "FAL_KEY", label: "Fal.ai", configKey: "FAL_KEY" },
    { id: "REPLICATE_API_TOKEN", label: "Replicate", configKey: "REPLICATE_API_TOKEN" },
    { id: "LOVABLE_API_KEY", label: "Lovable AI Gateway", configKey: "LOVABLE_API_KEY" },
    { id: "GROQ_API_KEY", label: "Groq (text)", configKey: "GROQ_API_KEY" },
    { id: "GEMINI_API_KEY", label: "Google Gemini", configKey: "GEMINI_API_KEY" },
    { id: "OPENAI_API_KEY", label: "OpenAI", configKey: "OPENAI_API_KEY" },
    { id: "HUGGINGFACE_API_KEY", label: "HuggingFace", configKey: "HUGGINGFACE_API_KEY" },
    { id: "ELEVENLABS_API_KEY", label: "ElevenLabs (audio)", configKey: "ELEVENLABS_API_KEY" },
    { id: "PAYSTACK_SECRET_KEY", label: "Paystack (billing)", configKey: "PAYSTACK_SECRET_KEY" },
  ];

  return res.json(
    PROVIDERS.map((p) => ({
      id: p.id,
      label: p.label,
      configured: !!process.env[p.configKey],
    })),
  );
});

export default router;
