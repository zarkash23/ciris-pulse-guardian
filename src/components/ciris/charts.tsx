import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HistoryPoint } from "@/lib/ciris/history";
import type { Telemetry } from "@/lib/ciris/types";

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "IBM Plex Mono", tickLine: false, axisLine: false };
const hhmm = (t: number) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type Key = "heartRate" | "spo2" | "skinTemp" | "battery" | "solarMw" | "activity";
const ACT = ["Idle", "Walking", "Running"];

export function HistoryChart({ data, dataKey, color, unit, domain }: { data: HistoryPoint[]; dataKey: Key; color: string; unit: string; domain?: [number | "auto", number | "auto"] | undefined }) {
  const id = `g-${dataKey}`;
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="t" tickFormatter={hhmm} {...axis} minTickGap={40} />
          <YAxis {...axis} domain={domain ?? ["auto", "auto"]} width={48} tickFormatter={(v) => (dataKey === "activity" ? ACT[v]?.[0] ?? "" : String(v))} />
          <Tooltip
            cursor={{ stroke: "var(--color-muted-foreground)", strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]!.payload as HistoryPoint;
              const v = p[dataKey];
              return (
                <div className="rounded-sm border border-border bg-popover px-3 py-2 font-mono text-xs shadow-lg">
                  <div className="text-muted-foreground">{new Date(p.t).toLocaleString([], { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}</div>
                  <div className="mt-1 text-sm text-foreground">{dataKey === "activity" ? ACT[v] : v}{dataKey !== "activity" && <span className="text-muted-foreground"> {unit}</span>}</div>
                  <div className="text-muted-foreground">State: {p.state}</div>
                </div>
              );
            }}
          />
          <Area type={dataKey === "activity" ? "stepAfter" : "monotone"} dataKey={dataKey} stroke={color} strokeWidth={1.5} fill={`url(#${id})`} isAnimationActive={false} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LiveTrace({ data, dataKey, color, height = 64 }: { data: Telemetry[]; dataKey: keyof Telemetry; color: string; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer>
        <LineChart data={data.slice(-90)} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <YAxis hide domain={["auto", "auto"]} />
          <Line type="monotone" dataKey={dataKey as string} stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
