import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CATALOG, estimateCredits, type Modality } from "@/lib/catalog";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import AppLayout from "@/components/AppLayout";

const MODALITIES: Modality[] = ["text", "image", "video", "audio"];

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
  });

  const history = useQuery({
    queryKey: ["generations", clientId],
    queryFn: () => api.listGenerations(clientId),
    enabled: !!clientId,
  });

  const cost = estimateCredits(modality, modality === "video" ? { duration } : {});

  const run = useMutation({
    mutationFn: () =>
      api.runGeneration({
        clientId,
        modality,
        modelId,
        prompt,
        options: modality === "video" ? { duration } : {},
      }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["wallet", clientId] });
      qc.invalidateQueries({ queryKey: ["generations", clientId] });
    },
  });

  const buy = useMutation({
    mutationFn: (amountNaira: number) => {
      if (!email) throw new Error("Enter an email to receive the Paystack receipt.");
      return api.initPaystack({ clientId, amountNaira, email });
    },
    onSuccess: (r) => { if (r?.authorization_url) window.location.href = r.authorization_url; },
    onError: (e: Error) => { alert(e.message); },
  });

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Orchestrate</h1>
            <p className="text-sm text-muted-foreground font-mono">unified router — text / image / video / audio</p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Credits</div>
            <div className="text-2xl font-mono">{wallet.data?.balance ?? "—"}</div>
            <div className="mt-2 flex flex-col items-end gap-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email for receipt"
                className="text-xs px-2 py-1 border border-border bg-background rounded w-48 text-right text-foreground outline-none"
              />
              <div className="flex gap-1">
                {[500, 2000, 5000].map((n) => (
                  <button
                    key={n}
                    onClick={() => buy.mutate(n)}
                    disabled={buy.isPending}
                    className="text-xs px-2 py-1 border border-border rounded hover:bg-accent disabled:opacity-50"
                  >
                    +{n}₦
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex gap-1 border-b border-border">
            {MODALITIES.map((m) => (
              <button
                key={m}
                onClick={() => { setModality(m); setModelId(CATALOG[m][0].id); }}
                className={`px-4 py-2 text-sm uppercase tracking-wider border-b-2 -mb-px ${modality === m ? "border-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Model</span>
              <select
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
              >
                {CATALOG[modality].map((m) => (
                  <option key={m.id} value={m.id}>{m.label}{m.free ? " · free" : ""}</option>
                ))}
              </select>
            </label>
            {modality === "video" && (
              <label className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Duration (s)</span>
                <input
                  type="number" min={3} max={10} value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground"
                />
              </label>
            )}
          </div>

          <label className="block space-y-1">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Prompt</span>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want…"
              className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-foreground outline-none"
            />
          </label>

          <div className="flex items-center justify-between">
            <div className="text-xs font-mono text-muted-foreground">
              est. cost: <span className="text-foreground">{cost}</span> credits
            </div>
            <button
              onClick={() => run.mutate()}
              disabled={run.isPending || !prompt.trim() || !clientId || (wallet.data?.balance ?? 0) < cost}
              className="px-6 py-2 bg-foreground text-background rounded text-sm font-medium uppercase tracking-wider disabled:opacity-40"
            >
              {run.isPending ? "Generating…" : "Generate"}
            </button>
          </div>

          {run.isError && (
            <div className="text-sm text-red-400 font-mono border border-red-500/30 bg-red-500/5 p-3 rounded">
              {(run.error as Error).message}
            </div>
          )}
          {run.data && (
            <div className="border border-border rounded p-4 space-y-2">
              <div className="text-xs font-mono text-muted-foreground">
                {run.data.provider} · {run.data.model} · {run.data.credits_used} cr · {run.data.duration_ms}ms
              </div>
              {run.data.output_text && <pre className="whitespace-pre-wrap text-sm">{run.data.output_text}</pre>}
              {run.data.output_url?.startsWith("data:audio") && <audio controls src={run.data.output_url} />}
              {run.data.output_url && !run.data.output_url.startsWith("data:audio") && (
                modality === "video"
                  ? <video controls src={run.data.output_url} className="w-full rounded" />
                  : <img src={run.data.output_url} alt="" className="w-full rounded" />
              )}
              {run.data.fallbacks_attempted?.length > 0 && (
                <details className="text-xs text-muted-foreground font-mono">
                  <summary>fallback log</summary>
                  <pre>{run.data.fallbacks_attempted.join("\n")}</pre>
                </details>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Recent generations</h2>
          <div className="space-y-2">
            {history.data?.map((g) => (
              <div key={g.id} className="flex items-center gap-3 text-sm border border-border rounded p-2">
                <span className="text-xs font-mono px-2 py-0.5 bg-accent rounded">{g.modality}</span>
                <span className="text-xs font-mono text-muted-foreground">{g.provider}</span>
                <span className="flex-1 truncate">{g.prompt}</span>
                <span className={`text-xs font-mono ${g.status === "succeeded" ? "text-green-400" : g.status === "failed" ? "text-red-400" : "text-yellow-400"}`}>
                  {g.status}
                </span>
                <span className="text-xs font-mono text-muted-foreground">{g.credits_used}cr</span>
              </div>
            ))}
            {history.data?.length === 0 && <div className="text-sm text-muted-foreground">No generations yet.</div>}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
