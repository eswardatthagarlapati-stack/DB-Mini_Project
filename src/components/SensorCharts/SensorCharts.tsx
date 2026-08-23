import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import type { HistoryPoint } from '../../types/ecoRain';
import type { ReactNode } from 'react';
import { formatTime } from '../../utils/formatters';

interface SensorChartsProps {
  history: HistoryPoint[];
}

const CHART_COLORS = {
  temperature:  '#22d3ee',
  humidity:     '#4ade80',
  soilMoisture: '#fbbf24',
  waterLevel:   '#a78bfa',
};

function chartData(history: HistoryPoint[]) {
  return history.map(p => ({
    time: formatTime(new Date(p.timestamp)),
    temperature: p.temperature,
    humidity: p.humidity,
    soilMoisture: p.soilMoisture,
    waterLevel: p.waterLevel,
  }));
}

const tooltipStyle = {
  background: '#0b1a30',
  border: '1px solid rgba(0,180,216,0.25)',
  borderRadius: 8,
  color: '#e8f4f8',
  fontSize: '0.8rem',
};

const gridStyle = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 3' };
const axisStyle = { fill: '#4a7a94', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };

function ChartSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>{title}</p>
      <div style={{ height: 160 }}>
        {children}
      </div>
    </div>
  );
}

export function SensorCharts({ history }: SensorChartsProps) {
  const data = chartData(history);

  const noData = data.length < 2;

  return (
    <div className="card animate-in" style={{ gridColumn: '1 / -1' }} role="region" aria-label="Session History Charts">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={18} color="var(--primary-400)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700 }}>
          Live Sensor Analytics
        </h2>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          background: 'var(--bg-elevated)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
        }}>
          Session History — {data.length} pts
        </span>
      </div>

      {noData ? (
        <div style={{
          height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: '0.875rem',
          border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
        }}>
          Collecting data… charts will appear after a few readings.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          <ChartSection title="Temperature (°C)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="time" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={32} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="temperature" stroke={CHART_COLORS.temperature} strokeWidth={2} dot={false} name="°C" />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="Humidity (%)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="time" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="humidity" stroke={CHART_COLORS.humidity} strokeWidth={2} dot={false} name="%" />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="Soil Moisture (%)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="time" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="soilMoisture" stroke={CHART_COLORS.soilMoisture} strokeWidth={2} dot={false} name="%" />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="Tank Level (%)">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid {...gridStyle} />
                <XAxis dataKey="time" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={32} domain={[0, 100]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="waterLevel" stroke={CHART_COLORS.waterLevel} strokeWidth={2} dot={false} name="%" />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>
        </div>
      )}
    </div>
  );
}
