import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Truck } from 'lucide-react';
import { supplierService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { TableSkeletonRows, TableEmptyState, RowAction } from '../../components/common/TableParts';
import SupplierFormModal from './SupplierFormModal';

export default function SupplierList() {
  const { hasRole } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
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

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supplierService.list({ page, limit: 10, search });
      setSuppliers(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch {
      toast.error('Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);
  useEffect(() => { setPage(1); }, [search]);

  const handleView = async (s) => {
    try {
      const { data } = await supplierService.get(s.id);
      setViewing(data.data);
    } catch {
      toast.error('Failed to load supplier details.');
    }
  };

  const handleDelete = async () => {
    try {
      await supplierService.remove(deleteTarget.id);
      toast.success('Supplier deleted.');
      setDeleteTarget(null);
      fetchSuppliers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete supplier.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search suppliers…" />
        {canEdit && (
          <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus size={16} /> Add Supplier
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Company</th><th>GST Number</th><th>Phone</th><th>Email</th>
                {canEdit && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={5} cols={colCount} />}

              {!loading && suppliers.length === 0 && (
                <TableEmptyState
                  colSpan={colCount}
                  icon={Truck}
                  title={search ? 'No matching suppliers' : 'No suppliers yet'}
                  message={
                    search
                      ? 'Try a different company name or GST number.'
                      : 'Add your suppliers to link them to products and track your supply chain.'
                  }
                  action={canEdit && !search ? (
                    <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
                      <Plus size={16} /> Add Supplier
                    </button>
                  ) : null}
                />
              )}

              {!loading && suppliers.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-ink">{s.company_name}</td>
                  <td className="font-mono text-xs text-ink-muted">{s.gst_number || '—'}</td>
                  <td>{s.phone || '—'}</td>
                  <td>{s.email || '—'}</td>
                  {canEdit && (
                    <td>
                      <div className="flex justify-end gap-1">
                        <RowAction type="view" onClick={() => handleView(s)} />
                        <RowAction type="edit" onClick={() => { setEditing(s); setFormOpen(true); }} />
                        {hasRole('admin') && <RowAction type="delete" onClick={() => setDeleteTarget(s)} />}
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

      <SupplierFormModal open={formOpen} supplier={editing} onClose={() => setFormOpen(false)} onSaved={fetchSuppliers} />

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.company_name || 'Supplier Details'}>
        {viewing && (
          <div className="space-y-4 text-sm">
            <div className="rounded-md bg-surface-2 border border-line px-5 py-2">
              {[
                ['GST Number', viewing.gst_number || '—'],
                ['Phone', viewing.phone || '—'],
                ['Email', viewing.email || '—'],
                ['Address', viewing.address || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
                  <span className="text-xs text-ink-subtle">{label}</span>
                  <span className="text-ink font-medium text-right truncate max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <p className="font-medium text-ink mb-2.5">Products Supplied</p>
              {viewing.productsSupplied?.length === 0 && (
                <p className="text-ink-subtle text-xs py-4 text-center">No products linked yet.</p>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {viewing.productsSupplied?.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-md bg-surface-2 border border-line px-3.5 py-2.5 text-xs">
                    <span className="text-ink">{p.name}</span>
                    <span className="text-ink-subtle">{p.current_stock} in stock</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteTarget?.company_name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
