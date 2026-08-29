import type { ConnectionStatus } from '../../types/ecoRain';

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  ip?: string;
  onClick?: () => void;
}

export function ConnectionStatusBadge({ status, ip, onClick }: ConnectionStatusBadgeProps) {
  if (status === 'connected') {
    return (
      <button
        className="conn-badge connected"
        title={ip ? `Connected to ${ip}` : 'ESP8266 Connected'}
        onClick={onClick}
        aria-label="ESP8266 Connected"
      >
        <span className="status-dot green pulse" />
        <span>● ESP8266 Connected</span>
      </button>
    );
  }

  if (status === 'connecting') {
    return (
      <button
        className="conn-badge connecting"
        title="Attempting to reach ESP8266..."
        onClick={onClick}
        aria-label="ESP8266 Connecting"
      >
        <span className="status-dot amber" />
        <span>● Connecting…</span>
      </button>
    );
  }

  if (status === 'demo') {
    return (
      <button
        className="conn-badge demo"
        title="Demo Simulation Mode active"
        onClick={onClick}
        aria-label="Demo Simulation"
      >
        <span className="status-dot sky" />
        <span>● Demo Simulation</span>
      </button>
    );
  }

  // Offline / Disconnected
  return (
    <button
      className="conn-badge offline"
      title="ESP8266 Disconnected — Check IP / Wi-Fi"
      onClick={onClick}
      aria-label="ESP8266 Disconnected"
    >
      <span className="status-dot red" />
      <span>● ESP8266 Disconnected</span>
    </button>
  );
}
