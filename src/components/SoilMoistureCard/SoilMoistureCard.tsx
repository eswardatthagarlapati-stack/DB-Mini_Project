import { Sprout } from 'lucide-react';
import {
  SOIL_DRY_THRESHOLD,
  SOIL_MOIST_THRESHOLD,
} from '../../config/deviceConfig';

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
    pct < SOIL_DRY_THRESHOLD ? '#f87171' :
    pct < SOIL_MOIST_THRESHOLD ? '#fbbf24' :
    '#4ade80';

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
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.3s ease' }}
          />
        )}
      </svg>
      <div className="soil-gauge-center">
        <span className="soil-gauge-val" style={{ color }}>
          {pct !== null ? Math.round(pct) : '—'}
        </span>
        <span className="soil-gauge-unit">% SOIL</span>
      </div>
    </div>
  );
}

export function SoilMoistureCard({ soilMoisture }: SoilMoistureCardProps) {
  const statusInfo = (() => {
    if (soilMoisture === null) return null;
    if (soilMoisture < SOIL_DRY_THRESHOLD) {
      return {
        label: 'DRY',
        desc: 'Needs Irrigation',
        color: 'var(--red-400)',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.35)',
      };
    }
    if (soilMoisture < SOIL_MOIST_THRESHOLD) {
      return {
        label: 'NORMAL',
        desc: 'Adequate Moisture',
        color: 'var(--amber-400)',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.35)',
      };
    }
    return {
      label: 'MOIST',
      desc: 'Optimal Saturated',
      color: 'var(--green-400)',
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.35)',
    };
  })();

  return (
    <div
      className="card"
      style={{ borderTop: '3px solid #22c55e' }}
      role="region"
      aria-label="Soil Moisture Status"
    >
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">SOIL MOISTURE</h2>
          <span className="card-subtitle">Capacitive Sensor · Pin A0</span>
        </div>
        <div
          className="card-icon-badge"
          style={{
            color: 'var(--green-400)',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <Sprout size={18} />
        </div>
      </div>

      <div className="soil-card-inner">
        <CircularGauge pct={soilMoisture} />

        <div className="soil-info-col">
          {statusInfo ? (
            <div
              className="soil-badge font-mono"
              style={{
                color: statusInfo.color,
                background: statusInfo.bg,
                border: `1px solid ${statusInfo.border}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              <span className="status-dot" style={{ background: statusInfo.color }} />
              <span>STATUS: {statusInfo.label}</span>
            </div>
          ) : (
            <span className="text-xs text-muted">Waiting for sensor…</span>
          )}

          <div className="threshold-bars">
            <div className="threshold-row">
              <span className="threshold-dot" style={{ background: 'var(--red-400)' }} />
              <span className="threshold-range" style={{ color: 'var(--red-400)' }}>&lt; {SOIL_DRY_THRESHOLD}%</span>
              <span className="threshold-desc">DRY (Triggers Irrigation)</span>
            </div>
            <div className="threshold-row">
              <span className="threshold-dot" style={{ background: 'var(--amber-400)' }} />
              <span className="threshold-range" style={{ color: 'var(--amber-400)' }}>{SOIL_DRY_THRESHOLD}–{SOIL_MOIST_THRESHOLD - 1}%</span>
              <span className="threshold-desc">NORMAL (Zone)</span>
            </div>
            <div className="threshold-row">
              <span className="threshold-dot" style={{ background: 'var(--green-400)' }} />
              <span className="threshold-range" style={{ color: 'var(--green-400)' }}>≥ {SOIL_MOIST_THRESHOLD}%</span>
              <span className="threshold-desc">MOIST (Irrigation Stops)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
