import { useState } from 'react';
import { Settings, Wifi, WifiOff, Trash2, Cpu, Sliders, Palette, CheckCircle2 } from 'lucide-react';
import { getEsp8266Ip, setEsp8266Ip, clearEsp8266Ip, SOIL_DRY_THRESHOLD, SOIL_MOIST_THRESHOLD, TANK_LOW_THRESHOLD, POLLING_INTERVAL_MS } from '../config/deviceConfig';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={20} color="var(--water-400)" />
          System & Hardware Configuration
        </h1>
        <p className="text-xs text-muted mt-1">
          Network connectivity parameters, irrigation firmware thresholds, and UI telemetry preferences.
        </p>
      </div>

      {/* ─── Device Connection Section ───────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">ESP8266 Microcontroller Network</h2>
            <span className="card-subtitle">Target IP address on local Wi-Fi subnet</span>
          </div>
          <div className="card-icon-badge">
            <Cpu size={18} />
          </div>
        </div>

        <p className="text-xs text-secondary mb-4">
          Enter the IPv4 address assigned to your ESP8266 by the local router. The dashboard will communicate directly with
          <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--water-300)', margin: '0 4px', background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: 4 }}>
            http://&lt;IP&gt;/api/data
          </code>
          and send control signals to
          <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--water-300)', margin: '0 4px', background: 'var(--bg-surface)', padding: '2px 4px', borderRadius: 4 }}>
            http://&lt;IP&gt;/control
          </code>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }} htmlFor="input-esp8266-ip">
            ESP8266 IPv4 Address
          </label>
          <input
            id="input-esp8266-ip"
            type="text"
            placeholder="e.g. 192.168.1.100"
            value={ip}
            onChange={e => setIp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.88rem',
              outline: 'none',
              maxWidth: 320,
            }}
          />
          <span className="text-xs text-muted">
            Leave blank to engage the internal simulation engine for offline presentations.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            id="btn-save-ip"
          >
            {saved ? <><CheckCircle2 size={15} /> Saved</> : 'Save & Connect'}
          </button>

          <button
            className="btn btn-ghost"
            onClick={handleTest}
            disabled={!ip.trim() || testState === 'testing'}
            id="btn-test-connection"
          >
            {testState === 'testing' ? (
              <span>Testing Ping…</span>
            ) : (
              <><Wifi size={15} /> Ping /api/data</>
            )}
          </button>

          {getEsp8266Ip() && (
            <button
              className="btn btn-ghost"
              onClick={handleClear}
              id="btn-clear-ip"
              style={{ color: 'var(--red-400)' }}
            >
              <Trash2 size={15} /> Disconnect (Simulation Mode)
            </button>
          )}
        </div>

        {/* Test Result Message */}
        {testState === 'success' && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green-400)', fontSize: '0.82rem', fontWeight: 600 }}>
            <Wifi size={15} /> Controller reachable — /api/data responded successfully
          </div>
        )}
        {testState === 'fail' && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red-400)', fontSize: '0.82rem', fontWeight: 600 }}>
            <WifiOff size={15} /> Unable to reach controller at {ip}. Verify Wi-Fi connectivity.
          </div>
        )}
      </div>

      {/* ─── Irrigation Firmware Thresholds ──────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Irrigation Logic Thresholds</h2>
            <span className="card-subtitle">Autonomous firmware switching parameters</span>
          </div>
          <div className="card-icon-badge">
            <Sliders size={18} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Soil Dry Threshold
            </div>
            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red-400)', marginTop: 4 }}>
              &lt; {SOIL_DRY_THRESHOLD}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Triggers automatic pump activation.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Soil Moist Target
            </div>
            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--green-400)', marginTop: 4 }}>
              ≥ {SOIL_MOIST_THRESHOLD}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Hysteresis cutoff stopping irrigation.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tank Low Threshold
            </div>
            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--amber-400)', marginTop: 4 }}>
              ≤ {TANK_LOW_THRESHOLD}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Switches source from Pump 1 to Pump 2.
            </div>
          </div>
        </div>
      </div>

      {/* ─── Telemetry & Display Parameters ──────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">Telemetry & Polling Engine</h2>
            <span className="card-subtitle">Client-side refresh timings & UI configuration</span>
          </div>
          <div className="card-icon-badge">
            <Palette size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Polling Rate</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Interval between background HTTP GET /api/data requests</div>
            </div>
            <span className="font-mono text-sm" style={{ fontWeight: 600, color: 'var(--water-300)' }}>
              {POLLING_INTERVAL_MS} ms (2.0s)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Visual Interface Theme</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>High-contrast dark IoT monitoring palette</div>
            </div>
            <span className="font-mono text-sm text-secondary">
              EcoRain Deep Navy
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Simulation Engine</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active when no physical ESP8266 IP address is bound</div>
            </div>
            <span className="font-mono text-sm" style={{ color: getEsp8266Ip() ? 'var(--text-muted)' : 'var(--water-400)' }}>
              {getEsp8266Ip() ? 'Inactive (Hardware Bound)' : 'Ready / Active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
