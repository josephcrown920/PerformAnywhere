import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import { StatusPill } from "./Projects";
import { ArrowLeft, Download, RotateCw, CheckCircle2, Clock, Cpu, HardDrive, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  provider: string;
  selected_model: string | null;
  scene_prompt: string | null;
  style_prompt: string | null;
  enhanced_prompt: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

const MODEL_ETA_SEC: Record<string, number> = {
  "kling-v1-6-std": 150,
  "kling-v1-6-pro": 300,
  "hailuo":         240,
  "fal":            180,
};

const PIPELINE_STEPS = [
  { key: "upload",   label: "Upload",    Icon: HardDrive },
  { key: "queue",    label: "Queue",     Icon: Clock },
  { key: "render",   label: "AI Render", Icon: Cpu },
  { key: "download", label: "Download",  Icon: Download },
  { key: "done",     label: "Done",      Icon: Sparkles },
];

function statusToStep(status: string): number {
  switch (status) {
    case "draft":     return 0;
    case "queued":    return 1;
    case "running":   return 2;
    case "succeeded": return 4;
    case "failed":    return -1;
    default:          return 0;
  }
}

function RenderProgress({ project }: { project: ProjectRow }) {
  const [elapsed, setElapsed] = useState(0);
  const activeStep = statusToStep(project.status);
  const modelKey = project.selected_model ?? project.provider ?? "kling-v1-6-std";
  const etaSec = MODEL_ETA_SEC[modelKey] ?? 180;
  const pct = Math.min(100, Math.round((elapsed / etaSec) * 100));

  useEffect(() => {
    const created = new Date(project.created_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - created) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [project.created_at]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const remaining = Math.max(0, etaSec - elapsed);

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: "oklch(0.14 0.05 285)", border: "1.5px solid oklch(0.28 0.07 285 / 0.5)" }}
    >
      {/* Pipeline steps */}
      <div className="flex items-center gap-1">
        {PIPELINE_STEPS.map((step, i) => {
          const done = activeStep > i;
          const active = activeStep === i;
          return (
            <div key={step.key} className="flex items-center gap-1 flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                    active ? "animate-pulse" : ""
                  }`}
                  style={{
                    background: done ? "oklch(0.50 0.18 155 / 0.25)"
                      : active ? "oklch(0.58 0.26 290 / 0.3)"
                      : "oklch(0.20 0.05 285)",
                    border: done ? "1.5px solid oklch(0.50 0.18 155 / 0.6)"
                      : active ? "1.5px solid oklch(0.58 0.26 290 / 0.8)"
                      : "1.5px solid oklch(0.28 0.07 285 / 0.4)",
                  }}
                >
                  {done
                    ? <CheckCircle2 className="h-4 w-4" style={{ color: "oklch(0.65 0.20 155)" }} />
                    : <step.Icon className="h-3.5 w-3.5" style={{ color: active ? "oklch(0.75 0.22 290)" : "oklch(0.45 0.08 285)" }} />
                  }
                </div>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: done || active ? "oklch(0.75 0.10 285)" : "oklch(0.45 0.08 285)" }}>
                  {step.label}
                </span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="h-px flex-1 mb-5 mx-1 rounded-full transition-all"
                  style={{ background: done ? "oklch(0.50 0.18 155 / 0.5)" : "oklch(0.28 0.07 285 / 0.4)" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {project.status !== "succeeded" && project.status !== "failed" && (
        <div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "oklch(0.20 0.05 285)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, oklch(0.58 0.26 290), oklch(0.65 0.30 330))",
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px]" style={{ color: "oklch(0.55 0.08 285)" }}>
            <span>Elapsed: {fmt(elapsed)}</span>
            <span>{pct < 100 ? `~${fmt(remaining)} remaining` : "finishing up…"}</span>
          </div>
        </div>
      )}

      {/* Model badge */}
      {modelKey && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/30">Model:</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize text-white"
            style={{ background: "oklch(0.58 0.26 290 / 0.25)", border: "1px solid oklch(0.58 0.26 290 / 0.4)" }}
          >
            {modelKey}
          </span>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const [clientId, setClientId] = useState<string>("");
  const [project, setProject] = useState<ProjectRow | null>(null);
  const [assets, setAssets] = useState<{ kind: string; storage_path: string }[]>([]);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => { setClientId(getClientId()); }, []);

  useEffect(() => {
    if (!clientId) return;
    (async () => {
      const { data: p } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .eq("client_id", clientId)
        .single();
      setProject(p as ProjectRow);

      const { data: a } = await supabase
        .from("project_assets")
        .select("kind,storage_path")
        .eq("project_id", id);
      setAssets(a ?? []);

      const urls: Record<string, string> = {};
      for (const asset of (a ?? [])) {
        try {
          const { url } = await api.getAssetSignedUrl(asset.storage_path, clientId);
          urls[asset.kind] = url;
        } catch { /* ignore */ }
      }
      setAssetUrls(urls);
    })();
  }, [id, clientId]);

  const { data: pollStatus } = useQuery({
    queryKey: ["render-status", id, clientId],
    queryFn: () => api.pollRender({ clientId, projectId: id }),
    enabled: !!clientId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "succeeded" || s === "failed" ? false : 5000;
    },
  });

  useEffect(() => {
    if (pollStatus?.status === "succeeded" && pollStatus.outputPath) {
      api.getRenderSignedUrl(pollStatus.outputPath, clientId).then((r) => setVideoUrl(r.url));
      supabase.from("projects").select("*").eq("id", id).single()
        .then(({ data }) => setProject(data as ProjectRow));
    }
    if (pollStatus?.status && project?.status !== pollStatus.status) {
      supabase.from("projects").select("*").eq("id", id).single()
        .then(({ data }) => { if (data) setProject(data as ProjectRow); });
    }
  }, [pollStatus?.status, pollStatus?.outputPath, id]);

  async function handleRetry(provider: string) {
    try {
      await api.retryRender({ clientId, projectId: id, provider });
      toast.success(`Queued on ${provider} — rendering…`);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Retry failed");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    await supabase.from("projects").delete().eq("id", id).eq("client_id", clientId);
    navigate("/projects");
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl px-6 py-12 text-white/40">Loading…</div>
      </AppLayout>
    );
  }

  const isActive = project.status === "running" || project.status === "queued";
  const promptText = project.enhanced_prompt || project.scene_prompt || project.style_prompt;

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition">
          <ArrowLeft className="h-4 w-4" /> Library
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">{project.title}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/40">
              <StatusPill status={project.status} />
              {project.provider && <><span>·</span><span className="capitalize">{project.provider}</span></>}
              <span>·</span>
              <span>{new Date(project.created_at).toLocaleString()}</span>
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="rounded-xl px-4 py-2 text-sm text-white/40 transition hover:text-red-400"
            style={{ border: "1px solid oklch(0.28 0.07 285 / 0.5)" }}
          >
            Delete
          </button>
        </div>

        {/* Progress indicator — only when active */}
        {isActive && (
          <div className="mt-6">
            <RenderProgress project={project} />
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.5fr]">

          {/* Left: inputs */}
          <aside className="space-y-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/30">Reference inputs</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["performance", "identity", "outfit", "scene"] as const).map((kind) => {
                const url = assetUrls[kind];
                const hasAsset = assets.find((a) => a.kind === kind);
                return (
                  <div key={kind} className="rounded-xl overflow-hidden"
                    style={{ background: "oklch(0.14 0.05 285)", border: "1.5px solid oklch(0.28 0.07 285 / 0.4)" }}
                  >
                    <p className="px-2.5 pt-2 pb-1 text-[10px] uppercase tracking-widest text-white/30">{kind}</p>
                    {url ? (
                      kind === "performance" ? (
                        <video src={url} className="aspect-video w-full object-cover" muted playsInline autoPlay loop />
                      ) : (
                        <img src={url} alt={kind} className="aspect-video w-full object-cover" />
                      )
                    ) : (
                      <div className="flex aspect-video items-center justify-center text-xs text-white/20">
                        {hasAsset ? "…" : "—"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {promptText && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/30 mb-2">Prompt</h2>
                <p className="whitespace-pre-wrap rounded-xl p-4 text-sm text-white/70 leading-relaxed"
                  style={{ background: "oklch(0.14 0.05 285)", border: "1.5px solid oklch(0.28 0.07 285 / 0.4)" }}
                >
                  {promptText}
                </p>
              </div>
            )}
          </aside>

          {/* Right: output */}
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white/30 mb-3">Output</h2>

            <div className="overflow-hidden rounded-2xl"
              style={{ background: "oklch(0.12 0.04 285)", border: "1.5px solid oklch(0.28 0.07 285 / 0.4)" }}
            >
              {project.status === "succeeded" && videoUrl ? (
                <video src={videoUrl} controls className="aspect-video w-full" />
              ) : project.status === "failed" ? (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 p-8 text-center">
                  <p className="text-2xl font-bold text-red-400">Render failed</p>
                  <p className="max-w-sm text-sm text-white/40">
                    {project.error_message || pollStatus?.error || "An unknown error occurred."}
                  </p>
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-4">
                  <div
                    className="h-10 w-10 rounded-full border-2 animate-spin"
                    style={{ borderColor: "oklch(0.58 0.26 290 / 0.3)", borderTopColor: "oklch(0.65 0.30 330)" }}
                  />
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      {project.status === "running" ? "Rendering…" : "In queue"}
                    </p>
                    <p className="mt-1 text-sm text-white/35">You can leave this page safely.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              {project.status === "succeeded" && videoUrl && (
                <>
                  <a
                    href={videoUrl}
                    download={`${project.title}.mp4`}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "oklch(0.65 0.30 330)" }}
                  >
                    <Download className="h-4 w-4" /> Download MP4
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
                      const shareUrl = `${window.location.origin}${base}/r/${clientId}/${project.id}`;
                      navigator.clipboard.writeText(shareUrl)
                        .then(() => toast.success("Share link copied!", { description: "Anyone with this link can watch the render." }))
                        .catch(() => toast.error("Could not copy — try manually: " + shareUrl));
                    }}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-80"
                    style={{ background: "oklch(0.58 0.26 290 / 0.25)", border: "1px solid oklch(0.58 0.26 290 / 0.5)" }}
                  >
                    <Share2 className="h-4 w-4" /> Share link
                  </button>
                </>
              )}

              {(project.status === "failed" || project.status === "succeeded") && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-white/30">Try another model:</span>
                  {(["kling", "wan", "veo"] as const)
                    .filter((p) => p !== project.provider)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => handleRetry(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white/60 transition hover:text-white"
                        style={{ border: "1px solid oklch(0.28 0.07 285 / 0.5)" }}
                      >
                        <RotateCw className="h-3 w-3" /> {p}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
