import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";
import { Clapperboard, Film, PlusSquare, Layers, Settings } from "lucide-react";

const NAV = [
  { to: "/projects",    label: "Projects",    Icon: Film },
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
      <header className="sticky top-0 z-40 border-b border-white/8 backdrop-blur-md" style={{ background: "oklch(0.10 0.04 290 / 0.85)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white">
            <Clapperboard className="h-5 w-5" style={{ color: "oklch(0.65 0.30 330)" }} strokeWidth={1.5} />
            Perform Anywhere
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {NAV.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                  isActive(to)
                    ? "font-semibold text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
                style={isActive(to) ? { background: "oklch(0.58 0.26 290 / 0.25)" } : {}}
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
