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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/30 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 font-display text-xl tracking-tight">
            <Clapperboard className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Perform Anywhere
          </Link>
          <nav className="flex items-center gap-0.5 text-sm">
            {NAV.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                  isActive(to)
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                }`}
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
