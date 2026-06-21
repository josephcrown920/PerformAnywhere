import { Link, useLocation } from "wouter";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  function navCls(path: string) {
    return location === path || location.startsWith(path + "/")
      ? "rounded px-3 py-1.5 text-foreground bg-accent"
      : "rounded px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground";
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-xl">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Performance Studio
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/projects" className={navCls("/projects")}>Projects</Link>
            <Link to="/studio" className={navCls("/studio")}>New</Link>
            <Link to="/orchestrate" className={navCls("/orchestrate")}>Orchestrate</Link>
            <Link to="/account" className={navCls("/account")}>Account</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
