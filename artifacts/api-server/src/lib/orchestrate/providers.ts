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
    const j = await res.json();
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
    const j = await res.json();
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
    const j = await res.json();
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
    const j = await res.json();
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
    const j = await res.json();
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
    const j = await res.json();
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
    const j = await res.json();
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
    const j = await res.json();
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
    const j = await res.json();
    const url = j.images?.[0]?.url ?? j.image?.url;
    if (!url) throw new Error("fal: no image in response");
    return { provider: "fal", model, output_url: url, raw: j };
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
    const j = await res.json();
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
    const j = await res.json();
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
async function falQueueWait(model: string, payload: Record<string, unknown>, key: string): Promise<Record<string, unknown>> {
  const submit = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Key ${key}` },
    body: JSON.stringify(payload),
  });
  if (!submit.ok) throw new Error(`fal submit ${submit.status}: ${await submit.text()}`);
  const { request_id } = await submit.json() as { request_id: string };
  const statusUrl = `https://queue.fal.run/${model}/requests/${request_id}/status`;
  const resultUrl = `https://queue.fal.run/${model}/requests/${request_id}`;
  for (let i = 0; i < 120; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const s = await fetch(statusUrl, { headers: { Authorization: `Key ${key}` } });
    const sj = await s.json() as { status: string };
    if (sj.status === "COMPLETED") {
      const r = await fetch(resultUrl, { headers: { Authorization: `Key ${key}` } });
      return r.json() as Promise<Record<string, unknown>>;
    }
    if (sj.status === "FAILED") throw new Error(`fal failed: ${JSON.stringify(sj)}`);
  }
  throw new Error("fal timeout");
}

export const videoAdapters: Record<string, (a: AdapterArgs) => Promise<AdapterResult>> = {
  fal: async ({ model, prompt, options = {} }) => {
    const key = env("FAL_KEY");
    if (!key) throw new ProviderUnconfigured("fal");
    const payload: Record<string, unknown> = { prompt, duration: options.duration ?? 5, aspect_ratio: options.aspectRatio ?? "16:9" };
    if (options.imageUrl) payload.image_url = options.imageUrl;
    if (options.negativePrompt) payload.negative_prompt = options.negativePrompt;
    const j = await falQueueWait(model, payload, key);
    const url = (j.video as { url?: string })?.url ?? (j.output as { url?: string })?.url ?? (Array.isArray(j.output) ? (j.output as string[])[0] : undefined);
    if (!url) throw new Error("fal video: no url");
    return { provider: "fal", model, output_url: url, raw: j };
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

  kling: async ({ model, prompt, options = {} }) => {
    const ak = env("KLING_ACCESS_KEY");
    const sk = env("KLING_SECRET_KEY");
    if (!ak || !sk) throw new ProviderUnconfigured("kling");

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
    const token = `${head}.${pay}.${b64url(new Uint8Array(sig))}`;

    const isI2V = Boolean(options.imageUrl);
    const endpoint = isI2V ? "image2video" : "text2video";
    const body: Record<string, unknown> = {
      model_name: "kling-v1-6",
      mode: model.includes("pro") ? "pro" : "std",
      duration: String(options.duration ?? 5),
      prompt: prompt.slice(0, 2500),
      cfg_scale: 0.5,
    };
    if (isI2V) body.image = options.imageUrl;
    else body.aspect_ratio = options.aspectRatio ?? "16:9";

    const submit = await fetch(`https://api-singapore.klingai.com/v1/videos/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const stext = await submit.text();
    if (!submit.ok) throw new Error(`kling submit ${submit.status}: ${stext}`);
    const sj = JSON.parse(stext) as { code: number; message: string; data: { task_id: string } };
    if (sj.code !== 0) throw new Error(`kling ${sj.code}: ${sj.message}`);
    const taskId = sj.data.task_id;

    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const p = await fetch(`https://api-singapore.klingai.com/v1/videos/${endpoint}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pj = await p.json() as { data: { task_status: string; task_status_msg: string; task_result: { videos: { url: string }[] } } };
      if (pj.data?.task_status === "succeed") {
        const url = pj.data.task_result?.videos?.[0]?.url;
        if (!url) throw new Error("kling: no video url");
        return { provider: "kling", model, output_url: url, raw: pj };
      }
      if (pj.data?.task_status === "failed") throw new Error(`kling failed: ${pj.data.task_status_msg}`);
    }
    throw new Error("kling timeout");
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
