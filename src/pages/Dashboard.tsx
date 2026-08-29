import { Thermometer, Droplets, Ruler, Info } from 'lucide-react';
import type { ControlAction, EcoRainData, ConnectionStatus, SessionStats, HistoryPoint, ActivityEntry } from '../types/ecoRain';
import { DeviceConnectionCard } from '../components/DeviceConnection/DeviceConnectionCard';
import { SensorCard } from '../components/SensorCard/SensorCard';
import { SoilMoistureCard } from '../components/SoilMoistureCard/SoilMoistureCard';
import { TankVisualization } from '../components/TankVisualization/TankVisualization';
import { SystemStatusPanel } from '../components/SystemStatus/SystemStatusPanel';
import { IrrigationDecision } from '../components/IrrigationDecision/IrrigationDecision';
import { SystemControl } from '../components/SystemControl/SystemControl';
import { PumpCard } from '../components/PumpCard/PumpCard';
import { SensorCharts } from '../components/SensorCharts/SensorCharts';
import { WaterManagement } from '../components/WaterManagement/WaterManagement';
import { DeviceHealth } from '../components/DeviceHealth/DeviceHealth';
import { ActivityLog } from '../components/ActivityLog/ActivityLog';
import { getSystemConfig } from '../config/deviceConfig';
import { formatUptime, formatTimeSince } from '../utils/formatters';

interface DashboardProps {
  data: EcoRainData | null;
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  apiResponseMs: number | null;
  sessionStats: SessionStats;
  history: HistoryPoint[];
  activityLog: ActivityEntry[];
  onCommand: (action: ControlAction) => Promise<boolean>;
  onIpChanged: (newIp: string) => void;
  onOpenDemoControls: () => void;
}

export function Dashboard({
  data,
  connectionStatus,
  isLoading,
  error,
  lastUpdated,
  apiResponseMs,
  sessionStats,
  history,
  activityLog,
  onCommand,
  onIpChanged,
  onOpenDemoControls,
}: DashboardProps) {
  const config = getSystemConfig();
  const sensorError = data ? data.distance < 0 : false;
  const isDisconnected = connectionStatus === 'offline';

  // Temperature Status
  const tempStatus = (() => {
    if (!data) return { label: 'Awaiting sensor', color: 'var(--text-muted)' };
    if (data.temperature > config.temperatureThreshold) return { label: 'High Temp', color: 'var(--red-400)' };
    if (data.temperature < 15) return { label: 'Cool Temp', color: 'var(--water-400)' };
    return { label: 'Optimal Range', color: 'var(--green-400)' };
  })();

  // Humidity Status
  const humidStatus = (() => {
    if (!data) return { label: 'Awaiting sensor', color: 'var(--text-muted)' };
    if (data.humidity > 80) return { label: 'High Humidity', color: 'var(--water-400)' };
    if (data.humidity < config.humidityThreshold) return { label: 'Dry Air', color: 'var(--amber-400)' };
    return { label: 'Moderate Humid', color: 'var(--green-400)' };
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ─── Disconnected / Offline Banner Alert ───────────────────── */}
      {isDisconnected && (
        <div className="offline-banner" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="status-dot red pulse" />
            <div>
              <strong>ESP8266 DISCONNECTED:</strong> Unable to retrieve live sensor data. Please check IP or Wi-Fi.
              {lastUpdated && (
                <span className="text-xs" style={{ display: 'block', opacity: 0.85 }}>
                  Last successful update: {formatTimeSince(lastUpdated)}
                </span>
              )}
            </div>
          </div>
          {error && <span className="font-mono text-xs text-red font-semibold">{error}</span>}
        </div>
      )}

      {/* ─── 1. DEVICE CONNECTION PANEL ───────────────────────────── */}
      <DeviceConnectionCard
        connectionStatus={connectionStatus}
        isLoading={isLoading}
        apiResponseMs={apiResponseMs}
        uptime={data?.uptime ?? null}
        onIpChanged={onIpChanged}
        onOpenDemoControls={onOpenDemoControls}
      />

      {/* ─── 2. SYSTEM STATUS OVERVIEW PANEL ───────────────────────── */}
      <SystemStatusPanel
        data={data}
        connectionStatus={connectionStatus}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
      />

      {/* ─── 3. LIVE SENSOR CARDS (4 PRIMARY METRICS) ──────────────── */}
      <div className="desktop-sensors-section">
        <div className="section-header">
          <span className="section-title">Live Sensor Telemetry</span>
          <div className="section-line" />
        </div>

        <div className="grid-4">
          {/* Card 1: Soil Moisture Sensor (A0) */}
          <SoilMoistureCard
            soilMoisture={data?.soilMoisture ?? null}
            irrigationRequired={data?.irrigationRequired ?? null}
          />

          {/* Card 2: Temperature Sensor (DHT22 - D4) */}
          <SensorCard
            title="TEMPERATURE"
            subtitle="DHT22 Sensor · Pin D4"
            icon={<Thermometer size={18} />}
            iconColor="#f97316"
            gradient="orange"
            value={data?.temperature ?? null}
            unit="°C"
            unavailable={!data}
            unavailableText="Waiting for sensor…"
            statusLabel={tempStatus.label}
            statusColor={tempStatus.color}
            style={{ borderTop: '3px solid #f97316' }}
          >
            {data && (
              <div className="mini-progress-track">
                <div
                  className="mini-progress-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, ((data.temperature - 10) / 35) * 100))}%`,
                    background: 'linear-gradient(90deg, #f97316, #fb923c)',
                  }}
                />
              </div>
            )}
          </SensorCard>

          {/* Card 3: Humidity Sensor (DHT22 - D4) */}
          <SensorCard
            title="HUMIDITY"
            subtitle="DHT22 Sensor · Pin D4"
            icon={<Droplets size={18} />}
            iconColor="#06b6d4"
            gradient="cyan"
            value={data?.humidity ?? null}
            unit="%"
            unavailable={!data}
            unavailableText="Waiting for sensor…"
            statusLabel={humidStatus.label}
            statusColor={humidStatus.color}
            style={{ borderTop: '3px solid #06b6d4' }}
          >
            {data && (
              <div className="mini-progress-track">
                <div
                  className="mini-progress-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, data.humidity))}%`,
                    background: 'linear-gradient(90deg, #06b6d4, #38bdf8)',
                  }}
                />
              </div>
            )}
          </SensorCard>

          {/* Card 4: Rainwater Tank Sensor (HC-SR04 - D5/D6) */}
          <SensorCard
            title="RAINWATER TANK"
            subtitle="HC-SR04 Sensor · Pins D5/D6"
            icon={<Ruler size={18} />}
            iconColor="#0ea5e9"
            gradient="blue"
            value={sensorError ? null : (data?.waterLevel ?? null)}
            unit="%"
            unavailable={!data || sensorError}
            unavailableText={sensorError ? 'Sensor unavailable' : 'Waiting for sensor…'}
            statusLabel={sensorError ? 'Echo signal timeout' : data ? `Dist: ${data.distance.toFixed(1)} cm` : 'Awaiting sensor'}
            statusColor={sensorError ? 'var(--amber-400)' : '#38bdf8'}
            style={{ borderTop: '3px solid #0ea5e9' }}
          >
            {data && !sensorError && (
              <div className="mini-progress-track">
                <div
                  className="mini-progress-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, data.waterLevel))}%`,
                    background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  }}
                />
              </div>
            )}
          </SensorCard>
        </div>
      </div>

      {/* ─── 4. RAINWATER TANK VISUALIZATION ───────────────────────── */}
      <div className="section-header">
        <span className="section-title">Rainwater Harvesting Reservoir</span>
        <div className="section-line" />
      </div>

      <TankVisualization
        waterLevel={data?.waterLevel ?? null}
        distance={data?.distance ?? null}
      />

      {/* ─── 5. IRRIGATION INTELLIGENCE & SYSTEM CONTROL ───────────── */}
      <div className="section-header">
        <span className="section-title">Decision Intelligence & Operational Controls</span>
        <div className="section-line" />
      </div>

      <div className="grid-2">
        <IrrigationDecision
          irrigationRequired={data?.irrigationRequired ?? null}
          pump1={data?.pump1 ?? null}
          pump2={data?.pump2 ?? null}
          soilMoisture={data?.soilMoisture ?? null}
          waterLevel={data?.waterLevel ?? null}
          autoMode={data?.autoMode ?? null}
          sensorError={sensorError}
        />
        <SystemControl
          autoMode={data?.autoMode ?? null}
          isLoading={isLoading}
          onSendCommand={onCommand}
        />
      </div>

      {/* ─── 6. PUMP 1 & PUMP 2 TELEMETRY CARDS ─────────────────────── */}
      <div className="section-header">
        <span className="section-title">Irrigation Actuator Relays</span>
        <div className="section-line" />
      </div>

      <div className="grid-2">
        {/* Pump 1: Rainwater Pump (Priority 1) */}
        <PumpCard
          pumpId={1}
          title="PUMP 1 — RAINWATER"
          sourceLabel="Rainwater Harvesting Tank"
          sourceDesc="Priority 1 Source (Active when tank > 20%) · Relay Pin D1"
          isOn={data?.pump1 ?? null}
          isLoading={isLoading}
          runtimeSeconds={sessionStats.pump1OnSeconds}
          onCommand={onCommand}
        />

        {/* Pump 2: Normal/Main Water Pump (Backup Priority 2) */}
        <PumpCard
          pumpId={2}
          title="PUMP 2 — NORMAL WATER"
          sourceLabel="Normal / Mains Water Tank"
          sourceDesc="Priority 2 Backup (Active when rainwater low) · Relay Pin D2"
          isOn={data?.pump2 ?? null}
          isLoading={isLoading}
          runtimeSeconds={sessionStats.pump2OnSeconds}
          onCommand={onCommand}
        />
      </div>

      {/* ─── 7. SESSION SENSOR TREND CHARTS ────────────────────────── */}
      <div className="section-header">
        <span className="section-title">Session Telemetry Stream</span>
        <div className="section-line" />
      </div>

      <SensorCharts history={history} />

      {/* ─── 8. WATER CONSERVATION MANAGEMENT ──────────────────────── */}
      <WaterManagement sessionStats={sessionStats} />

      {/* ─── 9. SYSTEM INFORMATION & AUDIT TRAIL ───────────────────── */}
      <div className="section-header">
        <span className="section-title">System Information & Diagnostics</span>
        <div className="section-line" />
      </div>

      <div className="grid-2">
        {/* System Information Card */}
        <div className="card" style={{ borderTop: '3px solid #6366f1' }}>
          <div className="card-header">
            <div className="card-title-group">
              <h2 className="card-title">SYSTEM INFORMATION</h2>
              <span className="card-subtitle">NodeMCU ESP8266 Microcontroller Specification</span>
            </div>
            <div className="card-icon-badge" style={{ color: '#818cf8' }}>
              <Info size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="info-spec-row">
              <span className="info-spec-key">Controller Hardware</span>
              <span className="info-spec-val font-mono">NodeMCU ESP8266 (ESP-12E Module)</span>
            </div>
            <div className="info-spec-row">
              <span className="info-spec-key">Firmware / API Spec</span>
              <span className="info-spec-val font-mono text-cyan">v1.4.2 REST / JSON (CORS Enabled)</span>
            </div>
            <div className="info-spec-row">
              <span className="info-spec-key">Active IP Endpoint</span>
              <span className="info-spec-val font-mono" style={{ color: config.esp8266Ip ? 'var(--water-300)' : 'var(--text-muted)' }}>
                {config.esp8266Ip ? `http://${config.esp8266Ip}` : 'Simulation Internal'}
              </span>
            </div>
            <div className="info-spec-row">
              <span className="info-spec-key">System Uptime</span>
              <span className="info-spec-val font-mono">
                {data ? formatUptime(data.uptime) : '—'}
              </span>
            </div>
            <div className="info-spec-row">
              <span className="info-spec-key">Connection Status</span>
              <span className="info-spec-val font-mono" style={{ color: connectionStatus === 'connected' ? 'var(--green-400)' : connectionStatus === 'demo' ? 'var(--water-400)' : 'var(--red-400)' }}>
                ● {connectionStatus.toUpperCase()}
              </span>
            </div>
            <div className="info-spec-row">
              <span className="info-spec-key">Last Sync Timestamp</span>
              <span className="info-spec-val font-mono text-muted">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Device Health Transducers */}
        <DeviceHealth data={data} connectionStatus={connectionStatus} />
      </div>

      {/* Activity Event Log */}
      <ActivityLog entries={activityLog} />
    </div>
  );
}
