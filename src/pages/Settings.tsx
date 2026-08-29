import { useState } from 'react';
import { Settings, Wifi, WifiOff, Trash2, Cpu, Sliders, Palette, CheckCircle2, Cylinder, AlertCircle, Save } from 'lucide-react';
import { getSystemConfig, saveSystemConfig, clearEsp8266Ip } from '../config/deviceConfig';
import { testConnection } from '../services/esp8266Service';
import { isValidIPv4, sanitizeIpInput } from '../utils/validation';

interface SettingsPageProps {
  onModeChange: () => void;
}

type TestState = 'idle' | 'testing' | 'success' | 'fail';

export function SettingsPage({ onModeChange }: SettingsPageProps) {
  const currentConfig = getSystemConfig();

  // Form states
  const [ip, setIp] = useState(currentConfig.esp8266Ip);
  const [autoModeDefault, setAutoModeDefault] = useState(currentConfig.autoModeDefault);
  const [pollingIntervalMs, setPollingIntervalMs] = useState(currentConfig.pollingIntervalMs);
  const [soilDryThreshold, setSoilDryThreshold] = useState(currentConfig.soilDryThreshold);
  const [soilMoistThreshold, setSoilMoistThreshold] = useState(currentConfig.soilMoistThreshold);
  const [temperatureThreshold, setTemperatureThreshold] = useState(currentConfig.temperatureThreshold);
  const [humidityThreshold, setHumidityThreshold] = useState(currentConfig.humidityThreshold);
  const [tankHeightCm, setTankHeightCm] = useState(currentConfig.tankHeightCm);
  const [sensorOffsetCm, setSensorOffsetCm] = useState(currentConfig.sensorOffsetCm);
  const [minimumUsableLevelPct, setMinimumUsableLevelPct] = useState(currentConfig.minimumUsableLevelPct);

  const [testState, setTestState] = useState<TestState>('idle');
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSaveAll() {
    setValidationError(null);

    // Validate IP if provided
    const cleanIp = sanitizeIpInput(ip);
    if (cleanIp && !isValidIPv4(cleanIp)) {
      setValidationError('Invalid IPv4 address format (e.g. 192.168.1.100)');
      return;
    }

    // Validate thresholds
    if (soilDryThreshold >= soilMoistThreshold) {
      setValidationError('Soil Dry threshold must be strictly less than Soil Moist target (hysteresis requirement)');
      return;
    }

    if (tankHeightCm <= sensorOffsetCm) {
      setValidationError('Tank total height must be greater than sensor offset');
      return;
    }

    saveSystemConfig({
      esp8266Ip: cleanIp,
      autoModeDefault,
      pollingIntervalMs: Number(pollingIntervalMs),
      soilDryThreshold: Number(soilDryThreshold),
      soilMoistThreshold: Number(soilMoistThreshold),
      temperatureThreshold: Number(temperatureThreshold),
      humidityThreshold: Number(humidityThreshold),
      tankHeightCm: Number(tankHeightCm),
      sensorOffsetCm: Number(sensorOffsetCm),
      minimumUsableLevelPct: Number(minimumUsableLevelPct),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    onModeChange();
  }

  function handleClear() {
    clearEsp8266Ip();
    setIp('');
    onModeChange();
  }

  async function handleTest() {
    const cleanIp = sanitizeIpInput(ip);
    if (!cleanIp) return;
    saveSystemConfig({ esp8266Ip: cleanIp });
    setTestState('testing');
    const ok = await testConnection();
    setTestState(ok ? 'success' : 'fail');
    setTimeout(() => setTestState('idle'), 4000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={22} color="var(--water-400)" />
            SYSTEM CONFIGURATION & SETTINGS
          </h1>
          <p className="text-xs text-muted mt-1">
            Network endpoint, autonomous irrigation thresholds, and ultrasonic tank geometry parameters.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSaveAll} id="btn-save-all-settings">
          {saved ? <><CheckCircle2 size={16} /> Configuration Saved</> : <><Save size={16} /> Save All Settings</>}
        </button>
      </div>

      {validationError && (
        <div className="ip-error-text" role="alert">
          <AlertCircle size={15} />
          <span>{validationError}</span>
        </div>
      )}

      {/* ─── SECTION 1: DEVICE NETWORK ───────────────────────────── */}
      <div className="card" style={{ borderTop: '3px solid #38bdf8' }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">1. DEVICE NETWORK (ESP8266 IP)</h2>
            <span className="card-subtitle">Direct HTTP API routing on local Wi-Fi subnet</span>
          </div>
          <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
            <Cpu size={18} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }} htmlFor="input-esp8266-ip-settings">
            ESP8266 IPv4 Address
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              id="input-esp8266-ip-settings"
              type="text"
              placeholder="e.g. 192.168.1.100"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="ip-input-field"
              style={{ maxWidth: 320 }}
            />
            <button
              className="btn btn-ghost"
              onClick={handleTest}
              disabled={!ip.trim() || testState === 'testing'}
              id="btn-test-ping"
            >
              {testState === 'testing' ? <span>Pinging…</span> : <><Wifi size={14} /> Ping Controller</>}
            </button>
            {currentConfig.esp8266Ip && (
              <button
                className="btn btn-ghost"
                onClick={handleClear}
                style={{ color: 'var(--red-400)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <Trash2 size={14} /> Disconnect
              </button>
            )}
          </div>
        </div>

        {testState === 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green-400)', fontSize: '0.82rem', fontWeight: 600 }}>
            <Wifi size={15} /> Controller reachable — /api/data responded successfully
          </div>
        )}
        {testState === 'fail' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red-400)', fontSize: '0.82rem', fontWeight: 600 }}>
            <WifiOff size={15} /> Unable to reach controller at {ip}. Verify same Wi-Fi subnet and CORS.
          </div>
        )}
      </div>

      {/* ─── SECTION 2: IRRIGATION THRESHOLDS ─────────────────────── */}
      <div className="card" style={{ borderTop: '3px solid #22c55e' }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">2. IRRIGATION THRESHOLDS</h2>
            <span className="card-subtitle">Autonomous soil moisture trigger & cutoff parameters</span>
          </div>
          <div className="card-icon-badge" style={{ color: 'var(--green-400)' }}>
            <Sliders size={18} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {/* Soil Dry */}
          <div className="form-field-group">
            <label className="form-field-label">Soil Dry Threshold (%)</label>
            <input
              type="number"
              min={5}
              max={90}
              value={soilDryThreshold}
              onChange={(e) => setSoilDryThreshold(Number(e.target.value))}
              className="form-number-input"
            />
            <span className="text-xs text-muted">Below this %, system flags irrigation required.</span>
          </div>

          {/* Soil Moist Target */}
          <div className="form-field-group">
            <label className="form-field-label">Soil Moist Target (%)</label>
            <input
              type="number"
              min={10}
              max={95}
              value={soilMoistThreshold}
              onChange={(e) => setSoilMoistThreshold(Number(e.target.value))}
              className="form-number-input"
            />
            <span className="text-xs text-muted">At or above this %, system turns off pumps (hysteresis).</span>
          </div>

          {/* Temp High Alert */}
          <div className="form-field-group">
            <label className="form-field-label">Temperature Alert (°C)</label>
            <input
              type="number"
              min={20}
              max={60}
              value={temperatureThreshold}
              onChange={(e) => setTemperatureThreshold(Number(e.target.value))}
              className="form-number-input"
            />
            <span className="text-xs text-muted">Triggers high-temperature warning badge.</span>
          </div>

          {/* Humidity Low Alert */}
          <div className="form-field-group">
            <label className="form-field-label">Dry Air Humidity (%)</label>
            <input
              type="number"
              min={10}
              max={60}
              value={humidityThreshold}
              onChange={(e) => setHumidityThreshold(Number(e.target.value))}
              className="form-number-input"
            />
            <span className="text-xs text-muted">Flags dry ambient air conditions.</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 3: TANK GEOMETRY & CAPACITY ──────────────────── */}
      <div className="card" style={{ borderTop: '3px solid #0ea5e9' }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">3. TANK GEOMETRY & CAPACITIES</h2>
            <span className="card-subtitle">Ultrasonic calibration dimensions & backup switchover level</span>
          </div>
          <div className="card-icon-badge" style={{ color: 'var(--water-400)' }}>
            <Cylinder size={18} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="form-field-group">
            <label className="form-field-label">Tank Total Height (cm)</label>
            <input
              type="number"
              min={10}
              max={500}
              value={tankHeightCm}
              onChange={(e) => setTankHeightCm(Number(e.target.value))}
              className="form-number-input"
            />
            <span className="text-xs text-muted">Physical depth of the rainwater storage tank.</span>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Sensor Offset / Margin (cm)</label>
            <input
              type="number"
              min={0}
              max={50}
              value={sensorOffsetCm}
              onChange={(e) => setSensorOffsetCm(Number(e.target.value))}
              className="form-number-input"
            />
            <span className="text-xs text-muted">Distance from HC-SR04 face to 100% full waterline.</span>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Minimum Usable Level (%)</label>
            <input
              type="number"
              min={5}
              max={50}
              value={minimumUsableLevelPct}
              onChange={(e) => setMinimumUsableLevelPct(Number(e.target.value))}
              className="form-number-input"
            />
            <span className="text-xs text-muted">Switchover threshold from Pump 1 to Pump 2 (Backup).</span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 4: SYSTEM & TELEMETRY ────────────────────────── */}
      <div className="card" style={{ borderTop: '3px solid #a855f7' }}>
        <div className="card-header">
          <div className="card-title-group">
            <h2 className="card-title">4. SYSTEM & POLLING ENGINE</h2>
            <span className="card-subtitle">Default startup mode and background telemetry rate</span>
          </div>
          <div className="card-icon-badge" style={{ color: '#c084fc' }}>
            <Palette size={18} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div className="form-field-group">
            <label className="form-field-label">Telemetry Polling Rate</label>
            <select
              value={pollingIntervalMs}
              onChange={(e) => setPollingIntervalMs(Number(e.target.value))}
              className="form-select-input"
            >
              <option value={1000}>1.0 second (High Frequency)</option>
              <option value={2000}>2.0 seconds (Recommended Standard)</option>
              <option value={5000}>5.0 seconds (Low Bandwidth)</option>
              <option value={10000}>10.0 seconds (Power Saver)</option>
            </select>
            <span className="text-xs text-muted">Interval between GET /api/data requests.</span>
          </div>

          <div className="form-field-group">
            <label className="form-field-label">Default Operating Mode</label>
            <select
              value={autoModeDefault ? 'auto' : 'manual'}
              onChange={(e) => setAutoModeDefault(e.target.value === 'auto')}
              className="form-select-input"
            >
              <option value="auto">Automatic Irrigation (Default)</option>
              <option value="manual">Manual Control Mode</option>
            </select>
            <span className="text-xs text-muted">Initial mode selected on startup.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
