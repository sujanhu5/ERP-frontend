import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, ScrollText, LogOut, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoMark } from '../common/Logo';

const navItems = [
  { to: '/platform', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/platform/companies', label: 'Companies', icon: Building2 },
  { to: '/platform/audit', label: 'Audit Log', icon: ScrollText },
];

const titleMap = {
  '/platform/companies': 'Companies',
  '/platform/audit': 'Audit Log',
  '/platform': 'Platform Overview',
};

export default function PlatformLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // The app runs light-only; dark mode is reserved for the marketing landing page.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const title = Object.entries(titleMap).find(([p]) => location.pathname.startsWith(p))?.[1] || 'Platform';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      <aside
        className={`fixed lg:static z-40 h-full shrink-0 bg-surface border-r border-line flex flex-col
          transition-[width] duration-200 overflow-hidden ${open ? 'w-[236px]' : 'w-0 lg:w-[68px]'}`}
      >
        <div className="h-14 flex items-center gap-2 px-4 border-b border-line shrink-0">
          <LogoMark size="sm" />
          {open && (
            <div className="leading-none">
              <span className="font-serif font-semibold tracking-tight text-[18px] text-ink">
                Maxmatrix
              </span>
              <p className="text-[9px] tracking-[0.1em] uppercase text-primary mt-1 font-medium font-sans">
                Platform Control
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={!open ? label : undefined}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
                 ${open ? '' : 'justify-center'}
                 ${isActive
                   ? 'bg-primary-soft text-primary'
                   : 'text-ink-muted hover:bg-surface-3 hover:text-ink'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-primary" />}
                  <Icon size={17} className="shrink-0" />
                  {open && label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-line p-3 shrink-0">
          {open && (
            <div className="mb-2.5">
              <p className="text-[13px] font-medium text-ink truncate">{user?.name}</p>
              <p className="text-[11px] text-ink-subtle truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2.5 w-full rounded-md px-3 py-2 text-sm font-medium
              text-ink-muted hover:bg-surface-3 hover:text-ink transition-colors ${open ? '' : 'justify-center'}`}
          >
            <LogOut size={16} /> {open && 'Sign out'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 flex items-center justify-between gap-3 px-4 lg:px-5
                           bg-surface border-b border-line sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setOpen((v) => !v)} className="btn-ghost !p-1.5">
              <Menu size={19} />
            </button>
            <h1 className="text-[15px] font-semibold text-ink truncate">{title}</h1>
            <span className="badge-primary shrink-0 hidden sm:inline-flex">
              <ShieldCheck size={11} /> Super Admin
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
