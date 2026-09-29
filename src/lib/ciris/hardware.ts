export type HwCategory = "Compute" | "Optical" | "Motion" | "Thermal" | "Environment" | "Power" | "Solar" | "Safety" | "Audio/Haptic";

export interface HwComponent {
  id: string;
  name: string;
  category: HwCategory;
  purpose: string;
  role: string;
  specs: [string, string][];
  details: string;
  bus: string;
  sampling: string;
}

export const HARDWARE: HwComponent[] = [
  { id: "esp32s3", name: "ESP32-S3", category: "Compute", bus: "—", sampling: "240 MHz dual-core",
    purpose: "Main microcontroller with BLE 5 radio.",
    role: "Runs sensor fusion, fall detection, power management and the BLE link to the companion app.",
    specs: [["Core", "Dual Xtensa LX7 @ 240 MHz"], ["Memory", "512 KB SRAM + PSRAM"], ["Radio", "Wi-Fi 4 + Bluetooth LE 5"], ["Deep sleep", "~7 µA"]],
    details: "Vector instructions accelerate the on-device motion classifier. Wi-Fi is disabled in normal operation to save power; BLE is used for telemetry and alerts." },
  { id: "max30101", name: "MAX30101", category: "Optical", bus: "I²C 0x57", sampling: "100 Hz (PPG)",
    purpose: "Pulse oximeter and heart-rate sensor (PPG).",
    role: "Measures heart rate and SpO₂ with red, IR and green LEDs through the case back.",
    specs: [["LEDs", "Red 660 nm, IR 880 nm, Green 537 nm"], ["ADC", "18-bit"], ["Supply", "1.8 V + 3.3 V LED"], ["FIFO", "32 samples"]],
    details: "SpO₂ is derived from the ratio of pulsatile red/IR absorption. Readings degrade with motion, poor skin contact and cold extremities; CIRIS flags low-quality windows instead of reporting them." },
  { id: "bmi270", name: "BMI270", category: "Motion", bus: "SPI", sampling: "100 Hz (400 Hz on trigger)",
    purpose: "6-axis accelerometer + gyroscope.",
    role: "Step counting, activity classification and the fall/impact detection pipeline.",
    specs: [["Accel range", "±2 / 4 / 8 / 16 g"], ["Gyro range", "up to ±2000 °/s"], ["Current", "~685 µA full mode"], ["Features", "Wrist gesture, step counter"]],
    details: "Fall detection looks for a free-fall phase (<0.4 g), an impact spike (>3 g) and a stillness window. Each stage is logged as evidence for diagnostics." },
  { id: "max30208", name: "MAX30208", category: "Thermal", bus: "I²C 0x50", sampling: "1 Hz",
    purpose: "Clinical-grade skin temperature sensor.",
    role: "Primary skin-contact temperature channel.",
    specs: [["Accuracy", "±0.1 °C (30–50 °C)"], ["Resolution", "0.005 °C"], ["Supply", "1.7–3.6 V"]],
    details: "Mounted against the case back with a thermal pad. Skin temperature tracks core trends slowly and is affected by ambient conditions." },
  { id: "tmp117", name: "TMP117", category: "Thermal", bus: "I²C 0x48", sampling: "1 Hz",
    purpose: "High-accuracy digital temperature sensor.",
    role: "Redundant/board temperature channel used to cross-check the skin sensor and battery safety.",
    specs: [["Accuracy", "±0.1 °C"], ["Resolution", "0.0078 °C"], ["Current", "3.5 µA @ 1 Hz"]],
    details: "Disagreement between MAX30208 and TMP117 is one of the signals CIRIS diagnostics uses to spot a stuck or failing thermal sensor." },
  { id: "sht31", name: "SHT31", category: "Environment", bus: "I²C 0x44", sampling: "0.2 Hz",
    purpose: "Ambient humidity and temperature sensor.",
    role: "Heat-stress context and cross-check of ambient temperature.",
    specs: [["RH accuracy", "±2 %RH"], ["Temp accuracy", "±0.3 °C"], ["Heater", "Built-in, for condensation"]],
    details: "Vented through a membrane in the case side. High humidity combined with high temperature raises the heat-stress advisory." },
  { id: "bme280", name: "BME280", category: "Environment", bus: "I²C 0x76", sampling: "0.2 Hz",
    purpose: "Barometric pressure, humidity and temperature.",
    role: "Weather trend (storm warning) and altitude change support for fall detection.",
    specs: [["Pressure", "300–1100 hPa, ±1 hPa"], ["Relative accuracy", "±0.12 hPa (≈1 m)"], ["Current", "3.6 µA @ 1 Hz"]],
    details: "A sudden ~0.1 hPa increase aligned with an impact supports a fall hypothesis (height drop). Steady drift without weather change suggests sensor drift." },
  { id: "cn3065", name: "CN3065", category: "Solar", bus: "GPIO (CHRG/DONE)", sampling: "Status pins",
    purpose: "Linear Li-ion charger optimised for solar input.",
    role: "Harvests the solar cell output and charges the LiPo safely.",
    specs: [["Input", "4.4–6 V"], ["Charge current", "up to 500 mA (set by resistor)"], ["Termination", "4.2 V ±1 %"]],
    details: "Includes input-voltage regulation so the solar panel is not pulled below its useful point. CHRG/DONE pins feed the ESP32 charging state." },
  { id: "solar", name: "Solar cell array", category: "Solar", bus: "ADC", sampling: "1 Hz",
    purpose: "Bezel/dial photovoltaic ring.",
    role: "Extends runtime; enables indefinite operation in sufficient daylight.",
    specs: [["Peak output", "~200 mW (full sun)"], ["Indoor output", "5–40 mW"], ["Type", "Monocrystalline"]],
    details: "Solar input in the demo is simulated from the selected light condition. Real harvest depends heavily on angle, sleeve coverage and weather." },
  { id: "lipo", name: "LiPo battery", category: "Power", bus: "ADC (fuel gauge)", sampling: "0.1 Hz",
    purpose: "Rechargeable lithium-polymer cell.",
    role: "Energy storage for all subsystems.",
    specs: [["Capacity", "220 mAh (≈0.81 Wh)"], ["Nominal", "3.7 V"], ["Protection", "Over/under-voltage, over-current"]],
    details: "Below 15 % CIRIS enters Low Power mode: sampling rates drop, the display dims and emergency functions are prioritised." },
  { id: "sos", name: "SOS button", category: "Safety", bus: "GPIO (interrupt)", sampling: "Event",
    purpose: "Dedicated hardware emergency button.",
    role: "Long-press triggers SOS; short-press cancels an active countdown.",
    specs: [["Type", "Tactile, IP-sealed"], ["Trigger", "3 s long press"], ["Wake", "Wakes from deep sleep"]],
    details: "Handled by an interrupt so it works even when the main loop is busy or the device is sleeping." },
  { id: "haptic", name: "Haptic motor", category: "Audio/Haptic", bus: "PWM via driver", sampling: "Event",
    purpose: "Vibration alerts.",
    role: "Silent notifications and SOS countdown feedback.",
    specs: [["Type", "ERM coin motor"], ["Current", "~70 mA active"]],
    details: "Countdown pulses increase in intensity so the wearer knows an SOS is about to be sent." },
  { id: "piezo", name: "Piezo buzzer", category: "Audio/Haptic", bus: "PWM", sampling: "Event",
    purpose: "Audible alarm.",
    role: "Alerts people nearby during an active SOS.",
    specs: [["Output", "~85 dB @ 10 cm"], ["Frequency", "~4 kHz resonant"]],
    details: "Activated only in emergency states to limit power use and avoid false alarms." },
];

export const HW_CATEGORIES: HwCategory[] = ["Compute", "Optical", "Motion", "Thermal", "Environment", "Power", "Solar", "Safety", "Audio/Haptic"];

export const HARDWARE_SUMMARY = HARDWARE.map((h) => `${h.name} (${h.category}): ${h.role}`).join("\n");
