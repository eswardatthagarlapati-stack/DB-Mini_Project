import { LayoutDashboard, BarChart2, Activity, Settings } from 'lucide-react';

interface MobileNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'analytics',   label: 'Analytics',   icon: BarChart2 },
  { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
  { id: 'settings',    label: 'Settings',    icon: Settings },
];

export function MobileNav({ activePage, onNavigate }: MobileNavProps) {
  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
      <div className="mobile-nav-grid">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`mobile-nav-btn${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              id={`mobile-nav-${item.id}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
