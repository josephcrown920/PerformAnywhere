import { Router } from "express";
import { runModelArkDirector } from "../lib/modelark-director";

const router = Router();

function authorized(req: any) {
  const token = process.env.AURORA_MCP_TOKEN?.trim();
  if (!token) return false;
  return req.headers.authorization === `Bearer ${token}`;
}

router.post("/modelark-director", async (req, res) => {
  if (!process.env.AURORA_MCP_TOKEN?.trim()) return res.status(503).json({ error: "AURORA_MCP_TOKEN is not configured." });
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized" });
  const instruction = typeof req.body?.instruction === "string" ? req.body.instruction.trim() : "";
  if (!instruction) return res.status(400).json({ error: "instruction is required" });
  try {
    const result = await runModelArkDirector(instruction, req.body?.context || {});
    return res.json({ ok: true, role: "master_director", ...result });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error instanceof Error ? error.message : "ModelArk director failed" });
  }
});

export default router;
