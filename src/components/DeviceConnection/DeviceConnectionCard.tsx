import { useState } from 'react';
import { Wifi, WifiOff, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { getEsp8266Ip, setEsp8266Ip, clearEsp8266Ip } from '../../config/deviceConfig';
import { isValidIPv4, sanitizeIpInput } from '../../utils/validation';
import type { ConnectionStatus } from '../../types/ecoRain';

interface DeviceConnectionCardProps {
  connectionStatus: ConnectionStatus;
  isLoading: boolean;
  onIpChanged: (newIp: string) => void;
  onOpenDemoControls?: () => void;
}

export function DeviceConnectionCard({
  connectionStatus,
  isLoading,
  onIpChanged,
  onOpenDemoControls,
}: DeviceConnectionCardProps) {
  const currentSavedIp = getEsp8266Ip();
  const [ipInput, setIpInput] = useState(currentSavedIp || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isEditingIp, setIsEditingIp] = useState(!currentSavedIp);

  const isConnected = connectionStatus === 'connected';

  const handleConnect = async (targetIp?: string) => {
    const raw = targetIp !== undefined ? targetIp : ipInput;
    const cleanIp = sanitizeIpInput(raw);

    if (!cleanIp) {
      setErrorMsg('Please enter the IP address (e.g. 192.168.1.100)');
      return;
    }

    if (!isValidIPv4(cleanIp)) {
      setErrorMsg('Please enter a valid IP address (e.g. 192.168.1.100)');
      return;
    }

    setErrorMsg(null);
    setIsConnecting(true);
    setEsp8266Ip(cleanIp);
    setIpInput(cleanIp);
    setIsEditingIp(false);
    onIpChanged(cleanIp);
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    clearEsp8266Ip();
    setIpInput('');
    setIsEditingIp(true);
    setErrorMsg(null);
    onIpChanged('');
  };

  const handleSwitchToDemo = () => {
    clearEsp8266Ip();
    setIpInput('');
    setIsEditingIp(false);
    setErrorMsg(null);
    onIpChanged('');
    if (onOpenDemoControls) {
      onOpenDemoControls();
    }
  };

  return (
    <div className="card" role="region" aria-label="ESP8266 Connection">
      <div className="connection-box">
        {/* Left Side: Title & Description */}
        <div className="connection-info">
          <h2 className="card-title-main">
            <Wifi size={20} color="var(--color-brand)" />
            Connect Your ESP8266
          </h2>
          <p className="card-subtitle-main">
            {isConnected && !isEditingIp
              ? 'Your device is currently communicating with this control panel.'
              : 'Enter the IP address shown on your ESP8266 serial monitor or OLED screen.'}
          </p>
        </div>

        {/* Right Side: Form or Connected Status */}
        <div className="connection-form">
          {isConnected && !isEditingIp ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-green-bg)',
                  color: 'var(--color-green)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>ESP8266 Connected</span>
                <span className="font-mono text-sm" style={{ opacity: 0.9, marginLeft: 4 }}>
                  (IP: {currentSavedIp})
                </span>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => setIsEditingIp(true)}
                id="btn-change-ip"
              >
                Change IP
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDisconnect}
                id="btn-disconnect"
                style={{ color: 'var(--color-red)' }}
              >
                <WifiOff size={14} /> Disconnect
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.100"
                  value={ipInput}
                  onChange={(e) => {
                    setIpInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  className="input-text font-mono"
                  aria-label="ESP8266 IP Address"
                  id="input-esp8266-ip"
                />

                <button
                  className="btn btn-primary"
                  onClick={() => handleConnect()}
                  disabled={isLoading || isConnecting || !ipInput.trim()}
                  id="btn-connect-ip"
                >
                  {isConnecting ? (
                    <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Connecting...</>
                  ) : (
                    <>Connect</>
                  )}
                </button>

                <button
                  className="btn btn-outline"
                  onClick={handleSwitchToDemo}
                  id="btn-demo-mode"
                  title="Run offline simulator mode"
                >
                  <Sparkles size={15} color="var(--color-brand)" />
                  <span>Use Demo Mode</span>
                </button>
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-red)', fontSize: '0.82rem', marginTop: 4 }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
