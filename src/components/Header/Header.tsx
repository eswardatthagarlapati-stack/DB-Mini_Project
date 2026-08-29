import { Droplets, Clock, Settings, Wifi, Sparkles, BookOpen, Activity, BarChart2 } from 'lucide-react';
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
  onOpenConnectModal?: () => void;
  onOpenDemoModal?: () => void;
}

const NAV_LINKS = [
  { id: 'dashboard',   label: 'Dashboard',   icon: Activity },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart2 },
  { id: 'hardware',    label: 'Hardware & API', icon: BookOpen },
  { id: 'settings',    label: 'Settings',    icon: Settings },
];

export function Header({
  connectionStatus,
  ip,
  lastUpdated,
  apiResponseMs,
  activePage,
  onNavigate,
  onOpenConnectModal,
  onOpenDemoModal,
}: HeaderProps) {
  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        {/* Left: Brand Logo & Exact Subtitle */}
        <div className="header-brand-group">
          <a
            className="brand-logo"
            href="#dashboard"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('dashboard');
            }}
            aria-label="Smart Irrigation Platform"
          >
            <div className="brand-icon-gradient">
              <Droplets size={20} strokeWidth={2.5} />
            </div>
            <div className="brand-text-container">
              <span className="brand-title">SMART IRRIGATION</span>
              <span className="brand-subtitle">Rainwater Harvesting & Automatic Irrigation</span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="desktop-nav" role="navigation" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                className={`nav-item${activePage === link.id ? ' active' : ''}`}
                onClick={() => onNavigate(link.id)}
                role="menuitem"
                aria-current={activePage === link.id ? 'page' : undefined}
                id={`nav-${link.id}`}
              >
                <Icon size={14} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Telemetry & ESP8266 Connection Badge */}
        <div className="header-telemetry">
          {/* Demo Mode Quick Launcher */}
          <button
            className={`header-action-btn ${connectionStatus === 'demo' ? 'demo-active' : ''}`}
            onClick={onOpenDemoModal}
            title="Open Demo & Presentation Simulator"
            aria-label="Demo Simulator"
          >
            <Sparkles size={14} />
            <span className="hide-mobile">Demo Simulator</span>
          </button>

          {/* Device Connection Button */}
          <button
            className="header-action-btn"
            onClick={onOpenConnectModal}
            title="Configure ESP8266 IP Connection"
            aria-label="Connection Settings"
          >
            <Wifi size={14} />
            <span className="hide-mobile">Connect ESP8266</span>
          </button>

          {/* Telemetry Last Update Clock */}
          {lastUpdated && (
            <div className="telemetry-meta hide-mobile" title="Last successful data refresh">
              <Clock size={12} className="pulse-icon" />
              <span>{formatTimeSince(lastUpdated)}</span>
              {connectionStatus === 'connected' && apiResponseMs !== null && (
                <span>· {apiResponseMs}ms</span>
              )}
            </div>
          )}

          {/* Primary Connection Status Badge */}
          <ConnectionStatusBadge status={connectionStatus} ip={ip} />
        </div>
      </div>
    </header>
  );
}
