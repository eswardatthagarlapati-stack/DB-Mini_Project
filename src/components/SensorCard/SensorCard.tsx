import type { ReactNode } from 'react';

interface SensorCardProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: string;
  value: number | null;
  unit?: string;
  unavailable?: boolean;
  children?: ReactNode;
  accentClass?: string;
  style?: React.CSSProperties;
}

export function SensorCard({
  title, subtitle, icon, iconColor = 'var(--primary-400)',
  value, unit, unavailable, children, accentClass = '', style
}: SensorCardProps) {
  return (
    <div className={`card animate-in ${accentClass}`} style={style} role="region" aria-label={title}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="metric-label">{title}</p>
          {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
        </div>
        <div style={{
          width: 40, height: 40,
          borderRadius: 'var(--radius-md)',
          background: `${iconColor}18`,
          border: `1px solid ${iconColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>

      {/* Value */}
      {unavailable ? (
        <p className="metric-unavailable">—</p>
      ) : (
        <p className="metric-value" aria-live="polite">
          {value !== null ? value.toFixed(value % 1 === 0 ? 0 : 1) : '—'}
          {value !== null && unit && <span className="metric-unit">{unit}</span>}
        </p>
      )}

      {/* Slot for extra content */}
      {children}
    </div>
  );
}
