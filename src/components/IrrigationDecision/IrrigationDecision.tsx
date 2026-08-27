import { Brain, CheckCircle2, AlertCircle, Droplets, Droplet } from 'lucide-react';

interface IrrigationDecisionProps {
  irrigationRequired: boolean | null;
  pump1: boolean | null;
  pump2: boolean | null;
  soilMoisture: number | null;
  waterLevel: number | null;
  sensorError: boolean;
}

export function IrrigationDecision({
  irrigationRequired, pump1, pump2, soilMoisture, waterLevel, sensorError
}: IrrigationDecisionProps) {
  const isRequired = irrigationRequired === true;
  const accentColor = isRequired ? 'var(--amber-400)' : 'var(--green-400)';

  const primaryExplanation = (() => {
    if (irrigationRequired === null) return 'Awaiting sensor telemetry…';
    if (!irrigationRequired) return 'Soil moisture is currently sufficient.';
    return 'Soil moisture is below the irrigation threshold.';
  })();

  const activeSourceDesc = (() => {
    if (pump1) return 'Irrigating with stored rainwater (Pump 1 active).';
    if (pump2) return 'Rainwater is low. Irrigating with backup supply (Pump 2 active).';
    if (irrigationRequired) return 'Irrigation pending — system preparing pump dispatch.';
    return 'All irrigation pumps currently idle.';
  })();

  return (
    <div className="card decision-card" role="region" aria-label="Irrigation Intelligence">
      <div>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Irrigation Intelligence</h2>
            <span className="card-subtitle">Automated Decision Logic · Soil & Storage Matrix</span>
          </div>
          <div className="card-icon-badge" style={{ color: accentColor }}>
            <Brain size={18} />
          </div>
        </div>

        {/* Primary Decision Banner */}
        <div className={`decision-banner ${isRequired ? 'required' : 'not-required'}`}>
          {irrigationRequired === null ? (
            <span className="status-dot amber" />
          ) : isRequired ? (
            <AlertCircle size={22} color="var(--amber-400)" style={{ flexShrink: 0 }} />
          ) : (
            <CheckCircle2 size={22} color="var(--green-400)" style={{ flexShrink: 0 }} />
          )}
          <div>
            <div className="decision-state-title" style={{ color: accentColor }}>
              {irrigationRequired === null
                ? 'INITIALIZING…'
                : isRequired
                ? 'IRRIGATION REQUIRED'
                : 'IRRIGATION NOT REQUIRED'}
            </div>
            <div className="decision-state-sub">
              {primaryExplanation}
            </div>
          </div>
        </div>

        {/* Source Routing Status */}
        <div className="decision-subcard">
          {pump1 ? (
            <Droplets size={16} color="var(--water-400)" style={{ flexShrink: 0 }} />
          ) : pump2 ? (
            <Droplet size={16} color="var(--green-400)" style={{ flexShrink: 0 }} />
          ) : (
            <Droplets size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          )}
          <span>{activeSourceDesc}</span>
        </div>
      </div>

      {/* Supporting Telemetry Footprint */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Soil Moisture
          </div>
          <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: soilMoisture !== null && soilMoisture < 40 ? 'var(--red-400)' : 'var(--text-primary)' }}>
            {soilMoisture !== null ? `${soilMoisture}%` : '—'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Tank Reserve
          </div>
          <div className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: sensorError ? 'var(--amber-400)' : 'var(--text-primary)' }}>
            {sensorError ? 'UNAVAILABLE' : waterLevel !== null ? `${waterLevel}%` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
