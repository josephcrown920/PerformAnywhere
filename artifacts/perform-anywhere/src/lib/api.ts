const BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type Modality = "text" | "image" | "video" | "audio";

export type WalletData = {
  balance: number;
  lifetime_purchased: number;
  lifetime_spent: number;
};

export type GenerationRow = {
  id: string;
  modality: string;
  provider: string;
  model: string;
  prompt: string | null;
  status: string;
  output_url: string | null;
  output_text: string | null;
  credits_used: number;
  created_at: string;
};

export type RunGenerationResult = {
  id: string;
  provider: string;
  model: string;
  output_url?: string;
  output_text?: string;
  credits_used: number;
  duration_ms: number;
  fallbacks_attempted: string[];
};

export type ProviderStatus = {
  id: string;
  label: string;
  configured: boolean;
};

export type StartRenderResult = {
  ok: boolean;
  provider: string;
  jobId: string;
};

export type PollRenderResult = {
  status: "queued" | "running" | "succeeded" | "failed";
  outputPath?: string;
  error?: string;
  provider?: string;
};

export type SignedUrlResult = { url: string };
export type EnhancePromptResult = { prompt: string };
export type PaystackInitResult = { authorization_url?: string; reference?: string };

export const api = {
  wallet: (clientId: string) =>
    post<WalletData>("/orchestrate/wallet", { clientId }),

  listGenerations: (clientId: string) =>
    post<GenerationRow[]>("/orchestrate/list", { clientId }),

  runGeneration: (body: {
    clientId: string;
    modality: Modality;
    modelId: string;
    prompt: string;
    options?: Record<string, unknown>;
  }) => post<RunGenerationResult>("/orchestrate/run", body),

  initPaystack: (body: { clientId: string; amountNaira: number; email: string }) =>
    post<PaystackInitResult>("/orchestrate/paystack", body),

  startRender: (body: {
    clientId: string;
    projectId: string;
    model?: string;
    options?: {
      duration?: 5 | 10;
      aspectRatio?: "16:9" | "9:16" | "1:1";
      motionStrength?: number;
      lipSync?: boolean;
    };
  }) =>
    post<StartRenderResult>("/render/start", body),

  pollRender: (body: { clientId: string; projectId: string }) =>
    post<PollRenderResult>("/render/poll", body),

  retryRender: (body: { clientId: string; projectId: string; provider: string }) =>
    post<{ ok: boolean }>("/render/retry", body),

  getRenderSignedUrl: (path: string, clientId: string) =>
    post<SignedUrlResult>("/render/signed-url/render", { path, clientId }),

  getAssetSignedUrl: (path: string, clientId: string) =>
    post<SignedUrlResult>("/render/signed-url/asset", { path, clientId }),

  providerStatus: () =>
    get<ProviderStatus[]>("/render/providers"),

  getPublicRender: (clientId: string, projectId: string) =>
    get<{
      id: string; title: string; provider: string; model: string | null;
      prompt: string | null; created_at: string; videoUrl: string;
    }>(`/render/public/${encodeURIComponent(clientId)}/${encodeURIComponent(projectId)}`),

  enhancePrompt: (body: {
    scenePrompt: string;
    stylePrompt: string;
    hasOutfit: boolean;
    hasScene: boolean;
    hasIdentity: boolean;
  }) => post<EnhancePromptResult>("/prompt/enhance", body),
};
