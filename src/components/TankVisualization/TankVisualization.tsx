import { Cylinder, AlertTriangle, CheckCircle2, Droplets, Info } from 'lucide-react';
import { getSystemConfig } from '../../config/deviceConfig';
import { calculateTankPercentage } from '../../utils/tankCalculation';

interface TankVisualizationProps {
  waterLevel: number | null;
  distance: number | null;
}

export function TankVisualization({ waterLevel, distance }: TankVisualizationProps) {
  const config = getSystemConfig();
  const sensorError = distance !== null && distance < 0;

  // Use calculated tank metrics based on tank height & sensor offset
  const tankCalc = distance !== null && !sensorError
    ? calculateTankPercentage(distance, {
        tankHeightCm: config.tankHeightCm,
        sensorOffsetCm: config.sensorOffsetCm,
        minimumUsableLevelPct: config.minimumUsableLevelPct,
      })
    : {
        percentage: waterLevel !== null ? Math.max(0, Math.min(100, waterLevel)) : 0,
        waterDepthCm: 0,
        isError: sensorError,
        status: sensorError ? ('UNAVAILABLE' as const) : waterLevel !== null && waterLevel >= 70 ? ('SUFFICIENT' as const) : ('LOW' as const),
        reason: sensorError ? 'HC-SR04 signal not detected' : 'Storage volume tracking active',
      };

  const level = sensorError || (waterLevel === null && distance === null) ? 0 : tankCalc.percentage;

  const statusColor =
    sensorError || (waterLevel === null && distance === null)
      ? 'var(--amber-400)'
      : level >= 70
      ? '#38bdf8'
      : level >= 40
      ? '#0ea5e9'
      : level > config.minimumUsableLevelPct
      ? '#fbbf24'
      : '#f87171';

  const statusBg =
    sensorError || (waterLevel === null && distance === null)
      ? 'rgba(245, 158, 11, 0.15)'
      : level >= 70
      ? 'rgba(56, 189, 248, 0.15)'
      : level >= 40
      ? 'rgba(14, 165, 233, 0.15)'
      : 'rgba(239, 68, 68, 0.15)';

  const waterGradient =
    level >= 70
      ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.95) 0%, rgba(2, 96, 138, 0.98) 100%)'
      : level >= 40
      ? 'linear-gradient(180deg, rgba(14, 165, 233, 0.9) 0%, rgba(3, 105, 161, 0.98) 100%)'
      : level > config.minimumUsableLevelPct
      ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.85) 0%, rgba(180, 83, 9, 0.98) 100%)'
      : 'linear-gradient(180deg, rgba(239, 68, 68, 0.85) 0%, rgba(153, 27, 27, 0.98) 100%)';

  return (
    <div
      className="card tank-viz-card"
      style={{ borderTop: '3px solid #0284c7' }}
      role="region"
      aria-label="Rainwater Storage Tank Visualization"
    >
      {/* Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="card-title">RAINWATER TANK VISUALIZATION</h2>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                color: statusColor,
                background: statusBg,
                border: `1px solid ${statusColor}40`,
              }}
            >
              STATUS: {tankCalc.status}
            </span>
          </div>
          <span className="card-subtitle">
            HC-SR04 Ultrasonic Telemetry · Pins TRIG=D5, ECHO=D6 · Geometric Fill Computation
          </span>
        </div>
        <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
          <Cylinder size={18} />
        </div>
      </div>

      {/* Main visualization grid */}
      <div className="tank-visual-layout">
        {/* Cylindrical Technical Tank Graphic */}
        <div
          className="tank-vessel-wrap"
          role="img"
          aria-label={`Rainwater Tank Level: ${sensorError ? 'Unavailable' : `${level}%`}`}
        >
          {sensorError ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 14,
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={28} color="var(--amber-400)" />
              <span style={{ fontSize: '0.82rem', color: 'var(--amber-400)', fontWeight: 600, lineHeight: 1.3 }}>
                Sensor Signal Lost<br />
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.72rem' }}>
                  HC-SR04 distance timeout (-1 cm)
                </span>
              </span>
            </div>
          ) : (
            <>
              {/* Dynamic Water Body with Liquid Top Wave */}
              <div
                className="tank-water-body"
                style={{
                  height: `${Math.max(2, level)}%`,
                  background: waterGradient,
                  boxShadow: `0 0 20px ${statusColor}40`,
                }}
              >
                {level > 3 && <div className="tank-wave-top" />}
              </div>

              {/* Technical Calibration Level Markers */}
              {[75, 50, 25].map((mark) => (
                <div key={mark} className="tank-marker" style={{ top: `${100 - mark}%` }}>
                  <span className="tank-marker-text">{mark}%</span>
                </div>
              ))}

              {/* Central Large Level Readout */}
              <div className="tank-center-badge">
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  {distance !== null || waterLevel !== null ? `${level}%` : '—'}
                </span>
                <span style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--water-100)', textTransform: 'uppercase' }}>
                  RAINWATER LEVEL
                </span>
              </div>
            </>
          )}
        </div>

        {/* Technical Companion Telemetry Column */}
        <div className="tank-details-col">
          <div className="tank-metric-row">
            <span className="text-sm text-secondary">Reservoir Storage Status</span>
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
                color: statusColor,
                background: statusBg,
                border: `1px solid ${statusColor}40`,
              }}
            >
              {tankCalc.status === 'SUFFICIENT' ? (
                <CheckCircle2 size={12} />
              ) : tankCalc.status === 'UNAVAILABLE' ? (
                <AlertTriangle size={12} />
              ) : (
                <Droplets size={12} />
              )}
              {tankCalc.status}
            </span>
          </div>

          <div className="tank-metric-row">
            <span className="text-sm text-secondary">Ultrasonic Sensor Distance</span>
            <span className="font-mono text-sm" style={{ fontWeight: 700, color: sensorError ? 'var(--amber-400)' : 'var(--text-primary)' }}>
              {sensorError ? 'Sensor Error (-1 cm)' : distance !== null ? `${distance.toFixed(1)} cm` : '—'}
            </span>
          </div>

          <div className="tank-metric-row">
            <span className="text-sm text-secondary">Tank Geometry (Configured)</span>
            <span className="font-mono text-xs text-muted">
              Height: {config.tankHeightCm} cm · Offset: {config.sensorOffsetCm} cm
            </span>
          </div>

          <div className="tank-metric-row">
            <span className="text-sm text-secondary">Low-Level Switchover Threshold</span>
            <span className="font-mono text-sm text-amber" style={{ fontWeight: 600 }}>
              ≤ {config.minimumUsableLevelPct}% (Triggers Pump 2 Backup)
            </span>
          </div>

          {/* Operational Advisory Callout */}
          <div
            className="tank-callout"
            style={{
              borderColor: `${statusColor}40`,
              background: `${statusColor}0c`,
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: statusColor, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={14} />
              {tankCalc.reason}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              {sensorError
                ? 'Check HC-SR04 connections on pins TRIG=D5 and ECHO=D6. The firmware returns -1 when no ultrasonic echo is detected within 30ms.'
                : level > config.minimumUsableLevelPct
                ? 'Rainwater capacity is sufficient. Automatic irrigation will preferentially engage Pump 1 (Rainwater).'
                : 'Rainwater capacity is depleted. When soil requires irrigation, controller will automatically divert to Pump 2 (Backup water tank).'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
