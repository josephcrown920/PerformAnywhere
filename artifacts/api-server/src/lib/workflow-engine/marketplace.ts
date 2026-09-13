export interface WorkflowPackageManifest {
  id: string;
  version: string;
  name: string;
  author: string;
  source: "official" | "community" | "private";
  workflowPath: string;
  dependencies: Array<{ kind: "custom-node" | "model" | "vae" | "lora" | "controlnet"; id: string; version?: string }>;
  minVramGb?: number;
  checksum?: string;
  changelog?: string;
}

export function validateManifest(manifest: WorkflowPackageManifest): string[] {
  const errors: string[] = [];
  if (!manifest.id || !manifest.version || !manifest.name) errors.push("id, version and name are required");
  if (!manifest.workflowPath) errors.push("workflowPath is required");
  if (!Array.isArray(manifest.dependencies)) errors.push("dependencies must be an array");
  if (manifest.minVramGb !== undefined && manifest.minVramGb < 0) errors.push("minVramGb cannot be negative");
  return errors;
}
