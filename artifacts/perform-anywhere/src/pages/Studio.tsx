import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";

type AssetKind = "performance" | "identity" | "outfit" | "scene";
type StagedFile = { file: File; preview: string };

const STYLE_CHIPS = [
  "Cinematic 35mm", "Anime", "Film noir", "Neon cyberpunk",
  "Dreamy editorial", "Documentary", "Music video", "Golden hour",
];

const WIZARD_STEPS = [
  { n: 1, label: "Assets" },
  { n: 2, label: "Direction" },
  { n: 3, label: "Review" },
];

export default function Studio() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("Untitled performance");
  const [files, setFiles] = useState<Record<AssetKind, StagedFile | null>>({
    performance: null, identity: null, outfit: null, scene: null,
  });
  const [scenePrompt, setScenePrompt] = useState("");
  const [stylePrompt, setStylePrompt] = useState("");
  const [enhanced, setEnhanced] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function setFile(kind: AssetKind, f: File | null) {
    setFiles((prev) => {
      if (prev[kind]) URL.revokeObjectURL(prev[kind]!.preview);
      return { ...prev, [kind]: f ? { file: f, preview: URL.createObjectURL(f) } : null };
    });
  }

  async function handleEnhance() {
    setEnhancing(true);
    try {
      const { prompt } = await api.enhancePrompt({
        scenePrompt, stylePrompt,
        hasOutfit: !!files.outfit, hasScene: !!files.scene, hasIdentity: !!files.identity,
      });
      setEnhanced(prompt);
      toast.success("Prompt enhanced");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setEnhancing(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const clientId = getClientId();

      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          client_id: clientId, title, status: "draft",
          scene_prompt: scenePrompt || null,
          style_prompt: stylePrompt || null,
          enhanced_prompt: enhanced || null,
        })
        .select("id").single();
      if (pErr || !project) throw new Error(pErr?.message ?? "Could not create project");

      for (const kind of ["performance", "identity", "outfit", "scene"] as AssetKind[]) {
        const staged = files[kind];
        if (!staged) continue;
        const ext = staged.file.name.split(".").pop() ?? "bin";
        const path = `${clientId}/${project.id}/${kind}.${ext}`;
        const { error: upErr } = await supabase.storage.from("uploads").upload(path, staged.file, {
          contentType: staged.file.type, upsert: true,
        });
        if (upErr) throw new Error(`Upload ${kind}: ${upErr.message}`);
        await supabase.from("project_assets").upsert(
          { project_id: project.id, client_id: clientId, kind, storage_path: path, mime_type: staged.file.type },
          { onConflict: "project_id,kind" },
        );
      }

      await api.startRender({ clientId, projectId: project.id });
      toast.success("Render queued!");
      navigate(`/projects/${project.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const canGoNext = step === 1 ? (!!files.performance && !!files.identity) : true;

  return (
    <AppLayout>
      <main className="mx-auto max-w-4xl px-6 py-14">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">New project</p>
          <h1 className="mt-2 font-display text-5xl">Compose a performance</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Five inputs — we route them to the best AI video model and render a new take that preserves your timing.
          </p>
        </div>

        {/* Step bar */}
        <div className="mb-10 flex items-center gap-0">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-0">
              <button
                onClick={() => s.n < step && setStep(s.n)}
                className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm transition ${
                  step === s.n
                    ? "bg-primary text-primary-foreground font-semibold"
                    : s.n < step
                    ? "text-muted-foreground hover:text-foreground cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed"
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${step === s.n ? "bg-primary-foreground/20" : ""}`}>
                  {s.n}
                </span>
                {s.label}
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <span className="mx-1 text-border">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Title always visible */}
        {step === 1 && (
          <div className="mb-8">
            <label className="block text-sm font-medium mb-1.5" htmlFor="title">Project title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full max-w-sm rounded border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {/* Step 1: Assets */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Dropzone kind="performance" label="01 · Performance video" hint="≤ 30 seconds · MP4, MOV, WebM" accept="video/*" file={files.performance} onChange={(f) => setFile("performance", f)} required />
              <Dropzone kind="identity"    label="02 · Identity photo"    hint="Clear face shot · JPG, PNG"     accept="image/*" file={files.identity}    onChange={(f) => setFile("identity", f)}    required />
              <Dropzone kind="outfit"      label="03 · Outfit reference"  hint="Optional · clothing image"      accept="image/*" file={files.outfit}      onChange={(f) => setFile("outfit", f)} />
              <Dropzone kind="scene"       label="04 · Scene reference"   hint="Optional · setting / environment" accept="image/*" file={files.scene}    onChange={(f) => setFile("scene", f)} />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-primary">*</span> Performance video and identity photo are required.
            </p>
          </div>
        )}

        {/* Step 2: Direction */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium">05 · Style direction</p>
              <p className="mt-1 text-sm text-muted-foreground">Describe the mood, lighting, and look. Tap a chip to add it.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STYLE_CHIPS.map((s) => (
                <button key={s} type="button"
                  onClick={() => setStylePrompt((p) => p ? `${p}, ${s.toLowerCase()}` : s)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground transition"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="scene-notes">Scene notes</label>
                <textarea id="scene-notes" rows={5} placeholder="e.g. neon Tokyo back-alley after rain, 2am, reflective puddles"
                  value={scenePrompt} onChange={(e) => setScenePrompt(e.target.value)}
                  className="block w-full rounded border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" htmlFor="style-notes">Visual style</label>
                <textarea id="style-notes" rows={5} placeholder="e.g. handheld 35mm, teal-orange grade, soft grain, anamorphic flares"
                  value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)}
                  className="block w-full rounded border border-border bg-input px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
            </div>
            <div className="flex items-start gap-3">
              <button type="button" onClick={handleEnhance} disabled={enhancing}
                className="inline-flex items-center gap-2 rounded border border-border px-4 py-2 text-sm hover:border-primary disabled:opacity-50 transition"
              >
                {enhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {enhancing ? "Enhancing…" : "Enhance with AI"}
              </button>
              <p className="text-xs text-muted-foreground pt-2.5">Optionally let AI write a cinematic prompt from your notes.</p>
            </div>
            {enhanced && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
                <p className="text-xs uppercase tracking-widest text-primary mb-2">Final prompt</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{enhanced}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-lg border border-border/50 bg-card divide-y divide-border/30">
              <ReviewRow label="Title"   value={title} />
              <ReviewRow label="Performance" value={files.performance?.file.name ?? "—"} />
              <ReviewRow label="Identity"    value={files.identity?.file.name ?? "—"} />
              <ReviewRow label="Outfit"      value={files.outfit?.file.name ?? "—"} />
              <ReviewRow label="Scene ref"   value={files.scene?.file.name ?? "—"} />
              <ReviewRow label="Scene notes" value={scenePrompt || "—"} />
              <ReviewRow label="Style notes" value={stylePrompt || "—"} />
              {enhanced && <ReviewRow label="AI prompt" value={enhanced} />}
            </div>
            <p className="text-xs text-muted-foreground">
              Rendering typically takes 1–6 minutes via Kling. You can leave the page — the project page updates live.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex justify-between border-t border-border/40 pt-7">
          <button type="button"
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/projects")}
            className="rounded border border-border px-4 py-2 text-sm hover:bg-accent transition"
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>

          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} disabled={!canGoNext}
              className="rounded bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition"
            >
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-2 rounded bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Render performance"}
            </button>
          )}
        </div>
      </main>
    </AppLayout>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-5 py-3">
      <span className="w-28 shrink-0 text-xs uppercase tracking-wider text-muted-foreground pt-0.5">{label}</span>
      <span className="text-sm break-all line-clamp-3">{value}</span>
    </div>
  );
}

function Dropzone({ label, hint, accept, file, onChange, required, kind }: {
  label: string; hint: string; accept: string;
  file: StagedFile | null; onChange: (f: File | null) => void;
  required?: boolean; kind: string;
}) {
  const isVideo = accept.startsWith("video");
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 transition hover:border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium">
            {label} {required && <span className="text-primary">*</span>}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
        </div>
        {file && (
          <button type="button" onClick={() => onChange(null)} className="text-muted-foreground hover:text-foreground transition" aria-label="remove">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <label className="block cursor-pointer overflow-hidden rounded border border-dashed border-border/60 bg-background/50 transition hover:border-primary/50">
        {file ? (
          isVideo
            ? <video src={file.preview} className="aspect-video w-full object-cover" muted playsInline />
            : <img src={file.preview} alt={kind} className="aspect-video w-full object-cover" />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center text-muted-foreground/50">
            <Upload className="h-6 w-6 mb-2" />
            <span className="text-xs">Click to upload</span>
          </div>
        )}
        <input type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
      </label>
    </div>
  );
}
