import { Brain, CheckCircle2, AlertCircle, Droplets, Droplet, Sprout, ShieldCheck } from 'lucide-react';
import { SOIL_DRY_THRESHOLD, SOIL_MOIST_THRESHOLD, TANK_LOW_THRESHOLD } from '../../config/deviceConfig';

interface IrrigationDecisionProps {
  irrigationRequired: boolean | null;
  pump1: boolean | null;
  pump2: boolean | null;
  soilMoisture: number | null;
  waterLevel: number | null;
  autoMode?: boolean | null;
  sensorError: boolean;
}

export function IrrigationDecision({
  irrigationRequired,
  pump1,
  pump2,
  soilMoisture,
  waterLevel,
  autoMode = true,
  sensorError,
}: IrrigationDecisionProps) {
  const isRequired = irrigationRequired === true;
  const isSoilLow = soilMoisture !== null && soilMoisture < SOIL_DRY_THRESHOLD;
  const isSoilSufficient = soilMoisture !== null && soilMoisture >= SOIL_MOIST_THRESHOLD;
  const isTankSufficient = waterLevel !== null && !sensorError && waterLevel > TANK_LOW_THRESHOLD;

  // Determine current active water source
  const selectedSource = pump1
    ? 'RAINWATER (PUMP 1)'
    : pump2
    ? 'NORMAL WATER TANK (PUMP 2)'
    : 'STANDBY / NONE';

  return (
    <div className="card decision-card" role="region" aria-label="Why is the system doing this?">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h2 className="card-title">WHY IS THE SYSTEM DOING THIS?</h2>
            <span
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                background: 'rgba(56, 189, 248, 0.12)',
                color: 'var(--water-400)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              AUTONOMOUS LOGIC MATRIX
            </span>
          </div>
          <span className="card-subtitle">Real-time inference explaining sensor triggers & pump routing</span>
        </div>
        <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
          <Brain size={18} />
        </div>
      </div>

      {/* Primary Decision Banner */}
      <div className={`decision-banner ${isRequired ? 'required' : 'not-required'}`}>
        {irrigationRequired === null ? (
          <span className="status-dot amber" />
        ) : isRequired ? (
          <AlertCircle size={24} color="var(--amber-400)" style={{ flexShrink: 0 }} />
        ) : (
          <CheckCircle2 size={24} color="var(--green-400)" style={{ flexShrink: 0 }} />
        )}
        <div>
          <div
            className="decision-state-title"
            style={{ color: isRequired ? 'var(--amber-400)' : 'var(--green-400)' }}
          >
            {irrigationRequired === null
              ? 'INITIALIZING LOGIC…'
              : isRequired
              ? 'IRRIGATION REQUIRED'
              : 'IRRIGATION NOT REQUIRED'}
          </div>
          <div className="decision-state-sub">
            {!autoMode
              ? 'Manual Mode is currently active. Automatic logic overrides are bypassed.'
              : isRequired
              ? isTankSufficient
                ? 'Rainwater available — Pump 1 (Rainwater) selected for eco-friendly irrigation'
                : 'Rainwater tank low — Pump 2 (Backup Normal Tank) selected to protect crops'
              : 'Soil moisture is sufficient (≥' + SOIL_MOIST_THRESHOLD + '%) — all pumps remain off.'}
          </div>
        </div>
      </div>

      {/* Step-by-Step Logic Flow Breakdown */}
      <div className="decision-flow-container">
        {/* Step 1: Soil Moisture Condition */}
        <div
          className="decision-step-card"
          style={{
            borderColor: isSoilLow
              ? 'rgba(239, 68, 68, 0.35)'
              : isSoilSufficient
              ? 'rgba(34, 197, 94, 0.35)'
              : 'var(--border-subtle)',
          }}
        >
          <div className="decision-step-head">
            <Sprout size={15} color={isSoilLow ? 'var(--red-400)' : 'var(--green-400)'} />
            <span className="font-mono text-xs font-semibold">STEP 1: SOIL MOISTURE</span>
          </div>
          <div className="decision-step-body">
            {soilMoisture === null ? (
              <span className="text-xs text-muted">Awaiting sensor…</span>
            ) : isSoilLow ? (
              <span className="text-xs text-red">
                🌱 Soil moisture ({soilMoisture}%) &lt; {SOIL_DRY_THRESHOLD}% threshold → <strong>Needs Water</strong>
              </span>
            ) : (
              <span className="text-xs text-green">
                🌱 Soil moisture ({soilMoisture}%) is sufficient → <strong>No Irrigation</strong>
              </span>
            )}
          </div>
        </div>

        {/* Step 2: Rainwater Reservoir Condition */}
        <div
          className="decision-step-card"
          style={{
            borderColor: sensorError
              ? 'rgba(245, 158, 11, 0.35)'
              : isTankSufficient
              ? 'rgba(56, 189, 248, 0.35)'
              : 'rgba(239, 68, 68, 0.35)',
          }}
        >
          <div className="decision-step-head">
            <Droplets size={15} color={isTankSufficient ? 'var(--water-400)' : 'var(--amber-400)'} />
            <span className="font-mono text-xs font-semibold">STEP 2: RAINWATER TANK</span>
          </div>
          <div className="decision-step-body">
            {sensorError ? (
              <span className="text-xs text-amber">
                ⚠️ HC-SR04 ultrasonic sensor signal lost
              </span>
            ) : waterLevel === null ? (
              <span className="text-xs text-muted">Awaiting sensor…</span>
            ) : isTankSufficient ? (
              <span className="text-xs text-cyan">
                💧 Rainwater level ({waterLevel}%) &gt; {TANK_LOW_THRESHOLD}% → <strong>Sufficient Harvested Water</strong>
              </span>
            ) : (
              <span className="text-xs text-amber">
                ⚠️ Rainwater level ({waterLevel}%) ≤ {TANK_LOW_THRESHOLD}% → <strong>Tank Low / Depleted</strong>
              </span>
            )}
          </div>
        </div>

        {/* Step 3: Resulting Pump Action */}
        <div
          className="decision-step-card"
          style={{
            borderColor: pump1
              ? 'rgba(56, 189, 248, 0.45)'
              : pump2
              ? 'rgba(34, 197, 94, 0.45)'
              : 'var(--border-subtle)',
          }}
        >
          <div className="decision-step-head">
            {pump1 ? (
              <Droplets size={15} color="var(--water-400)" />
            ) : pump2 ? (
              <Droplet size={15} color="var(--green-400)" />
            ) : (
              <ShieldCheck size={15} color="var(--text-muted)" />
            )}
            <span className="font-mono text-xs font-semibold">STEP 3: PUMP ROUTING</span>
          </div>
          <div className="decision-step-body">
            {pump1 ? (
              <span className="text-xs text-cyan font-semibold">
                🚰 Rainwater available — <strong>Pump 1 Selected</strong> (Priority 1)
              </span>
            ) : pump2 ? (
              <span className="text-xs text-green font-semibold">
                🚰 Rainwater low — <strong>Pump 2 Selected</strong> (Backup Supply)
              </span>
            ) : (
              <span className="text-xs text-muted">
                ✓ Irrigation not required — <strong>All Pumps OFF</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selected Source Summary Line */}
      <div className="decision-source-badge-row">
        <span className="text-xs text-secondary">ACTIVE ROUTING:</span>
        <span className="font-mono text-xs font-bold" style={{ color: pump1 ? 'var(--water-400)' : pump2 ? 'var(--green-400)' : 'var(--text-muted)' }}>
          {selectedSource}
        </span>
      </div>
    </div>
  );
}
