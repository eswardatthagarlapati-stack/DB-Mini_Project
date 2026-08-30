import { Droplets, Sun, Moon, Monitor, Sparkles, Activity, BarChart2, BookOpen, Settings } from 'lucide-react';
import type { ConnectionStatus } from '../../types/ecoRain';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  ip: string;
  lastUpdated?: Date | null;
  apiResponseMs?: number | null;
  activePage: string;
  onNavigate: (page: string) => void;
  onOpenConnectModal?: () => void;
  onOpenDemoModal?: () => void;
}

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'hardware', label: 'Hardware', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Header({
  connectionStatus,
  ip,
  activePage,
  onNavigate,
  onOpenDemoModal,
}: HeaderProps) {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        {/* Left: Brand Logo & Subtitle */}
        <a
          className="header-brand"
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('dashboard');
          }}
          aria-label="Smart Irrigation Dashboard"
        >
          <div className="header-brand-icon">
            <Droplets size={22} strokeWidth={2.2} />
          </div>
          <div>
            <span className="header-brand-title">💧 Smart Irrigation</span>
            <span className="header-brand-subtitle">Rainwater harvesting & automatic irrigation</span>
          </div>
        </a>

        {/* Center: Desktop Navigation */}
        <nav className="nav-tabs hide-mobile" role="navigation" aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(link.id)}
                aria-current={isActive ? 'page' : undefined}
                id={`nav-${link.id}`}
              >
                <Icon size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: '-1px' }} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Connection Badge, Theme Switcher & Actions */}
        <div className="header-right">
          {/* Connection Status Badge */}
          <div
            className={`status-badge ${
              connectionStatus === 'connected'
                ? 'connected'
                : connectionStatus === 'demo'
                ? 'demo'
                : connectionStatus === 'connecting'
                ? 'connecting'
                : 'disconnected'
            }`}
            title={ip ? `ESP8266 IP: ${ip}` : 'No IP Configured'}
          >
            <span
              className={`status-dot ${
                connectionStatus === 'connected'
                  ? 'green'
                  : connectionStatus === 'demo'
                  ? 'blue'
                  : connectionStatus === 'connecting'
                  ? 'orange'
                  : 'red'
              }`}
            />
            <span>
              {connectionStatus === 'connected'
                ? 'ESP8266 Connected'
                : connectionStatus === 'demo'
                ? 'Demo Simulation'
                : connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'ESP8266 Disconnected'}
            </span>
          </div>

          {/* Quick Demo Simulator button */}
          {onOpenDemoModal && (
            <button
              className="btn btn-outline btn-sm hide-mobile"
              onClick={onOpenDemoModal}
              title="Open Simulator Controls"
              aria-label="Open Demo Simulator"
            >
              <Sparkles size={14} />
              <span>Demo</span>
            </button>
          )}

          {/* Theme Switcher: Light / Dark / System */}
          <div className="theme-switcher" role="radiogroup" aria-label="Select Theme">
            <button
              type="button"
              className={`theme-btn ${themeMode === 'light' ? 'active' : ''}`}
              onClick={() => setThemeMode('light')}
              title="Light Theme"
              aria-label="Light Theme"
            >
              <Sun size={15} />
            </button>
            <button
              type="button"
              className={`theme-btn ${themeMode === 'dark' ? 'active' : ''}`}
              onClick={() => setThemeMode('dark')}
              title="Dark Theme"
              aria-label="Dark Theme"
            >
              <Moon size={15} />
            </button>
            <button
              type="button"
              className={`theme-btn ${themeMode === 'system' ? 'active' : ''}`}
              onClick={() => setThemeMode('system')}
              title="System Theme"
              aria-label="System Theme"
            >
              <Monitor size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
