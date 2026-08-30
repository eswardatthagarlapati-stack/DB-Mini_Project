import { useCallback, useEffect } from 'react';
import { useEcoRain } from './hooks/useEcoRain';
import { AppHeader } from './components/Header/AppHeader';
import { Dashboard } from './pages/Dashboard';
import type { ControlAction } from './types/ecoRain';
import { CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { applyTheme, getSavedTheme } from './utils/theme';

interface Toast { id: string; type: 'success' | 'error'; message: string; }

export default function App() {
  const { state, sendCommand, refreshMode, sessionStats } = useEcoRain();
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply saved theme on mount
  useEffect(() => {
    applyTheme(getSavedTheme());
  }, []);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const handleCommand = useCallback(async (action: ControlAction) => {
    const ok = await sendCommand(action);
    const labels: Record<ControlAction, string> = {
      auto:      'Automatic mode enabled',
      manual:    'Manual mode enabled',
      pump1_on:  'Pump 1 turned ON',
      pump1_off: 'Pump 1 turned OFF',
      pump2_on:  'Pump 2 turned ON',
      pump2_off: 'Pump 2 turned OFF',
      all_off:   'All pumps stopped',
    };
    if (ok) showToast('success', labels[action]);
    else    showToast('error', `Command failed: ${action}`);
    return ok;
  }, [sendCommand, showToast]);

  return (
    <div className="app-shell">
      {/* Sticky Header */}
      <AppHeader
        connectionStatus={state.connectionStatus}
        ip={state.isDemoMode ? undefined : (state.data ? undefined : undefined)}
      />

      {/* Main Content */}
      <main className="page-content" id="main-content" tabIndex={-1}>
        <Dashboard
          data={state.data}
          connectionStatus={state.connectionStatus}
          isLoading={state.isLoading}
          error={state.error}
          lastUpdated={state.lastUpdated}
          apiResponseMs={state.apiResponseMs}
          sessionStats={sessionStats}
          history={state.history}
          activityLog={state.activityLog}
          onCommand={handleCommand}
          onIpChanged={refreshMode}
        />
      </main>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="toast-shelf" role="status" aria-live="polite">
          {toasts.map(t => (
            <div key={t.id} className="toast-item">
              {t.type === 'success'
                ? <CheckCircle size={16} color="var(--green)" style={{ flexShrink: 0 }} />
                : <XCircle    size={16} color="var(--red)"   style={{ flexShrink: 0 }} />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
