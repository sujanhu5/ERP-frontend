import { X } from 'lucide-react';

export default function Modal({ open, title, onClose, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 py-10 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`panel w-full ${maxWidth} !shadow-overlay`}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-surface-2 rounded-t-lg">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-surface-3 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
