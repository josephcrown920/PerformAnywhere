import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Set ALLOWED_ORIGINS env var to a comma-separated list of origins to restrict access.
// Leave unset (or set to "*") to allow all origins (default for Replit preview).
// Example: ALLOWED_ORIGINS=https://aurora.app,https://staging.aurora.app

const rawOrigins = process.env.ALLOWED_ORIGINS;
const corsOptions =
  !rawOrigins || rawOrigins === "*"
    ? { origin: true, credentials: true }
    : {
        origin: rawOrigins.split(",").map((o) => o.trim()).filter(Boolean),
        credentials: true,
      };

app.use(cors(corsOptions));

// ─── Optional API key auth ────────────────────────────────────────────────────
// Set API_KEY env var to require `Authorization: Bearer <key>` on all /api routes.
// Leave unset to allow open access (default for anonymous studio use).

const API_KEY = process.env.API_KEY;
if (API_KEY) {
  app.use("/api", (req: Request, res: Response, next: NextFunction) => {
    // Health check is always public
    if (req.path === "/healthz") return next();
    const auth = req.headers.authorization ?? "";
    if (!auth.startsWith("Bearer ") || auth.slice(7) !== API_KEY) {
      return res.status(401).json({ error: "unauthorized", hint: "Include Authorization: Bearer <API_KEY> header" });
    }
    return next();
  });
}

// ─── Core middleware ──────────────────────────────────────────────────────────

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
