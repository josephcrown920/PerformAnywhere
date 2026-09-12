export interface WorkflowBenchmark {
  workflowId: string;
  workflowVersion: string;
  provider: string;
  model: string;
  gpu?: string;
  durationSeconds: number;
  generationSeconds: number;
  vramGb?: number;
  credits: number;
  success: boolean;
  qualityScore?: number;
  createdAt: string;
}

export function summarizeBenchmarks(rows: WorkflowBenchmark[]) {
  if (!rows.length) return { runs: 0, successRate: 0, avgGenerationSeconds: 0, avgCredits: 0, avgQualityScore: null };
  const success = rows.filter((r) => r.success).length;
  return {
    runs: rows.length,
    successRate: success / rows.length,
    avgGenerationSeconds: rows.reduce((s, r) => s + r.generationSeconds, 0) / rows.length,
    avgCredits: rows.reduce((s, r) => s + r.credits, 0) / rows.length,
    avgQualityScore: rows.filter((r) => r.qualityScore != null).length ? rows.filter((r) => r.qualityScore != null).reduce((s, r) => s + (r.qualityScore ?? 0), 0) / rows.filter((r) => r.qualityScore != null).length : null,
  };
}
