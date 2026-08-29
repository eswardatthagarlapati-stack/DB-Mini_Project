import type { ReactNode } from 'react';

interface SensorCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
  gradient?: string;
  value: number | null;
  unit?: string;
  unavailable?: boolean;
  unavailableText?: string;
  statusLabel?: string;
  statusColor?: string;
  secondaryInfo?: string;
  children?: ReactNode;
  style?: React.CSSProperties;
}

export function SensorCard({
  title,
  subtitle,
  icon,
  iconColor = 'var(--water-400)',
  gradient,
  value,
  unit,
  unavailable,
  unavailableText = 'Sensor unavailable',
  statusLabel,
  statusColor,
  secondaryInfo,
  children,
  style,
}: SensorCardProps) {
  return (
    <div
      className="card sensor-card"
      style={{
        ...style,
        borderTop: gradient ? `3px solid ${iconColor}` : undefined,
      }}
      role="region"
      aria-label={title}
    >
      {/* Header */}
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">{title}</h2>
          {subtitle && <span className="card-subtitle">{subtitle}</span>}
        </div>
        <div
          className="card-icon-badge"
          style={{
            color: iconColor,
            background: `${iconColor}18`,
            border: `1px solid ${iconColor}30`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Main Metric Value Display */}
      <div className="metric-value-display">
        {unavailable ? (
          <span className="metric-unavailable" style={{ color: 'var(--amber-400)' }}>
            {unavailableText}
          </span>
        ) : (
          <>
            <span className="metric-number" style={{ color: gradient ? 'var(--text-primary)' : undefined }}>
              {value !== null ? (value % 1 === 0 ? value : value.toFixed(1)) : '—'}
            </span>
            {value !== null && unit && <span className="metric-unit">{unit}</span>}
          </>
        )}
      </div>

      {/* Status indicator tag */}
      {statusLabel && !unavailable && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: statusColor || 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: statusColor ? `${statusColor}15` : 'transparent',
              padding: statusColor ? '2px 6px' : undefined,
              borderRadius: 'var(--radius-xs)',
              border: statusColor ? `1px solid ${statusColor}30` : undefined,
            }}
          >
            ● {statusLabel}
          </span>
          {secondaryInfo && (
            <span className="font-mono text-xs text-muted">
              {secondaryInfo}
            </span>
          )}
        </div>
      )}

      {/* Optional visualizations / progress track */}
      {children}
    </div>
  );
}
