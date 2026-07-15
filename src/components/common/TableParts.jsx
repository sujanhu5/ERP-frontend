import { Pencil, Trash2, Eye } from 'lucide-react';
import { Skeleton } from './Spinner';

/** Shimmering rows shown while a table's data is loading. */
export function TableSkeletonRows({ rows = 6, cols = 5 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r}>
      {Array.from({ length: cols }).map((_, c) => (
        <td key={c}>
          <Skeleton className={`h-3.5 ${c === 0 ? 'w-40' : 'w-16'}`} />
        </td>
      ))}
    </tr>
  ));
}

/** Centered empty state for a table body. */
export function TableEmptyState({ colSpan, icon: Icon, title, message, action }) {
  return (
    <tr className="hover:!bg-transparent">
      <td colSpan={colSpan} className="!border-b-0 hover:!bg-transparent">
        <div className="flex flex-col items-center justify-center text-center py-14 px-6">
          {Icon && (
            <div className="h-11 w-11 rounded-lg bg-surface-2 border border-line flex items-center justify-center mb-3.5">
              <Icon size={20} className="text-ink-subtle" />
            </div>
          )}
          <p className="text-sm font-medium text-ink">{title}</p>
          {message && <p className="text-xs text-ink-subtle mt-1 max-w-xs">{message}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </td>
    </tr>
  );
}

/** Consistent row action buttons. */
export function RowAction({ type = 'edit', onClick, title }) {
  const map = {
    view: { Icon: Eye, cls: 'hover:text-primary hover:bg-primary-soft' },
    edit: { Icon: Pencil, cls: 'hover:text-primary hover:bg-primary-soft' },
    delete: { Icon: Trash2, cls: 'hover:text-danger hover:bg-danger-soft' },
  };
  const { Icon, cls } = map[type];
  return (
    <button
      onClick={onClick}
      title={title || type}
      className={`h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle transition-colors ${cls}`}
    >
      <Icon size={14} />
    </button>
  );
}
