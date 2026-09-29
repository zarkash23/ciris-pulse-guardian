import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { WatchExplode } from "@/components/ciris/WatchExplode";
import { SimBadge, StatusDot } from "@/components/ciris/bits";
import { useCiris } from "@/lib/ciris/store";
import { deviceMode } from "@/lib/ciris/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CIRIS — Solar-powered health & safety intelligence" },
      { name: "description", content: "Continuous sensing. Autonomous power. Immediate emergency response. Explore the CIRIS wearable platform prototype." },
      { property: "og:title", content: "CIRIS — Solar-powered health & safety intelligence" },
      { property: "og:description", content: "Continuous sensing. Autonomous power. Immediate emergency response." },
    ],
  }),
  component: Overview,
});

const PILLARS = [
  { k: "01", t: "Continuous sensing", d: "Heart rate, SpO₂, skin temperature, motion and environment — fused on the wrist." },
  { k: "02", t: "Autonomous power", d: "A solar dial and CN3065 charger extend runtime toward energy independence." },
  { k: "03", t: "Immediate response", d: "Fall detection with a cancellable countdown and a dedicated SOS button." },
];

const CAPABILITY = [
  { label: "Real software", tone: "success" as const, items: ["Accounts & device registration", "Emergency contacts & history", "AI diagnostics & CIRIS Intelligence chat", "Support / RMA reports"] },
  { label: "Simulated telemetry", tone: "warning" as const, items: ["Sensor readings & power model", "Fall, impact and SOS scenarios", "Fault injection", "24 h demo history"] },
  { label: "Future hardware", tone: "muted" as const, items: ["BLE pairing with a physical watch", "Real contact notifications (SMS/call)", "Firmware OTA updates"] },
];

function LiveStrip() {
  const { sim } = useCiris();
  const t = sim.telemetry;
  const cells = [
    ["Heart rate", `${t.heartRate.toFixed(0)}`, "bpm"], ["SpO₂", t.spo2.toFixed(1), "%"], ["Skin", t.skinTemp.toFixed(1), "°C"],
    ["Battery", t.battery.toFixed(0), "%"], ["Solar", t.solarMw.toFixed(0), "mW"], ["State", deviceMode(sim), ""],
  ];
  return (
    <div className="grid grid-cols-3 divide-x divide-y divide-border border border-border bg-surface md:grid-cols-6 md:divide-y-0">
      {cells.map(([l, v, u]) => (
        <div key={l} className="p-3">
          <p className="label-caps">{l}</p>
          <p className="mt-1 font-mono text-lg tabular">{v}<span className="ml-1 text-xs text-muted-foreground">{u}</span></p>
        </div>
      ))}
    </div>
  );
}

function Overview() {
  return (
    <div>
      <section className="grid-bg border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 pb-14 pt-14 md:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <SimBadge />
            <h1 className="mt-6 text-6xl font-semibold tracking-[0.12em] md:text-7xl">CIRIS</h1>
            <p className="mt-5 max-w-lg text-2xl leading-snug md:text-[1.75rem]">Solar-powered health &amp; safety intelligence for the wrist.</p>
            <p className="mt-4 max-w-lg text-muted-foreground">Continuous sensing. Autonomous power. Immediate emergency response.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#explore" className="inline-flex items-center gap-2 rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Explore CIRIS <ArrowRight className="size-4" /></a>
              <Link to="/console" className="inline-flex items-center gap-2 rounded-sm border border-border bg-surface px-5 py-2.5 text-sm hover:bg-accent"><StatusDot pulse /> Open Live Console</Link>
              <Link to="/technology" className="inline-flex items-center px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">View Architecture →</Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <LiveStrip />
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">Live readout from the simulated demo device running in your browser.</p>
          </div>
        </div>
      </section>

      <section id="explore" className="mx-auto max-w-[1400px] scroll-mt-16 px-4 py-16 md:px-6">
        <p className="label-caps">Inside the watch</p>
        <h2 className="mt-2 text-3xl font-semibold">From case to cell, layer by layer</h2>
        <WatchExplode className="mt-8" />
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-[1400px] divide-y divide-border px-4 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-6">
          {PILLARS.map((p) => (
            <div key={p.k} className="py-8 md:px-6 md:first:pl-0">
              <p className="font-mono text-xs text-primary">{p.k}</p>
              <h3 className="mt-3 text-xl font-semibold">{p.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-6">
        <p className="label-caps">What is real in this prototype</p>
        <h2 className="mt-2 text-3xl font-semibold">Clear about what's simulated</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {CAPABILITY.map((c) => (
            <div key={c.label} className="rounded-md border border-border p-5">
              <div className="flex items-center gap-2"><StatusDot tone={c.tone} /><h3 className="font-mono text-xs uppercase tracking-wider">{c.label}</h3></div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">{c.items.map((i) => <li key={i}>— {i}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/console" className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">Start the walkthrough</Link>
          <Link to="/auth" className="rounded-sm border border-border px-5 py-2.5 text-sm hover:bg-accent">Sign in / Register device</Link>
        </div>
      </section>
    </div>
  );
}
