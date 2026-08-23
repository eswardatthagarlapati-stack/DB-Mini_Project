import { Thermometer, Droplets, Ruler, RefreshCw } from 'lucide-react';
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
import { WeatherPlaceholder, AIPlaceholder } from '../components/Placeholders/FuturePlaceholders';
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ─── System Status Bar ─────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 24px',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800 }}>
            System Status
          </h1>
          <p className="text-xs text-muted mt-1">
            {data?.autoMode
              ? 'Automatic irrigation monitoring active'
              : 'Manual control mode — system not irrigating automatically'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {data && (
            <>
              <Stat label="Uptime" value={formatUptime(data.uptime)} />
              <Stat label="Mode" value={data.autoMode ? 'AUTO' : 'MANUAL'} highlight={!data.autoMode} />
            </>
          )}
          {connectionStatus === 'offline' && error && (
            <span style={{ fontSize: '0.8rem', color: 'var(--red-400)', fontWeight: 500 }}>
              {error}
            </span>
          )}
          {isLoading && !data && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
              Connecting to ESP8266…
            </div>
          )}
        </div>
      </div>

      {/* ─── Section: Sensors ──────────────────────────────── */}
      <SectionHeader title="Live Sensor Data" />

      <div className="grid-4">
        {/* Temperature */}
        <SensorCard
          title="Temperature"
          subtitle="DHT22 · Pin D4"
          icon={<Thermometer size={18} />}
          iconColor="var(--primary-400)"
          value={data?.temperature ?? null}
          unit="°C"
          unavailable={!data}
          accentClass="card-cyan"
        >
          {data && (
            <div className="mt-2">
              <TempBar temp={data.temperature} />
            </div>
          )}
        </SensorCard>

        {/* Humidity */}
        <SensorCard
          title="Humidity"
          subtitle="DHT22 · Pin D4"
          icon={<Droplets size={18} />}
          iconColor="var(--green-400)"
          value={data?.humidity ?? null}
          unit="%"
          unavailable={!data}
          accentClass="card-green"
        >
          {data && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                height: 4, borderRadius: 2,
                background: 'var(--bg-elevated)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${data.humidity}%`,
                  background: 'linear-gradient(90deg, var(--green-600), var(--green-400))',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )}
        </SensorCard>

        {/* Soil Moisture */}
        <SoilMoistureCard soilMoisture={data?.soilMoisture ?? null} />

        {/* Water Distance */}
        <SensorCard
          title="Water Distance"
          subtitle="HC-SR04 · Pins D5/D6"
          icon={<Ruler size={18} />}
          iconColor={sensorError ? 'var(--amber-400)' : 'var(--primary-300)'}
          value={sensorError ? null : (data?.distance ?? null)}
          unit=" cm"
          unavailable={!data || sensorError}
          accentClass={sensorError ? 'card-amber' : 'card-cyan'}
        >
          {sensorError && (
            <p className="text-xs mt-2" style={{ color: 'var(--amber-400)' }}>
              HC-SR04 signal not detected
            </p>
          )}
        </SensorCard>
      </div>

      {/* ─── Tank ──────────────────────────────────────────── */}
      <SectionHeader title="Rainwater Storage" />
      <div>
        <TankVisualization
          waterLevel={data?.waterLevel ?? null}
          distance={data?.distance ?? null}
        />
      </div>

      {/* ─── Irrigation + System Control ───────────────────── */}
      <SectionHeader title="Irrigation Control" />
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

      {/* ─── Pumps ─────────────────────────────────────────── */}
      <SectionHeader title="Pump Control" />
      <div className="grid-2">
        <PumpCard
          pumpId={1}
          title="Pump 1 — Rainwater"
          description="Primary rainwater source"
          note="Used when tank > 20%"
          isOn={data?.pump1 ?? null}
          isLoading={isLoading}
          runtimeSeconds={sessionStats.pump1OnSeconds}
          onCommand={onCommand}
        />
        <PumpCard
          pumpId={2}
          title="Pump 2 — Normal Water"
          description="Backup water source"
          note="Used when rainwater is insufficient"
          isOn={data?.pump2 ?? null}
          isLoading={isLoading}
          runtimeSeconds={sessionStats.pump2OnSeconds}
          onCommand={onCommand}
        />
      </div>

      {/* ─── Charts ────────────────────────────────────────── */}
      <SectionHeader title="Analytics" />
      <SensorCharts history={history} />

      {/* ─── Water Management ──────────────────────────────── */}
      <WaterManagement sessionStats={sessionStats} />

      {/* ─── Device Health + Activity ──────────────────────── */}
      <SectionHeader title="System Health" />
      <div className="grid-2">
        <DeviceHealth data={data} connectionStatus={connectionStatus} />
        <ActivityLog entries={activityLog} />
      </div>

      {/* ─── Future Features ───────────────────────────────── */}
      <SectionHeader title="Upcoming Features" />
      <div className="grid-2">
        <WeatherPlaceholder />
        <AIPlaceholder />
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header">
      <span className="section-title">{title}</span>
      <div className="section-line" />
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700,
        color: highlight ? 'var(--purple-300)' : 'var(--primary-400)',
      }}>{value}</div>
    </div>
  );
}

function TempBar({ temp }: { temp: number }) {
  // 10-45°C range
  const pct = Math.max(0, Math.min(100, ((temp - 10) / 35) * 100));
  const color = temp < 20 ? 'var(--primary-400)' : temp < 30 ? 'var(--green-400)' : 'var(--amber-400)';
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
      <div style={{
        height: '100%', borderRadius: 2,
        width: `${pct}%`, background: color,
        transition: 'width 0.6s ease',
      }} />
    </div>
  );
}
