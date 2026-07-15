import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { supplierService } from '../../services';

export default function SupplierFormModal({ open, onClose, onSaved, supplier }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (open) {
      reset(
        supplier
          ? { companyName: supplier.company_name, gstNumber: supplier.gst_number, phone: supplier.phone, email: supplier.email, address: supplier.address }
          : {}
      );
    }
  }, [open, supplier, reset]);

  const onSubmit = async (data) => {
    try {
      if (supplier) {
        await supplierService.update(supplier.id, data);
        toast.success('Supplier updated.');
      } else {
        await supplierService.create(data);
        toast.success('Supplier added.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save supplier.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={supplier ? 'Edit Supplier' : 'Add Supplier'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Company Name *</label>
          <input className="input" {...register('companyName', { required: 'Company name is required' })} />
          {errors.companyName && <p className="text-xs text-danger mt-1">{errors.companyName.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">GST Number</label>
            <input className="input" {...register('gstNumber')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" {...register('email')} />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input" rows={2} {...register('address')} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : supplier ? 'Update' : 'Add Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
