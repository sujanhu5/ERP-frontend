import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderOpen, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogAdminService } from '../../services';

const COLORS = ['#D62828','#0E7C7B','#7C5CD6','#B45309','#0E7C4A','#2563EB','#DB2777','#EA580C'];

export default function CMSCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', color: '#D62828' });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    blogAdminService.categories()
      .then(({ data }) => setCategories(data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (cat) => {
    setEditing(cat.id);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#D62828' });
  };

  const cancelEdit = () => { setEditing(null); setForm({ name: '', description: '', color: '#D62828' }); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name required.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await blogAdminService.updateCategory(editing, form);
        toast.success('Updated.');
        cancelEdit();
      } else {
        await blogAdminService.createCategory(form);
        toast.success('Created.');
        setForm({ name: '', description: '', color: '#D62828' });
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await blogAdminService.deleteCategory(id);
      toast.success('Deleted.');
      load();
    } catch {
      toast.error('Delete failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-ink">Blog Categories</h1>

      {/* Create form */}
      <div className="card">
        <h2 className="text-[14px] font-semibold text-ink mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Name *</label>
              <input className="input" placeholder="e.g. Product Updates" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex items-center gap-2 flex-wrap mt-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ background: c, borderColor: form.color === c ? c : 'transparent', outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="Optional description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              {editing ? <><Check size={14} />Update</> : <><Plus size={14} />Create</>}
            </button>
            {editing && <button type="button" onClick={cancelEdit} className="btn-secondary gap-2"><X size={14} />Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="card !p-0 overflow-hidden">
        {loading
          ? <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}</div>
          : categories.length === 0
            ? <p className="text-center py-10 text-ink-subtle text-sm">No categories yet.</p>
            : (
              <table className="table-base">
                <thead><tr><th>Name</th><th>Slug</th><th>Posts</th><th></th></tr></thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                          <span className="font-medium text-ink">{c.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-[12px] text-ink-subtle">{c.slug}</td>
                      <td className="font-mono text-[12px]">{c.blog_count}</td>
                      <td>
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(c)} className="btn-ghost !p-1.5"><Pencil size={13} /></button>
                          <button onClick={() => remove(c.id)} className="btn-ghost !p-1.5 hover:text-danger"><Trash2 size={13} /></button>
                        </div>
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
