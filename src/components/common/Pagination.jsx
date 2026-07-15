import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-line bg-surface-2">
      <span className="text-xs text-ink-muted">Page {page} of {totalPages}</span>
      <div className="flex gap-1.5">
        <button
          className="btn-secondary !px-2 !py-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={15} />
        </button>
        <button
          className="btn-secondary !px-2 !py-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
