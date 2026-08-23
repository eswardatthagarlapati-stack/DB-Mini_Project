// ============================================================
// EcoRain Device Configuration
// Single source of truth for all hardware constants
// ============================================================

/**
 * Get the current ESP8266 base URL from localStorage.
 * Falls back to empty string (triggers demo mode).
 */
export function getEsp8266BaseUrl(): string {
  return localStorage.getItem('ecorain_esp8266_ip')
    ? `http://${localStorage.getItem('ecorain_esp8266_ip')}`
    : '';
}

/**
 * Persist a new ESP8266 IP address to localStorage.
 */
export function setEsp8266Ip(ip: string): void {
  localStorage.setItem('ecorain_esp8266_ip', ip.trim());
}

/**
 * Retrieve the currently saved ESP8266 IP (raw string).
 */
export function getEsp8266Ip(): string {
  return localStorage.getItem('ecorain_esp8266_ip') ?? '';
}

/**
 * Clear the stored IP address (reverts to demo mode).
 */
export function clearEsp8266Ip(): void {
  localStorage.removeItem('ecorain_esp8266_ip');
}

// ─── Polling ────────────────────────────────────────────────
/** How often to poll /api/data in Live Mode (ms) */
export const POLLING_INTERVAL_MS = 2000;

// ─── Soil Moisture Thresholds ───────────────────────────────
/** Below this value, firmware triggers irrigation */
export const SOIL_DRY_THRESHOLD = 40;
/** At or above this value, firmware stops irrigation (hysteresis) */
export const SOIL_MOIST_THRESHOLD = 55;

// ─── Tank / Water Level Thresholds ─────────────────────────
/** Below or equal this %, firmware switches from Pump 1 to Pump 2 */
export const TANK_LOW_THRESHOLD = 20;

// ─── API Timeout ────────────────────────────────────────────
/** Fetch timeout in milliseconds */
export const API_TIMEOUT_MS = 5000;

// ─── Session History ────────────────────────────────────────
/** Maximum data points kept in browser session history */
export const MAX_HISTORY_POINTS = 120;
