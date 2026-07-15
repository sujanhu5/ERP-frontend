import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Globe, Edit3, Eye, Heart, Plus,
  TrendingUp, Tag, FolderOpen, Clock,
} from 'lucide-react';
import { blogAdminService } from '../../services';

function Stat({ icon: Icon, label, value, color = 'text-primary' }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`p-3 rounded-xl bg-surface-2 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-ink-subtle">{label}</p>
        <p className="text-2xl font-bold font-mono tabular-nums text-ink mt-0.5">
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value ?? '—'}
        </p>
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statusBadge(s) {
  const map = {
    published: 'badge-success',
    draft: 'badge-neutral',
    scheduled: 'badge-warning',
  };
  return <span className={`badge ${map[s] || 'badge-neutral'}`}>{s}</span>;
}

export default function CMSDashboard() {
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      blogAdminService.stats(),
      blogAdminService.posts({ page: 1, limit: 8 }),
    ])
      .then(([s, p]) => {
        setStats(s.data.data);
        setPosts(p.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Blog CMS</h1>
          <p className="text-sm text-ink-muted mt-0.5">Manage all blog posts, categories, and tags.</p>
        </div>
        <Link to="/platform/blog/new" className="btn-primary gap-2">
          <Plus size={16} /> New Post
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Stat icon={FileText} label="Total Posts" value={stats?.total} />
          <Stat icon={Globe} label="Published" value={stats?.published} color="text-success" />
          <Stat icon={Edit3} label="Drafts" value={stats?.drafts} color="text-ink-muted" />
          <Stat icon={Clock} label="Scheduled" value={stats?.scheduled} color="text-warning" />
          <Stat icon={Eye} label="Total Views" value={stats?.total_views} color="text-teal" />
          <Stat icon={Heart} label="Total Likes" value={stats?.total_likes} color="text-danger" />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/platform/blog', label: 'All Posts', icon: FileText },
          { to: '/platform/blog/drafts', label: 'Drafts', icon: Edit3 },
          { to: '/platform/blog/categories', label: 'Categories', icon: FolderOpen },
          { to: '/platform/blog/tags', label: 'Tags', icon: Tag },
        ].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="card flex items-center gap-3 hover:border-primary transition-colors group">
            <Icon size={16} className="text-ink-subtle group-hover:text-primary transition-colors" />
            <span className="text-[13px] font-medium text-ink-muted group-hover:text-ink">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent posts */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
          <h2 className="text-[14px] font-semibold text-ink flex items-center gap-2"><TrendingUp size={15} />Recent Posts</h2>
          <Link to="/platform/blog" className="text-[12px] text-primary hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Category</th>
                <th>Views</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id}>
                  <td className="max-w-xs">
                    <span className="font-medium text-ink line-clamp-1">{p.title}</span>
                  </td>
                  <td>{statusBadge(p.status)}</td>
                  <td className="text-ink-subtle text-[12px]">{p.category_name || '—'}</td>
                  <td className="font-mono text-[12px]">{(p.view_count || 0).toLocaleString()}</td>
                  <td className="text-ink-subtle text-[12px] whitespace-nowrap">{formatDate(p.published_at || p.created_at)}</td>
                  <td>
                    <Link to={`/platform/blog/edit/${p.id}`} className="btn-ghost !py-1 !px-2 !text-xs">Edit</Link>
                  </td>
                </tr>
              ))}
              {!posts.length && (
                <tr><td colSpan={6} className="text-center py-8 text-ink-subtle text-sm">No posts yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
