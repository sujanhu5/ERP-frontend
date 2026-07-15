import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Tag, FolderOpen, Image, Globe, BookOpen,
  Star, Pin, Clock, ChevronDown, ChevronUp, X,
} from 'lucide-react';
import { blogAdminService } from '../../services';
import toast from 'react-hot-toast';

const STATUSES = [
  { value: 'draft', label: 'Draft', color: 'text-ink-muted' },
  { value: 'published', label: 'Published', color: 'text-success' },
  { value: 'scheduled', label: 'Scheduled', color: 'text-warning' },
];

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted hover:text-ink transition-colors"
      >
        <span className="flex items-center gap-2"><Icon size={13} />{title}</span>
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export default function BlogSettings({ value, onChange, onFeaturedImageUpload }) {
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(value?.tags || []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    blogAdminService.categories().then(({ data }) => setCategories(data.data)).catch(() => {});
  }, []);

  // Sync tags from value
  useEffect(() => {
    setTags(value?.tags || []);
  }, [value?.tags]);

  const emit = (patch) => onChange?.({ ...value, ...patch });

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag)) { setTagInput(''); return; }
    const next = [...tags, tag];
    setTags(next);
    setTagInput('');
    emit({ tags: next });
  };

  const removeTag = (t) => {
    const next = tags.filter((x) => x !== t);
    setTags(next);
    emit({ tags: next });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await blogAdminService.uploadImage(fd);
      emit({ featuredImage: data.data.url });
      onFeaturedImageUpload?.(data.data.url);
    } catch {
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const v = value || {};

  return (
    <div className="flex flex-col bg-surface border-l border-line h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-line shrink-0">
        <h3 className="text-[13px] font-semibold text-ink">Post Settings</h3>
      </div>

      {/* Status */}
      <Section title="Status & Visibility" icon={Globe}>
        <Field label="Status">
          <select
            className="input"
            value={v.status || 'draft'}
            onChange={(e) => emit({ status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        {v.status === 'scheduled' && (
          <Field label="Publish Date">
            <input
              type="datetime-local"
              className="input"
              value={v.scheduledAt || ''}
              onChange={(e) => emit({ scheduledAt: e.target.value })}
            />
          </Field>
        )}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={v.isFeatured || false}
            onChange={(e) => emit({ isFeatured: e.target.checked })}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-[13px] text-ink-muted flex items-center gap-1.5"><Star size={13} />Featured post</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={v.isPinned || false}
            onChange={(e) => emit({ isPinned: e.target.checked })}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-[13px] text-ink-muted flex items-center gap-1.5"><Pin size={13} />Pinned post</span>
        </label>
      </Section>

      {/* Featured Image */}
      <Section title="Featured Image" icon={Image}>
        {v.featuredImage && (
          <div className="relative rounded-lg overflow-hidden mb-2 aspect-video bg-surface-2">
            <img src={v.featuredImage} alt="Featured" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => emit({ featuredImage: '' })}
              className="absolute top-1.5 right-1.5 bg-surface/80 backdrop-blur rounded-full p-1 text-ink-muted hover:text-danger"
            >
              <X size={13} />
            </button>
          </div>
        )}
        <label className="btn-secondary w-full justify-center cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          {uploading ? 'Uploading…' : 'Upload image'}
        </label>
        <Field label="Or paste URL">
          <input
            type="url"
            className="input"
            placeholder="https://example.com/image.jpg"
            value={v.featuredImage || ''}
            onChange={(e) => emit({ featuredImage: e.target.value })}
          />
        </Field>
      </Section>

      {/* Category & Tags */}
      <Section title="Category & Tags" icon={FolderOpen}>
        <Field label="Category">
          <select
            className="input"
            value={v.categoryId || ''}
            onChange={(e) => emit({ categoryId: e.target.value })}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Tags">
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Add tag…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <button type="button" onClick={addTag} className="btn-secondary !px-3">Add</button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <span key={t} className="badge-primary flex items-center gap-1">
                  <Tag size={10} />{t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-danger"><X size={10} /></button>
                </span>
              ))}
            </div>
          )}
        </Field>
      </Section>

      {/* Excerpt */}
      <Section title="Excerpt" icon={BookOpen} defaultOpen={false}>
        <Field label="Excerpt">
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="Write a short summary of this post…"
            value={v.excerpt || ''}
            onChange={(e) => emit({ excerpt: e.target.value })}
          />
        </Field>
      </Section>

      {/* SEO */}
      <Section title="SEO" icon={Globe} defaultOpen={false}>
        <Field label="Meta Title">
          <input
            className="input"
            placeholder="SEO title (60 chars)"
            maxLength={60}
            value={v.metaTitle || ''}
            onChange={(e) => emit({ metaTitle: e.target.value })}
          />
          <p className="text-[11px] text-ink-subtle mt-1">{(v.metaTitle || '').length}/60</p>
        </Field>
        <Field label="Meta Description">
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="SEO description (160 chars)"
            maxLength={160}
            value={v.metaDescription || ''}
            onChange={(e) => emit({ metaDescription: e.target.value })}
          />
          <p className="text-[11px] text-ink-subtle mt-1">{(v.metaDescription || '').length}/160</p>
        </Field>
        <Field label="Focus Keyword">
          <input
            className="input"
            placeholder="Primary keyword"
            value={v.focusKeyword || ''}
            onChange={(e) => emit({ focusKeyword: e.target.value })}
          />
        </Field>
      </Section>
    </div>
  );
}
