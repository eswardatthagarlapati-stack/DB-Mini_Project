import { Leaf } from 'lucide-react';
import {
  SOIL_DRY_THRESHOLD,
  SOIL_MOIST_THRESHOLD,
} from '../../config/deviceConfig';
import { soilStatus } from '../../utils/formatters';

interface SoilMoistureCardProps {
  soilMoisture: number | null;
}

// SVG ring progress component
function RingProgress({ pct, size = 110, stroke = 10 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  const color =
    pct < SOIL_DRY_THRESHOLD  ? 'var(--amber-400)' :
    pct < SOIL_MOIST_THRESHOLD ? 'var(--primary-400)' :
    'var(--green-400)';

  return (
    <div className="ring-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="ring-text">
        <div className="ring-percent" style={{ color }}>{pct !== null ? `${Math.round(pct)}` : '—'}</div>
        <div className="ring-sub">%</div>
      </div>
    </div>
  );
}

export function SoilMoistureCard({ soilMoisture }: SoilMoistureCardProps) {
  const pct = soilMoisture ?? 0;
  const status = soilMoisture !== null ? soilStatus(pct, SOIL_DRY_THRESHOLD, SOIL_MOIST_THRESHOLD) : null;

  return (
    <div className="card card-green animate-in" role="region" aria-label="Soil Moisture">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="metric-label">Soil Moisture</p>
          <p className="text-xs text-muted mt-1">DHT22 · Analog A0</p>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 'var(--radius-md)',
          background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--green-400)',
        }}>
          <Leaf size={18} />
        </div>
      </div>

      {/* Ring + thresholds */}
      <div className="flex items-center gap-4">
        {soilMoisture !== null ? (
          <RingProgress pct={pct} />
        ) : (
          <p className="metric-unavailable">—</p>
        )}

        <div style={{ flex: 1 }}>
          {status && (
            <span className="status-chip warning" style={{ marginBottom: 8, display: 'inline-flex', color: status.color, background: `${status.color}18`, borderColor: `${status.color}30` }}>
              <span className="dot" style={{ background: status.color, boxShadow: `0 0 6px ${status.color}` }} />
              {status.label}
            </span>
          )}
          {/* Threshold legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            <ThresholdRow color="var(--amber-400)"   label={`< ${SOIL_DRY_THRESHOLD}%`}   desc="Dry — irrigation starts" />
            <ThresholdRow color="var(--primary-400)" label={`${SOIL_DRY_THRESHOLD}–${SOIL_MOIST_THRESHOLD - 1}%`} desc="Irrigation zone" />
            <ThresholdRow color="var(--green-400)"   label={`≥ ${SOIL_MOIST_THRESHOLD}%`} desc="Moist — stops" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ThresholdRow({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span className="font-mono text-xs" style={{ color, minWidth: 52 }}>{label}</span>
      <span className="text-xs text-muted">{desc}</span>
    </div>
  );
}
