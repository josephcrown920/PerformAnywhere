import type { GpuCandidate } from "./types.js";

/** Provider-neutral GPU racing. Adapters can feed live queue/price data through env-backed endpoints. */
export function rankGpuCandidates(candidates: GpuCandidate[], minVramGb = 0, freeOnly = false): GpuCandidate[] {
  return candidates
    .filter((c) => c.available && c.vramGb >= minVramGb && (!freeOnly || c.estimatedCostPerMinute === 0))
    .sort((a, b) => {
      const sa = a.queueSeconds + a.estimatedCostPerMinute * 60;
      const sb = b.queueSeconds + b.estimatedCostPerMinute * 60;
      return sa - sb;
    });
}

export function raceGpuCandidates(candidates: GpuCandidate[], minVramGb = 0, freeOnly = false): GpuCandidate | undefined {
  return rankGpuCandidates(candidates, minVramGb, freeOnly)[0];
}

export function defaultGpuCandidates(): GpuCandidate[] {
  return [
    { id: "local-comfy", provider: "comfyui", gpu: "local", vramGb: 24, queueSeconds: 999999, estimatedCostPerMinute: 0, available: Boolean(process.env.COMFYUI_URL), endpoint: process.env.COMFYUI_URL },
    { id: "runpod-serverless", provider: "runpod", gpu: "serverless", vramGb: 24, queueSeconds: 120, estimatedCostPerMinute: Number(process.env.RUNPOD_COST_PER_MINUTE ?? 0.005), available: Boolean(process.env.RUNPOD_API_KEY), endpoint: process.env.RUNPOD_ENDPOINT },
    { id: "vast-serverless", provider: "vast", gpu: "serverless", vramGb: 24, queueSeconds: 150, estimatedCostPerMinute: Number(process.env.VAST_COST_PER_MINUTE ?? 0.004), available: Boolean(process.env.VAST_API_KEY), endpoint: process.env.VAST_ENDPOINT },
  ];
}
