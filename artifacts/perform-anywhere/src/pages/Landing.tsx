import { Link } from "wouter";
import { ArrowRight, Camera, Sparkles, UserSquare2, Wand2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <HowItWorks />
      <Inputs />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl">
          <span className="inline-block h-2 w-2 rounded-full bg-primary" />
          Performance Studio
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <a href="#how" className="hidden text-muted-foreground hover:text-foreground sm:inline">
            How it works
          </a>
          <Link
            to="/projects"
            className="rounded bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90"
          >
            Open studio
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="grain border-b border-border/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1.2fr_1fr] md:py-32">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">
            Motion · Identity · Scene
          </p>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] md:text-7xl">
            Direct yourself
            <br />
            <span className="italic text-primary">in any world.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Film a 30-second performance on your phone. Drop in a face, an outfit, a setting.
            AI restages it — your timing, your gestures, a new universe.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 rounded bg-primary px-5 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start a project
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded border border-border px-5 py-3 hover:border-primary"
            >
              See the pipeline
            </a>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="aspect-[3/4] overflow-hidden rounded border border-cream/20 bg-card flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Sparkles className="mx-auto h-12 w-12 opacity-30" />
              <p className="mt-3 text-sm opacity-50">AI performance demo</p>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 w-56 rotate-[-4deg] rounded border border-cream/20 bg-card p-3 shadow-2xl">
            <div className="aspect-video rounded bg-gradient-to-br from-muted to-background" />
            <p className="mt-2 text-xs text-muted-foreground">Take 01 · Identity preserved</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Camera, title: "Capture", body: "Record 30 seconds. Body, face, timing." },
    { icon: UserSquare2, title: "Identify", body: "Reference photo locks in your likeness." },
    { icon: Wand2, title: "Restyle", body: "Outfit, scene, and cinematic look applied." },
    { icon: Sparkles, title: "Render", body: "New performance, same you, new world." },
  ];
  return (
    <section id="how" className="border-b border-border/40 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-4xl md:text-5xl">The pipeline</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Four inputs, one rendered performance. Built on the strongest video-to-video models —
          with automatic fallback if one provider is busy.
        </p>
        <div className="mt-12 grid gap-px overflow-hidden rounded border border-border md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="bg-card p-6">
              <div className="flex items-center gap-3 text-primary">
                <s.icon className="h-5 w-5" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Inputs() {
  const items = [
    "Performance video (≤ 30s)",
    "Identity photo",
    "Outfit reference",
    "Scene reference",
    "Style direction",
  ];
  return (
    <section className="border-b border-border/40 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl md:text-5xl">Five inputs.</h2>
          <h2 className="font-display text-4xl italic text-primary md:text-5xl">
            One performance.
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground">
            We hand the references to the right model for the job. You stay focused on the
            creative direction.
          </p>
        </div>
        <ul className="divide-y divide-border border-y border-border">
          {items.map((label, i) => (
            <li key={label} className="flex items-baseline gap-6 py-5">
              <span className="font-display text-3xl text-primary">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-lg">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Performance Transfer Studio</p>
        <p>Cinema for one. Powered by AI video models.</p>
      </div>
    </footer>
  );
}
