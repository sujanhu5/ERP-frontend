import { useCallback, useEffect, useState } from 'react';
import {
  Activity, FileText, CreditCard, UserPlus, Package, Trash2,
  LogIn, LogOut, KeyRound, Settings2, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { activityService } from '../../services';
import Pagination from '../../components/common/Pagination';
import { TableSkeletonRows, TableEmptyState } from '../../components/common/TableParts';
import { formatDateTime } from '../../utils/format';

/** Maps an audit action to an icon + tone, so the feed reads at a glance. */
const actionMeta = (action) => {
  const map = {
    LOGIN: [LogIn, 'text-primary bg-primary-soft'],
    LOGOUT: [LogOut, 'text-ink-subtle bg-surface-3'],
    SIGNUP: [UserPlus, 'text-success bg-success-soft'],
    REGISTER: [UserPlus, 'text-success bg-success-soft'],
    CHANGE_PASSWORD: [KeyRound, 'text-warning bg-warning-soft'],
    CREATE_INVOICE: [FileText, 'text-primary bg-primary-soft'],
    ADD_PAYMENT: [CreditCard, 'text-success bg-success-soft'],
    CREATE_CUSTOMER: [UserPlus, 'text-primary bg-primary-soft'],
    CREATE_EMPLOYEE: [UserPlus, 'text-primary bg-primary-soft'],
    CREATE_PRODUCT: [Package, 'text-primary bg-primary-soft'],
    UPDATE_SETTINGS: [Settings2, 'text-warning bg-warning-soft'],
  };
  if (map[action]) return map[action];
  if (/DELETE/.test(action)) return [Trash2, 'text-danger bg-danger-soft'];
  if (/UPDATE/.test(action)) return [Pencil, 'text-warning bg-warning-soft'];
  return [Activity, 'text-ink-subtle bg-surface-3'];
};

const humanAction = (action) =>
  action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const describe = (details) => {
  if (!details || typeof details !== 'object') return '';
  return details.invoiceNumber || details.name || details.companyName || details.email
    || Object.values(details)[0] || '';
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await activityService.list({ page, limit: 20 });
      setLogs(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setTotal(data.pagination.total || 0);
    } catch {
      toast.error('Failed to load activity.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">Everything that has happened in your workspace, newest first.</p>
        {!loading && total > 0 && (
          <span className="text-xs text-ink-subtle tabular-nums">{total.toLocaleString('en-IN')} events</span>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr><th>Activity</th><th>User</th><th>Reference</th><th>When</th></tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={8} cols={4} />}

              {!loading && logs.length === 0 && (
                <TableEmptyState
                  colSpan={4}
                  icon={Activity}
                  title="No activity yet"
                  message="Logins, invoices, and every create, update and delete will appear here as your team works."
                />
              )}

              {!loading && logs.map((l) => {
                const [Icon, tone] = actionMeta(l.action);
                return (
                  <tr key={l.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${tone}`}>
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-ink font-medium">{humanAction(l.action)}</p>
                          {l.entity && <p className="text-xs text-ink-subtle">{l.entity}</p>}
                        </div>
                      </div>
                    </td>
                    <td>{l.user_name || '—'}</td>
                    <td className="text-ink-muted">{describe(l.details) || '—'}</td>
                    <td className="text-xs tabular-nums whitespace-nowrap">{formatDateTime(l.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
