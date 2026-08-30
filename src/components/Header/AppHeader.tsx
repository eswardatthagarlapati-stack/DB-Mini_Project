import { useState, useEffect } from 'react';
import { Droplets, Sun, Moon, Monitor } from 'lucide-react';
import type { ConnectionStatus } from '../../types/ecoRain';
import { getSavedTheme, saveTheme, applyTheme, type ThemeMode } from '../../utils/theme';

interface AppHeaderProps {
  connectionStatus: ConnectionStatus;
  ip?: string;
}

const STATUS_CONFIG = {
  connected:  { label: 'ESP8266 Connected',    dot: 'connected',  pillCls: 'connected' },
  connecting: { label: 'Connecting...',         dot: 'connecting', pillCls: 'connecting' },
  offline:    { label: 'ESP8266 Disconnected',  dot: 'offline',    pillCls: 'offline' },
  demo:       { label: 'Demo Mode',             dot: 'demo',       pillCls: 'demo' },
};

const THEME_OPTIONS: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
  { value: 'light',  icon: <Sun size={13} />,     label: 'Light' },
  { value: 'dark',   icon: <Moon size={13} />,    label: 'Dark' },
  { value: 'system', icon: <Monitor size={13} />, label: 'System' },
];

export function AppHeader({ connectionStatus, ip }: AppHeaderProps) {
  const [theme, setTheme] = useState<ThemeMode>(getSavedTheme);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    // Listen for system theme changes when mode = system
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  function handleTheme(t: ThemeMode) {
    saveTheme(t);
    setTheme(t);
    applyTheme(t);
    setShowThemeMenu(false);
  }

  const cfg = STATUS_CONFIG[connectionStatus];
  const currentTheme = THEME_OPTIONS.find(o => o.value === theme)!;

  return (
    <header className="site-header" role="banner">
      <div className="site-header-inner">
        {/* Brand */}
        <div className="header-brand">
          <div className="header-brand-icon" aria-hidden="true">
            <Droplets size={20} />
          </div>
          <div className="header-brand-text">
            <span className="header-brand-name">Smart Irrigation</span>
            <span className="header-brand-sub">Rainwater harvesting &amp; automatic irrigation</span>
          </div>
        </div>

        {/* Right: status + theme */}
        <div className="header-right">
          {/* Connection status */}
          <div className={`status-pill ${cfg.pillCls}`} aria-live="polite" aria-label={`Connection: ${cfg.label}`}>
            <span className={`status-dot ${cfg.dot}`} aria-hidden="true" />
            {cfg.label}
            {ip && connectionStatus === 'connected' && (
              <span style={{ fontWeight: 400, opacity: 0.7, fontSize: '0.72rem' }}>{ip}</span>
            )}
          </div>

          {/* Theme switcher */}
          <div style={{ position: 'relative' }}>
            <button
              className="theme-btn"
              onClick={() => setShowThemeMenu(v => !v)}
              aria-label="Change color theme"
              aria-expanded={showThemeMenu}
              id="btn-theme-toggle"
            >
              {currentTheme.icon}
              <span className="hide-mobile">{currentTheme.label}</span>
            </button>

            {showThemeMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setShowThemeMenu(false)}
                />
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '6px',
                  boxShadow: 'var(--shadow-lg)', zIndex: 20,
                  minWidth: 130,
                }}>
                  {THEME_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleTheme(opt.value)}
                      id={`btn-theme-${opt.value}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '7px 10px', border: 'none',
                        background: theme === opt.value ? 'var(--brand-light)' : 'transparent',
                        color: theme === opt.value ? 'var(--brand-text)' : 'var(--text-secondary)',
                        borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontSize: '0.85rem', fontWeight: theme === opt.value ? 600 : 400,
                        fontFamily: 'var(--font)',
                        transition: 'background var(--t-fast)',
                      }}
                    >
                      {opt.icon} {opt.label}
                      {theme === opt.value && <span style={{ marginLeft: 'auto' }}>✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`.hide-mobile { display: inline; } @media (max-width: 480px) { .hide-mobile { display: none; } }`}</style>
    </header>
  );
}
