import { Cylinder, AlertTriangle, CheckCircle2, Droplets } from 'lucide-react';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';
import { tankTier } from '../../utils/formatters';

interface TankVisualizationProps {
  waterLevel: number | null;
  distance: number | null;
}

export function TankVisualization({ waterLevel, distance }: TankVisualizationProps) {
  const sensorError = distance !== null && distance < 0;
  const level = (waterLevel !== null && !sensorError) ? Math.max(0, Math.min(100, waterLevel)) : 0;
  const tierInfo = tankTier(level, sensorError || waterLevel === null);

  const waterGradient =
    tierInfo.tier === 'GOOD'
      ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.85) 0%, rgba(2, 96, 138, 0.95) 100%)'
      : tierInfo.tier === 'MODERATE'
      ? 'linear-gradient(180deg, rgba(14, 165, 233, 0.8) 0%, rgba(3, 105, 161, 0.95) 100%)'
      : tierInfo.tier === 'LOW'
      ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.75) 0%, rgba(180, 83, 9, 0.95) 100%)'
      : 'linear-gradient(180deg, rgba(239, 68, 68, 0.75) 0%, rgba(153, 27, 27, 0.95) 100%)';

  return (
    <div className="card" role="region" aria-label="Rainwater Storage Tank">
      {/* Header */}
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Rainwater Storage Tank</h2>
          <span className="card-subtitle">HC-SR04 Ultrasonic Telemetry · Distance to Water Surface</span>
        </div>
        <div className="card-icon-badge" style={{ color: tierInfo.color }}>
          <Cylinder size={18} />
        </div>
      </div>

      {/* Main visualization grid */}
      <div className="tank-visual-layout">
        {/* Cylindrical Technical Tank */}
        <div className="tank-vessel-wrap" role="img" aria-label={`Tank level: ${tierInfo.tier === 'UNAVAILABLE' ? 'Unavailable' : `${level}%`}`}>
          {tierInfo.tier === 'UNAVAILABLE' ? (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: 14, textAlign: 'center',
            }}>
              <AlertTriangle size={26} color="var(--amber-400)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--amber-400)', fontWeight: 600, lineHeight: 1.3 }}>
                Sensor Signal Lost<br />
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.7rem' }}>
                  HC-SR04 signal not detected
                </span>
              </span>
            </div>
          ) : (
            <>
              {/* Dynamic Water Body */}
              <div
                className="tank-water-body"
                style={{ height: `${level}%`, background: waterGradient }}
              >
                {level > 5 && <div className="tank-wave-top" />}
              </div>

              {/* Level Markers */}
              {[75, 50, 25].map(mark => (
                <div
                  key={mark}
                  className="tank-marker"
                  style={{ top: `${100 - mark}%` }}
                >
                  <span className="tank-marker-text">{mark}%</span>
                </div>
              ))}

              {/* Central Level Readout */}
              <div className="tank-center-badge">
                {level}%
              </div>
            </>
          )}
        </div>

        {/* Technical Companion Telemetry */}
        <div className="tank-details-col">
          <div className="tank-metric-row">
            <span className="text-sm text-secondary">Storage Capacity Status</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: tierInfo.color,
                background: `${tierInfo.color}15`,
                border: `1px solid ${tierInfo.color}35`,
              }}
            >
              {tierInfo.tier === 'GOOD' ? <CheckCircle2 size={12} /> : tierInfo.tier === 'UNAVAILABLE' ? <AlertTriangle size={12} /> : <Droplets size={12} />}
              {tierInfo.tier}
            </span>
          </div>

          <div className="tank-metric-row">
            <span className="text-sm text-secondary">Ultrasonic Distance</span>
            <span className="font-mono text-sm" style={{ fontWeight: 600, color: sensorError ? 'var(--amber-400)' : 'var(--text-primary)' }}>
              {sensorError ? 'UNAVAILABLE' : distance !== null ? `${distance.toFixed(1)} cm` : '—'}
            </span>
          </div>

          <div className="tank-metric-row">
            <span className="text-sm text-secondary">Low-Level Switchover Threshold</span>
            <span className="font-mono text-sm text-muted">≤ {TANK_LOW_THRESHOLD}%</span>
          </div>

          {/* Operational Advisory Callout */}
          <div
            className="tank-callout"
            style={{
              borderColor: `${tierInfo.color}30`,
              background: `${tierInfo.color}0a`,
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: tierInfo.color, marginBottom: 3 }}>
              {tierInfo.desc}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              {tierInfo.tier === 'UNAVAILABLE'
                ? 'Check HC-SR04 pin connections (D5/D6). The firmware returns -1 when no echo pulse is detected.'
                : tierInfo.tier === 'GOOD' || tierInfo.tier === 'MODERATE'
                ? 'Rainwater volume is sufficient. Automatic irrigation will preferentially draw from Pump 1 (Rainwater).'
                : 'Rainwater volume is depleted. When irrigation is triggered, the controller will automatically engage Pump 2 (Backup water).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
