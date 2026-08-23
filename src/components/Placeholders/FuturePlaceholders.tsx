import { Cloud, Sparkles } from 'lucide-react';

export function WeatherPlaceholder() {
  return (
    <div className="card card-purple animate-in" role="region" aria-label="Weather Intelligence - Coming Soon">
      <div className="flex items-center gap-2 mb-3">
        <Cloud size={18} color="var(--purple-300)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-300)' }}>
          Weather Intelligence
        </h2>
        <span className="coming-soon-banner" style={{ marginLeft: 'auto' }}>
          <Sparkles size={10} />
          Coming Soon
        </span>
      </div>
      <p className="text-sm text-muted mb-4">
        Future integration with a real weather API will enable rain-probability-based irrigation decisions.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, opacity: 0.4 }}>
        {['Rain Probability', 'Forecast', 'Temperature Forecast', 'Rain Expected'].map(f => (
          <div key={f} style={{
            background: 'rgba(168,85,247,0.08)',
            border: '1px dashed rgba(168,85,247,0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--purple-300)', fontWeight: 600, marginBottom: 4 }}>{f}</div>
            <div style={{ fontSize: '1rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>—</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIPlaceholder() {
  return (
    <div className="card card-purple animate-in" role="region" aria-label="AI Features - Coming Soon">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} color="var(--purple-300)" />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--purple-300)' }}>
          AI Features
        </h2>
        <span className="coming-soon-banner" style={{ marginLeft: 'auto' }}>
          <Sparkles size={10} />
          Coming Soon
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          'AI Irrigation Prediction',
          'Water Optimization',
          'Leak Detection',
          'Garden Health Analysis',
        ].map(feat => (
          <div key={feat} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: 0.45, fontSize: '0.85rem', color: 'var(--text-secondary)',
            padding: '8px 12px',
            background: 'rgba(168,85,247,0.06)',
            border: '1px dashed rgba(168,85,247,0.15)',
            borderRadius: 'var(--radius-md)',
          }}>
            <Sparkles size={12} color="var(--purple-300)" />
            {feat}
          </div>
        ))}
      </div>
    </div>
  );
}
