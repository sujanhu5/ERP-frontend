import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Building2, Ban, CheckCircle2, Trash2, KeyRound, Eye, Copy, Download,
} from 'lucide-react';
import { platformService } from '../../services';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { TableSkeletonRows, TableEmptyState } from '../../components/common/TableParts';

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const date = (d) => new Date(d).toLocaleDateString('en-IN');

const statusBadge = {
  active: 'badge-success',
  suspended: 'badge-warning',
  deleted: 'badge-danger',
};

/** Exports the current company list to CSV, client-side. */
function exportCsv(rows) {
  const header = ['Company', 'Business Type', 'GSTIN', 'Email', 'City', 'State', 'Status', 'Plan', 'Users', 'Invoices', 'Revenue', 'Joined'];
  const body = rows.map((c) => [
    c.name, c.business_type || '', c.gstin || '', c.email || '', c.city || '', c.state || '',
    c.status, c.plan, c.user_count, c.invoice_count, c.revenue, date(c.created_at),
  ]);
  const csv = [header, ...body]
    .map((r) => r.map((f) => `"${String(f ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'companies.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Companies exported.');
}

export default function PlatformCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [confirm, setConfirm] = useState(null);   // { type, company }
  const [tempPassword, setTempPassword] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await platformService.companies({ page, limit: 10, search, status });
      setCompanies(data.data);
      setTotalPages(data.pagination.totalPages || 1);
    } catch {
      toast.error('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);
  useEffect(() => { setPage(1); }, [search, status]);

  const runAction = async () => {
    const { type, company } = confirm;
    try {
      if (type === 'suspend') {
        await platformService.setStatus(company.id, 'suspended');
        toast.success(`${company.name} suspended.`);
      } else if (type === 'activate') {
        await platformService.setStatus(company.id, 'active');
        toast.success(`${company.name} reactivated.`);
      } else if (type === 'delete') {
        await platformService.remove(company.id);
        toast.success(`${company.name} deleted.`);
      } else if (type === 'reset') {
        const { data } = await platformService.resetPassword(company.id);
        setTempPassword({ company: company.name, ...data.data });
      }
      setConfirm(null);
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
      setConfirm(null);
    }
  };

  const confirmCopy = {
    suspend: {
      title: 'Suspend company',
      message: `Suspend "${confirm?.company?.name}"? Everyone at this company will be locked out immediately, at login and on every API call. Their data is retained.`,
      label: 'Suspend',
      danger: true,
    },
    activate: {
      title: 'Reactivate company',
      message: `Restore access for "${confirm?.company?.name}"? Their team will be able to sign in again right away.`,
      label: 'Reactivate',
      danger: false,
    },
    delete: {
      title: 'Delete company',
      message: `Delete "${confirm?.company?.name}"? The workspace becomes permanently unreachable. Records are retained for audit but the company cannot be restored from this screen.`,
      label: 'Delete',
      danger: true,
    },
    reset: {
      title: 'Reset admin password',
      message: `Issue a new temporary password for the admin of "${confirm?.company?.name}"? Their current password stops working immediately and all their sessions are signed out.`,
      label: 'Reset password',
      danger: true,
    },
  }[confirm?.type] || {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, email or GSTIN…" />
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button className="btn-secondary" onClick={() => exportCsv(companies)} disabled={companies.length === 0}>
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Company</th><th>Location</th><th>Users</th><th>Invoices</th>
                <th>Revenue</th><th>Status</th><th>Joined</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={6} cols={8} />}

              {!loading && companies.length === 0 && (
                <TableEmptyState
                  colSpan={8}
                  icon={Building2}
                  title={search || status ? 'No matching companies' : 'No companies yet'}
                  message={
                    search || status
                      ? 'Try a different search term or status filter.'
                      : 'Companies appear here as soon as they sign up on the platform.'
                  }
                />
              )}

              {!loading && companies.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/platform/companies/${c.id}`} className="block min-w-0">
                      <span className="font-medium text-ink hover:text-primary transition-colors">{c.name}</span>
                      <span className="block text-xs text-ink-subtle truncate">{c.email || c.business_type || '—'}</span>
                    </Link>
                  </td>
                  <td className="text-xs">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="tabular-nums">{c.user_count}</td>
                  <td className="tabular-nums">{c.invoice_count}</td>
                  <td className="tabular-nums font-medium text-ink">{inr(c.revenue)}</td>
                  <td><span className={`${statusBadge[c.status]} capitalize`}>{c.status}</span></td>
                  <td className="text-xs tabular-nums">{date(c.created_at)}</td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/platform/companies/${c.id}`}
                        title="View company"
                        className="h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle hover:text-primary hover:bg-primary-soft transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        title="Reset admin password"
                        onClick={() => setConfirm({ type: 'reset', company: c })}
                        className="h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle hover:text-primary hover:bg-primary-soft transition-colors"
                      >
                        <KeyRound size={14} />
                      </button>
                      {c.status === 'active' ? (
                        <button
                          title="Suspend company"
                          onClick={() => setConfirm({ type: 'suspend', company: c })}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle hover:text-warning hover:bg-warning-soft transition-colors"
                        >
                          <Ban size={14} />
                        </button>
                      ) : (
                        <button
                          title="Reactivate company"
                          onClick={() => setConfirm({ type: 'activate', company: c })}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle hover:text-success hover:bg-success-soft transition-colors"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                      <button
                        title="Delete company"
                        onClick={() => setConfirm({ type: 'delete', company: c })}
                        className="h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle hover:text-danger hover:bg-danger-soft transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.label}
        danger={confirmCopy.danger}
        onConfirm={runAction}
        onCancel={() => setConfirm(null)}
      />

      {/* Temporary password is shown exactly once. */}
      <Modal open={!!tempPassword} onClose={() => setTempPassword(null)} title="Temporary password issued">
        {tempPassword && (
          <div className="space-y-4">
            <p className="text-sm text-ink-muted">
              The admin of <span className="text-ink font-medium">{tempPassword.company}</span> can sign in with this
              password. It is shown only once — copy it now.
            </p>

            <div className="rounded-md border border-line bg-surface-2 px-4 py-3">
              <p className="text-xs text-ink-subtle mb-1">Admin account</p>
              <p className="text-sm text-ink font-medium">{tempPassword.name} · {tempPassword.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md border border-line bg-surface-2 px-4 py-3 text-sm font-mono text-ink select-all">
                {tempPassword.tempPassword}
              </code>
              <button
                className="btn-secondary !py-3"
                onClick={() => {
                  navigator.clipboard.writeText(tempPassword.tempPassword);
                  toast.success('Password copied.');
                }}
              >
                <Copy size={15} /> Copy
              </button>
            </div>

            <p className="text-xs text-warning">
              All existing sessions for this admin have been signed out.
            </p>

            <button className="btn-primary w-full" onClick={() => setTempPassword(null)}>Done</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
