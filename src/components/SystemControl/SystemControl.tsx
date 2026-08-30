import { useState } from 'react';
import { Settings2, AlertOctagon, ArrowRight, RefreshCw, Power } from 'lucide-react';
import type { ControlAction } from '../../types/ecoRain';

interface SystemControlProps {
  autoMode: boolean | null;
  waterLevel: number | null;
  soilMoisture: number | null;
  isLoading: boolean;
  onSendCommand: (action: ControlAction) => Promise<boolean>;
}

export function SystemControl({
  autoMode,
  waterLevel,
  soilMoisture,
  isLoading,
  onSendCommand,
}: SystemControlProps) {
  const [confirmStopAll, setConfirmStopAll] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  async function handleSetMode(mode: 'auto' | 'manual') {
    if (isLoading) return;
    await onSendCommand(mode);
  }

  async function handleConfirmStopAll() {
    setConfirmStopAll(false);
    setIsStopping(true);
    await onSendCommand('all_off');
    setIsStopping(false);
  }

  // Automatic Mode dynamic status message
  const isRainwaterLow = waterLevel !== null && waterLevel <= 20;
  const isSoilWet = soilMoisture !== null && soilMoisture >= 60;

  return (
    <>
      <div className="card" role="region" aria-label="System Mode and Priority">
        <div className="section-label">
          <Settings2 size={16} color="var(--color-brand)" />
          System Mode
        </div>

        {/* Mode Toggle Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Operating Mode</h3>
            <p className="text-sm text-secondary">
              {autoMode === true
                ? 'Automatic: The system decides which pump to use.'
                : autoMode === false
                ? 'Manual: You control the pumps.'
                : 'Syncing system mode...'}
            </p>
          </div>

          <div className="mode-toggle-group" role="group" aria-label="Operating Mode Toggle">
            <button
              className={`mode-toggle-btn ${autoMode === true ? 'active' : ''}`}
              onClick={() => handleSetMode('auto')}
              disabled={isLoading || autoMode === true}
              id="btn-mode-auto"
            >
              AUTOMATIC
            </button>
            <button
              className={`mode-toggle-btn ${autoMode === false ? 'active' : ''}`}
              onClick={() => handleSetMode('manual')}
              disabled={isLoading || autoMode === false}
              id="btn-mode-manual"
            >
              MANUAL
            </button>
          </div>
        </div>

        {/* Automatic Mode Status Callout */}
        {autoMode === true && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: isSoilWet
                ? 'var(--color-blue-bg)'
                : isRainwaterLow
                ? 'var(--color-orange-bg)'
                : 'var(--color-green-bg)',
              color: isSoilWet
                ? 'var(--color-blue)'
                : isRainwaterLow
                ? 'var(--color-orange)'
                : 'var(--color-green)',
              fontSize: '0.88rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 16,
            }}
          >
            <span
              className="status-dot"
              style={{
                backgroundColor: isSoilWet
                  ? 'var(--color-blue)'
                  : isRainwaterLow
                  ? 'var(--color-orange)'
                  : 'var(--color-green)',
              }}
            />
            <span>
              {isSoilWet
                ? 'Watering is not needed — The soil already has enough moisture.'
                : isRainwaterLow
                ? 'Rainwater is low — The system will use the main water tank.'
                : 'Automatic irrigation is ON — The system will use rainwater first.'}
            </span>
          </div>
        )}

        {/* Pump Priority Flowchart */}
        <div style={{ marginTop: 8 }}>
          <div className="text-xs text-muted" style={{ fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pump Priority Logic
          </div>
          <div className="priority-flow-box">
            <div className="priority-step">
              <span>🌧️ Rainwater Available</span>
              <ArrowRight size={14} color="var(--color-brand)" />
              <strong style={{ color: 'var(--color-brand)' }}>Pump 1 Used</strong>
            </div>
            <span className="text-muted hide-mobile">→</span>
            <div className="priority-step">
              <span>⚠️ Rainwater Low</span>
              <ArrowRight size={14} color="var(--color-orange)" />
              <strong style={{ color: 'var(--color-orange)' }}>Pump 2 Used</strong>
            </div>
          </div>
        </div>

        {/* Emergency Cutoff Button */}
        <div style={{ marginTop: 20 }}>
          <button
            className="btn btn-red btn-lg btn-full"
            onClick={() => setConfirmStopAll(true)}
            disabled={isLoading || isStopping}
            id="btn-emergency-stop"
            aria-label="Stop All Pumps"
          >
            {isStopping ? (
              <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Stopping Pumps...</>
            ) : (
              <><AlertOctagon size={20} /> STOP ALL PUMPS</>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmStopAll && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="stop-modal-title">
          <div className="modal-box">
            <div className="modal-header">
              <AlertOctagon size={24} color="var(--color-red)" />
              <h3 className="modal-title" id="stop-modal-title">Stop All Pumps?</h3>
            </div>
            <p className="modal-desc">
              This will immediately turn off <strong>Pump 1 (Rainwater)</strong> and <strong>Pump 2 (Main Water)</strong> and switch the system to Manual mode.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setConfirmStopAll(false)}
                id="btn-cancel-stop"
              >
                Cancel
              </button>
              <button
                className="btn btn-red"
                onClick={handleConfirmStopAll}
                id="btn-confirm-stop"
              >
                <Power size={16} /> Stop All Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
