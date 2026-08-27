import type { ConnectionStatus } from '../../types/ecoRain';

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  ip?: string;
}

export function ConnectionStatusBadge({ status, ip }: ConnectionStatusBadgeProps) {
  // If status is demo, render as subtle Offline status in header as requested
  if (status === 'connected') {
    return (
      <div className="conn-badge connected" title={ip ? `Connected to ${ip}` : 'ESP8266 Connected'}>
        <span className="status-dot green" />
        <span>ESP8266 Connected</span>
      </div>
    );
  }

  if (status === 'connecting') {
    return (
      <div className="conn-badge connecting">
        <span className="status-dot amber" />
        <span>Connecting…</span>
      </div>
    );
  }

  // Offline / Demo
  return (
    <div className="conn-badge offline" title="No hardware connected">
      <span className="status-dot gray" />
      <span>Offline</span>
    </div>
  );
}
