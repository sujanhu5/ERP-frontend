import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, TriangleAlert, Package, ImageOff } from 'lucide-react';
import { productService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeletonRows, TableEmptyState, RowAction } from '../../components/common/TableParts';
import ProductFormModal from './ProductFormModal';

export default function ProductList() {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const canEdit = hasRole('admin', 'manager');
  const colCount = canEdit ? 7 : 6;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productService.list({ page, limit: 10, search, lowStockOnly });
      setProducts(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [page, search, lowStockOnly]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, lowStockOnly]);

  const handleDelete = async () => {
    try {
      await productService.remove(deleteTarget.id);
      toast.success('Product deleted.');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, SKU, barcode…" />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-ink-muted cursor-pointer select-none bg-surface-2 border border-line rounded-xl px-3.5 py-2.5 hover:bg-surface-3 transition-colors">
            <input
              type="checkbox"
              className="accent-accent h-3.5 w-3.5"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Low stock only
          </label>
          {canEdit && (
            <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} /> Add Product
            </button>
          )}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>GST</th>
                {canEdit && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={5} cols={colCount} />}

              {!loading && products.length === 0 && (
                <TableEmptyState
                  colSpan={colCount}
                  icon={Package}
                  title={search || lowStockOnly ? 'No matching products' : 'No products yet'}
                  message={
                    search || lowStockOnly
                      ? 'Try adjusting your search or filters.'
                      : 'Add your first product to start tracking inventory, stock levels and GST.'
                  }
                  action={canEdit && !search && !lowStockOnly ? (
                    <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
                      <Plus size={16} /> Add Product
                    </button>
                  ) : null}
                />
              )}

              {!loading && products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-lg object-cover border border-line" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-surface-2 border border-line flex items-center justify-center">
                          <ImageOff size={14} className="text-ink-subtle" />
                        </div>
                      )}
                      <span className="font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="font-mono text-xs text-ink-muted">{p.sku}</td>
                  <td>{p.category_name || '—'}</td>
                  <td className="font-medium text-ink">₹{parseFloat(p.selling_price).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${p.current_stock <= p.minimum_stock ? 'bg-warning-soft text-warning' : 'bg-success-soft text-success'}`}>
                      {p.current_stock <= p.minimum_stock && <TriangleAlert size={11} className="mr-1" />}
                      {p.current_stock} {p.unit}
                    </span>
                  </td>
                  <td>{p.gst_percent}%</td>
                  {canEdit && (
                    <td>
                      <div className="flex justify-end gap-1">
                        <RowAction type="edit" onClick={() => { setEditing(p); setFormOpen(true); }} />
                        {hasRole('admin') && <RowAction type="delete" onClick={() => setDeleteTarget(p)} />}
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

      <ProductFormModal
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSaved={fetchProducts}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
