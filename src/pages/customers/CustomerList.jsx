import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Users } from 'lucide-react';
import { customerService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { TableSkeletonRows, TableEmptyState, RowAction } from '../../components/common/TableParts';
import CustomerFormModal from './CustomerFormModal';

export default function CustomerList() {
  const { hasRole } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewing, setViewing] = useState(null);

  const canEdit = hasRole('admin', 'manager');
  const colCount = canEdit ? 5 : 4;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await customerService.list({ page, limit: 10, search });
      setCustomers(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch {
      toast.error('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { setPage(1); }, [search]);

  const handleView = async (c) => {
    try {
      const { data } = await customerService.get(c.id);
      setViewing(data.data);
    } catch {
      toast.error('Failed to load customer details.');
    }
  };

  const handleDelete = async () => {
    try {
      await customerService.remove(deleteTarget.id);
      toast.success('Customer deleted.');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search customers…" />
        {canEdit && (
          <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus size={16} /> Add Customer
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Outstanding</th>
                {canEdit && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={5} cols={colCount} />}

              {!loading && customers.length === 0 && (
                <TableEmptyState
                  colSpan={colCount}
                  icon={Users}
                  title={search ? 'No matching customers' : 'No customers yet'}
                  message={
                    search
                      ? 'Try a different name, phone number or email.'
                      : 'Add your first customer to start tracking invoices and outstanding balances.'
                  }
                  action={canEdit && !search ? (
                    <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
                      <Plus size={16} /> Add Customer
                    </button>
                  ) : null}
                />
              )}

              {!loading && customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-ink">{c.name}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>
                    <span className={`badge ${parseFloat(c.outstanding_balance) > 0 ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'}`}>
                      ₹{parseFloat(c.outstanding_balance).toLocaleString('en-IN')}
                    </span>
                  </td>
                  {canEdit && (
                    <td>
                      <div className="flex justify-end gap-1">
                        <RowAction type="view" onClick={() => handleView(c)} />
                        <RowAction type="edit" onClick={() => { setEditing(c); setFormOpen(true); }} />
                        {hasRole('admin') && <RowAction type="delete" onClick={() => setDeleteTarget(c)} />}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <CustomerFormModal open={formOpen} customer={editing} onClose={() => setFormOpen(false)} onSaved={fetchCustomers} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name || 'Customer Details'}>
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="rounded-md bg-surface-2 border border-line px-5 py-2">
              {[
                ['Email', viewing.email || '—'],
                ['Phone', viewing.phone || '—'],
                ['Address', viewing.address || '—'],
                ['Outstanding Balance', `₹${parseFloat(viewing.outstanding_balance).toLocaleString('en-IN')}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
                  <span className="text-xs text-ink-subtle">{label}</span>
                  <span className="text-ink font-medium text-right truncate max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="font-medium text-ink mb-2.5">Purchase History</p>
              {viewing.purchaseHistory?.length === 0 && (
                <p className="text-ink-subtle text-xs py-4 text-center">No purchases yet.</p>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {viewing.purchaseHistory?.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-3 rounded-md bg-surface-2 border border-line px-3.5 py-2.5 text-xs">
                    <span className="text-ink-muted font-mono">{inv.invoice_number}</span>
                    <span className="text-ink font-medium">₹{parseFloat(inv.total_amount).toLocaleString('en-IN')}</span>
                    <span className="badge-neutral capitalize">{inv.payment_status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
