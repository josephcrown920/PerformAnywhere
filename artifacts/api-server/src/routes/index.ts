import modelarkDirectorRouter from "./modelark-director.js";
import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import orchestrateRouter, { paystackWebhookRouter } from "./orchestrate.js";
import renderRouter from "./render.js";
import promptRouter from "./prompt.js";
import workflowsRouter from "./workflows.js";

const router: IRouter = Router();
router.use(healthRouter);
router.use(modelarkDirectorRouter);
router.use("/orchestrate", orchestrateRouter);
router.use("/render", renderRouter);
router.use("/prompt", promptRouter);
router.use("/workflows", workflowsRouter);
router.use("/paystack-webhook", paystackWebhookRouter);
export default router;
