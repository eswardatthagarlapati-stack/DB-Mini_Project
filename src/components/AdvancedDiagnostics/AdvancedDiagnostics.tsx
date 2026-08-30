import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { EcoRainData, ConnectionStatus } from '../../types/ecoRain';
import { formatUptime } from '../../utils/formatters';

interface AdvancedDiagnosticsProps {
  data: EcoRainData | null;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date | null;
  apiResponseMs: number | null;
  isDemoMode: boolean;
}

export function AdvancedDiagnostics({
  data, connectionStatus, lastUpdated, apiResponseMs, isDemoMode,
}: AdvancedDiagnosticsProps) {
  const [open, setOpen] = useState(false);
  const sensorErr = data ? data.distance < 0 : false;

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <summary className="diag-summary" id="advanced-diagnostics-toggle">
        <span>🔧 Advanced Diagnostics</span>
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </summary>

      <div className="diag-body">
        <p className="text-xs text-muted mb-3">
          This section is for technical users and developers. Most users can ignore it.
        </p>

        <table className="diag-table">
          <tbody>
            <tr><td>Mode</td><td>{isDemoMode ? 'Demo Mode (no hardware)' : 'Live Hardware'}</td></tr>
            <tr><td>Connection</td><td>{connectionStatus}</td></tr>
            <tr><td>Last update</td><td>{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</td></tr>
            <tr><td>Response time</td><td>{apiResponseMs !== null ? `${apiResponseMs} ms` : '—'}</td></tr>
            <tr><td>Polling interval</td><td>2000 ms</td></tr>

            {data && <>
              <tr><td colSpan={2} style={{ paddingTop: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>Raw Sensor Values</td></tr>
              <tr><td>temperature</td><td>{data.temperature} °C</td></tr>
              <tr><td>humidity</td><td>{data.humidity} %</td></tr>
              <tr><td>soilMoisture</td><td>{data.soilMoisture} %</td></tr>
              <tr><td>soilRaw (ADC)</td><td>{data.soilRaw}</td></tr>
              <tr><td>distance</td><td style={{ color: sensorErr ? 'var(--orange)' : 'inherit' }}>
                {data.distance < 0 ? `ERROR (${data.distance}) — sensor not reading` : `${data.distance} cm`}
              </td></tr>
              <tr><td>waterLevel</td><td style={{ color: sensorErr ? 'var(--orange)' : 'inherit' }}>
                {sensorErr ? 'Unreliable (sensor error)' : `${data.waterLevel} %`}
              </td></tr>
              <tr><td>irrigationRequired</td><td>{String(data.irrigationRequired)}</td></tr>
              <tr><td>pump1</td><td>{String(data.pump1)}</td></tr>
              <tr><td>pump2</td><td>{String(data.pump2)}</td></tr>
              <tr><td>autoMode</td><td>{String(data.autoMode)}</td></tr>
              <tr><td>uptime</td><td>{data.uptime}s ({formatUptime(data.uptime)})</td></tr>
            </>}

            {sensorErr && (
              <tr>
                <td colSpan={2} style={{ paddingTop: 10, fontSize: '0.78rem', color: 'var(--orange-text)' }}>
                  ⚠️ HC-SR04 returned distance = -1. This means the ultrasonic sensor did not detect a valid echo.
                  The waterLevel value is unreliable and should not be trusted.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
