import { Link } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getClientId } from "@/lib/client-id";
import { Plus, Film, Clock, CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import AppLayout from "@/components/AppLayout";

type Project = {
  id: string;
  title: string;
  status: string;
  provider: string;
  created_at: string;
  error_message: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  draft:     { label: "Draft",     cls: "text-muted-foreground",                       Icon: Circle },
  queued:    { label: "Queued",    cls: "text-yellow-400",                             Icon: Clock },
  running:   { label: "Rendering", cls: "text-blue-400",                              Icon: Loader2 },
  succeeded: { label: "Done",      cls: "text-emerald-400",                            Icon: CheckCircle2 },
  failed:    { label: "Failed",    cls: "text-destructive",                            Icon: XCircle },
};

export function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.cls}`}>
      <cfg.Icon className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
      {cfg.label}
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
      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Library</p>
            <h1 className="mt-2 font-display text-5xl">Your projects</h1>
          </div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>

        <div className="mt-10">
          {projects === null ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  return (
    <Link
      to={`/projects/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card transition hover:border-primary/50 hover:shadow-lg hover:shadow-black/30"
    >
      {/* Thumbnail */}
      <div className="grain relative aspect-video bg-gradient-to-br from-muted/70 via-background to-muted/30 flex items-center justify-center">
        <Film className="h-8 w-8 text-muted-foreground/20" strokeWidth={1} />
        {p.status === "running" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {p.status === "succeeded" && (
          <div className="absolute bottom-2 right-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight group-hover:text-primary transition line-clamp-1">
            {p.title}
          </h3>
          <StatusPill status={p.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(p.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
          {p.provider ? ` · ${p.provider}` : ""}
        </p>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-24 text-center">
      <Film className="h-10 w-10 text-muted-foreground/30" strokeWidth={1} />
      <h2 className="mt-5 font-display text-2xl">No takes yet</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Start your first project — five inputs, one rendered performance.
      </p>
      <Link
        to="/studio"
        className="mt-7 inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
      >
        <Plus className="h-4 w-4" /> Start a project
      </Link>
    </div>
  );
}
