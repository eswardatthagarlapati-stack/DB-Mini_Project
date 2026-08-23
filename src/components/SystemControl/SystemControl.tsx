import { useState } from 'react';
import { Power, Settings, AlertOctagon } from 'lucide-react';
import type { ControlAction } from '../../types/ecoRain';

interface SystemControlProps {
  autoMode: boolean | null;
  isLoading: boolean;
  onSendCommand: (action: ControlAction) => Promise<boolean>;
}

export function SystemControl({ autoMode, isLoading, onSendCommand }: SystemControlProps) {
  const [confirm, setConfirm] = useState(false);
  const [sending, setSending] = useState<ControlAction | null>(null);

  async function handleToggle() {
    if (autoMode === null) return;
    const action: ControlAction = autoMode ? 'manual' : 'auto';
    setSending(action);
    await onSendCommand(action);
    setSending(null);
  }

  async function handleStopAll() {
    setConfirm(false);
    setSending('all_off');
    await onSendCommand('all_off');
    setSending(null);
  }

  const isToggling = sending === 'auto' || sending === 'manual';
  const isStopping = sending === 'all_off';

  return (
    <>
      <div className="card animate-in" role="region" aria-label="System Control">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} color="var(--primary-400)" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
            System Control
          </h2>
        </div>

        {/* Auto/Manual Toggle */}
        <div style={{ marginBottom: 20 }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Irrigation Mode
              </p>
              <p className="text-xs text-muted mt-1">
                {autoMode === null ? 'Loading…' : autoMode ? 'System controls pumps automatically' : 'Manual pump control active'}
              </p>
            </div>
            {isToggling ? (
              <span className="spinner" style={{ color: 'var(--primary-400)' }} />
            ) : (
              <button
                className={`toggle${autoMode ? ' on' : ''}`}
                onClick={handleToggle}
                disabled={isLoading || autoMode === null}
                aria-pressed={autoMode ?? false}
                aria-label={`Switch to ${autoMode ? 'manual' : 'automatic'} mode`}
                id="toggle-auto-mode"
              >
                <span className="toggle-thumb" />
              </button>
            )}
          </div>

          {/* Mode badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            background: autoMode ? 'rgba(0,180,216,0.12)' : 'rgba(168,85,247,0.12)',
            color: autoMode ? 'var(--primary-400)' : 'var(--purple-300)',
            border: `1px solid ${autoMode ? 'rgba(0,180,216,0.25)' : 'rgba(168,85,247,0.25)'}`,
          }}>
            <Power size={10} />
            {autoMode === null ? 'Loading' : autoMode ? 'Automatic' : 'Manual'}
          </div>
        </div>

        <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />

        {/* Stop All */}
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            Emergency stop — disables all pumps and switches to manual mode.
          </p>
          <button
            className="btn btn-red btn-full"
            onClick={() => setConfirm(true)}
            disabled={isLoading || isStopping}
            id="btn-stop-all"
            aria-label="Stop all pumps"
          >
            {isStopping ? (
              <><span className="spinner" />Stopping…</>
            ) : (
              <><AlertOctagon size={16} />STOP ALL PUMPS</>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="stop-modal-title">
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertOctagon size={22} color="var(--red-400)" />
              <h3 className="modal-title" id="stop-modal-title">Stop All Pumps?</h3>
            </div>
            <p className="modal-desc">
              This will immediately stop both pumps and switch the system to <strong>Manual Mode</strong>. The system will not irrigate automatically until Automatic Mode is re-enabled.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(false)} id="btn-stop-cancel">
                Cancel
              </button>
              <button className="btn btn-red" onClick={handleStopAll} id="btn-stop-confirm">
                <AlertOctagon size={15} /> Stop All Pumps
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
