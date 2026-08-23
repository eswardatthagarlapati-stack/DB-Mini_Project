import { Droplets, Zap } from 'lucide-react';
import type { ConnectionStatus } from '../../types/ecoRain';
import { ConnectionStatusBadge } from '../ConnectionStatus/ConnectionStatusBadge';
import { formatTimeSince } from '../../utils/formatters';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  ip: string;
  lastUpdated: Date | null;
  apiResponseMs: number | null;
  isDemoMode: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_LINKS = [
  { id: 'dashboard',   label: 'Dashboard' },
  { id: 'analytics',  label: 'Analytics' },
  { id: 'diagnostics',label: 'Diagnostics' },
  { id: 'settings',   label: 'Settings' },
];

export function Header({
  connectionStatus, ip, lastUpdated, apiResponseMs, isDemoMode, activePage, onNavigate
}: HeaderProps) {
  return (
    <nav className="app-nav" role="navigation" aria-label="Main navigation">
      <div className="nav-inner">
        {/* Logo */}
        <a className="nav-logo" href="#" onClick={e => { e.preventDefault(); onNavigate('dashboard'); }} aria-label="EcoRain Home">
          <div className="nav-logo-icon">
            <Droplets size={20} color="white" strokeWidth={2.5} />
          </div>
          <span className="nav-logo-text">EcoRain</span>
        </a>

        {/* Nav Links */}
        <div className="nav-links" role="menubar">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              className={`nav-link${activePage === link.id ? ' active' : ''}`}
              onClick={() => onNavigate(link.id)}
              role="menuitem"
              aria-current={activePage === link.id ? 'page' : undefined}
              id={`nav-${link.id}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="nav-right">
          {lastUpdated && (
            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={11} style={{ color: 'var(--primary-400)' }} />
              {formatTimeSince(lastUpdated)}
              {apiResponseMs !== null && (
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>· {apiResponseMs}ms</span>
              )}
            </span>
          )}

          {isDemoMode && (
            <span style={{
              background: 'rgba(0,180,216,0.12)',
              color: 'var(--primary-300)',
              border: '1px solid rgba(0,180,216,0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '3px 10px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              DEMO
            </span>
          )}

          <ConnectionStatusBadge status={connectionStatus} ip={ip} />
        </div>
      </div>
    </nav>
  );
}
