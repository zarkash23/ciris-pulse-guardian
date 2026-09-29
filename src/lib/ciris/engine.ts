import type { Activity, DeviceMode, Environment, PowerMode, SimState, Telemetry } from "./types";

// Simulated device physics. One tick = 1 real second, battery/charge uses a
// compressed clock (SIM_SECONDS per tick) so changes are visible in a demo.
export const SIM_SECONDS = 30;
const BATTERY_MWH = 814; // 220 mAh × 3.7 V LiPo

const HR_TARGET: Record<Activity, number> = { idle: 68, walking: 98, running: 146 };
const ACCEL: Record<Activity, [number, number]> = { idle: [1.0, 0.02], walking: [1.18, 0.14], running: [1.75, 0.38] };
const CADENCE: Record<Activity, number> = { idle: 0, walking: 1.8, running: 2.7 }; // steps / s
const ACTIVITY_LOAD: Record<Activity, number> = { idle: 0, walking: 6, running: 11 };

const ENV: Record<Environment, { temp: number; hum: number; pres: number }> = {
  normal: { temp: 22, hum: 46, pres: 1013 },
  high_temp: { temp: 38, hum: 32, pres: 1009 },
  high_humidity: { temp: 28, hum: 89, pres: 1006 },
  storm: { temp: 17, hum: 84, pres: 984 },
};

function solarTarget(power: PowerMode, env: Environment): number {
  const base: Record<PowerMode, number> = { normal: 42, charging: 125, low_battery: 30, darkness: 0, bright_sun: 185 };
  const envFactor = env === "storm" ? 0.25 : env === "high_humidity" ? 0.8 : 1;
  return base[power] * envFactor;
}

const approach = (cur: number, target: number, rate: number) => cur + (target - cur) * rate;
const noise = (amp: number) => (Math.random() * 2 - 1) * amp;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function initialTelemetry(): Telemetry {
  return {
    t: Date.now(), heartRate: 68, spo2: 97.8, skinTemp: 33.4, accelG: 1, steps: 4210,
    ambientTemp: 22, humidity: 46, pressure: 1013, battery: 78, solarMw: 42, loadMw: 19, charging: true,
  };
}

export function initialState(): SimState {
  return {
    running: true, activity: "idle", power: "normal", environment: "normal", safety: "normal",
    faults: [], countdown: null, telemetry: initialTelemetry(), tick: 0,
  };
}

export function step(s: SimState): Telemetry {
  const p = s.telemetry;
  const emergency = s.safety === "sos_active" || s.safety === "fall_detected";
  const lowPower = p.battery < 15;
  const env = ENV[s.environment];

  // Motion (BMI270)
  let accel: number;
  if (s.safety === "fall_detected" && s.countdown !== null && s.countdown > 12) accel = 0.08 + Math.random() * 0.1; // post-fall stillness
  else if (s.safety === "fall_detected" || s.safety === "sos_active") accel = 1.0 + noise(0.01);
  else { const [m, a] = ACCEL[s.activity]; accel = m + noise(a); }
  if (s.faults.includes("bmi270_noise")) accel += noise(1.2);
  accel = clamp(accel, 0, 16);

  const moving = s.safety === "normal" || s.safety === "sos_cancelled" || s.safety === "impact";
  const steps = p.steps + (moving ? Math.round(CADENCE[s.activity] * (0.9 + Math.random() * 0.2)) : 0);

  // Cardio (MAX30101) — HR follows activity + stress response
  let hrT = HR_TARGET[s.activity] + (emergency ? 28 : 0) + (s.environment === "high_temp" ? 8 : 0);
  let hr = approach(p.heartRate, hrT, 0.12) + noise(1.2);
  let spo2 = approach(p.spo2, s.activity === "running" ? 96.2 : 97.8, 0.1) + noise(0.15);
  if (s.faults.includes("max30101_signal_loss")) { hr = 0; spo2 = 0; }
  else if (p.heartRate === 0) { hr = hrT; spo2 = 97; }

  // Thermal (MAX30208/TMP117)
  let skin = approach(p.skinTemp, 33.2 + (s.activity === "running" ? 1.4 : s.activity === "walking" ? 0.6 : 0) + (env.temp - 22) * 0.12, 0.05) + noise(0.03);
  if (s.faults.includes("tmp117_stuck")) skin = p.skinTemp;

  // Environment (SHT31 / BME280)
  const ambient = approach(p.ambientTemp, env.temp + (skin - 33) * 0.3, 0.08) + noise(0.05);
  const humidity = clamp(approach(p.humidity, env.hum, 0.08) + noise(0.3), 0, 100);
  let pressure = approach(p.pressure, env.pres, 0.05) + noise(0.1);
  if (s.faults.includes("bme280_drift")) pressure = p.pressure + 0.9;

  // Power (CN3065 + LiPo)
  const solar = Math.max(0, approach(p.solarMw, solarTarget(s.power, s.environment), 0.25) + noise(solarTarget(s.power, s.environment) * 0.04));
  const load = (lowPower ? 11 : 18) + ACTIVITY_LOAD[s.activity] + (emergency ? 62 : 0) + noise(0.8);
  const net = solar * 0.82 - load; // charger efficiency
  const battery = clamp(p.battery + (net * SIM_SECONDS) / 3600 / BATTERY_MWH * 100, 0, 100);
  const charging = solar * 0.82 > 5 && battery < 100;

  return {
    t: Date.now(), heartRate: Math.max(0, Math.round(hr * 10) / 10), spo2: clamp(Math.round(spo2 * 10) / 10, 0, 100),
    skinTemp: Math.round(skin * 100) / 100, accelG: Math.round(accel * 100) / 100, steps,
    ambientTemp: Math.round(ambient * 10) / 10, humidity: Math.round(humidity * 10) / 10, pressure: Math.round(pressure * 10) / 10,
    battery: Math.round(battery * 100) / 100, solarMw: Math.round(solar * 10) / 10, loadMw: Math.round(load * 10) / 10, charging,
  };
}

export function deviceMode(s: SimState): DeviceMode {
  if (s.safety === "sos_active" || s.safety === "fall_detected") return "Emergency";
  if (s.telemetry.battery < 15) return "Low Power";
  if (s.power === "charging" || s.power === "bright_sun") return "Charging";
  return s.activity === "running" ? "Running" : s.activity === "walking" ? "Walking" : "Idle";
}

export const ACTIVITY_LABEL: Record<Activity, string> = { idle: "Idle", walking: "Walking", running: "Running" };
export const POWER_LABEL: Record<PowerMode, string> = { normal: "Normal", charging: "Charging", low_battery: "Low battery", darkness: "Darkness", bright_sun: "Bright sun" };
export const ENV_LABEL: Record<Environment, string> = { normal: "Normal", high_temp: "High temperature", high_humidity: "High humidity", storm: "Storm" };
export const FAULT_LABEL = {
  max30101_signal_loss: "MAX30101 optical signal loss",
  tmp117_stuck: "TMP117 reading stuck",
  bme280_drift: "BME280 pressure drift",
  bmi270_noise: "BMI270 excessive noise",
} as const;
