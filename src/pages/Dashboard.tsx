import { Thermometer, Droplets, Ruler, RefreshCw, Activity } from 'lucide-react';
import type { ControlAction, EcoRainData, ConnectionStatus } from '../types/ecoRain';
import type { SessionStats, HistoryPoint, ActivityEntry } from '../types/ecoRain';
import { SensorCard } from '../components/SensorCard/SensorCard';
import { SoilMoistureCard } from '../components/SoilMoistureCard/SoilMoistureCard';
import { TankVisualization } from '../components/TankVisualization/TankVisualization';
import { IrrigationDecision } from '../components/IrrigationDecision/IrrigationDecision';
import { SystemControl } from '../components/SystemControl/SystemControl';
import { PumpCard } from '../components/PumpCard/PumpCard';
import { SensorCharts } from '../components/SensorCharts/SensorCharts';
import { WaterManagement } from '../components/WaterManagement/WaterManagement';
import { DeviceHealth } from '../components/DeviceHealth/DeviceHealth';
import { ActivityLog } from '../components/ActivityLog/ActivityLog';
import { formatUptime } from '../utils/formatters';

interface DashboardProps {
  data: EcoRainData | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  sessionStats: SessionStats;
  history: HistoryPoint[];
  activityLog: ActivityEntry[];
  onCommand: (action: ControlAction) => Promise<boolean>;
}

export function Dashboard({
  data, connectionStatus, isLoading, error, sessionStats, history, activityLog, onCommand
}: DashboardProps) {
  const sensorError = data ? data.distance < 0 : false;

  // Temperature status calculation
  const tempStatus = (() => {
    if (!data) return { label: 'Awaiting sensor', color: 'var(--text-muted)' };
    if (data.temperature > 35) return { label: 'High Temp', color: 'var(--red-400)' };
    if (data.temperature < 15) return { label: 'Cool Temp', color: 'var(--water-400)' };
    return { label: 'Optimal', color: 'var(--green-400)' };
  })();

  // Humidity status calculation
  const humidStatus = (() => {
    if (!data) return { label: 'Awaiting sensor', color: 'var(--text-muted)' };
    if (data.humidity > 80) return { label: 'High Humidity', color: 'var(--water-400)' };
    if (data.humidity < 30) return { label: 'Dry Air', color: 'var(--amber-400)' };
    return { label: 'Moderate', color: 'var(--green-400)' };
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ─── Compact System Status Overview Bar ─────────────────── */}
      <div className="system-status-bar" role="region" aria-label="System Overview">
        <div className="status-headline">
          <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
            <Activity size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="status-summary-text">System Status</span>
              {data && (
                <span className={`status-mode-pill ${data.autoMode ? 'auto' : 'manual'}`}>
                  ● {data.autoMode ? 'AUTO MODE' : 'MANUAL MODE'}
                </span>
              )}
            </div>
            <div className="status-summary-sub">
              {data?.autoMode
                ? 'Automatic sensor-based irrigation loop running'
                : 'Manual control active — automated irrigation disengaged'}
            </div>
          </div>
        </div>

        <div className="status-stats-row">
          {data ? (
            <>
              <div className="stat-item">
                <span className="stat-label">Controller Uptime</span>
                <span className="stat-value">{formatUptime(data.uptime)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Dispatches</span>
                <span className="stat-value" style={{ color: data.pump1 || data.pump2 ? 'var(--green-400)' : 'var(--text-muted)' }}>
                  {data.pump1 && data.pump2 ? 'P1 + P2' : data.pump1 ? 'Pump 1 (Rain)' : data.pump2 ? 'Pump 2 (Backup)' : 'Idle'}
                </span>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isLoading ? (
                <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Polling controller…</>
              ) : (
                <span>● Standby</span>
              )}
            </div>
          )}

          {connectionStatus === 'offline' && error && (
            <span style={{ fontSize: '0.78rem', color: 'var(--red-400)', fontWeight: 600 }}>
              {error}
            </span>
          )}
        </div>
      </div>

      {/* ─── DESKTOP PRIMARY SENSOR GRID (4 COLUMNS) ────────────────── */}
      {/* On mobile, this transforms via CSS into prioritized order */}
      <div className="desktop-sensors-section">
        <div className="section-header">
          <span className="section-title">Telemetry & Environmental Sensors</span>
          <div className="section-line" />
        </div>

        <div className="grid-4">
          {/* Soil Moisture (Hero on Mobile & Desktop) */}
          <SoilMoistureCard
            soilMoisture={data?.soilMoisture ?? null}
            irrigationRequired={data?.irrigationRequired ?? null}
          />

          {/* Temperature */}
          <SensorCard
            title="Temperature"
            subtitle="DHT22 Sensor · Pin D4"
            icon={<Thermometer size={18} />}
            iconColor="var(--water-400)"
            value={data?.temperature ?? null}
            unit="°C"
            unavailable={!data}
            statusLabel={tempStatus.label}
            statusColor={tempStatus.color}
          >
            {data && (
              <div className="mini-progress-track">
                <div
                  className="mini-progress-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((data.temperature - 10) / 35) * 100))}%`,
                    background: data.temperature < 20 ? 'var(--water-400)' : data.temperature < 30 ? 'var(--green-400)' : 'var(--amber-400)',
                  }}
                />
              </div>
            )}
          </SensorCard>

          {/* Humidity */}
          <SensorCard
            title="Humidity"
            subtitle="DHT22 Sensor · Pin D4"
            icon={<Droplets size={18} />}
            iconColor="var(--green-400)"
            value={data?.humidity ?? null}
            unit="%"
            unavailable={!data}
            statusLabel={humidStatus.label}
            statusColor={humidStatus.color}
          >
            {data && (
              <div className="mini-progress-track">
                <div
                  className="mini-progress-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, data.humidity))}%`,
                    background: 'linear-gradient(90deg, #16a34a, #4ade80)',
                  }}
                />
              </div>
            )}
          </SensorCard>

          {/* Water Distance */}
          <SensorCard
            title="Water Distance"
            subtitle="HC-SR04 Sensor · Pins D5/D6"
            icon={<Ruler size={18} />}
            iconColor={sensorError ? 'var(--amber-400)' : 'var(--water-300)'}
            value={sensorError ? null : (data?.distance ?? null)}
            unit=" cm"
            unavailable={!data || sensorError}
            unavailableText="UNAVAILABLE"
            statusLabel={sensorError ? 'HC-SR04 signal not detected' : data ? 'Distance to Surface' : 'Awaiting sensor'}
            statusColor={sensorError ? 'var(--amber-400)' : 'var(--text-muted)'}
          />
        </div>
      </div>

      {/* ─── Rainwater Storage Centerpiece ─────────────────────── */}
      <div className="section-header">
        <span className="section-title">Rainwater Storage Reservoir</span>
        <div className="section-line" />
      </div>

      <TankVisualization
        waterLevel={data?.waterLevel ?? null}
        distance={data?.distance ?? null}
      />

      {/* ─── Irrigation Intelligence & System Control ─────────── */}
      <div className="section-header">
        <span className="section-title">Decision Intelligence & Controller</span>
        <div className="section-line" />
      </div>

      <div className="grid-2">
        <IrrigationDecision
          irrigationRequired={data?.irrigationRequired ?? null}
          pump1={data?.pump1 ?? null}
          pump2={data?.pump2 ?? null}
          soilMoisture={data?.soilMoisture ?? null}
          waterLevel={data?.waterLevel ?? null}
          sensorError={sensorError}
        />
        <SystemControl
          autoMode={data?.autoMode ?? null}
          isLoading={isLoading}
          onSendCommand={onCommand}
        />
      </div>

      {/* ─── Pump Equipment Controls ───────────────────────────── */}
      <div className="section-header">
        <span className="section-title">Irrigation Equipment Telemetry</span>
        <div className="section-line" />
      </div>

      <div className="grid-2">
        <PumpCard
          pumpId={1}
          title="Pump 1 — Rainwater"
          sourceLabel="Rainwater Reservoir"
          sourceDesc="Primary source (active when tank > 20%)"
          isOn={data?.pump1 ?? null}
          isLoading={isLoading}
          runtimeSeconds={sessionStats.pump1OnSeconds}
          onCommand={onCommand}
        />
        <PumpCard
          pumpId={2}
          title="Pump 2 — Normal Backup Water"
          sourceLabel="Mains / Backup Supply"
          sourceDesc="Secondary source (active when tank is low)"
          isOn={data?.pump2 ?? null}
          isLoading={isLoading}
          runtimeSeconds={sessionStats.pump2OnSeconds}
          onCommand={onCommand}
        />
      </div>

      {/* ─── Live Analytics Trend Charts ───────────────────────── */}
      <div className="section-header">
        <span className="section-title">Session Telemetry Analytics</span>
        <div className="section-line" />
      </div>

      <SensorCharts history={history} />

      {/* ─── Water Utilization Metrics ─────────────────────────── */}
      <WaterManagement sessionStats={sessionStats} />

      {/* ─── Device Health & Activity Log ──────────────────────── */}
      <div className="section-header">
        <span className="section-title">System Health & Event Audit</span>
        <div className="section-line" />
      </div>

      <div className="grid-2">
        <DeviceHealth data={data} connectionStatus={connectionStatus} />
        <ActivityLog entries={activityLog} />
      </div>
    </div>
  );
}
