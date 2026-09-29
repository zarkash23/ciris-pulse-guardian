import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { useCiris } from "@/lib/ciris/store";
import { deviceMode } from "@/lib/ciris/engine";
import { supabase } from "@/integrations/supabase/client";
import { StatusDot } from "./bits";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/technology", label: "Technology" },
  { to: "/console", label: "Live Console" },
  { to: "/safety", label: "Safety" },
  { to: "/engineering", label: "Engineering" },
  { to: "/support", label: "Support" },
] as const;

function DeviceIndicator() {
  const { sim } = useCiris();
  const mode = deviceMode(sim);
  const emergency = mode === "Emergency";
  return (
    <Link to="/console" className="flex items-center gap-2 rounded-sm border border-border bg-inset px-2.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em]">
      <StatusDot tone={emergency ? "critical" : sim.running ? "success" : "muted"} pulse={sim.running} />
      <span className="text-foreground">Demo device</span>
      <span className="hidden text-muted-foreground xl:inline">· Simulated telemetry</span>
      <span className={cn("hidden border-l border-border pl-2 sm:inline", emergency ? "text-critical" : "text-muted-foreground")}>{sim.running ? mode : "Paused"}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session } = useCiris();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" className="size-5 text-primary" aria-hidden><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3.2" fill="currentColor" /></svg>
            <span className="font-display text-lg font-semibold tracking-[0.18em]">CIRIS</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={cn("rounded-sm px-3 py-1.5 text-sm transition-colors", active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <DeviceIndicator />
            {session ? (
              <button onClick={() => supabase.auth.signOut()} className="hidden rounded-sm px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:block" title={session.user.email ?? ""}>
                Sign out
              </button>
            ) : (
              <Link to="/auth" className="hidden rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-accent md:block">Sign in</Link>
            )}
            <button className="rounded-sm p-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border px-4 py-3 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block rounded-sm px-3 py-3 text-base text-muted-foreground hover:bg-accent hover:text-foreground" activeProps={{ className: "text-foreground bg-accent" }} activeOptions={{ exact: n.to === "/" }}>
                {n.label}
              </Link>
            ))}
            {session ? (
              <button onClick={() => { supabase.auth.signOut(); setOpen(false); }} className="block w-full rounded-sm px-3 py-3 text-left text-base text-muted-foreground">Sign out ({session.user.email})</button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="block rounded-sm px-3 py-3 text-base text-primary">Sign in / Register device</Link>
            )}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:justify-between md:px-6">
          <span>CIRIS prototype. Telemetry is simulated in the browser; no physical device is connected.</span>
          <span>Not a medical device. AI output is device observation, not medical diagnosis.</span>
        </div>
      </footer>
    </div>
  );
}
