import { Droplets, Droplet, Clock, Repeat2 } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import type { SessionStats } from '../../types/ecoRain';

interface WaterManagementProps {
  sessionStats: SessionStats;
}

export function WaterManagement({ sessionStats }: WaterManagementProps) {
  const stats = [
    {
      icon: <Droplets size={16} />,
      label: 'Pump 1 (Rainwater)',
      value: formatDuration(sessionStats.pump1OnSeconds),
      color: 'var(--water-400)',
    },
    {
      icon: <Droplet size={16} />,
      label: 'Pump 2 (Backup)',
      value: formatDuration(sessionStats.pump2OnSeconds),
      color: 'var(--green-400)',
    },
    {
      icon: <Clock size={16} />,
      label: 'Total Irrigation Time',
      value: formatDuration(sessionStats.pump1OnSeconds + sessionStats.pump2OnSeconds),
      color: 'var(--amber-400)',
    },
    {
      icon: <Repeat2 size={16} />,
      label: 'Irrigation Cycles',
      value: String(sessionStats.irrigationSessions),
      color: '#c084fc',
    },
  ];

  return (
    <div className="card" role="region" aria-label="Water Resource Metrics">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Water Resource Utilization</h2>
          <span className="card-subtitle">Session cumulative runtime & dispatch cycles</span>
        </div>
        <div className="card-icon-badge">
          <Droplets size={18} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.color, marginBottom: 6 }}>
              {s.icon}
              <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
