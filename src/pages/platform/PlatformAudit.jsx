import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ScrollText } from 'lucide-react';
import { platformService } from '../../services';
import Pagination from '../../components/common/Pagination';
import { TableSkeletonRows, TableEmptyState } from '../../components/common/TableParts';

const dt = (d) => new Date(d).toLocaleString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

/** Destructive actions are tinted so they stand out when scanning the trail. */
const actionTone = (action) => {
  if (/DELETE|SUSPEND|RESET/.test(action)) return 'badge-danger';
  if (/CREATE|SIGNUP|REGISTER|ACTIVATE/.test(action)) return 'badge-success';
  if (/UPDATE|CHANGE/.test(action)) return 'badge-warning';
  return 'badge-neutral';
};

export default function PlatformAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await platformService.auditLogs({ page, limit: 15 });
      setLogs(data.data);
      setTotalPages(data.pagination.totalPages || 1);
      setTotal(data.pagination.total || 0);
    } catch {
      toast.error('Failed to load audit log.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Every action across every company, newest first.
        </p>
        {!loading && total > 0 && (
          <span className="text-xs text-ink-subtle tabular-nums">{total.toLocaleString('en-IN')} entries</span>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Action</th><th>User</th><th>Company</th><th>Entity</th><th>Details</th><th>When</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableSkeletonRows rows={8} cols={6} />}

              {!loading && logs.length === 0 && (
                <TableEmptyState
                  colSpan={6}
                  icon={ScrollText}
                  title="No activity recorded yet"
                  message="Logins, signups and every create, update and delete across the platform will appear here."
                />
              )}

              {!loading && logs.map((l) => (
                <tr key={l.id}>
                  <td><span className={`${actionTone(l.action)} font-mono`}>{l.action}</span></td>
                  <td className="text-ink">{l.user_name || '—'}</td>
                  <td>{l.company || <span className="text-ink-subtle">Platform</span>}</td>
                  <td className="text-xs">{l.entity || '—'}</td>
                  <td className="text-xs max-w-[240px] truncate">
                    {l.details && Object.keys(l.details).length > 0
                      ? Object.entries(l.details).map(([k, v]) => `${k}: ${v}`).join(', ')
                      : '—'}
                  </td>
                  <td className="text-xs tabular-nums whitespace-nowrap">{dt(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
