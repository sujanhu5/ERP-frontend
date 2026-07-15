import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { employeeService } from '../../services';

export default function EmployeeFormModal({ open, onClose, onSaved, employee }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (open) {
      reset(
        employee
          ? {
              name: employee.name, email: employee.email, phone: employee.phone,
              department: employee.department, designation: employee.designation,
              salary: employee.salary, status: employee.status, address: employee.address,
            }
          : { status: 'active' }
      );
    }
  }, [open, employee, reset]);

  const onSubmit = async (data) => {
    try {
      if (employee) {
        await employeeService.update(employee.id, data);
        toast.success('Employee updated.');
      } else {
        await employeeService.create(data);
        toast.success('Employee added.');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={employee ? 'Edit Employee' : 'Add Employee'} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Full Name *</label>
            <input className="input" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" {...register('email')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" {...register('department')} />
          </div>
          <div>
            <label className="label">Designation</label>
            <input className="input" {...register('designation')} />
          </div>
          <div>
            <label className="label">Salary</label>
            <input type="number" step="0.01" className="input" {...register('salary', { min: 0 })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" {...register('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input" rows={2} {...register('address')} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : employee ? 'Update' : 'Add Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
