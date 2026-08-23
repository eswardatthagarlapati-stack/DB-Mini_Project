import { useState } from 'react';
import { Zap, ZapOff } from 'lucide-react';
import type { ControlAction } from '../../types/ecoRain';
import { formatDuration } from '../../utils/formatters';

interface PumpCardProps {
  pumpId: 1 | 2;
  title: string;
  description: string;
  note?: string;
  isOn: boolean | null;
  isLoading: boolean;
  runtimeSeconds: number;
  onCommand: (action: ControlAction) => Promise<boolean>;
}

export function PumpCard({
  pumpId, title, description, note, isOn, isLoading, runtimeSeconds, onCommand
}: PumpCardProps) {
  const [confirm, setConfirm] = useState<'on' | null>(null);
  const [sending, setSending] = useState(false);

  const onAction  = `pump${pumpId}_on`  as ControlAction;
  const offAction = `pump${pumpId}_off` as ControlAction;

  const running = isOn === true;
  const accentColor = running ? 'var(--green-400)' : 'var(--text-muted)';
  const accentBg    = running ? 'rgba(34,197,94,0.06)' : 'transparent';
  const accentBorder= running ? 'rgba(34,197,94,0.25)' : 'var(--border-subtle)';

  async function handleOn() {
    setConfirm(null);
    setSending(true);
    await onCommand(onAction);
    setSending(false);
  }

  async function handleOff() {
    setSending(true);
    await onCommand(offAction);
    setSending(false);
  }

  return (
    <>
      <div
        className="card animate-in"
        style={{ borderColor: accentBorder, background: `var(--bg-card) ${accentBg}` }}
        role="region"
        aria-label={title}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>{title}</h3>
            <p className="text-xs text-muted mt-1">{description}</p>
            {note && <p className="text-xs" style={{ color: 'var(--text-dim)', marginTop: 2 }}>{note}</p>}
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: running ? 'rgba(34,197,94,0.15)' : 'var(--bg-elevated)',
            border: `2px solid ${accentColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor,
            flexShrink: 0,
            animation: running ? 'pump-pulse 2s ease infinite' : 'none',
          }}>
            {running ? <Zap size={20} /> : <ZapOff size={20} />}
          </div>
        </div>

        {/* State bar */}
        <div className="pump-state-indicator">
          <div className={`pump-state-bar ${running ? 'on' : 'off'}`} />
        </div>

        {/* Status chip */}
        <div className="flex items-center gap-8 mb-4">
          <span
            className={`status-chip ${running ? 'running' : 'stopped'}`}
            aria-live="polite"
          >
            <span className="dot" style={{
              background: accentColor,
              boxShadow: running ? `0 0 6px ${accentColor}` : 'none',
              animation: running ? 'pulse-dot 1.5s ease infinite' : 'none',
            }} />
            {isOn === null ? 'Loading' : running ? 'PUMP RUNNING' : 'PUMP STOPPED'}
          </span>

          {runtimeSeconds > 0 && (
            <span className="text-xs text-muted font-mono">
              Session: {formatDuration(runtimeSeconds)}
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            className="btn btn-green"
            style={{ flex: 1 }}
            onClick={() => setConfirm('on')}
            disabled={isLoading || sending || isOn === true || isOn === null}
            id={`btn-pump${pumpId}-on`}
            aria-label={`Turn on ${title}`}
          >
            {sending && !running ? <><span className="spinner" />Starting…</> : 'Turn ON'}
          </button>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={handleOff}
            disabled={isLoading || sending || isOn === false || isOn === null}
            id={`btn-pump${pumpId}-off`}
            aria-label={`Turn off ${title}`}
          >
            {sending && running ? <><span className="spinner" />Stopping…</> : 'Turn OFF'}
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirm === 'on' && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby={`pump${pumpId}-confirm-title`}>
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Zap size={20} color="var(--green-400)" />
              <h3 className="modal-title" id={`pump${pumpId}-confirm-title`}>Start {title}?</h3>
            </div>
            <p className="modal-desc">
              This will activate <strong>{title}</strong> and switch the system to <strong>Manual Mode</strong>.
              The ESP8266 firmware will confirm the new state.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)} id={`btn-pump${pumpId}-cancel`}>
                Cancel
              </button>
              <button className="btn btn-green" onClick={handleOn} id={`btn-pump${pumpId}-confirm`}>
                <Zap size={15} /> Start Pump {pumpId}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
