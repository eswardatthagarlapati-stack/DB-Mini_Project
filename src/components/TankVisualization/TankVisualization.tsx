import { Droplets, AlertTriangle } from 'lucide-react';
import { getSystemConfig } from '../../config/deviceConfig';

interface TankVisualizationProps {
  waterLevel: number | null;
  distance: number | null;
}

export function TankVisualization({ waterLevel, distance }: TankVisualizationProps) {
  const config = getSystemConfig();
  const sensorError = distance !== null && distance < 0;
  const isUnavailable = sensorError || (waterLevel === null && distance === null);

  const level = isUnavailable ? 0 : Math.max(0, Math.min(100, waterLevel ?? 0));

  const statusInfo = (() => {
    if (isUnavailable) {
      return {
        label: 'Sensor Unavailable',
        type: 'orange' as const,
        note: 'The ultrasonic sensor (HC-SR04) signal is not detected. Please verify connections on pins D5/D6.',
      };
    }
    if (level <= 0) {
      return {
        label: 'Empty',
        type: 'red' as const,
        note: 'Rainwater is empty. The system will automatically use the main water tank for irrigation.',
      };
    }
    if (level <= config.minimumUsableLevelPct) {
      return {
        label: 'Low Water',
        type: 'orange' as const,
        note: `Rainwater is low (below ${config.minimumUsableLevelPct}%). The system will switch to the main water tank.`,
      };
    }
    return {
      label: 'Water Available',
      type: 'green' as const,
      note: 'There is plenty of rainwater available for automatic irrigation.',
    };
  })();

  return (
    <div className="card" role="region" aria-label="Rainwater Tank">
      <div className="card-header" style={{ marginBottom: 16 }}>
        <h2 className="card-title-main">
          <Droplets size={20} color="var(--color-blue)" />
          Rainwater Tank
        </h2>
        <div className={`status-badge ${statusInfo.type === 'green' ? 'connected' : statusInfo.type === 'orange' ? 'connecting' : 'disconnected'}`}>
          <span className={`status-dot ${statusInfo.type === 'green' ? 'green' : statusInfo.type === 'orange' ? 'orange' : 'red'}`} />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      <div className="tank-card-inner">
        {/* Clean Vertical Tank Visual Gauge */}
        <div className="tank-gauge-container" aria-label={`Water level ${isUnavailable ? 'unavailable' : `${level}%`}`}>
          <div
            className="tank-gauge-fill"
            style={{
              height: `${level}%`,
              backgroundColor:
                statusInfo.type === 'red'
                  ? 'var(--color-red)'
                  : statusInfo.type === 'orange'
                  ? 'var(--color-orange)'
                  : 'var(--color-blue)',
            }}
          />

          <div className="tank-gauge-markers">
            <span className="tank-gauge-mark">100%</span>
            <span className="tank-gauge-mark">75%</span>
            <span className="tank-gauge-mark">50%</span>
            <span className="tank-gauge-mark">25%</span>
            <span className="tank-gauge-mark">0%</span>
          </div>

          <div className="tank-gauge-center-val">
            {isUnavailable ? '--' : `${Math.round(level)}%`}
          </div>
        </div>

        {/* Companion Information Table */}
        <div className="tank-details-grid">
          <div className="tank-stat-row">
            <span className="tank-stat-label">Water Level</span>
            <span className="tank-stat-val">
              {isUnavailable ? '--' : `${level.toFixed(0)}%`}
            </span>
          </div>

          <div className="tank-stat-row">
            <span className="tank-stat-label">Sensor Distance</span>
            <span className="tank-stat-val">
              {sensorError ? 'Error (-1 cm)' : distance !== null ? `${distance.toFixed(1)} cm` : '--'}
            </span>
          </div>

          <div className="tank-stat-row">
            <span className="tank-stat-label">Backup Switch Threshold</span>
            <span className="tank-stat-val text-sm">
              Below {config.minimumUsableLevelPct}%
            </span>
          </div>

          {/* Clean Explanatory Note */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              borderLeft: `4px solid ${
                statusInfo.type === 'green'
                  ? 'var(--color-green)'
                  : statusInfo.type === 'orange'
                  ? 'var(--color-orange)'
                  : 'var(--color-red)'
              }`,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              marginTop: 4,
            }}
          >
            {sensorError ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-orange)' }}>
                <AlertTriangle size={15} />
                <span>{statusInfo.note}</span>
              </div>
            ) : (
              <span>{statusInfo.note}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
