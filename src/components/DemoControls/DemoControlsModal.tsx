import { useState } from 'react';
import { Sparkles, X, CloudRain, Sun, Droplets, Sprout, Cylinder, Power, Check } from 'lucide-react';
import {
  setSimSoilMoisture,
  setSimTankLevel,
  setSimTemperature,
  setSimHumidity,
  simulateRainEvent,
} from '../../services/simulationService';

interface DemoControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function DemoControlsModal({ isOpen, onClose, onRefresh }: DemoControlsModalProps) {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    onRefresh();
    setTimeout(() => setToastMsg(null), 2500);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
      <div className="modal-box" style={{ maxWidth: 540 }}>
        <div className="modal-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--water-400)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title" id="demo-modal-title">Project Presentation / Demo Simulator</h3>
              <span className="text-xs text-muted">Test autonomous irrigation decisions & pump logic in real time</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        {toastMsg && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: 'var(--green-400)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
            }}
          >
            <Check size={14} /> {toastMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Quick Scenario Buttons */}
          <div className="demo-scenario-section">
            <span className="text-xs text-secondary font-semibold">1-Click Demonstration Scenarios:</span>
            <div className="demo-grid-scenarios">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSimSoilMoisture(25);
                  setSimTankLevel(80);
                  triggerToast('Scenario: Dry Soil + High Rainwater -> Triggers Pump 1 (Rainwater)');
                }}
              >
                <Droplets size={13} color="var(--water-400)" />
                Dry Soil + Full Tank (Pump 1)
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSimSoilMoisture(22);
                  setSimTankLevel(12);
                  triggerToast('Scenario: Dry Soil + Low Rainwater -> Triggers Pump 2 (Backup Normal)');
                }}
              >
                <Power size={13} color="var(--amber-400)" />
                Dry Soil + Low Tank (Pump 2)
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSimSoilMoisture(75);
                  triggerToast('Scenario: Soil Moisture Moist (75%) -> Irrigation Stops / Idle');
                }}
              >
                <Sprout size={13} color="var(--green-400)" />
                Moist Soil (All Pumps Off)
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  simulateRainEvent();
                  triggerToast('Scenario: Rainstorm Event Simulated (+35% Tank Level)');
                }}
              >
                <CloudRain size={13} color="var(--water-300)" />
                Simulate Rainstorm Event
              </button>
            </div>
          </div>

          {/* Individual Sliders / Overrides */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {/* Soil Moisture */}
            <div className="demo-control-card">
              <div className="demo-card-head">
                <Sprout size={14} color="var(--green-400)" />
                <span>Soil Moisture Level</span>
              </div>
              <div className="demo-btn-group">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimSoilMoisture(20);
                    triggerToast('Set Soil Moisture to 20% (Dry)');
                  }}
                >
                  20% Dry
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimSoilMoisture(48);
                    triggerToast('Set Soil Moisture to 48% (Mid)');
                  }}
                >
                  48% Mid
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimSoilMoisture(80);
                    triggerToast('Set Soil Moisture to 80% (Moist)');
                  }}
                >
                  80% Moist
                </button>
              </div>
            </div>

            {/* Rainwater Tank Level */}
            <div className="demo-control-card">
              <div className="demo-card-head">
                <Cylinder size={14} color="var(--water-400)" />
                <span>Rainwater Tank Level</span>
              </div>
              <div className="demo-btn-group">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimTankLevel(12);
                    triggerToast('Set Tank Level to 12% (Critical Low)');
                  }}
                >
                  12% Low
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimTankLevel(55);
                    triggerToast('Set Tank Level to 55% (Adequate)');
                  }}
                >
                  55% Mid
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimTankLevel(92);
                    triggerToast('Set Tank Level to 92% (Abundant)');
                  }}
                >
                  92% Full
                </button>
              </div>
            </div>

            {/* Temperature */}
            <div className="demo-control-card">
              <div className="demo-card-head">
                <Sun size={14} color="var(--amber-400)" />
                <span>Ambient Temperature</span>
              </div>
              <div className="demo-btn-group">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimTemperature(18.5);
                    triggerToast('Set Temperature to 18.5°C');
                  }}
                >
                  18°C Cool
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimTemperature(29.5);
                    triggerToast('Set Temperature to 29.5°C');
                  }}
                >
                  29°C Normal
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimTemperature(38.2);
                    triggerToast('Set Temperature to 38.2°C (Heatwave)');
                  }}
                >
                  38°C Hot
                </button>
              </div>
            </div>

            {/* Humidity */}
            <div className="demo-control-card">
              <div className="demo-card-head">
                <Droplets size={14} color="var(--water-300)" />
                <span>Relative Humidity</span>
              </div>
              <div className="demo-btn-group">
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimHumidity(25);
                    triggerToast('Set Humidity to 25% (Dry Air)');
                  }}
                >
                  25% Dry
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimHumidity(65);
                    triggerToast('Set Humidity to 65% (Optimal)');
                  }}
                >
                  65% Normal
                </button>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setSimHumidity(90);
                    triggerToast('Set Humidity to 90% (Humid)');
                  }}
                >
                  90% Humid
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done / Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
