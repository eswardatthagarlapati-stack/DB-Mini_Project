import { Activity, Droplets, Droplet, Sprout, Clock, RefreshCw, Radio } from 'lucide-react';
import { formatUptime, formatTimeSince } from '../../utils/formatters';
import { TANK_LOW_THRESHOLD } from '../../config/deviceConfig';
import type { EcoRainData, ConnectionStatus } from '../../types/ecoRain';

interface SystemStatusPanelProps {
  data: EcoRainData | null;
  connectionStatus?: ConnectionStatus;
  lastUpdated: Date | null;
  isLoading: boolean;
}

export function SystemStatusPanel({
  data,
  lastUpdated,
  isLoading,
}: SystemStatusPanelProps) {

  const sensorError = data ? data.distance < 0 : false;

  // 1. Tank Status
  const tankStatusInfo = (() => {
    if (!data || sensorError) return { label: 'UNAVAILABLE', color: 'var(--amber-400)', bg: 'rgba(245, 158, 11, 0.12)' };
    if (data.waterLevel >= 70) return { label: 'SUFFICIENT', color: 'var(--water-400)', bg: 'rgba(56, 189, 248, 0.12)' };
    if (data.waterLevel > TANK_LOW_THRESHOLD) return { label: 'MODERATE', color: 'var(--primary-400)', bg: 'rgba(14, 165, 233, 0.12)' };
    return { label: 'LOW / CRITICAL', color: 'var(--red-400)', bg: 'rgba(239, 68, 68, 0.12)' };
  })();

  // 2. Irrigation Status
  const irrigationStatusInfo = (() => {
    if (!data) return { label: 'AWAITING TELEMETRY', color: 'var(--text-muted)', bg: 'var(--bg-surface)' };
    if (data.irrigationRequired) return { label: 'REQUIRED', color: 'var(--amber-400)', bg: 'rgba(245, 158, 11, 0.15)' };
    return { label: 'NOT REQUIRED', color: 'var(--green-400)', bg: 'rgba(34, 197, 94, 0.15)' };
  })();

  // 3. System Mode
  const modeInfo = (() => {
    if (!data) return { label: 'AUTOMATIC', color: 'var(--green-400)', bg: 'rgba(34, 197, 94, 0.12)' };
    if (data.autoMode) return { label: 'AUTOMATIC', color: 'var(--green-400)', bg: 'rgba(34, 197, 94, 0.15)' };
    return { label: 'MANUAL MODE', color: 'var(--amber-400)', bg: 'rgba(245, 158, 11, 0.15)' };
  })();

  // 4. Selected Water Source
  const waterSourceInfo = (() => {
    if (!data) return { label: 'STANDBY', color: 'var(--text-muted)', bg: 'var(--bg-surface)' };
    if (data.pump1) return { label: 'RAINWATER (PUMP 1)', color: 'var(--water-400)', bg: 'rgba(56, 189, 248, 0.15)' };
    if (data.pump2) return { label: 'NORMAL WATER (PUMP 2)', color: 'var(--green-400)', bg: 'rgba(34, 197, 94, 0.15)' };
    return { label: 'NONE (IDLE)', color: 'var(--text-muted)', bg: 'var(--bg-surface)' };
  })();

  return (
    <div className="card system-status-overview-card" role="region" aria-label="System Status Overview">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="card-title">SYSTEM STATUS</h2>
            {data && (
              <span className={`status-mode-pill ${data.autoMode ? 'auto' : 'manual'}`}>
                ● {data.autoMode ? 'AUTO RUNNING' : 'MANUAL OVERRIDE'}
              </span>
            )}
          </div>
          <span className="card-subtitle">Real-time state overview of hydraulic controllers & telemetry</span>
        </div>
        <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
          <Activity size={18} />
        </div>
      </div>

      <div className="system-status-grid-6">
        {/* 1. Tank Status */}
        <div className="sys-stat-tile">
          <span className="sys-stat-tile-label">
            <Droplets size={12} color="var(--water-400)" /> TANK STATUS
          </span>
          <span
            className="sys-stat-tile-badge font-mono"
            style={{ color: tankStatusInfo.color, background: tankStatusInfo.bg, borderColor: `${tankStatusInfo.color}40` }}
          >
            {tankStatusInfo.label}
          </span>
        </div>

        {/* 2. Irrigation Status */}
        <div className="sys-stat-tile">
          <span className="sys-stat-tile-label">
            <Sprout size={12} color="var(--green-400)" /> IRRIGATION
          </span>
          <span
            className="sys-stat-tile-badge font-mono"
            style={{ color: irrigationStatusInfo.color, background: irrigationStatusInfo.bg, borderColor: `${irrigationStatusInfo.color}40` }}
          >
            {irrigationStatusInfo.label}
          </span>
        </div>

        {/* 3. System Mode */}
        <div className="sys-stat-tile">
          <span className="sys-stat-tile-label">
            <Radio size={12} color="var(--amber-400)" /> SYSTEM MODE
          </span>
          <span
            className="sys-stat-tile-badge font-mono"
            style={{ color: modeInfo.color, background: modeInfo.bg, borderColor: `${modeInfo.color}40` }}
          >
            {modeInfo.label}
          </span>
        </div>

        {/* 4. Selected Water Source */}
        <div className="sys-stat-tile">
          <span className="sys-stat-tile-label">
            <Droplet size={12} color="var(--water-300)" /> WATER SOURCE
          </span>
          <span
            className="sys-stat-tile-badge font-mono"
            style={{ color: waterSourceInfo.color, background: waterSourceInfo.bg, borderColor: `${waterSourceInfo.color}40` }}
          >
            {waterSourceInfo.label}
          </span>
        </div>

        {/* 5. ESP8266 Uptime */}
        <div className="sys-stat-tile">
          <span className="sys-stat-tile-label">
            <Clock size={12} color="var(--text-secondary)" /> ESP UPTIME
          </span>
          <span className="sys-stat-tile-value font-mono">
            {data ? formatUptime(data.uptime) : '—'}
          </span>
        </div>

        {/* 6. Last Update */}
        <div className="sys-stat-tile">
          <span className="sys-stat-tile-label">
            <RefreshCw size={12} color="var(--text-secondary)" className={isLoading ? 'spin-icon' : undefined} /> LAST UPDATE
          </span>
          <span className="sys-stat-tile-value font-mono">
            {lastUpdated ? formatTimeSince(lastUpdated) : 'Standby'}
          </span>
        </div>
      </div>
    </div>
  );
}
