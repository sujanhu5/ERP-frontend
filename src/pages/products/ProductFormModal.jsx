import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { productService, categoryService, supplierService } from '../../services';

export default function ProductFormModal({ open, onClose, onSaved, product }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      categoryService.list().then((r) => setCategories(r.data.data)).catch(() => {});
      supplierService.list({ limit: 100 }).then((r) => setSuppliers(r.data.data)).catch(() => {});
      reset(
        product
          ? {
              name: product.name, sku: product.sku, barcode: product.barcode,
              categoryId: product.category_id || '', supplierId: product.supplier_id || '',
              description: product.description, gstPercent: product.gst_percent,
              purchasePrice: product.purchase_price, sellingPrice: product.selling_price,
              currentStock: product.current_stock, minimumStock: product.minimum_stock, unit: product.unit,
            }
          : { unit: 'pcs', gstPercent: 0, currentStock: 0, minimumStock: 5 }
      );
      setImageFile(null);
    }
  }, [open, product, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') formData.append(key, val);
      });
      if (imageFile) formData.append('image', imageFile);

      if (product) {
        await productService.update(product.id, formData);
        toast.success('Product updated successfully.');
      } else {
        await productService.create(formData);
        toast.success('Product added successfully.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Edit Product' : 'Add Product'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Product Name *</label>
            <input className="input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">SKU *</label>
            <input className="input" {...register('sku', { required: 'SKU is required' })} />
            {errors.sku && <p className="text-xs text-danger mt-1">{errors.sku.message}</p>}
          </div>
          <div>
            <label className="label">Barcode</label>
            <input className="input" {...register('barcode')} />
          </div>
          <div>
            <label className="label">Unit</label>
            <input className="input" placeholder="pcs, kg, box..." {...register('unit')} />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" {...register('categoryId')}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Supplier</label>
            <select className="input" {...register('supplierId')}>
              <option value="">Select supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Purchase Price *</label>
            <input type="number" step="0.01" className="input" {...register('purchasePrice', { required: true, min: 0 })} />
          </div>
          <div>
            <label className="label">Selling Price *</label>
            <input type="number" step="0.01" className="input" {...register('sellingPrice', { required: true, min: 0 })} />
          </div>
          <div>
            <label className="label">GST %</label>
            <input type="number" step="0.01" className="input" {...register('gstPercent', { min: 0, max: 100 })} />
          </div>
          <div>
            <label className="label">Current Stock</label>
            <input type="number" className="input" {...register('currentStock', { min: 0 })} />
          </div>
          <div>
            <label className="label">Minimum Stock</label>
            <input type="number" className="input" {...register('minimumStock', { min: 0 })} />
          </div>
          <div>
            <label className="label">Image</label>
            <input type="file" accept="image/*" className="input !py-1.5" onChange={(e) => setImageFile(e.target.files[0])} />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={2} {...register('description')} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
