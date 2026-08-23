import { AlertTriangle } from 'lucide-react';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';
import { tankStatus } from '../../utils/formatters';

interface TankVisualizationProps {
  waterLevel: number | null;
  distance: number | null;
}

export function TankVisualization({ waterLevel, distance }: TankVisualizationProps) {
  const sensorError = distance !== null && distance < 0;
  const level = (waterLevel !== null && !sensorError) ? Math.max(0, Math.min(100, waterLevel)) : 0;
  const status = tankStatus(level, TANK_LOW_THRESHOLD, sensorError);

  const waterColor = level > 50
    ? 'linear-gradient(180deg, rgba(0,180,216,0.75) 0%, rgba(0,100,150,0.95) 100%)'
    : level > TANK_LOW_THRESHOLD
    ? 'linear-gradient(180deg, rgba(0,150,200,0.7) 0%, rgba(0,80,130,0.95) 100%)'
    : 'linear-gradient(180deg, rgba(251,191,36,0.5) 0%, rgba(180,100,0,0.8) 100%)';

  return (
    <div className="card animate-in" style={{ gridColumn: '1 / -1' }} role="region" aria-label="Rainwater Tank">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
            Rainwater Tank
          </h2>
          <p className="text-xs text-muted mt-1">HC-SR04 Ultrasonic · Distance measurement</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          {sensorError ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber-400)', fontSize: '0.8rem', fontWeight: 600 }}>
              <AlertTriangle size={15} />
              HC-SR04 Signal Not Detected
            </div>
          ) : distance !== null ? (
            <div>
              <span className="text-xs text-muted">Distance: </span>
              <span className="font-mono text-xs" style={{ color: 'var(--primary-300)' }}>{distance.toFixed(1)} cm</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tank + info */}
      <div className="flex items-center gap-8" style={{ flexWrap: 'wrap' }}>

        {/* Tank SVG */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            className="tank-outer"
            style={{ width: 160, height: 220 }}
            role="img"
            aria-label={sensorError ? 'Tank level unavailable' : `Tank ${level}% full`}
          >
            {sensorError ? (
              /* Error state */
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: 16, textAlign: 'center',
              }}>
                <AlertTriangle size={28} color="var(--amber-400)" />
                <span style={{ fontSize: '0.75rem', color: 'var(--amber-400)', fontWeight: 600, lineHeight: 1.4 }}>
                  Sensor Error<br />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Tank level unavailable</span>
                </span>
              </div>
            ) : (
              <>
                {/* Water fill */}
                <div
                  className="tank-water"
                  style={{ height: `${level}%`, background: waterColor }}
                  aria-hidden="true"
                >
                  <div className="tank-wave" />
                </div>

                {/* Level markers */}
                {[75, 50, 25].map(mark => (
                  <div key={mark} style={{
                    position: 'absolute',
                    top: `${100 - mark}%`,
                    left: 0, right: 0,
                    borderTop: '1px dashed rgba(255,255,255,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 6,
                  }}>
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                      {mark}%
                    </span>
                  </div>
                ))}

                {/* Percentage overlay */}
                <div className="tank-label-pct">{level}%</div>
              </>
            )}
          </div>

          {/* Threshold label */}
          <div style={{
            fontSize: '0.7rem',
            color: status.color,
            fontWeight: 600,
            textAlign: 'center',
            maxWidth: 160,
          }}>
            {status.label}
          </div>
        </div>

        {/* Info column */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Water level stat */}
            <StatRow label="Tank Level" value={sensorError ? '—' : `${level}%`} color={status.color} />
            <StatRow label="Distance (HC-SR04)" value={sensorError ? 'Error' : (distance !== null ? `${distance.toFixed(1)} cm` : '—')} color={sensorError ? 'var(--amber-400)' : 'var(--primary-400)'} />
            <StatRow label="Low Threshold" value={`≤ ${TANK_LOW_THRESHOLD}%`} color="var(--text-muted)" />

            {/* Status block */}
            <div style={{
              background: `${status.color}10`,
              border: `1px solid ${status.color}30`,
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: status.color, marginBottom: 2 }}>
                {level > TANK_LOW_THRESHOLD && !sensorError ? 'Rainwater Available' : sensorError ? 'Sensor Error' : 'Rainwater Low'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {sensorError
                  ? 'HC-SR04 signal not detected. Cannot determine tank level.'
                  : level > TANK_LOW_THRESHOLD
                  ? 'Tank level sufficient. Pump 1 (rainwater) can be used for irrigation.'
                  : 'Rainwater below threshold. Pump 2 (backup) will be used.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
      <span className="text-sm text-secondary">{label}</span>
      <span className="font-mono text-sm" style={{ color, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
