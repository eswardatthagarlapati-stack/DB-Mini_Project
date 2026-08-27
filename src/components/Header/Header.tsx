import { Droplets, Clock } from 'lucide-react';
import type { ConnectionStatus } from '../../types/ecoRain';
import { ConnectionStatusBadge } from '../ConnectionStatus/ConnectionStatusBadge';
import { formatTimeSince } from '../../utils/formatters';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  ip: string;
  lastUpdated: Date | null;
  apiResponseMs: number | null;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: 'dashboard',   label: 'Dashboard' },
  { id: 'analytics',   label: 'Analytics' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'settings',    label: 'Settings' },
];

export function Header({
  connectionStatus, ip, lastUpdated, apiResponseMs, activePage, onNavigate
}: HeaderProps) {
  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        {/* Left: Brand Logo */}
        <a
          className="brand-logo"
          href="#dashboard"
          onClick={e => { e.preventDefault(); onNavigate('dashboard'); }}
          aria-label="EcoRain Platform"
        >
          <div className="brand-icon">
            <Droplets size={18} strokeWidth={2.5} />
          </div>
          <span className="brand-title">EcoRain</span>
        </a>

        {/* Center: Desktop Navigation */}
        <nav className="desktop-nav" role="navigation" aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              className={`nav-item${activePage === link.id ? ' active' : ''}`}
              onClick={() => onNavigate(link.id)}
              role="menuitem"
              aria-current={activePage === link.id ? 'page' : undefined}
              id={`nav-${link.id}`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Telemetry & Hardware Status */}
        <div className="header-telemetry">
          {lastUpdated && (
            <div className="telemetry-meta" title="Last successful data refresh">
              <Clock size={12} className="pulse-icon" />
              <span>{formatTimeSince(lastUpdated)}</span>
              {connectionStatus === 'connected' && apiResponseMs !== null && (
                <span>· {apiResponseMs}ms</span>
              )}
            </div>
          )}

          <ConnectionStatusBadge status={connectionStatus} ip={ip} />
        </div>
      </div>
    </header>
  );
}
