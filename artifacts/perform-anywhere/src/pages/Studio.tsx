import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, X, CheckCircle2 } from "lucide-react";
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
      <main className="mx-auto max-w-5xl px-6 py-14">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
            Direct your <span style={{ color: "oklch(0.65 0.30 330)" }}>shoot.</span>
          </h1>
          <p className="mt-3 text-white/50 text-lg">
            Drop references → write direction → generate. That's it.
          </p>
        </div>

        {/* Step bar */}
        <div className="mb-10 flex items-center gap-2">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <button
                onClick={() => s.n < step && setStep(s.n)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  step === s.n
                    ? "text-white"
                    : s.n < step
                    ? "text-white/40 hover:text-white/70 cursor-pointer"
                    : "text-white/20 cursor-not-allowed"
                }`}
                style={step === s.n ? { background: "oklch(0.58 0.26 290 / 0.35)", border: "1px solid oklch(0.58 0.26 290 / 0.5)" } : {}}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  step === s.n ? "text-white" : s.n < step ? "text-white/40" : "text-white/20"
                }`}
                  style={step === s.n ? { background: "oklch(0.65 0.30 330)" } : {}}
                >
                  {s.n < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.n}
                </span>
                {s.label}
              </button>
              {i < WIZARD_STEPS.length - 1 && (
                <span className="text-white/20 text-xs">›</span>
              )}
            </div>
          ))}
        </div>

        {/* Title (step 1 only) */}
        {step === 1 && (
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2" htmlFor="title">
              Project title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full max-w-md rounded-xl px-4 py-2.5 text-sm text-white outline-none transition focus:ring-2"
              style={{
                background: "oklch(0.16 0.06 285)",
                border: "1px solid oklch(0.30 0.08 285 / 0.6)",
              }}
            />
          </div>
        )}

        {/* Step 1: Assets */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Dropzone kind="performance" label="Performance video" hint="≤ 30 s · MP4, MOV, WebM" accept="video/*" file={files.performance} onChange={(f) => setFile("performance", f)} required badge="01" />
              <Dropzone kind="identity"    label="Identity photo"    hint="Clear face · JPG, PNG"   accept="image/*" file={files.identity}    onChange={(f) => setFile("identity", f)}    required badge="02" />
              <Dropzone kind="outfit"      label="Outfit reference"  hint="Optional · clothing"     accept="image/*" file={files.outfit}      onChange={(f) => setFile("outfit", f)}             badge="03" />
              <Dropzone kind="scene"       label="Scene reference"   hint="Optional · environment"  accept="image/*" file={files.scene}       onChange={(f) => setFile("scene", f)}              badge="04" />
            </div>
            <p className="text-xs text-white/30">
              Performance video and identity photo are required to continue.
            </p>
          </div>
        )}

        {/* Step 2: Direction */}
        {step === 2 && (
          <div className="space-y-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">05 · Style direction</p>
              <p className="text-sm text-white/50">Describe the mood, lighting, and look. Tap a chip to add it.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STYLE_CHIPS.map((s) => (
                <button key={s} type="button"
                  onClick={() => setStylePrompt((p) => p ? `${p}, ${s.toLowerCase()}` : s)}
                  className="rounded-full px-3 py-1 text-xs font-medium text-white/60 transition hover:text-white"
                  style={{ background: "oklch(0.18 0.07 285)", border: "1px solid oklch(0.30 0.08 285 / 0.5)" }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2" htmlFor="scene-notes">Scene notes</label>
                <textarea id="scene-notes" rows={5}
                  placeholder="e.g. neon Tokyo back-alley after rain, 2am, reflective puddles"
                  value={scenePrompt} onChange={(e) => setScenePrompt(e.target.value)}
                  className="block w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition focus:ring-2 placeholder:text-white/20"
                  style={{ background: "oklch(0.16 0.06 285)", border: "1px solid oklch(0.30 0.08 285 / 0.5)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2" htmlFor="style-notes">Visual style</label>
                <textarea id="style-notes" rows={5}
                  placeholder="e.g. handheld 35mm, teal-orange grade, soft grain, anamorphic flares"
                  value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)}
                  className="block w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition focus:ring-2 placeholder:text-white/20"
                  style={{ background: "oklch(0.16 0.06 285)", border: "1px solid oklch(0.30 0.08 285 / 0.5)" }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" onClick={handleEnhance} disabled={enhancing}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
                style={{ background: "oklch(0.58 0.26 290 / 0.3)", border: "1px solid oklch(0.58 0.26 290 / 0.5)" }}
              >
                {enhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {enhancing ? "Enhancing…" : "Enhance with AI"}
              </button>
              <p className="text-xs text-white/30">Optionally let AI write a cinematic prompt from your notes.</p>
            </div>
            {enhanced && (
              <div className="rounded-2xl p-5" style={{ background: "oklch(0.58 0.26 290 / 0.12)", border: "1px solid oklch(0.58 0.26 290 / 0.3)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "oklch(0.65 0.30 330)" }}>AI-enhanced prompt</p>
                <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{enhanced}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl overflow-hidden divide-y" style={{ background: "oklch(0.14 0.05 285)", border: "1px solid oklch(0.28 0.07 285 / 0.5)", divideColor: "oklch(0.28 0.07 285 / 0.3)" }}>
              <ReviewRow label="Title"        value={title} />
              <ReviewRow label="Performance"  value={files.performance?.file.name ?? "—"} />
              <ReviewRow label="Identity"     value={files.identity?.file.name ?? "—"} />
              <ReviewRow label="Outfit"       value={files.outfit?.file.name ?? "—"} />
              <ReviewRow label="Scene ref"    value={files.scene?.file.name ?? "—"} />
              <ReviewRow label="Scene notes"  value={scenePrompt || "—"} />
              <ReviewRow label="Style notes"  value={stylePrompt || "—"} />
              {enhanced && <ReviewRow label="AI prompt" value={enhanced} />}
            </div>
            <p className="text-xs text-white/30">
              Rendering typically takes 1–6 minutes via Kling. You can leave the page — the project page updates live.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-10 flex justify-between border-t pt-7" style={{ borderColor: "oklch(0.28 0.07 285 / 0.3)" }}>
          <button type="button"
            onClick={() => step > 1 ? setStep(step - 1) : navigate("/projects")}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white/50 transition hover:text-white"
            style={{ border: "1px solid oklch(0.28 0.07 285 / 0.5)" }}
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>

          {step < 3 ? (
            <button type="button" onClick={() => setStep(step + 1)} disabled={!canGoNext}
              className="rounded-xl px-7 py-2.5 text-sm font-bold text-white transition disabled:opacity-30"
              style={{ background: "oklch(0.58 0.26 290)" }}
            >
              Continue →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-sm font-bold text-white transition disabled:opacity-40"
              style={{ background: "oklch(0.65 0.30 330)" }}
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Render performance ✦"}
            </button>
          )}
        </div>
      </main>
    </AppLayout>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 px-5 py-3.5">
      <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-widest text-white/30 pt-0.5">{label}</span>
      <span className="text-sm text-white/80 break-all line-clamp-3">{value}</span>
    </div>
  );
}

function Dropzone({ label, hint, accept, file, onChange, required, badge, kind }: {
  label: string; hint: string; accept: string;
  file: StagedFile | null; onChange: (f: File | null) => void;
  required?: boolean; badge: string; kind: string;
}) {
  const [dragging, setDragging] = useState(false);
  const isVideo = accept.startsWith("video");

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    const acceptedTypes = accept === "video/*"
      ? ["video/mp4", "video/quicktime", "video/webm"]
      : ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!acceptedTypes.some((t) => f.type === t) && !f.type.startsWith(accept.replace("*", ""))) {
      toast.error(`Please drop a ${isVideo ? "video" : "image"} file`);
      return;
    }
    onChange(f);
  }, [accept, isVideo, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: dragging
          ? "oklch(0.58 0.26 290 / 0.15)"
          : "oklch(0.14 0.05 285)",
        border: dragging
          ? "1.5px solid oklch(0.58 0.26 290 / 0.8)"
          : "1.5px solid oklch(0.28 0.07 285 / 0.5)",
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          {/* Pink pill badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "oklch(0.65 0.30 330)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            {badge}
          </span>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {label}
              {required && <span className="ml-1" style={{ color: "oklch(0.65 0.30 330)" }}>*</span>}
            </p>
            <p className="text-[11px] text-white/35 mt-0.5">{hint}</p>
          </div>
        </div>
        {file && (
          <button type="button" onClick={() => onChange(null)}
            className="rounded-full p-1 transition hover:bg-white/10 text-white/40 hover:text-white"
            aria-label="remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <label className="block cursor-pointer mx-3 mb-3 overflow-hidden rounded-xl transition-all">
        {file ? (
          isVideo
            ? <video src={file.preview} className="aspect-video w-full object-cover rounded-xl" muted playsInline />
            : <img src={file.preview} alt={kind} className="aspect-video w-full object-cover rounded-xl" />
        ) : (
          <div
            className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl transition-all"
            style={{ background: dragging ? "oklch(0.58 0.26 290 / 0.10)" : "oklch(0.10 0.04 290 / 0.6)", border: "1.5px dashed oklch(0.40 0.10 285 / 0.4)" }}
          >
            <Upload className="h-5 w-5 text-white/25" />
            <span className="text-xs text-white/25 font-medium">
              {dragging ? "Drop here" : "Click or drag to upload"}
            </span>
          </div>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ""; }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }}
        />
      </label>
    </div>
  );
}
