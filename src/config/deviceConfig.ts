// ============================================================
// EcoRain Device Configuration
// Single source of truth for all hardware constants & stored user settings
// ============================================================

import type { SystemConfig } from '../types/ecoRain';

export const DEFAULT_CONFIG: SystemConfig = {
  esp8266Ip: '',
  autoModeDefault: true,
  pollingIntervalMs: 2000,
  apiTimeoutMs: 4000,
  soilDryThreshold: 40,
  soilMoistThreshold: 55,
  temperatureThreshold: 35,
  humidityThreshold: 30,
  tankHeightCm: 30,
  sensorOffsetCm: 2,
  minimumUsableLevelPct: 20,
};

const STORAGE_KEY = 'ecorain_system_config_v2';
const IP_STORAGE_KEY = 'ecorain_esp8266_ip';

/**
 * Retrieve the full system configuration from localStorage.
 */
export function getSystemConfig(): SystemConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy IP key
      const legacyIp = localStorage.getItem(IP_STORAGE_KEY);
      return { ...DEFAULT_CONFIG, esp8266Ip: legacyIp || '' };
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/**
 * Persist updated system configuration to localStorage.
 */
export function saveSystemConfig(config: Partial<SystemConfig>): SystemConfig {
  const current = getSystemConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (updated.esp8266Ip !== undefined) {
      localStorage.setItem(IP_STORAGE_KEY, updated.esp8266Ip.trim());
    }
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
  }
  return updated;
}

/**
 * Get the current ESP8266 base URL.
 */
export function getEsp8266BaseUrl(): string {
  const ip = getEsp8266Ip();
  return ip ? `http://${ip}` : '';
}

/**
 * Persist a new ESP8266 IP address.
 */
export function setEsp8266Ip(ip: string): void {
  saveSystemConfig({ esp8266Ip: ip.trim() });
}

/**
 * Retrieve the currently saved ESP8266 IP (raw string).
 */
export function getEsp8266Ip(): string {
  return getSystemConfig().esp8266Ip;
}

/**
 * Clear the stored IP address (reverts to demo mode).
 */
export function clearEsp8266Ip(): void {
  saveSystemConfig({ esp8266Ip: '' });
  localStorage.removeItem(IP_STORAGE_KEY);
}

// ─── Direct Constants from Current Config ────────────────────
export const POLLING_INTERVAL_MS = 2000;
export const SOIL_DRY_THRESHOLD = 40;
export const SOIL_MOIST_THRESHOLD = 55;
export const TANK_LOW_THRESHOLD = 20;
export const API_TIMEOUT_MS = 4000;
export const MAX_HISTORY_POINTS = 180;
