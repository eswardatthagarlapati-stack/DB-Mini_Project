import type { ConnectionStatus } from '../../types/ecoRain';

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  ip?: string;
}

export function ConnectionStatusBadge({ status, ip }: ConnectionStatusBadgeProps) {
  const map = {
    connected:  { cls: 'badge-connected',  dot: 'dot-green',  label: 'ESP8266 Connected', pulse: true },
    connecting: { cls: 'badge-connecting', dot: 'dot-amber',  label: 'Connecting…',       pulse: true },
    offline:    { cls: 'badge-offline',    dot: 'dot-red',    label: 'ESP8266 Offline',   pulse: false },
    demo:       { cls: 'badge-demo',       dot: 'dot-cyan',   label: 'Demo Mode',         pulse: false },
  };

  const cfg = map[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span className={`badge ${cfg.cls}`}>
        <span className={`dot ${cfg.dot}${cfg.pulse ? ' dot-pulse' : ''}`} />
        {cfg.label}
      </span>
      {ip && status === 'connected' && (
        <span className="text-xs text-muted font-mono">{ip}</span>
      )}
    </div>
  );
}
