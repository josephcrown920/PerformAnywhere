import { Router } from "express";
import { listWorkflows, getWorkflow } from "../lib/workflow-engine/registry.js";
import { planWorkflow } from "../lib/workflow-engine/planner.js";
import { checkCompatibility, dependencyInstallPlan } from "../lib/workflow-engine/compatibility.js";
import { defaultGpuCandidates, rankGpuCandidates } from "../lib/workflow-engine/gpu-router.js";
import type { WorkflowRequest } from "../lib/workflow-engine/types.js";

const router = Router();

router.get("/", (_req, res) => res.json({ workflows: listWorkflows(), count: listWorkflows().length }));

router.get("/:id", (req, res) => {
  const workflow = getWorkflow(req.params.id);
  if (!workflow) return res.status(404).json({ error: "workflow_not_found" });
  return res.json(workflow);
});

router.post("/plan", (req, res) => {
  try { return res.json(planWorkflow(req.body as WorkflowRequest)); }
  catch (error) { return res.status(422).json({ error: "no_compatible_workflow", message: error instanceof Error ? error.message : String(error) }); }
});

router.post("/compatibility", (req, res) => {
  const workflow = getWorkflow(String(req.body?.workflowId ?? ""));
  if (!workflow) return res.status(404).json({ error: "workflow_not_found" });
  return res.json({ ...checkCompatibility(workflow, (req.body?.request ?? {}) as WorkflowRequest, new Set(req.body?.installed ?? [])), installPlan: dependencyInstallPlan(workflow) });
});

router.get("/gpus/race", (req, res) => {
  const minVram = Number(req.query.minVramGb ?? 0);
  const freeOnly = String(req.query.freeOnly ?? "false") === "true";
  return res.json({ candidates: rankGpuCandidates(defaultGpuCandidates(), minVram, freeOnly) });
});

export default router;
