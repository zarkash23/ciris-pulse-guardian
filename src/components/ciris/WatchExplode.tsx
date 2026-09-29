import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Vector (SVG) exploded view rendered in CSS 3D — resolution independent on any DPI,
// no raster assets to load, fixed aspect ratio so no layout shift.
const STAGES = [
  { key: "closed", label: "Closed", title: "CIRIS", text: "A 42 mm sealed wearable. Solar dial, sapphire-style crystal, dedicated SOS button.", focus: [] as string[] },
  { key: "enclosure", label: "Enclosure", title: "Enclosure", text: "Aluminium case with vented environmental port and IP-sealed SOS button.", focus: ["bezel", "case"] },
  { key: "pcb", label: "PCB", title: "Main board", text: "Double-sided 4-layer PCB carrying compute, motion sensing and power management.", focus: ["pcb"] },
  { key: "sensors", label: "Sensors", title: "Sensor stack", text: "MAX30101 optical PPG and MAX30208 skin temperature sit in the case back, touching the wrist.", focus: ["back"] },
  { key: "processor", label: "Processor", title: "ESP32-S3", text: "Dual-core 240 MHz with BLE 5. Runs sensor fusion, fall detection and power policy.", focus: ["pcb", "cpu"] },
  { key: "power", label: "Power", title: "Power system", text: "CN3065 solar charger, protection and regulation feed every subsystem.", focus: ["pcb", "pmic"] },
  { key: "battery", label: "Battery", title: "LiPo cell", text: "220 mAh lithium-polymer cell, about 0.81 Wh of storage.", focus: ["battery"] },
  { key: "solar", label: "Solar", title: "Solar dial", text: "Photovoltaic ring under the display harvests up to ~200 mW in full sun.", focus: ["solar"] },
  { key: "assembled", label: "Assembled", title: "Reassembled", text: "Continuous sensing. Autonomous power. Immediate emergency response.", focus: [] },
];

const LAYERS = [
  { id: "back", z: 0 },
  { id: "battery", z: 1 },
  { id: "pcb", z: 2 },
  { id: "solar", z: 3 },
  { id: "display", z: 4 },
  { id: "bezel", z: 5 },
];

function LayerArt({ id, focus }: { id: string; focus: string[] }) {
  const hot = (k: string) => focus.includes(k);
  const stroke = "var(--color-border)";
  const amber = "var(--color-primary)";
  switch (id) {
    case "back":
      return (
        <svg viewBox="0 0 300 300" className="size-full">
          <circle cx="150" cy="150" r="128" fill="var(--color-inset)" stroke={hot("back") ? amber : stroke} strokeWidth="2" />
          <circle cx="150" cy="150" r="100" fill="none" stroke={stroke} strokeDasharray="3 5" />
          <circle cx="150" cy="150" r="34" fill="oklch(0.12 0.004 255)" stroke={hot("back") ? amber : stroke} strokeWidth="1.5" />
          <circle cx="138" cy="150" r="6" fill="oklch(0.6 0.2 25)" opacity={hot("back") ? 1 : 0.5} />
          <circle cx="162" cy="150" r="6" fill="oklch(0.55 0.12 150)" opacity={hot("back") ? 1 : 0.5} />
          <rect x="146" y="132" width="8" height="8" fill="var(--color-muted-foreground)" />
          <rect x="190" y="140" width="22" height="20" rx="2" fill="var(--color-secondary)" stroke={hot("back") ? amber : stroke} />
        </svg>
      );
    case "battery":
      return (
        <svg viewBox="0 0 300 300" className="size-full">
          <rect x="70" y="80" width="160" height="140" rx="14" fill="oklch(0.24 0.01 255)" stroke={hot("battery") ? amber : stroke} strokeWidth="2" />
          <rect x="86" y="96" width="128" height="108" rx="8" fill="none" stroke={stroke} />
          <text x="150" y="146" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="13" fill="var(--color-muted-foreground)">LiPo 3.7V</text>
          <text x="150" y="166" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="13" fill={hot("battery") ? amber : "var(--color-muted-foreground)"}>220 mAh</text>
          <rect x="140" y="66" width="20" height="14" fill={stroke} />
        </svg>
      );
    case "pcb":
      return (
        <svg viewBox="0 0 300 300" className="size-full">
          <circle cx="150" cy="150" r="118" fill="oklch(0.28 0.05 160)" stroke={hot("pcb") ? amber : "oklch(0.4 0.05 160)"} strokeWidth="2" />
          {[...Array(9)].map((_, i) => <path key={i} d={`M${60 + i * 20} 90 V${200 - (i % 3) * 15} H${80 + i * 18}`} stroke="oklch(0.45 0.07 150)" fill="none" strokeWidth="1" />)}
          <rect x="112" y="112" width="52" height="52" rx="3" fill="oklch(0.2 0.005 255)" stroke={hot("cpu") ? amber : "oklch(0.5 0.01 255)"} strokeWidth={hot("cpu") ? 2.5 : 1} />
          <text x="138" y="142" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="8" fill="var(--color-muted-foreground)">ESP32-S3</text>
          <rect x="182" y="120" width="26" height="18" rx="2" fill="oklch(0.2 0.005 255)" stroke={hot("pmic") ? amber : "oklch(0.5 0.01 255)"} strokeWidth={hot("pmic") ? 2.5 : 1} />
          <rect x="182" y="146" width="18" height="14" rx="2" fill="oklch(0.2 0.005 255)" stroke={hot("pmic") ? amber : "oklch(0.5 0.01 255)"} strokeWidth={hot("pmic") ? 2.5 : 1} />
          <rect x="120" y="182" width="22" height="16" rx="2" fill="oklch(0.2 0.005 255)" stroke="oklch(0.5 0.01 255)" />
          <rect x="84" y="138" width="16" height="16" rx="2" fill="oklch(0.2 0.005 255)" stroke="oklch(0.5 0.01 255)" />
        </svg>
      );
    case "solar":
      return (
        <svg viewBox="0 0 300 300" className="size-full">
          <circle cx="150" cy="150" r="124" fill="oklch(0.22 0.04 255)" stroke={hot("solar") ? amber : stroke} strokeWidth="2" />
          <circle cx="150" cy="150" r="80" fill="var(--color-background)" stroke={stroke} />
          {[...Array(24)].map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <line key={i} x1={150 + Math.cos(a) * 82} y1={150 + Math.sin(a) * 82} x2={150 + Math.cos(a) * 122} y2={150 + Math.sin(a) * 122} stroke={hot("solar") ? "oklch(0.6 0.08 72)" : "oklch(0.35 0.03 255)"} strokeWidth="1.2" />;
          })}
        </svg>
      );
    case "display":
      return (
        <svg viewBox="0 0 300 300" className="size-full">
          <circle cx="150" cy="150" r="80" fill="oklch(0.13 0.004 255)" stroke={stroke} />
          <text x="150" y="146" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="26" fill="var(--color-foreground)">72</text>
          <text x="150" y="166" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="9" fill="var(--color-muted-foreground)">BPM · 98% SpO₂</text>
          <circle cx="150" cy="150" r="64" fill="none" stroke={amber} strokeWidth="2.5" strokeDasharray="300 400" strokeLinecap="round" transform="rotate(-90 150 150)" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 300 300" className="size-full">
          <circle cx="150" cy="150" r="132" fill="none" stroke={hot("bezel") ? amber : "oklch(0.55 0.005 255)"} strokeWidth="10" />
          <circle cx="150" cy="150" r="126" fill="oklch(0.9 0.01 255 / 0.04)" stroke="oklch(0.7 0.005 255 / 0.4)" />
          {[...Array(12)].map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={150 + Math.cos(a) * 126} y1={150 + Math.sin(a) * 126} x2={150 + Math.cos(a) * 136} y2={150 + Math.sin(a) * 136} stroke="oklch(0.3 0.005 255)" strokeWidth="2" />;
          })}
          <rect x="276" y="140" width="14" height="20" rx="3" fill={hot("bezel") ? amber : "oklch(0.66 0.2 25)"} />
        </svg>
      );
  }
}

export function WatchExplode({ className }: { className?: string }) {
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setPlaying(false); return; }
    const id = setTimeout(() => setStage((s) => (s + 1) % STAGES.length), stage === 0 || stage === 8 ? 2200 : 2800);
    return () => clearTimeout(id);
  }, [stage, playing]);

  const s = STAGES[stage];
  const exploded = stage > 0 && stage < 8;

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center", className)}>
      <div className="relative aspect-square w-full max-w-[560px] justify-self-center overflow-hidden" style={{ perspective: "1400px" }}>
        <div className="absolute inset-0 transition-transform duration-1000 ease-out" style={{ transformStyle: "preserve-3d", transform: exploded ? "rotateX(58deg) rotateZ(-32deg) scale(0.78)" : "rotateX(0deg) rotateZ(0deg) scale(0.92)" }}>
          {LAYERS.map((l) => {
            const inFocus = s.focus.length === 0 || s.focus.some((f) => (f === "cpu" || f === "pmic" ? l.id === "pcb" : f === "case" ? l.id === "back" : f === l.id));
            return (
              <div key={l.id} className="absolute inset-[6%] transition-all duration-1000 ease-out"
                style={{ transform: `translateZ(${exploded ? (l.z - 2.5) * 70 : l.z * 2}px)`, opacity: exploded ? (inFocus ? 1 : 0.28) : 1, willChange: "transform" }}>
                <LayerArt id={l.id} focus={s.focus} />
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <p className="label-caps">{String(stage + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")} · {s.label}</p>
        <h3 className="mt-2 text-2xl font-semibold">{s.title}</h3>
        <p className="mt-2 min-h-[4.5rem] text-sm text-muted-foreground">{s.text}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {STAGES.map((x, i) => (
            <button key={x.key} onClick={() => { setStage(i); setPlaying(false); }}
              className={cn("rounded-sm border px-2 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors", i === stage ? "border-primary text-primary" : "border-border text-muted-foreground hover:text-foreground")}>
              {x.label}
            </button>
          ))}
        </div>
        <button onClick={() => setPlaying((p) => !p)} className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />} {playing ? "Pause" : "Play"} sequence
        </button>
      </div>
    </div>
  );
}
