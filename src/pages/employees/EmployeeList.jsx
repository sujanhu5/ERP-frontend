import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, UserCheck } from 'lucide-react';
import { employeeService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { TableSkeletonRows, TableEmptyState, RowAction } from '../../components/common/TableParts';
import EmployeeFormModal from './EmployeeFormModal';

const statusStyles = {
  active: 'bg-success-soft text-success',
  inactive: 'bg-surface-2 text-ink-muted',
  on_leave: 'bg-warning-soft text-warning',
  terminated: 'bg-danger-soft text-danger',
};

export default function EmployeeList() {
  const { hasRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const canEdit = hasRole('admin', 'manager');
  const colCount = canEdit ? 6 : 5;

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeeService.list({ page, limit: 10, search });
      setEmployees(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch {
      toast.error('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async () => {
    try {
      await employeeService.remove(deleteTarget.id);
      toast.success('Employee deleted.');
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search employees…" />
        {canEdit && (
          <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus size={16} /> Add Employee
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Name</th><th>Department</th><th>Designation</th><th>Salary</th><th>Status</th>
                {canEdit && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={5} cols={colCount} />}

              {!loading && employees.length === 0 && (
                <TableEmptyState
                  colSpan={colCount}
                  icon={UserCheck}
                  title={search ? 'No matching employees' : 'No employees yet'}
                  message={
                    search
                      ? 'Try a different name or email.'
                      : 'Add your team members to manage departments, salaries, attendance and leaves.'
                  }
                  action={canEdit && !search ? (
                    <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
                      <Plus size={16} /> Add Employee
                    </button>
                  ) : null}
                />
              )}

              {!loading && employees.map((e) => (
                <tr key={e.id}>
                  <td className="font-medium text-ink">{e.name}</td>
                  <td>{e.department || '—'}</td>
                  <td>{e.designation || '—'}</td>
                  <td className="font-medium text-ink">₹{parseFloat(e.salary).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge capitalize ${statusStyles[e.status] || 'bg-surface-2 text-ink-muted'}`}>
                      {e.status.replace('_', ' ')}
                    </span>
                  </td>
                  {canEdit && (
                    <td>
                      <div className="flex justify-end gap-1">
                        <RowAction type="edit" onClick={() => { setEditing(e); setFormOpen(true); }} />
                        {hasRole('admin') && <RowAction type="delete" onClick={() => setDeleteTarget(e)} />}
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

      <EmployeeFormModal open={formOpen} employee={editing} onClose={() => setFormOpen(false)} onSaved={fetchEmployees} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
