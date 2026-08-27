import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Activity } from 'lucide-react';
import type { HistoryPoint } from '../../types/ecoRain';
import { formatTime } from '../../utils/formatters';

interface SensorChartsProps {
  history: HistoryPoint[];
}

const CHART_THEME = {
  temperature:  '#38bdf8',
  humidity:     '#4ade80',
  soilMoisture: '#f59e0b',
  waterLevel:   '#a78bfa',
};

const tooltipStyle = {
  background: '#0a1526',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: '0.78rem',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
};

const gridStyle = { stroke: 'rgba(148, 163, 184, 0.08)', strokeDasharray: '3 3' };
const axisStyle = { fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' };

function MiniTelemetryChart({
  title, dataKey, data, stroke, unit, domain
}: {
  title: string;
  dataKey: string;
  data: Array<{ time: string; [k: string]: number | string }>;
  stroke: string;
  unit: string;
  domain?: [number, number] | ['auto', 'auto'];
}) {
  return (
    <div style={{ background: 'var(--bg-surface)', padding: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <span style={{ fontSize: '0.7rem', color: stroke, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {unit}
        </span>
      </div>
      <div style={{ height: 130 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="time" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={28} domain={domain ?? ['auto', 'auto']} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ${unit}`, title]} />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function SensorCharts({ history }: SensorChartsProps) {
  const data = history.map(p => ({
    time: formatTime(new Date(p.timestamp)),
    temperature: p.temperature,
    humidity: p.humidity,
    soilMoisture: p.soilMoisture,
    waterLevel: p.waterLevel,
  }));

  const hasData = data.length >= 2;

  return (
    <div className="card" role="region" aria-label="Live Sensor Analytics">
      <div className="card-header">
        <div className="card-title-group">
          <h2 className="card-title">Live Sensor Telemetry</h2>
          <span className="card-subtitle">Real-time session trend analysis ({data.length} telemetry points)</span>
        </div>
        <div className="card-icon-badge">
          <Activity size={18} />
        </div>
      </div>

      {!hasData ? (
        <div style={{
          height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: '0.82rem',
          border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
        }}>
          Accumulating initial sensor readings…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          <MiniTelemetryChart
            title="Temperature"
            dataKey="temperature"
            data={data}
            stroke={CHART_THEME.temperature}
            unit="°C"
          />
          <MiniTelemetryChart
            title="Humidity"
            dataKey="humidity"
            data={data}
            stroke={CHART_THEME.humidity}
            unit="%"
            domain={[0, 100]}
          />
          <MiniTelemetryChart
            title="Soil Moisture"
            dataKey="soilMoisture"
            data={data}
            stroke={CHART_THEME.soilMoisture}
            unit="%"
            domain={[0, 100]}
          />
          <MiniTelemetryChart
            title="Tank Level"
            dataKey="waterLevel"
            data={data}
            stroke={CHART_THEME.waterLevel}
            unit="%"
            domain={[0, 100]}
          />
        </div>
      )}
    </div>
  );
}
