import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useCiris } from "@/lib/ciris/store";
import { deviceMode } from "@/lib/ciris/engine";
import { EventList, PageHeader, Panel, SimBadge, StatusDot, Tag } from "@/components/ciris/bits";
import { HistoryChart, LiveTrace } from "@/components/ciris/charts";
import { SandboxControls } from "@/components/ciris/Sandbox";
import { SafetyBanner } from "@/components/ciris/SafetyBanner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/console")({
  head: () => ({
    meta: [
      { title: "Live Console — CIRIS" },
      { name: "description", content: "Live simulated telemetry, device state and historical charts for the CIRIS demo device." },
      { property: "og:title", content: "Live Console — CIRIS" },
      { property: "og:description", content: "Live simulated telemetry, device state and historical charts." },
    ],
  }),
  component: Console,
});

const RANGES = { "1h": 3600_000, "6h": 6 * 3600_000, "24h": 24 * 3600_000 } as const;

function Tile({ label, value, unit, trace, color, tone, sub }: { label: string; value: string; unit: string; trace?: keyof import("@/lib/ciris/types").Telemetry; color?: string; tone?: "warning" | "critical" | undefined; sub?: string }) {
  const { live } = useCiris();
  return (
    <div className="flex flex-col rounded-md border border-border bg-surface p-4">
      <p className="label-caps">{label}</p>
      <p className={cn("mt-2 font-mono text-[1.75rem] leading-none tabular", tone === "critical" && "text-critical", tone === "warning" && "text-warning")}>
        {value}<span className="ml-1 text-sm text-muted-foreground">{unit}</span>
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      {trace && color && <div className="mt-auto pt-3"><LiveTrace data={live} dataKey={trace} color={color} height={40} /></div>}
    </div>
  );
}

function Console() {
  const c = useCiris();
  const { sim, events } = c;
  const t = sim.telemetry;
  const mode = deviceMode(sim);
  const [range, setRange] = useState<keyof typeof RANGES>("1h");
  const data = useMemo(() => c.history.filter((h) => h.t >= Date.now() - RANGES[range]), [c.history, range]);
  const connecting = sim.tick < 2;

  const safetyTone = sim.safety === "sos_active" || sim.safety === "fall_detected" ? "critical" : sim.safety === "impact" ? "warning" : "success";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-8 md:px-6">
      <PageHeader crumb="CIRIS / Live Console" title="Live Console" description="Coherent simulated device state: activity drives motion and heart rate, light drives solar harvest, load and harvest drive the battery."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <SimBadge />
            <button onClick={c.toggleRunning} className="inline-flex min-h-9 items-center gap-2 rounded-sm border border-border px-3 text-sm hover:bg-accent">
              {sim.running ? <Pause className="size-4" /> : <Play className="size-4" />}{sim.running ? "Pause simulation" : "Resume simulation"}
            </button>
          </div>
        } />

      <SafetyBanner />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
          <StatusDot tone={connecting ? "warning" : sim.running ? "success" : "muted"} pulse={sim.running} />
          <div><p className="label-caps">Telemetry link</p><p className="text-sm">{connecting ? "Connecting…" : sim.running ? "Connected · simulated stream 1 Hz" : "Simulation paused"}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
          <StatusDot tone={mode === "Emergency" ? "critical" : mode === "Low Power" ? "warning" : "info"} />
          <div><p className="label-caps">Device status</p><p className="text-sm">Demo · {mode}{sim.faults.length ? ` · ${sim.faults.length} fault(s) injected` : ""}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
          <StatusDot tone={safetyTone} pulse={safetyTone === "critical"} />
          <div><p className="label-caps">Safety status</p><p className="text-sm capitalize">{sim.safety.replace(/_/g, " ")}</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Tile label="Heart rate" value={t.heartRate ? t.heartRate.toFixed(0) : "--"} unit="bpm" trace="heartRate" color="var(--color-chart-4)" tone={t.heartRate === 0 ? "warning" : undefined} sub={t.heartRate === 0 ? "No optical signal" : "MAX30101"} />
        <Tile label="SpO₂" value={t.spo2 ? t.spo2.toFixed(1) : "--"} unit="%" trace="spo2" color="var(--color-chart-2)" tone={t.spo2 > 0 && t.spo2 < 92 ? "critical" : undefined} sub="MAX30101" />
        <Tile label="Skin temp" value={t.skinTemp.toFixed(2)} unit="°C" trace="skinTemp" color="var(--color-chart-1)" tone={t.skinTemp >= 37 ? "warning" : undefined} sub="MAX30208" />
        <Tile label="Motion" value={t.accelG.toFixed(2)} unit="g" trace="accelG" color="var(--color-chart-5)" tone={t.accelG > 3 ? "warning" : undefined} sub={`${t.steps.toLocaleString()} steps · BMI270`} />
        <Tile label="Humidity" value={t.humidity.toFixed(1)} unit="%RH" trace="humidity" color="var(--color-chart-2)" sub={`${t.ambientTemp.toFixed(1)} °C ambient · SHT31`} />
        <Tile label="Pressure" value={t.pressure.toFixed(1)} unit="hPa" trace="pressure" color="var(--color-chart-5)" sub="BME280" />
        <Tile label="Battery" value={t.battery.toFixed(1)} unit="%" trace="battery" color="var(--color-chart-3)" tone={t.battery < 15 ? "critical" : t.battery < 20 ? "warning" : undefined} sub={t.charging ? "Charging" : "Discharging"} />
        <Tile label="Solar input" value={t.solarMw.toFixed(0)} unit="mW" trace="solarMw" color="var(--color-chart-1)" sub="CN3065" />
        <Tile label="System load" value={t.loadMw.toFixed(0)} unit="mW" trace="loadMw" color="var(--color-chart-4)" sub={`Net ${(t.solarMw * 0.82 - t.loadMw).toFixed(0)} mW`} />
        <Tile label="Device state" value={mode} unit="" sub={`Activity ${sim.activity} · ${sim.environment.replace("_", " ")}`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <SandboxControls compact />
        <Panel title="Recent events" action={<Link to="/safety" className="text-xs text-muted-foreground hover:text-foreground">All alerts →</Link>} bodyClass="py-0 max-h-[340px] overflow-y-auto">
          <EventList events={events} limit={12} dense />
        </Panel>
      </div>

      <Panel title="Historical telemetry" action={
        <div className="flex gap-1">{(Object.keys(RANGES) as (keyof typeof RANGES)[]).map((r) => (
          <button key={r} onClick={() => setRange(r)} className={cn("rounded-sm px-2.5 py-1 font-mono text-xs", r === range ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>{r}</button>
        ))}</div>
      }>
        {!data.length ? <p className="py-10 text-center text-sm text-muted-foreground">Loading history…</p> : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {([
              ["Heart rate", "heartRate", "var(--color-chart-4)", "bpm"],
              ["SpO₂", "spo2", "var(--color-chart-2)", "%"],
              ["Skin temperature", "skinTemp", "var(--color-chart-1)", "°C"],
              ["Battery", "battery", "var(--color-chart-3)", "%"],
              ["Solar input", "solarMw", "var(--color-chart-1)", "mW"],
              ["Activity", "activity", "var(--color-chart-5)", ""],
            ] as const).map(([l, k, col, u]) => (
              <div key={k}>
                <div className="mb-1 flex items-center justify-between"><p className="text-sm">{l}</p><Tag>{u || "state"}</Tag></div>
                <HistoryChart data={data} dataKey={k} color={col} unit={u} domain={k === "activity" ? [0, 2] : k === "battery" ? [0, 100] : undefined} />
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">Generated demo history, with live samples appended as the simulation runs.</p>
      </Panel>
    </div>
  );
}
