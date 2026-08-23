// ============================================================
// ESP8266 Service
// All hardware communication goes through this module.
// Never scatter fetch() calls across UI components.
// ============================================================

import type { ControlAction, EcoRainData } from '../types/ecoRain';
import { API_TIMEOUT_MS, getEsp8266BaseUrl } from '../config/deviceConfig';

// ─── Helpers ────────────────────────────────────────────────

function buildUrl(path: string): string {
  const base = getEsp8266BaseUrl();
  if (!base) throw new Error('ESP8266 IP not configured');
  return `${base}${path}`;
}

async function fetchWithTimeout(url: string, timeoutMs = API_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── Public API ─────────────────────────────────────────────

/**
 * GET /api/data
 * Returns the full sensor snapshot from the ESP8266.
 * Also returns how long the request took in milliseconds.
 */
export async function getData(): Promise<{ data: EcoRainData; responseMs: number }> {
  const url = buildUrl('/api/data');
  const start = performance.now();
  const res = await fetchWithTimeout(url);
  const responseMs = Math.round(performance.now() - start);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data: EcoRainData = await res.json();
  return { data, responseMs };
}

/**
 * GET /control?action=ACTION
 * Sends a control command to the ESP8266.
 * The ESP8266 may return JSON or plain text — we ignore the body
 * and rely on the subsequent getData() call for updated state.
 */
export async function sendCommand(action: ControlAction): Promise<void> {
  const url = buildUrl(`/control?action=${action}`);
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    throw new Error(`Command '${action}' failed: HTTP ${res.status}`);
  }
}

/**
 * Tests reachability by attempting a getData() call.
 * Returns true if the request succeeds, false otherwise.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getData();
    return true;
  } catch {
    return false;
  }
}
