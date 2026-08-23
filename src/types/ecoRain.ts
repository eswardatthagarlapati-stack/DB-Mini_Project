// ============================================================
// EcoRain Type Definitions
// Source of truth: ESP8266 firmware /api/data response
// ============================================================

/**
 * Exact JSON structure returned by ESP8266 GET /api/data
 * Do NOT rename these fields — they must match the firmware.
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
 * Valid control actions supported by GET /control?action=ACTION
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
 * Stub for future weather integration
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
