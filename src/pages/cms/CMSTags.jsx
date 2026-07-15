import { useState, useEffect } from 'react';
import { Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogAdminService } from '../../services';

export default function CMSTags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    blogAdminService.tags()
      .then(({ data }) => setTags(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm('Delete this tag? It will be removed from all posts.')) return;
    try {
      await blogAdminService.deleteTag(id);
      toast.success('Tag deleted.');
      load();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-ink">Blog Tags</h1>
        <p className="text-sm text-ink-muted mt-0.5">Tags are created automatically when added to posts.</p>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading
          ? <div className="p-5 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}</div>
          : tags.length === 0
            ? <p className="text-center py-10 text-ink-subtle text-sm">No tags yet. Add tags to posts.</p>
            : (
              <table className="table-base">
                <thead><tr><th>Tag</th><th>Slug</th><th>Posts</th><th></th></tr></thead>
                <tbody>
                  {tags.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <span className="badge-primary flex items-center gap-1 w-fit">
                          <Tag size={10} />{t.name}
                        </span>
                      </td>
                      <td className="font-mono text-[12px] text-ink-subtle">{t.slug}</td>
                      <td className="font-mono text-[12px]">{t.blog_count}</td>
                      <td>
                        <button onClick={() => remove(t.id)} className="btn-ghost !p-1.5 hover:text-danger">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </div>
    </div>
  );
}
