import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Filter, Trash2, Globe, Edit3, Eye,
  CheckSquare, Square, ChevronLeft, ChevronRight, MoreHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blogAdminService } from '../../services';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }) {
  const map = { published: 'badge-success', draft: 'badge-neutral', scheduled: 'badge-warning' };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
}

export default function CMSPosts({ filter }) {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await blogAdminService.posts({
        page, limit: LIMIT, search: search || undefined,
        status: filter === 'drafts' ? 'draft' : undefined,
      });
      setPosts(data.data);
      setTotal(data.pagination.total);
    } catch {
      toast.error('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { setPage(1); }, [search, filter]);
  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelected(selected.length === posts.length ? [] : posts.map((p) => p.id));
  };

  const bulk = async (action) => {
    if (!selected.length) { toast.error('Select posts first.'); return; }
    try {
      await blogAdminService.bulk(action, selected);
      toast.success(`Done.`);
      setSelected([]);
      load();
    } catch {
      toast.error('Bulk action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await blogAdminService.remove(id);
      toast.success('Deleted.');
      load();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            {filter === 'drafts' ? 'Drafts' : 'All Posts'}
          </h1>
          <p className="text-sm text-ink-muted">{total} posts</p>
        </div>
        <Link to="/platform/blog/new" className="btn-primary gap-2">
          <Plus size={16} />New Post
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            className="input !pl-8"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[12px] text-ink-muted">{selected.length} selected</span>
            <button onClick={() => bulk('published')} className="btn-secondary !text-xs !py-1.5 gap-1.5"><Globe size={13} />Publish</button>
            <button onClick={() => bulk('draft')} className="btn-secondary !text-xs !py-1.5 gap-1.5"><Edit3 size={13} />Draft</button>
            <button onClick={() => bulk('delete')} className="btn-danger !text-xs !py-1.5 gap-1.5"><Trash2 size={13} />Delete</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="!pr-0 !pl-4 w-8">
                  <button onClick={toggleAll} className="text-ink-subtle hover:text-ink">
                    {selected.length === posts.length && posts.length > 0
                      ? <CheckSquare size={15} />
                      : <Square size={15} />}
                  </button>
                </th>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Views</th>
                <th>Date</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j}><div className="skeleton h-4 rounded" /></td>
                      ))}
                    </tr>
                  ))
                : posts.map((p) => (
                    <tr key={p.id}>
                      <td className="!pr-0 !pl-4 w-8">
                        <button onClick={() => toggleSelect(p.id)} className="text-ink-subtle hover:text-ink">
                          {selected.includes(p.id) ? <CheckSquare size={15} className="text-primary" /> : <Square size={15} />}
                        </button>
                      </td>
                      <td className="max-w-[260px]">
                        <div>
                          <span className="font-medium text-ink line-clamp-1">{p.title}</span>
                          {p.is_featured && <span className="ml-2 badge-warning text-[10px]">Featured</span>}
                          {p.is_pinned && <span className="ml-2 badge-neutral text-[10px]">Pinned</span>}
                        </div>
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="text-[12px] text-ink-subtle">{p.category_name || '—'}</td>
                      <td className="font-mono text-[12px]">{(p.view_count || 0).toLocaleString()}</td>
                      <td className="text-[12px] text-ink-subtle whitespace-nowrap">
                        {formatDate(p.published_at || p.created_at)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link to={`/platform/blog/edit/${p.id}`} className="btn-ghost !p-1.5" title="Edit">
                            <Edit3 size={14} />
                          </Link>
                          {p.status === 'published' && (
                            <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost !p-1.5" title="View">
                              <Eye size={14} />
                            </a>
                          )}
                          <button onClick={() => handleDelete(p.id)} className="btn-ghost !p-1.5 hover:text-danger" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              {!loading && !posts.length && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-ink-subtle text-sm">
                    No posts found.{' '}
                    <Link to="/platform/blog/new" className="text-primary hover:underline">Create one</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink-subtle">
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !p-1.5">
              <ChevronLeft size={15} />
            </button>
            <span className="text-[12px] text-ink-muted px-2">{page}/{totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary !p-1.5">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
