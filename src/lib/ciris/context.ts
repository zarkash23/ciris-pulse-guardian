import { deviceMode, FAULT_LABEL } from "./engine";
import type { HistoryPoint } from "./history";
import type { DeviceEvent, DiagnosticRecord, SimState, Telemetry } from "./types";

/** Structured, bounded context sent to the AI layer (never the whole app state). */
export interface CirisContext {
  device_state: {
    mode: string; activity: string; power_scenario: string; environment: string; safety: string;
    sos_countdown_s: number | null; simulated: true; injected_faults: string[];
  };
  telemetry: Telemetry;
  history: { window: string; summary: Record<string, { min: number; max: number; avg: number }>; battery_change_pct: number; recent_samples: Partial<Telemetry>[] };
  events: Pick<DeviceEvent, "created_at" | "type" | "severity" | "message" | "source">[];
  alerts: Pick<DeviceEvent, "created_at" | "type" | "message">[];
  diagnostics: Pick<DiagnosticRecord, "created_at" | "mode" | "status" | "subsystem" | "summary">[];
}

function stats(vals: number[]) {
  if (!vals.length) return { min: 0, max: 0, avg: 0 };
  const r = (n: number) => Math.round(n * 100) / 100;
  return { min: r(Math.min(...vals)), max: r(Math.max(...vals)), avg: r(vals.reduce((a, b) => a + b, 0) / vals.length) };
}

export function buildContext(sim: SimState, live: Telemetry[], history: HistoryPoint[], events: DeviceEvent[], diagnostics: DiagnosticRecord[]): CirisContext {
  const hour = history.filter((h) => h.t > Date.now() - 3600_000);
  const recentLive = live.slice(-120);
  const first = recentLive[0] ?? sim.telemetry;
  return {
    device_state: {
      mode: deviceMode(sim), activity: sim.activity, power_scenario: sim.power, environment: sim.environment, safety: sim.safety,
      sos_countdown_s: sim.countdown, simulated: true, injected_faults: sim.faults.map((f) => FAULT_LABEL[f]),
    },
    telemetry: sim.telemetry,
    history: {
      window: "last 1h (demo history) + last 2 min live",
      summary: {
        heartRate: stats(hour.map((h) => h.heartRate)), spo2: stats(hour.map((h) => h.spo2)), skinTemp: stats(hour.map((h) => h.skinTemp)),
        solarMw: stats(hour.map((h) => h.solarMw)), live_heartRate: stats(recentLive.map((t) => t.heartRate)), live_accelG: stats(recentLive.map((t) => t.accelG)),
      },
      battery_change_pct: Math.round((sim.telemetry.battery - first.battery) * 100) / 100,
      recent_samples: recentLive.filter((_, i) => i % 20 === 0).map(({ t, heartRate, spo2, accelG, battery, solarMw, loadMw }) => ({ t, heartRate, spo2, accelG, battery, solarMw, loadMw })),
    },
    events: events.slice(0, 20).map(({ created_at, type, severity, message, source }) => ({ created_at, type, severity, message, source })),
    alerts: events.filter((e) => e.severity !== "info").slice(0, 10).map(({ created_at, type, message }) => ({ created_at, type, message })),
    diagnostics: diagnostics.slice(0, 5).map(({ created_at, mode, status, subsystem, summary }) => ({ created_at, mode, status, subsystem, summary })),
  };
}
