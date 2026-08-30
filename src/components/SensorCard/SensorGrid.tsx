import type { EcoRainData } from '../../types/ecoRain';
import { SOIL_DRY_THRESHOLD, SOIL_MOIST_THRESHOLD, TANK_LOW_THRESHOLD } from '../../config/deviceConfig';

// ─── Individual sensor card ──────────────────────────────────

interface SensorCardProps {
  icon: string;
  name: string;
  value: number | null;
  unit: string;
  sensorUnavailable?: boolean;
  status: { label: string; color: string; bg: string } | null;
}

export function SensorCard({ icon, name, value, unit, sensorUnavailable, status }: SensorCardProps) {
  return (
    <div className="sensor-card" role="region" aria-label={name}>
      <div className="sensor-icon-row">
        <span style={{ fontSize: '1.6rem', lineHeight: 1 }} aria-hidden="true">{icon}</span>
        {status && (
          <span
            className="sensor-status"
            style={{ background: status.bg, color: status.color }}
            aria-label={`Status: ${status.label}`}
          >
            {status.label}
          </span>
        )}
      </div>
      <div>
        {sensorUnavailable ? (
          <span className="sensor-unavailable" aria-label="Data unavailable">—</span>
        ) : (
          <span className="sensor-value" aria-live="polite">
            {value !== null ? (Number.isInteger(value) ? value : value.toFixed(1)) : '—'}
            {value !== null && <span className="sensor-unit">{unit}</span>}
          </span>
        )}
      </div>
      <div className="sensor-name">{name}</div>
      {sensorUnavailable && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
          Sensor unavailable
        </div>
      )}
    </div>
  );
}

// ─── Status helpers ───────────────────────────────────────────

function tempStatus(t: number) {
  if (t < 10)  return { label: 'Cold',   color: 'var(--blue-text)',   bg: 'var(--blue-light)' };
  if (t < 35)  return { label: 'Normal', color: 'var(--green-text)',  bg: 'var(--green-light)' };
  return              { label: 'Hot',    color: 'var(--red-text)',     bg: 'var(--red-light)' };
}

function humidityStatus(h: number) {
  if (h < 30)  return { label: 'Dry air',   color: 'var(--orange-text)', bg: 'var(--orange-light)' };
  if (h <= 70) return { label: 'Normal',    color: 'var(--green-text)',  bg: 'var(--green-light)' };
  return              { label: 'Humid air', color: 'var(--blue-text)',   bg: 'var(--blue-light)' };
}

function soilStatus(s: number) {
  if (s < SOIL_DRY_THRESHOLD)   return { label: 'Soil is dry',     color: 'var(--orange-text)', bg: 'var(--orange-light)' };
  if (s < SOIL_MOIST_THRESHOLD) return { label: 'Slightly dry',    color: 'var(--orange-text)', bg: 'var(--orange-light)' };
  return                               { label: 'Soil is moist',   color: 'var(--green-text)',  bg: 'var(--green-light)' };
}

function tankStatus(level: number, sensorErr: boolean) {
  if (sensorErr)          return { label: 'Sensor error',    color: 'var(--orange-text)', bg: 'var(--orange-light)' };
  if (level <= 0)         return { label: 'Empty',           color: 'var(--red-text)',    bg: 'var(--red-light)' };
  if (level <= TANK_LOW_THRESHOLD) return { label: 'Low water', color: 'var(--orange-text)', bg: 'var(--orange-light)' };
  return                         { label: 'Water available', color: 'var(--green-text)',  bg: 'var(--green-light)' };
}

// ─── 4-card grid ─────────────────────────────────────────────

interface SensorGridProps {
  data: EcoRainData | null;
}

export function SensorGrid({ data }: SensorGridProps) {
  const sensorErr = data ? data.distance < 0 : false;

  return (
    <div className="sensor-grid" role="region" aria-label="Sensor readings">
      <SensorCard
        icon="🌡"
        name="Temperature"
        value={data?.temperature ?? null}
        unit="°C"
        sensorUnavailable={!data}
        status={data ? tempStatus(data.temperature) : null}
      />
      <SensorCard
        icon="💧"
        name="Humidity"
        value={data?.humidity ?? null}
        unit="%"
        sensorUnavailable={!data}
        status={data ? humidityStatus(data.humidity) : null}
      />
      <SensorCard
        icon="🌱"
        name="Soil Moisture"
        value={data?.soilMoisture ?? null}
        unit="%"
        sensorUnavailable={!data}
        status={data ? soilStatus(data.soilMoisture) : null}
      />
      <SensorCard
        icon="🚰"
        name="Rainwater Tank"
        value={sensorErr ? null : (data?.waterLevel ?? null)}
        unit="%"
        sensorUnavailable={!data || sensorErr}
        status={data ? tankStatus(data.waterLevel, sensorErr) : null}
      />
    </div>
  );
}
