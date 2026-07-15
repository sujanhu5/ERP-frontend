import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Download, FileText, IndianRupee, ReceiptText, TicketPercent } from 'lucide-react';
import { reportService } from '../../services';
import { Skeleton } from '../../components/common/Spinner';

const inr = (v) => `₹${parseFloat(v || 0).toLocaleString('en-IN')}`;

const exportFile = async (type) => {
  try {
    const { data } = await reportService.exportCSV(type);
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}_report.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success('Report exported.');
  } catch {
    toast.error('Export failed.');
  }
};

function KpiTile({ icon: Icon, label, value, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="card"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <Icon size={15} className="text-primary" />
        <p className="text-xs text-ink-subtle">{label}</p>
      </div>
      <p className="text-xl font-bold text-ink font-display">{value}</p>
    </motion.div>
  );
}

function ReportCard({ title, onExport, exportLabel = 'Export CSV', children, empty, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="card !p-0 overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-line">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <button className="btn-secondary !py-1.5 !text-xs" onClick={onExport}>
          <Download size={14} /> {exportLabel}
        </button>
      </div>
      {empty ? (
        <div className="py-14 text-center">
          <FileText size={24} className="text-ink-subtle mx-auto mb-3" />
          <p className="text-sm text-ink-subtle">No data to report yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto max-h-72 overflow-y-auto">{children}</div>
      )}
    </motion.div>
  );
}

export default function Reports() {
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [inv, cust, top, rev] = await Promise.all([
          reportService.inventory(),
          reportService.customers(),
          reportService.topProducts(5),
          reportService.revenue(),
        ]);
        setInventory(inv.data.data);
        setCustomers(cust.data.data);
        setTopProducts(top.data.data);
        setRevenue(rev.data.data);
      } catch {
        toast.error('Failed to load reports.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[86px]" />)}
        </div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile index={0} icon={FileText} label="Total Invoices" value={revenue?.invoice_count ?? 0} />
        <KpiTile index={1} icon={IndianRupee} label="Total Revenue" value={inr(revenue?.total_revenue)} />
        <KpiTile index={2} icon={ReceiptText} label="Total GST Collected" value={inr(revenue?.total_gst)} />
        <KpiTile index={3} icon={TicketPercent} label="Total Discounts" value={inr(revenue?.total_discount)} />
      </div>

      <ReportCard title="Inventory Report" onExport={() => exportFile('inventory')} empty={inventory.length === 0} delay={0.1}>
        <table className="table-base">
          <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th className="text-right">Stock Value</th></tr></thead>
          <tbody>
            {inventory.map((p, i) => (
              <tr key={i}>
                <td className="text-ink">{p.name}</td>
                <td className="font-mono text-xs text-ink-muted">{p.sku}</td>
                <td>{p.current_stock}</td>
                <td className="text-right font-medium text-ink">{inr(p.stock_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportCard>

      <ReportCard title="Customer Report" onExport={() => exportFile('customers')} empty={customers.length === 0} delay={0.15}>
        <table className="table-base">
          <thead><tr><th>Customer</th><th>Orders</th><th>Lifetime Value</th><th className="text-right">Outstanding</th></tr></thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i}>
                <td className="text-ink">{c.name}</td>
                <td>{c.total_orders}</td>
                <td className="font-medium text-ink">{inr(c.lifetime_value)}</td>
                <td className="text-right">
                  <span className={`badge ${parseFloat(c.outstanding_balance) > 0 ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'}`}>
                    {inr(c.outstanding_balance)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportCard>

      <ReportCard
        title="Top Selling Products"
        onExport={() => exportFile('sales')}
        exportLabel="Export Sales CSV"
        empty={topProducts.length === 0}
        delay={0.2}
      >
        <table className="table-base">
          <thead><tr><th>Product</th><th>Units Sold</th><th className="text-right">Revenue</th></tr></thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={i}>
                <td className="text-ink">{p.name}</td>
                <td>{p.total_sold}</td>
                <td className="text-right font-medium text-ink">{inr(p.total_revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ReportCard>
    </div>
  );
}
