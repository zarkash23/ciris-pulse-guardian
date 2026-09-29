import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ACTIVITY_LABEL, ENV_LABEL, FAULT_LABEL, POWER_LABEL, initialState, step } from "./engine";
import { generateHistory, type HistoryPoint } from "./history";
import type {
  Activity, DeviceEvent, DiagnosticRecord, EmergencyContact, Environment, EventType, PowerMode, SensorFault, Severity, SimState, Telemetry,
} from "./types";

const COUNTDOWN_S = 15;
const uid = () => crypto.randomUUID();

interface Ctx {
  sim: SimState;
  live: Telemetry[];
  history: HistoryPoint[];
  events: DeviceEvent[];
  contacts: EmergencyContact[];
  diagnostics: DiagnosticRecord[];
  session: Session | null;
  authReady: boolean;
  setActivity: (a: Activity) => void;
  setPower: (p: PowerMode) => void;
  setEnvironment: (e: Environment) => void;
  toggleFault: (f: SensorFault) => void;
  toggleRunning: () => void;
  simulateFall: () => void;
  simulateImpact: () => void;
  triggerSOS: (source?: string) => void;
  cancelSOS: () => void;
  resolveSafety: () => void;
  emit: (type: EventType, severity: Severity, message: string, source: string, withTelemetry?: boolean) => void;
  addContact: (c: Omit<EmergencyContact, "id">) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  setPrimary: (id: string) => Promise<void>;
  addDiagnostic: (d: Omit<DiagnosticRecord, "id" | "created_at">) => DiagnosticRecord;
  clearEvents: () => void;
}

const CirisContext = createContext<Ctx | null>(null);

export function useCiris() {
  const c = useContext(CirisContext);
  if (!c) throw new Error("useCiris must be used inside CirisProvider");
  return c;
}

export function CirisProvider({ children }: { children: ReactNode }) {
  const [sim, setSim] = useState<SimState>(initialState);
  const [live, setLive] = useState<Telemetry[]>([]);
  const [events, setEvents] = useState<DeviceEvent[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticRecord[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [historyBase, setHistoryBase] = useState<HistoryPoint[]>([]);
  const simRef = useRef(sim);
  simRef.current = sim;
  const sessionRef = useRef(session);
  sessionRef.current = session;

  // ---- Auth ----
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // ---- Load persisted data for signed-in users ----
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) { setContacts([]); setDiagnostics([]); return; }
    (async () => {
      const [c, d, e] = await Promise.all([
        supabase.from("emergency_contacts").select("id,name,relation,phone,is_primary").order("created_at"),
        supabase.from("diagnostics").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("device_events").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      if (c.error || d.error || e.error) console.error("Failed to load CIRIS data", c.error ?? d.error ?? e.error);
      if (c.data) setContacts(c.data);
      if (d.data) setDiagnostics(d.data as unknown as DiagnosticRecord[]);
      if (e.data) setEvents((cur) => {
        const ids = new Set(cur.map((x) => x.id));
        return [...cur, ...(e.data as unknown as DeviceEvent[]).filter((x) => !ids.has(x.id))].sort((a, b) => b.created_at.localeCompare(a.created_at));
      });
    })();
  }, [userId]);

  useEffect(() => { setHistoryBase(generateHistory(Date.now(), simRef.current.telemetry.battery)); }, []);

  // ---- Events ----
  const emit = useCallback<Ctx["emit"]>((type, severity, message, source, withTelemetry = true) => {
    const t = simRef.current.telemetry;
    const ev: DeviceEvent = {
      id: uid(), created_at: new Date().toISOString(), type, severity, message, source,
      telemetry: withTelemetry ? { heartRate: t.heartRate, spo2: t.spo2, skinTemp: t.skinTemp, accelG: t.accelG, battery: t.battery, solarMw: t.solarMw, loadMw: t.loadMw } : null,
    };
    setEvents((cur) => [ev, ...cur].slice(0, 300));
    if (sessionRef.current) {
      supabase.from("device_events").insert({ ...ev, telemetry: ev.telemetry as never }).then(({ error }) => {
        if (error) console.error("Event persist failed", error);
      });
    }
  }, []);

  // ---- Simulation loop ----
  useEffect(() => {
    const id = setInterval(() => {
      const s = simRef.current;
      if (!s.running) return;
      const prev = s.telemetry;
      const next = step(s);
      let countdown = s.countdown;
      let safety = s.safety;
      if (safety === "fall_detected" && countdown !== null) {
        countdown -= 1;
        if (countdown <= 0) {
          countdown = null; safety = "sos_active";
          emit("sos_activated", "critical", "Countdown expired — SOS activated automatically. Emergency contacts notified (simulated).", "Safety / Fall pipeline");
        }
      }
      // Transition-driven events
      if (prev.battery >= 20 && next.battery < 20) emit("low_battery", "warning", `Battery below 20% (${next.battery.toFixed(1)}%).`, "Power / Fuel gauge");
      if (prev.battery >= 15 && next.battery < 15) emit("low_battery", "critical", "Battery below 15% — Low Power mode engaged.", "Power / Fuel gauge");
      if (!prev.charging && next.charging) emit("charging_started", "info", `Solar charging started (${next.solarMw.toFixed(0)} mW input).`, "Solar / CN3065");
      if (prev.charging && !next.charging) emit("charging_stopped", "info", "Solar charging stopped — insufficient light input.", "Solar / CN3065");
      if (prev.ambientTemp < 35 && next.ambientTemp >= 35) emit("high_temperature", "warning", `High ambient temperature: ${next.ambientTemp.toFixed(1)} °C. Heat-stress risk.`, "Environment / SHT31");
      if (prev.skinTemp < 37 && next.skinTemp >= 37) emit("high_temperature", "warning", `Elevated skin temperature: ${next.skinTemp.toFixed(2)} °C.`, "Thermal / MAX30208");
      if (s.faults.includes("bmi270_noise") && next.accelG > 2.6 && s.activity === "idle" && Math.random() < 0.15)
        emit("abnormal_motion", "warning", `Acceleration of ${next.accelG.toFixed(2)} g while device state is idle.`, "Motion / BMI270");

      setSim((cur) => ({ ...cur, telemetry: next, tick: cur.tick + 1, countdown, safety }));
      setLive((cur) => [...cur, next].slice(-600));
    }, 1000);
    return () => clearInterval(id);
  }, [emit]);

  // ---- Controls ----
  const setActivity = useCallback((a: Activity) => {
    setSim((s) => ({ ...s, activity: a }));
    emit("state_change", "info", `Activity set to ${ACTIVITY_LABEL[a]}.`, "Sandbox / Activity", false);
  }, [emit]);

  const setPower = useCallback((p: PowerMode) => {
    setSim((s) => ({ ...s, power: p, telemetry: p === "low_battery" ? { ...s.telemetry, battery: 12 } : s.telemetry }));
    emit("state_change", p === "low_battery" ? "warning" : "info", `Power scenario set to ${POWER_LABEL[p]}.`, "Sandbox / Power", false);
  }, [emit]);

  const setEnvironment = useCallback((e: Environment) => {
    setSim((s) => ({ ...s, environment: e }));
    emit("state_change", e === "normal" ? "info" : "warning", `Environment set to ${ENV_LABEL[e]}.`, "Sandbox / Environment", false);
  }, [emit]);

  const toggleFault = useCallback((f: SensorFault) => {
    const active = simRef.current.faults.includes(f);
    setSim((s) => ({ ...s, faults: active ? s.faults.filter((x) => x !== f) : [...s.faults, f] }));
    emit("sensor_anomaly", active ? "info" : "warning", active ? `Fault cleared: ${FAULT_LABEL[f]}.` : `Fault injected: ${FAULT_LABEL[f]}.`, "Sandbox / Fault injection");
  }, [emit]);

  const toggleRunning = useCallback(() => setSim((s) => ({ ...s, running: !s.running })), []);

  const simulateFall = useCallback(() => {
    const t = simRef.current.telemetry;
    setSim((s) => ({ ...s, safety: "fall_detected", countdown: COUNTDOWN_S, telemetry: { ...s.telemetry, accelG: 4.6, pressure: s.telemetry.pressure + 0.12 } }));
    emit("abnormal_motion", "warning", "Free-fall phase detected (0.21 g for 380 ms) followed by 4.6 g impact.", "Motion / BMI270");
    emit("fall_detected", "critical", `Fall detected. Post-impact stillness confirmed. HR ${t.heartRate.toFixed(0)} bpm. SOS countdown started (${COUNTDOWN_S}s).`, "Safety / Fall pipeline");
  }, [emit]);

  const simulateImpact = useCallback(() => {
    setSim((s) => ({ ...s, safety: "impact", telemetry: { ...s.telemetry, accelG: 6.2 } }));
    emit("impact_detected", "warning", "Hard impact of 6.2 g without free-fall phase. Wearer still moving — no SOS countdown.", "Motion / BMI270");
  }, [emit]);

  const triggerSOS = useCallback((source = "Safety / SOS button") => {
    setSim((s) => ({ ...s, safety: "sos_active", countdown: null }));
    emit("sos_activated", "critical", "SOS activated. Haptic + buzzer on. Emergency contacts notified (simulated — no real messages sent).", source);
  }, [emit]);

  const cancelSOS = useCallback(() => {
    setSim((s) => ({ ...s, safety: "sos_cancelled", countdown: null }));
    emit("sos_cancelled", "info", "Emergency response cancelled by wearer.", "Safety / User");
  }, [emit]);

  const resolveSafety = useCallback(() => {
    setSim((s) => ({ ...s, safety: "normal", countdown: null }));
    emit("state_change", "info", "Safety status returned to normal.", "Safety / User", false);
  }, [emit]);

  // ---- Contacts ----
  const addContact = useCallback<Ctx["addContact"]>(async (c) => {
    const row = { id: uid(), ...c };
    if (sessionRef.current) {
      const { error } = await supabase.from("emergency_contacts").insert(row);
      if (error) throw error;
    }
    setContacts((cur) => [...cur, row]);
  }, []);
  const removeContact = useCallback<Ctx["removeContact"]>(async (id) => {
    if (sessionRef.current) { const { error } = await supabase.from("emergency_contacts").delete().eq("id", id); if (error) throw error; }
    setContacts((cur) => cur.filter((c) => c.id !== id));
  }, []);
  const setPrimary = useCallback<Ctx["setPrimary"]>(async (id) => {
    if (sessionRef.current) {
      const uidv = sessionRef.current.user.id;
      const a = await supabase.from("emergency_contacts").update({ is_primary: false }).eq("user_id", uidv);
      const b = await supabase.from("emergency_contacts").update({ is_primary: true }).eq("id", id);
      if (a.error || b.error) throw a.error ?? b.error;
    }
    setContacts((cur) => cur.map((c) => ({ ...c, is_primary: c.id === id })));
  }, []);

  // ---- Diagnostics ----
  const addDiagnostic = useCallback<Ctx["addDiagnostic"]>((d) => {
    const rec: DiagnosticRecord = { ...d, id: uid(), created_at: new Date().toISOString() };
    setDiagnostics((cur) => [rec, ...cur]);
    if (sessionRef.current) {
      supabase.from("diagnostics").insert({ ...rec, result: rec.result as never }).then(({ error }) => { if (error) console.error("Diagnostic persist failed", error); });
    }
    emit("diagnostic_completed", rec.status === "OK" ? "info" : rec.status === "WARNING" ? "warning" : "critical",
      `${rec.engine === "ai" ? "AI" : "Local"} diagnostic (${rec.mode}) completed: ${rec.status} — ${rec.summary}`, "Support / Diagnostics", false);
    return rec;
  }, [emit]);

  const clearEvents = useCallback(() => setEvents([]), []);

  // History = generated base + live samples appended at 2-minute-equivalent spacing
  const history = useMemo(() => {
    if (!historyBase.length) return [];
    const liveSampled = live.filter((_, i) => i % 10 === 0).map((t) => ({
      t: t.t, heartRate: t.heartRate, spo2: t.spo2, skinTemp: t.skinTemp, battery: t.battery, solarMw: t.solarMw,
      activity: ["idle", "walking", "running"].indexOf(sim.activity), state: "Live",
    }));
    return [...historyBase, ...liveSampled];
  }, [historyBase, live, sim.activity]);

  const value: Ctx = {
    sim, live, history, events, contacts, diagnostics, session, authReady,
    setActivity, setPower, setEnvironment, toggleFault, toggleRunning, simulateFall, simulateImpact, triggerSOS, cancelSOS, resolveSafety,
    emit, addContact, removeContact, setPrimary, addDiagnostic, clearEvents,
  };
  return <CirisContext.Provider value={value}>{children}</CirisContext.Provider>;
}
