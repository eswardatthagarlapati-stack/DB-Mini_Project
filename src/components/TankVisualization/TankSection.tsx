import { AlertTriangle } from 'lucide-react';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';

interface TankSectionProps {
  waterLevel: number | null;
  distance: number | null;
}

export function TankSection({ waterLevel, distance }: TankSectionProps) {
  const sensorErr = distance !== null && distance < 0;
  const level = (waterLevel !== null && !sensorErr) ? Math.max(0, Math.min(100, waterLevel)) : 0;

  const fillColor = level > TANK_LOW_THRESHOLD
    ? '#2563EB'   // blue — water available
    : level > 0
    ? '#F59E0B'   // orange — low
    : '#DC2626';  // red — empty

  const statusLabel = sensorErr
    ? '⚠️ Sensor error — level unknown'
    : level <= 0
    ? '🔴 Tank is empty'
    : level <= TANK_LOW_THRESHOLD
    ? '🟠 Low water — backup pump will be used'
    : '🟢 Water available';

  return (
    <div className="card" role="region" aria-label="Rainwater Tank">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
        Rainwater Tank
      </h2>

      <div className="tank-section">
        {/* Visual */}
        <div className="tank-visual-wrap">
          <div
            className="tank-body"
            role="img"
            aria-label={sensorErr ? 'Tank level unknown' : `Tank ${level}% full`}
          >
            {sensorErr ? (
              <div className="tank-error-box">
                <AlertTriangle size={22} color="var(--orange)" />
                <span style={{ fontSize: '0.7rem', color: 'var(--orange-text)', fontWeight: 600, lineHeight: 1.3 }}>
                  Sensor error
                </span>
              </div>
            ) : (
              <div
                className="tank-fill"
                style={{ height: `${level}%` }}
                aria-hidden="true"
              >
                <div className="tank-fill-inner" style={{ background: fillColor }}>
                  <div className="tank-wave-line" />
                </div>
                {level > 15 && (
                  <div className="tank-pct-label">{level}%</div>
                )}
              </div>
            )}
            {/* Markers */}
            {[75, 50, 25].map(m => (
              <div key={m} style={{
                position: 'absolute', top: `${100 - m}%`,
                left: 0, right: 0,
                borderTop: '1px dashed rgba(0,0,0,0.12)',
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontSize: '0.55rem', color: 'rgba(0,0,0,0.35)',
                  paddingLeft: 3, fontFamily: 'monospace', lineHeight: 1,
                }}>{m}%</span>
              </div>
            ))}
          </div>

          {/* Label below tank */}
          <div style={{
            fontSize: '0.78rem', fontWeight: 600, textAlign: 'center', maxWidth: 110,
            color: sensorErr ? 'var(--orange-text)' : level <= TANK_LOW_THRESHOLD ? 'var(--orange-text)' : 'var(--green-text)',
          }}>
            {sensorErr ? 'Level unknown' : level <= TANK_LOW_THRESHOLD ? 'Low water' : 'Water available'}
          </div>
        </div>

        {/* Info */}
        <div className="tank-info">
          <div className="info-row">
            <span className="info-row-label">Water level</span>
            <span className="info-row-value" style={{ color: sensorErr ? 'var(--text-muted)' : fillColor }}>
              {sensorErr ? '—' : `${level}%`}
            </span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Distance (HC-SR04)</span>
            <span className="info-row-value" style={{ color: sensorErr ? 'var(--orange)' : 'var(--text-primary)' }}>
              {distance === null ? '—' : sensorErr ? 'Sensor error' : `${distance.toFixed(1)} cm`}
            </span>
          </div>
          <div className="info-row">
            <span className="info-row-label">Low-water alert below</span>
            <span className="info-row-value">{TANK_LOW_THRESHOLD}%</span>
          </div>

          <div style={{
            marginTop: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--bg-muted)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}>
            {statusLabel}
          </div>

          {sensorErr && (
            <div style={{
              marginTop: 'var(--space-2)',
              fontSize: '0.78rem',
              color: 'var(--orange-text)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              <AlertTriangle size={13} />
              The ultrasonic sensor did not detect a valid reading. Tank level cannot be determined.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
