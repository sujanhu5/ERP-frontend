import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PenLine, Eye, Heart, FileText,
  Plus, ArrowRight, Edit3, Globe, FolderOpen, Tag, Clock,
} from 'lucide-react';
import { blogAdminService } from '../../services';

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

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CMSDashboard() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      blogAdminService.stats(),
      blogAdminService.posts({ page: 1, limit: 6 }),
    ]).then(([s, p]) => {
      setStats(s.data.data);
      setPosts(p.data.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-7 max-w-5xl">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-ink">Blog CMS</h1>
          <p className="text-[13px] text-ink-muted mt-0.5">Create and manage articles for the public blog.</p>
        </div>
        <Link to="/platform/blog/new" className="btn-primary gap-2 shrink-0">
          <Plus size={16} /> New Post
        </Link>
      </div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Globe,    label: 'Published',   key: 'published',   color: 'text-success',    bg: 'bg-success/10' },
          { icon: Edit3,    label: 'Drafts',      key: 'drafts',      color: 'text-ink-muted',  bg: 'bg-surface-2' },
          { icon: Eye,      label: 'Total Views', key: 'total_views', color: 'text-primary',    bg: 'bg-primary-soft' },
          { icon: Heart,    label: 'Total Likes', key: 'total_likes', color: 'text-danger',     bg: 'bg-danger/10' },
        ].map(({ icon: Icon, label, key, color, bg }) => (
          <div key={key} className="bg-surface border border-line rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-[12px] text-ink-muted">{label}</p>
              <p className="text-[22px] font-bold text-ink leading-tight tabular-nums">
                {loading ? '—' : (stats?.[key] ?? 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick action tiles ───────────────────────────────── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { to: '/platform/blog/posts',      icon: FileText,   label: 'All Posts',   desc: 'Browse every article' },
          { to: '/platform/blog/new',        icon: PenLine,    label: 'Write New',   desc: 'Start from scratch' },
          { to: '/platform/blog/categories', icon: FolderOpen, label: 'Categories',  desc: 'Organise topics' },
          { to: '/platform/blog/tags',       icon: Tag,        label: 'Tags',        desc: 'Manage tag library' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to}
            className="group flex items-center gap-3 p-4 bg-surface border border-line rounded-xl hover:border-primary/40 hover:bg-primary-soft/20 transition-all">
            <div className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <Icon size={16} className="text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-ink">{label}</p>
              <p className="text-[11px] text-ink-muted">{desc}</p>
            </div>
            <ArrowRight size={14} className="text-ink-subtle group-hover:text-primary shrink-0 transition-colors" />
          </Link>
        ))}
      </div>

      {/* ── Recent posts ─────────────────────────────────────── */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <h2 className="text-[14px] font-semibold text-ink">Recent Posts</h2>
          <Link to="/platform/blog/posts" className="text-[12px] text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {loading ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="skeleton h-4 rounded flex-1" />
                <div className="skeleton h-5 w-20 rounded-full" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <PenLine size={36} className="mx-auto mb-3 text-ink-subtle opacity-30" />
            <p className="text-[14px] font-medium text-ink-muted mb-1">No posts yet</p>
            <p className="text-[12px] text-ink-subtle">Start writing to see your articles here.</p>
            <Link to="/platform/blog/new" className="btn-primary mt-5 inline-flex gap-2 !text-sm">
              <Plus size={14} /> Write your first post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {posts.map((p) => (
              <div key={p.id} className="group flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2 transition-colors">
                {/* Title + category */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">{p.title}</p>
                  {p.category_name && (
                    <p className="text-[11px] text-ink-subtle mt-0.5">{p.category_name}</p>
                  )}
                </div>

                {/* Status */}
                <StatusBadge status={p.status} />

                {/* Views */}
                <span className="hidden sm:flex items-center gap-1 text-[12px] text-ink-subtle w-16 shrink-0">
                  <Eye size={11} /> {(p.view_count || 0).toLocaleString()}
                </span>

                {/* Date */}
                <span className="hidden md:block text-[12px] text-ink-subtle w-28 shrink-0 text-right">
                  {formatDate(p.published_at || p.created_at)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Link to={`/platform/blog/edit/${p.id}`}
                    className="btn-ghost !py-1 !px-2.5 !text-xs">
                    Edit
                  </Link>
                  {p.status === 'published' && (
                    <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"
                      className="btn-ghost !py-1 !px-2.5 !text-xs">
                      View
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
