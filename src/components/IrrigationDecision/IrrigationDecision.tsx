import { Brain, CheckCircle, XCircle, Droplets, Droplet } from 'lucide-react';

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
  // Determine irrigation reason — all derived from actual ESP8266 values
  const irrigationMsg = (() => {
    if (irrigationRequired === null) return 'Sensor data unavailable.';
    if (!irrigationRequired) return 'Soil moisture is currently sufficient. No irrigation needed.';
    return 'Soil moisture is below the irrigation threshold.';
  })();

  const pumpMsg = (() => {
    if (pump1) return 'Using stored rainwater (Pump 1 active).';
    if (pump2) return 'Rainwater level is low. Using backup water (Pump 2 active).';
    if (irrigationRequired) return 'Irrigation required — pump activation pending.';
    return 'No pump currently running.';
  })();

  const isRequired = irrigationRequired === true;
  const accentColor = isRequired ? 'var(--amber-400)' : 'var(--green-400)';
  const accentBg    = isRequired ? 'rgba(251,191,36,0.08)' : 'rgba(34,197,94,0.08)';
  const accentBorder= isRequired ? 'rgba(251,191,36,0.25)' : 'rgba(34,197,94,0.25)';

  return (
    <div
      className="card animate-in"
      style={{ borderColor: accentBorder, background: `var(--bg-card)` }}
      role="region"
      aria-label="Irrigation Intelligence"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Brain size={18} color="var(--primary-400)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
          Irrigation Intelligence
        </h2>
      </div>

      {/* Decision banner */}
      <div style={{
        background: accentBg,
        border: `1px solid ${accentBorder}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
      }}>
        {irrigationRequired === null ? (
          <span className="spinner" style={{ color: 'var(--primary-400)' }} />
        ) : isRequired ? (
          <XCircle size={22} color="var(--amber-400)" style={{ flexShrink: 0 }} />
        ) : (
          <CheckCircle size={22} color="var(--green-400)" style={{ flexShrink: 0 }} />
        )}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: accentColor, fontSize: '0.9rem' }}>
            {irrigationRequired === null
              ? 'Loading…'
              : isRequired
              ? 'IRRIGATION REQUIRED'
              : 'IRRIGATION NOT REQUIRED'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {irrigationMsg}
          </div>
        </div>
      </div>

      {/* Pump explanation */}
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16,
      }}>
        {pump1 ? (
          <Droplets size={16} color="var(--primary-400)" style={{ flexShrink: 0 }} />
        ) : (
          <Droplet size={16} color={pump2 ? 'var(--green-400)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
        )}
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pumpMsg}</span>
      </div>

      {/* Sensor quick view */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <MiniStat
          label="Soil Moisture"
          value={soilMoisture !== null ? `${soilMoisture}%` : '—'}
          color={
            soilMoisture === null ? 'var(--text-dim)'
            : soilMoisture < 40   ? 'var(--amber-400)'
            : soilMoisture < 55   ? 'var(--primary-400)'
            : 'var(--green-400)'
          }
        />
        <MiniStat
          label="Tank Level"
          value={sensorError ? 'Error' : waterLevel !== null ? `${waterLevel}%` : '—'}
          color={sensorError ? 'var(--amber-400)' : waterLevel !== null && waterLevel <= 20 ? 'var(--amber-400)' : 'var(--primary-400)'}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
      padding: '10px 12px',
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
