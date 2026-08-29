// ============================================================
// ESP8266 API Service & Device Transport Abstraction
// Centralized hardware communication layer
// ============================================================

import type { ControlAction, EcoRainData, Esp8266StatusResponse, SystemConfig } from '../types/ecoRain';
import { API_TIMEOUT_MS, getEsp8266BaseUrl } from '../config/deviceConfig';
import { getSimulatedData, applyCommand } from './simulationService';

/**
 * Transport interface allowing seamless switching between Local HTTP,
 * Cloud Broker (MQTT / REST), and Mock Demonstration modes.
 */
export interface DeviceTransport {
  getStatus(): Promise<Esp8266StatusResponse>;
  getData(): Promise<{ data: EcoRainData; responseMs: number }>;
  getPumps(): Promise<{ pump1: boolean; pump2: boolean }>;
  setMode(mode: 'automatic' | 'manual'): Promise<boolean>;
  setPumpState(pumpId: 1 | 2, state: boolean): Promise<boolean>;
  stopAllPumps(): Promise<boolean>;
  getConfig(): Promise<Partial<SystemConfig>>;
  updateConfig(config: Partial<SystemConfig>): Promise<boolean>;
}

// ─── Local ESP8266 HTTP Transport ────────────────────────────

export class LocalESPTransport implements DeviceTransport {
  private timeoutMs: number;

  constructor(timeoutMs = API_TIMEOUT_MS) {
    this.timeoutMs = timeoutMs;
  }

  private buildUrl(path: string): string {
    const base = getEsp8266BaseUrl();
    if (!base) throw new Error('ESP8266 IP address is not configured');
    return `${base}${path}`;
  }

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Connection timed out (ESP8266 did not respond in time)');
      }
      throw err;
    }
  }

  async getStatus(): Promise<Esp8266StatusResponse> {
    try {
      const res = await this.fetchWithTimeout(this.buildUrl('/api/status'));
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback check through /api/data
    }
    const { data } = await this.getData();
    return {
      connected: true,
      device: 'NodeMCU ESP8266',
      ip: getEsp8266BaseUrl().replace('http://', ''),
      uptime: data.uptime,
      mode: data.autoMode ? 'automatic' : 'manual',
    };
  }

  async getData(): Promise<{ data: EcoRainData; responseMs: number }> {
    const start = performance.now();
    let res: Response;
    
    try {
      res = await this.fetchWithTimeout(this.buildUrl('/api/sensors'));
      if (!res.ok) {
        // Fallback to unified endpoint
        res = await this.fetchWithTimeout(this.buildUrl('/api/data'));
      }
    } catch {
      res = await this.fetchWithTimeout(this.buildUrl('/api/data'));
    }

    const responseMs = Math.round(performance.now() - start);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const raw = await res.json();
    
    // Normalize response payload
    const normalized: EcoRainData = {
      temperature: Number(raw.temperature ?? 0),
      humidity: Number(raw.humidity ?? 0),
      soilRaw: Number(raw.soilRaw ?? 0),
      soilMoisture: Number(raw.soilMoisture ?? raw.soil ?? 0),
      distance: Number(raw.distance ?? raw.tankDistance ?? -1),
      waterLevel: Number(raw.waterLevel ?? raw.tankLevel ?? 0),
      irrigationRequired: Boolean(raw.irrigationRequired ?? false),
      pump1: Boolean(raw.pump1 ?? false),
      pump2: Boolean(raw.pump2 ?? false),
      autoMode: Boolean(raw.autoMode ?? raw.mode === 'automatic'),
      uptime: Number(raw.uptime ?? 0),
    };

    return { data: normalized, responseMs };
  }

  async getPumps(): Promise<{ pump1: boolean; pump2: boolean }> {
    try {
      const res = await this.fetchWithTimeout(this.buildUrl('/api/pumps'));
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to getData
    }
    const { data } = await this.getData();
    return { pump1: data.pump1, pump2: data.pump2 };
  }

  async setMode(mode: 'automatic' | 'manual'): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(this.buildUrl('/api/mode'), {
        method: 'POST',
        body: JSON.stringify({ mode }),
      });
      if (res.ok) return true;
    } catch {
      // Try GET query fallback
    }
    // Fallback: /control?action=auto or manual
    const fallbackRes = await this.fetchWithTimeout(this.buildUrl(`/control?action=${mode === 'automatic' ? 'auto' : 'manual'}`));
    return fallbackRes.ok;
  }

  async setPumpState(pumpId: 1 | 2, state: boolean): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(this.buildUrl(`/api/pump/${pumpId}`), {
        method: 'POST',
        body: JSON.stringify({ state }),
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const action = `pump${pumpId}_${state ? 'on' : 'off'}` as ControlAction;
    const fallbackRes = await this.fetchWithTimeout(this.buildUrl(`/control?action=${action}`));
    return fallbackRes.ok;
  }

  async stopAllPumps(): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(this.buildUrl('/api/pumps/stop'), {
        method: 'POST',
      });
      if (res.ok) return true;
    } catch {
      // Fallback
    }
    const fallbackRes = await this.fetchWithTimeout(this.buildUrl('/control?action=all_off'));
    return fallbackRes.ok;
  }

  async getConfig(): Promise<Partial<SystemConfig>> {
    try {
      const res = await this.fetchWithTimeout(this.buildUrl('/api/config'));
      if (res.ok) return await res.json();
    } catch {
      // Optional endpoint
    }
    return {};
  }

  async updateConfig(config: Partial<SystemConfig>): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(this.buildUrl('/api/config'), {
        method: 'POST',
        body: JSON.stringify(config),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

// ─── Mock ESP8266 Transport (Demo Mode) ──────────────────────

export class MockESPTransport implements DeviceTransport {
  async getStatus(): Promise<Esp8266StatusResponse> {
    const { data } = getSimulatedData();
    return {
      connected: true,
      device: 'NodeMCU ESP8266 (Demo Simulation)',
      ip: '127.0.0.1',
      uptime: data.uptime,
      mode: data.autoMode ? 'automatic' : 'manual',
      firmwareVersion: '1.4.2-SIM',
    };
  }

  async getData(): Promise<{ data: EcoRainData; responseMs: number }> {
    return getSimulatedData();
  }

  async getPumps(): Promise<{ pump1: boolean; pump2: boolean }> {
    const { data } = getSimulatedData();
    return { pump1: data.pump1, pump2: data.pump2 };
  }

  async setMode(mode: 'automatic' | 'manual'): Promise<boolean> {
    applyCommand(mode === 'automatic' ? 'auto' : 'manual');
    return true;
  }

  async setPumpState(pumpId: 1 | 2, state: boolean): Promise<boolean> {
    const action = `pump${pumpId}_${state ? 'on' : 'off'}` as ControlAction;
    applyCommand(action);
    return true;
  }

  async stopAllPumps(): Promise<boolean> {
    applyCommand('all_off');
    return true;
  }

  async getConfig(): Promise<Partial<SystemConfig>> {
    return {};
  }

  async updateConfig(): Promise<boolean> {
    return true;
  }
}

// ─── Centralized API Client Export ───────────────────────────

export const localTransport = new LocalESPTransport();
export const mockTransport = new MockESPTransport();

/**
 * High-level unified dispatcher
 */
export async function executeControlAction(action: ControlAction, isDemo: boolean): Promise<boolean> {
  const transport: DeviceTransport = isDemo ? mockTransport : localTransport;
  switch (action) {
    case 'auto':
      return transport.setMode('automatic');
    case 'manual':
      return transport.setMode('manual');
    case 'pump1_on':
      return transport.setPumpState(1, true);
    case 'pump1_off':
      return transport.setPumpState(1, false);
    case 'pump2_on':
      return transport.setPumpState(2, true);
    case 'pump2_off':
      return transport.setPumpState(2, false);
    case 'all_off':
      return transport.stopAllPumps();
  }
}
