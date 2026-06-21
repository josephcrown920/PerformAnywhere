import { useEffect, useState } from "react";
import { api, type ProviderStatus } from "@/lib/api";
import { getClientId, resetClientId } from "@/lib/client-id";
import { toast } from "sonner";
import { Check, AlertCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function Account() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [clientId, setCid] = useState<string>("");

  useEffect(() => {
    api.providerStatus().then(setProviders).catch(() => setProviders([]));
    setCid(getClientId());
  }, []);

  function handleReset() {
    if (!confirm("Reset session? Your current projects will no longer be visible from this browser.")) return;
    const next = resetClientId();
    setCid(next);
    toast.success("Session reset");
    setTimeout(() => window.location.reload(), 500);
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">Session</p>
        <h1 className="mt-2 font-display text-5xl">Settings</h1>

        <section className="mt-10 rounded border border-border bg-card p-6">
          <h2 className="font-display text-xl">Anonymous session</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No account is required. Your projects are tied to this browser via a local session id.
            Clearing your browser data — or resetting the session — will hide them from this device.
          </p>
          <div className="mt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Session id</p>
            <p className="mt-1 font-mono text-xs break-all">{clientId || "—"}</p>
          </div>
          <button
            onClick={handleReset}
            className="mt-6 rounded border border-border px-4 py-2 text-sm hover:border-primary hover:bg-accent"
          >
            Reset session
          </button>
        </section>

        <section className="mt-8 rounded border border-border bg-card p-6">
          <h2 className="font-display text-xl">Provider keys</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            API keys are stored as server-side environment variables. Add them in the Replit secrets panel.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {providers.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.id}</p>
                </div>
                {p.configured ? (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
                    <Check className="h-4 w-4" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" /> Not configured
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </AppLayout>
  );
}
