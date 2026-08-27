import { Cpu } from 'lucide-react';
import type { EcoRainData, SensorHealth } from '../../types/ecoRain';

interface DeviceHealthProps {
  data: EcoRainData | null;
  connectionStatus: string;
}

function getSensorHealth(data: EcoRainData | null): {
  dht22: SensorHealth;
  soil: SensorHealth;
  hcsr04: SensorHealth;
  esp8266: SensorHealth;
} {
  if (!data) return { dht22: 'unknown', soil: 'unknown', hcsr04: 'unknown', esp8266: 'unknown' };

  const dht22  = data.temperature > 0 && data.humidity > 0 ? 'healthy' : 'error';
  const soil   = data.soilRaw >= 0 ? 'healthy' : 'error';
  const hcsr04 = data.distance >= 0 ? 'healthy' : 'warning';
  const esp8266: SensorHealth = 'healthy';

  return { dht22, soil, hcsr04, esp8266 };
}

const DEVICES = [
  { key: 'esp8266', label: 'ESP8266 Microcontroller', pin: 'Wi-Fi / Core MCU' },
  { key: 'dht22',   label: 'DHT22 Temp & Humidity',    pin: 'GPIO Pin D4' },
  { key: 'soil',    label: 'Capacitive Soil Sensor',  pin: 'Analog Pin A0' },
  { key: 'hcsr04',  label: 'HC-SR04 Ultrasonic Tank', pin: 'Pins D5 (Trig) / D6 (Echo)' },
] as const;

const HEALTH_CONFIG: Record<SensorHealth, { label: string; color: string; dotClass: string }> = {
  healthy: { label: 'HEALTHY', color: 'var(--green-400)', dotClass: 'green' },
  warning: { label: 'SIGNAL WARNING', color: 'var(--amber-400)', dotClass: 'amber' },
  error:   { label: 'ERROR', color: 'var(--red-400)', dotClass: 'red' },
  unknown: { label: 'OFFLINE', color: 'var(--text-muted)', dotClass: 'gray' },
};

export function DeviceHealth({ data }: DeviceHealthProps) {
  const health = getSensorHealth(data);

  return (
    <div className="card" role="region" aria-label="Hardware Sensor Health">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Hardware Telemetry Health</h2>
          <span className="card-subtitle">Pin integrity & microcontroller diagnostics</span>
        </div>
        <div className="card-icon-badge">
          <Cpu size={18} />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DEVICES.map(d => {
          const h = health[d.key];
          const cfg = HEALTH_CONFIG[h];
          return (
            <div
              key={d.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {d.label}
                </div>
                <div className="font-mono text-xs text-muted" style={{ marginTop: 1 }}>
                  {d.pin}
                </div>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: cfg.color,
                }}
              >
                <span className={`status-dot ${cfg.dotClass}`} />
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
