import { TriangleAlert } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Delete', danger = true }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <div className="panel w-full max-w-sm !shadow-overlay p-5">
        <div className="flex items-start gap-3.5">
          {danger && (
            <div className="h-9 w-9 rounded-md bg-danger-soft text-danger flex items-center justify-center shrink-0">
              <TriangleAlert size={18} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            <p className="text-sm text-ink-muted mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 mt-5">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
