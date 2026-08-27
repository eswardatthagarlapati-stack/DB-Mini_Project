import { Activity, AlertTriangle, Cpu, Network, ShieldCheck } from 'lucide-react';
import type { EcoRainData, ConnectionStatus } from '../types/ecoRain';
import { formatUptime, formatTimeSince } from '../utils/formatters';
import { getEsp8266Ip } from '../config/deviceConfig';

interface DiagnosticsProps {
  data: EcoRainData | null;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date | null;
  apiResponseMs: number | null;
  isDemoMode: boolean;
}

function TelemetryRow({
  label, value, pin, warn, statusBadge
}: {
  label: string;
  value: string;
  pin?: string;
  warn?: boolean;
  statusBadge?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        {pin && (
          <span className="font-mono text-xs text-muted" style={{ marginLeft: 8 }}>
            [{pin}]
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {statusBadge && (
          <span
            style={{
              fontSize: '0.68rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              background: warn ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.12)',
              color: warn ? 'var(--amber-400)' : 'var(--green-400)',
            }}
          >
            {statusBadge}
          </span>
        )}
        <span
          className="font-mono text-sm"
          style={{
            fontWeight: 600,
            color: warn ? 'var(--amber-400)' : 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {warn && <AlertTriangle size={13} color="var(--amber-400)" />}
          {value}
        </span>
      </div>
    </div>
  );
}

export function Diagnostics({ data, connectionStatus, lastUpdated, apiResponseMs, isDemoMode }: DiagnosticsProps) {
  const sensorError = data ? data.distance < 0 : false;
  const ip = getEsp8266Ip();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={20} color="var(--water-400)" />
          Hardware & Firmware Diagnostics
        </h1>
        <p className="text-xs text-muted mt-1">
          Direct sensor registers, pin states, ADC readings, and API communication performance.
        </p>
      </div>

      <div className="grid-2">
        {/* Hardware Register & Pin States */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">Firmware Registers (/api/data)</h2>
              <span className="card-subtitle">Real-time raw payload values from ESP8266</span>
            </div>
            <div className="card-icon-badge">
              <Cpu size={18} />
            </div>
          </div>

          {data ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TelemetryRow label="temperature" pin="GPIO D4" value={`${data.temperature} °C`} />
              <TelemetryRow label="humidity" pin="GPIO D4" value={`${data.humidity} %`} />
              <TelemetryRow label="soilMoisture" pin="Analog A0" value={`${data.soilMoisture} %`} />
              <TelemetryRow label="soilRaw (ADC 0-1023)" pin="Analog A0" value={String(data.soilRaw)} />
              <TelemetryRow
                label="distance"
                pin="GPIO D5/D6"
                value={sensorError ? 'ERROR (-1)' : `${data.distance.toFixed(1)} cm`}
                warn={sensorError}
                statusBadge={sensorError ? 'NO ECHO' : 'OK'}
              />
              <TelemetryRow label="waterLevel" value={`${data.waterLevel} %`} warn={sensorError} />
              <TelemetryRow label="irrigationRequired" value={String(data.irrigationRequired)} statusBadge={data.irrigationRequired ? 'TRIGGERED' : 'STANDBY'} />
              <TelemetryRow label="pump1 (Rainwater Relay)" pin="Relay 1" value={data.pump1 ? 'ENGAGED (1)' : 'OFF (0)'} statusBadge={data.pump1 ? 'ON' : 'OFF'} />
              <TelemetryRow label="pump2 (Backup Relay)" pin="Relay 2" value={data.pump2 ? 'ENGAGED (1)' : 'OFF (0)'} statusBadge={data.pump2 ? 'ON' : 'OFF'} />
              <TelemetryRow label="autoMode" value={data.autoMode ? 'AUTOMATIC (true)' : 'MANUAL (false)'} />
              <TelemetryRow label="uptime (seconds)" value={`${data.uptime}s (${formatUptime(data.uptime)})`} />
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Awaiting controller register response…
            </div>
          )}
        </div>

        {/* Network & Hardware Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Network & Controller Health</h2>
                <span className="card-subtitle">Interface connectivity & round-trip latency</span>
              </div>
              <div className="card-icon-badge">
                <Network size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TelemetryRow label="Hardware Mode" value={isDemoMode ? 'Internal Simulation' : 'Physical ESP8266'} />
              <TelemetryRow label="Target IP Address" value={ip ? ip : 'None (Simulation Default)'} />
              <TelemetryRow
                label="Connection State"
                value={connectionStatus.toUpperCase()}
                statusBadge={connectionStatus === 'connected' ? 'ONLINE' : 'OFFLINE'}
                warn={connectionStatus === 'offline'}
              />
              <TelemetryRow label="Last Refresh" value={formatTimeSince(lastUpdated)} />
              <TelemetryRow label="API Response Latency" value={apiResponseMs !== null ? `${apiResponseMs} ms` : '—'} />
              <TelemetryRow label="Active Polling Interval" value="2000 ms" />
            </div>
          </div>

          {/* Sensor Diagnostics Summary */}
          <div className="card">
            <div className="card-header">
              <div className="card-title-group">
                <h2 className="card-title">Sensor Loop Integrity</h2>
                <span className="card-subtitle">Self-test status across active transducers</span>
              </div>
              <div className="card-icon-badge">
                <ShieldCheck size={18} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TelemetryRow
                label="DHT22 (Temp & Humidity)"
                pin="Pin D4"
                value={data && data.temperature > 0 ? 'Functional' : 'Unconfirmed'}
                statusBadge="OK"
              />
              <TelemetryRow
                label="Soil Moisture ADC"
                pin="Pin A0"
                value={data && data.soilRaw >= 0 ? 'Functional' : 'Unconfirmed'}
                statusBadge="OK"
              />
              <TelemetryRow
                label="HC-SR04 Ultrasonic"
                pin="Pin D5/D6"
                value={sensorError ? 'Signal Timeout (-1)' : 'Functional'}
                warn={sensorError}
                statusBadge={sensorError ? 'ATTENTION' : 'OK'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
