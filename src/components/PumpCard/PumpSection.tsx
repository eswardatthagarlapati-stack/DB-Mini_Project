import { useState } from 'react';
import type { ControlAction, EcoRainData } from '../../types/ecoRain';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';

interface PumpSectionProps {
  data: EcoRainData | null;
  isLoading: boolean;
  onCommand: (action: ControlAction) => Promise<boolean>;
}

interface ConfirmState {
  action: ControlAction;
  title: string;
  body: string;
}

export function PumpSection({ data, isLoading, onCommand }: PumpSectionProps) {
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);

  const pump1 = data?.pump1 ?? null;
  const pump2 = data?.pump2 ?? null;

  async function execute(action: ControlAction) {
    setConfirm(null);
    setBusy(true);
    await onCommand(action);
    setBusy(false);
  }

  function ask(c: ConfirmState) { setConfirm(c); }

  const disabled = isLoading || busy || !data;
  const sensorErr = data ? data.distance < 0 : false;
  const tankLow   = !sensorErr && (data?.waterLevel ?? 100) <= TANK_LOW_THRESHOLD;

  return (
    <div className="card" role="region" aria-label="Pump Control">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
        Pump Control
      </h2>

      <div className="pump-grid">
        {/* Pump 1 */}
        <div className={`pump-card ${pump1 ? 'running' : ''}`} role="group" aria-label="Pump 1">
          <div className="pump-title">Pump 1 — Rainwater</div>
          <div className="pump-sub">Uses water from the rainwater tank</div>
          <div className="pump-status-row">
            <div className={`pump-status-dot ${pump1 ? 'on' : 'off'}`} aria-hidden="true" />
            <span className={`pump-status-text ${pump1 ? 'on' : 'off'}`}>
              {pump1 === null ? '—' : pump1 ? 'ON — Running' : 'OFF'}
            </span>
          </div>
          {tankLow && (
            <div style={{ fontSize: '0.75rem', color: 'var(--orange-text)', marginBottom: 'var(--space-2)' }}>
              ⚠️ Tank is low
            </div>
          )}
          <div className="pump-btns">
            <button
              className="btn btn-green btn-sm"
              disabled={disabled || pump1 === true}
              id="btn-pump1-on"
              onClick={() => ask({
                action: 'pump1_on',
                title: 'Turn on Pump 1?',
                body: 'This will start the rainwater pump. The system will irrigate using rainwater from the tank.',
              })}
            >
              Turn ON
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={disabled || pump1 === false}
              id="btn-pump1-off"
              onClick={() => ask({
                action: 'pump1_off',
                title: 'Turn off Pump 1?',
                body: 'This will stop the rainwater pump.',
              })}
            >
              Turn OFF
            </button>
          </div>
        </div>

        {/* Pump 2 */}
        <div className={`pump-card ${pump2 ? 'running' : ''}`} role="group" aria-label="Pump 2">
          <div className="pump-title">Pump 2 — Backup Water</div>
          <div className="pump-sub">Uses water from the main supply</div>
          <div className="pump-status-row">
            <div className={`pump-status-dot ${pump2 ? 'on' : 'off'}`} aria-hidden="true" />
            <span className={`pump-status-text ${pump2 ? 'on' : 'off'}`}>
              {pump2 === null ? '—' : pump2 ? 'ON — Running' : 'OFF'}
            </span>
          </div>
          <div className="pump-btns">
            <button
              className="btn btn-green btn-sm"
              disabled={disabled || pump2 === true}
              id="btn-pump2-on"
              onClick={() => ask({
                action: 'pump2_on',
                title: 'Turn on Pump 2?',
                body: 'This will start the backup water pump. It uses water from the main supply.',
              })}
            >
              Turn ON
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={disabled || pump2 === false}
              id="btn-pump2-off"
              onClick={() => ask({
                action: 'pump2_off',
                title: 'Turn off Pump 2?',
                body: 'This will stop the backup water pump.',
              })}
            >
              Turn OFF
            </button>
          </div>
        </div>
      </div>

      {/* Stop All */}
      <button
        className="btn-stop"
        id="btn-stop-all"
        disabled={disabled}
        onClick={() => ask({
          action: 'all_off',
          title: 'Stop all pumps?',
          body: 'This will immediately turn off both pumps. You can restart them individually.',
        })}
        aria-label="Stop all pumps"
      >
        ⏹ STOP ALL PUMPS
      </button>

      {/* Confirmation Modal */}
      {confirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="modal">
            <div className="modal-title" id="confirm-title">{confirm.title}</div>
            <div className="modal-body">{confirm.body}</div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirm(null)} id="btn-confirm-cancel">
                Cancel
              </button>
              <button
                className={confirm.action === 'all_off' ? 'btn btn-red' : 'btn btn-primary'}
                onClick={() => execute(confirm.action)}
                id="btn-confirm-ok"
                autoFocus
              >
                {confirm.action === 'all_off' ? 'Stop All Pumps' : 'Yes, proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
