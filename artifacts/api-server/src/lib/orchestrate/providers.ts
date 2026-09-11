import { ReplitConnectors } from "@replit/connectors-sdk";

export class ProviderUnconfigured extends Error {
  constructor(provider: string) {
    super(`provider_unconfigured:${provider}`);
  }
}

export type AdapterResult = {
  provider: string;
  model: string;
  output_text?: string;
  output_url?: string;
  output?: unknown;
  raw?: unknown;
};

type AdapterArgs = {
  model: string;
  prompt: string;
  options?: Record<string, unknown>;
};

const env = (k: string) => process.env[k];

// ──────────────── TEXT ────────────────
export const textAdapters: Record<string, (a: AdapterArgs) => Promise<AdapterResult>> = {
  modelark: async ({ model, prompt, options = {} }) => {
    const key = env("MODEL_ARK_API_KEY");
    if (!key) throw new ProviderUnconfigured("modelark");

    // ModelArk exposes an OpenAI-compatible chat completions endpoint.
    // The model value is kept exactly as activated in the user's console.
    const base = (env("MODEL_ARK_BASE_URL") ?? "https://ark.ap-southeast.bytepluses.com/api/v3").replace(/\/$/, "");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        temperature: (options.temperature as number) ?? 0.7,
        max_tokens: (options.maxTokens as number) ?? 2048,
      }),
    });
    if (!res.ok) throw new Error(`modelark ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "modelark", model, output_text: j.choices?.[0]?.message?.content ?? "", raw: j };
  },

  lovable: async ({ model, prompt, options = {} }) => {
    const key = env("LOVABLE_API_KEY");
    if (!key) throw new ProviderUnconfigured("lovable");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`lovable ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "lovable", model, output_text: j.choices?.[0]?.message?.content ?? "", raw: j };
  },

  groq: async ({ model, prompt, options = {} }) => {
    const key = env("GROQ_API_KEY");
    if (!key) throw new ProviderUnconfigured("groq");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        temperature: (options.temperature as number) ?? 0.7,
        max_tokens: (options.maxTokens as number) ?? 1024,
      }),
    });
    if (!res.ok) throw new Error(`groq ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "groq", model, output_text: j.choices?.[0]?.message?.content ?? "", raw: j };
  },

  mistral: async ({ model, prompt, options = {} }) => {
    const key = env("MISTRAL_API_KEY");
    if (!key) throw new ProviderUnconfigured("mistral");
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: (options.temperature as number) ?? 0.7 }),
    });
    if (!res.ok) throw new Error(`mistral ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "mistral", model, output_text: j.choices?.[0]?.message?.content ?? "", raw: j };
  },

  openai: async ({ model, prompt, options = {} }) => {
    const key = env("OPENAI_API_KEY");
    if (!key) throw new ProviderUnconfigured("openai");
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], temperature: (options.temperature as number) ?? 0.7 }),
    });
    if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "openai", model, output_text: j.choices?.[0]?.message?.content ?? "", raw: j };
  },

  cohere: async ({ model, prompt }) => {
    const key = env("COHERE_API_KEY");
    if (!key) throw new ProviderUnconfigured("cohere");
    const res = await fetch("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) throw new Error(`cohere ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "cohere", model, output_text: j.message?.content?.map((c: { text: string }) => c.text).join("") ?? "", raw: j };
  },

  gemini: async ({ model, prompt }) => {
    const key = env("GEMINI_API_KEY");
    if (!key) throw new ProviderUnconfigured("gemini");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) throw new Error(`gemini ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "gemini", model, output_text: j.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") ?? "", raw: j };
  },

  huggingface: async ({ model, prompt, options = {} }) => {
    const key = env("HUGGINGFACE_API_KEY");
    if (!key) throw new ProviderUnconfigured("huggingface");
    const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          ...(options.systemPrompt ? [{ role: "system", content: options.systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        max_tokens: (options.maxTokens as number) ?? 512,
        temperature: (options.temperature as number) ?? 0.7,
      }),
    });
    if (!res.ok) throw new Error(`huggingface ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    return { provider: "huggingface", model, output_text: j.choices?.[0]?.message?.content ?? "", raw: j };
  },

  pollinations: async ({ model, prompt }) => {
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${encodeURIComponent(model)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`pollinations ${res.status}: ${await res.text()}`);
    return { provider: "pollinations", model, output_text: await res.text() };
  },
};

// ──────────────── IMAGE ────────────────
export const imageAdapters: Record<string, (a: AdapterArgs) => Promise<AdapterResult>> = {
  lovable: async ({ model, prompt }) => {
    const key = env("LOVABLE_API_KEY");
    if (!key) throw new ProviderUnconfigured("lovable");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], modalities: ["image", "text"] }),
    });
    if (!res.ok) throw new Error(`lovable ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    const img = j.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!img) throw new Error("lovable: no image returned");
    return { provider: "lovable", model, output_url: img, raw: j };
  },

  fal: async ({ model, prompt, options = {} }) => {
    const key = env("FAL_KEY");
    if (!key) throw new ProviderUnconfigured("fal");
    const res = await fetch(`https://fal.run/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Key ${key}` },
      body: JSON.stringify({ prompt, image_size: options.imageSize ?? "landscape_16_9", num_images: options.n ?? 1 }),
    });
    if (!res.ok) throw new Error(`fal ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    const url = j.images?.[0]?.url ?? j.image?.url;
    if (!url) throw new Error("fal: no image in response");
    return { provider: "fal", model, output_url: url, raw: j };
  },

  // Model Ark (ByteDance) Seedream image generation. The image endpoint
  // returns either a hosted URL or (for some model activations) a base64 image.
  modelark: async ({ model, prompt, options = {} }) => {
    const key = env("MODEL_ARK_API_KEY");
    if (!key) throw new ProviderUnconfigured("modelark");
    const base = (env("MODEL_ARK_BASE_URL") ?? "https://ark.ap-southeast.bytepluses.com/api/v3").replace(/\/$/, "");
    const response = await fetch(`${base}/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        prompt: String(prompt).slice(0, 4_000),
        image: options.imageUrl ? [options.imageUrl] : undefined,
        size: "2K",
        sequential_image_generation: "disabled",
        response_format: "url",
        watermark: false,
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      // Keep provider response bodies out of the direct director error path.
      throw new Error(`modelark image request failed (${response.status})`);
    }
    let payload: any;
    try {
      payload = await response.json();
    } catch {
      throw new Error("modelark image returned invalid response");
    }
    const first = Array.isArray(payload?.data) ? payload.data[0] : undefined;
    const url = typeof first?.url === "string"
      ? first.url
      : typeof first?.image_url === "string"
        ? first.image_url
        : typeof first?.b64_json === "string"
          ? `data:image/png;base64,${first.b64_json}`
          : undefined;
    if (!url) throw new Error("modelark image returned no image");
    return { provider: "modelark", model, output_url: url };
  },

  replicate: async ({ model, prompt, options = {} }) => {
    const key = env("REPLICATE_API_TOKEN");
    if (!key) throw new ProviderUnconfigured("replicate");
    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, Prefer: "wait" },
      body: JSON.stringify({ input: { prompt, ...(options.input as object ?? {}) } }),
    });
    if (!res.ok) throw new Error(`replicate ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    const url = Array.isArray(j.output) ? j.output[0] : j.output;
    if (!url) throw new Error("replicate: no output");
    return { provider: "replicate", model, output_url: String(url), raw: j };
  },

  runware: async ({ model, prompt, options = {} }) => {
    const key = env("RUNWARE_API_KEY");
    if (!key) throw new ProviderUnconfigured("runware");
    const res = await fetch("https://api.runware.ai/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify([{ taskType: "imageInference", taskUUID: crypto.randomUUID(), positivePrompt: prompt, model, width: options.width ?? 1024, height: options.height ?? 1024, numberResults: options.n ?? 1 }]),
    });
    if (!res.ok) throw new Error(`runware ${res.status}: ${await res.text()}`);
    const j = await res.json() as any;
    const url = j.data?.[0]?.imageURL;
    if (!url) throw new Error("runware: no image");
    return { provider: "runware", model, output_url: url, raw: j };
  },

  huggingface: async ({ model, prompt }) => {
    const key = env("HUGGINGFACE_API_KEY");
    if (!key) throw new ProviderUnconfigured("huggingface");
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ inputs: prompt }),
    });
    if (!res.ok) throw new Error(`huggingface ${res.status}: ${await res.text()}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.byteLength; i++) bin += String.fromCharCode(buf[i]);
    return { provider: "huggingface", model, output_url: `data:image/png;base64,${btoa(bin)}` };
  },

  pollinations: async ({ model, prompt, options = {} }) => {
    const w = (options.width as number) ?? 1024;
    const h = (options.height as number) ?? 1024;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&model=${encodeURIComponent(model)}&nologo=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`pollinations ${res.status}`);
    return { provider: "pollinations", model, output_url: res.url };
  },
};

// ──────────────── VIDEO ────────────────

export function hasFalAuth(): boolean {
  return Boolean(env("FAL_KEY") || env("REPLIT_CONNECTORS_HOSTNAME"));
}

export async function falFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const key = env("FAL_KEY");
  if (key) {
    return fetch(`https://queue.fal.run${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Key ${key}` },
    });
  }
  if (!env("REPLIT_CONNECTORS_HOSTNAME")) throw new ProviderUnconfigured("fal");
  const connectors = new ReplitConnectors();
  const headers = Object.fromEntries(new Headers(init.headers).entries());
  return connectors.proxy("falai", path, {
    method: init.method,
    headers,
    body: init.body,
  });
}

async function falQueueWait(model: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const submit = await falFetch(`/${model}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Fal-Request-Timeout": "900" },
    body: JSON.stringify(payload),
  });
  if (!submit.ok) throw new Error(`fal submit ${submit.status}: ${await submit.text()}`);
  const { request_id } = await submit.json() as { request_id: string };
  // Use the full model ID as the namespace — the fal.ai queue API mirrors the
  // submit path for status/result endpoints, so a 3-segment model like
  // "fal-ai/bytedance/omnihuman" needs all three segments, not just the first two.
  const appId = model;
  const statusPath = `/${appId}/requests/${request_id}/status`;
  const resultPath = `/${appId}/requests/${request_id}`;
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const s = await falFetch(statusPath);
    if (!s.ok) throw new Error(`fal status check failed (HTTP ${s.status}): ${await s.text()}`);
    const sj = await s.json() as { status: string; error?: string };
    if (sj.status === "COMPLETED") {
      if (sj.error) throw new Error(`fal failed: ${sj.error}`);
      const r = await falFetch(resultPath);
      if (!r.ok) throw new Error(`fal result ${r.status}: ${await r.text()}`);
      return r.json() as Promise<Record<string, unknown>>;
    }
    if (sj.status === "FAILED") throw new Error(`fal job failed: ${sj.error ?? "unknown error"}`);
  }
  throw new Error("fal timeout after 10 minutes");
}

async function klingJwt(ak: string, sk: string): Promise<string> {
  const b64url = (input: Uint8Array | string) => {
    const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const pay = b64url(JSON.stringify({ iss: ak, exp: now + 1800, nbf: now - 5 }));
  const ck = await crypto.subtle.importKey("raw", new TextEncoder().encode(sk), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", ck, new TextEncoder().encode(`${head}.${pay}`));
  return `${head}.${pay}.${b64url(new Uint8Array(sig))}`;
}

function klingModelName(model: string): { model_name: string; mode: string } {
  const isPro = model.includes("pro");
  const isV2 = model.includes("v2") || model.includes("2-");
  const isV15 = model.includes("v1-5") || model.includes("1-5");
  const model_name = isV2 ? "kling-v2" : isV15 ? "kling-v1-5" : "kling-v1-6";
  return { model_name, mode: isPro ? "pro" : "std" };
}

/**
 * RunPod serverless workers return results in many shapes depending on the
 * deployed model. Walk the output and return the first usable VIDEO — an
 * http(s) URL, a data:video/* URI, or a raw base64 blob found under a
 * video-ish key. We search explicit video keys first, skip clearly non-video
 * keys (thumbnails, preview images, logs) so an image is never mistaken for a
 * video, and only wrap raw base64 as mp4 when its key looks like video.
 */
function extractMediaUrl(out: unknown): string | null {
  const isHttp = (s: string) => /^https?:\/\//i.test(s);
  const VIDEO_KEY = /video|mp4|webm|mov|clip/i;
  const NON_VIDEO_KEY = /thumb|preview|image|img|cover|poster|seed|logs?/i;

  const fromString = (raw: string, key: string | null): string | null => {
    const s = raw.trim();
    if (isHttp(s)) return s;
    if (s.startsWith("data:")) return /^data:video\//i.test(s) ? s : null;
    if (key && VIDEO_KEY.test(key) && s.length > 256 && /^[A-Za-z0-9+/=\s]+$/.test(s)) {
      return `data:video/mp4;base64,${s.replace(/\s+/g, "")}`;
    }
    return null;
  };

  const walk = (node: unknown, key: string | null): string | null => {
    if (node == null) return null;
    if (typeof node === "string") return fromString(node, key);
    if (Array.isArray(node)) {
      for (const item of node) { const u = walk(item, key); if (u) return u; }
      return null;
    }
    if (typeof node === "object") {
      const o = node as Record<string, unknown>;
      for (const k of Object.keys(o)) {
        if (VIDEO_KEY.test(k)) { const u = walk(o[k], k); if (u) return u; }
      }
      for (const k of Object.keys(o)) {
        if (VIDEO_KEY.test(k) || NON_VIDEO_KEY.test(k)) continue;
        const u = walk(o[k], k); if (u) return u;
      }
      return null;
    }
    return null;
  };

  return walk(out, null);
}

export const videoAdapters: Record<string, (a: AdapterArgs) => Promise<AdapterResult>> = {
  // Model Ark (ByteDance) — Seedance 2.5 and other ByteDance video models via the
  // Ark async content-generation task API.
  // Requires MODEL_ARK_API_KEY (same key as text). Activate model IDs in your
  // Ark console at https://console.volcengine.com/ark before using them.
  //
  // API shape (confirmed from docs):
  //   POST /contents/generations/tasks
  //   Body top-level fields: model, content[], ratio, duration, generate_audio, watermark
  //   Content items: { type: "text"|"image_url"|"video_url"|"audio_url", ..., role? }
  //   Image/video/audio references carry role: "reference_image"|"reference_video"|"reference_audio"
  modelark: async ({ model, prompt, options = {} }) => {
    const key = env("MODEL_ARK_API_KEY");
    if (!key) throw new ProviderUnconfigured("modelark");

    const base = (env("MODEL_ARK_BASE_URL") ?? "https://ark.ap-southeast.bytepluses.com/api/v3").replace(/\/$/, "");

    // Build content array — text prompt first, then optional reference media
    const content: Array<Record<string, unknown>> = [
      { type: "text", text: String(prompt).slice(0, 2500) },
    ];
    if (options.imageUrl) {
      content.push({ type: "image_url", image_url: { url: options.imageUrl }, role: "reference_image" });
    }
    if (options.videoUrl) {
      content.push({ type: "video_url", video_url: { url: options.videoUrl }, role: "reference_video" });
    }
    if (options.audioUrl) {
      content.push({ type: "audio_url", audio_url: { url: options.audioUrl }, role: "reference_audio" });
    }

    // ratio, duration, generate_audio, watermark are top-level — NOT nested under "parameters"
    const body: Record<string, unknown> = {
      model,
      content,
      ratio: options.aspectRatio ?? "16:9",
      duration: options.duration ?? 5,
      generate_audio: options.generateAudio !== false, // default true
      watermark: options.watermark ?? false,
    };

    // Submit the generation task
    const submit = await fetch(`${base}/contents/generations/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
    const stext = await submit.text();
    if (!submit.ok) throw new Error(`modelark video submit ${submit.status}: ${stext.slice(0, 300)}`);
    const sj = JSON.parse(stext) as { id?: string; task_id?: string; status?: string; error?: { message?: string } };
    const taskId = sj.id ?? sj.task_id;
    if (!taskId) throw new Error(`modelark video: no task id in response: ${stext.slice(0, 200)}`);

    // Poll up to 10 minutes (ByteDance video tasks typically take 1–3 min)
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      let poll: Response;
      try {
        poll = await fetch(`${base}/contents/generations/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${key}` },
          signal: AbortSignal.timeout(30_000),
        });
      } catch {
        continue; // transient network error — keep polling
      }
      if (!poll.ok) continue;
      const pj = await poll.json() as {
        status?: string;
        content?: Array<{
          type: string;
          // Ark currently returns video_url as an object in live responses,
          // while older responses used a plain string. Support both.
          video_url?: string | { url?: string };
          url?: string;
        }> | {
          type?: string;
          video_url?: string | { url?: string };
          url?: string;
        };
        error?: { message?: string };
      };
      if (pj.error?.message) throw new Error(`modelark video: ${pj.error.message}`);
      const st = pj.status ?? "";
      if (st === "succeeded" || st === "success" || st === "completed") {
        const contentItems = Array.isArray(pj.content)
          ? pj.content
          : pj.content
            ? [pj.content]
            : [];
        const vid = contentItems.find((c) =>
          c.type === "video" || c.type === "video_url" || Boolean(c.video_url),
        );
        const videoReference = vid?.video_url;
        const url = typeof videoReference === "string"
          ? videoReference
          : videoReference && typeof videoReference === "object"
            ? videoReference.url
            : vid?.url;
        if (!url) throw new Error(`modelark video: task ${st} but no video url in response: ${JSON.stringify(pj).slice(0, 300)}`);
        return { provider: "modelark", model, output_url: url, raw: pj };
      }
      if (st === "failed" || st === "error" || st === "cancelled" || st === "expired") {
        throw new Error(`modelark video generation ${st}: ${pj.error?.message ?? "no detail"}`);
      }
      // status is "pending" / "processing" / "running" — keep polling
    }
    throw new Error("modelark video: timeout after 10 minutes");
  },

  // RunPod Serverless — runs the user's OWN deployed video endpoint.
  // Requires RUNPOD_API_KEY + RUNPOD_ENDPOINT_ID. The input payload shape is
  // defined by the deployed worker, so we send a common default and merge any
  // caller-supplied options.input; the result video is located flexibly.
  runpod: async ({ prompt, options = {} }) => {
    const key = env("RUNPOD_API_KEY");
    const endpointId = env("RUNPOD_ENDPOINT_ID");
    if (!key || !endpointId) throw new ProviderUnconfigured("runpod");

    const BASE = `https://api.runpod.ai/v2/${endpointId}`;
    const auth = { Authorization: `Bearer ${key}` };

    const input: Record<string, unknown> = {
      prompt: String(prompt).slice(0, 2500),
      duration: options.duration ?? 5,
      aspect_ratio: options.aspectRatio ?? "16:9",
      ...((options.input as object) ?? {}),
    };
    if (options.imageUrl) input.image = options.imageUrl;

    const submit = await fetch(`${BASE}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ input }),
      signal: AbortSignal.timeout(30_000),
    });
    const stext = await submit.text();
    if (!submit.ok) throw new Error(`runpod submit ${submit.status}: ${stext.slice(0, 300)}`);
    let job = JSON.parse(stext) as { id?: string; status?: string; output?: unknown; error?: unknown };
    if (!job.id) throw new Error(`runpod: no job id in response: ${stext.slice(0, 200)}`);
    const jobId = job.id;

    // Poll up to ~15 min (serverless workers can cold-start). Bail out if the
    // status endpoint keeps failing so a network hang can't stall forever.
    const DONE = ["COMPLETED", "FAILED", "CANCELLED", "TIMED_OUT"];
    let consecutivePollErrors = 0;
    for (let i = 0; i < 180 && !DONE.includes(job.status ?? ""); i++) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const poll = await fetch(`${BASE}/status/${jobId}`, { headers: auth, signal: AbortSignal.timeout(30_000) });
        if (!poll.ok) { consecutivePollErrors++; }
        else { job = await poll.json() as typeof job; consecutivePollErrors = 0; }
      } catch {
        consecutivePollErrors++;
      }
      if (consecutivePollErrors >= 12) {
        throw new Error(`runpod: status check failed ${consecutivePollErrors}x in a row for job ${jobId}`);
      }
    }
    if (job.status !== "COMPLETED") {
      const detail = job.error ? JSON.stringify(job.error).slice(0, 200) : (job.status ?? "no response");
      throw new Error(`runpod ${job.status ?? "unknown"}: ${detail}`);
    }

    const url = extractMediaUrl(job.output);
    if (!url) throw new Error(`runpod: job completed but no video found in output: ${JSON.stringify(job.output).slice(0, 300)}`);
    return { provider: "runpod", model: endpointId, output_url: url, raw: job };
  },

  fal: async ({ model, prompt, options = {} }) => {
    if (!hasFalAuth()) throw new ProviderUnconfigured("fal");
    const resolvedModel =
      model === "fal-wan"
        ? (options.imageUrl ? "fal-ai/wan/v2.7/image-to-video" : options.videoUrl ? "fal-ai/wan/v2.7/image-to-video" : "fal-ai/wan-t2v")
        : model === "fal-seedance"
          ? (options.imageUrl ? "bytedance/seedance-2.0/image-to-video" : "bytedance/seedance-2.0/text-to-video")
          : model === "fal-kling"
            ? (options.imageUrl ? "fal-ai/kling-video/v1.6/pro/image-to-video" : "fal-ai/kling-video/v1.6/pro/text-to-video")
            : model === "fal-omnihuman"
              ? "fal-ai/bytedance/omnihuman"
              : model === "fal-latentsync"
                ? "fal-ai/latentsync/v2"
                : model === "fal-flux"
                  ? "fal-ai/flux-pro/v1.1"
                  : model === "fal-seedream"
                    ? "fal-ai/bytedance/seedream-3"
                    : model;

    const isKlingLipSync = resolvedModel === "fal-ai/kling-video/lipsync/audio-to-video";
    const isLatentSync   = resolvedModel === "fal-ai/latentsync/v2";
    const isOmniHuman    = resolvedModel === "fal-ai/bytedance/omnihuman";

    if (isKlingLipSync && (!options.videoUrl || !options.audioUrl)) {
      throw new Error("fal Kling LipSync requires videoUrl and audioUrl");
    }
    if (isLatentSync && (!options.videoUrl || !options.audioUrl)) {
      throw new Error("fal LatentSync requires videoUrl and audioUrl");
    }
    if (isOmniHuman && (!options.imageUrl || !options.audioUrl)) {
      throw new Error("fal OmniHuman requires imageUrl (identity) and audioUrl");
    }

    const payload: Record<string, unknown> = isKlingLipSync
      ? { video_url: options.videoUrl, audio_url: options.audioUrl }
      : isLatentSync
        ? { video_url: options.videoUrl, audio_url: options.audioUrl }
        : isOmniHuman
          ? { image_url: options.imageUrl, audio_url: options.audioUrl }
          : {
              prompt,
              duration: options.duration ?? 5,
              aspect_ratio: options.aspectRatio ?? "16:9",
            };
    if (!isKlingLipSync && !isLatentSync && !isOmniHuman) {
      // image_url and video_url are mutually exclusive for most fal models (e.g. Wan i2v)
      if (options.imageUrl) payload.image_url = options.imageUrl;
      else if (options.videoUrl) payload.video_url = options.videoUrl;
      if (options.negativePrompt) payload.negative_prompt = options.negativePrompt;
    }
    const j = await falQueueWait(resolvedModel, payload);
    // Video models return j.video.url; image models (Flux, Seedream) return j.images[0].url
    const isImageModel = resolvedModel === "fal-ai/flux-pro/v1.1" || resolvedModel === "fal-ai/bytedance/seedream-3";
    const url = (j.video as { url?: string })?.url
      ?? (j.output as { url?: string })?.url
      ?? (Array.isArray(j.output) ? (j.output as string[])[0] : undefined)
      ?? (isImageModel && Array.isArray((j as Record<string, unknown>).images)
          ? ((j as Record<string, unknown[]>).images[0] as { url?: string })?.url
          : undefined);
    if (!url) {
      // Give a model-specific diagnostic so artists know exactly what went wrong,
      // rather than a raw JSON dump they cannot act on.
      if (isLatentSync) {
        throw new Error(
          `LatentSync (fal-ai/latentsync/v2) returned an unexpected response — expected { video: { url } } but got: ${JSON.stringify(j).slice(0, 300)}. ` +
          "Check that the performance video is a supported format (MP4/MOV) and the audio track is under the model's length limit.",
        );
      }
      throw new Error(`fal output: no url in response: ${JSON.stringify(j).slice(0, 300)}`);
    }
    return { provider: "fal", model: resolvedModel, output_url: url, raw: j };
  },

  replicate: async ({ model, prompt, options = {} }) => {
    const key = env("REPLICATE_API_TOKEN");
    if (!key) throw new ProviderUnconfigured("replicate");
    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, Prefer: "wait=60" },
      body: JSON.stringify({ input: { prompt, ...(options.input as object ?? {}) } }),
    });
    if (!res.ok) throw new Error(`replicate ${res.status}: ${await res.text()}`);
    const j = await res.json() as { output: unknown };
    const url = Array.isArray(j.output) ? (j.output as string[])[0] : j.output;
    if (!url) throw new Error("replicate video: no url");
    return { provider: "replicate", model, output_url: String(url), raw: j };
  },

  // Seedance 1 Lite via Replicate — the cheapest funded video option.
  // Supports text2video and image2video (pass options.imageUrl as first frame).
  seedance: async ({ prompt, options = {} }) => {
    const key = env("REPLICATE_API_TOKEN");
    if (!key) throw new ProviderUnconfigured("seedance");
    const model = "bytedance/seedance-1-lite";
    const input: Record<string, unknown> = {
      prompt: String(prompt).slice(0, 2500),
      duration: options.duration ?? 5,
      resolution: options.resolution ?? "480p",
    };
    // For i2v the still frame defines framing, so don't also force aspect_ratio.
    if (options.imageUrl) {
      input.image = options.imageUrl;
    } else {
      input.aspect_ratio = options.aspectRatio ?? "16:9";
    }

    const startRes = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, Prefer: "wait=5" },
      body: JSON.stringify({ input }),
    });
    if (!startRes.ok) throw new Error(`seedance/replicate submit ${startRes.status}: ${await startRes.text()}`);
    let pred = await startRes.json() as { id: string; status: string; output?: unknown; error?: string };

    // Poll up to ~8 min (cheap model, usually finishes in ~30–90s)
    for (let i = 0; i < 96 && ["starting", "processing"].includes(pred.status); i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      pred = await poll.json() as typeof pred;
    }
    if (pred.status !== "succeeded") throw new Error(`seedance/replicate failed: ${pred.error ?? pred.status}`);
    const url = Array.isArray(pred.output) ? (pred.output as string[])[0] : pred.output as string;
    if (!url) throw new Error("seedance/replicate: no video url in output");
    return { provider: "seedance", model, output_url: url, raw: pred };
  },

  kling: async ({ model, prompt, options = {} }) => {
    const ak = env("KLING_ACCESS_KEY");
    const sk = env("KLING_SECRET_KEY");
    if (!ak || !sk) throw new ProviderUnconfigured("kling");

    const token = await klingJwt(ak, sk);
    const { model_name, mode } = klingModelName(model);

    const hasImage = Boolean(options.imageUrl);
    const endpoint = hasImage ? "image2video" : "text2video";

    const body: Record<string, unknown> = {
      model_name,
      mode,
      duration: String(options.duration ?? 5),
      prompt: String(prompt).slice(0, 2500),
      cfg_scale: Math.max(0.1, Math.min(1, Number(options.motionStrength ?? 5) / 10)),
    };
    if (hasImage) {
      body.image = options.imageUrl;
    } else {
      body.aspect_ratio = options.aspectRatio ?? "16:9";
    }

    const BASE = "https://api.klingai.com/v1/videos";
    const submit = await fetch(`${BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const stext = await submit.text();
    if (!submit.ok) throw new Error(`kling submit ${submit.status}: ${stext}`);
    const sj = JSON.parse(stext) as { code: number; message: string; data: { task_id: string } };
    if (sj.code !== 0) throw new Error(`kling error ${sj.code}: ${sj.message}`);
    const taskId = sj.data.task_id;

    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const p = await fetch(`${BASE}/${endpoint}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!p.ok) continue;
      const pj = await p.json() as {
        data: { task_status: string; task_status_msg: string; task_result: { videos: { url: string }[] } };
      };
      if (pj.data?.task_status === "succeed") {
        const url = pj.data.task_result?.videos?.[0]?.url;
        if (!url) throw new Error("kling: task succeeded but no video url");
        return { provider: "kling", model, output_url: url, raw: pj };
      }
      if (pj.data?.task_status === "failed") {
        throw new Error(`kling generation failed: ${pj.data.task_status_msg || "unknown reason"}`);
      }
    }
    throw new Error("kling timeout after 10 minutes");
  },

  // Hailuo (MiniMax) via fal.ai
  hailuo: async ({ prompt, options = {} }) => {
    if (!hasFalAuth()) throw new ProviderUnconfigured("hailuo");
    const model = "fal-ai/minimax/video-01";
    const payload: Record<string, unknown> = { prompt };
    if (options.imageUrl) payload.first_frame_image = options.imageUrl;
    const j = await falQueueWait(model, payload);
    const url = (j.video as { url?: string })?.url;
    if (!url) throw new Error(`hailuo: no url in response: ${JSON.stringify(j).slice(0, 300)}`);
    return { provider: "hailuo", model, output_url: url, raw: j };
  },

  // WAN 2.1 via Replicate — inference layer fallback (no Fal credits needed)
  wan: async ({ prompt, options = {} }) => {
    const key = env("REPLICATE_API_TOKEN");
    if (!key) throw new ProviderUnconfigured("wan");
    const model = options.imageUrl
      ? "wavespeedai/wan-2.1-i2v-480p"
      : "wavespeedai/wan-2.1-t2v-480p";
    const input: Record<string, unknown> = {
      prompt: String(prompt).slice(0, 2500),
      num_frames: 81,
      fps: 16,
      aspect_ratio: options.aspectRatio ?? "16:9",
      fast_mode: "Balanced",
    };
    if (options.imageUrl) input.image = options.imageUrl;

    const startRes = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, Prefer: "wait=5" },
      body: JSON.stringify({ input }),
    });
    if (!startRes.ok) throw new Error(`wan/replicate submit ${startRes.status}: ${await startRes.text()}`);
    let pred = await startRes.json() as { id: string; status: string; output?: unknown; error?: string };

    // Poll up to 8 min
    for (let i = 0; i < 96 && ["starting", "processing"].includes(pred.status); i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      pred = await poll.json() as typeof pred;
    }
    if (pred.status !== "succeeded") throw new Error(`wan/replicate failed: ${pred.error ?? pred.status}`);
    const url = Array.isArray(pred.output) ? (pred.output as string[])[0] : pred.output as string;
    if (!url) throw new Error("wan/replicate: no video url in output");
    return { provider: "wan", model, output_url: url, raw: pred };
  },

  // Runway Gen-4 via fal.ai
  runway: async ({ prompt, options = {} }) => {
    if (!hasFalAuth()) throw new ProviderUnconfigured("runway");
    const model = "fal-ai/runway-gen4/turbo/image-to-video";
    if (!options.imageUrl) throw new Error("runway: imageUrl (still frame) required");
    const payload: Record<string, unknown> = {
      prompt,
      image_url: options.imageUrl,
      duration: options.duration ?? 5,
      ratio: options.aspectRatio ?? "16:9",
    };
    const j = await falQueueWait(model, payload);
    const url = (j.video as { url?: string })?.url;
    if (!url) throw new Error(`runway: no url in response: ${JSON.stringify(j).slice(0, 300)}`);
    return { provider: "runway", model, output_url: url, raw: j };
  },

  // Sora via OpenAI Video API
  sora: async ({ prompt, options = {} }) => {
    const key = env("OPENAI_API_KEY");
    if (!key) throw new ProviderUnconfigured("sora");
    const model = "sora-1.0-turbo";
    const createRes = await fetch("https://api.openai.com/v1/video/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        prompt: String(prompt).slice(0, 2000),
        n: 1,
        size: options.size ?? "1280x720",
        duration: options.duration ?? 5,
        ...(options.imageUrl ? { image: options.imageUrl } : {}),
      }),
    });
    if (!createRes.ok) throw new Error(`sora submit ${createRes.status}: ${await createRes.text()}`);
    const created = await createRes.json() as { id?: string; data?: { id: string }[] };
    const genId = created.id ?? created.data?.[0]?.id;
    if (!genId) throw new Error("sora: no generation id returned");

    // Poll up to 10 min
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(`https://api.openai.com/v1/video/generations/${genId}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!poll.ok) continue;
      const pj = await poll.json() as { status?: string; data?: { url?: string }[]; url?: string };
      if (pj.status === "succeeded" || pj.status === "completed") {
        const url = pj.url ?? pj.data?.[0]?.url;
        if (!url) throw new Error("sora: succeeded but no video url");
        return { provider: "sora", model, output_url: url, raw: pj };
      }
      if (pj.status === "failed") throw new Error("sora: generation failed");
    }
    throw new Error("sora: timeout after 10 minutes");
  },

  // Veo 2 via Google Gemini API
  veo: async ({ prompt, options = {} }) => {
    const key = env("GEMINI_API_KEY");
    if (!key) throw new ProviderUnconfigured("veo");
    const model = "veo-2.0-generate-001";
    const createRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predictLongRunning?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: String(prompt).slice(0, 2000) }],
          parameters: {
            aspectRatio: options.aspectRatio ?? "16:9",
            sampleCount: 1,
            durationSeconds: options.duration ?? 5,
            ...(options.imageUrl ? { image: { bytesBase64Encoded: options.imageUrl } } : {}),
          },
        }),
      }
    );
    if (!createRes.ok) throw new Error(`veo submit ${createRes.status}: ${await createRes.text()}`);
    const op = await createRes.json() as { name?: string };
    if (!op.name) throw new Error("veo: no operation name returned");

    // Poll up to 10 min
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${op.name}?key=${key}`
      );
      if (!poll.ok) continue;
      const pj = await poll.json() as {
        done?: boolean;
        response?: { videos?: { uri?: string; video?: { uri?: string } }[] };
        error?: { message?: string };
      };
      if (pj.error) throw new Error(`veo: ${pj.error.message}`);
      if (pj.done) {
        const url = pj.response?.videos?.[0]?.uri ?? pj.response?.videos?.[0]?.video?.uri;
        if (!url) throw new Error("veo: done but no video url");
        return { provider: "veo", model, output_url: url, raw: pj };
      }
    }
    throw new Error("veo: timeout after 10 minutes");
  },

  // HuggingFace free video generation
  huggingface: async ({ prompt, options = {} }) => {
    const key = env("HUGGINGFACE_API_KEY");
    if (!key) throw new ProviderUnconfigured("huggingface");
    const hfModel = (options.hfModel as string) ?? "ali-vilab/i2vgen-xl";
    const body: Record<string, unknown> = { inputs: String(prompt).slice(0, 500) };
    if (options.imageUrl) body.image = options.imageUrl;

    const res = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "x-wait-for-model": "true" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`huggingface ${res.status}: ${await res.text()}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) throw new Error(`huggingface: response too small (${buf.length} bytes) — model may be loading`);

    // Upload to Supabase storage so we have a real URL
    const path = `hf-video/${Date.now()}.mp4`;
    const { createAnonClient } = await import("../supabase.js");
    const sb = createAnonClient();
    const { error: upErr } = await sb.storage.from("renders").upload(path, buf, { contentType: "video/mp4", upsert: true });
    if (upErr) throw new Error(`huggingface: storage upload failed: ${upErr.message}`);
    const { data: signed } = await sb.storage.from("renders").createSignedUrl(path, 3600);
    if (!signed?.signedUrl) throw new Error("huggingface: could not sign url");
    return { provider: "huggingface", model: hfModel, output_url: signed.signedUrl };
  },
};

// ──────────────── AUDIO ────────────────
export const audioAdapters: Record<string, (a: AdapterArgs) => Promise<AdapterResult>> = {
  elevenlabs: async ({ model, prompt, options = {} }) => {
    const key = env("ELEVENLABS_API_KEY");
    if (!key) throw new ProviderUnconfigured("elevenlabs");
    const voiceId = (options.voiceId as string) ?? "21m00Tcm4TlvDq8ikWAM";
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": key },
      body: JSON.stringify({ text: prompt, model_id: model }),
    });
    if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${await res.text()}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.byteLength; i++) bin += String.fromCharCode(buf[i]);
    return { provider: "elevenlabs", model, output_url: `data:audio/mpeg;base64,${btoa(bin)}` };
  },

  replicate: async ({ model, prompt, options = {} }) => {
    const key = env("REPLICATE_API_TOKEN");
    if (!key) throw new ProviderUnconfigured("replicate");
    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, Prefer: "wait=60" },
      body: JSON.stringify({ input: { prompt, ...(options.input as object ?? {}) } }),
    });
    if (!res.ok) throw new Error(`replicate ${res.status}: ${await res.text()}`);
    const j = await res.json() as { output: unknown };
    const url = Array.isArray(j.output) ? (j.output as string[])[0] : j.output;
    if (!url) throw new Error("replicate audio: no url");
    return { provider: "replicate", model, output_url: String(url), raw: j };
  },
};

export const ADAPTERS = { text: textAdapters, image: imageAdapters, video: videoAdapters, audio: audioAdapters } as const;
