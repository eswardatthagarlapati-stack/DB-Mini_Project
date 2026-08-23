// ============================================================
// useEcoRain — Central Data Hook
// Single polling loop. Single command dispatcher.
// All UI components read from this hook.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ActivityEntry,
  ControlAction,
  EcoRainData,
  EcoRainState,
  HistoryPoint,
  SessionStats,
} from '../types/ecoRain';
import { getData, sendCommand as hwSendCommand } from '../services/esp8266Service';
import {
  applyCommand,
  getSimulatedData,
} from '../services/simulationService';
import {
  getEsp8266Ip,
  MAX_HISTORY_POINTS,
  POLLING_INTERVAL_MS,
} from '../config/deviceConfig';

// ─── Helpers ────────────────────────────────────────────────

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function makeEntry(
  type: ActivityEntry['type'],
  message: string
): ActivityEntry {
  return { id: makeId(), timestamp: new Date(), type, message };
}

// ─── Hook ────────────────────────────────────────────────────

export function useEcoRain() {
  const isDemoMode = !getEsp8266Ip();

  const [state, setState] = useState<EcoRainState>({
    data: null,
    connectionStatus: isDemoMode ? 'demo' : 'connecting',
    lastUpdated: null,
    apiResponseMs: null,
    isLoading: true,
    error: null,
    isDemoMode,
    history: [],
    activityLog: [],
  });

  const [sessionStats, setSessionStats] = useState<SessionStats>({
    pump1OnSeconds: 0,
    pump2OnSeconds: 0,
    irrigationSessions: 0,
  });

  // Track previous pump state for logging / stats
  const prevPump1 = useRef(false);
  const prevPump2 = useRef(false);
  const prevAutoMode = useRef<boolean | null>(null);
  const prevIrrigation = useRef(false);
  const statsTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPump1 = useRef(false);
  const currentPump2 = useRef(false);

  // ─── Log helper ─────────────────────────────────────────

  const addLog = useCallback((entry: ActivityEntry) => {
    setState(prev => ({
      ...prev,
      activityLog: [entry, ...prev.activityLog].slice(0, 200),
    }));
  }, []);

  // ─── Fetch & update ─────────────────────────────────────

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
      }

      try {
        let result: { data: EcoRainData; responseMs: number };

        if (getEsp8266Ip()) {
          result = await getData();
          setState(prev => ({
            ...prev,
            connectionStatus: 'connected',
            isDemoMode: false,
          }));
        } else {
          result = getSimulatedData();
          setState(prev => ({
            ...prev,
            connectionStatus: 'demo',
            isDemoMode: true,
          }));
        }

        const { data, responseMs } = result;

        // Activity logging based on state changes
        if (data.pump1 !== prevPump1.current) {
          addLog(
            makeEntry(
              'pump',
              data.pump1 ? 'Pump 1 (Rainwater) activated' : 'Pump 1 (Rainwater) stopped'
            )
          );
          prevPump1.current = data.pump1;
        }
        if (data.pump2 !== prevPump2.current) {
          addLog(
            makeEntry(
              'pump',
              data.pump2 ? 'Pump 2 (Backup Water) activated' : 'Pump 2 (Backup Water) stopped'
            )
          );
          prevPump2.current = data.pump2;
        }
        if (prevAutoMode.current !== null && data.autoMode !== prevAutoMode.current) {
          addLog(
            makeEntry(
              'system',
              data.autoMode ? 'Switched to Automatic Mode' : 'Switched to Manual Mode'
            )
          );
        }
        prevAutoMode.current = data.autoMode;

        if (data.irrigationRequired && !prevIrrigation.current) {
          addLog(makeEntry('warning', 'Irrigation required — soil moisture below threshold'));
          setSessionStats(s => ({ ...s, irrigationSessions: s.irrigationSessions + 1 }));
        } else if (!data.irrigationRequired && prevIrrigation.current) {
          addLog(makeEntry('success', 'Irrigation complete — soil moisture restored'));
        }
        prevIrrigation.current = data.irrigationRequired;

        // HC-SR04 warning
        if (data.distance < 0) {
          addLog(makeEntry('warning', 'HC-SR04 sensor error — tank level unavailable'));
        }

        // Update pump refs for stats timer
        currentPump1.current = data.pump1;
        currentPump2.current = data.pump2;

        // Append to history
        const point: HistoryPoint = {
          timestamp: Date.now(),
          temperature: data.temperature,
          humidity: data.humidity,
          soilMoisture: data.soilMoisture,
          waterLevel: data.distance < 0 ? 0 : data.waterLevel,
        };

        setState(prev => {
          const newHistory = [...prev.history, point].slice(-MAX_HISTORY_POINTS);
          return {
            ...prev,
            data,
            isLoading: false,
            error: null,
            lastUpdated: new Date(),
            apiResponseMs: responseMs,
            history: newHistory,
          };
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setState(prev => ({
          ...prev,
          connectionStatus: 'offline',
          isLoading: false,
          error: msg,
          lastUpdated: prev.lastUpdated,
        }));
        if (!silent) {
          addLog(makeEntry('error', `ESP8266 connection failed: ${msg}`));
        }
      }
    },
    [addLog]
  );

  // ─── Send command ────────────────────────────────────────

  const sendCommand = useCallback(
    async (action: ControlAction): Promise<boolean> => {
      setState(prev => ({ ...prev, isLoading: true }));

      const actionLabels: Record<ControlAction, string> = {
        auto: 'Automatic mode enabled',
        manual: 'Manual mode enabled',
        pump1_on: 'Pump 1 turn ON command sent',
        pump1_off: 'Pump 1 turn OFF command sent',
        pump2_on: 'Pump 2 turn ON command sent',
        pump2_off: 'Pump 2 turn OFF command sent',
        all_off: 'Emergency STOP — all pumps off',
      };

      try {
        if (getEsp8266Ip()) {
          await hwSendCommand(action);
        } else {
          // Demo mode: apply to simulation state
          applyCommand(action);
          // Small delay for realism
          await new Promise(r => setTimeout(r, 80));
        }

        addLog(makeEntry('system', actionLabels[action]));

        // Re-fetch state from ESP8266 (or simulation) after command
        await fetchData(true);

        setState(prev => ({ ...prev, isLoading: false }));
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Command failed';
        addLog(makeEntry('error', `Command '${action}' failed: ${msg}`));
        setState(prev => ({ ...prev, isLoading: false, error: msg }));
        return false;
      }
    },
    [addLog, fetchData]
  );

  // ─── Switch between live and demo mode ──────────────────

  const refreshMode = useCallback(() => {
    const nowDemo = !getEsp8266Ip();
    setState(prev => ({
      ...prev,
      isDemoMode: nowDemo,
      connectionStatus: nowDemo ? 'demo' : 'connecting',
      data: null,
      history: [],
    }));
  }, []);

  // ─── Polling loop ────────────────────────────────────────

  useEffect(() => {
    // Initial connection log
    addLog(
      makeEntry(
        'info',
        getEsp8266Ip()
          ? `Dashboard started — connecting to ESP8266 at ${getEsp8266Ip()}`
          : 'Dashboard started — Demo Mode active'
      )
    );

    fetchData();

    const interval = setInterval(() => fetchData(true), POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData, addLog]);

  // ─── Pump runtime stats ─────────────────────────────────

  useEffect(() => {
    statsTimer.current = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        pump1OnSeconds: prev.pump1OnSeconds + (currentPump1.current ? 1 : 0),
        pump2OnSeconds: prev.pump2OnSeconds + (currentPump2.current ? 1 : 0),
      }));
    }, 1000);
    return () => {
      if (statsTimer.current) clearInterval(statsTimer.current);
    };
  }, []);

  return { state, sendCommand, refreshMode, sessionStats };
}
