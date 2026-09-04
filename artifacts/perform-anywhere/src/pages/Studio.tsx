import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import {
  saveDraftText, loadDraftText,
  saveDraftFile, deleteDraftFile, loadDraftFiles,
  clearDraft,
} from "@/lib/draft-storage";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, X, CheckCircle2, Zap, Star, History, Move3d, Ratio, Timer, AudioLines, LockKeyhole } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { WORKFLOWS, getWorkflow } from "@/lib/workflows";

type AssetKind = "performance" | "identity" | "outfit" | "scene" | "audio";
type StagedFile = { file: File; preview: string };

const FILE_LIMITS: Record<string, number> = { video: 200, image: 15, audio: 5 };

const STYLE_CHIPS = [
  "Cinematic 35mm", "Anime", "Film noir", "Neon cyberpunk",
  "Dreamy editorial", "Documentary", "Music video", "Golden hour",
];

const MODELS = [
  { id: "fal-seedance",    providerKey: "FAL_KEY", label: "Seedance 2",        badge: "Motion",  note: "fal.ai · director controls" },
  { id: "kling-v1-6-std",  providerKey: "KLING_ACCESS_KEY", label: "Kling v1.6",       badge: "Fast",    note: "~2–3 min · standard quality" },
  { id: "kling-v1-6-pro",  providerKey: "KLING_ACCESS_KEY", label: "Kling v1.6 Pro",    badge: "Quality", note: "~4–6 min · best quality" },
  { id: "fal-kling",       providerKey: "FAL_KEY", label: "Kling Pro (fal)",    badge: "Fal",     note: "fal.ai · text or image to video" },
  { id: "hailuo",          providerKey: "FAL_KEY", label: "Hailuo (Minimax)",  badge: "Alt",     note: "~3–5 min · different style" },
  { id: "fal-wan",         providerKey: "FAL_KEY", label: "Wan",                badge: "Fal",     note: "fal.ai · cinematic motion" },
] as const;

const COMING_MODELS = [
  { label: "Flux", note: "Available in Image Orchestrate via fal.ai" },
  { label: "Seedream", note: "Available in Image Orchestrate via fal.ai" },
  { label: "OmniHuman", note: "Needs identity image and audio input" },
  { label: "Kling LipSync", note: "Needs source video and audio input" },
] as const;

const WIZARD_STEPS = [
  { n: 1, label: "Assets" },
  { n: 2, label: "Direction" },
  { n: 3, label: "Review" },
];

export default function Studio() {
  const [, navigate] = useLocation();
  const [step, setStep]               = useState(1);
  const [title, setTitle]             = useState("Untitled performance");
  const [files, setFiles]             = useState<Record<AssetKind, StagedFile | null>>({
    performance: null, identity: null, outfit: null, scene: null, audio: null,
  });
  const [selectedModel, setSelectedModel] = useState("kling-v1-6-std");
  const [workflowId, setWorkflowId] = useState("");
  const [scenePrompt, setScenePrompt]     = useState("");
  const [stylePrompt, setStylePrompt]     = useState("");
  const [customPrompt, setCustomPrompt]   = useState("");
  const [enhanced, setEnhanced]           = useState("");
  const [duration, setDuration]           = useState<5 | 10>(5);
  const [aspectRatio, setAspectRatio]     = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [motionStrength, setMotionStrength] = useState(5);
  const [lipSync, setLipSync]               = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<Set<string> | null>(null);
  const [enhancing, setEnhancing]         = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Prevent browser navigation on accidental file drop ──────────────────────
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  useEffect(() => {
    api.providerStatus()
      .then((providers) => {
        const configured = new Set(providers.filter((provider) => provider.configured).map((provider) => provider.id));
        setConfiguredProviders(configured);
        setSelectedModel((current) => {
          const currentModel = MODELS.find((model) => model.id === current);
          if (currentModel && configured.has(currentModel.providerKey)) return current;
          return MODELS.find((model) => configured.has(model.providerKey))?.id ?? current;
        });
      })
      .catch(() => setConfiguredProviders(new Set()));
  }, []);

  // ── Restore draft on mount ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const text = loadDraftText();
      const fileRecords = await loadDraftFiles();

      // Only restore if there's actually something meaningful saved
      const hasTextContent = text && (
        (text.scenePrompt && text.scenePrompt.trim()) ||
        (text.stylePrompt && text.stylePrompt.trim()) ||
        (text.customPrompt && text.customPrompt.trim()) ||
        (text.enhanced && text.enhanced.trim()) ||
        (text.title && text.title !== "Untitled performance")
      );
      const hasFiles = fileRecords.length > 0;

      if (!hasTextContent && !hasFiles) return;

      if (hasTextContent && text) {
        setTitle(text.title);
        setSelectedModel(text.selectedModel);
        setWorkflowId(text.workflowId ?? "");
        setScenePrompt(text.scenePrompt);
        setStylePrompt(text.stylePrompt);
        setCustomPrompt(text.customPrompt);
        setEnhanced(text.enhanced);
        setStep(text.step ?? 1);
      }

      if (hasFiles) {
        const restored: Record<AssetKind, StagedFile | null> = {
          performance: null, identity: null, outfit: null, scene: null, audio: null,
        };
        for (const { kind, file, preview } of fileRecords) {
          restored[kind as AssetKind] = { file, preview };
        }
        setFiles(restored);
      }

      setDraftRestored(true);
      toast.success("Draft restored", {
        description: "Your previous session was saved automatically.",
        icon: "✦",
      });
    })();
  }, []);

  // ── Auto-save text state (only when there's real content) ────────────────────
  useEffect(() => {
    const hasContent = scenePrompt.trim() || stylePrompt.trim() || customPrompt.trim() || enhanced.trim() || title !== "Untitled performance";
    if (!hasContent) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveDraftText({ title, selectedModel, workflowId, scenePrompt, stylePrompt, customPrompt, enhanced, step, savedAt: Date.now() });
    }, 600);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, selectedModel, workflowId, scenePrompt, stylePrompt, customPrompt, enhanced, step]);

  // ── File state + IndexedDB ───────────────────────────────────────────────────
  function setFile(kind: AssetKind, f: File | null) {
    setFiles((prev) => {
      if (prev[kind]) URL.revokeObjectURL(prev[kind]!.preview);
      return { ...prev, [kind]: f ? { file: f, preview: URL.createObjectURL(f) } : null };
    });
    if (f) {
      saveDraftFile(kind, f).catch(() => {});
    } else {
      deleteDraftFile(kind).catch(() => {});
    }
  }

  async function handleClearDraft() {
    await clearDraft();
    setTitle("Untitled performance");
    setSelectedModel("kling-v1-6-std");
    setWorkflowId("");
    setScenePrompt(""); setStylePrompt(""); setCustomPrompt(""); setEnhanced("");
    setStep(1);
    Object.keys(files).forEach((k) => {
      const f = files[k as AssetKind];
      if (f) URL.revokeObjectURL(f.preview);
    });
    setFiles({ performance: null, identity: null, outfit: null, scene: null, audio: null });
    setLipSync(false);
    setDraftRestored(false);
    toast.success("Draft cleared");
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
      if (lipSync && (!files.performance || !files.audio)) {
        throw new Error("Lip sync requires both a performance video and an audio track.");
      }
      if (lipSync) {
        if (!["video/mp4", "video/quicktime"].includes(files.performance!.file.type)) {
          throw new Error("Lip-sync video must be an MP4 or MOV file.");
        }
        if (files.performance!.file.size > 100 * 1024 * 1024) {
          throw new Error("Lip-sync video must be 100 MB or smaller.");
        }
        if (files.audio!.file.size > 5 * 1024 * 1024) {
          throw new Error("Lip-sync audio must be 5 MB or smaller.");
        }
        const videoDuration = await getMediaDuration(files.performance!.file);
        const audioDuration = await getMediaDuration(files.audio!.file);
        if (videoDuration < 2 || videoDuration > 10) throw new Error("Lip-sync video must be between 2 and 10 seconds.");
        if (audioDuration < 2 || audioDuration > 60) throw new Error("Lip-sync audio must be between 2 and 60 seconds.");
      }
      const clientId = getClientId();
      const workflow = getWorkflow(workflowId);
      const directedPrompt = customPrompt || enhanced || [scenePrompt, stylePrompt].filter(Boolean).join(". ");
      const renderPrompt = [workflow?.promptPrefix, directedPrompt].filter(Boolean).join("\n\n") || null;

      const baseInsert = {
        client_id: clientId, title, status: "draft",
        scene_prompt: scenePrompt || null,
        style_prompt: stylePrompt || null,
        enhanced_prompt: renderPrompt,
      };
      let { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({ ...baseInsert, selected_model: selectedModel })
        .select("id").single();
      if (pErr?.message?.includes("selected_model")) {
        ({ data: project, error: pErr } = await supabase.from("projects").insert(baseInsert).select("id").single());
      }
      if (pErr || !project) throw new Error(pErr?.message ?? "Could not create project");

      for (const kind of ["performance", "identity", "outfit", "scene", "audio"] as AssetKind[]) {
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

      await api.startRender({
        clientId,
        projectId: project.id,
        model: selectedModel,
        options: { duration, aspectRatio, motionStrength, lipSync },
      });
      await clearDraft();
      toast.success("Render queued!");
      navigate(`/projects/${project.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const canGoNext   = !lipSync || (!!files.performance && !!files.audio);
  const activeModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];
  const activeWorkflow = getWorkflow(workflowId);

  return (
    <AppLayout>
      <main className="mx-auto max-w-5xl px-6 py-14">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white leading-tight">
              Direct your <span style={{ color: "oklch(0.65 0.30 330)" }}>shoot.</span>
            </h1>
            <p className="mt-3 text-white/50 text-lg">Drop references → write direction → generate. That's it.</p>
          </div>

          {/* Draft restored badge */}
          {draftRestored && (
            <div
              className="mt-1 flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-white/60"
              style={{ background: "oklch(0.58 0.26 290 / 0.15)", border: "1px solid oklch(0.58 0.26 290 / 0.4)" }}
            >
              <History className="h-3.5 w-3.5" style={{ color: "oklch(0.65 0.30 330)" }} />
              Draft restored
              <button
                type="button"
                onClick={handleClearDraft}
                className="ml-1 text-white/30 hover:text-white/70 transition"
              >
                Clear ×
              </button>
            </div>
          )}
        </div>

        {/* Step bar */}
        <div className="mb-10 flex items-center gap-2">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <button
                onClick={() => s.n < step && setStep(s.n)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  step === s.n ? "text-white" : s.n < step ? "text-white/40 hover:text-white/70 cursor-pointer" : "text-white/20 cursor-not-allowed"
                }`}
                style={step === s.n ? { background: "oklch(0.58 0.26 290 / 0.35)", border: "1px solid oklch(0.58 0.26 290 / 0.5)" } : {}}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={step === s.n ? { background: "oklch(0.65 0.30 330)" } : {}}
                >
                  {s.n < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.n}
                </span>
                {s.label}
              </button>
              {i < WIZARD_STEPS.length - 1 && <span className="text-white/20 text-xs">›</span>}
            </div>
          ))}
        </div>

        {/* Step 1: Assets */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2" htmlFor="title">Project title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full max-w-md rounded-xl px-4 py-2.5 text-sm text-white outline-none transition focus:ring-2 focus:ring-purple-500/50"
                style={{ background: "oklch(0.16 0.06 285)", border: "1px solid oklch(0.30 0.08 285 / 0.6)" }}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Dropzone kind="performance" label="Performance video" hint={lipSync ? "Required · MP4 or MOV · 2–10s · max 100MB" : "Optional · MP4, MOV, WebM"} accept={lipSync ? "video/mp4,video/quicktime" : "video/*"} file={files.performance} onChange={(f) => setFile("performance", f)} badge="01" maxMB={lipSync ? 100 : undefined} />
              <Dropzone kind="identity"    label="Identity photo"    hint="Optional · JPG, PNG · used for image-to-video" accept="image/*" file={files.identity} onChange={(f) => setFile("identity", f)} badge="02" />
              <Dropzone kind="outfit"      label="Outfit reference"  hint="Optional · clothing"        accept="image/*" file={files.outfit}      onChange={(f) => setFile("outfit", f)}             badge="03" />
              <Dropzone kind="scene"       label="Scene reference"   hint="Optional · environment"     accept="image/*" file={files.scene}       onChange={(f) => setFile("scene", f)}              badge="04" />
              <Dropzone kind="audio"       label="Lip-sync audio"    hint="Required for lip sync · MP3, WAV, OGG, M4A, AAC · 2–60s · max 5MB" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/aac,.m4a" file={files.audio} onChange={(f) => setFile("audio", f)} badge="05" />
            </div>
            <p className="text-xs text-white/30">All assets are optional — you can render with just a prompt, or add a photo for image-to-video.</p>
          </div>
        )}

        {/* Step 2: Direction */}
        {step === 2 && (
          <div className="space-y-8">
            {/* Model picker */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">AI Model</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {MODELS.map((m) => {
                  const active = selectedModel === m.id;
                  const configured = configuredProviders?.has(m.providerKey) ?? true;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => configured && setSelectedModel(m.id)}
                      disabled={!configured}
                      className="relative flex flex-col items-start gap-1 rounded-xl p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45"
                      style={{
                        background: active ? "oklch(0.58 0.26 290 / 0.20)" : "oklch(0.14 0.05 285)",
                        border: active ? "1.5px solid oklch(0.58 0.26 290 / 0.7)" : "1.5px solid oklch(0.28 0.07 285 / 0.5)",
                      }}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-sm font-semibold text-white">{m.label}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: m.badge === "Fast" ? "oklch(0.58 0.26 290)" : m.badge === "Quality" ? "oklch(0.65 0.30 330)" : "oklch(0.45 0.12 260)" }}
                        >
                          {m.badge === "Fast" ? <><Zap className="inline h-2.5 w-2.5 mr-0.5" />{m.badge}</> : m.badge === "Quality" ? <><Star className="inline h-2.5 w-2.5 mr-0.5" />{m.badge}</> : m.badge}
                        </span>
                      </div>
                      <span className="text-xs text-white/40">{m.note}</span>
                      {!configured && <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-amber-300/70">Provider not connected</span>}
                      {active && <div className="absolute top-3 right-3 h-2 w-2 rounded-full animate-pulse" style={{ background: "oklch(0.65 0.30 330)" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Motion controls</p>
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:grid-cols-3">
                <div>
                  <label htmlFor="motion-strength" className="flex items-center justify-between text-sm font-semibold text-white">
                    <span className="flex items-center gap-2"><Move3d className="h-4 w-4 text-pink-400" /> Motion</span>
                    <span className="font-mono text-xs text-white/50">{motionStrength}/10</span>
                  </label>
                  <input
                    id="motion-strength"
                    type="range"
                    min={1}
                    max={10}
                    value={motionStrength}
                    onChange={(event) => setMotionStrength(Number(event.target.value))}
                    className="mt-4 w-full accent-pink-500"
                  />
                  <p className="mt-2 text-xs text-white/35">Controls movement intensity and prompt adherence.</p>
                </div>
                <fieldset>
                  <legend className="flex items-center gap-2 text-sm font-semibold text-white"><Timer className="h-4 w-4 text-cyan-400" /> Duration</legend>
                  <div className="mt-3 flex gap-2">
                    {[5, 10].map((seconds) => (
                      <button key={seconds} type="button" onClick={() => setDuration(seconds as 5 | 10)}
                        className={`min-h-10 flex-1 rounded-lg border text-sm font-medium transition ${duration === seconds ? "border-pink-400 bg-pink-500/15 text-white" : "border-white/10 text-white/45 hover:text-white"}`}>
                        {seconds}s
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="flex items-center gap-2 text-sm font-semibold text-white"><Ratio className="h-4 w-4 text-violet-400" /> Frame</legend>
                  <div className="mt-3 flex gap-2">
                    {(["16:9", "9:16", "1:1"] as const).map((ratio) => (
                      <button key={ratio} type="button" onClick={() => setAspectRatio(ratio)}
                        className={`min-h-10 flex-1 rounded-lg border text-xs font-medium transition ${aspectRatio === ratio ? "border-cyan-400 bg-cyan-500/10 text-white" : "border-white/10 text-white/45 hover:text-white"}`}>
                        {ratio}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Specialist models</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {COMING_MODELS.map((model) => (
                  <div key={model.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white/65">{model.label}</span>
                      <LockKeyhole className="h-3.5 w-3.5 text-white/25" aria-hidden="true" />
                    </div>
                    <p className="mt-1 text-xs text-white/30">{model.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-white"><AudioLines className="h-4 w-4 text-pink-400" /> Lip sync</span>
                  <span className="mt-1 block text-xs text-white/35">Animate the uploaded performance video to match your audio using Kling LipSync on fal.ai.</span>
                </span>
                <input type="checkbox" checked={lipSync} onChange={(event) => setLipSync(event.target.checked)}
                  disabled={configuredProviders !== null && !configuredProviders.has("FAL_KEY")}
                  className="h-5 w-5 accent-pink-500 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Enable lip sync" />
              </label>
              {lipSync && (!files.performance || !files.audio) && (
                <p className="mt-3 text-xs font-medium text-amber-300/80">Add both a performance video and an audio track in Assets before rendering.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Workflow preset</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setWorkflowId("")}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{
                    background: !workflowId ? "oklch(0.58 0.26 290 / 0.20)" : "oklch(0.14 0.05 285)",
                    border: !workflowId ? "1.5px solid oklch(0.58 0.26 290 / 0.7)" : "1.5px solid oklch(0.28 0.07 285 / 0.5)",
                  }}
                >
                  <span className="text-sm font-semibold text-white">No preset</span>
                  <span className="mt-1 block text-xs text-white/40">Use the model with your direction as written.</span>
                </button>
                {WORKFLOWS.map((workflow) => {
                  const active = workflowId === workflow.id;
                  return (
                    <button
                      key={workflow.id}
                      type="button"
                      onClick={() => setWorkflowId(workflow.id)}
                      className="rounded-xl p-4 text-left transition-all"
                      style={{
                        background: active ? "oklch(0.58 0.26 290 / 0.20)" : "oklch(0.14 0.05 285)",
                        border: active ? "1.5px solid oklch(0.58 0.26 290 / 0.7)" : "1.5px solid oklch(0.28 0.07 285 / 0.5)",
                      }}
                    >
                      <span className="text-sm font-semibold text-white">{workflow.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-white/40">{workflow.description}</span>
                    </button>
                  );
                })}
              </div>
              {activeWorkflow && (
                <p className="mt-3 text-xs text-white/35">
                  This preset will be included in the render brief. Suggested models: {activeWorkflow.modelHints.join(" · ")}.
                </p>
              )}
            </div>

            {/* Custom prompt */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2" htmlFor="custom-prompt">
                Direct prompt <span className="normal-case tracking-normal text-white/20 font-normal ml-1">(optional — overrides AI enhancement)</span>
              </label>
              <textarea
                id="custom-prompt"
                rows={3}
                placeholder="Write exactly what you want the AI to generate…"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="block w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition focus:ring-2 focus:ring-purple-500/50 placeholder:text-white/20"
                style={{ background: "oklch(0.16 0.06 285)", border: "1px solid oklch(0.30 0.08 285 / 0.5)" }}
              />
            </div>

            {/* Style chips */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">Style chips</p>
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
            </div>

            {/* Scene + style textareas */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2" htmlFor="scene-notes">Scene notes</label>
                <textarea id="scene-notes" rows={4}
                  placeholder="e.g. neon Tokyo alley, 2am, rain reflections"
                  value={scenePrompt} onChange={(e) => setScenePrompt(e.target.value)}
                  className="block w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition focus:ring-2 focus:ring-purple-500/50 placeholder:text-white/20"
                  style={{ background: "oklch(0.16 0.06 285)", border: "1px solid oklch(0.30 0.08 285 / 0.5)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2" htmlFor="style-notes">Visual style</label>
                <textarea id="style-notes" rows={4}
                  placeholder="e.g. 35mm grain, teal-orange grade, anamorphic flares"
                  value={stylePrompt} onChange={(e) => setStylePrompt(e.target.value)}
                  className="block w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition focus:ring-2 focus:ring-purple-500/50 placeholder:text-white/20"
                  style={{ background: "oklch(0.16 0.06 285)", border: "1px solid oklch(0.30 0.08 285 / 0.5)" }}
                />
              </div>
            </div>

            {/* Enhance */}
            {!customPrompt && (
              <div className="flex items-center gap-4">
                <button type="button" onClick={handleEnhance} disabled={enhancing}
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40"
                  style={{ background: "oklch(0.58 0.26 290 / 0.25)", border: "1px solid oklch(0.58 0.26 290 / 0.5)" }}
                >
                  {enhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {enhancing ? "Enhancing…" : "Enhance with AI"}
                </button>
                <p className="text-xs text-white/30">Let AI write a cinematic prompt from your notes.</p>
              </div>
            )}

            {enhanced && !customPrompt && (
              <div className="rounded-2xl p-5" style={{ background: "oklch(0.58 0.26 290 / 0.10)", border: "1px solid oklch(0.58 0.26 290 / 0.3)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "oklch(0.65 0.30 330)" }}>AI-enhanced prompt</p>
                <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{enhanced}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl overflow-hidden divide-y"
              style={{ background: "oklch(0.14 0.05 285)", borderColor: "oklch(0.28 0.07 285 / 0.3)", border: "1px solid oklch(0.28 0.07 285 / 0.3)" }}
            >
              <ReviewRow label="Title"       value={title} />
              <ReviewRow label="Model"       value={activeModel.label} highlight />
              <ReviewRow label="Performance" value={files.performance?.file.name ?? "—"} />
              <ReviewRow label="Identity"    value={files.identity?.file.name ?? "—"} />
              <ReviewRow label="Outfit"      value={files.outfit?.file.name ?? "—"} />
              <ReviewRow label="Scene ref"   value={files.scene?.file.name ?? "—"} />
              <ReviewRow label="Audio"       value={files.audio?.file.name ?? "—"} />
              <ReviewRow label="Lip sync"    value={lipSync ? "Kling LipSync via fal.ai" : "Off"} highlight={lipSync} />
              {customPrompt
                ? <ReviewRow label="Prompt"     value={customPrompt} />
                : <>
                    {scenePrompt && <ReviewRow label="Scene notes" value={scenePrompt} />}
                    {stylePrompt && <ReviewRow label="Style notes" value={stylePrompt} />}
                    {enhanced    && <ReviewRow label="AI prompt"   value={enhanced} />}
                  </>
              }
            </div>
            <p className="text-xs text-white/30">
              Rendering typically takes {activeModel.note}. You can leave this page — the project updates live.
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

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex gap-4 px-5 py-3.5" style={{ borderColor: "oklch(0.28 0.07 285 / 0.3)" }}>
      <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-widest text-white/30 pt-0.5">{label}</span>
      <span className={`text-sm break-all line-clamp-3 ${highlight ? "font-semibold" : "text-white/80"}`}
        style={highlight ? { color: "oklch(0.65 0.30 330)" } : {}}
      >{value}</span>
    </div>
  );
}

function Dropzone({ label, hint, accept, file, onChange, required, badge, kind, maxMB: maxMBOverride }: {
  label: string; hint: string; accept: string;
  file: StagedFile | null; onChange: (f: File | null) => void;
  required?: boolean; badge: string; kind: string; maxMB?: number;
}) {
  const [dragging, setDragging] = useState(false);
  const isVideo = accept.startsWith("video");
  const isAudio = accept.startsWith("audio");
  const mediaLabel = isVideo ? "video" : isAudio ? "audio" : "image";
  const maxMB = maxMBOverride ?? FILE_LIMITS[mediaLabel];

  function handleFile(f: File) {
    const acceptedTypes = accept.split(",").filter((value) => !value.startsWith("."));
    const acceptedExtensions = accept.split(",").filter((value) => value.startsWith("."));
    const extensionMatches = acceptedExtensions.some((extension) => f.name.toLowerCase().endsWith(extension));
    const typeMatches = acceptedTypes.some((type) => type.endsWith("/*") ? f.type.startsWith(type.slice(0, -1)) : f.type === type);
    if (!typeMatches && !extensionMatches) {
      toast.error(`Please choose a supported ${mediaLabel} file`);
      return;
    }
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > maxMB) {
      toast.error(`File too large (${Math.round(sizeMB)} MB — max ${maxMB} MB)`);
      return;
    }
    onChange(f);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    handleFile(f);
  }, [accept, mediaLabel, maxMB]);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: dragging ? "oklch(0.58 0.26 290 / 0.12)" : "oklch(0.14 0.05 285)",
        border: dragging ? "1.5px solid oklch(0.58 0.26 290 / 0.8)" : "1.5px solid oklch(0.28 0.07 285 / 0.5)",
      }}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "oklch(0.65 0.30 330)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            {badge}
          </span>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {label}{required && <span className="ml-1" style={{ color: "oklch(0.65 0.30 330)" }}>*</span>}
            </p>
            <p className="text-[11px] text-white/35 mt-0.5">{hint}</p>
          </div>
        </div>
        {file && (
          <button type="button" onClick={() => onChange(null)}
            className="rounded-full p-1 transition hover:bg-white/10 text-white/40 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <label className="block cursor-pointer mx-3 mb-3 overflow-hidden rounded-xl">
        {file ? (
          isVideo
            ? <video key={file.preview} src={file.preview} className="aspect-video w-full object-cover rounded-xl" autoPlay muted playsInline loop />
            : isAudio
              ? <div className="flex aspect-video items-center justify-center rounded-xl bg-black/25 px-4"><audio key={file.preview} src={file.preview} className="w-full" controls preload="metadata" /></div>
            : <img src={file.preview} alt={kind} className="aspect-video w-full object-cover rounded-xl" />
        ) : (
          <div
            className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl"
            style={{ background: "oklch(0.10 0.04 290 / 0.6)", border: "1.5px dashed oklch(0.40 0.10 285 / 0.4)" }}
          >
            <Upload className="h-5 w-5 text-white/25" />
            <span className="text-xs text-white/25 font-medium">{dragging ? "Drop here" : "Click or drag to upload"}</span>
          </div>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onClick={(e) => { (e.currentTarget as HTMLInputElement).value = ""; }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </label>
    </div>
  );
}

function getMediaDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const element = document.createElement(file.type.startsWith("audio/") ? "audio" : "video");
    const url = URL.createObjectURL(file);
    element.preload = "metadata";
    element.onloadedmetadata = () => {
      const duration = element.duration;
      URL.revokeObjectURL(url);
      Number.isFinite(duration) ? resolve(duration) : reject(new Error("Could not read media duration."));
    };
    element.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not read ${file.type.startsWith("audio/") ? "audio" : "video"} metadata.`));
    };
    element.src = url;
  });
}
