import { useState } from 'react';
import { Power, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ControlAction } from '../../types/ecoRain';

interface PumpCardProps {
  pumpId: 1 | 2;
  title: string;
  waterSource: string;
  description: string;
  isOn: boolean | null;
  isLoading: boolean;
  onCommand: (action: ControlAction) => Promise<boolean>;
}

export function PumpCard({
  pumpId,
  title,
  waterSource,
  description,
  isOn,
  isLoading,
  onCommand,
}: PumpCardProps) {
  const [busyState, setBusyState] = useState<'idle' | 'starting' | 'stopping' | 'success' | 'failed'>('idle');

  const running = isOn === true;
  const onAction = `pump${pumpId}_on` as ControlAction;
  const offAction = `pump${pumpId}_off` as ControlAction;

  async function handleTurnOn() {
    setBusyState('starting');
    const ok = await onCommand(onAction);
    setBusyState(ok ? 'success' : 'failed');
    setTimeout(() => setBusyState('idle'), 2500);
  }

  async function handleTurnOff() {
    setBusyState('stopping');
    const ok = await onCommand(offAction);
    setBusyState(ok ? 'success' : 'failed');
    setTimeout(() => setBusyState('idle'), 2500);
  }

  return (
    <div className="card pump-card-inner" role="region" aria-label={title}>
      {/* Title & Source */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{title}</h3>
          <span className={`pump-badge ${running ? 'on' : 'off'}`}>
            <span className={`status-dot ${running ? 'green' : 'gray'}`} />
            <span>{isOn === null ? 'SYNCING' : running ? 'ON' : 'OFF'}</span>
          </span>
        </div>
        <p className="text-sm text-secondary" style={{ marginBottom: 2 }}>
          Water Source: <strong>{waterSource}</strong>
        </p>
        <p className="text-xs text-muted">
          {description}
        </p>
      </div>

      {/* Busy Feedback notification */}
      {busyState !== 'idle' && (
        <div
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background:
              busyState === 'success'
                ? 'var(--color-green-bg)'
                : busyState === 'failed'
                ? 'var(--color-red-bg)'
                : 'var(--color-blue-bg)',
            color:
              busyState === 'success'
                ? 'var(--color-green)'
                : busyState === 'failed'
                ? 'var(--color-red)'
                : 'var(--color-blue)',
          }}
        >
          {busyState === 'starting' && <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Sending Turn ON...</>}
          {busyState === 'stopping' && <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Sending Turn OFF...</>}
          {busyState === 'success' && <><CheckCircle2 size={13} /> Updated successfully</>}
          {busyState === 'failed' && <><AlertCircle size={13} /> Failed to communicate</>}
        </div>
      )}

      {/* Simple Big Control Buttons */}
      <div className="pump-buttons-row">
        <button
          className="btn btn-green btn-lg"
          onClick={handleTurnOn}
          disabled={isLoading || busyState === 'starting' || isOn === true || isOn === null}
          id={`btn-pump${pumpId}-on`}
          aria-label={`Turn ON ${title}`}
        >
          <Power size={16} /> Turn ON
        </button>

        <button
          className="btn btn-outline btn-lg"
          onClick={handleTurnOff}
          disabled={isLoading || busyState === 'stopping' || isOn === false || isOn === null}
          id={`btn-pump${pumpId}-off`}
          aria-label={`Turn OFF ${title}`}
        >
          Turn OFF
        </button>
      </div>
    </div>
  );
}
