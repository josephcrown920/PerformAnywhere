import { Link } from "wouter";
import { ArrowRight, Camera, Clapperboard, Sparkles, UserSquare2, Wand2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <HowItWorks />
      <Inputs />
      <CTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 font-display text-xl tracking-tight">
          <Clapperboard className="h-5 w-5 text-primary" strokeWidth={1.5} />
          Perform Anywhere
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <a href="#how" className="hidden px-3 py-1.5 text-muted-foreground hover:text-foreground transition sm:inline">
            How it works
          </a>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 rounded bg-primary px-4 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 transition"
          >
            Open studio <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grain relative overflow-hidden border-b border-border/30">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(0.94_0.025_80/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.94_0.025_80/0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative mx-auto grid max-w-6xl gap-16 px-6 py-28 md:grid-cols-[1.15fr_1fr] md:py-36">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs text-primary uppercase tracking-[0.2em]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Motion · Identity · Scene
          </div>
          <h1 className="mt-7 font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.93] tracking-tight">
            Direct yourself
            <br />
            <em className="text-primary not-italic">in any world.</em>
          </h1>
          <p className="mt-7 max-w-[38ch] text-lg leading-relaxed text-muted-foreground">
            Film a 30-second performance. Drop in a face, an outfit, a setting.
            AI restages it — your timing, your gestures, a new universe.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 rounded bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded border border-border px-6 py-3 text-sm hover:border-primary/60 hover:bg-accent transition"
            >
              See the pipeline
            </a>
          </div>
        </div>

        <div className="relative hidden md:flex items-center justify-center">
          {/* Stacked film cards */}
          <div className="relative h-[420px] w-[300px]">
            {[
              { rotate: "-6deg", translate: "-12px, 20px", opacity: "0.35", z: 0 },
              { rotate: "3deg",  translate: "10px, -8px",  opacity: "0.55", z: 1 },
              { rotate: "-1deg", translate: "0px, 0px",    opacity: "1",    z: 2 },
            ].map((card, i) => (
              <div
                key={i}
                className="absolute inset-0 overflow-hidden rounded-lg border border-cream/15 bg-card shadow-2xl"
                style={{ transform: `rotate(${card.rotate}) translate(${card.translate})`, opacity: card.opacity, zIndex: card.z }}
              >
                <div className="grain h-full flex flex-col">
                  <div className="flex-1 bg-gradient-to-br from-muted/80 via-background to-muted/40 flex items-center justify-center">
                    <Clapperboard className="h-10 w-10 text-muted-foreground/30" strokeWidth={1} />
                  </div>
                  <div className="border-t border-border/30 p-3">
                    <p className="text-xs text-muted-foreground font-mono">
                      {["Take 03 · Cyberpunk alley", "Take 02 · Sunlit rooftop", "Take 01 · Studio"][i]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Camera,      num: "01", title: "Capture",  body: "Record 30 seconds. Body, face, motion — all preserved." },
    { icon: UserSquare2, num: "02", title: "Identify",  body: "Reference photo locks in your facial likeness." },
    { icon: Wand2,       num: "03", title: "Restyle",   body: "Outfit, scene, and cinematic look applied together." },
    { icon: Sparkles,    num: "04", title: "Render",    body: "New performance, same you, entirely new world." },
  ];
  return (
    <section id="how" className="border-b border-border/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-xl">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Pipeline</p>
          <h2 className="mt-3 font-display text-5xl leading-tight">Four steps.<br />One render.</h2>
          <p className="mt-4 text-muted-foreground">
            Built on the strongest video-to-video models, with automatic provider fallback.
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border/50 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.title} className="group bg-card p-7 transition hover:bg-accent/40">
              <div className="flex items-center gap-3">
                <s.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="font-mono text-xs text-muted-foreground">{s.num}</span>
              </div>
              <h3 className="mt-8 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Inputs() {
  const items = [
    { n: "01", label: "Performance video", note: "≤ 30 s · MP4, MOV, WebM" },
    { n: "02", label: "Identity photo",    note: "Clear face shot · JPG, PNG" },
    { n: "03", label: "Outfit reference",  note: "Optional · clothing image" },
    { n: "04", label: "Scene reference",   note: "Optional · setting / background" },
    { n: "05", label: "Style direction",   note: "Freeform text + AI enhancement" },
  ];
  return (
    <section className="border-b border-border/30 py-24">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Inputs</p>
          <h2 className="mt-3 font-display text-5xl leading-tight">
            Five inputs.
            <br />
            <em className="text-primary not-italic">One performance.</em>
          </h2>
          <p className="mt-5 max-w-[36ch] text-muted-foreground leading-relaxed">
            We route each reference to the right model automatically.
            You stay focused on the creative direction.
          </p>
        </div>
        <div className="divide-y divide-border/40 border-y border-border/40">
          {items.map((item) => (
            <div key={item.n} className="flex items-center gap-6 py-5">
              <span className="w-8 shrink-0 font-display text-3xl text-primary">{item.n}</span>
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="grain border-b border-border/30 py-28 text-center">
      <div className="mx-auto max-w-2xl px-6">
        <Clapperboard className="mx-auto h-8 w-8 text-primary" strokeWidth={1.5} />
        <h2 className="mt-6 font-display text-5xl leading-tight">
          Cinema for one.
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          No account. No subscription. Buy credits, render takes.
        </p>
        <Link
          to="/projects"
          className="mt-8 inline-flex items-center gap-2 rounded bg-primary px-8 py-3.5 font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Start your first project <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clapperboard className="h-4 w-4" strokeWidth={1.5} />
          <span>Perform Anywhere</span>
        </div>
        <p>Anonymous · credit-based · AI video models</p>
      </div>
    </footer>
  );
}
