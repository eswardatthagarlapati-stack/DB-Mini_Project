import { useState } from 'react';
import { Settings2, Power, AlertOctagon, RefreshCw } from 'lucide-react';
import type { ControlAction } from '../../types/ecoRain';

interface SystemControlProps {
  autoMode: boolean | null;
  isLoading: boolean;
  onSendCommand: (action: ControlAction) => Promise<boolean>;
}

export function SystemControl({ autoMode, isLoading, onSendCommand }: SystemControlProps) {
  const [confirmStopAll, setConfirmStopAll] = useState(false);
  const [busyAction, setBusyAction] = useState<ControlAction | null>(null);

  async function handleToggle() {
    if (autoMode === null || isLoading || busyAction) return;
    const targetAction: ControlAction = autoMode ? 'manual' : 'auto';
    setBusyAction(targetAction);
    await onSendCommand(targetAction);
    setBusyAction(null);
  }

  async function handleConfirmStopAll() {
    setConfirmStopAll(false);
    setBusyAction('all_off');
    await onSendCommand('all_off');
    setBusyAction(null);
  }

  return (
    <>
      <div className="card decision-card" role="region" aria-label="System Control Panel">
        <div>
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">System Control</h2>
              <span className="card-subtitle">Operational Mode & Hardware Overrides</span>
            </div>
            <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
              <Settings2 size={18} />
            </div>
          </div>

          {/* Automatic / Manual Mode Toggle */}
          <div className="control-mode-toggle-row">
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Automatic Mode</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    background: autoMode ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: autoMode ? 'var(--green-400)' : 'var(--amber-400)',
                    border: `1px solid ${autoMode ? 'rgba(34, 197, 94, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  }}
                >
                  {autoMode === null ? 'SYNCING' : autoMode ? 'ACTIVE' : 'MANUAL OVERRIDE'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {autoMode
                  ? 'Firmware regulates irrigation autonomously based on moisture thresholds'
                  : 'Manual pump control enabled. Automated thresholds bypassed.'}
              </div>
            </div>

            <button
              className={`control-switch${autoMode ? ' on' : ''}`}
              onClick={handleToggle}
              disabled={isLoading || autoMode === null || busyAction !== null}
              aria-label={`Toggle ${autoMode ? 'manual' : 'automatic'} mode`}
              id="toggle-auto-mode"
            >
              <span className="control-switch-knob" />
            </button>
          </div>
        </div>

        {/* Emergency Stop Action */}
        <div style={{ marginTop: 12 }}>
          <button
            className="btn btn-red btn-full"
            onClick={() => setConfirmStopAll(true)}
            disabled={isLoading || busyAction === 'all_off'}
            id="btn-stop-all-pumps"
            aria-label="Emergency Stop All Pumps"
          >
            {busyAction === 'all_off' ? (
              <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Stopping All Pumps…</>
            ) : (
              <><AlertOctagon size={16} /> STOP ALL PUMPS</>
            )}
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
            Safely disconnects both pumps and resets system to Manual Mode.
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Stop All */}
      {confirmStopAll && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-stop-title">
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red-400)' }}>
                <AlertOctagon size={20} />
              </div>
              <h3 className="modal-title" id="modal-stop-title">Stop all pumps?</h3>
            </div>
            <p className="modal-desc">
              This will immediately send an emergency cutoff signal to stop both <strong>Pump 1 (Rainwater)</strong> and <strong>Pump 2 (Backup)</strong>, switching the system to <strong>Manual Mode</strong>.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmStopAll(false)}
                id="btn-modal-stop-cancel"
              >
                Cancel
              </button>
              <button
                className="btn btn-red"
                onClick={handleConfirmStopAll}
                id="btn-modal-stop-confirm"
              >
                <Power size={15} /> Stop All Pumps
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
