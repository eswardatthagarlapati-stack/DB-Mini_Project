import { useState } from 'react';
import { Power, Activity, RefreshCw, Droplets, Droplet } from 'lucide-react';
import type { ControlAction } from '../../types/ecoRain';
import { formatDuration } from '../../utils/formatters';

interface PumpCardProps {
  pumpId: 1 | 2;
  title: string;
  sourceLabel: string;
  sourceDesc: string;
  isOn: boolean | null;
  isLoading: boolean;
  runtimeSeconds: number;
  onCommand: (action: ControlAction) => Promise<boolean>;
}

export function PumpCard({
  pumpId, title, sourceLabel, sourceDesc, isOn, isLoading, runtimeSeconds, onCommand
}: PumpCardProps) {
  const [confirmStart, setConfirmStart] = useState(false);
  const [busy, setBusy] = useState(false);

  const running = isOn === true;
  const onAction = `pump${pumpId}_on` as ControlAction;
  const offAction = `pump${pumpId}_off` as ControlAction;

  async function handleStart() {
    setConfirmStart(false);
    setBusy(true);
    await onCommand(onAction);
    setBusy(false);
  }

  async function handleStop() {
    setBusy(true);
    await onCommand(offAction);
    setBusy(false);
  }

  return (
    <>
      <div className={`card pump-card${running ? ' running' : ''}`} role="region" aria-label={title}>
        <div>
          {/* Header */}
          <div className="card-header">
            <div className="card-title-group">
              <h3 className="card-title">{title}</h3>
              <span className="card-subtitle">Source: {sourceLabel} · {sourceDesc}</span>
            </div>
            <div
              className="card-icon-badge"
              style={{
                color: running ? 'var(--green-400)' : 'var(--text-muted)',
                background: running ? 'rgba(34, 197, 94, 0.12)' : undefined,
                border: running ? '1px solid rgba(34, 197, 94, 0.3)' : undefined,
              }}
            >
              {pumpId === 1 ? <Droplets size={18} /> : <Droplet size={18} />}
            </div>
          </div>

          {/* Running Status & Runtime Bar */}
          <div className="pump-indicator-row">
            <span className={`pump-status-pill ${running ? 'running' : 'stopped'}`}>
              <span className={`status-dot ${running ? 'green' : 'gray'}`} />
              <span>{isOn === null ? 'SYNCING' : running ? 'RUNNING' : 'STOPPED'}</span>
            </span>

            {runtimeSeconds > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                <Activity size={13} className={running ? 'text-green' : undefined} />
                <span>Active: {formatDuration(runtimeSeconds)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pump-action-group">
          <button
            className="btn btn-green"
            onClick={() => setConfirmStart(true)}
            disabled={isLoading || busy || isOn === true || isOn === null}
            id={`btn-pump${pumpId}-start`}
            aria-label={`Start ${title}`}
          >
            {busy && !running ? (
              <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Starting…</>
            ) : (
              <><Power size={14} /> Start Pump</>
            )}
          </button>

          <button
            className="btn btn-ghost"
            onClick={handleStop}
            disabled={isLoading || busy || isOn === false || isOn === null}
            id={`btn-pump${pumpId}-stop`}
            aria-label={`Stop ${title}`}
          >
            {busy && running ? (
              <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Stopping…</>
            ) : (
              <span>Stop Pump</span>
            )}
          </button>
        </div>
      </div>

      {/* Manual Pump Confirmation Dialog */}
      {confirmStart && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby={`pump${pumpId}-modal-title`}>
          <div className="modal-box">
            <div className="modal-header">
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--green-400)' }}>
                <Power size={20} />
              </div>
              <h3 className="modal-title" id={`pump${pumpId}-modal-title`}>Start {title}?</h3>
            </div>
            <p className="modal-desc">
              Starting this pump manually will immediately switch the system to <strong>Manual Mode</strong> and engage the relay on the ESP8266 controller.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmStart(false)}
                id={`btn-pump${pumpId}-cancel`}
              >
                Cancel
              </button>
              <button
                className="btn btn-green"
                onClick={handleStart}
                id={`btn-pump${pumpId}-confirm`}
              >
                <Power size={15} /> Confirm Start
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
