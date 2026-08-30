import type { ControlAction, EcoRainData, ConnectionStatus } from '../types/ecoRain';
import type { ActivityEntry, HistoryPoint, SessionStats } from '../types/ecoRain';
import { ConnectionSection } from '../components/DeviceConnection/ConnectionSection';
import { SensorGrid } from '../components/SensorCard/SensorGrid';
import { TankSection } from '../components/TankVisualization/TankSection';
import { IrrigationStatus } from '../components/IrrigationDecision/IrrigationStatus';
import { PumpSection } from '../components/PumpCard/PumpSection';
import { SystemMode } from '../components/SystemControl/SystemMode';
import { AdvancedDiagnostics } from '../components/AdvancedDiagnostics/AdvancedDiagnostics';

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
  onIpChanged: () => void;
  onOpenDemoControls?: () => void;
}

export function Dashboard({
  data, connectionStatus, isLoading,
  lastUpdated, apiResponseMs,
  onCommand, onIpChanged,
}: DashboardProps) {
  const isDemoMode = connectionStatus === 'demo';

  return (
    <>
      {/* Demo banner */}
      {isDemoMode && (
        <div className="demo-banner" role="status">
          <span>
            <strong>Demo Mode</strong> — No ESP8266 connected. Sensor values are simulated.
          </span>
          <span style={{ opacity: 0.7 }}>Connect your device below to use real data.</span>
        </div>
      )}

      {/* Offline error */}
      {connectionStatus === 'offline' && (
        <div style={{
          background: 'var(--red-light)', border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)', padding: '10px 16px',
          fontSize: '0.875rem', color: 'var(--red-text)', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
        }} role="alert">
          🔴 Cannot reach ESP8266 — check that the device is powered on and connected to the same Wi-Fi network.
        </div>
      )}

      {/* 1. ESP8266 Connection */}
      <ConnectionSection
        connectionStatus={connectionStatus}
        onConnected={onIpChanged}
      />

      {/* 2. Sensor Cards */}
      <div>
        <div className="section-label">Sensor Readings</div>
        <SensorGrid data={data} />
      </div>

      {/* 3. Rainwater Tank */}
      <TankSection
        waterLevel={data?.waterLevel ?? null}
        distance={data?.distance ?? null}
      />

      {/* 4. Irrigation Status */}
      <IrrigationStatus data={data} />

      {/* 5. Pump Control */}
      <PumpSection data={data} isLoading={isLoading} onCommand={onCommand} />

      {/* 6. System Mode */}
      <SystemMode data={data} isLoading={isLoading} onCommand={onCommand} />

      {/* 7. Advanced Diagnostics (collapsed) */}
      <AdvancedDiagnostics
        data={data}
        connectionStatus={connectionStatus}
        lastUpdated={lastUpdated}
        apiResponseMs={apiResponseMs}
        isDemoMode={isDemoMode}
      />
    </>
  );
}
