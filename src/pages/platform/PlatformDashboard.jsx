import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, IndianRupee, FileText, Boxes, UserCheck,
  HardDrive, ShieldAlert, Activity, ArrowRight, Circle,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import { platformService } from '../../services';
import { getChartTheme } from '../../utils/chartTheme';
import { Skeleton } from '../../components/common/Spinner';

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const dt = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

function Kpi({ icon: Icon, label, value, tone = 'p' }) {
  const tones = {
    p: 'bg-primary-soft text-primary',
    s: 'bg-success-soft text-success',
    w: 'bg-warning-soft text-warning',
    d: 'bg-danger-soft text-danger',
  };
  return (
    <div className="card !p-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-ink-muted truncate">{label}</p>
        <p className="text-xl font-semibold text-ink mt-1 tabular-nums truncate">{value}</p>
      </div>
      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={16} />
      </div>
    </div>
  );
}

function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function PlatformDashboard() {
  const ct = getChartTheme(false);

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, a, h, l] = await Promise.all([
          platformService.summary(),
          platformService.analytics(30, 6),
          platformService.health(),
          platformService.auditLogs({ limit: 6 }),
        ]);
        setSummary(s.data.data);
        setAnalytics(a.data.data);
        setHealth(h.data.data);
        setLogs(l.data.data);
      } catch {
        toast.error('Failed to load platform data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[72px]" />)}
        </div>
        <div className="grid xl:grid-cols-3 gap-5">
          <Skeleton className="h-[320px] xl:col-span-2" />
          <Skeleton className="h-[320px]" />
        </div>
      </div>
    );
  }

  const signups = (analytics?.signups || []).map((r) => ({
    date: new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    count: parseInt(r.count, 10),
  }));
  const growth = (analytics?.growth || []).map((r) => ({
    month: new Date(r.month).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    count: parseInt(r.count, 10),
  }));
  const plans = (analytics?.plans || []).map((r) => ({
    name: r.plan.charAt(0).toUpperCase() + r.plan.slice(1),
    value: parseInt(r.count, 10),
  }));

  const axis = { tick: { fill: ct.axis, fontSize: 11 }, axisLine: { stroke: ct.axisLine }, tickLine: false };

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={Building2} label="Total Companies" value={summary?.totalCompanies ?? 0} />
        <Kpi icon={Users} label="Active Users" value={summary?.totalUsers ?? 0} />
        <Kpi icon={IndianRupee} label="Platform Revenue" value={inr(summary?.totalRevenue)} tone="s" />
        <Kpi icon={FileText} label="Total Invoices" value={summary?.totalInvoices ?? 0} />
        <Kpi icon={Boxes} label="Inventory Value" value={inr(summary?.inventoryValue)} />
        <Kpi icon={UserCheck} label="Total Employees" value={summary?.totalEmployees ?? 0} />
        <Kpi icon={HardDrive} label="Storage Used" value={`${(summary?.storageUsedMb ?? 0).toFixed(1)} MB`} />
        <Kpi icon={ShieldAlert} label="Suspended" value={summary?.suspendedCompanies ?? 0} tone={summary?.suspendedCompanies ? 'd' : 'p'} />
      </div>

      {/* Signups + plan mix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title="Daily Signups — Last 30 Days" className="xl:col-span-2">
          {signups.length === 0 ? (
            <div className="h-[250px] grid place-items-center text-sm text-ink-subtle">No signups in this period.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={signups} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="suFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ct.areaFrom} />
                    <stop offset="100%" stopColor={ct.areaTo} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="date" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip contentStyle={ct.tooltip} formatter={(v) => [v, 'Signups']} />
                <Area type="monotone" dataKey="count" stroke={ct.series[0]} strokeWidth={2} fill="url(#suFill)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Subscription Plans">
          {plans.length === 0 ? (
            <div className="h-[250px] grid place-items-center text-sm text-ink-subtle">No companies yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={plans} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={2} stroke="none">
                  {plans.map((_, i) => <Cell key={i} fill={ct.series[i % ct.series.length]} />)}
                </Pie>
                <Tooltip contentStyle={ct.tooltip} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={7}
                  formatter={(v) => <span style={{ color: ct.axis, fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* Growth + health */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title="Company Growth — Last 6 Months" className="xl:col-span-2">
          {growth.length === 0 ? (
            <div className="h-[230px] grid place-items-center text-sm text-ink-subtle">Not enough history yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={growth} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
                <XAxis dataKey="month" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip contentStyle={ct.tooltip} cursor={{ fill: ct.cursor }} formatter={(v) => [v, 'New companies']} />
                <Bar dataKey="count" fill={ct.series[0]} radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Panel>

        <Panel title="Platform Health">
          <div className="space-y-2.5">
            {[
              ['API', health?.api, health?.api === 'operational'],
              ['Database', health?.database, health?.database === 'operational'],
            ].map(([label, value, ok]) => (
              <div key={label} className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-3 py-2.5">
                <span className="text-sm text-ink">{label}</span>
                <span className={ok ? 'badge-success' : 'badge-danger'}>
                  <Circle size={7} className="fill-current" /> {value || 'unknown'}
                </span>
              </div>
            ))}
            {[
              ['DB latency', `${health?.latencyMs ?? '—'} ms`],
              ['Uptime', `${Math.floor((health?.uptimeSeconds ?? 0) / 60)} min`],
              ['Memory', `${health?.memoryMb ?? '—'} MB`],
              ['Node', health?.nodeVersion ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-3 py-1.5">
                <span className="text-xs text-ink-muted">{label}</span>
                <span className="text-xs text-ink font-medium tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Top companies + recent logins */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Panel
          title="Top Companies by Revenue"
          action={
            <Link to="/platform/companies" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          <div className="space-y-2">
            {(analytics?.topCompanies || []).length === 0 && (
              <p className="text-sm text-ink-subtle py-6 text-center">No companies yet.</p>
            )}
            {(analytics?.topCompanies || []).map((c, i) => (
              <Link
                key={c.id}
                to={`/platform/companies/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-3 py-2.5 hover:border-line-strong transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs text-ink-subtle w-4 tabular-nums">{i + 1}</span>
                  <span className="text-sm text-ink truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-ink-subtle tabular-nums">{c.invoice_count} inv</span>
                  <span className="text-sm font-medium text-ink tabular-nums">{inr(c.revenue)}</span>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Logins">
          <div className="space-y-2">
            {(analytics?.recentLogins || []).length === 0 && (
              <p className="text-sm text-ink-subtle py-6 text-center">No logins recorded yet.</p>
            )}
            {(analytics?.recentLogins || []).map((u, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm text-ink truncate">{u.name}</p>
                  <p className="text-xs text-ink-subtle truncate">{u.company || 'Platform'} · {u.role.replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-ink-subtle shrink-0 tabular-nums">{dt(u.last_login)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Audit trail */}
      <Panel
        title={<span className="flex items-center gap-2"><Activity size={14} className="text-primary" /> Recent Platform Activity</span>}
        action={
          <Link to="/platform/audit" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
            Full log <ArrowRight size={12} />
          </Link>
        }
        className="!p-0"
      >
        <div className="overflow-x-auto -m-5">
          <table className="table-base">
            <thead><tr><th>Action</th><th>User</th><th>Company</th><th>Entity</th><th>When</th></tr></thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} className="text-center text-ink-subtle py-8">No activity recorded yet.</td></tr>
              )}
              {logs.map((l) => (
                <tr key={l.id}>
                  <td><span className="badge-neutral font-mono">{l.action}</span></td>
                  <td className="text-ink">{l.user_name || '—'}</td>
                  <td>{l.company || 'Platform'}</td>
                  <td>{l.entity || '—'}</td>
                  <td className="text-xs tabular-nums">{dt(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
