import { Router } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAnonClient, assertClientId } from "../lib/supabase.js";
import { runOrchestrated } from "../lib/orchestrate/run.js";
import { estimateCredits, FREE_PROVIDERS, type Modality } from "../lib/orchestrate/catalog.js";

const router = Router();

// POST /api/orchestrate/wallet
router.post("/wallet", async (req, res) => {
  try {
    const clientId = assertClientId(req.body.clientId);
    const sb = createAnonClient();
    const { data, error } = await sb
      .from("credit_wallets")
      .select("balance,lifetime_purchased,lifetime_spent")
      .eq("client_id", clientId)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? { balance: 0, lifetime_purchased: 0, lifetime_spent: 0 });
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : "error" });
  }
});

// POST /api/orchestrate/list
router.post("/list", async (req, res) => {
  try {
    const clientId = assertClientId(req.body.clientId);
    const sb = createAnonClient();
    const { data, error } = await sb
      .from("generations")
      .select("id,modality,provider,model,prompt,status,output_url,output_text,credits_used,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data ?? []);
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : "error" });
  }
});

// POST /api/orchestrate/run
router.post("/run", async (req, res) => {
  const { clientId: rawCid, modality, modelId, prompt, options = {} } = req.body as {
    clientId: unknown;
    modality: Modality;
    modelId: string;
    prompt: string;
    options?: Record<string, unknown>;
  };

  let clientId: string;
  try {
    clientId = assertClientId(rawCid);
  } catch {
    return res.status(400).json({ error: "invalid_client_id" });
  }
  if (!prompt?.trim()) return res.status(400).json({ error: "prompt required" });

  const sb = createAnonClient();
  const primaryProvider = modelId.split("/")[0];
  const isFree = FREE_PROVIDERS.has(primaryProvider);
  const credits = isFree ? 0 : estimateCredits(modality, options);

  // Create pending generation row
  const { data: gen, error: gErr } = await sb
    .from("generations")
    .insert({
      client_id: clientId,
      modality,
      model: modelId,
      provider: primaryProvider,
      prompt,
      options,
      credits_used: credits,
      status: "running",
    })
    .select("id")
    .single();
  if (gErr || !gen) return res.status(500).json({ error: gErr?.message ?? "DB error" });

  // Only spend credits for paid providers
  if (!isFree && credits > 0) {
    const { error: spendErr } = await sb.rpc("spend_credits", {
      _client_id: clientId,
      _amount: credits,
      _reason: "generation",
      _description: `${modality}/${modelId}`,
      _generation_id: gen.id,
    });
    if (spendErr) {
      await sb.from("generations").update({ status: "failed", error_message: "insufficient_credits" }).eq("id", gen.id);
      return res.status(402).json({ error: "insufficient_credits" });
    }
  }

  try {
    const result = await runOrchestrated({ modality, modelId, prompt, options });

    await sb.from("generations").update({
      status: "succeeded",
      provider: result.provider,
      output_text: result.output_text ?? null,
      output_url: result.output_url ?? null,
      duration_ms: result.duration_ms,
    }).eq("id", gen.id);

    return res.json({
      id: gen.id,
      provider: result.provider,
      model: result.model,
      output_url: result.output_url,
      output_text: result.output_text,
      credits_used: credits,
      duration_ms: result.duration_ms,
      fallbacks_attempted: result.attempts,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await sb.from("generations").update({ status: "failed", error_message: msg }).eq("id", gen.id);
    // Refund credits
    await sb.rpc("grant_credits", {
      _client_id: clientId,
      _amount: credits,
      _reason: "refund",
      _description: `Refund for failed generation ${gen.id}`,
      _purchase_id: null,
    }).catch(() => {});
    return res.status(500).json({ error: msg });
  }
});

// POST /api/orchestrate/paystack
router.post("/paystack", async (req, res) => {
  const { clientId: rawCid, amountNaira, email } = req.body as {
    clientId: unknown;
    amountNaira: number;
    email: string;
  };
  let clientId: string;
  try { clientId = assertClientId(rawCid); } catch { return res.status(400).json({ error: "invalid_client_id" }); }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(503).json({ error: "paystack_not_configured" });

  if (!amountNaira || amountNaira < 100) return res.status(400).json({ error: "min 100 naira" });
  if (!email?.includes("@")) return res.status(400).json({ error: "valid email required" });

  try {
    const r = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        email,
        amount: amountNaira * 100,
        metadata: { client_id: clientId },
      }),
    });
    const j = await r.json() as { status: boolean; data?: { authorization_url: string; reference: string }; message?: string };
    if (!j.status || !j.data) return res.status(500).json({ error: j.message ?? "paystack error" });
    return res.json({ authorization_url: j.data.authorization_url, reference: j.data.reference });
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : "paystack_error" });
  }
});

// POST /api/paystack-webhook (public)
export const paystackWebhookRouter = Router();
paystackWebhookRouter.post("/", express_raw_body_middleware, async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return res.status(503).send("not_configured");

  const raw = (req as any)._rawBody as string;
  const sig = req.headers["x-paystack-signature"] ?? "";
  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  try {
    const a = Buffer.from(sig as string);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return res.status(401).send("invalid_signature");
    }
  } catch {
    return res.status(401).send("invalid_signature");
  }

  let event: Record<string, unknown>;
  try { event = JSON.parse(raw); } catch { return res.status(400).send("bad_json"); }
  if ((event as { event?: string }).event !== "charge.success") return res.status(200).send("ignored");

  const data = (event as { data?: Record<string, unknown> }).data ?? {};
  const reference = data.reference as string | undefined;
  const amountMinor = data.amount as number | undefined;
  const clientId = (data.metadata as { client_id?: string })?.client_id;

  if (!reference || !amountMinor || !clientId) return res.status(400).send("missing_fields");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)) {
    return res.status(400).send("invalid_client_id");
  }

  const sb = createAnonClient();
  const amountNaira = Math.floor(amountMinor / 100);
  const credits = amountNaira;

  const { data: existing } = await sb.from("purchases").select("id").eq("paystack_reference", reference).maybeSingle();
  if (existing) return res.status(200).send("duplicate");

  const { data: purchase, error: pErr } = await sb.from("purchases").insert({
    client_id: clientId,
    paystack_reference: reference,
    amount_paid_minor: amountMinor,
    currency: (data.currency as string) ?? "NGN",
    credits_allocated: credits,
    raw_event: event,
  }).select("id").single();
  if (pErr || !purchase) return res.status(500).send(`insert_failed:${pErr?.message}`);

  const { error: gErr } = await sb.rpc("grant_credits", {
    _client_id: clientId,
    _amount: credits,
    _reason: "purchase",
    _description: `Paystack ${reference}`,
    _purchase_id: (purchase as { id: string }).id,
  });
  if (gErr) return res.status(500).send(`grant_failed:${gErr.message}`);

  return res.status(200).send("ok");
});

// Simple middleware to capture raw body for webhook verification
function express_raw_body_middleware(req: any, res: any, next: any) {
  let data = "";
  req.setEncoding("utf8");
  req.on("data", (chunk: string) => { data += chunk; });
  req.on("end", () => { req._rawBody = data; next(); });
}

export default router;
