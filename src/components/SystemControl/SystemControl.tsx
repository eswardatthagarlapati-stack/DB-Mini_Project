import { useState } from 'react';
import { Settings2, Power, AlertOctagon, RefreshCw, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import type { ControlAction } from '../../types/ecoRain';

interface SystemControlProps {
  autoMode: boolean | null;
  isLoading: boolean;
  onSendCommand: (action: ControlAction) => Promise<boolean>;
}

export function SystemControl({ autoMode, isLoading, onSendCommand }: SystemControlProps) {
  const [confirmStopAll, setConfirmStopAll] = useState(false);
  const [stopState, setStopState] = useState<'idle' | 'sending' | 'confirmed' | 'failed'>('idle');
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
    setStopState('sending');
    setBusyAction('all_off');
    const ok = await onSendCommand('all_off');
    setBusyAction(null);
    setStopState(ok ? 'confirmed' : 'failed');
    setTimeout(() => setStopState('idle'), 3500);
  }

  return (
    <>
      <div
        className="card decision-card"
        style={{ borderTop: '3px solid #8b5cf6' }}
        role="region"
        aria-label="System Control Panel"
      >
        <div>
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">SYSTEM CONTROL</h2>
              <span className="card-subtitle">Operational Mode & Emergency Hardware Cutoff</span>
            </div>
            <div className="card-icon-badge" style={{ color: 'var(--purple-400, #a78bfa)' }}>
              <Settings2 size={18} />
            </div>
          </div>

          {/* Automatic / Manual Mode Toggle Row */}
          <div className="control-mode-toggle-row">
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Automatic Mode</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    background: autoMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: autoMode ? 'var(--green-400)' : 'var(--amber-400)',
                    border: `1px solid ${autoMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  }}
                >
                  {autoMode === null ? 'SYNCING' : autoMode ? 'AUTOMATIC' : 'MANUAL'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                {autoMode
                  ? 'System automatically selects Pump 1 or Pump 2 based on soil moisture and rainwater level.'
                  : 'Manual Mode is ACTIVE. Automatic logic will NOT change pump state.'}
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

          {/* Manual Mode Active Notice Badge */}
          {autoMode === false && (
            <div
              style={{
                marginTop: 10,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.78rem',
                color: 'var(--amber-400)',
                fontWeight: 600,
              }}
            >
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>MANUAL MODE ACTIVE — Operator possesses direct override control over relays.</span>
            </div>
          )}
        </div>

        {/* Emergency Stop Action Area */}
        <div style={{ marginTop: 14 }}>
          {stopState === 'confirmed' && (
            <div
              style={{
                marginBottom: 8,
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.35)',
                color: 'var(--green-400)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <CheckCircle2 size={14} /> Confirmed OFF — Both pumps halted successfully
            </div>
          )}

          {stopState === 'failed' && (
            <div
              style={{
                marginBottom: 8,
                padding: '6px 12px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: 'var(--red-400)',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <AlertCircle size={14} /> Failed — Could not confirm pump shutoff with ESP8266
            </div>
          )}

          <button
            className="btn btn-red btn-full"
            onClick={() => setConfirmStopAll(true)}
            disabled={isLoading || stopState === 'sending'}
            id="btn-stop-all-pumps"
            aria-label="Emergency Stop All Pumps"
            style={{
              padding: '12px 20px',
              fontSize: '0.9rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
            }}
          >
            {stopState === 'sending' ? (
              <><RefreshCw size={16} className="spin-icon" /> Sending…</>
            ) : (
              <><AlertOctagon size={18} /> STOP ALL PUMPS</>
            )}
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
            Emergency stop disengages Relay 1 & Relay 2 immediately and switches to Manual Mode.
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Stop All */}
      {confirmStopAll && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-stop-title">
          <div className="modal-box">
            <div className="modal-header">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--red-400)',
                }}
              >
                <AlertOctagon size={20} />
              </div>
              <h3 className="modal-title" id="modal-stop-title">STOP ALL PUMPS?</h3>
            </div>
            <p className="modal-desc">
              This will immediately send a cutoff signal to the ESP8266 to deactivate <strong>Pump 1 (Rainwater)</strong> and <strong>Pump 2 (Normal Water)</strong>, and set the system to <strong>Manual Mode</strong>.
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
                <Power size={15} /> Confirm Stop All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
