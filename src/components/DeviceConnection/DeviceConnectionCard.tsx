import { useState } from 'react';
import { Cpu, Wifi, WifiOff, CheckCircle2, AlertCircle, RefreshCw, Radio, Server, Sparkles, HelpCircle } from 'lucide-react';
import { getEsp8266Ip, setEsp8266Ip, clearEsp8266Ip } from '../../config/deviceConfig';
import { isValidIPv4, sanitizeIpInput } from '../../utils/validation';
import type { ConnectionStatus } from '../../types/ecoRain';

interface DeviceConnectionCardProps {
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  apiResponseMs: number | null;
  uptime: number | null;
  onIpChanged: (newIp: string) => void;
  onOpenDemoControls?: () => void;
}

export function DeviceConnectionCard({
  connectionStatus,
  isLoading,
  apiResponseMs,
  onIpChanged,
  onOpenDemoControls,
}: DeviceConnectionCardProps) {
  const currentSavedIp = getEsp8266Ip();
  const [ipInput, setIpInput] = useState(currentSavedIp);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const isConnected = connectionStatus === 'connected';
  const isDemo = connectionStatus === 'demo';

  const handleConnect = async (targetIp?: string) => {
    const raw = targetIp !== undefined ? targetIp : ipInput;
    const cleanIp = sanitizeIpInput(raw);

    if (!cleanIp) {
      setErrorMsg('Please enter an ESP8266 IP address');
      return;
    }

    if (!isValidIPv4(cleanIp)) {
      setErrorMsg('Invalid IPv4 address format (e.g. 192.168.1.100)');
      return;
    }

    setErrorMsg(null);
    setIsConnecting(true);
    setEsp8266Ip(cleanIp);
    setIpInput(cleanIp);
    onIpChanged(cleanIp);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    clearEsp8266Ip();
    setIpInput('');
    setErrorMsg(null);
    onIpChanged('');
  };

  const handleSwitchToDemo = () => {
    clearEsp8266Ip();
    setIpInput('');
    setErrorMsg(null);
    onIpChanged('');
    if (onOpenDemoControls) {
      onOpenDemoControls();
    }
  };

  return (
    <div className="card connection-panel-card" role="region" aria-label="Device Connection Panel">
      <div className="card-header">
        <div className="card-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="card-title">CONNECT ESP8266</h2>
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-xs)',
                background: isConnected
                  ? 'rgba(34, 197, 94, 0.15)'
                  : isDemo
                  ? 'rgba(56, 189, 248, 0.15)'
                  : 'rgba(239, 68, 68, 0.15)',
                color: isConnected
                  ? 'var(--green-400)'
                  : isDemo
                  ? 'var(--water-400)'
                  : 'var(--red-400)',
                border: `1px solid ${
                  isConnected
                    ? 'rgba(34, 197, 94, 0.35)'
                    : isDemo
                    ? 'rgba(56, 189, 248, 0.35)'
                    : 'rgba(239, 68, 68, 0.35)'
                }`,
              }}
            >
              ● {isConnected ? 'CONNECTED' : isDemo ? 'DEMO SIMULATION' : 'DISCONNECTED'}
            </span>
          </div>
          <span className="card-subtitle">Local Area Network (LAN) HTTP Telemetry Bus</span>
        </div>
        <div className="card-icon-badge" style={{ color: isConnected ? 'var(--green-400)' : 'var(--water-400)' }}>
          <Cpu size={18} />
        </div>
      </div>

      <div className="conn-panel-grid">
        {/* Left Column: Form Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label
              htmlFor="esp8266-ip-field"
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 6,
                display: 'block',
              }}
            >
              ESP8266 IP Address
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="esp8266-ip-field"
                  type="text"
                  placeholder="e.g. 192.168.1.100 or 10.254.110.2"
                  value={ipInput}
                  onChange={(e) => {
                    setIpInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="ip-input-field"
                  aria-invalid={!!errorMsg}
                  aria-describedby={errorMsg ? 'ip-error-msg' : undefined}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleConnect()}
                disabled={isLoading || isConnecting || !ipInput.trim()}
                id="btn-connect-esp8266"
                style={{ padding: '0 20px', minWidth: 110 }}
              >
                {isConnecting ? (
                  <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Syncing</>
                ) : (
                  <><Wifi size={14} /> CONNECT</>
                )}
              </button>
            </div>

            {errorMsg && (
              <div id="ip-error-msg" className="ip-error-text" role="alert">
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Quick preset and action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {currentSavedIp && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDisconnect}
                id="btn-disconnect-esp8266"
                style={{ color: 'var(--red-400)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <WifiOff size={13} /> Disconnect Hardware
              </button>
            )}

            <button
              className="btn btn-ghost btn-sm"
              onClick={handleSwitchToDemo}
              id="btn-switch-demo"
              style={{ color: 'var(--water-300)', borderColor: 'rgba(56, 189, 248, 0.3)' }}
            >
              <Sparkles size={13} /> Run Demo Simulation
            </button>
          </div>
        </div>

        {/* Right Column: Active Connection State Box */}
        <div className="conn-status-summary-box">
          <div className="conn-stat-row">
            <span className="conn-stat-key"><Radio size={13} /> Hardware Device:</span>
            <span className="conn-stat-val font-mono">NodeMCU ESP8266 (ESP-12E)</span>
          </div>

          <div className="conn-stat-row">
            <span className="conn-stat-key"><Server size={13} /> Target IP:</span>
            <span className="conn-stat-val font-mono" style={{ color: currentSavedIp ? 'var(--water-300)' : 'var(--text-muted)' }}>
              {currentSavedIp ? currentSavedIp : 'None (Simulation Active)'}
            </span>
          </div>

          <div className="conn-stat-row">
            <span className="conn-stat-key"><Wifi size={13} /> Status:</span>
            <span
              className="conn-stat-val font-mono"
              style={{
                color: isConnected ? 'var(--green-400)' : isDemo ? 'var(--water-400)' : 'var(--red-400)',
                fontWeight: 700,
              }}
            >
              ● {isConnected ? 'Connected to Controller' : isDemo ? 'Demo Mode Active' : 'Disconnected / Standby'}
            </span>
          </div>

          {isConnected && apiResponseMs !== null && (
            <div className="conn-stat-row">
              <span className="conn-stat-key"><CheckCircle2 size={13} /> Response Latency:</span>
              <span className="conn-stat-val font-mono text-green">{apiResponseMs} ms round-trip</span>
            </div>
          )}

          <div className="conn-network-hint">
            <HelpCircle size={13} style={{ flexShrink: 0 }} />
            <span>
              <strong>LAN Notice:</strong> Both ESP8266 and this browser must share the same local Wi-Fi subnet for direct private IP communication.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
