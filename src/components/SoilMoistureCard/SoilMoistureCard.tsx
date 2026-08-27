import { Sprout } from 'lucide-react';
import {
  SOIL_DRY_THRESHOLD,
  SOIL_MOIST_THRESHOLD,
} from '../../config/deviceConfig';
import { soilStatus } from '../../utils/formatters';

interface SoilMoistureCardProps {
  soilMoisture: number | null;
  irrigationRequired?: boolean | null;
}

function CircularGauge({ pct, size = 110, stroke = 9 }: { pct: number | null; size?: number; stroke?: number }) {
  const value = pct !== null ? Math.max(0, Math.min(100, pct)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color =
    pct === null ? 'var(--text-dim)' :
    pct < SOIL_DRY_THRESHOLD ? 'var(--red-400)' :
    pct < SOIL_MOIST_THRESHOLD ? 'var(--amber-400)' :
    'var(--green-400)';

  return (
    <div className="soil-gauge-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth={stroke}
        />
        {pct !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.3s ease' }}
          />
        )}
      </svg>
      <div className="soil-gauge-center">
        <span className="soil-gauge-val" style={{ color }}>
          {pct !== null ? Math.round(pct) : '—'}
        </span>
        <span className="soil-gauge-unit">% MOISTURE</span>
      </div>
    </div>
  );
}

export function SoilMoistureCard({ soilMoisture }: SoilMoistureCardProps) {
  const status = soilMoisture !== null
    ? soilStatus(soilMoisture, SOIL_DRY_THRESHOLD, SOIL_MOIST_THRESHOLD)
    : null;

  return (
    <div className="card" role="region" aria-label="Soil Moisture Status">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Soil Moisture</h2>
          <span className="card-subtitle">Capacitive Sensor · Pin A0</span>
        </div>
        <div
          className="card-icon-badge"
          style={{
            color: status ? status.color : 'var(--green-400)',
            background: status ? `${status.color}15` : undefined,
          }}
        >
          <Sprout size={18} />
        </div>
      </div>

      <div className="soil-card-inner">
        <CircularGauge pct={soilMoisture} />

        <div className="soil-info-col">
          {status && (
            <div
              className="soil-badge"
              style={{
                color: status.color,
                background: `${status.color}14`,
                border: `1px solid ${status.color}35`,
              }}
            >
              <span className="status-dot" style={{ background: status.color }} />
              <span>{status.label}</span>
            </div>
          )}

          <div className="threshold-bars">
            <div className="threshold-row">
              <span className="threshold-dot" style={{ background: 'var(--red-400)' }} />
              <span className="threshold-range" style={{ color: 'var(--red-400)' }}>&lt; {SOIL_DRY_THRESHOLD}%</span>
              <span className="threshold-desc">Dry (Triggers Irrigation)</span>
            </div>
            <div className="threshold-row">
              <span className="threshold-dot" style={{ background: 'var(--amber-400)' }} />
              <span className="threshold-range" style={{ color: 'var(--amber-400)' }}>{SOIL_DRY_THRESHOLD}–{SOIL_MOIST_THRESHOLD - 1}%</span>
              <span className="threshold-desc">Irrigation Zone</span>
            </div>
            <div className="threshold-row">
              <span className="threshold-dot" style={{ background: 'var(--green-400)' }} />
              <span className="threshold-range" style={{ color: 'var(--green-400)' }}>≥ {SOIL_MOIST_THRESHOLD}%</span>
              <span className="threshold-desc">Moist (Irrigation Stops)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
