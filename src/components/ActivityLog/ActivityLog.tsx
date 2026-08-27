import { ScrollText, Info, CheckCircle2, AlertTriangle, AlertOctagon, Zap, Settings2 } from 'lucide-react';
import type { ActivityEntry } from '../../types/ecoRain';
import { formatTime } from '../../utils/formatters';

interface ActivityLogProps {
  entries: ActivityEntry[];
}

const ICONS: Record<ActivityEntry['type'], React.ReactNode> = {
  info:    <Info size={13} color="var(--water-400)" />,
  success: <CheckCircle2 size={13} color="var(--green-400)" />,
  warning: <AlertTriangle size={13} color="var(--amber-400)" />,
  error:   <AlertOctagon size={13} color="var(--red-400)" />,
  pump:    <Zap size={13} color="var(--water-300)" />,
  system:  <Settings2 size={13} color="#c084fc" />,
};

export function ActivityLog({ entries }: ActivityLogProps) {
  return (
    <div className="card" role="region" aria-label="System Event Log">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Operational Event Log</h2>
          <span className="card-subtitle">Recent controller dispatches & threshold state shifts</span>
        </div>
        <div className="card-icon-badge">
          <ScrollText size={18} />
        </div>
      </div>

      {entries.length === 0 ? (
        <div style={{
          height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: '0.8rem',
          border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
        }}>
          No event records generated in this session.
        </div>
      ) : (
        <div style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 4 }}>
          {entries.slice(0, 40).map(entry => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div style={{ flexShrink: 0 }}>
                {ICONS[entry.type]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.message}
                </div>
              </div>
              <div className="font-mono text-xs text-muted" style={{ flexShrink: 0, fontSize: '0.7rem' }}>
                {formatTime(entry.timestamp)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
