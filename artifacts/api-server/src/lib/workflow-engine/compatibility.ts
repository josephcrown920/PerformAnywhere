import type { WorkflowDefinition, WorkflowRequest } from "./types.js";

export interface CompatibilityResult { compatible: boolean; missing: string[]; warnings: string[]; }

export function checkCompatibility(workflow: WorkflowDefinition, request: WorkflowRequest, installed: Set<string> = new Set()): CompatibilityResult {
  const missing = workflow.requirements.filter((r) => r.required && r.kind !== "gpu" && !installed.has(r.id)).map((r) => r.id);
  const warnings: string[] = [];
  if (request.aspectRatio && !workflow.supportedAspectRatios.includes(request.aspectRatio)) warnings.push(`Aspect ratio ${request.aspectRatio} is not supported by this workflow.`);
  if (request.durationSeconds && workflow.durationSeconds && (request.durationSeconds < workflow.durationSeconds.min || request.durationSeconds > workflow.durationSeconds.max)) warnings.push("Requested duration is outside the workflow's recommended range.");
  return { compatible: missing.length === 0 && warnings.length === 0, missing, warnings };
}

export function dependencyInstallPlan(workflow: WorkflowDefinition): string[] {
  return workflow.requirements.map((r) => `${r.kind}:${r.id}`).filter((x) => !x.includes("gpu"));
}
