import { useState } from 'react';
import { Power, Activity, RefreshCw, Droplets, Droplet, CheckCircle2, AlertCircle } from 'lucide-react';
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
  pumpId,
  title,
  sourceLabel,
  sourceDesc,
  isOn,
  isLoading,
  runtimeSeconds,
  onCommand,
}: PumpCardProps) {
  const [busyState, setBusyState] = useState<'idle' | 'starting' | 'stopping' | 'success' | 'failed'>('idle');

  const running = isOn === true;
  const onAction = `pump${pumpId}_on` as ControlAction;
  const offAction = `pump${pumpId}_off` as ControlAction;

  const accentColor = pumpId === 1 ? '#38bdf8' : '#4ade80';
  const borderTopColor = pumpId === 1 ? '#0ea5e9' : '#10b981';

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
    <div
      className={`card pump-card${running ? ' running' : ''}`}
      style={{
        borderTop: `3px solid ${running ? accentColor : borderTopColor}`,
        boxShadow: running ? `0 0 24px ${accentColor}25` : undefined,
      }}
      role="region"
      aria-label={title}
    >
      <div>
        {/* Header */}
        <div className="card-header">
          <div className="card-title-group">
            <h3 className="card-title">{title}</h3>
            <span className="card-subtitle">Water Source: <strong>{sourceLabel}</strong> · {sourceDesc}</span>
          </div>
          <div
            className="card-icon-badge"
            style={{
              color: running ? accentColor : 'var(--text-muted)',
              background: running ? `${accentColor}18` : undefined,
              border: running ? `1px solid ${accentColor}40` : undefined,
            }}
          >
            {pumpId === 1 ? <Droplets size={18} /> : <Droplet size={18} />}
          </div>
        </div>

        {/* Running Status & Runtime Bar */}
        <div className="pump-indicator-row">
          <span
            className={`pump-status-pill ${running ? 'running' : 'stopped'}`}
            style={{
              background: running ? 'rgba(34, 197, 94, 0.15)' : 'rgba(100, 116, 139, 0.12)',
              color: running ? 'var(--green-400)' : 'var(--text-muted)',
              border: `1px solid ${running ? 'rgba(34, 197, 94, 0.35)' : 'var(--border-subtle)'}`,
            }}
          >
            <span className={`status-dot ${running ? 'green pulse' : 'gray'}`} />
            <span>STATUS: {isOn === null ? 'SYNCING' : running ? 'ON' : 'OFF'}</span>
          </span>

          {runtimeSeconds > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <Activity size={13} className={running ? 'text-green' : undefined} />
              <span>Runtime: {formatDuration(runtimeSeconds)}</span>
            </div>
          )}
        </div>

        {/* Busy / Feedback Notification */}
        {busyState !== 'idle' && (
          <div
            style={{
              marginTop: 10,
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background:
                busyState === 'success'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : busyState === 'failed'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
              color:
                busyState === 'success'
                  ? 'var(--green-400)'
                  : busyState === 'failed'
                  ? 'var(--red-400)'
                  : 'var(--water-300)',
            }}
          >
            {busyState === 'starting' && <><RefreshCw size={12} className="spin-icon" /> Sending Turn ON command…</>}
            {busyState === 'stopping' && <><RefreshCw size={12} className="spin-icon" /> Sending Turn OFF command…</>}
            {busyState === 'success' && <><CheckCircle2 size={12} /> Command confirmed by controller</>}
            {busyState === 'failed' && <><AlertCircle size={12} /> Command failed — controller unreachable</>}
          </div>
        )}
      </div>

      {/* Action Controls: TURN ON / TURN OFF */}
      <div className="pump-action-group">
        <button
          className="btn btn-green"
          onClick={handleTurnOn}
          disabled={isLoading || busyState === 'starting' || isOn === true || isOn === null}
          id={`btn-pump${pumpId}-on`}
          aria-label={`Turn ON ${title}`}
        >
          {busyState === 'starting' ? (
            <><RefreshCw size={14} className="spin-icon" /> Sending…</>
          ) : (
            <><Power size={14} /> TURN ON</>
          )}
        </button>

        <button
          className="btn btn-ghost"
          onClick={handleTurnOff}
          disabled={isLoading || busyState === 'stopping' || isOn === false || isOn === null}
          id={`btn-pump${pumpId}-off`}
          aria-label={`Turn OFF ${title}`}
          style={{ borderColor: isOn === true ? 'rgba(239, 68, 68, 0.35)' : undefined }}
        >
          {busyState === 'stopping' ? (
            <><RefreshCw size={14} className="spin-icon" /> Sending…</>
          ) : (
            <span>TURN OFF</span>
          )}
        </button>
      </div>
    </div>
  );
}
