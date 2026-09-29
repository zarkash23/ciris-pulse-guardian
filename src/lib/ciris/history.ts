import type { Activity } from "./types";

export interface HistoryPoint {
  t: number;
  heartRate: number;
  spo2: number;
  skinTemp: number;
  battery: number;
  solarMw: number;
  activity: number; // 0 idle, 1 walking, 2 running
  state: string;
}

// Deterministic pseudo-random so the demo history is stable within a session.
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

const ACT: Activity[] = ["idle", "walking", "running"];

/** 24h of demo history at 2-minute resolution, ending at `end`. */
export function generateHistory(end: number, endBattery: number): HistoryPoint[] {
  const r = rng(424242);
  const step = 2 * 60 * 1000;
  const n = 720;
  const pts: HistoryPoint[] = [];
  let hr = 64, battery = 60, act = 0;
  for (let i = 0; i < n; i++) {
    const t = end - (n - i) * step;
    const hour = new Date(t).getHours() + new Date(t).getMinutes() / 60;
    const asleep = hour < 6.5 || hour > 23;
    if (r() < 0.04) act = asleep ? 0 : r() < 0.6 ? 1 : r() < 0.5 ? 2 : 0;
    if (asleep) act = 0;
    const hrT = asleep ? 56 : [70, 100, 145][act];
    hr += (hrT - hr) * 0.3 + (r() - 0.5) * 3;
    const daylight = Math.max(0, Math.sin(((hour - 6) / 14) * Math.PI));
    const solar = hour > 6 && hour < 20 ? daylight * (80 + r() * 90) : 0;
    const load = 18 + [0, 6, 11][act];
    battery = Math.min(100, Math.max(3, battery + ((solar * 0.82 - load) * 120) / 3600 / 814 * 100 * 3));
    pts.push({
      t, heartRate: Math.round(hr), spo2: Math.round((97.6 - act * 0.6 + (r() - 0.5) * 0.8) * 10) / 10,
      skinTemp: Math.round((33 + act * 0.6 + (asleep ? -0.6 : 0) + (r() - 0.5) * 0.2) * 100) / 100,
      battery: Math.round(battery * 10) / 10, solarMw: Math.round(solar), activity: act,
      state: asleep ? "Sleep" : ACT[act][0].toUpperCase() + ACT[act].slice(1),
    });
  }
  // Align the tail with the live battery reading
  const offset = endBattery - pts[pts.length - 1].battery;
  return pts.map((p, i) => ({ ...p, battery: Math.min(100, Math.max(0, Math.round((p.battery + offset * (i / n)) * 10) / 10)) }));
}
