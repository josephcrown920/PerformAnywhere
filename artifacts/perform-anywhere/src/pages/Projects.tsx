import { Link } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
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
  output_path: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  draft:     { label: "Draft",     color: "#ffffff55", Icon: Circle },
  queued:    { label: "Queued",    color: "#facc15",   Icon: Clock },
  running:   { label: "Rendering", color: "#60a5fa",   Icon: Loader2 },
  succeeded: { label: "Done",      color: "#34d399",   Icon: CheckCircle2 },
  failed:    { label: "Failed",    color: "#f87171",   Icon: XCircle },
};

export function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold`} style={{ color: cfg.color }}>
      <cfg.Icon className={`h-3 w-3 ${status === "running" ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    const cid = getClientId();
    setClientId(cid);
    supabase
      .from("projects")
      .select("id,title,status,provider,created_at,error_message,output_path")
      .eq("client_id", cid)
      .order("created_at", { ascending: false })
      .then(({ data }) => setProjects((data as Project[]) ?? []));
  }, []);

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-1" style={{ color: "oklch(0.65 0.30 330)" }}>
              Generations
            </p>
            <h1 className="text-4xl font-bold text-white">Your library</h1>
          </div>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "oklch(0.65 0.30 330)" }}
          >
            <Plus className="h-4 w-4" />
            New render
          </Link>
        </div>

        {projects === null ? (
          <div className="flex items-center gap-2 text-white/40 py-20 justify-center">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} clientId={clientId} />
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}

function ProjectCard({ project: p, clientId }: { project: Project; clientId: string }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (p.status === "succeeded" && p.output_path) {
      api.getRenderSignedUrl(p.output_path, clientId)
        .then((r) => setThumbUrl(r.url))
        .catch(() => {});
    }
  }, [p.output_path, p.status, clientId]);

  return (
    <Link
      to={`/projects/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl transition-all hover:scale-[1.02]"
      style={{ background: "oklch(0.14 0.05 285)", border: "1.5px solid oklch(0.28 0.07 285 / 0.5)" }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden" style={{ background: "oklch(0.10 0.04 290)" }}>
        {thumbUrl ? (
          <video
            src={thumbUrl}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay muted playsInline loop
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {p.status === "running" || p.status === "queued" ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin" style={{ color: "oklch(0.58 0.26 290)" }} />
                <span className="text-xs text-white/40">Rendering…</span>
              </div>
            ) : p.status === "failed" ? (
              <XCircle className="h-8 w-8 text-red-400/40" />
            ) : (
              <Film className="h-8 w-8 text-white/10" strokeWidth={1} />
            )}
          </div>
        )}

        {/* Status badge overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm"
            style={{ background: "oklch(0.10 0.04 290 / 0.75)" }}
          >
            <StatusPill status={p.status} />
          </span>
        </div>

        {/* Provider badge */}
        {p.provider && (
          <div className="absolute top-2.5 right-2.5">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white/60 backdrop-blur-sm capitalize"
              style={{ background: "oklch(0.10 0.04 290 / 0.6)" }}
            >
              {p.provider}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3.5">
        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-1 group-hover:text-purple-300 transition">
          {p.title}
        </h3>
        <p className="text-[11px] text-white/35 mt-1">
          {new Date(p.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
        </p>
        {p.status === "failed" && p.error_message && (
          <p className="text-[11px] text-red-400/70 mt-1 line-clamp-1">{p.error_message}</p>
        )}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-2xl py-24 text-center"
      style={{ border: "1.5px dashed oklch(0.28 0.07 285 / 0.4)" }}
    >
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "oklch(0.58 0.26 290 / 0.15)" }}>
        <Film className="h-8 w-8 text-white/20" strokeWidth={1} />
      </div>
      <h2 className="text-2xl font-bold text-white">No generations yet</h2>
      <p className="mt-2 max-w-xs text-sm text-white/40">
        Drop your references, write your direction, and Aurora renders a new take.
      </p>
      <Link
        to="/studio"
        className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
        style={{ background: "oklch(0.65 0.30 330)" }}
      >
        <Plus className="h-4 w-4" /> Start your first render
      </Link>
    </div>
  );
}
