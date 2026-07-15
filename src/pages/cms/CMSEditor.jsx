import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Images, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogEditor from '../../components/editor/BlogEditor';
import BlogSettings from '../../components/editor/BlogSettings';
import MediaLibrary from '../../components/editor/MediaLibrary';
import { blogAdminService } from '../../services';
import { useAuth } from '../../context/AuthContext';

export default function CMSEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentJson, setContentJson] = useState(null);
  const [settings, setSettings] = useState({ status: 'draft', tags: [] });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [showMedia, setShowMedia] = useState(false);
  const [dirty, setDirty] = useState(false);
  const autoSaveRef = useRef(null);

  // Load existing post
  useEffect(() => {
    if (!isEdit) return;
    blogAdminService.post(id).then(({ data }) => {
      const p = data.data;
      setTitle(p.title || '');
      setContent(p.content || '');
      setContentJson(p.content_json);
      setSettings({
        status: p.status,
        categoryId: p.category_id,
        featuredImage: p.featured_image,
        excerpt: p.excerpt,
        metaTitle: p.meta_title,
        metaDescription: p.meta_description,
        focusKeyword: p.focus_keyword,
        isPinned: p.is_pinned,
        isFeatured: p.is_featured,
        scheduledAt: p.scheduled_at,
        tags: (p.tags || []).map((t) => t.name),
      });
    }).catch(() => toast.error('Failed to load post.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const buildFormData = useCallback(() => {
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('content', content);
    if (contentJson) fd.append('contentJson', JSON.stringify(contentJson));
    if (settings.categoryId) fd.append('categoryId', settings.categoryId);
    fd.append('status', settings.status || 'draft');
    if (settings.excerpt) fd.append('excerpt', settings.excerpt);
    if (settings.metaTitle) fd.append('metaTitle', settings.metaTitle);
    if (settings.metaDescription) fd.append('metaDescription', settings.metaDescription);
    if (settings.focusKeyword) fd.append('focusKeyword', settings.focusKeyword);
    if (settings.featuredImage) fd.append('featuredImage', settings.featuredImage);
    fd.append('isPinned', settings.isPinned || false);
    fd.append('isFeatured', settings.isFeatured || false);
    if (settings.scheduledAt) fd.append('scheduledAt', settings.scheduledAt);
    if (settings.tags?.length) fd.append('tags', JSON.stringify(settings.tags));
    return fd;
  }, [title, content, contentJson, settings]);

  const save = useCallback(async (opts = {}) => {
    if (!title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const fd = buildFormData();
      if (isEdit) {
        await blogAdminService.update(id, fd);
        if (!opts.silent) toast.success('Post updated.');
      } else {
        const { data } = await blogAdminService.create(fd);
        toast.success('Post created!');
        navigate(`/platform/blog/edit/${data.data.id}`, { replace: true });
      }
      setDirty(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Save failed.';
      if (!opts.silent) toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [buildFormData, id, isEdit, navigate, title]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  const handleEditorChange = ({ html, json }) => {
    setContent(html);
    setContentJson(json);
    setDirty(true);
  };

  const handleAutoSave = useCallback(async ({ html, json }) => {
    if (!isEdit || !title.trim()) return;
    setContent(html);
    setContentJson(json);
    // Silent save only for drafts
    if (settings.status === 'draft') {
      await save({ silent: true });
    }
  }, [isEdit, title, settings.status, save]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -mx-4 lg:-mx-6 -mt-4 lg:-mt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-line bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/platform/blog')} className="btn-ghost !p-1.5 shrink-0">
            <ArrowLeft size={17} />
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setDirty(true); }}
            placeholder="Post title…"
            className="text-[18px] font-semibold text-ink bg-transparent border-none outline-none w-full min-w-0 placeholder:text-ink-subtle"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && <span className="text-[11px] text-ink-subtle hidden sm:block">Unsaved changes</span>}
          <button onClick={() => setShowMedia(true)} className="btn-secondary !py-1.5 !px-3 !text-xs gap-1.5">
            <Images size={14} /> Media
          </button>
          {settings.status === 'published' && (
            <a href={`/blog/${id}`} target="_blank" rel="noopener noreferrer" className="btn-secondary !py-1.5 !px-3 !text-xs gap-1.5">
              <Eye size={14} /> Preview
            </a>
          )}
          <button onClick={() => save()} disabled={saving} className="btn-primary !py-1.5 !px-4 !text-xs gap-1.5 min-w-[80px]">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Body: editor + settings panel */}
      <div className="flex flex-1 min-h-0">
        {/* Editor */}
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          <BlogEditor
            content={content}
            onChange={handleEditorChange}
            onSave={handleAutoSave}
          />
        </div>

        {/* Settings panel */}
        <div className="w-72 xl:w-80 shrink-0 overflow-hidden flex flex-col">
          <BlogSettings
            value={settings}
            onChange={(patch) => { setSettings(patch); setDirty(true); }}
          />
        </div>
      </div>

      {/* Media library modal */}
      {showMedia && (
        <MediaLibrary
          onSelect={(url) => {
            // Insert into editor via clipboard-style approach
            toast.success('Image URL copied — paste into editor.');
            navigator.clipboard?.writeText(url);
          }}
          onClose={() => setShowMedia(false)}
        />
      )}
    </div>
  );
}
