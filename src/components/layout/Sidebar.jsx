import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, Truck, FileText,
  UserCheck, BarChart3, Settings, Activity, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

/** Grouped navigation, the way real ERPs organise modules. */
const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/products', label: 'Inventory', icon: Package, roles: ['admin', 'manager', 'employee'] },
      { to: '/invoices', label: 'Billing', icon: FileText, roles: ['admin', 'manager', 'employee'] },
    ],
  },
  {
    label: 'Relationships',
    items: [
      { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'manager', 'employee'] },
      { to: '/suppliers', label: 'Suppliers', icon: Truck, roles: ['admin', 'manager', 'employee'] },
    ],
  },
  {
    label: 'Organization',
    items: [
      { to: '/employees', label: 'Employees', icon: UserCheck, roles: ['admin', 'manager', 'employee'] },
      { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
      { to: '/activity', label: 'Activity', icon: Activity, roles: ['admin', 'manager'] },
      { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'manager', 'employee'] },
    ],
  },
];

export default function Sidebar({ open, collapsed, onToggleCollapse }) {
  const { user } = useAuth();
  const location = useLocation();

  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => !user || i.roles.includes(user.role)) }))
    .filter((g) => g.items.length > 0);

  return (
    <aside
      className={`fixed lg:static z-40 h-full shrink-0 bg-surface border-r border-line
        flex flex-col transition-[width] duration-200 overflow-hidden
        ${open ? (collapsed ? 'w-[68px]' : 'w-[240px]') : 'w-0 lg:w-[68px]'}`}
    >
      {/* Brand */}
      <div className={`h-14 flex items-center border-b border-line shrink-0 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
        {collapsed ? <Logo variant="mark" /> : <Logo />}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {visibleGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="px-4 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                {group.label}
              </p>
            )}
            <div className="px-2 space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname.startsWith(to);
                return (
                  <NavLink
                    key={to}
                    to={to}
                    title={collapsed ? label : undefined}
                    className={`relative flex items-center gap-3 rounded-md text-sm font-medium
                      transition-colors duration-150 whitespace-nowrap
                      ${collapsed ? 'justify-center py-2.5' : 'px-3 py-2'}
                      ${isActive
                        ? 'bg-primary-soft text-primary'
                        : 'text-ink-muted hover:bg-surface-3 hover:text-ink'}`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />
                    )}
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} className="shrink-0" />
                    {!collapsed && label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse control */}
      <div className="hidden lg:flex border-t border-line p-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`btn-ghost w-full !py-2 !text-xs ${collapsed ? '!px-0 justify-center' : 'justify-start'}`}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
