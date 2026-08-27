import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { BarChart2, Info, Calendar } from 'lucide-react';
import type { HistoryPoint } from '../types/ecoRain';
import { formatTime } from '../utils/formatters';
import { SOIL_DRY_THRESHOLD, SOIL_MOIST_THRESHOLD, TANK_LOW_THRESHOLD } from '../config/deviceConfig';

interface AnalyticsProps {
  history: HistoryPoint[];
}

type TimeRange = '1h' | '6h' | '24h' | 'all';

const tooltipStyle = {
  background: '#0a1526',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: '0.8rem',
  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
};
const gridStyle = { stroke: 'rgba(148, 163, 184, 0.08)', strokeDasharray: '3 3' };
const axisStyle = { fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' };

function TechnicalChart({
  title, dataKey, data, color, domain, unit, refLines
}: {
  title: string;
  dataKey: string;
  data: Array<{ time: string; [k: string]: number | string }>;
  color: string;
  domain?: [number, number] | ['auto', 'auto'];
  unit?: string;
  refLines?: { value: number; label: string; color: string }[];
}) {
  return (
    <div className="card" role="region" aria-label={`${title} telemetry analysis`}>
      <div className="card-header">
        <div className="card-title-group">
          <h3 className="card-title">{title}</h3>
          <span className="card-subtitle">Continuous session monitoring {unit ? `(${unit})` : ''}</span>
        </div>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} aria-hidden="true" />
      </div>

      <div style={{ height: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="time" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={34} domain={domain ?? ['auto', 'auto']} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ${unit ?? ''}`, title]} />
            {refLines?.map(r => (
              <ReferenceLine
                key={r.value}
                y={r.value}
                stroke={r.color}
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{ value: r.label, position: 'insideTopRight', fill: r.color, fontSize: 9, fontFamily: 'JetBrains Mono' }}
              />
            ))}
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Analytics({ history }: AnalyticsProps) {
  const [range, setRange] = useState<TimeRange>('all');

  const filteredHistory = useMemo(() => {
    if (history.length === 0) return [];
    if (range === 'all') return history;

    const now = Date.now();
    const rangeMs = range === '1h' ? 3600 * 1000 : range === '6h' ? 6 * 3600 * 1000 : 24 * 3600 * 1000;
    const cutoff = now - rangeMs;
    return history.filter(p => p.timestamp >= cutoff);
  }, [history, range]);

  const chartPoints = useMemo(() => {
    return filteredHistory.map(p => ({
      time: formatTime(new Date(p.timestamp)),
      temperature: p.temperature,
      humidity: p.humidity,
      soilMoisture: p.soilMoisture,
      waterLevel: p.waterLevel,
    }));
  }, [filteredHistory]);

  const hasData = chartPoints.length >= 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={20} color="var(--water-400)" />
            Telemetry Analytics
          </h1>
          <p className="text-xs text-muted mt-1">
            Real-time sensory trends & historical telemetry profiles.
          </p>
        </div>

        {/* Time range tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {(['1h', '6h', '24h', 'all'] as TimeRange[]).map(r => (
            <button
              key={r}
              className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '4px 12px', minHeight: 32, fontSize: '0.75rem' }}
              onClick={() => setRange(r)}
            >
              {r === 'all' ? 'All Session' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Session History Disclaimer Banner */}
      <div
        style={{
          background: 'rgba(56, 189, 248, 0.06)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.8rem',
          color: 'var(--water-300)',
        }}
      >
        <Info size={16} style={{ flexShrink: 0 }} />
        <span>
          <strong>Session History Notice:</strong> Historical telemetry is aggregated in-browser memory for this active session ({chartPoints.length} points). The ESP8266 controller does not maintain long-term persistent storage on-chip.
        </span>
      </div>

      {!hasData ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <Calendar size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>Collecting Initial Telemetry Data</h3>
          <p className="text-xs text-muted" style={{ maxWidth: 400, margin: '0 auto' }}>
            The charts will populate once at least 2 telemetry readings are received from the controller polling loop.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          <TechnicalChart
            title="Temperature Profile"
            dataKey="temperature"
            data={chartPoints}
            color="var(--water-400)"
            unit="°C"
          />
          <TechnicalChart
            title="Relative Humidity"
            dataKey="humidity"
            data={chartPoints}
            color="var(--green-400)"
            unit="%"
            domain={[0, 100]}
          />
          <TechnicalChart
            title="Soil Moisture Saturation"
            dataKey="soilMoisture"
            data={chartPoints}
            color="var(--amber-400)"
            unit="%"
            domain={[0, 100]}
            refLines={[
              { value: SOIL_DRY_THRESHOLD,  label: `Dry Trigger (${SOIL_DRY_THRESHOLD}%)`, color: 'var(--red-400)' },
              { value: SOIL_MOIST_THRESHOLD, label: `Moist Target (${SOIL_MOIST_THRESHOLD}%)`, color: 'var(--green-400)' },
            ]}
          />
          <TechnicalChart
            title="Rainwater Reservoir Level"
            dataKey="waterLevel"
            data={chartPoints}
            color="#c084fc"
            unit="%"
            domain={[0, 100]}
            refLines={[
              { value: TANK_LOW_THRESHOLD, label: `Low Switchover (${TANK_LOW_THRESHOLD}%)`, color: 'var(--amber-400)' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
