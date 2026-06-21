import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import { StatusPill } from "./Projects";
import { ArrowLeft, Download, RotateCw } from "lucide-react";
import { toast } from "sonner";
import AppLayout from "@/components/AppLayout";

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  provider: string;
  scene_prompt: string | null;
  style_prompt: string | null;
  enhanced_prompt: string | null;
  error_message: string | null;
  created_at: string;
};

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

  const { data: status } = useQuery({
    queryKey: ["render-status", id, clientId],
    queryFn: () => api.pollRender({ clientId, projectId: id }),
    enabled: !!clientId,
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "succeeded" || s === "failed" ? false : 5000;
    },
  });

  useEffect(() => {
    if (status?.status === "succeeded" && status.outputPath) {
      api.getRenderSignedUrl(status.outputPath, clientId).then((r) => setVideoUrl(r.url));
      supabase.from("projects").select("*").eq("id", id).single()
        .then(({ data }) => setProject(data as ProjectRow));
    }
  }, [status?.status, status?.outputPath, id]);

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
        <div className="mx-auto max-w-6xl px-6 py-12 text-muted-foreground">Loading…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link to="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl md:text-5xl">{project.title}</h1>
            <p className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <StatusPill status={project.status} /> · {project.provider} ·{" "}
              {new Date(project.created_at).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="rounded border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-destructive hover:text-destructive"
          >
            Delete
          </button>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <aside className="space-y-6">
            <h2 className="font-display text-xl">Inputs</h2>
            <div className="grid grid-cols-2 gap-3">
              {(["performance", "identity", "outfit", "scene"] as const).map((kind) => {
                const url = assetUrls[kind];
                const hasAsset = assets.find((a) => a.kind === kind);
                return (
                  <div key={kind} className="rounded border border-border bg-card p-2">
                    <p className="px-1 pb-1 text-xs uppercase tracking-widest text-muted-foreground">{kind}</p>
                    {url ? (
                      kind === "performance" ? (
                        <video src={url} className="aspect-video w-full rounded object-cover" muted playsInline controls />
                      ) : (
                        <img src={url} alt={kind} className="aspect-video w-full rounded object-cover" />
                      )
                    ) : (
                      <div className="flex aspect-video items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                        {hasAsset ? "…" : "—"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {project.enhanced_prompt && (
              <div>
                <h2 className="font-display text-xl">Prompt</h2>
                <p className="mt-2 whitespace-pre-wrap rounded border border-border bg-card p-4 text-sm">
                  {project.enhanced_prompt}
                </p>
              </div>
            )}
          </aside>

          <section>
            <h2 className="font-display text-xl">Output</h2>
            <div className="mt-3 overflow-hidden rounded border border-border bg-card">
              {project.status === "succeeded" && videoUrl ? (
                <video src={videoUrl} controls className="aspect-video w-full" />
              ) : project.status === "failed" ? (
                <div className="grain flex aspect-video flex-col items-center justify-center p-6 text-center">
                  <p className="font-display text-2xl text-destructive">Render failed</p>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    {project.error_message || status?.error || "Unknown error"}
                  </p>
                </div>
              ) : (
                <div className="grain flex aspect-video flex-col items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <p className="mt-4 font-display text-xl">
                    {status?.status === "running" ? "Rendering…" : "Queued"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Typically 1–6 minutes. You can leave this page.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {project.status === "succeeded" && videoUrl && (
                <a
                  href={videoUrl}
                  download={`${project.title}.mp4`}
                  className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" /> Download MP4
                </a>
              )}
              {(project.status === "failed" || project.status === "succeeded") && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Try another provider:</span>
                  {(["runway", "kling", "hailuo"] as const)
                    .filter((p) => p !== project.provider)
                    .map((p) => (
                      <button
                        key={p}
                        onClick={() => handleRetry(p)}
                        className="inline-flex items-center gap-1 rounded border border-border px-3 py-1 text-xs hover:border-primary"
                      >
                        <RotateCw className="h-3 w-3" />
                        {p}
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
