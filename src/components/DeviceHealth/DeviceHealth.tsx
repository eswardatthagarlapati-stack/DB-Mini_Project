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
  const esp8266: SensorHealth = 'healthy'; // if we got data, ESP8266 is up

  return { dht22, soil, hcsr04, esp8266 };
}

const DEVICES = [
  { key: 'esp8266', label: 'ESP8266', desc: 'Main controller' },
  { key: 'dht22',   label: 'DHT22',   desc: 'Temp & humidity' },
  { key: 'soil',    label: 'Soil Sensor', desc: 'Analog A0' },
  { key: 'hcsr04',  label: 'HC-SR04', desc: 'Ultrasonic distance' },
] as const;

const HEALTH_CONFIG: Record<SensorHealth, { dot: string; label: string; color: string }> = {
  healthy: { dot: 'health-dot healthy', label: 'Healthy', color: 'var(--green-400)' },
  warning: { dot: 'health-dot warning', label: 'Warning', color: 'var(--amber-400)' },
  error:   { dot: 'health-dot error',   label: 'Error',   color: 'var(--red-400)' },
  unknown: { dot: 'health-dot unknown', label: 'Unknown', color: 'var(--text-dim)' },
};

export function DeviceHealth({ data, connectionStatus }: DeviceHealthProps) {
  const health = getSensorHealth(data);

  return (
    <div className="card animate-in" role="region" aria-label="Device Health">
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={18} color="var(--primary-400)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
          Device Health
        </h2>
        {connectionStatus === 'offline' && (
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--red-400)', fontWeight: 600 }}>
            ESP8266 Offline
          </span>
        )}
      </div>

      <div className="health-grid">
        {DEVICES.map(d => {
          const h = health[d.key];
          const cfg = HEALTH_CONFIG[h];
          return (
            <div key={d.key} className="health-item">
              <div className={cfg.dot} aria-hidden="true" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.desc}</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
