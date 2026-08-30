import type { EcoRainData } from '../../types/ecoRain';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';

interface IrrigationStatusProps {
  data: EcoRainData | null;
}

export function IrrigationStatus({ data }: IrrigationStatusProps) {
  const sensorErr = data ? data.distance < 0 : false;

  // Plain-language decision
  const needsWater = data?.irrigationRequired ?? null;

  let bannerClass = 'loading';
  let emoji = '⏳';
  let headline = 'Reading sensors…';
  let reason = 'Please wait while we read the sensors.';

  if (data) {
    if (needsWater) {
      bannerClass = 'needs-water';
      emoji = '🌱';
      headline = 'The plant needs water';
      reason = `Soil moisture is ${data.soilMoisture}% — below the dry threshold.`;
    } else {
      bannerClass = 'ok';
      emoji = '🌿';
      headline = 'The plant has enough water';
      reason = `Soil moisture is ${data.soilMoisture}% — the soil is sufficiently moist.`;
    }
  }

  // Pump reason
  let pumpReason = '';
  if (data) {
    if (data.pump1) pumpReason = '🟢 Pump 1 is running — using rainwater.';
    else if (data.pump2) pumpReason = '🟢 Pump 2 is running — using backup water.';
    else if (needsWater) pumpReason = '⏸ Irrigation needed — pump activation pending.';
    else pumpReason = '⚪ No watering needed right now.';
  }

  return (
    <div className="card" role="region" aria-label="Does the plant need water?">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
        Does the Plant Need Water?
      </h2>

      {/* Main decision banner */}
      <div className={`irrigation-banner ${bannerClass}`} aria-live="polite">
        <span className="irrigation-emoji" aria-hidden="true">{emoji}</span>
        <div>
          <div className="irrigation-headline">{headline}</div>
          <div className="irrigation-reason">{reason}</div>
          {data && pumpReason && (
            <div style={{ marginTop: 6, fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {pumpReason}
            </div>
          )}
        </div>
      </div>

      {/* 3-metric row */}
      {data ? (
        <div className="irrigation-meta">
          <div className="meta-item">
            <span className="meta-label">Soil Moisture</span>
            <span className="meta-val"
              style={{ color: data.soilMoisture < 40 ? 'var(--orange)' : 'var(--green)' }}>
              {data.soilMoisture}%
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Temperature</span>
            <span className="meta-val">{data.temperature.toFixed(1)}°C</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Humidity</span>
            <span className="meta-val">{data.humidity.toFixed(0)}%</span>
          </div>
        </div>
      ) : (
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="spinner-gray" />
        </div>
      )}

      {/* Tank warning */}
      {data && !sensorErr && data.waterLevel <= TANK_LOW_THRESHOLD && (
        <div style={{
          marginTop: 'var(--space-3)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'var(--orange-light)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.82rem',
          color: 'var(--orange-text)',
          fontWeight: 500,
        }}>
          🟠 Rainwater tank is low — the system will use backup water if needed.
        </div>
      )}
    </div>
  );
}
