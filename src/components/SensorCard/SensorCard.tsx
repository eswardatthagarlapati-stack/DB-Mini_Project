import type { ReactNode } from 'react';

interface SensorCardProps {
  title: string;
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  value: number | string | null;
  unit?: string;
  statusLabel?: string;
  statusType?: 'green' | 'orange' | 'red' | 'blue' | 'gray';
  unavailable?: boolean;
}

export function SensorCard({
  title,
  icon,
  iconBg = 'var(--bg-surface)',
  iconColor = 'var(--color-brand)',
  value,
  unit,
  statusLabel,
  statusType = 'gray',
  unavailable = false,
}: SensorCardProps) {
  const displayValue = unavailable || value === null || value === undefined
    ? '--'
    : typeof value === 'number'
    ? value % 1 === 0
      ? value.toString()
      : value.toFixed(1)
    : value;

  const displayStatus = unavailable ? 'Sensor unavailable' : statusLabel;
  const displayStatusType = unavailable ? 'orange' : statusType;

  return (
    <div className="card sensor-card-simple" role="region" aria-label={title}>
      {/* Header with Title and Icon */}
      <div className="sensor-card-header">
        <span className="sensor-card-title">{title}</span>
        <div
          className="sensor-icon-box"
          style={{ background: iconBg, color: iconColor }}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      {/* Main Value Display */}
      <div className="sensor-value-row">
        <span className="sensor-big-number">{displayValue}</span>
        {!unavailable && unit && displayValue !== '--' && (
          <span className="sensor-unit">{unit}</span>
        )}
      </div>

      {/* Clear Status Tag */}
      {displayStatus && (
        <div className={`sensor-status-tag ${displayStatusType}`}>
          <span className="status-dot" style={{ backgroundColor: 'currentColor' }} />
          <span>{displayStatus}</span>
        </div>
      )}
    </div>
  );
}
