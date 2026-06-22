import { ADAPTERS, ProviderUnconfigured, type AdapterResult } from "./providers.js";
import { CATALOG_DEFAULT_FALLBACKS, FALLBACK_MODELS, type Modality } from "./catalog.js";

type RunOptions = {
  modality: Modality;
  modelId: string;
  prompt: string;
  options?: Record<string, unknown>;
  fallback?: string[];
};

type RunResult = AdapterResult & {
  duration_ms: number;
  attempts: string[];
};

function parseModelId(modelId: string): { provider: string; model: string } {
  const slash = modelId.indexOf("/");
  if (slash === -1) return { provider: modelId, model: modelId };
  return { provider: modelId.slice(0, slash), model: modelId.slice(slash + 1) };
}

export async function runOrchestrated(opts: RunOptions): Promise<RunResult> {
  const { modality, modelId, prompt, options = {}, fallback } = opts;
  const { provider: primaryProvider, model } = parseModelId(modelId);

  const adapters = ADAPTERS[modality] as Record<string, (a: { model: string; prompt: string; options?: Record<string, unknown> }) => Promise<AdapterResult>>;

  const chain: string[] = [
    primaryProvider,
    ...(fallback ?? CATALOG_DEFAULT_FALLBACKS[modality]).filter((p) => p !== primaryProvider),
  ];

  const attempts: string[] = [];
  const start = Date.now();

  for (const prov of chain) {
    const adapter = adapters[prov];
    if (!adapter) {
      attempts.push(`${prov}: no_adapter`);
      continue;
    }
    try {
      const modelForAdapter = prov === primaryProvider ? model : (FALLBACK_MODELS[modality]?.[prov] ?? prov);
      const result = await adapter({ model: modelForAdapter, prompt, options });
      return { ...result, duration_ms: Date.now() - start, attempts };
    } catch (err) {
      const msg = err instanceof ProviderUnconfigured
        ? `${prov}: unconfigured`
        : `${prov}: ${err instanceof Error ? err.message : String(err)}`;
      attempts.push(msg);
    }
  }

  throw new Error(`All providers failed. Attempts: ${attempts.join("; ")}`);
}
