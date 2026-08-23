import { useState, useCallback } from 'react';
import { useEcoRain } from './hooks/useEcoRain';
import { getEsp8266Ip } from './config/deviceConfig';
import { Header } from './components/Header/Header';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { Diagnostics } from './pages/Diagnostics';
import { SettingsPage } from './pages/Settings';
import type { ControlAction } from './types/ecoRain';

type Page = 'dashboard' | 'analytics' | 'diagnostics' | 'settings';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const { state, sendCommand, refreshMode, sessionStats } = useEcoRain();

  const handleCommand = useCallback(
    async (action: ControlAction) => sendCommand(action),
    [sendCommand]
  );

  const handleModeChange = useCallback(() => {
    refreshMode();
  }, [refreshMode]);

  return (
    <div className="app-shell">
      <Header
        connectionStatus={state.connectionStatus}
        ip={getEsp8266Ip()}
        lastUpdated={state.lastUpdated}
        apiResponseMs={state.apiResponseMs}
        isDemoMode={state.isDemoMode}
        activePage={activePage}
        onNavigate={page => setActivePage(page as Page)}
      />

      <main className="page-content" id="main-content" tabIndex={-1}>
        {activePage === 'dashboard' && (
          <Dashboard
            data={state.data}
            connectionStatus={state.connectionStatus}
            isLoading={state.isLoading}
            error={state.error}
            sessionStats={sessionStats}
            history={state.history}
            activityLog={state.activityLog}
            onCommand={handleCommand}
          />
        )}
        {activePage === 'analytics' && (
          <Analytics history={state.history} />
        )}
        {activePage === 'diagnostics' && (
          <Diagnostics
            data={state.data}
            connectionStatus={state.connectionStatus}
            lastUpdated={state.lastUpdated}
            apiResponseMs={state.apiResponseMs}
            isDemoMode={state.isDemoMode}
          />
        )}
        {activePage === 'settings' && (
          <SettingsPage onModeChange={handleModeChange} />
        )}
      </main>
    </div>
  );
}
