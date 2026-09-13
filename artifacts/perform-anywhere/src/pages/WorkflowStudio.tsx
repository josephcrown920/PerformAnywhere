import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { api, type GpuCandidate, type WorkflowPack, type WorkflowPlan } from "@/lib/api";
import { getClientId } from "@/lib/client-id";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload, Zap, Wand2, Cpu, Layers3, Plus, X } from "lucide-react";
import AppLayout from "@/components/AppLayout";

type AssetKind = "performance" | "identity" | "outfit" | "scene" | "audio";
type Asset = { file: File; preview: string };
const kinds: AssetKind[] = ["performance", "identity", "outfit", "scene", "audio"];
const labels: Record<AssetKind, string> = { performance: "Performance", identity: "Identity", outfit: "Outfit", scene: "Scene", audio: "Audio" };
const categories = ["cinematic-video", "music-video", "product-ad", "ugc-ad", "fashion", "character-consistency", "image-to-video", "video-to-video", "social"];
const capabilities = ["motion-transfer", "identity-lock", "lip-sync", "beat-sync", "camera-choreography", "multi-shot", "outfit-change", "continuity"];

export default function WorkflowStudio() {
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("Untitled performance");
  const [files, setFiles] = useState<Record<AssetKind, Asset | null>>({ performance: null, identity: null, outfit: null, scene: null, audio: null });
  const [workflows, setWorkflows] = useState<WorkflowPack[]>([]);
  const [workflowId, setWorkflowId] = useState("");
  const [category, setCategory] = useState("music-video");
  const [quality, setQuality] = useState<"fast" | "balanced" | "quality">("balanced");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("9:16");
  const [duration, setDuration] = useState<5 | 10>(5);
  const [prompt, setPrompt] = useState("");
  const [selectedCaps, setSelectedCaps] = useState<string[]>(["identity-lock", "motion-transfer"]);
  const [plan, setPlan] = useState<WorkflowPlan | null>(null);
  const [gpus, setGpus] = useState<GpuCandidate[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [racing, setRacing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [variants, setVariants] = useState(1);

  useEffect(() => { api.listWorkflows().then(({ workflows: rows }) => { setWorkflows(rows); if (rows[0]) setWorkflowId(rows[0].id); }).catch(() => toast.error("Could not load workflow packs")); }, []);
  const activeWorkflow = useMemo(() => workflows.find((w) => w.id === workflowId), [workflows, workflowId]);

  function setAsset(kind: AssetKind, file: File | null) {
    setFiles((prev) => { if (prev[kind]) URL.revokeObjectURL(prev[kind]!.preview); return { ...prev, [kind]: file ? { file, preview: URL.createObjectURL(file) } : null }; });
  }
  function toggleCap(cap: string) { setSelectedCaps((v) => v.includes(cap) ? v.filter((x) => x !== cap) : [...v, cap]); }

  async function planShot() {
    setPlanning(true);
    try {
      const result = await api.planWorkflow({ task: `${category} ${prompt || "performance transfer"}`, modality: "video", category, aspectRatio, durationSeconds: duration, quality, freeOnly, capabilities: selectedCaps });
      setPlan(result); setWorkflowId(result.workflow.id);
      toast.success(`Planner selected ${result.workflow.name}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "No compatible workflow found"); }
    finally { setPlanning(false); }
  }

  async function raceGpu() {
    setRacing(true);
    try { const result = await api.raceGpus({ minVramGb: plan?.workflow.requirements?.find((r) => r.kind === "gpu")?.minVramGb ?? 0, freeOnly }); setGpus(result.candidates); }
    catch (e) { toast.error(e instanceof Error ? e.message : "GPU race failed"); }
    finally { setRacing(false); }
  }

  async function generate() {
    if (!plan) { await planShot(); return; }
    setSubmitting(true);
    try {
      const clientId = getClientId();
      const base = { client_id: clientId, title, status: "draft", scene_prompt: prompt || null, style_prompt: activeWorkflow?.description || null, enhanced_prompt: prompt || activeWorkflow?.description || null };
      let { data: project, error } = await supabase.from("projects").insert({ ...base, selected_model: plan.model }).select("id").single();
      if (error?.message?.includes("selected_model")) ({ data: project, error } = await supabase.from("projects").insert(base).select("id").single());
      if (error || !project) throw new Error(error?.message || "Could not create project");
      for (const kind of kinds) {
        const asset = files[kind]; if (!asset) continue;
        const ext = asset.file.name.split(".").pop() || "bin";
        const path = `${clientId}/${project.id}/${kind}.${ext}`;
        const up = await supabase.storage.from("uploads").upload(path, asset.file, { contentType: asset.file.type, upsert: true });
        if (up.error) throw new Error(`Upload ${kind}: ${up.error.message}`);
        const row = await supabase.from("project_assets").upsert({ project_id: project.id, client_id: clientId, kind, storage_path: path, mime_type: asset.file.type }, { onConflict: "project_id,kind" });
        if (row.error) throw new Error(`Asset ${kind}: ${row.error.message}`);
      }
      await api.startRender({ clientId, projectId: project.id, model: plan.model, options: { duration, aspectRatio, motionStrength: 5, lipSync: selectedCaps.includes("lip-sync") } });
      toast.success(variants > 1 ? `${variants} variants selected; first render queued` : "Render queued");
      navigate(`/projects/${project.id}`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Generation failed"); }
    finally { setSubmitting(false); }
  }

  return <AppLayout><main className="mx-auto max-w-6xl px-5 py-10 text-white">
    <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><div className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/40">Perform Anywhere · Workflow Engine</div><h1 className="text-4xl font-bold tracking-tight">Direct your <span className="text-fuchsia-400">shoot.</span></h1><p className="mt-2 text-white/50">The planner chooses the workflow, model and fallback path before generation.</p></div><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none md:w-72" placeholder="Project title" /></header>
    <div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="mb-4 flex items-center gap-2"><Layers3 className="h-4 w-4 text-fuchsia-300"/><h2 className="font-semibold">Workflow packs</h2></div><div className="grid gap-3 sm:grid-cols-2">{workflows.map((w) => <button key={w.id} onClick={() => { setWorkflowId(w.id); setPlan(null); }} className={`rounded-xl border p-4 text-left transition ${workflowId === w.id ? "border-fuchsia-400/60 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"}`}><div className="font-medium">{w.name}</div><div className="mt-1 text-xs text-white/45">{w.description}</div></button>)}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="mb-4 flex items-center gap-2"><Upload className="h-4 w-4 text-fuchsia-300"/><h2 className="font-semibold">Reference assets</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{kinds.map((kind) => <label key={kind} className="relative cursor-pointer rounded-xl border border-dashed border-white/15 bg-black/10 p-4 hover:border-white/30"><input type="file" className="hidden" accept={kind === "performance" ? "video/*" : kind === "audio" ? "audio/*" : "image/*"} onChange={(e) => setAsset(kind, e.target.files?.[0] || null)} />{files[kind] ? <div className="flex items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-lg bg-white/10">{files[kind]!.file.type.startsWith("image/") ? <img src={files[kind]!.preview} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-xs">{kind[0].toUpperCase()}</div>}</div><div className="min-w-0"><div className="text-sm font-medium">{labels[kind]}</div><div className="truncate text-xs text-white/40">{files[kind]!.file.name}</div></div><button type="button" onClick={(e) => { e.preventDefault(); setAsset(kind, null); }} className="ml-auto"><X className="h-4 w-4 text-white/30"/></button></div> : <><div className="text-sm font-medium">{labels[kind]}</div><div className="mt-1 text-xs text-white/35">Drop or choose a file</div></>}</label>)}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="mb-4 flex items-center gap-2"><Wand2 className="h-4 w-4 text-fuchsia-300"/><h2 className="font-semibold">Direction</h2></div><textarea value={prompt} onChange={(e) => { setPrompt(e.target.value); setPlan(null); }} rows={5} className="w-full resize-none rounded-xl border border-white/10 bg-black/20 p-4 text-sm outline-none focus:border-fuchsia-400/50" placeholder="Describe the shot, camera movement, performance, environment, lighting and mood…"/><div className="mt-4 flex flex-wrap gap-2">{capabilities.map((cap) => <button key={cap} onClick={() => { toggleCap(cap); setPlan(null); }} className={`rounded-full border px-3 py-1.5 text-xs ${selectedCaps.includes(cap) ? "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-200" : "border-white/10 text-white/45"}`}>{cap}</button>)}</div></div>
      </section>
      <aside className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="mb-4 flex items-center gap-2"><Sparkles className="h-4 w-4 text-fuchsia-300"/><h2 className="font-semibold">Execution plan</h2></div><div className="grid grid-cols-2 gap-3"><select value={category} onChange={(e) => { setCategory(e.target.value); setPlan(null); }} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"><option value="">Any category</option>{categories.map((x) => <option key={x}>{x}</option>)}</select><select value={quality} onChange={(e) => { setQuality(e.target.value as typeof quality); setPlan(null); }} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"><option value="fast">Fast</option><option value="balanced">Balanced</option><option value="quality">Quality</option></select><select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as typeof aspectRatio)} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"><option>9:16</option><option>16:9</option><option>1:1</option></select><select value={duration} onChange={(e) => setDuration(Number(e.target.value) as 5 | 10)} className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"><option value={5}>5 sec</option><option value={10}>10 sec</option></select></div><label className="mt-3 flex items-center gap-2 text-xs text-white/50"><input type="checkbox" checked={freeOnly} onChange={(e) => { setFreeOnly(e.target.checked); setPlan(null); }} /> Free paths only</label><button onClick={planShot} disabled={planning} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold disabled:opacity-50">{planning ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>} Auto-plan this shot</button>{plan && <div className="mt-4 rounded-xl border border-fuchsia-400/20 bg-fuchsia-400/5 p-4 text-sm"><div className="font-semibold">{plan.workflow.name}</div><div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/55"><span>Provider: <b className="text-white/80">{plan.provider}</b></span><span>Model: <b className="text-white/80">{plan.model}</b></span><span>Quality: <b className="text-white/80">{plan.quality}</b></span><span>Score: <b className="text-white/80">{plan.score}</b></span></div><div className="mt-3 text-xs text-white/45">{plan.reasons.slice(0, 4).join(" · ")}</div>{plan.fallbackProviders.length > 0 && <div className="mt-2 text-xs text-white/35">Fallbacks: {plan.fallbackProviders.join(", ")}</div>}</div>}</div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="mb-4 flex items-center gap-2"><Cpu className="h-4 w-4 text-fuchsia-300"/><h2 className="font-semibold">GPU race</h2></div><button onClick={raceGpu} disabled={racing} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10 disabled:opacity-50">{racing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Zap className="h-4 w-4"/>} Race available workers</button><div className="mt-3 space-y-2">{gpus.slice(0, 5).map((g) => <div key={g.id} className="flex items-center justify-between rounded-lg bg-black/20 p-3 text-xs"><div><div className="font-medium">{g.gpu}</div><div className="text-white/35">{g.provider} · {g.vramGb} GB</div></div><div className="text-right"><div>{Math.round(g.queueSeconds / 60)}m queue</div><div className="text-white/35">${g.estimatedCostPerMinute}/min</div></div></div>)}</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><div className="mb-3 text-sm font-semibold">Creative variants</div><div className="flex items-center justify-between"><button onClick={() => setVariants(Math.max(1, variants - 1))} className="rounded-lg border border-white/10 p-2"><X className="h-4 w-4"/></button><div className="text-2xl font-bold">{variants}</div><button onClick={() => setVariants(Math.min(12, variants + 1))} className="rounded-lg border border-white/10 p-2"><Plus className="h-4 w-4"/></button></div><p className="mt-2 text-xs text-white/35">Variant count is retained for the execution plan; generation still uses the existing render/provider boundary.</p></div>
        <button onClick={generate} disabled={submitting || planning} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-semibold text-black disabled:opacity-50">{submitting ? <Loader2 className="h-5 w-5 animate-spin"/> : <Sparkles className="h-5 w-5"/>}{plan ? "Generate with this plan" : "Plan & continue"}</button>
      </aside>
    </div>
  </main></AppLayout>;
}
