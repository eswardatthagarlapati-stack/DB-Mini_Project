// ============================================================
// Simulation Service
// Realistic demo mode — physically plausible sensor behaviour.
// Does NOT generate random values on every tick.
// ============================================================

import type { ControlAction, EcoRainData } from '../types/ecoRain';
import {
  SOIL_DRY_THRESHOLD,
  SOIL_MOIST_THRESHOLD,
  TANK_LOW_THRESHOLD,
} from '../config/deviceConfig';

// ─── Internal simulation state ──────────────────────────────

interface SimState {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterLevel: number;       // tank %
  pump1: boolean;
  pump2: boolean;
  autoMode: boolean;
  irrigationRequired: boolean;
  uptimeStart: number;      // ms epoch
  tempDir: 1 | -1;
  humDir: 1 | -1;
}

let state: SimState = {
  temperature: 27.5,
  humidity: 62,
  soilMoisture: 68,
  waterLevel: 78,
  pump1: false,
  pump2: false,
  autoMode: true,
  irrigationRequired: false,
  uptimeStart: Date.now() - 125_000,
  tempDir: 1,
  humDir: -1,
};

// ─── Tick — called each polling interval ────────────────────

function drift(value: number, dir: 1 | -1, min: number, max: number, step: number): { value: number; dir: 1 | -1 } {
  let next = value + dir * step * (0.5 + Math.random() * 0.5);
  next = Math.min(max, Math.max(min, next));
  const newDir: 1 | -1 = (next >= max || next <= min) ? (dir * -1) as 1 | -1 : dir;
  return { value: Math.round(next * 10) / 10, dir: newDir };
}

export function tickSimulation(): void {
  // Temperature: 22 – 34 °C
  const t = drift(state.temperature, state.tempDir, 22, 34, 0.08);
  state.temperature = t.value;
  state.tempDir = t.dir;

  // Humidity: 45 – 85 %
  const h = drift(state.humidity, state.humDir, 45, 85, 0.15);
  state.humidity = h.value;
  state.humDir = h.dir;

  // Soil moisture dynamics
  if (state.pump1 || state.pump2) {
    // Irrigation: soil rises
    state.soilMoisture = Math.min(85, state.soilMoisture + 0.6);
  } else if (state.irrigationRequired) {
    // Waiting for pump — soil still dry
    state.soilMoisture = Math.max(25, state.soilMoisture - 0.05);
  } else {
    // Normal evaporation
    state.soilMoisture = Math.max(0, state.soilMoisture - 0.18);
  }
  state.soilMoisture = Math.round(state.soilMoisture * 10) / 10;

  // Irrigation required with hysteresis (mirrors firmware logic)
  if (!state.irrigationRequired && state.soilMoisture < SOIL_DRY_THRESHOLD) {
    state.irrigationRequired = true;
  } else if (state.irrigationRequired && state.soilMoisture >= SOIL_MOIST_THRESHOLD) {
    state.irrigationRequired = false;
  }

  // Auto mode pump logic (mirrors firmware)
  if (state.autoMode) {
    if (state.irrigationRequired) {
      if (state.waterLevel > TANK_LOW_THRESHOLD) {
        state.pump1 = true;
        state.pump2 = false;
      } else {
        state.pump1 = false;
        state.pump2 = true;
      }
    } else {
      state.pump1 = false;
      state.pump2 = false;
    }
  }

  // Tank depletion (pump1 draws from tank)
  if (state.pump1) {
    state.waterLevel = Math.max(0, state.waterLevel - 0.15);
    state.waterLevel = Math.round(state.waterLevel * 10) / 10;
  }
  // Slow natural refill
  if (!state.pump1 && state.waterLevel < 95) {
    state.waterLevel = Math.min(95, state.waterLevel + 0.01);
    state.waterLevel = Math.round(state.waterLevel * 10) / 10;
  }
}

// ─── Apply a control command to the simulated state ─────────

export function applyCommand(action: ControlAction): void {
  switch (action) {
    case 'auto':
      state.autoMode = true;
      break;
    case 'manual':
      state.autoMode = false;
      break;
    case 'pump1_on':
      state.pump1 = true;
      state.pump2 = false;
      state.autoMode = false;
      break;
    case 'pump1_off':
      state.pump1 = false;
      state.autoMode = false;
      break;
    case 'pump2_on':
      state.pump2 = true;
      state.pump1 = false;
      state.autoMode = false;
      break;
    case 'pump2_off':
      state.pump2 = false;
      state.autoMode = false;
      break;
    case 'all_off':
      state.pump1 = false;
      state.pump2 = false;
      state.autoMode = false;
      break;
  }
}

// ─── Snapshot → EcoRainData ─────────────────────────────────

export function getSimulatedData(): { data: EcoRainData; responseMs: number } {
  tickSimulation();

  const uptimeSeconds = Math.floor((Date.now() - state.uptimeStart) / 1000);

  // Derive distance from waterLevel (tank height = 30 cm)
  // waterLevel 100% → distance 2 cm (nearly full)
  // waterLevel 0%   → distance 30 cm (empty)
  const distance = Math.round((2 + (100 - state.waterLevel) * 0.28) * 10) / 10;

  // Soil raw ADC: inversely proportional to moisture (dry = high ADC)
  const soilRaw = Math.round(1023 - (state.soilMoisture / 100) * 950);

  const data: EcoRainData = {
    temperature: state.temperature,
    humidity: state.humidity,
    soilRaw,
    soilMoisture: Math.round(state.soilMoisture),
    distance,
    waterLevel: Math.round(state.waterLevel),
    irrigationRequired: state.irrigationRequired,
    pump1: state.pump1,
    pump2: state.pump2,
    autoMode: state.autoMode,
    uptime: uptimeSeconds,
  };

  return { data, responseMs: Math.floor(Math.random() * 5 + 1) };
}

// ─── Weather Service Stub ────────────────────────────────────
// (kept here for future expansion)
export function getWeatherStub() {
  return {
    rainProbability: null,
    forecast: null,
    forecastTemperature: null,
    rainExpected: null,
  };
}
