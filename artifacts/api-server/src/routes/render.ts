import { Router } from "express";
import { createAnonClient, assertClientId } from "../lib/supabase.js";

const router = Router();

const RENDER_BUCKET = "renders";
const ASSET_BUCKET = "uploads";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type Asset = { kind: string; storage_path: string };

async function signAsset(sb: ReturnType<typeof createAnonClient>, path: string): Promise<string | null> {
  const { data } = await sb.storage.from(ASSET_BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/** Build the richest possible prompt, weaving in all asset context. */
function buildPrompt(opts: {
  enhanced?: string | null;
  scene?: string | null;
  style?: string | null;
  hasIdentity: boolean;
  hasOutfit: boolean;
  hasScene: boolean;
}): string {
  if (opts.enhanced) return opts.enhanced;
  const parts: string[] = [];
  if (opts.hasIdentity) parts.push("preserving the subject's exact facial likeness from the identity reference");
  if (opts.hasOutfit) parts.push("matching the outfit and clothing style from the reference");
  if (opts.hasScene) parts.push("incorporating the scene/environment aesthetics from the reference image");
  if (opts.scene) parts.push(opts.scene);
  if (opts.style) parts.push(opts.style);
  return parts.length
    ? `A cinematic performance video. ${parts.join(". ")}.`
    : "A cinematic performance video, realistic quality, professional lighting.";
}

// ─── POST /api/render/start ───────────────────────────────────────────────────

router.post("/start", async (req, res) => {
  const { clientId: rawCid, projectId, model: requestedModel } = req.body as { clientId: unknown; projectId: string; model?: string };
  let clientId: string;
  try { clientId = assertClientId(rawCid); } catch { return res.status(400).json({ error: "invalid_client_id" }); }
  if (!projectId) return res.status(400).json({ error: "projectId required" });

  const ALLOWED_MODELS = ["kling-v1-6-std", "kling-v1-6-pro", "hailuo", "fal"];
  const model = requestedModel && ALLOWED_MODELS.includes(requestedModel) ? requestedModel : "kling-v1-6-std";

  const sb = createAnonClient();

  const { data: project, error } = await sb
    .from("projects")
    .select("id,status,enhanced_prompt,scene_prompt,style_prompt")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .single();
  if (error || !project) return res.status(404).json({ error: "project_not_found" });

  // Don't re-queue an already running/succeeded job
  if ((project as { status: string }).status === "running") {
    return res.json({ ok: true, provider: "kling", jobId: "", note: "already_running" });
  }

  const { data: assets } = await sb
    .from("project_assets")
    .select("kind,storage_path")
    .eq("project_id", projectId);

  // Performance video is optional — generation works with just a prompt + optional identity photo

  await sb.from("projects").update({ status: "queued", error_message: null }).eq("id", projectId);

  const p = project as {
    enhanced_prompt?: string | null;
    scene_prompt?: string | null;
    style_prompt?: string | null;
  };

  const prompt = buildPrompt({
    enhanced: p.enhanced_prompt,
    scene: p.scene_prompt,
    style: p.style_prompt,
    hasIdentity: !!(assets ?? []).find((a) => a.kind === "identity"),
    hasOutfit: !!(assets ?? []).find((a) => a.kind === "outfit"),
    hasScene: !!(assets ?? []).find((a) => a.kind === "scene"),
  });

  const { data: render, error: renderInsErr } = await sb.from("project_renders").insert({
    project_id: projectId,
    client_id: clientId,
    provider: "kling",
    status: "queued",
    prompt,
  }).select("id").single();
  if (renderInsErr) console.error("[render] project_renders insert failed (start):", renderInsErr.message);

  const renderId = (render as { id?: string } | null)?.id;

  // Fire-and-forget background job
  startRenderJob({
    projectId,
    clientId,
    renderId,
    prompt,
    assets: assets ?? [],
    sb,
    model,
  }).catch((err) => {
    console.error("[render] unhandled background error", err);
  });

  return res.json({ ok: true, provider: "kling", jobId: renderId ?? "" });
});

// ─── Background render job ────────────────────────────────────────────────────

async function startRenderJob(opts: {
  projectId: string;
  clientId: string;
  renderId: string | undefined;
  prompt: string;
  assets: Asset[];
  sb: ReturnType<typeof createAnonClient>;
  preferredProvider?: string;
  model?: string;
}) {
  const { projectId, clientId, renderId, prompt, assets, sb, preferredProvider, model: requestModel } = opts;
  const chosenModel = requestModel ?? "kling-v1-6-std";

  const updateStatus = (status: string, extra: Record<string, unknown> = {}) =>
    Promise.all([
      sb.from("projects").update({ status, ...extra }).eq("id", projectId),
      renderId
        ? sb.from("project_renders").update({ status }).eq("id", renderId)
        : Promise.resolve(),
    ]);

  // Heartbeat: update DB every 45s so stuck-job detector doesn't kill active renders
  const heartbeat = setInterval(() => {
    sb.from("projects").update({ status: "running" }).eq("id", projectId).then(() => {});
  }, 45_000);

  try {
    await updateStatus("running");

    // Sign the identity photo — this is the correct still-image reference for image2video models
    const identityAsset = assets.find((a) => a.kind === "identity");
    const identityUrl = identityAsset ? await signAsset(sb, identityAsset.storage_path) : null;

    const { videoAdapters } = await import("../lib/orchestrate/providers.js");

    // Fallback chain: Kling → WAN → Veo 2 → Sora → HuggingFace (Fal excluded)
    const primaryProvider = preferredProvider ?? "kling";
    const providerOrder = [
      primaryProvider,
      ...["runpod", "kling", "wan", "veo", "sora", "huggingface"].filter((p) => p !== primaryProvider),
    ];

    const modelForProvider = (p: string) => {
      if (p === "kling") return chosenModel.startsWith("kling") ? chosenModel : "kling-v1-6-std";
      return p;
    };

    const options: Record<string, unknown> = { duration: 5 };
    if (identityUrl) options.imageUrl = identityUrl;

    let lastError = "no provider succeeded";
    let lastConfiguredError = ""; // error from a provider that actually had an API key
    let attemptedConfigured = false; // true once a provider with a key actually ran
    type VideoResult = { provider: string; model: string; output_url: string; raw?: unknown };
    let result: VideoResult | null = null;

    for (const p of providerOrder) {
      const adapter = videoAdapters[p];
      if (!adapter) continue;
      try {
        const r = await adapter({ model: modelForProvider(p), prompt, options });
        if (r?.output_url) {
          result = { provider: r.provider, model: r.model, output_url: r.output_url, raw: r.raw };
          break;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        // provider_unconfigured:<name> means there is no API key — not a real attempt
        if (!errMsg.startsWith("provider_unconfigured:")) {
          attemptedConfigured = true;
          lastConfiguredError = errMsg; // keep the real error; trailing unconfigured providers must not mask it
        }
        lastError = errMsg;
        console.error(`[render] ${p} failed:`, errMsg);
      }
    }

    if (!result) {
      // No provider even had an API key configured — give an honest, actionable message
      if (!attemptedConfigured) {
        throw new Error(
          "No video provider is configured. Video generation needs an API key — add RUNPOD_API_KEY + RUNPOD_ENDPOINT_ID (your own RunPod endpoint), REPLICATE_API_TOKEN (powers WAN 2.1), or a Kling / Google Gemini (Veo) / HuggingFace key in Secrets. Text and image generation work without any keys.",
        );
      }
      // Prefer the error from a provider that actually had a key — trailing
      // unconfigured providers must not mask the real (actionable) failure.
      const meaningful = lastConfiguredError || lastError || "no provider succeeded";
      const creditErr = /1102|balance|credit|insufficient|402|billing|quota/i.test(meaningful);
      throw new Error(creditErr
        ? "Video generation needs a funded provider. The cheapest option is already wired up: add a small balance to Replicate at replicate.com/account/billing (your API token is already set, so video will work automatically once funded). Veo also works but requires Google Cloud billing. Details: " + meaningful.slice(0, 160)
        : meaningful);
    }

    // Download and store the rendered video
    const outputPath = `${clientId}/${projectId}/render.mp4`;
    const videoResp = await fetch(result.output_url, { signal: AbortSignal.timeout(120_000) });
    if (!videoResp.ok) throw new Error(`Download of render failed: HTTP ${videoResp.status}`);
    const buf = await videoResp.arrayBuffer();
    const { error: uploadErr } = await sb.storage.from(RENDER_BUCKET).upload(
      outputPath,
      Buffer.from(buf),
      { contentType: "video/mp4", upsert: true },
    );
    if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

    const { error: projUpdErr } = await sb.from("projects").update({
      status: "succeeded",
      output_path: outputPath,
      provider: result.provider,
      error_message: null,
    }).eq("id", projectId);
    // If we can't persist the result, the render is effectively lost — surface it
    // instead of reporting a false success (this is what made schema drift silent).
    if (projUpdErr) throw new Error(`Failed to save render result: ${projUpdErr.message}`);

    if (renderId) {
      await sb.from("project_renders").update({
        status: "succeeded",
        output_path: outputPath,
        provider_task_id: result.raw ? JSON.stringify(result.raw).slice(0, 200) : null,
      }).eq("id", renderId);
    }

    fireWebhook({ event: "render.succeeded", projectId, clientId, provider: result.provider, outputPath });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[render] job failed:", msg);
    await Promise.all([
      sb.from("projects").update({ status: "failed", error_message: msg }).eq("id", projectId),
      renderId
        ? sb.from("project_renders").update({ status: "failed", error_message: msg }).eq("id", renderId)
        : Promise.resolve(),
    ]);

    fireWebhook({ event: "render.failed", projectId, clientId, error: msg });
  } finally {
    clearInterval(heartbeat);
  }
}

// ─── Webhook helper ───────────────────────────────────────────────────────────
// Set WEBHOOK_URL env var to receive POST notifications when renders complete.
// Payload: { event, projectId, clientId, provider?, outputPath?, error?, timestamp }

function fireWebhook(payload: Record<string, unknown>): void {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.WEBHOOK_SECRET ? { "X-Aurora-Signature": process.env.WEBHOOK_SECRET } : {}),
    },
    body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() }),
    signal: AbortSignal.timeout(10_000),
  }).catch((err) => console.warn("[webhook] delivery failed:", err?.message));
}

// ─── GET /api/render/public/:clientId/:projectId ─────────────────────────────
// No API-key auth required — intentionally public for share links.
// Only returns data for succeeded projects. Generates a 7-day signed URL.

router.get("/public/:clientId/:projectId", async (req, res) => {
  const { clientId, projectId } = req.params;
  if (!clientId || !projectId) return res.status(400).json({ error: "missing params" });

  const sb = createAnonClient();

  const { data: project, error } = await sb
    .from("projects")
    .select("id,title,status,provider,selected_model,enhanced_prompt,scene_prompt,style_prompt,created_at,output_path")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .single();

  if (error || !project) return res.status(404).json({ error: "not_found" });
  if (project.status !== "succeeded" || !project.output_path)
    return res.status(404).json({ error: "render_not_ready" });

  const { data: signed } = await sb.storage
    .from(RENDER_BUCKET)
    .createSignedUrl(project.output_path, 7 * 24 * 60 * 60); // 7 days

  if (!signed?.signedUrl) return res.status(500).json({ error: "could_not_sign" });

  return res.json({
    id: project.id,
    title: project.title,
    provider: project.provider,
    model: project.selected_model,
    prompt: project.enhanced_prompt || project.scene_prompt || project.style_prompt || null,
    created_at: project.created_at,
    videoUrl: signed.signedUrl,
  });
});

// ─── POST /api/render/poll ────────────────────────────────────────────────────

router.post("/poll", async (req, res) => {
  const { clientId: rawCid, projectId } = req.body as { clientId: unknown; projectId: string };
  let clientId: string;
  try { clientId = assertClientId(rawCid); } catch { return res.status(400).json({ error: "invalid_client_id" }); }

  const sb = createAnonClient();
  const { data, error } = await sb
    .from("projects")
    .select("status,output_path,error_message,updated_at")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .single();
  if (error || !data) return res.status(404).json({ error: "not_found" });

  const row = data as { status: string; output_path?: string; error_message?: string; updated_at?: string };

  // Stuck-job detection: if running for >15 min with no update, auto-fail it
  if (row.status === "running" && row.updated_at) {
    const ageMs = Date.now() - new Date(row.updated_at).getTime();
    if (ageMs > 15 * 60 * 1000) {
      await sb.from("projects").update({
        status: "failed",
        error_message: "Render timed out after 15 minutes. Please retry.",
      }).eq("id", projectId);
      return res.json({ status: "failed", error: "Render timed out after 15 minutes. Please retry." });
    }
  }

  const STATUS_MAP: Record<string, string> = {
    draft: "queued", queued: "queued", running: "running",
    succeeded: "succeeded", failed: "failed",
  };
  return res.json({
    status: STATUS_MAP[row.status] ?? "queued",
    outputPath: row.output_path ?? undefined,
    error: row.error_message ?? undefined,
  });
});

// ─── POST /api/render/retry ───────────────────────────────────────────────────

router.post("/retry", async (req, res) => {
  const { clientId: rawCid, projectId, provider } = req.body as {
    clientId: unknown; projectId: string; provider: string;
  };
  let clientId: string;
  try { clientId = assertClientId(rawCid); } catch { return res.status(400).json({ error: "invalid_client_id" }); }

  const ALLOWED = ["kling", "wan", "veo", "sora", "huggingface"];
  if (!ALLOWED.includes(provider)) return res.status(400).json({ error: "invalid_provider" });

  const sb = createAnonClient();

  const { data: project } = await sb
    .from("projects")
    .select("id,status,enhanced_prompt,scene_prompt,style_prompt")
    .eq("id", projectId)
    .eq("client_id", clientId)
    .single();
  if (!project) return res.status(404).json({ error: "project_not_found" });

  const { data: assets } = await sb
    .from("project_assets")
    .select("kind,storage_path")
    .eq("project_id", projectId);

  const p = project as {
    enhanced_prompt?: string | null;
    scene_prompt?: string | null;
    style_prompt?: string | null;
  };

  const prompt = buildPrompt({
    enhanced: p.enhanced_prompt,
    scene: p.scene_prompt,
    style: p.style_prompt,
    hasIdentity: !!(assets ?? []).find((a) => a.kind === "identity"),
    hasOutfit: !!(assets ?? []).find((a) => a.kind === "outfit"),
    hasScene: !!(assets ?? []).find((a) => a.kind === "scene"),
  });

  await sb.from("projects").update({ status: "queued", provider, error_message: null }).eq("id", projectId);

  const { data: render, error: retryInsErr } = await sb.from("project_renders").insert({
    project_id: projectId,
    client_id: clientId,
    provider,
    status: "queued",
    prompt,
  }).select("id").single();
  if (retryInsErr) console.error("[render] project_renders insert failed (retry):", retryInsErr.message);

  startRenderJob({
    projectId,
    clientId,
    renderId: (render as { id?: string } | null)?.id,
    prompt,
    assets: assets ?? [],
    sb,
    preferredProvider: provider,
  }).catch((err) => console.error("[render] retry background error", err));

  return res.json({ ok: true, provider });
});

// ─── POST /api/render/signed-url/render ──────────────────────────────────────

router.post("/signed-url/render", async (req, res) => {
  const { path, clientId: rawCid } = req.body as { path: string; clientId?: unknown };
  if (!path || typeof path !== "string") return res.status(400).json({ error: "path required" });

  // Validate ownership: path must start with the requesting client's UUID prefix
  let clientId: string | null = null;
  try { if (rawCid) clientId = assertClientId(rawCid); } catch { /* optional */ }
  if (clientId && !path.startsWith(`${clientId}/`)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const sb = createAnonClient();
  const { data, error } = await sb.storage.from(RENDER_BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return res.status(500).json({ error: error?.message ?? "sign_failed" });
  return res.json({ url: data.signedUrl });
});

// ─── POST /api/render/signed-url/asset ───────────────────────────────────────

router.post("/signed-url/asset", async (req, res) => {
  const { path, clientId: rawCid } = req.body as { path: string; clientId?: unknown };
  if (!path || typeof path !== "string") return res.status(400).json({ error: "path required" });

  let clientId: string | null = null;
  try { if (rawCid) clientId = assertClientId(rawCid); } catch { /* optional */ }
  if (clientId && !path.startsWith(`${clientId}/`)) {
    return res.status(403).json({ error: "forbidden" });
  }

  const sb = createAnonClient();
  const { data, error } = await sb.storage.from(ASSET_BUCKET).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return res.status(500).json({ error: error?.message ?? "sign_failed" });
  return res.json({ url: data.signedUrl });
});

// ─── GET /api/render/providers ───────────────────────────────────────────────

router.get("/providers", (_req, res) => {
  const PROVIDERS = [
    { id: "KLING_ACCESS_KEY",      label: "Kling AI",            configKey: "KLING_ACCESS_KEY" },
    { id: "FAL_KEY",               label: "Fal.ai (Hailuo/Runway)", configKey: "FAL_KEY" },
    { id: "REPLICATE_API_TOKEN",   label: "Replicate",           configKey: "REPLICATE_API_TOKEN" },
    { id: "LOVABLE_API_KEY",       label: "Lovable AI Gateway",  configKey: "LOVABLE_API_KEY" },
    { id: "GROQ_API_KEY",          label: "Groq (text)",         configKey: "GROQ_API_KEY" },
    { id: "GEMINI_API_KEY",        label: "Google Gemini",       configKey: "GEMINI_API_KEY" },
    { id: "OPENAI_API_KEY",        label: "OpenAI",              configKey: "OPENAI_API_KEY" },
    { id: "HUGGINGFACE_API_KEY",   label: "HuggingFace",         configKey: "HUGGINGFACE_API_KEY" },
    { id: "ELEVENLABS_API_KEY",    label: "ElevenLabs (audio)",  configKey: "ELEVENLABS_API_KEY" },
    { id: "PAYSTACK_SECRET_KEY",   label: "Paystack (billing)",  configKey: "PAYSTACK_SECRET_KEY" },
  ];
  return res.json(PROVIDERS.map((p) => ({ id: p.id, label: p.label, configured: !!process.env[p.configKey] })));
});

export default router;
