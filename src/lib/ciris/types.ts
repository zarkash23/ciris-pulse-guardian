export type Activity = "idle" | "walking" | "running";
export type PowerMode = "normal" | "charging" | "low_battery" | "darkness" | "bright_sun";
export type Environment = "normal" | "high_temp" | "high_humidity" | "storm";
export type SafetyState = "normal" | "fall_detected" | "impact" | "sos_active" | "sos_cancelled";
export type SensorFault = "max30101_signal_loss" | "tmp117_stuck" | "bme280_drift" | "bmi270_noise";
export type DeviceMode = "Idle" | "Walking" | "Running" | "Emergency" | "Charging" | "Low Power";

export interface Telemetry {
  t: number; // epoch ms
  heartRate: number; // bpm
  spo2: number; // %
  skinTemp: number; // °C
  accelG: number; // |a| in g
  steps: number;
  ambientTemp: number; // °C
  humidity: number; // %RH
  pressure: number; // hPa
  battery: number; // %
  solarMw: number;
  loadMw: number;
  charging: boolean;
}

export interface SimState {
  running: boolean;
  activity: Activity;
  power: PowerMode;
  environment: Environment;
  safety: SafetyState;
  faults: SensorFault[];
  countdown: number | null; // seconds until simulated SOS
  telemetry: Telemetry;
  tick: number;
}

export type Severity = "info" | "warning" | "critical";
export type EventType =
  | "sensor_anomaly"
  | "fall_detected"
  | "impact_detected"
  | "sos_activated"
  | "sos_cancelled"
  | "low_battery"
  | "charging_started"
  | "charging_stopped"
  | "high_temperature"
  | "abnormal_motion"
  | "diagnostic_completed"
  | "state_change";

export interface DeviceEvent {
  id: string;
  created_at: string;
  type: EventType;
  severity: Severity;
  message: string;
  source: string;
  telemetry?: Partial<Telemetry> | null;
}

export type DiagStatus = "OK" | "WARNING" | "CRITICAL";
export interface DiagFinding {
  detected: string;
  evidence: string;
  subsystem: string;
  likely_cause: string;
  recommended_action: string;
  confidence: number; // 0-100
  severity: DiagStatus;
}
export interface DiagResult {
  status: DiagStatus;
  summary: string;
  findings: DiagFinding[];
  safety_note: string;
}
export type DiagMode = "full" | "quick" | "event" | "sensor" | "battery" | "safety";
export interface DiagnosticRecord {
  id: string;
  created_at: string;
  mode: DiagMode;
  status: DiagStatus;
  subsystem: string | null;
  summary: string;
  result: DiagResult;
  engine: "ai" | "local";
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string | null;
  phone: string;
  is_primary: boolean;
}
