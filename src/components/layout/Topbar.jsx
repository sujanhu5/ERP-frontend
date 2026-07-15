import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Search, Bell, Building2, Plus,
  User, LogOut, ChevronDown, Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { settingsService, activityService } from '../../services';
import { formatRelative } from '../../utils/format';

function useClickOutside(onClose) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return ref;
}

export default function Topbar({ onToggleSidebar, title, onOpenPalette }) {
  const { user, logout, hasRole } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  const profileRef = useClickOutside(() => setProfileOpen(false));
  const notifRef = useClickOutside(() => setNotifOpen(false));

  useEffect(() => {
    settingsService.get()
      .then(({ data }) => setCompanyName(data.data?.company_name || ''))
      .catch(() => {});
    activityService.notifications()
      .then(({ data }) => setNotifications(data.data || []))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-4 lg:px-5
                       bg-surface border-b border-line sticky top-0 z-30">
      {/* Left: title + company */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onToggleSidebar} className="btn-ghost !p-1.5 lg:hidden">
          <Menu size={20} />
        </button>
        <h1 className="text-[15px] font-semibold text-ink truncate">{title}</h1>
        {companyName && (
          <>
            <span className="hidden md:block h-4 w-px bg-line" />
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-ink-muted truncate max-w-[200px]">
              <Building2 size={13} className="shrink-0 text-ink-subtle" />
              <span className="truncate">{companyName}</span>
            </span>
          </>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Global search */}
        <button
          onClick={onOpenPalette}
          className="hidden sm:flex items-center gap-2 text-sm text-ink-subtle bg-surface-2
                     border border-line rounded-md pl-2.5 pr-1.5 py-1.5 w-44 lg:w-60
                     hover:bg-surface-3 hover:border-line-strong transition-colors"
        >
          <Search size={14} />
          <span className="flex-1 text-left text-xs">Search…</span>
          <kbd className="text-[10px] font-medium text-ink-subtle bg-surface border border-line rounded px-1.5 py-0.5">
            {isMac ? '⌘K' : 'Ctrl K'}
          </kbd>
        </button>
        <button onClick={onOpenPalette} className="sm:hidden btn-ghost !p-1.5">
          <Search size={18} />
        </button>

        {/* Quick action */}
        {hasRole('admin', 'manager') && (
          <button onClick={() => navigate('/invoices')} className="btn-primary !py-1.5 !px-3 hidden md:inline-flex">
            <Plus size={15} /> New Invoice
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((v) => !v)} className="btn-ghost !p-1.5 relative" title="Notifications">
            <Bell size={17} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-danger text-ink-invert text-[9px] font-semibold flex items-center justify-center">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 panel !shadow-overlay overflow-hidden">
              <div className="px-4 py-2.5 border-b border-line text-sm font-semibold text-ink bg-surface-2 flex items-center justify-between">
                <span>Notifications</span>
                {notifications.length > 0 && <span className="text-xs text-ink-subtle font-normal">{notifications.length} new</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Check size={20} className="text-success mx-auto mb-2" />
                  <p className="text-sm text-ink-muted">You're all caught up</p>
                  <p className="text-xs text-ink-subtle mt-1">New alerts will appear here.</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 border-b border-line last:border-0 hover:bg-surface-2 transition-colors">
                      <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.type === 'low_stock' ? 'bg-warning' : 'bg-primary'}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-ink font-medium">{n.title}</p>
                        {n.message && <p className="text-xs text-ink-subtle truncate">{n.message}</p>}
                        <p className="text-[11px] text-ink-subtle mt-0.5">{formatRelative(n.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => { setNotifOpen(false); navigate('/activity'); }}
                className="w-full text-center text-xs text-primary font-medium py-2.5 border-t border-line hover:bg-surface-2 transition-colors"
              >
                View all activity
              </button>
            </div>
          )}
        </div>

        <span className="h-5 w-px bg-line mx-0.5" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-md hover:bg-surface-3 transition-colors"
          >
            <div className="h-7 w-7 rounded-md bg-primary text-ink-invert flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="hidden xl:block text-left leading-tight">
              <p className="text-[13px] font-medium text-ink">{user?.name}</p>
              <p className="text-[11px] text-ink-subtle capitalize">{user?.role}</p>
            </div>
            <ChevronDown size={14} className="text-ink-subtle hidden xl:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 panel !shadow-overlay overflow-hidden">
              <div className="px-4 py-3 border-b border-line bg-surface-2">
                <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                <p className="text-xs text-ink-subtle truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-ink-muted hover:bg-surface-3 hover:text-ink transition-colors"
                >
                  <User size={15} /> Profile & Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-danger hover:bg-danger-soft transition-colors"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
