import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Download, FileText } from 'lucide-react';
import { invoiceService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { TableSkeletonRows, TableEmptyState, RowAction } from '../../components/common/TableParts';
import CreateInvoiceModal from './CreateInvoiceModal';

const statusStyles = {
  paid: 'bg-success-soft text-success',
  partial: 'bg-warning-soft text-warning',
  unpaid: 'bg-danger-soft text-danger',
  refunded: 'bg-surface-2 text-ink-muted',
};

const inr = (v) => `₹${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function InvoiceList() {
  const { hasRole } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [viewing, setViewing] = useState(null);

  const canCreate = hasRole('admin', 'manager');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await invoiceService.list({ page, limit: 10, search });
      setInvoices(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { setPage(1); }, [search]);

  const handleView = async (inv) => {
    try {
      const { data } = await invoiceService.get(inv.id);
      setViewing(data.data);
    } catch {
      toast.error('Failed to load invoice.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by invoice # or customer…" />
        {canCreate && (
          <button className="btn-primary" onClick={() => setFormOpen(true)}>
            <Plus size={16} /> Create Invoice
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Invoice #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={5} cols={6} />}

              {!loading && invoices.length === 0 && (
                <TableEmptyState
                  colSpan={6}
                  icon={FileText}
                  title={search ? 'No matching invoices' : 'No invoices yet'}
                  message={
                    search
                      ? 'Try a different invoice number or customer name.'
                      : 'Create your first GST invoice — stock is deducted automatically and a PDF is generated.'
                  }
                  action={canCreate && !search ? (
                    <button className="btn-primary" onClick={() => setFormOpen(true)}>
                      <Plus size={16} /> Create Invoice
                    </button>
                  ) : null}
                />
              )}

              {!loading && invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-mono text-xs text-ink">{inv.invoice_number}</td>
                  <td>{inv.customer_name || 'Walk-in'}</td>
                  <td className="font-medium text-ink">₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</td>
                  <td><span className={`badge capitalize ${statusStyles[inv.payment_status]}`}>{inv.payment_status}</span></td>
                  <td className="text-xs text-ink-subtle">{new Date(inv.created_at).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <RowAction type="view" onClick={() => handleView(inv)} />
                      {inv.pdf_url && (
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Download PDF"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Download size={15} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <CreateInvoiceModal open={formOpen} onClose={() => setFormOpen(false)} onCreated={fetchInvoices} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.invoice_number} maxWidth="max-w-xl">
        {viewing && (
          <div className="space-y-5 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-ink-subtle">Customer</p>
                <p className="text-ink font-medium mt-0.5">{viewing.customer_name || 'Walk-in Customer'}</p>
              </div>
              <span className={`badge h-fit capitalize ${statusStyles[viewing.payment_status]}`}>{viewing.payment_status}</span>
            </div>

            <div className="rounded-2xl border border-line overflow-hidden">
              <table className="table-base !text-xs">
                <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th className="text-right">Total</th></tr></thead>
                <tbody>
                  {viewing.items.map((it) => (
                    <tr key={it.id}>
                      <td className="text-ink">{it.product_name}</td>
                      <td>{it.quantity}</td>
                      <td>{inr(it.unit_price)}</td>
                      <td className="text-right text-ink">{inr(it.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-md bg-surface-2 border border-line px-5 py-4 space-y-2">
              <div className="flex justify-between text-ink-muted"><span>Subtotal</span><span>{inr(viewing.subtotal)}</span></div>
              <div className="flex justify-between text-ink-muted"><span>GST</span><span>{inr(viewing.gst_amount)}</span></div>
              <div className="flex justify-between text-ink-muted"><span>Discount</span><span>-{inr(viewing.discount_amount)}</span></div>
              <div className="flex justify-between font-bold text-ink pt-2.5 border-t border-line text-base">
                <span>Total</span><span>{inr(viewing.total_amount)}</span>
              </div>
              <div className="flex justify-between text-ink-muted"><span>Amount Paid</span><span>{inr(viewing.amount_paid)}</span></div>
            </div>

            {viewing.pdf_url && (
              <a href={viewing.pdf_url} target="_blank" rel="noreferrer" className="btn-primary w-full">
                <Download size={16} /> Download PDF
              </a>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
