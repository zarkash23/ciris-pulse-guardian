import { useCiris } from "@/lib/ciris/store";
import { ACTIVITY_LABEL, ENV_LABEL, FAULT_LABEL, POWER_LABEL } from "@/lib/ciris/engine";
import type { Activity, Environment, PowerMode, SensorFault } from "@/lib/ciris/types";
import { cn } from "@/lib/utils";
import { Panel } from "./bits";

function Seg<T extends string>({ label, options, value, onChange, labels }: { label: string; options: T[]; value: T; onChange: (v: T) => void; labels: Record<T, string> }) {
  return (
    <div>
      <p className="label-caps mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} aria-pressed={value === o}
            className={cn("min-h-10 rounded-sm border px-3 text-sm transition-colors", value === o ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground")}>
            {labels[o]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SandboxControls({ compact }: { compact?: boolean }) {
  const c = useCiris();
  const s = c.sim;
  return (
    <Panel title="Engineering Sandbox" action={<span className="font-mono text-[10.5px] uppercase text-muted-foreground">Simulation controls</span>}>
      <div className={cn("grid gap-6", !compact && "md:grid-cols-2")}>
        <Seg label="Activity" options={["idle", "walking", "running"] as Activity[]} value={s.activity} onChange={c.setActivity} labels={ACTIVITY_LABEL} />
        <div>
          <p className="label-caps mb-2">Safety</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={c.resolveSafety} className={cn("min-h-10 rounded-sm border px-3 text-sm", s.safety === "normal" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-accent")}>Normal</button>
            <button onClick={c.simulateFall} disabled={s.safety === "fall_detected" || s.safety === "sos_active"} className="min-h-10 rounded-sm border border-border px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40">Simulate fall</button>
            <button onClick={c.simulateImpact} className="min-h-10 rounded-sm border border-border px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">Simulate impact</button>
            <button onClick={() => c.triggerSOS("Sandbox / SOS")} disabled={s.safety === "sos_active"} className="min-h-10 rounded-sm border border-critical/50 px-3 text-sm text-critical hover:bg-critical/10 disabled:opacity-40">Trigger SOS</button>
          </div>
        </div>
        <Seg label="Power" options={["normal", "charging", "low_battery", "darkness", "bright_sun"] as PowerMode[]} value={s.power} onChange={c.setPower} labels={POWER_LABEL} />
        <Seg label="Environment" options={["normal", "high_temp", "high_humidity", "storm"] as Environment[]} value={s.environment} onChange={c.setEnvironment} labels={ENV_LABEL} />
        {!compact && (
          <div className="md:col-span-2">
            <p className="label-caps mb-2">Sensor fault injection</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FAULT_LABEL) as SensorFault[]).map((f) => {
                const on = s.faults.includes(f);
                return (
                  <button key={f} onClick={() => c.toggleFault(f)} aria-pressed={on}
                    className={cn("min-h-10 rounded-sm border px-3 text-sm", on ? "border-warning bg-warning/10 text-warning" : "border-border text-muted-foreground hover:bg-accent hover:text-foreground")}>
                    {on ? "● " : ""}{FAULT_LABEL[f]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
