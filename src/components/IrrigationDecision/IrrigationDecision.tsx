import { Sprout, CheckCircle2, AlertCircle } from 'lucide-react';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';

interface IrrigationDecisionProps {
  irrigationRequired: boolean | null;
  soilMoisture: number | null;
  temperature: number | null;
  humidity: number | null;
  waterLevel: number | null;
  autoMode: boolean | null;
  sensorError: boolean;
}

export function IrrigationDecision({
  irrigationRequired,
  soilMoisture,
  temperature,
  humidity,
  waterLevel,
  autoMode = true,
  sensorError,
}: IrrigationDecisionProps) {
  const isRequired = irrigationRequired === true;
  const isSoilKnown = soilMoisture !== null;

  // Plain-English Decision Reason
  const reasonText = (() => {
    if (!isSoilKnown) {
      return 'Waiting for soil moisture sensor data...';
    }
    if (!autoMode) {
      return 'Manual mode is active. You have full manual control of the pumps.';
    }
    if (isRequired) {
      const tankOk = waterLevel !== null && !sensorError && waterLevel > TANK_LOW_THRESHOLD;
      if (tankOk) {
        return `Soil moisture is low (${soilMoisture}%). The system is using rainwater from Tank 1.`;
      } else {
        return `Soil moisture is low (${soilMoisture}%) and rainwater is low. The system is using the main water tank (Pump 2).`;
      }
    }
    return `The soil already has enough moisture (${soilMoisture}%). Watering is not needed right now.`;
  })();

  return (
    <div className="card plant-decision-card" role="region" aria-label="Plant Watering Status">
      <div className="section-label">
        <Sprout size={16} color="var(--color-green)" />
        Plant Watering Status
      </div>

      {/* Main Decision Hero Banner */}
      <div className={`decision-hero ${isRequired ? 'needs-water' : 'satisfied'}`}>
        <div className="decision-hero-icon">
          {isRequired ? <AlertCircle size={26} /> : <CheckCircle2 size={26} />}
        </div>
        <div>
          <h2 className="decision-hero-title">
            {irrigationRequired === null
              ? 'Checking plant status...'
              : isRequired
              ? '🌱 Plant needs water'
              : '🌱 Plant has enough water'}
          </h2>
          <p className="decision-hero-sub">
            {isRequired
              ? 'Soil moisture is dry. The irrigation system will water the plant.'
              : 'Soil moisture is optimal. No watering required.'}
          </p>
        </div>
      </div>

      {/* Simple Sensor Breakdown (Soil, Temp, Humidity) */}
      <div className="decision-metrics-row">
        <div className="decision-metric-box">
          <span className="text-sm text-secondary">Soil Moisture</span>
          <span className="font-mono" style={{ fontWeight: 700, color: isRequired ? 'var(--color-orange)' : 'var(--color-green)' }}>
            {soilMoisture !== null ? `${soilMoisture}%` : '--'}
          </span>
        </div>

        <div className="decision-metric-box">
          <span className="text-sm text-secondary">Temperature</span>
          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {temperature !== null ? `${temperature.toFixed(1)}°C` : '--'}
          </span>
        </div>

        <div className="decision-metric-box">
          <span className="text-sm text-secondary">Air Humidity</span>
          <span className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
            {humidity !== null ? `${humidity.toFixed(0)}%` : '--'}
          </span>
        </div>
      </div>

      {/* Plain English Reason Box */}
      <div className="decision-reason-box">
        <strong>Why? </strong>
        <span>{reasonText}</span>
      </div>
    </div>
  );
}
