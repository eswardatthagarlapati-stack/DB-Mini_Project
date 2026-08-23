import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import type { HistoryPoint } from '../types/ecoRain';
import { formatTime } from '../utils/formatters';
import { SOIL_DRY_THRESHOLD, SOIL_MOIST_THRESHOLD, TANK_LOW_THRESHOLD } from '../config/deviceConfig';

interface AnalyticsProps {
  history: HistoryPoint[];
}

const tooltipStyle = {
  background: '#0b1a30',
  border: '1px solid rgba(0,180,216,0.25)',
  borderRadius: 8,
  color: '#e8f4f8',
  fontSize: '0.8rem',
};
const gridStyle  = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 3' };
const axisStyle  = { fill: '#4a7a94', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };

function LargeChart({
  title, dataKey, data, color, domain, unit,
  refLines
}: {
  title: string;
  dataKey: string;
  data: object[];
  color: string;
  domain?: [number, number] | ['auto', 'auto'];
  unit?: string;
  refLines?: { value: number; label: string; color: string }[];
}) {
  return (
    <div className="card animate-in" role="region" aria-label={`${title} chart`}>
      <div className="flex items-center gap-2 mb-4">
        <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} aria-hidden="true" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700 }}>
          {title}
        </h3>
        {unit && <span className="text-xs text-muted">({unit})</span>}
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="time" tick={axisStyle} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={36} domain={domain ?? ['auto', 'auto']} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}${unit ?? ''}`, title]} />
            {refLines?.map(r => (
              <ReferenceLine
                key={r.value}
                y={r.value}
                stroke={r.color}
                strokeDasharray="4 4"
                strokeOpacity={0.7}
                label={{ value: r.label, position: 'insideTopRight', fill: r.color, fontSize: 10 }}
              />
            ))}
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function Analytics({ history }: AnalyticsProps) {
  const data = history.map(p => ({
    time: formatTime(new Date(p.timestamp)),
    temperature: p.temperature,
    humidity: p.humidity,
    soilMoisture: p.soilMoisture,
    waterLevel: p.waterLevel,
  }));

  const noData = data.length < 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={20} color="var(--primary-400)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>Analytics</h1>
        </div>
        <p className="text-sm text-muted">Session history — data collected since dashboard opened. Not permanent database records.</p>
      </div>

      <div style={{
        background: 'rgba(0,180,216,0.06)',
        border: '1px solid rgba(0,180,216,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 16px',
        fontSize: '0.8rem',
        color: 'var(--primary-300)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span>ℹ</span>
        <span>
          The ESP8266 does not expose a historical data API. Charts show in-browser session data only ({data.length} points collected).
        </span>
      </div>

      {noData ? (
        <div style={{
          height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)',
          color: 'var(--text-muted)',
        }}>
          Collecting data… please wait for at least 2 sensor readings.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <LargeChart
            title="Temperature" dataKey="temperature" data={data}
            color="var(--primary-400)" unit="°C"
          />
          <LargeChart
            title="Humidity" dataKey="humidity" data={data}
            color="var(--green-400)" domain={[0, 100]} unit="%"
          />
          <LargeChart
            title="Soil Moisture" dataKey="soilMoisture" data={data}
            color="var(--amber-400)" domain={[0, 100]} unit="%"
            refLines={[
              { value: SOIL_DRY_THRESHOLD,   label: `Dry (${SOIL_DRY_THRESHOLD}%)`,   color: 'var(--amber-400)' },
              { value: SOIL_MOIST_THRESHOLD,  label: `Moist (${SOIL_MOIST_THRESHOLD}%)`, color: 'var(--green-400)' },
            ]}
          />
          <LargeChart
            title="Tank Level" dataKey="waterLevel" data={data}
            color="var(--purple-300)" domain={[0, 100]} unit="%"
            refLines={[
              { value: TANK_LOW_THRESHOLD, label: `Low (${TANK_LOW_THRESHOLD}%)`, color: 'var(--amber-400)' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
