import { getWorkflow, listWorkflows } from "./registry.js";
import type { WorkflowPlan, WorkflowRequest, QualityTier } from "./types.js";

function scoreWorkflow(w: ReturnType<typeof getWorkflow>, r: WorkflowRequest): { score: number; reasons: string[] } {
  if (!w) return { score: -Infinity, reasons: [] };
  let score = 0; const reasons: string[] = [];
  if (w.modalities.includes(r.modality)) { score += 30; reasons.push("modality match"); } else score -= 100;
  if (r.category && w.category === r.category) { score += 35; reasons.push("category match"); }
  if (r.aspectRatio && w.supportedAspectRatios.includes(r.aspectRatio)) { score += 15; reasons.push("aspect ratio supported"); }
  for (const cap of r.capabilities ?? []) if (w.capabilities.includes(cap)) { score += 8; reasons.push(`capability:${cap}`); }
  if (r.durationSeconds && w.durationSeconds && r.durationSeconds >= w.durationSeconds.min && r.durationSeconds <= w.durationSeconds.max) { score += 10; reasons.push("duration supported"); }
  if (r.preferredProvider && w.tiers[r.quality ?? "balanced"].provider === r.preferredProvider) { score += 12; reasons.push("preferred provider"); }
  if (r.task.toLowerCase().includes("performance") && w.tags.includes("perform-anywhere")) { score += 40; reasons.push("performance transfer match"); }
  if (r.task.toLowerCase().includes("music") && w.category === "music-video") { score += 30; reasons.push("music-video match"); }
  if (r.task.toLowerCase().includes("product") && w.category === "product-ad") { score += 30; reasons.push("product-ad match"); }
  return { score, reasons };
}

export function planWorkflow(request: WorkflowRequest): WorkflowPlan {
  const quality: QualityTier = request.quality ?? "balanced";
  const candidates = listWorkflows()
    .map((w) => ({ w, ...scoreWorkflow(w, request) }))
    .filter((x) => x.score > -50)
    .sort((a, b) => b.score - a.score);
  if (!candidates.length) throw new Error("No compatible workflow found");
  const best = candidates[0];
  const tier = best.w.tiers[quality];
  const fallbacks = [...new Set(Object.values(best.w.tiers).map((x) => x.provider))].filter((p) => p !== tier.provider);
  return { workflow: best.w, provider: tier.provider, model: tier.model, quality, score: best.score, reasons: best.reasons, fallbackProviders: fallbacks };
}
