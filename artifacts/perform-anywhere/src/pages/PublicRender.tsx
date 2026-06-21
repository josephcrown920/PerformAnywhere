import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Play } from "lucide-react";

type RenderData = {
  id: string;
  title: string;
  provider: string;
  model: string | null;
  prompt: string | null;
  created_at: string;
  videoUrl: string;
};

export default function PublicRender({ clientId, projectId }: { clientId: string; projectId: string }) {
  const [data, setData]   = useState<RenderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    api.getPublicRender(clientId, projectId)
      .then(setData)
      .catch((e) => setError(e?.message ?? "Not found"));
  }, [clientId, projectId]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.08 0.03 285)", color: "white" }}
    >
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "oklch(0.20 0.05 285)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-black"
            style={{ background: "linear-gradient(135deg, oklch(0.58 0.26 290), oklch(0.65 0.30 330))" }}
          >
            ✦
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white">Aurora</span>
            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "oklch(0.65 0.30 330)" }}>
              Synthetic Intelligence
            </span>
          </div>
        </div>

        <a
          href={import.meta.env.BASE_URL}
          className="rounded-xl px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-80"
          style={{ background: "oklch(0.65 0.30 330)" }}
        >
          Create yours →
        </a>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {error ? (
          <NotFound />
        ) : !data ? (
          <div className="flex flex-col items-center gap-3 text-white/30">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="text-sm">Loading render…</p>
          </div>
        ) : (
          <div className="w-full max-w-3xl space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "oklch(0.65 0.30 330)" }}>
                AI-generated performance
              </p>
              <h1 className="text-3xl font-bold text-white leading-tight">{data.title}</h1>
              <p className="text-sm text-white/30">
                Rendered with {data.provider ?? data.model ?? "Aurora"} · {new Date(data.created_at).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>

            {/* Video player */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ background: "oklch(0.10 0.04 285)", border: "1.5px solid oklch(0.25 0.07 285 / 0.5)" }}
            >
              {playing ? (
                <video
                  src={data.videoUrl}
                  controls
                  autoPlay
                  className="aspect-video w-full"
                />
              ) : (
                <div className="relative aspect-video">
                  <video
                    src={data.videoUrl}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    muted
                    autoPlay
                    playsInline
                    loop
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setPlaying(true)}
                      className="flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm transition hover:scale-105"
                      style={{ background: "oklch(0.65 0.30 330 / 0.9)", border: "2px solid white/20" }}
                      aria-label="Play"
                    >
                      <Play className="h-7 w-7 fill-white text-white ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt */}
            {data.prompt && (
              <div
                className="rounded-xl px-5 py-4"
                style={{ background: "oklch(0.13 0.05 285)", border: "1px solid oklch(0.25 0.06 285 / 0.5)" }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-white/30">Direction</p>
                <p className="text-sm text-white/60 leading-relaxed">{data.prompt}</p>
              </div>
            )}

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl px-6 py-5"
              style={{ background: "oklch(0.58 0.26 290 / 0.12)", border: "1px solid oklch(0.58 0.26 290 / 0.3)" }}
            >
              <div>
                <p className="text-sm font-semibold text-white">Generate your own AI performance video</p>
                <p className="text-xs text-white/40 mt-0.5">Upload a reference, write direction, render in minutes.</p>
              </div>
              <a
                href={import.meta.env.BASE_URL}
                className="shrink-0 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 whitespace-nowrap"
                style={{ background: "oklch(0.65 0.30 330)" }}
              >
                Try Aurora →
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t px-6 py-4 text-center text-xs text-white/20" style={{ borderColor: "oklch(0.20 0.05 285)" }}>
        Aurora Synthetic Intelligence — AI video generation studio
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-center space-y-4">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
        style={{ background: "oklch(0.58 0.26 290 / 0.15)", border: "1px solid oklch(0.58 0.26 290 / 0.3)" }}
      >
        ✦
      </div>
      <h1 className="text-2xl font-bold text-white">Render not found</h1>
      <p className="text-sm text-white/40 max-w-xs mx-auto">
        This link may have expired, or the render isn't ready yet. Check back after the render completes.
      </p>
      <a
        href={import.meta.env.BASE_URL}
        className="inline-block mt-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
        style={{ background: "oklch(0.65 0.30 330)" }}
      >
        Go to Aurora
      </a>
    </div>
  );
}
