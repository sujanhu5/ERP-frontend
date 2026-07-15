import { useEffect, useState } from 'react';
import {
  IndianRupee, TrendingUp, CalendarDays, Users, Package,
  UserCheck, FileText, TriangleAlert,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardService, invoiceService } from '../../services';
import { getChartTheme } from '../../utils/chartTheme';
import StatCard from '../../components/dashboard/StatCard';
import { Skeleton } from '../../components/common/Spinner';

const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[72px]" />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Skeleton className="h-[340px] xl:col-span-2" />
        <Skeleton className="h-[340px]" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Skeleton className="h-[320px] xl:col-span-2" />
        <Skeleton className="h-[320px]" />
      </div>
    </div>
  );
}

function Panel({ title, action, children, className = '', flush = false }) {
  return (
    <section className={`panel ${className}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
        {action}
      </div>
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </section>
  );
}

const statusBadge = {
  paid: 'badge-success',
  partial: 'badge-warning',
  unpaid: 'badge-danger',
  refunded: 'badge-neutral',
};

export default function Dashboard() {
  const ct = getChartTheme(false);

  const [summary, setSummary] = useState(null);
  const [salesGraph, setSalesGraph] = useState([]);
  const [revenueGraph, setRevenueGraph] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, sg, rg, tp, ri] = await Promise.all([
          dashboardService.summary(),
          dashboardService.salesGraph(30),
          dashboardService.revenueGraph(6),
          dashboardService.topProducts(5),
          invoiceService.list({ page: 1, limit: 5 }),
        ]);
        setSummary(s.data.data);
        setRecentInvoices(ri.data.data);
        setSalesGraph(sg.data.data.map((d) => ({
          date: new Date(d.sale_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
          total: parseFloat(d.total),
        })));
        setRevenueGraph(rg.data.data.map((d) => ({
          month: new Date(d.month).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
          total: parseFloat(d.total),
        })));
        setTopProducts(tp.data.data.map((p) => ({ ...p, total_revenue: parseFloat(p.total_revenue) })));
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const axisProps = {
    tick: { fill: ct.axis, fontSize: 11 },
    axisLine: { stroke: ct.axisLine },
    tickLine: false,
  };

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(summary?.totalRevenue)} tone="success" />
        <StatCard icon={TrendingUp} label="Today's Sales" value={formatCurrency(summary?.todaySales)} />
        <StatCard icon={CalendarDays} label="Monthly Sales" value={formatCurrency(summary?.monthlySales)} />
        <StatCard icon={FileText} label="Invoices" value={summary?.totalInvoices ?? 0} />
        <StatCard icon={Package} label="Products" value={summary?.totalProducts ?? 0} />
        <StatCard icon={Users} label="Customers" value={summary?.totalCustomers ?? 0} />
        <StatCard icon={UserCheck} label="Employees" value={summary?.totalEmployees ?? 0} />
        <StatCard icon={TriangleAlert} label="Low Stock Alerts" value={summary?.lowStockCount ?? 0} tone="warning" />
      </div>

      {/* Sales trend + product mix */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title="Sales — Last 30 Days" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesGraph} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ct.areaFrom} />
                  <stop offset="100%" stopColor={ct.areaTo} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
              <XAxis dataKey="date" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={ct.tooltip} formatter={(v) => [formatCurrency(v), 'Sales']} />
              <Area type="monotone" dataKey="total" stroke={ct.series[0]} strokeWidth={2} fill="url(#salesFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Top Products — Revenue Share">
          {topProducts.length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center">
              <Package size={24} className="text-ink-subtle mb-2.5" />
              <p className="text-sm text-ink-subtle">No sales data yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topProducts}
                  dataKey="total_revenue"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  stroke="none"
                >
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={ct.series[i % ct.series.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ct.tooltip} formatter={(v) => formatCurrency(v)} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={7}
                  formatter={(value) => <span style={{ color: ct.axis, fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* Revenue + low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Panel title="Revenue — Last 6 Months" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueGraph} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={ct.grid} vertical={false} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={ct.tooltip} formatter={(v) => [formatCurrency(v), 'Revenue']} cursor={{ fill: ct.cursor }} />
              <Bar dataKey="total" fill={ct.series[0]} radius={[3, 3, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title={
            <span className="flex items-center gap-2">
              <TriangleAlert className="text-warning" size={14} /> Low Stock
            </span>
          }
        >
          <div className="space-y-2">
            {(!summary?.lowStockProducts || summary.lowStockProducts.length === 0) && (
              <div className="py-10 text-center">
                <Package size={22} className="text-ink-subtle mx-auto mb-2.5" />
                <p className="text-sm text-ink-subtle">All products are well stocked.</p>
              </div>
            )}
            {summary?.lowStockProducts?.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface-2 px-3 py-2">
                <span className="text-sm text-ink truncate">{p.name}</span>
                <span className="badge-warning shrink-0 tabular-nums">{p.current_stock} left</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Recent invoices */}
      <Panel
        title="Recent Invoices"
        flush
        action={
          <Link to="/invoices" className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Invoice #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <FileText size={22} className="text-ink-subtle mx-auto mb-2.5" />
                    <p className="text-sm text-ink-subtle">No invoices yet.</p>
                  </td>
                </tr>
              )}
              {recentInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-ink">{inv.invoice_number}</td>
                  <td>{inv.customer_name || 'Walk-in'}</td>
                  <td className="tabular-nums font-medium text-ink">{formatCurrency(inv.total_amount)}</td>
                  <td>
                    <span className={`${statusBadge[inv.payment_status] || 'badge-neutral'} capitalize`}>
                      {inv.payment_status}
                    </span>
                  </td>
                  <td className="text-xs tabular-nums">{new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
