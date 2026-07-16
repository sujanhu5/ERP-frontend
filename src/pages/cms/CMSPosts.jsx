import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Trash2, Globe, Edit3, Eye,
  CheckSquare, Square, ChevronLeft, ChevronRight, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { blogAdminService } from '../../services';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_STYLE = {
  published: 'bg-success/10 text-success border border-success/25',
  draft:     'bg-surface-2 text-ink-muted border border-line',
  scheduled: 'bg-warning/10 text-warning border border-warning/25',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_STYLE[status] || STATUS_STYLE.draft}`}>
      {status === 'published' && <Globe size={9} />}
      {status === 'draft'     && <Edit3  size={9} />}
      {status === 'scheduled' && <Clock  size={9} />}
      {status}
    </span>
  );
}

const TABS = [
  { key: '',          label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft',     label: 'Drafts' },
  { key: 'scheduled', label: 'Scheduled' },
];

export default function CMSPosts({ filter }) {
  // If the route passed filter="drafts", default to draft tab
  const defaultTab = filter === 'drafts' ? 'draft' : '';
  const [tab, setTab]     = useState(defaultTab);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await blogAdminService.posts({
        page,
        limit: LIMIT,
        search: search || undefined,
        status: tab || undefined,
      });
      setPosts(data.data);
      setTotal(data.pagination.total);
    } catch {
      toast.error('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, [page, search, tab]);

  useEffect(() => { setPage(1); setSelected([]); }, [search, tab]);
  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === posts.length ? [] : posts.map((p) => p.id));

  const bulk = async (action) => {
    if (!selected.length) { toast.error('Select at least one post.'); return; }
    try {
      await blogAdminService.bulk(action, selected);
      toast.success(action === 'delete' ? 'Deleted.' : `Marked as ${action}.`);
      setSelected([]);
      load();
    } catch {
      toast.error('Action failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this post?')) return;
    try {
      await blogAdminService.remove(id);
      toast.success('Post deleted.');
      load();
    } catch {
      toast.error('Delete failed.');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5 max-w-5xl">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[22px] font-bold text-ink">Posts</h1>
        <Link to="/platform/blog/new" className="btn-primary gap-2 shrink-0">
          <Plus size={16} /> New Post
        </Link>
      </div>

      {/* ── Status tabs + search ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center bg-surface-2 rounded-lg p-1 gap-0.5">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all
                ${tab === key
                  ? 'bg-surface text-ink shadow-sm border border-line'
                  : 'text-ink-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none" />
          <input
            className="input !pl-8 !text-[13px]"
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Bulk actions (visible when rows selected) */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[12px] text-ink-muted">{selected.length} selected</span>
            <button onClick={() => bulk('published')} className="btn-secondary !text-xs !py-1.5 gap-1.5">
              <Globe size={12} /> Publish
            </button>
            <button onClick={() => bulk('draft')} className="btn-secondary !text-xs !py-1.5 gap-1.5">
              <Edit3 size={12} /> Unpublish
            </button>
            <button onClick={() => bulk('delete')} className="btn-danger !text-xs !py-1.5 gap-1.5">
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">

        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 bg-surface-2 border-b border-line text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
          <button onClick={toggleAll} className="shrink-0 text-ink-subtle hover:text-ink transition-colors">
            {selected.length > 0 && selected.length === posts.length
              ? <CheckSquare size={15} className="text-primary" />
              : <Square size={15} />}
          </button>
          <span className="flex-1">Title</span>
          <span className="w-[100px] shrink-0 hidden sm:block">Status</span>
          <span className="w-[110px] shrink-0 hidden md:block">Category</span>
          <span className="w-16 shrink-0 hidden lg:block">Views</span>
          <span className="w-28 shrink-0 hidden sm:block text-right">Date</span>
          <span className="w-24 shrink-0" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-line">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="skeleton h-4 w-4 rounded shrink-0" />
                <div className="skeleton h-4 rounded flex-1" />
                <div className="skeleton h-5 w-20 rounded-full hidden sm:block" />
                <div className="skeleton h-4 w-24 rounded hidden sm:block" />
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-[14px] font-medium text-ink-muted mb-1">No posts found</p>
              <p className="text-[12px] text-ink-subtle mb-5">
                {tab ? `No ${tab} posts yet.` : 'Start writing your first article.'}
              </p>
              <Link to="/platform/blog/new" className="btn-primary inline-flex gap-2 !text-sm">
                <Plus size={14} /> New Post
              </Link>
            </div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors">
                {/* Checkbox */}
                <button onClick={() => toggleSelect(p.id)} className="shrink-0 text-ink-subtle hover:text-ink transition-colors">
                  {selected.includes(p.id)
                    ? <CheckSquare size={15} className="text-primary" />
                    : <Square size={15} />}
                </button>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium text-ink truncate">{p.title}</span>
                    {p.is_featured && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 shrink-0">Featured</span>
                    )}
                    {p.is_pinned && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-surface-2 text-ink-muted border border-line shrink-0">Pinned</span>
                    )}
                  </div>
                  {p.excerpt && (
                    <p className="text-[11px] text-ink-subtle truncate mt-0.5 hidden sm:block">{p.excerpt}</p>
                  )}
                </div>

                {/* Status */}
                <div className="w-[100px] shrink-0 hidden sm:block">
                  <StatusBadge status={p.status} />
                </div>

                {/* Category */}
                <span className="w-[110px] shrink-0 hidden md:block text-[12px] text-ink-muted truncate">
                  {p.category_name || '—'}
                </span>

                {/* Views */}
                <span className="w-16 shrink-0 hidden lg:flex items-center gap-1 text-[12px] text-ink-subtle">
                  <Eye size={11} /> {(p.view_count || 0).toLocaleString()}
                </span>

                {/* Date */}
                <span className="w-28 shrink-0 hidden sm:block text-[12px] text-ink-subtle text-right">
                  {formatDate(p.published_at || p.created_at)}
                </span>

                {/* Row actions */}
                <div className="w-24 shrink-0 flex items-center justify-end gap-1">
                  <Link
                    to={`/platform/blog/edit/${p.id}`}
                    className="btn-ghost !p-1.5" title="Edit"
                  >
                    <Edit3 size={14} />
                  </Link>
                  {p.status === 'published' && (
                    <a
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost !p-1.5" title="View live"
                    >
                      <Eye size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="btn-ghost !p-1.5 hover:text-danger" title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Pagination ───────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-ink-subtle">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} posts
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary !p-1.5 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-[12px] text-ink-muted px-3 tabular-nums">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary !p-1.5 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
