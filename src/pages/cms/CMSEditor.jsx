import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, Eye, Loader2, Upload, X,
  Tag, FolderOpen, FileText, Star, Pin, Globe, Edit3,
  ChevronDown, ChevronUp, GripVertical, Clock, Calendar, User, MessageCircle, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BlogEditor from '../../components/editor/BlogEditor';
import MediaLibrary from '../../components/editor/MediaLibrary';
import { blogAdminService } from '../../services';
import { resolveMediaUrl } from '../../utils/media';

// ── Sidebar helpers ───────────────────────────────────────────────────────────
function Label({ children }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle mb-1.5">{children}</p>;
}

function SeoSection({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const v = value || {};
  return (
    <div className="border-t border-line pt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-[11px] font-semibold uppercase tracking-wide text-ink-subtle hover:text-ink transition-colors mb-1"
      >
        <span className="flex items-center gap-1.5"><Globe size={11} /> SEO Settings</span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && (
        <div className="space-y-3 mt-3">
          <div>
            <Label>Meta Title</Label>
            <input className="input !text-[13px]" placeholder="60 chars max" maxLength={60}
              value={v.metaTitle || ''} onChange={(e) => onChange({ metaTitle: e.target.value })} />
            <p className="text-[10px] text-ink-subtle mt-1">{(v.metaTitle||'').length}/60</p>
          </div>
          <div>
            <Label>Meta Description</Label>
            <textarea className="input !text-[13px] resize-none" rows={3} placeholder="160 chars max" maxLength={160}
              value={v.metaDescription || ''} onChange={(e) => onChange({ metaDescription: e.target.value })} />
            <p className="text-[10px] text-ink-subtle mt-1">{(v.metaDescription||'').length}/160</p>
          </div>
          <div>
            <Label>Focus Keyword</Label>
            <input className="input !text-[13px]" placeholder="Primary keyword"
              value={v.focusKeyword || ''} onChange={(e) => onChange({ focusKeyword: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CMSEditor() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const [title, setTitle]             = useState('');
  const [content, setContent]         = useState('');
  const [contentJson, setContentJson] = useState(null);
  const [settings, setSettings]       = useState({ status: 'draft', tags: [], authorDisplayName: '' });
  const [comments, setComments]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [tagInput, setTagInput]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [loading, setLoading]         = useState(isEdit);
  const [imgUploading, setImgUploading] = useState(false);
  const [showMedia, setShowMedia]     = useState(false);
  const [dirty, setDirty]             = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(272);
  const titleRef    = useRef(null);
  const dragRef     = useRef({ dragging: false, startX: 0, startWidth: 0 });

  const onDragStart = (e) => {
    dragRef.current = { dragging: true, startX: e.clientX, startWidth: sidebarWidth };
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev) => {
      if (!dragRef.current.dragging) return;
      const delta = dragRef.current.startX - ev.clientX;
      setSidebarWidth(Math.min(520, Math.max(200, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Load categories
  useEffect(() => {
    blogAdminService.categories().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  // Load comments for existing post
  useEffect(() => {
    if (!isEdit) return;
    blogAdminService.postComments(id).then(({ data }) => setComments(data.data)).catch(() => {});
  }, [id, isEdit]);

  // Load post if editing
  useEffect(() => {
    if (!isEdit) return;
    blogAdminService.post(id).then(({ data }) => {
      const p = data.data;
      setTitle(p.title || '');
      setContent(p.content || '');
      setContentJson(p.content_json);
      setSettings({
        status: p.status,
        slug: p.slug,
        categoryId: p.category_id,
        featuredImage: p.featured_image,
        authorDisplayName: p.author_display_name || '',
        excerpt: p.excerpt,
        metaTitle: p.meta_title,
        metaDescription: p.meta_description,
        focusKeyword: p.focus_keyword,
        isPinned: p.is_pinned,
        isFeatured: p.is_featured,
        scheduledAt: p.scheduled_at,
        tags: (p.tags || []).map((t) => t.name),
      });
    }).catch(() => toast.error('Failed to load post.')).finally(() => setLoading(false));
  }, [id, isEdit]);

  const patch = (update) => { setSettings((s) => ({ ...s, ...update })); setDirty(true); };

  // Featured image upload
  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await blogAdminService.uploadImage(fd);
      patch({ featuredImage: data.data.url });
    } catch { toast.error('Image upload failed.'); }
    finally { setImgUploading(false); }
  };

  // Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (!t || settings.tags?.includes(t)) { setTagInput(''); return; }
    patch({ tags: [...(settings.tags || []), t] });
    setTagInput('');
  };
  const removeTag = (t) => patch({ tags: (settings.tags || []).filter((x) => x !== t) });

  // Build FormData for save
  const buildFormData = useCallback((overrides = {}) => {
    const fd = new FormData();
    const s  = { ...settings, ...overrides };
    fd.append('title',   title.trim());
    fd.append('content', content);
    if (contentJson) fd.append('contentJson', JSON.stringify(contentJson));
    fd.append('status',    s.status || 'draft');
    if (s.status === 'published') fd.append('publishedAt', new Date().toISOString());
    fd.append('authorDisplayName', s.authorDisplayName || '');
    if (s.categoryId)      fd.append('categoryId',      s.categoryId);
    if (s.excerpt)         fd.append('excerpt',         s.excerpt);
    if (s.metaTitle)       fd.append('metaTitle',       s.metaTitle);
    if (s.metaDescription) fd.append('metaDescription', s.metaDescription);
    if (s.focusKeyword)    fd.append('focusKeyword',    s.focusKeyword);
    if (s.featuredImage)   fd.append('featuredImage',   s.featuredImage);
    fd.append('isPinned',   s.isPinned  || false);
    fd.append('isFeatured', s.isFeatured || false);
    if (s.scheduledAt)   fd.append('scheduledAt', s.scheduledAt);
    if (s.tags?.length)  fd.append('tags', JSON.stringify(s.tags));
    return fd;
  }, [title, content, contentJson, settings]);

  const save = useCallback(async (overrides = {}, silent = false) => {
    if (!title.trim()) { toast.error('Please add a title first.'); return; }
    setSaving(true);
    try {
      const fd = buildFormData(overrides);
      if (isEdit) {
        await blogAdminService.update(id, fd);
        if (!silent) toast.success(overrides.status === 'published' ? '🎉 Post published!' : 'Saved.');
      } else {
        const { data } = await blogAdminService.create(fd);
        toast.success(overrides.status === 'published' ? '🎉 Post published!' : 'Draft saved.');
        navigate(`/platform/blog/edit/${data.data.id}`, { replace: true });
      }
      if (overrides.status) setSettings((s) => ({ ...s, status: overrides.status }));
      setDirty(false);
    } catch (err) {
      if (!silent) toast.error(err.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  }, [buildFormData, id, isEdit, navigate, title]);

  // Ctrl/Cmd+S
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  // Auto-save drafts
  const handleEditorChange = ({ html, json }) => { setContent(html); setContentJson(json); setDirty(true); };
  const handleAutoSave = useCallback(async ({ html, json }) => {
    if (!isEdit || !title.trim() || settings.status !== 'draft') return;
    setContent(html); setContentJson(json);
    await save({}, true);
  }, [isEdit, title, settings.status, save]);

  const isPublished = settings.status === 'published';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] -mx-4 lg:-mx-6 -mt-4 lg:-mt-6">

      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 h-14 border-b border-line bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/platform/blog/posts')} className="btn-ghost !p-1.5 shrink-0" title="Back to posts">
            <ArrowLeft size={17} />
          </button>
          <span className="text-[13px] text-ink-muted hidden sm:block truncate max-w-xs">
            {title.trim() || 'New Post'}
          </span>
          {/* Status pill */}
          <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border shrink-0
            ${isPublished
              ? 'bg-success/10 text-success border-success/25'
              : 'bg-surface-2 text-ink-muted border-line'}`}>
            {isPublished ? <Globe size={9} /> : <Edit3 size={9} />}
            {settings.status}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {dirty && <span className="text-[11px] text-ink-subtle hidden md:block">Unsaved</span>}

          <button
            onClick={() => setShowPreview(true)}
            className="btn-ghost !py-1.5 !px-3 !text-xs gap-1.5"
            title="Preview post"
          >
            <Eye size={13} /> Preview
          </button>

          {isPublished && (
            <a href={`/blog/${settings.slug}`} target="_blank" rel="noopener noreferrer"
              className="btn-ghost !py-1.5 !px-3 !text-xs gap-1.5" title="View live post">
              <Globe size={13} /> View Live
            </a>
          )}

          <button onClick={() => save()} disabled={saving}
            className="btn-secondary !py-1.5 !px-3 !text-xs gap-1.5">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? 'Saving…' : 'Save Draft'}
          </button>

          {!isPublished ? (
            <button onClick={() => save({ status: 'published' })} disabled={saving}
              className="btn-primary !py-1.5 !px-4 !text-xs gap-1.5">
              <Globe size={12} /> Publish
            </button>
          ) : (
            <button onClick={() => save()} disabled={saving}
              className="btn-primary !py-1.5 !px-4 !text-xs gap-1.5">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              Update
            </button>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Editor column ────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">

          {/* Featured image zone */}
          <div className="px-8 pt-6 shrink-0">
            {settings.featuredImage ? (
              /* Compact strip — keeps writing space free */
              <div className="flex items-center gap-3 mb-4 px-3 py-2 rounded-xl bg-surface-2 border border-line">
                <div className="w-14 h-10 rounded-lg overflow-hidden bg-surface shrink-0">
                  <img src={resolveMediaUrl(settings.featuredImage)} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="flex-1 text-[12px] text-ink-muted truncate min-w-0">
                  {settings.featuredImage.startsWith('http') ? settings.featuredImage : 'Local upload'}
                </p>
                <label className="btn-secondary !py-1 !px-2.5 !text-[11px] cursor-pointer gap-1 shrink-0">
                  <Upload size={10} /> Change
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} disabled={imgUploading} />
                </label>
                <button onClick={() => patch({ featuredImage: '' })}
                  className="btn-ghost !p-1.5 text-ink-subtle hover:text-danger shrink-0" title="Remove image">
                  <X size={14} />
                </button>
              </div>
            ) : (
              /* Compact upload zone — URL paste is in the sidebar */
              <label className={`flex items-center gap-3 mb-4 px-4 rounded-xl border-2 border-dashed
                border-line hover:border-primary/40 hover:bg-primary-soft/20 cursor-pointer transition-all
                ${imgUploading ? 'opacity-60 pointer-events-none' : ''}`}
                style={{ height: 64 }}>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} disabled={imgUploading} />
                {imgUploading ? (
                  <Loader2 size={18} className="animate-spin text-primary" />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                    <Upload size={13} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-ink">Click to upload a featured image</p>
                  <p className="text-[11px] text-ink-subtle">Or paste a URL in the sidebar</p>
                </div>
              </label>
            )}

            {/* Title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setDirty(true); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              placeholder="Post title…"
              rows={1}
              className="w-full text-[28px] sm:text-[34px] font-bold text-ink bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-ink-subtle leading-tight mb-4"
              style={{ lineHeight: 1.2 }}
            />
          </div>

          {/* Rich text editor */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden border-t border-line">
            <BlogEditor
              content={content}
              onChange={handleEditorChange}
              onSave={handleAutoSave}
            />
          </div>
        </div>

        {/* ── Drag handle ──────────────────────────────────── */}
        <div
          onMouseDown={onDragStart}
          className="group w-1.5 shrink-0 bg-line hover:bg-primary/40 cursor-col-resize transition-colors relative flex items-center justify-center"
          title="Drag to resize"
        >
          <GripVertical size={12} className="text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity absolute" />
        </div>

        {/* ── Settings sidebar ─────────────────────────────── */}
        <aside style={{ width: sidebarWidth }} className="shrink-0 bg-surface border-l border-line flex flex-col overflow-y-auto">
          <div className="px-4 py-3.5 border-b border-line shrink-0">
            <p className="text-[13px] font-semibold text-ink">Post Settings</p>
          </div>

          <div className="flex-1 px-4 py-4 space-y-5 overflow-y-auto">

            {/* Author */}
            <div>
              <Label><span className="flex items-center gap-1"><User size={10} /> Author Name</span></Label>
              <input
                className="input !text-[13px]"
                placeholder="e.g. Sujan Humagain"
                value={settings.authorDisplayName || ''}
                onChange={(e) => patch({ authorDisplayName: e.target.value })}
              />
              <p className="text-[10px] text-ink-subtle mt-1">Shown at the bottom of the published post.</p>
            </div>

            {/* Featured image URL fallback */}
            <div>
              <Label>Featured Image URL</Label>
              <input
                type="url"
                className="input !text-[12px]"
                placeholder="Or paste an image URL here…"
                value={settings.featuredImage || ''}
                onChange={(e) => patch({ featuredImage: e.target.value })}
              />
              <p className="text-[10px] text-ink-subtle mt-1">This is the thumbnail shown in the blog listing.</p>
            </div>

            {/* Category */}
            <div>
              <Label><span className="flex items-center gap-1"><FolderOpen size={10} /> Category</span></Label>
              <select className="input !text-[13px]" value={settings.categoryId || ''}
                onChange={(e) => patch({ categoryId: e.target.value })}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Tags */}
            <div>
              <Label><span className="flex items-center gap-1"><Tag size={10} /> Tags</span></Label>
              <div className="flex gap-1.5">
                <input
                  className="input flex-1 !text-[13px]"
                  placeholder="e.g. GST, Finance…"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="btn-secondary !px-2.5 !text-xs">Add</button>
              </div>
              {settings.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {settings.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-soft text-primary text-[11px] font-medium border border-primary/20">
                      {t}
                      <button type="button" onClick={() => removeTag(t)} className="hover:text-danger ml-0.5"><X size={9} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <Label><span className="flex items-center gap-1"><FileText size={10} /> Excerpt</span></Label>
              <textarea
                className="input !text-[12px] resize-none"
                rows={3}
                placeholder="A short summary shown on the blog listing page…"
                value={settings.excerpt || ''}
                onChange={(e) => patch({ excerpt: e.target.value })}
              />
            </div>

            {/* Visibility options */}
            <div className="space-y-2.5">
              <Label>Options</Label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={settings.isFeatured || false}
                  onChange={(e) => patch({ isFeatured: e.target.checked })}
                  className="w-3.5 h-3.5 rounded accent-primary" />
                <div>
                  <p className="text-[12px] font-medium text-ink flex items-center gap-1"><Star size={11} className="text-warning" /> Feature this post</p>
                  <p className="text-[10px] text-ink-subtle">Shows at the top of the blog page</p>
                </div>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={settings.isPinned || false}
                  onChange={(e) => patch({ isPinned: e.target.checked })}
                  className="w-3.5 h-3.5 rounded accent-primary" />
                <div>
                  <p className="text-[12px] font-medium text-ink flex items-center gap-1"><Pin size={11} /> Pin to top</p>
                  <p className="text-[10px] text-ink-subtle">Always appears first in the list</p>
                </div>
              </label>
            </div>

            {/* Divider + publish status */}
            <div className="border-t border-line pt-4">
              <Label>Publish Status</Label>
              <div className={`flex items-center gap-2 p-3 rounded-lg border text-[12px] font-medium
                ${isPublished ? 'bg-success/5 border-success/20 text-success' : 'bg-surface-2 border-line text-ink-muted'}`}>
                {isPublished ? <Globe size={13} /> : <Edit3 size={13} />}
                {isPublished ? 'Published — visible to everyone' : 'Draft — not visible to the public'}
              </div>
              {isPublished && settings.slug && (
                <a href={`/blog/${settings.slug}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary hover:underline mt-2">
                  <Eye size={10} /> View live post
                </a>
              )}
            </div>

            {/* SEO — collapsed by default */}
            <SeoSection value={settings} onChange={patch} />

            {/* Comments — only when editing */}
            {isEdit && (
              <div className="border-t border-line pt-4">
                <Label>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={10} /> Comments ({comments.length})
                  </span>
                </Label>
                {comments.length === 0 ? (
                  <p className="text-[11px] text-ink-subtle">No comments yet.</p>
                ) : (
                  <div className="space-y-2 mt-1">
                    {comments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-2 border border-line">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-ink truncate">{c.name}</p>
                          <p className="text-[11px] text-ink-muted mt-0.5 line-clamp-2">{c.content}</p>
                        </div>
                        <button
                          onClick={async () => {
                            if (!window.confirm('Delete this comment?')) return;
                            try {
                              await blogAdminService.deleteComment(c.id);
                              setComments((prev) => prev.filter((x) => x.id !== c.id));
                              toast.success('Comment deleted.');
                            } catch { toast.error('Delete failed.'); }
                          }}
                          className="shrink-0 text-ink-subtle hover:text-danger transition-colors p-0.5"
                          title="Delete comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Media library */}
      {showMedia && (
        <MediaLibrary
          onSelect={(url) => { navigator.clipboard?.writeText(url); toast.success('Image URL copied — paste into editor.'); }}
          onClose={() => setShowMedia(false)}
        />
      )}

      {/* ── Preview overlay ───────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0A0F1A] text-white">
          {/* Preview top bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 h-12 bg-[#0A0F1A]/90 backdrop-blur border-b border-white/[0.07]">
            <div className="flex items-center gap-2 text-[12px] text-white/40">
              <span className="px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 text-[11px] font-medium">Preview — not published</span>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white transition-colors"
            >
              <X size={14} /> Close preview
            </button>
          </div>

          {/* Article */}
          <div className="max-w-3xl mx-auto px-5 py-12">
            {/* Meta */}
            <div className="mb-6">
              {settings.categoryId && categories.find(c => c.id === settings.categoryId) && (
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide mb-4 bg-primary/10 text-primary border border-primary/20">
                  {categories.find(c => c.id === settings.categoryId)?.name}
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-snug mb-5 text-white">
                {title || <span className="text-white/30 italic">No title yet…</span>}
              </h1>
              {settings.excerpt && (
                <p className="text-white/60 text-[18px] leading-relaxed mb-6">{settings.excerpt}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-white/40 text-[13px] pb-6 border-b border-white/[0.08]">
                <span className="flex items-center gap-1"><Calendar size={12} />Draft preview</span>
                <span className="flex items-center gap-1"><Clock size={12} />~1 min read</span>
                {settings.tags?.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {settings.tags.map((t) => (
                      <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 text-[11px]">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Featured image */}
            {settings.featuredImage && (
              <div className="rounded-xl overflow-hidden mb-8 aspect-video bg-[#0E1B2C]">
                <img src={resolveMediaUrl(settings.featuredImage)} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Body */}
            {content
              ? <div className="blog-prose" dangerouslySetInnerHTML={{ __html: content }} />
              : <p className="text-white/20 italic text-lg text-center py-20">Start writing to see your content here…</p>
            }

            {/* Back */}
            <div className="mt-16 pt-8 border-t border-white/[0.08]">
              <button onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white transition-colors">
                <ArrowLeft size={15} /> Back to editor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
