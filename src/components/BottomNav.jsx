import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const TABS = [
  { to: '/home', icon: 'home', label: 'Home' },
  { to: '/appointments', icon: 'calendar_month', label: 'Appointments' },
  { to: '/prescriptions', icon: 'description', label: 'Prescriptions' },
  { to: '/profile', icon: 'person', label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom sticky bottom-0 z-20 bg-surface-raised border-t border-outline px-2 pt-2">
      <div className="flex justify-around">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-[11px] font-medium ${
                isActive ? 'text-primary' : 'text-ink-muted'
              }`
            }
          >
            <Icon name={tab.icon} className="text-[22px]" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
