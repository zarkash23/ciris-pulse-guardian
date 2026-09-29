import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DeviceEvent, DiagStatus, Severity } from "@/lib/ciris/types";

export function StatusDot({ tone = "success", pulse = false, className }: { tone?: "success" | "warning" | "critical" | "info" | "muted"; pulse?: boolean; className?: string }) {
  const map = { success: "bg-success", warning: "bg-warning", critical: "bg-critical", info: "bg-info", muted: "bg-muted-foreground" };
  return <span className={cn("inline-block size-2 shrink-0 rounded-full", map[tone], pulse && "animate-signal", className)} />;
}

export function SimBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-sm border border-border bg-inset px-2 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground", className)}>
      <StatusDot tone="warning" pulse />
      Demo device · Simulated telemetry
    </span>
  );
}

export function Tag({ children, tone = "muted", className }: { children: ReactNode; tone?: "muted" | "success" | "warning" | "critical" | "info" | "primary"; className?: string }) {
  const map = {
    muted: "text-muted-foreground border-border",
    success: "text-success border-success/40",
    warning: "text-warning border-warning/40",
    critical: "text-critical border-critical/50",
    info: "text-info border-info/40",
    primary: "text-primary border-primary/40",
  };
  return <span className={cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.06em]", map[tone], className)}>{children}</span>;
}

export const sevTone = (s: Severity | DiagStatus) => (s === "critical" || s === "CRITICAL" ? "critical" : s === "warning" || s === "WARNING" ? "warning" : s === "OK" ? "success" : "info") as "critical" | "warning" | "success" | "info";

export function Panel({ title, action, children, className, bodyClass }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("rounded-md border border-border bg-surface", className)}>
      {(title || action) && (
        <header className="flex min-h-11 items-center justify-between gap-3 border-b border-border px-4 py-2">
          <h2 className="label-caps">{title}</h2>
          {action}
        </header>
      )}
      <div className={cn("p-4", bodyClass)}>{children}</div>
    </section>
  );
}

export function PageHeader({ crumb, title, description, right }: { crumb: string; title: string; description?: string; right?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="label-caps">{crumb}</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {right}
    </div>
  );
}

export function Readout({ label, value, unit, sub, tone, className }: { label: string; value: ReactNode; unit?: string; sub?: ReactNode; tone?: "warning" | "critical" | "success"; className?: string }) {
  return (
    <div className={cn("rounded-md border border-border bg-surface p-4", className)}>
      <p className="label-caps">{label}</p>
      <p className={cn("mt-2 font-mono text-2xl tabular md:text-[1.75rem]", tone === "critical" && "text-critical", tone === "warning" && "text-warning", tone === "success" && "text-success")}>
        {value}
        {unit && <span className="ml-1 text-sm text-muted-foreground">{unit}</span>}
      </p>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function fmtTime(iso: string | number) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function EventList({ events, empty = "No events yet. Change the device state in the Engineering Sandbox to generate events.", limit, dense }: { events: DeviceEvent[]; empty?: string; limit?: number; dense?: boolean }) {
  const list = limit ? events.slice(0, limit) : events;
  if (!list.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  return (
    <ol className="divide-y divide-border">
      {list.map((e) => (
        <li key={e.id} className={cn("flex gap-3", dense ? "py-2" : "py-3")}>
          <StatusDot tone={sevTone(e.severity)} className="mt-1.5" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-mono text-[11px] text-muted-foreground tabular">{fmtTime(e.created_at)}</span>
              <Tag tone={sevTone(e.severity)}>{e.type.replace(/_/g, " ")}</Tag>
              <span className="font-mono text-[11px] text-muted-foreground">{e.source}</span>
            </div>
            <p className="mt-1 text-sm">{e.message}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
