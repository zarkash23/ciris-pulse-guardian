import type { CirisContext } from "./context";
import type { DiagFinding, DiagMode, DiagResult, DiagStatus } from "./types";

/**
 * Local rule engine — NOT an AI model. Used in Demo Mode (signed out) or when
 * the AI service is unavailable. Produces structured findings from the same context.
 */
export function runLocalDiagnostics(ctx: CirisContext, mode: DiagMode): DiagResult {
  const t = ctx.telemetry;
  const d = ctx.device_state;
  const f: DiagFinding[] = [];
  const add = (x: DiagFinding) => f.push(x);

  const wantPower = ["full", "quick", "battery"].includes(mode);
  const wantSensor = ["full", "quick", "sensor"].includes(mode);
  const wantSafety = ["full", "quick", "safety", "event"].includes(mode);

  if (wantSensor && d.injected_faults.some((x) => x.includes("MAX30101")) || (wantSensor && t.heartRate === 0))
    add({ detected: "Optical sensor returning no signal", evidence: `Heart rate ${t.heartRate} bpm and SpO₂ ${t.spo2}% while motion is ${t.accelG} g (wearer active).`, subsystem: "Optical (MAX30101)", likely_cause: "Poor skin contact, obstructed window or LED/photodiode fault.", recommended_action: "Tighten strap and clean the sensor window. If it persists, run hardware self-test and file an RMA.", confidence: 88, severity: "WARNING" });
  if (wantSensor && d.injected_faults.some((x) => x.includes("TMP117")))
    add({ detected: "Thermal reading not updating", evidence: `Skin temperature fixed at ${t.skinTemp} °C across recent samples while activity changed.`, subsystem: "Thermal (TMP117/MAX30208)", likely_cause: "Stuck sensor register or I²C bus hang.", recommended_action: "Reboot the thermal bus; compare with the redundant channel.", confidence: 81, severity: "WARNING" });
  if (wantSensor && d.injected_faults.some((x) => x.includes("BME280")))
    add({ detected: "Barometric drift", evidence: `Pressure ${t.pressure} hPa rising steadily without matching weather change.`, subsystem: "Environment (BME280)", likely_cause: "Sensor drift or blocked vent.", recommended_action: "Recalibrate against a reference and check the vent membrane.", confidence: 74, severity: "WARNING" });
  if (wantSensor && d.injected_faults.some((x) => x.includes("BMI270")))
    add({ detected: "Excessive motion noise", evidence: `Live acceleration peaked at ${ctx.history.summary.live_accelG?.max ?? t.accelG} g while activity is ${d.activity}.`, subsystem: "Motion (BMI270)", likely_cause: "Loose mounting or accelerometer fault — raises false fall-alert risk.", recommended_action: "Inspect enclosure and re-seat the sensor board.", confidence: 79, severity: "WARNING" });

  if (wantPower) {
    if (t.battery < 15)
      add({ detected: "Critical battery level", evidence: `Battery ${t.battery.toFixed(1)}%, load ${t.loadMw} mW, solar ${t.solarMw} mW.`, subsystem: "Power", likely_cause: "Consumption exceeded harvest over time.", recommended_action: "Move into bright light or recharge; Low Power mode is active.", confidence: 95, severity: "CRITICAL" });
    else if (t.loadMw > t.solarMw * 0.82 && ctx.history.battery_change_pct < -0.5)
      add({ detected: "Net battery drain", evidence: `Battery changed ${ctx.history.battery_change_pct}% recently; load ${t.loadMw} mW vs solar ${t.solarMw} mW.`, subsystem: "Power", likely_cause: `${d.activity !== "idle" ? "High activity" : "System load"} combined with insufficient solar input.`, recommended_action: "Reduce activity or increase light exposure.", confidence: 83, severity: "WARNING" });
    else
      add({ detected: t.charging ? "Solar charging healthy" : "Power balanced", evidence: `Solar ${t.solarMw} mW, load ${t.loadMw} mW, battery ${t.battery.toFixed(1)}%.`, subsystem: "Power", likely_cause: "Normal operation.", recommended_action: "No action needed.", confidence: 90, severity: "OK" });
  }

  if (wantSafety) {
    if (d.safety === "sos_active")
      add({ detected: "SOS active", evidence: ctx.alerts[0]?.message ?? "Emergency state active.", subsystem: "Safety", likely_cause: "Manual SOS or unacknowledged fall.", recommended_action: "Confirm wearer wellbeing. If anyone may be injured, contact emergency services.", confidence: 97, severity: "CRITICAL" });
    else if (d.safety === "fall_detected")
      add({ detected: "Fall event in progress", evidence: `Impact spike followed by stillness; SOS in ${d.sos_countdown_s}s.`, subsystem: "Safety / Motion", likely_cause: "Free-fall + impact + stillness pattern.", recommended_action: "Cancel if the wearer is fine; otherwise allow SOS.", confidence: 90, severity: "CRITICAL" });
    else if (d.safety === "impact")
      add({ detected: "Impact without fall pattern", evidence: "6 g spike without free-fall; wearer still moving.", subsystem: "Motion", likely_cause: "Knock against an object.", recommended_action: "Check the device for damage.", confidence: 72, severity: "WARNING" });
    else if (mode === "safety" || mode === "event")
      add({ detected: "No active safety event", evidence: `Safety state ${d.safety}; ${ctx.alerts.length} recent alerts.`, subsystem: "Safety", likely_cause: "—", recommended_action: "No action needed.", confidence: 88, severity: "OK" });
  }

  if ((mode === "full" || mode === "quick") && t.heartRate > 120 && d.activity === "idle" && d.safety === "normal")
    add({ detected: "Elevated heart rate at rest", evidence: `HR ${t.heartRate} bpm while idle.`, subsystem: "Optical (MAX30101)", likely_cause: "Could be stress, heat or measurement artefact. This is a device observation, not a diagnosis.", recommended_action: "Rest and re-measure. Seek medical advice if it persists or symptoms occur.", confidence: 65, severity: "WARNING" });
  if (["full", "quick", "sensor"].includes(mode) && t.spo2 > 0 && t.spo2 < 92)
    add({ detected: "Low SpO₂ reading", evidence: `SpO₂ ${t.spo2}%.`, subsystem: "Optical (MAX30101)", likely_cause: "Motion artefact or poor contact are common; low oxygen is possible.", recommended_action: "Re-measure at rest. If low readings persist or breathing is difficult, seek medical help immediately.", confidence: 60, severity: "CRITICAL" });
  if (["full", "quick", "sensor"].includes(mode) && t.ambientTemp >= 35)
    add({ detected: "Heat stress conditions", evidence: `Ambient ${t.ambientTemp} °C, humidity ${t.humidity}%, skin ${t.skinTemp} °C.`, subsystem: "Environment", likely_cause: "Hot environment.", recommended_action: "Hydrate and find shade; reduce exertion.", confidence: 85, severity: "WARNING" });

  if (!f.length)
    add({ detected: "All checked subsystems nominal", evidence: `HR ${t.heartRate} bpm, SpO₂ ${t.spo2}%, battery ${t.battery.toFixed(1)}%, safety ${d.safety}.`, subsystem: "System", likely_cause: "—", recommended_action: "No action needed.", confidence: 90, severity: "OK" });

  const rank: Record<DiagStatus, number> = { OK: 0, WARNING: 1, CRITICAL: 2 };
  f.sort((a, b) => rank[b.severity] - rank[a.severity]);
  const status = f[0].severity;
  return {
    status,
    summary: f[0].detected,
    findings: f,
    safety_note: "Device observations only — not a medical diagnosis. For concerning symptoms or readings, contact a healthcare professional or emergency services.",
  };
}
