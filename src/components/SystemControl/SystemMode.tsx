import type { ControlAction, EcoRainData } from '../../types/ecoRain';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';

interface SystemModeProps {
  data: EcoRainData | null;
  isLoading: boolean;
  onCommand: (action: ControlAction) => Promise<boolean>;
}

export function SystemMode({ data, isLoading, onCommand }: SystemModeProps) {
  const autoMode = data?.autoMode ?? null;
  const isAuto = autoMode === true;
  const disabled = !data || isLoading;

  // Compute auto-mode status message
  const sensorErr = data ? data.distance < 0 : false;
  const tankLow   = !sensorErr && (data?.waterLevel ?? 100) <= TANK_LOW_THRESHOLD;
  const needsWater = data?.irrigationRequired ?? false;

  let autoBlock = null;
  if (data && isAuto) {
    if (!needsWater) {
      autoBlock = {
        cls: 'blue', emoji: '💧',
        title: 'Watering is not needed',
        desc: 'The soil already has enough moisture. The system is monitoring and will water when needed.',
      };
    } else if (tankLow) {
      autoBlock = {
        cls: 'orange', emoji: '🟠',
        title: 'Rainwater is low',
        desc: 'The system will use the backup water supply to irrigate.',
      };
    } else {
      autoBlock = {
        cls: 'green', emoji: '🟢',
        title: 'Automatic irrigation is ON',
        desc: 'The system will use rainwater from the tank first.',
      };
    }
  }

  return (
    <div className="card" role="region" aria-label="System Mode">
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
        System Mode
      </h2>
      <p className="text-sm text-secondary mb-4">
        Choose whether the system controls the pumps automatically, or you control them yourself.
      </p>

      {/* Mode Toggle */}
      <div className="mode-toggle-group" role="group" aria-label="Select system mode">
        <button
          className={`mode-btn ${isAuto ? 'active-auto' : ''}`}
          id="btn-mode-auto"
          disabled={disabled || isAuto}
          onClick={() => onCommand('auto')}
          aria-pressed={isAuto}
        >
          ⚙ Automatic
        </button>
        <button
          className={`mode-btn ${!isAuto && autoMode !== null ? 'active-manual' : ''}`}
          id="btn-mode-manual"
          disabled={disabled || (!isAuto && autoMode !== null)}
          onClick={() => onCommand('manual')}
          aria-pressed={!isAuto && autoMode !== null}
        >
          ✋ Manual
        </button>
      </div>

      {/* Description */}
      {data && (
        <div className={`mode-description ${!isAuto && autoMode !== null ? 'manual-active' : ''}`}>
          {isAuto
            ? '⚙ Automatic: The system decides when to water the plant and which pump to use.'
            : '✋ Manual: You are in control. Use the pump buttons above to water the plant yourself.'}
        </div>
      )}

      {/* Auto-mode status block */}
      {autoBlock && (
        <div className={`auto-status-block ${autoBlock.cls}`}>
          <div className="auto-status-emoji">{autoBlock.emoji}</div>
          <div>
            <div className="auto-status-title">{autoBlock.title}</div>
            <div className="auto-status-desc">{autoBlock.desc}</div>
          </div>
        </div>
      )}

      {/* Priority flow (only in auto mode) */}
      {isAuto && (
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: 'var(--space-4)', marginBottom: 'var(--space-2)' }}>
            How the system decides:
          </div>
          <div className="priority-flow">
            <div className={`pf-step ${!sensorErr && !tankLow ? 'active' : ''}`}>
              💧 Rainwater available
            </div>
            <span className="pf-arrow">→</span>
            <div className={`pf-step ${data?.pump1 ? 'active' : ''}`}>
              Pump 1 (rainwater)
            </div>
            <span className="pf-arrow">→</span>
            <div className={`pf-step ${tankLow ? 'active' : ''}`}>
              🟠 Tank low
            </div>
            <span className="pf-arrow">→</span>
            <div className={`pf-step ${data?.pump2 ? 'active' : ''}`}>
              Pump 2 (backup)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
