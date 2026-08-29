import { useState, useCallback } from 'react';
import { useEcoRain } from './hooks/useEcoRain';
import { getEsp8266Ip } from './config/deviceConfig';
import { Header } from './components/Header/Header';
import { MobileNav } from './components/Navigation/MobileNav';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { HardwareDocs } from './pages/HardwareDocs';
import { SettingsPage } from './pages/Settings';
import { DemoControlsModal } from './components/DemoControls/DemoControlsModal';
import type { ControlAction } from './types/ecoRain';
import { CheckCircle2, AlertCircle } from 'lucide-react';

type Page = 'dashboard' | 'analytics' | 'hardware' | 'settings';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { state, sendCommand, refreshMode, sessionStats } = useEcoRain();

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const handleCommand = useCallback(
    async (action: ControlAction) => {
      const ok = await sendCommand(action);
      const actionNames: Record<ControlAction, string> = {
        auto: 'Automatic irrigation mode enabled',
        manual: 'Manual control mode enabled',
        pump1_on: 'Pump 1 (Rainwater) activated',
        pump1_off: 'Pump 1 (Rainwater) deactivated',
        pump2_on: 'Pump 2 (Normal backup water) activated',
        pump2_off: 'Pump 2 (Normal backup water) deactivated',
        all_off: 'Emergency stop signal confirmed — all pumps halted',
      };
      if (ok) {
        showToast('success', actionNames[action] || 'Command dispatched successfully');
      } else {
        showToast('error', `Failed to execute ${action}`);
      }
      return ok;
    },
    [sendCommand, showToast]
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
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as Page)}
        onOpenConnectModal={() => {
          setActivePage('settings');
        }}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
      />

      <main className="page-content" id="main-content" tabIndex={-1}>
        {activePage === 'dashboard' && (
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
            onIpChanged={() => refreshMode()}
            onOpenDemoControls={() => setIsDemoModalOpen(true)}
          />
        )}
        {activePage === 'analytics' && (
          <Analytics history={state.history} />
        )}
        {activePage === 'hardware' && (
          <HardwareDocs />
        )}
        {activePage === 'settings' && (
          <SettingsPage onModeChange={handleModeChange} />
        )}
      </main>

      {/* Interactive Demonstration Simulator Modal */}
      <DemoControlsModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onRefresh={() => refreshMode()}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activePage={activePage}
        onNavigate={(page) => setActivePage(page as Page)}
      />

      {/* Toast Notification Shelf */}
      {toasts.length > 0 && (
        <div className="toast-shelf" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className="toast-item">
              {t.type === 'success' ? (
                <CheckCircle2 size={16} color="var(--green-400)" style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={16} color="var(--red-400)" style={{ flexShrink: 0 }} />
              )}
              <span style={{ fontSize: '0.82rem' }}>{t.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
