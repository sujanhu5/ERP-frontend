import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, Package, Users, Truck, FileText,
  UserCheck, BarChart3, Settings, LogOut, CornerDownLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const COMMANDS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'], keywords: 'home overview kpi' },
  { label: 'Inventory', to: '/products', icon: Package, roles: ['admin', 'manager', 'employee'], keywords: 'products stock sku' },
  { label: 'Billing & Invoices', to: '/invoices', icon: FileText, roles: ['admin', 'manager', 'employee'], keywords: 'gst bill payment' },
  { label: 'Customers', to: '/customers', icon: Users, roles: ['admin', 'manager', 'employee'], keywords: 'crm clients' },
  { label: 'Suppliers', to: '/suppliers', icon: Truck, roles: ['admin', 'manager', 'employee'], keywords: 'vendors purchase' },
  { label: 'Employees', to: '/employees', icon: UserCheck, roles: ['admin', 'manager', 'employee'], keywords: 'hr staff attendance' },
  { label: 'Reports', to: '/reports', icon: BarChart3, roles: ['admin', 'manager'], keywords: 'analytics export csv' },
  { label: 'Settings', to: '/settings', icon: Settings, roles: ['admin', 'manager', 'employee'], keywords: 'company profile gst' },
];

export default function CommandPalette({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nav = COMMANDS
      .filter((c) => !user || c.roles.includes(user.role))
      .filter((c) => !q || `${c.label} ${c.keywords}`.toLowerCase().includes(q))
      .map((c) => ({ ...c, group: 'Navigate' }));

    const actions = [
      { label: 'Log out', icon: LogOut, action: 'logout', keywords: 'logout sign out exit', group: 'Actions', danger: true },
    ].filter((a) => !q || `${a.label} ${a.keywords}`.toLowerCase().includes(q));

    return [...nav, ...actions];
  }, [query, user]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  if (!open) return null;

  const run = async (item) => {
    onClose();
    if (item.action === 'logout') {
      await logout();
      navigate('/login');
    } else if (item.to) {
      navigate(item.to);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault();
      run(items[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  let lastGroup = null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[14vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="panel w-full max-w-xl overflow-hidden !shadow-overlay">
        <div className="flex items-center gap-2.5 px-4 border-b border-line">
          <Search size={16} className="text-ink-subtle shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages and actions…"
            className="w-full bg-transparent py-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none"
          />
          <kbd className="text-[10px] text-ink-subtle bg-surface-2 border border-line rounded px-1.5 py-0.5 shrink-0">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {items.length === 0 && (
            <p className="text-sm text-ink-subtle text-center py-8">No results for “{query}”</p>
          )}
          {items.map((item, i) => {
            const showHeader = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <div key={item.label}>
                {showHeader && (
                  <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                    {item.group}
                  </p>
                )}
                <button
                  onClick={() => run(item)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors
                    ${i === activeIndex ? 'bg-primary-soft text-primary' : 'text-ink-muted'}
                    ${item.danger && i === activeIndex ? '!bg-danger-soft !text-danger' : ''}
                    ${item.danger && i !== activeIndex ? '!text-danger/80' : ''}`}
                >
                  <item.icon size={15} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {i === activeIndex && <CornerDownLeft size={13} className="opacity-60" />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-line bg-surface-2 text-[11px] text-ink-subtle">
          <span><kbd className="font-medium">↑↓</kbd> navigate</span>
          <span><kbd className="font-medium">↵</kbd> select</span>
          <span><kbd className="font-medium">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
