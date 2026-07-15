import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { customerService } from '../../services';

export default function CustomerFormModal({ open, onClose, onSaved, customer }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (open) {
      reset(customer ? { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address } : {});
    }
  }, [open, customer, reset]);

  const onSubmit = async (data) => {
    try {
      if (customer) {
        await customerService.update(customer.id, data);
        toast.success('Customer updated.');
      } else {
        await customerService.create(data);
        toast.success('Customer added.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save customer.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={customer ? 'Edit Customer' : 'Add Customer'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" {...register('name', { required: 'Name is required' })} />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input" rows={2} {...register('address')} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : customer ? 'Update' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
