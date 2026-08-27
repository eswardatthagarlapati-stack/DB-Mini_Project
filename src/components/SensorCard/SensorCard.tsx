import type { ReactNode } from 'react';

interface SensorCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
  value: number | null;
  unit?: string;
  unavailable?: boolean;
  unavailableText?: string;
  statusLabel?: string;
  statusColor?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

export function SensorCard({
  title, subtitle, icon, iconColor = 'var(--water-400)',
  value, unit, unavailable, unavailableText = 'UNAVAILABLE', statusLabel, statusColor, children, style
}: SensorCardProps) {
  return (
    <div className="card" style={style} role="region" aria-label={title}>
      {/* Header */}
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">{title}</h2>
          {subtitle && <span className="card-subtitle">{subtitle}</span>}
        </div>
        <div
          className="card-icon-badge"
          style={{ color: iconColor, background: `${iconColor}15` }}
        >
          {icon}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="metric-value-display">
        {unavailable ? (
          <span className="metric-unavailable">{unavailableText}</span>
        ) : (
          <>
            <span className="metric-number">
              {value !== null ? (value % 1 === 0 ? value : value.toFixed(1)) : '—'}
            </span>
            {value !== null && unit && <span className="metric-unit">{unit}</span>}
          </>
        )}
      </div>

      {/* Status indicator tag if provided */}
      {statusLabel && (
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              color: statusColor || 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            ● {statusLabel}
          </span>
        </div>
      )}

      {/* Optional visualizations */}
      {children}
    </div>
  );
}
