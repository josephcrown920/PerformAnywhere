import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { Film, PlusSquare, Layers, Settings } from "lucide-react";

const NAV = [
  { to: "/projects",    label: "Library",     Icon: Film },
  { to: "/studio",      label: "New",         Icon: PlusSquare },
  { to: "/orchestrate", label: "Orchestrate", Icon: Layers },
  { to: "/account",     label: "Settings",    Icon: Settings },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  function isActive(path: string) {
    return location === path || location.startsWith(path + "/");
  }

  return (
    <div className="min-h-screen aurora-grid" style={{ background: "oklch(0.10 0.04 290)" }}>
      <header className="sticky top-0 z-40 border-b border-white/8 backdrop-blur-md" style={{ background: "oklch(0.10 0.04 290 / 0.88)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/aurora-logo.png" alt="Aurora" className="h-8 w-8 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-white">Aurora</span>
              <span className="text-[9px] font-medium tracking-[0.15em] uppercase" style={{ color: "oklch(0.65 0.30 330)" }}>Synthetic Intelligence</span>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  isActive(to)
                    ? "font-semibold text-white"
                    : "text-white/45 hover:text-white/80"
                }`}
                style={isActive(to) ? { background: "oklch(0.58 0.26 290 / 0.25)", border: "1px solid oklch(0.58 0.26 290 / 0.35)" } : {}}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
