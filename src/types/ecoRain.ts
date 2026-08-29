// ============================================================
// EcoRain Type Definitions
// Source of truth: ESP8266 firmware /api/status & /api/sensors
// ============================================================

/**
 * Exact JSON structure returned by ESP8266 GET /api/data or /api/sensors
 */
export interface EcoRainData {
  temperature: number;
  humidity: number;
  soilRaw: number;
  soilMoisture: number;
  /** Distance from HC-SR04 in cm. Returns -1 if sensor error. */
  distance: number;
  /** Estimated tank fill percentage (0-100). 0 when distance === -1. */
  waterLevel: number;
  irrigationRequired: boolean;
  pump1: boolean;
  pump2: boolean;
  autoMode: boolean;
  /** ESP8266 uptime in seconds */
  uptime: number;
}

/**
 * ESP8266 Device Status structure returned by GET /api/status
 */
export interface Esp8266StatusResponse {
  connected: boolean;
  device: string;
  ip: string;
  uptime: number;
  mode: 'automatic' | 'manual';
  firmwareVersion?: string;
}

/**
 * Valid control actions supported by ESP8266
 */
export type ControlAction =
  | 'auto'
  | 'manual'
  | 'pump1_on'
  | 'pump1_off'
  | 'pump2_on'
  | 'pump2_off'
  | 'all_off';

/**
 * Dashboard connection state
 */
export type ConnectionStatus =
  | 'connected'
  | 'connecting'
  | 'offline'
  | 'demo';

/**
 * System Settings Configuration
 */
export interface SystemConfig {
  esp8266Ip: string;
  autoModeDefault: boolean;
  pollingIntervalMs: number;
  apiTimeoutMs: number;
  soilDryThreshold: number;       // % below which irrigation triggers
  soilMoistThreshold: number;     // % at which irrigation stops
  temperatureThreshold: number;   // °C high temperature alert
  humidityThreshold: number;      // % low humidity alert
  tankHeightCm: number;           // Total tank height
  sensorOffsetCm: number;         // HC-SR04 mount offset
  minimumUsableLevelPct: number;  // Low water cutoff %
}

/**
 * A single entry in the frontend activity log
 */
export interface ActivityEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'pump' | 'system';
  message: string;
}

/**
 * A data point in the session history for charts
 */
export interface HistoryPoint {
  timestamp: number; // ms since epoch
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterLevel: number;
}

/**
 * Full dashboard state exposed by useEcoRain hook
 */
export interface EcoRainState {
  data: EcoRainData | null;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date | null;
  apiResponseMs: number | null;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
  history: HistoryPoint[];
  activityLog: ActivityEntry[];
}

/**
 * Sensor health status
 */
export type SensorHealth = 'healthy' | 'warning' | 'error' | 'unknown';

export interface DeviceHealthStatus {
  dht22: SensorHealth;
  soil: SensorHealth;
  hcsr04: SensorHealth;
  esp8266: SensorHealth;
}

/**
 * Weather Forecast Data Stub
 */
export interface WeatherData {
  rainProbability: number | null;
  forecast: string | null;
  forecastTemperature: number | null;
  rainExpected: boolean | null;
}

/**
 * Session statistics
 */
export interface SessionStats {
  pump1OnSeconds: number;
  pump2OnSeconds: number;
  irrigationSessions: number;
}

