import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CATALOG, estimateCredits, type Modality } from "@/lib/catalog";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import { Loader2, Coins, Zap, ChevronRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const MODALITIES: Modality[] = ["text", "image", "video", "audio"];

const MODALITY_DESC: Record<Modality, string> = {
  text: "LLM completions — chat, summarise, rewrite",
  image: "Text-to-image generation",
  video: "Text-to-video or image-to-video renders",
  audio: "Text-to-speech or music generation",
};

export default function Orchestrate() {
  const qc = useQueryClient();
  const [clientId, setClientId] = useState<string>("");
  const [modality, setModality] = useState<Modality>("text");
  const [modelId, setModelId] = useState<string>(CATALOG.text[0].id);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [email, setEmail] = useState("");

  useEffect(() => { setClientId(getClientId()); }, []);

  const wallet = useQuery({
    queryKey: ["wallet", clientId],
    queryFn: () => api.wallet(clientId),
    enabled: !!clientId,
    refetchInterval: 30_000,
  });

  const history = useQuery({
    queryKey: ["generations", clientId],
    queryFn: () => api.listGenerations(clientId),
    enabled: !!clientId,
  });

  const cost = estimateCredits(modality, modality === "video" ? { duration } : {});
  const balance = wallet.data?.balance ?? 0;

  const run = useMutation({
    mutationFn: () => api.runGeneration({ clientId, modality, modelId, prompt, options: modality === "video" ? { duration } : {} }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["wallet", clientId] });
      qc.invalidateQueries({ queryKey: ["generations", clientId] });
    },
  });

  const buy = useMutation({
    mutationFn: (amountNaira: number) => {
      if (!email) throw new Error("Enter an email address first");
      return api.initPaystack({ clientId, amountNaira, email });
    },
    onSuccess: (r) => { if (r?.authorization_url) window.location.href = r.authorization_url; },
    onError: (e: Error) => toast_error(e.message),
  });

  function toast_error(msg: string) {
    const t = document.createElement("div");
    t.textContent = msg;
    Object.assign(t.style, { position:"fixed",bottom:"20px",right:"20px",background:"#b91c1c",color:"#fff",padding:"10px 16px",borderRadius:"6px",fontSize:"13px",zIndex:"9999" });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl px-6 py-14 space-y-10">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-border/40">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">AI Router</p>
            <h1 className="mt-2 font-display text-5xl">Orchestrate</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Unified text · image · video · audio — with automatic provider fallback
            </p>
          </div>

          {/* Wallet card */}
          <div className="rounded-lg border border-border/50 bg-card p-5 min-w-[220px]">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Coins className="h-3.5 w-3.5" /> Credits
            </div>
            <div className="mt-2 font-display text-4xl">
              {wallet.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : balance.toLocaleString()}
            </div>
            <div className="mt-4 space-y-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="email for receipt"
                className="w-full rounded border border-border bg-background px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex gap-1.5">
                {[500, 2000, 5000].map((n) => (
                  <button key={n} onClick={() => buy.mutate(n)} disabled={buy.isPending}
                    className="flex-1 rounded border border-border py-1 text-xs hover:bg-accent hover:border-primary/50 transition disabled:opacity-50"
                  >
                    +{n}₦
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modality tabs */}
        <div className="space-y-6">
          <div className="flex gap-1 overflow-x-auto border-b border-border/40">
            {MODALITIES.map((m) => (
              <button key={m} onClick={() => { setModality(m); setModelId(CATALOG[m][0].id); }}
                className={`shrink-0 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition uppercase tracking-wider ${
                  modality === m ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{MODALITY_DESC[modality]}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Model</label>
              <select className="w-full rounded border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                value={modelId} onChange={(e) => setModelId(e.target.value)}
              >
                {CATALOG[modality].map((m) => (
                  <option key={m.id} value={m.id}>{m.label}{m.free ? " · free" : ""}</option>
                ))}
              </select>
            </div>
            {modality === "video" && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Duration (seconds)</label>
                <input type="number" min={3} max={10} value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded border border-border bg-input px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Prompt</label>
            <textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate…"
              className="w-full rounded border border-border bg-input px-3 py-2.5 text-sm font-mono text-foreground outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs font-mono text-muted-foreground">
              Estimated cost: <span className="text-foreground font-semibold">{cost} credits</span>
              {balance < cost && <span className="ml-2 text-destructive">(insufficient balance)</span>}
            </p>
            <button onClick={() => run.mutate()}
              disabled={run.isPending || !prompt.trim() || !clientId || balance < cost}
              className="inline-flex items-center gap-2 rounded bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition"
            >
              {run.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</> : <><Zap className="h-4 w-4" /> Generate</>}
            </button>
          </div>

          {/* Error / Result */}
          {run.isError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive font-mono">
              {(run.error as Error).message}
            </div>
          )}
          {run.data && (
            <div className="rounded-lg border border-border/50 bg-card p-5 space-y-3">
              <div className="flex flex-wrap gap-3 text-xs font-mono text-muted-foreground">
                <span className="text-foreground font-semibold">{run.data.provider}</span>
                <span>·</span>
                <span>{run.data.model}</span>
                <span>·</span>
                <span>{run.data.credits_used} credits</span>
                <span>·</span>
                <span>{(run.data.duration_ms / 1000).toFixed(1)}s</span>
              </div>
              {run.data.output_text && (
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{run.data.output_text}</p>
              )}
              {run.data.output_url?.startsWith("data:audio") && (
                <audio controls src={run.data.output_url} className="w-full" />
              )}
              {run.data.output_url && !run.data.output_url.startsWith("data:audio") && (
                modality === "video"
                  ? <video controls src={run.data.output_url} className="w-full rounded" />
                  : <img src={run.data.output_url} alt="" className="w-full rounded" />
              )}
              {run.data.fallbacks_attempted?.length > 0 && (
                <details className="text-xs text-muted-foreground font-mono">
                  <summary className="cursor-pointer">Fallback log ({run.data.fallbacks_attempted.length})</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{run.data.fallbacks_attempted.join("\n")}</pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* History */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Recent generations</h2>
          {history.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
          ) : history.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No generations yet.</p>
          ) : (
            <div className="divide-y divide-border/30 border border-border/30 rounded-lg overflow-hidden">
              {history.data?.map((g) => (
                <div key={g.id} className="flex items-center gap-3 px-4 py-3 text-sm bg-card hover:bg-accent/30 transition">
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-mono">{g.modality}</span>
                  <span className="shrink-0 text-xs font-mono text-muted-foreground">{g.provider}</span>
                  <span className="flex-1 truncate text-muted-foreground">{g.prompt}</span>
                  <span className={`shrink-0 text-xs font-mono ${g.status === "succeeded" ? "text-emerald-400" : g.status === "failed" ? "text-destructive" : "text-yellow-400"}`}>
                    {g.status}
                  </span>
                  <span className="shrink-0 text-xs font-mono text-muted-foreground">{g.credits_used}cr</span>
                  <ChevronRight className="shrink-0 h-3 w-3 text-muted-foreground/40" />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
