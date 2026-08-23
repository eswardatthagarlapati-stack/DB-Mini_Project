import { Droplets, Droplet, Clock, Repeat } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import type { SessionStats } from '../../types/ecoRain';

interface WaterManagementProps {
  sessionStats: SessionStats;
}

export function WaterManagement({ sessionStats }: WaterManagementProps) {
  const stats = [
    {
      icon: <Droplets size={18} />,
      label: 'Pump 1 (Rainwater)',
      value: formatDuration(sessionStats.pump1OnSeconds),
      color: 'var(--primary-400)',
      bg: 'rgba(0,180,216,0.1)',
      border: 'rgba(0,180,216,0.2)',
    },
    {
      icon: <Droplet size={18} />,
      label: 'Pump 2 (Backup)',
      value: formatDuration(sessionStats.pump2OnSeconds),
      color: 'var(--green-400)',
      bg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.2)',
    },
    {
      icon: <Clock size={18} />,
      label: 'Total Pump Runtime',
      value: formatDuration(sessionStats.pump1OnSeconds + sessionStats.pump2OnSeconds),
      color: 'var(--amber-400)',
      bg: 'rgba(251,191,36,0.1)',
      border: 'rgba(251,191,36,0.2)',
    },
    {
      icon: <Repeat size={18} />,
      label: 'Irrigation Sessions',
      value: String(sessionStats.irrigationSessions),
      color: 'var(--purple-300)',
      bg: 'rgba(168,85,247,0.1)',
      border: 'rgba(168,85,247,0.2)',
    },
  ];

  return (
    <div className="card animate-in" role="region" aria-label="Water Management Statistics">
      <div className="flex items-center gap-2 mb-4">
        <Droplets size={18} color="var(--primary-400)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
          Water Management
        </h2>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Session statistics
        </span>
      </div>

      <div className="grid-4" style={{ gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: s.color, marginBottom: 8 }}>
              {s.icon}
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
