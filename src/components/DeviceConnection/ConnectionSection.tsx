import { useState } from 'react';
import { Wifi, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import { getEsp8266Ip, setEsp8266Ip, clearEsp8266Ip } from '../../config/deviceConfig';
import { testConnection } from '../../services/esp8266Service';
import type { ConnectionStatus } from '../../types/ecoRain';

interface ConnectionSectionProps {
  connectionStatus: ConnectionStatus;
  onConnected: () => void;
}

type TestState = 'idle' | 'testing' | 'success' | 'fail';

export function ConnectionSection({ connectionStatus, onConnected }: ConnectionSectionProps) {
  const [ip, setIp] = useState(getEsp8266Ip);
  const [testState, setTestState] = useState<TestState>('idle');

  async function handleConnect() {
    const trimmed = ip.trim();
    if (!trimmed) return;
    setEsp8266Ip(trimmed);
    setTestState('testing');
    const ok = await testConnection();
    setTestState(ok ? 'success' : 'fail');
    if (ok) {
      setTimeout(() => { onConnected(); }, 600);
    }
  }

  function handleDisconnect() {
    clearEsp8266Ip();
    setIp('');
    setTestState('idle');
    onConnected(); // refresh mode
  }

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            ESP8266 Connection
          </h2>
          <p className="text-sm text-secondary mt-1">
            {isConnected
              ? `Connected to ${getEsp8266Ip()}`
              : 'Enter the IP address shown by your ESP8266'}
          </p>
        </div>
        <div style={{ color: isConnected ? 'var(--green)' : 'var(--text-muted)' }}>
          {isConnected ? <Wifi size={22} /> : <WifiOff size={22} />}
        </div>
      </div>

      {!isConnected ? (
        <>
          <div className="connect-form">
            <div className="form-field">
              <label className="form-label" htmlFor="input-esp-ip">
                IP Address
              </label>
              <input
                id="input-esp-ip"
                className="form-input"
                type="text"
                placeholder="192.168.1.100"
                value={ip}
                onChange={e => { setIp(e.target.value); setTestState('idle'); }}
                onKeyDown={e => e.key === 'Enter' && handleConnect()}
                autoComplete="off"
                spellCheck={false}
                style={{ fontFamily: 'monospace' }}
                aria-label="ESP8266 IP address"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleConnect}
              disabled={!ip.trim() || testState === 'testing'}
              id="btn-esp-connect"
              style={{ flexShrink: 0 }}
            >
              {testState === 'testing'
                ? <><span className="spinner" />Connecting…</>
                : 'Connect'}
            </button>
          </div>

          {testState === 'success' && (
            <div className="connect-result success">
              <CheckCircle size={16} /> Connected successfully!
            </div>
          )}
          {testState === 'fail' && (
            <div className="connect-result fail">
              <XCircle size={16} /> Unable to reach ESP8266 at {ip}. Check the IP address and try again.
            </div>
          )}

          <p style={{ marginTop: 'var(--space-3)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Running without hardware? The dashboard works in Demo Mode automatically.
          </p>
        </>
      ) : (
        <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: '0.9rem', fontWeight: 600 }}>
            <CheckCircle size={17} />
            Connected to {getEsp8266Ip()}
          </div>
          <button className="btn btn-outline btn-sm" onClick={handleDisconnect} id="btn-esp-disconnect">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
