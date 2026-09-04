import { useEffect, useState } from "react";
import { api, type ProviderStatus } from "@/lib/api";
import { getClientId, resetClientId } from "@/lib/client-id";
import { toast } from "sonner";
import { Check, AlertCircle, Loader2, KeyRound, User, RotateCcw } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function Account() {
  const [providers, setProviders] = useState<ProviderStatus[] | null>(null);
  const [clientId, setCid] = useState<string>("");

  useEffect(() => {
    setCid(getClientId());
    api.providerStatus()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  function handleReset() {
    if (!confirm("Reset session? Your current projects will no longer be visible from this browser.")) return;
    const next = resetClientId();
    setCid(next);
    toast.success("Session reset — new identity generated");
    setTimeout(() => window.location.reload(), 600);
  }

  const configured = providers?.filter((p) => p.configured) ?? [];
  const unconfigured = providers?.filter((p) => !p.configured) ?? [];

  return (
    <AppLayout>
      <main className="mx-auto max-w-3xl px-6 py-14 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Session</p>
          <h1 className="mt-2 font-display text-5xl">Settings</h1>
        </div>

        {/* Session card */}
        <section className="rounded-lg border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/30 px-6 py-4">
            <User className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h2 className="font-semibold">Anonymous session</h2>
          </div>
          <div className="px-6 py-5 space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              No account is required. Projects are tied to this browser via a UUID stored
              in localStorage. Clearing browser data or resetting the session hides them
              from this device.
            </p>
            <div className="rounded border border-border/40 bg-background px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Session ID</p>
              <p className="font-mono text-xs break-all text-foreground/80">{clientId || "—"}</p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset session
            </button>
          </div>
        </section>

        {/* Provider keys */}
        <section className="rounded-lg border border-border/50 bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border/30 px-6 py-4">
            <KeyRound className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <h2 className="font-semibold">Provider keys</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-muted-foreground mb-5">
              API keys are server-side environment variables. Add them in the Replit Secrets panel to enable each provider.
            </p>

            {providers === null ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Checking providers…
              </div>
            ) : (
              <div className="space-y-1">
                {configured.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground pt-2 pb-1">Active</p>
                    {configured.map((p) => <ProviderRow key={p.id} provider={p} />)}
                  </>
                )}
                {unconfigured.length > 0 && (
                  <>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground pt-4 pb-1">Not configured</p>
                    {unconfigured.map((p) => <ProviderRow key={p.id} provider={p} />)}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Database setup */}
        <section className="rounded-lg border border-amber-500/20 bg-amber-500/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-500/15">
            <h2 className="font-semibold text-amber-300/90 text-sm">Database setup required</h2>
          </div>
          <div className="px-6 py-5 space-y-3 text-sm text-muted-foreground">
            <p>
              The render pipeline requires four columns that may be missing from your Supabase database.
              Without them, renders silently fail or disappear from the library.
            </p>
            <ol className="list-decimal ml-5 space-y-1 text-xs leading-relaxed">
              <li>Open your <a href="https://supabase.com/dashboard/project/dgtnkkarlwufxawfaybb/sql/new" target="_blank" rel="noopener noreferrer" className="underline text-amber-300/80 hover:text-amber-300">Supabase SQL editor</a></li>
              <li>Paste and run the contents of <code className="rounded bg-muted px-1 py-0.5 text-[11px]">artifacts/api-server/migrations/002_render_pipeline_columns.sql</code></li>
            </ol>
            <p className="text-xs">This is a one-time <code className="rounded bg-muted px-1 py-0.5">ALTER TABLE … ADD COLUMN IF NOT EXISTS</code> — safe to run more than once.</p>
          </div>
        </section>

        {/* Vast.ai status */}
        <section className="rounded-lg border border-border/50 bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30">
            <h2 className="font-semibold text-sm">Vast.ai GPU — pending deployment</h2>
          </div>
          <div className="px-6 py-5 text-sm text-muted-foreground space-y-2">
            <p>The Vast.ai API key is configured and the CLI is authenticated. Video cannot route through Vast until a serverless worker is deployed and its endpoint URL is provided.</p>
            <p className="text-xs">To enable: deploy a video-generation worker on Vast.ai (or RunPod), then add <code className="rounded bg-muted px-1 py-0.5">RUNPOD_API_KEY</code> + <code className="rounded bg-muted px-1 py-0.5">RUNPOD_ENDPOINT_ID</code> to Secrets. The render chain will pick it up automatically.</p>
          </div>
        </section>

        {/* Hint */}
        <p className="text-xs text-muted-foreground px-1">
          fal.ai is connected via Replit connector and powers video, OmniHuman, and Kling LipSync.
          Add <code className="rounded bg-muted px-1 py-0.5">KLING_ACCESS_KEY</code> +{" "}
          <code className="rounded bg-muted px-1 py-0.5">KLING_SECRET_KEY</code> for direct Kling,
          and <code className="rounded bg-muted px-1 py-0.5">PAYSTACK_SECRET_KEY</code> to accept payments.
        </p>
      </main>
    </AppLayout>
  );
}

function ProviderRow({ provider: p }: { provider: ProviderStatus }) {
  return (
    <div className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-accent/30 transition">
      <div>
        <p className="text-sm font-medium">{p.label}</p>
        <p className="text-xs font-mono text-muted-foreground">{p.id}</p>
      </div>
      {p.configured ? (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
          <Check className="h-3.5 w-3.5" /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <AlertCircle className="h-3.5 w-3.5" /> Not set
        </span>
      )}
    </div>
  );
}
