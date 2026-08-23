import { FlaskConical, AlertTriangle } from 'lucide-react';
import type { EcoRainData, ConnectionStatus } from '../types/ecoRain';
import { formatUptime, formatTimeSince } from '../utils/formatters';

interface DiagnosticsProps {
  data: EcoRainData | null;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date | null;
  apiResponseMs: number | null;
  isDemoMode: boolean;
}

function DiagRow({
  label, value, warn, mono = true
}: { label: string; value: string; warn?: boolean; mono?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <span className="text-sm text-secondary">{label}</span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: warn ? 'var(--amber-400)' : 'var(--primary-300)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {warn && <AlertTriangle size={13} color="var(--amber-400)" />}
        {value}
      </span>
    </div>
  );
}

export function Diagnostics({ data, connectionStatus, lastUpdated, apiResponseMs, isDemoMode }: DiagnosticsProps) {
  const sensorError = data ? data.distance < 0 : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical size={20} color="var(--primary-400)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>Diagnostics</h1>
        </div>
        <p className="text-sm text-muted">Raw sensor values, calibration data, and system health metrics.</p>
      </div>

      <div className="grid-2">

        {/* Raw Sensor Values */}
        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
            Raw Sensor Values
          </h2>
          <p className="text-xs text-muted mb-4">Direct values from ESP8266 /api/data</p>
          {data ? (
            <>
              <DiagRow label="temperature" value={`${data.temperature} °C`} />
              <DiagRow label="humidity"    value={`${data.humidity} %`} />
              <DiagRow label="soilMoisture" value={`${data.soilMoisture} %`} />
              <DiagRow label="soilRaw (ADC)" value={String(data.soilRaw)} />
              <DiagRow label="distance" value={data.distance < 0 ? 'ERROR (-1)' : `${data.distance} cm`} warn={sensorError} />
              <DiagRow label="waterLevel" value={`${data.waterLevel} %`} warn={sensorError} />
              <DiagRow label="irrigationRequired" value={String(data.irrigationRequired)} mono={false} />
              <DiagRow label="pump1" value={String(data.pump1)} mono={false} />
              <DiagRow label="pump2" value={String(data.pump2)} mono={false} />
              <DiagRow label="autoMode" value={String(data.autoMode)} mono={false} />
              <DiagRow label="uptime" value={`${data.uptime}s → ${formatUptime(data.uptime)}`} />
            </>
          ) : (
            <p className="text-sm text-muted" style={{ marginTop: 12 }}>No data received yet.</p>
          )}
        </div>

        {/* Connection & Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
              Connection Status
            </h2>
            <p className="text-xs text-muted mb-4">API performance and connectivity</p>
            <DiagRow label="Mode"            value={isDemoMode ? 'Demo Mode' : 'Live Hardware'} mono={false} />
            <DiagRow label="Connection"      value={connectionStatus} mono={false} />
            <DiagRow label="Last Updated"    value={formatTimeSince(lastUpdated)} mono={false} />
            <DiagRow label="API Response"    value={apiResponseMs !== null ? `${apiResponseMs} ms` : '—'} />
            <DiagRow label="Polling Interval" value="2000 ms" />
          </div>

          {/* Sensor Health */}
          <div className="card">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
              Sensor Health
            </h2>
            <p className="text-xs text-muted mb-4">Derived from current sensor readings</p>
            <HealthRow name="DHT22"      status={!data ? 'unknown' : (data.temperature > 0 && data.humidity > 0 ? 'healthy' : 'error')} />
            <HealthRow name="Soil Sensor" status={!data ? 'unknown' : (data.soilRaw >= 0 ? 'healthy' : 'error')} />
            <HealthRow name="HC-SR04"    status={!data ? 'unknown' : (sensorError ? 'warning' : 'healthy')} note={sensorError ? 'distance = -1' : undefined} />
            <HealthRow name="ESP8266"    status={!data ? 'unknown' : 'healthy'} />
          </div>

          {/* Notes */}
          {sensorError && (
            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
            }}>
              <AlertTriangle size={16} color="var(--amber-400)" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--amber-400)', marginBottom: 4 }}>
                  HC-SR04 Sensor Error
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  The firmware returned distance = -1, indicating the ultrasonic sensor did not receive a valid echo.
                  The <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-300)' }}>waterLevel</code> value
                  is therefore unreliable. Tank level is shown as unavailable.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HealthRow({ name, status, note }: { name: string; status: string; note?: string }) {
  const map: Record<string, { color: string; label: string }> = {
    healthy: { color: 'var(--green-400)', label: '● Healthy' },
    warning: { color: 'var(--amber-400)', label: '● Warning' },
    error:   { color: 'var(--red-400)',   label: '● Error' },
    unknown: { color: 'var(--text-dim)',  label: '● Unknown' },
  };
  const cfg = map[status] ?? map.unknown;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 0', borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{name}</span>
        {note && <span className="font-mono text-xs text-muted" style={{ marginLeft: 8 }}>{note}</span>}
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}
