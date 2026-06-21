import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import { toast } from "sonner";
import { Sparkles, Upload, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";

type AssetKind = "performance" | "identity" | "outfit" | "scene";
type StagedFile = { file: File; preview: string };

const STYLE_CHIPS = [
  "Cinematic 35mm", "Anime", "Film noir", "Neon cyberpunk",
  "Dreamy editorial", "Documentary", "Music video",
];

export default function Studio() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("Untitled performance");
  const [files, setFiles] = useState<Record<AssetKind, StagedFile | null>>({
    performance: null, identity: null, outfit: null, scene: null,
  });
  const [scenePrompt, setScenePrompt] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [busy, setBusy] = useState(false);

  function setFile(kind: AssetKind, f: File | null) {
    setFiles((prev) => {
      if (prev[kind]) URL.revokeObjectURL(prev[kind]!.preview);
      return { ...prev, [kind]: f ? { file: f, preview: URL.createObjectURL(f) } : null };
    });
  }

  async function handleEnhance() {
    setBusy(true);
    try {
      const { prompt } = await api.enhancePrompt({
        scenePrompt,
        stylePrompt,
        hasOutfit: !!files.outfit,
        hasScene: !!files.scene,
        hasIdentity: !!files.identity,
      });
      setEnhanced(prompt);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't enhance prompt");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    if (!files.performance || !files.identity) {
      toast.error("Performance video and identity photo are required");
      return;
    }
    setBusy(true);
    try {
      const clientId = getClientId();

      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          client_id: clientId,
          title,
          status: "draft",
          scene_prompt: scenePrompt || null,
          style_prompt: stylePrompt || null,
          enhanced_prompt: enhanced || null,
        })
        .select("id")
        .single();
      if (pErr || !project) throw new Error(pErr?.message ?? "Could not create project");

      for (const kind of ["performance", "identity", "outfit", "scene"] as AssetKind[]) {
        const staged = files[kind];
        if (!staged) continue;
        const ext = staged.file.name.split(".").pop() ?? "bin";
        const path = `${clientId}/${project.id}/${kind}.${ext}`;
        const { error: upErr } = await supabase.storage.from("uploads").upload(path, staged.file, {
          contentType: staged.file.type,
          upsert: true,
        });
        if (upErr) throw new Error(`Upload ${kind} failed: ${upErr.message}`);
        const { error: aErr } = await supabase.from("project_assets").upsert(
          { project_id: project.id, client_id: clientId, kind, storage_path: path, mime_type: staged.file.type },
          { onConflict: "project_id,kind" },
        );
        if (aErr) throw new Error(aErr.message);
      }

      await api.startRender({ clientId, projectId: project.id });
      toast.success("Render queued");
      navigate(`/projects/${project.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">New project</p>
        <h1 className="mt-2 font-display text-5xl">Compose a performance</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Five inputs. We'll pass them to the right model and render a new take that follows
          your original timing and motion.
        </p>

        <div className="mt-10 space-y-10">
          <section>
            <label className="block text-sm font-medium" htmlFor="title">Project title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 block w-full max-w-md rounded border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
            />
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <Dropzone kind="performance" label="01 · Performance video" hint="≤ 30 seconds. Body, face, timing." accept="video/*" file={files.performance} onChange={(f) => setFile("performance", f)} required />
            <Dropzone kind="identity"    label="02 · Identity photo"    hint="Clear shot of your face."           accept="image/*" file={files.identity}    onChange={(f) => setFile("identity", f)}    required />
            <Dropzone kind="outfit"      label="03 · Outfit reference"  hint="Optional clothing image."           accept="image/*" file={files.outfit}      onChange={(f) => setFile("outfit", f)} />
            <Dropzone kind="scene"       label="04 · Scene reference"   hint="Optional setting / background."     accept="image/*" file={files.scene}       onChange={(f) => setFile("scene", f)} />
          </div>

          <section className="space-y-4">
            <div>
              <p className="text-sm font-medium">05 · Style direction</p>
              <p className="text-sm text-muted-foreground">Describe the mood, lighting, and cinematic look.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STYLE_CHIPS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStylePrompt((p) => p ? `${p}, ${s.toLowerCase()}` : s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium" htmlFor="scene-notes">Scene notes</label>
                <textarea
                  id="scene-notes"
                  rows={4}
                  placeholder="e.g. neon Tokyo back-alley after rain, 2am"
                  value={scenePrompt}
                  onChange={(e) => setScenePrompt(e.target.value)}
                  className="mt-2 block w-full rounded border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="style-notes">Style notes</label>
                <textarea
                  id="style-notes"
                  rows={4}
                  placeholder="e.g. handheld 35mm, teal-orange grade, soft grain"
                  value={stylePrompt}
                  onChange={(e) => setStylePrompt(e.target.value)}
                  className="mt-2 block w-full rounded border border-border bg-input px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleEnhance}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm hover:border-primary disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              Enhance with AI
            </button>
            {enhanced && (
              <div className="rounded border border-primary/40 bg-primary/5 p-4 text-sm">
                <p className="text-xs uppercase tracking-widest text-primary">Final prompt</p>
                <p className="mt-2 whitespace-pre-wrap">{enhanced}</p>
              </div>
            )}
          </section>

          <div className="flex justify-end gap-3 border-t border-border pt-8">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="rounded border border-border px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={busy || !files.performance || !files.identity}
              className="rounded bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Render performance"}
            </button>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

function Dropzone({ label, hint, accept, file, onChange, required, kind }: {
  label: string; hint: string; accept: string;
  file: StagedFile | null; onChange: (f: File | null) => void;
  required?: boolean; kind: string;
}) {
  const isVideo = accept.startsWith("video");
  return (
    <div className="rounded border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {label} {required && <span className="text-primary">*</span>}
        </p>
        {file && (
          <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-foreground" aria-label="remove">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <label className="mt-3 block cursor-pointer overflow-hidden rounded border border-dashed border-border bg-background transition hover:border-primary">
        {file ? (
          isVideo
            ? <video src={file.preview} className="aspect-video w-full object-cover" muted playsInline />
            : <img src={file.preview} alt={kind} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center text-muted-foreground">
            <Upload className="h-6 w-6" />
            <span className="mt-2 text-xs">Click to upload</span>
          </div>
        )}
        <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
      </label>
    </div>
  );
}
