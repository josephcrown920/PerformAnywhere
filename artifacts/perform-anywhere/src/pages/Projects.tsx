import { Link } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getClientId } from "@/lib/client-id";
import { Plus, Film } from "lucide-react";
import AppLayout from "@/components/AppLayout";

type Project = {
  id: string;
  title: string;
  status: string;
  provider: string;
  created_at: string;
  error_message: string | null;
};

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    queued: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    running: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    succeeded: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    failed: "bg-destructive/20 text-destructive-foreground border-destructive/40",
  };
  return (
    <span className={`rounded-full border border-border px-2 py-0.5 text-xs ${map[status] ?? ""}`}>
      {status}
    </span>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    const clientId = getClientId();
    supabase
      .from("projects")
      .select("id,title,status,provider,created_at,error_message")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProjects((data as Project[]) ?? []));
  }, []);

  return (
    <AppLayout>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Library</p>
            <h1 className="mt-2 font-display text-5xl">Your projects</h1>
          </div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>

        {projects === null ? (
          <div className="mt-12 text-muted-foreground">Loading…</div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="group block rounded border border-border bg-card transition hover:border-primary"
              >
                <div className="grain aspect-video rounded-t bg-gradient-to-br from-muted to-background" />
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">{p.title}</h3>
                    <StatusPill status={p.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleString()} · {p.provider}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}

function EmptyState() {
  return (
    <div className="mt-16 rounded border border-dashed border-border p-16 text-center">
      <Film className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 font-display text-2xl">No takes yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Start your first project — five inputs, one rendered performance.
      </p>
      <Link
        to="/studio"
        className="mt-6 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Start a project
      </Link>
    </div>
  );
}
