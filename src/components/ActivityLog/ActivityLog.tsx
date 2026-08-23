import { ScrollText, Info, CheckCircle, AlertTriangle, AlertOctagon, Zap, Settings } from 'lucide-react';
import type { ActivityEntry } from '../../types/ecoRain';
import { formatTime } from '../../utils/formatters';

interface ActivityLogProps {
  entries: ActivityEntry[];
}

const ICONS: Record<ActivityEntry['type'], React.ReactNode> = {
  info:    <Info size={13} color="var(--primary-400)" />,
  success: <CheckCircle size={13} color="var(--green-400)" />,
  warning: <AlertTriangle size={13} color="var(--amber-400)" />,
  error:   <AlertOctagon size={13} color="var(--red-400)" />,
  pump:    <Zap size={13} color="var(--primary-300)" />,
  system:  <Settings size={13} color="var(--purple-300)" />,
};

export function ActivityLog({ entries }: ActivityLogProps) {
  return (
    <div className="card animate-in" role="region" aria-label="Dashboard Activity Log">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText size={18} color="var(--primary-400)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
          Activity Log
        </h2>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem', color: 'var(--text-muted)',
          background: 'var(--bg-elevated)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
        }}>
          Dashboard Session Activity
        </span>
      </div>

      {entries.length === 0 ? (
        <div style={{
          height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-dim)', fontSize: '0.875rem',
          border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
        }}>
          No activity yet
        </div>
      ) : (
        <div className="activity-timeline" style={{ maxHeight: 360, overflowY: 'auto' }}>
          {entries.slice(0, 50).map(entry => (
            <div key={entry.id} className="activity-item">
              <div className={`activity-icon-wrap ${entry.type}`} aria-hidden="true">
                {ICONS[entry.type]}
              </div>
              <div style={{ flex: 1 }}>
                <div className="activity-message">{entry.message}</div>
                <div className="activity-time">{formatTime(entry.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
