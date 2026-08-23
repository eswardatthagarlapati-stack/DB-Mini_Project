import { useState } from 'react';
import { Settings, Wifi, WifiOff, Trash2 } from 'lucide-react';
import { getEsp8266Ip, setEsp8266Ip, clearEsp8266Ip } from '../config/deviceConfig';
import { testConnection } from '../services/esp8266Service';

interface SettingsPageProps {
  onModeChange: () => void;
}

type TestState = 'idle' | 'testing' | 'success' | 'fail';

export function SettingsPage({ onModeChange }: SettingsPageProps) {
  const [ip, setIp] = useState(getEsp8266Ip());
  const [testState, setTestState] = useState<TestState>('idle');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (ip.trim()) {
      setEsp8266Ip(ip.trim());
    } else {
      clearEsp8266Ip();
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onModeChange();
  }

  function handleClear() {
    clearEsp8266Ip();
    setIp('');
    onModeChange();
  }

  async function handleTest() {
    if (!ip.trim()) return;
    setEsp8266Ip(ip.trim());
    setTestState('testing');
    const ok = await testConnection();
    setTestState(ok ? 'success' : 'fail');
    setTimeout(() => setTestState('idle'), 4000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 600 }}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={20} color="var(--primary-400)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>Device Settings</h1>
        </div>
        <p className="text-sm text-muted">Configure the ESP8266 connection. Leave blank to use Demo Mode.</p>
      </div>

      {/* IP Config */}
      <div className="card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>
          ESP8266 Connection
        </h2>
        <p className="text-xs text-muted mb-6">
          Enter the IP address assigned to the ESP8266 by your router. The dashboard will construct
          <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-300)', margin: '0 4px' }}>http://&lt;IP&gt;/api/data</code>
          and
          <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-300)', margin: '0 4px' }}>http://&lt;IP&gt;/control?action=…</code>
        </p>

        <div className="form-group mb-4">
          <label className="label" htmlFor="input-esp8266-ip">ESP8266 IP Address</label>
          <input
            id="input-esp8266-ip"
            className="input input-mono"
            type="text"
            placeholder="192.168.1.100"
            value={ip}
            onChange={e => setIp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            aria-label="ESP8266 IP Address"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="text-xs text-muted">
            Example: <span className="font-mono" style={{ color: 'var(--primary-300)' }}>192.168.1.100</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            id="btn-save-ip"
            aria-label="Save IP address and connect"
          >
            {saved ? '✓ Saved' : 'Save & Connect'}
          </button>

          <button
            className="btn btn-ghost"
            onClick={handleTest}
            disabled={!ip.trim() || testState === 'testing'}
            id="btn-test-connection"
            aria-label="Test ESP8266 connection"
          >
            {testState === 'testing' ? (
              <><span className="spinner" />Testing…</>
            ) : (
              <><Wifi size={15} />Test Connection</>
            )}
          </button>

          {getEsp8266Ip() && (
            <button
              className="btn btn-ghost"
              onClick={handleClear}
              id="btn-clear-ip"
              aria-label="Clear IP and switch to demo mode"
              style={{ color: 'var(--red-400)' }}
            >
              <Trash2 size={15} /> Clear (Demo Mode)
            </button>
          )}
        </div>

        {/* Test result */}
        {testState === 'success' && (
          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--green-400)', fontSize: '0.875rem', fontWeight: 600,
          }}>
            <Wifi size={16} /> 🟢 ESP8266 reachable — /api/data responded successfully
          </div>
        )}
        {testState === 'fail' && (
          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
            color: 'var(--red-400)', fontSize: '0.875rem', fontWeight: 600,
          }}>
            <WifiOff size={16} /> 🔴 Unable to reach ESP8266 at {ip}
          </div>
        )}
      </div>

      {/* Demo Mode Info */}
      <div className="card card-cyan">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 8 }}>
          Demo Mode
        </h2>
        <p className="text-sm text-muted mb-3">
          When no IP address is saved, the dashboard runs in Demo Mode with a realistic simulation engine.
          Soil moisture gradually depletes, triggering simulated irrigation. The tank level depletes when Pump 1 runs.
        </p>
        <div style={{
          background: 'rgba(0,180,216,0.08)',
          border: '1px solid rgba(0,180,216,0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: '0.8rem',
          color: 'var(--primary-300)',
        }}>
          Demo mode is suitable for presentations and UI testing. It does not communicate with any hardware.
        </div>
      </div>

      {/* Security note */}
      <div className="card" style={{ borderColor: 'rgba(168,85,247,0.2)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, marginBottom: 8, color: 'var(--purple-300)' }}>
          Security Note
        </h2>
        <p className="text-sm text-muted">
          This dashboard does not store Wi-Fi credentials. The ESP8266 stores its own Wi-Fi configuration in firmware.
          Only the device IP address is saved locally in your browser.
        </p>
      </div>
    </div>
  );
}
